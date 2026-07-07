import { createAuditLog } from '@/lib/audit';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getNombaToken } from '@/lib/nomba';
import { formatApiError } from '@/utils/format-api-error';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { merchantId, customerId, accountName, type } = body;

    if (!merchantId || !accountName || !type) {
      return NextResponse.json(
        { error: 'merchantId, accountName and type are required' },
        { status: 400 },
      );
    }

    if (type === 'merchant') {
      const existing = await prisma.virtualAccount.findFirst({
        where: { merchantId, type: 'merchant' },
      });
      if (existing) {
        return NextResponse.json({ data: existing }, { status: 200 });
      }
    }

    if (type === 'customer' && customerId) {
      const existing = await prisma.virtualAccount.findUnique({
        where: { customerId },
      });
      if (existing) {
        return NextResponse.json({ data: existing }, { status: 200 });
      }
    }

    const accountRef = crypto.randomUUID();

    let parentAccountRef: string | undefined;
    if (type === 'customer') {
      const merchantVA = await prisma.virtualAccount.findFirst({
        where: { merchantId, type: 'merchant' },
      });

      if (!merchantVA) {
        return NextResponse.json(
          {
            error:
              'Merchant virtual account not found. Provision merchant VA first.',
          },
          { status: 404 },
        );
      }

      parentAccountRef = merchantVA.accountRef;
    }
    const token = await getNombaToken();

    const nombaRes = await fetch(
      `${process.env.NOMBA_BASE_URL}/v1/accounts/virtual`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          accountId: process.env.NOMBA_ACCOUNT_ID!,
          'X-Idempotent-key': accountRef,
        },
        body: JSON.stringify({
          accountName,
          accountRef,
          currency: 'NGN',
          ...(parentAccountRef ? { parentAccountRef } : {}),
        }),
      },
    );

    const nombaData = await nombaRes.json();
    console.log('Nomba provision response:', nombaData);

    if (nombaData.code !== '00') {
      return NextResponse.json(
        { error: `Nomba error: ${nombaData.description}` },
        { status: 500 },
      );
    }

    const virtualAccount = await prisma.virtualAccount.create({
      data: {
        merchantId,
        customerId: customerId ?? null,
        type: type === 'merchant' ? 'merchant' : 'customer',
        accountRef,
        bankAccountNumber: nombaData.data.bankAccountNumber,
        bankAccountName: nombaData.data.bankAccountName,
        bankName: nombaData.data.bankName,
        accountHolderId: nombaData.data.accountHolderId ?? null,
        bvn: nombaData.data.bvn ?? null,
      },
    });

    await createAuditLog({
      merchantId,
      action: 'ACCOUNT_PROVISIONED',
      entity: 'VirtualAccount',
      entityId: virtualAccount.id,
      metadata: {
        accountNumber: virtualAccount.bankAccountNumber,
        type,
        customerId: customerId ?? null,
      },
    });

    return NextResponse.json({ data: virtualAccount }, { status: 201 });
  } catch (error) {
    console.error('Provision error:', error);
    return formatApiError(error);
  }
}
