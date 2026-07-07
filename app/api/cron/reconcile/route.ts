import { prisma } from '@/lib/prisma';
import { fetchNombaTransactions } from '@/lib/nomba';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
  const startDate = sixHoursAgo.toISOString().split('.')[0];
  const endDate = now.toISOString().split('.')[0];

  let cursor: string | undefined;
  let totalReconciled = 0;

  try {
    do {
      const { results, cursor: nextCursor } = await fetchNombaTransactions(
        startDate,
        endDate,
        cursor,
      );

      cursor = nextCursor ?? undefined;

      for (const tx of results) {
        if (tx.type !== 'vact_transfer' || tx.status !== 'SUCCESS') continue;

        const reference = tx.id ?? tx.transactionId;

        const existing = await prisma.transaction.findUnique({
          where: { reference },
        });
        if (existing) continue;

        const va = await prisma.virtualAccount.findFirst({
          where: { bankAccountNumber: tx.aliasAccountNumber },
        });
        if (!va) continue;

        await prisma.transaction.create({
          data: {
            merchantId: va.merchantId,
            customerId: va.customerId ?? null,
            virtualAccountId: va.id,
            amount: tx.transactionAmount ?? tx.amount,
            currency: 'NGN',
            reference,
            payerName: tx.senderName ?? null,
            payerBank: tx.bankName ?? null,
            narration: tx.narration ?? null,
            status: 'success',
            notes: 'Reconciled — missed webhook (cron)',
          },
        });

        totalReconciled++;
      }
    } while (cursor);

    return NextResponse.json({
      status: 'success',
      data: {
        totalReconciled,
        message:
          totalReconciled > 0
            ? `${totalReconciled} missed transactions recovered`
            : 'All transactions already reconciled',
      },
    });
  } catch (err) {
    console.error('[cron] Reconciliation failed:', err);
    return NextResponse.json(
      { error: 'Reconciliation failed' },
      { status: 500 },
    );
  }
}
