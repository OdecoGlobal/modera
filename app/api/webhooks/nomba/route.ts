/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAuditLog } from '@/lib/audit';
import { enforceKycLimits } from '@/utils/kyc';

function generateSignature(
  payload: any,
  secret: string,
  timestamp: string,
): string {
  const data = payload.data || {};
  const merchant = data.merchant || {};
  const transaction = data.transaction || {};

  const eventType = payload.event_type || '';
  const requestId = payload.requestId || '';
  const userId = merchant.userId || '';
  const walletId = merchant.walletId || '';
  const transactionId = transaction.transactionId || '';
  const transactionType = transaction.type || '';
  const transactionTime = transaction.time || '';
  let responseCode = transaction.responseCode || '';
  if (responseCode === 'null') responseCode = '';

  const hashingPayload = `${eventType}:${requestId}:${userId}:${walletId}:${transactionId}:${transactionType}:${transactionTime}:${responseCode}:${timestamp}`;

  return crypto
    .createHmac('sha256', secret)
    .update(hashingPayload)
    .digest('base64');
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-nomba-signature');
  let parsedPayload: any;

  // Step 1: Parse JSON
  try {
    parsedPayload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const requestId = parsedPayload?.requestId;

  // Step 2: Reject duplicates early
  if (requestId) {
    const alreadyProcessed = await prisma.webhookLog.findUnique({
      where: { requestId },
    });
    if (alreadyProcessed) {
      return NextResponse.json({ received: true }, { status: 200 });
    }
  }

  // Step 3: Log raw webhook immediately
  await prisma.webhookLog.create({
    data: {
      requestId: requestId ?? null,
      eventType: parsedPayload?.event_type ?? 'unknown',
      payload: parsedPayload,
      signature: signature ?? '',
      processed: false,
    },
  });

  // Step 4: Verify signature
  if (process.env.NOMBA_WEBHOOK_SECRET && signature) {
    const timestamp = parsedPayload?.data?.transaction?.time ?? '';
    const computed = generateSignature(
      parsedPayload,
      process.env.NOMBA_WEBHOOK_SECRET,
      timestamp,
    );
    if (computed !== signature) {
      console.error('Signature mismatch', { computed, received: signature });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  }

  // Step 5: Check event type
  const { event_type, data } = parsedPayload;
  const HANDLED_EVENTS = [
    'payment_success',
    'virtual_account.funded',
    'transaction.success',
  ];

  if (!HANDLED_EVENTS.includes(event_type)) {
    await prisma.webhookLog.updateMany({
      where: { requestId },
      data: { processed: true, processedAs: 'ignored' },
    });
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const transaction = data?.transaction || {};
  const customer = data?.customer || {};
  const virtualAccount = data?.virtualAccount || {};
  const accountRef = virtualAccount?.aliasAccountReference;
  const transactionId = transaction?.transactionId;

  if (!accountRef || !transactionId) {
    await prisma.webhookLog.updateMany({
      where: { requestId },
      data: { processed: true, processedAs: 'ignored' },
    });
    return NextResponse.json({ received: true }, { status: 200 });
  }

  // Step 7: Find virtual account — could be merchant VA or customer VA
  const va = await prisma.virtualAccount.findUnique({
    where: { accountRef },
  });

  // Step 8: Handle misdirected
  if (!va || va.status === 'closed' || va.status === 'suspended') {
    try {
      await prisma.transaction.create({
        data: {
          merchantId: va?.merchantId ?? null,
          customerId: va?.customerId ?? null,
          virtualAccountId: va?.id ?? null,
          amount: transaction.transactionAmount,
          currency: 'NGN',
          reference: transactionId,
          payerName: customer.senderName ?? null,
          payerBank: customer.bankName ?? null,
          narration: transaction.narration ?? null,
          status: 'misdirected',
          notes: !va
            ? 'No virtual account found for this accountRef'
            : `Payment received on ${va.status} account`,
        },
      });
    } catch (err: any) {
      if (err.code !== 'P2002') {
        console.error('Failed to record misdirected transaction:', err);
      }
    }

    if (va) {
      try {
        await createAuditLog({
          merchantId: va.merchantId,
          action: 'MISDIRECTED_PAYMENT',
          entity: 'VirtualAccount',
          entityId: va.id,
          metadata: {
            accountRef,
            transactionId,
            amount: transaction.transactionAmount,
            reason: `Account is ${va.status}`,
            payerName: customer.senderName,
            payerBank: customer.bankName,
            vaType: va.type,
          },
        });
      } catch (err) {
        console.error(
          'Failed to create audit log for misdirected payment:',
          err,
        );
      }
    }

    await prisma.webhookLog.updateMany({
      where: { requestId },
      data: { processed: true, processedAs: 'misdirected' },
    });

    return NextResponse.json({ received: true }, { status: 200 });
  }

  if (va.type === 'customer' && va.customerId) {
    const kycResult = await enforceKycLimits({
      customerId: va.customerId,
      merchantId: va.merchantId,
      virtualAccountId: va.id,
      incomingAmount: transaction.transactionAmount,
      transactionId,
      payerName: customer.senderName ?? null,
      payerBank: customer.bankName ?? null,
      requestId: parsedPayload.requestId,
    });

    if (kycResult.flagged) {
      return NextResponse.json({ received: true }, { status: 200 });
    }
  }

  // Step 10: Record successful transaction
  try {
    await prisma.transaction.create({
      data: {
        merchantId: va.merchantId,
        customerId: va.customerId ?? null,
        virtualAccountId: va.id,
        amount: transaction.transactionAmount,
        currency: 'NGN',
        reference: transactionId,
        payerName: customer.senderName ?? null,
        payerBank: customer.bankName ?? null,
        narration: transaction.narration ?? null,
        status: 'success',
        notes:
          va.type === 'merchant' ? 'Direct merchant account payment' : null,
      },
    });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return NextResponse.json({ received: true }, { status: 200 });
    }
    throw err;
  }

  // Step 11: Mark processed
  await prisma.webhookLog.updateMany({
    where: { requestId },
    data: { processed: true, processedAs: 'success' },
  });

  return NextResponse.json({ received: true }, { status: 200 });
}
