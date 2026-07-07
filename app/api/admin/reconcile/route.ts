import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/middlewares/auth.middleware';
import { fetchNombaTransactions } from '@/lib/nomba';
import { formatApiError } from '@/utils/format-api-error';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const { startDate, endDate } = await req.json();

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 },
      );
    }

    let cursor: string | undefined;
    let totalFetched = 0;
    let totalReconciled = 0;
    const missedWithNoVA: string[] = [];

    do {
      const { results, cursor: nextCursor } = await fetchNombaTransactions(
        startDate,
        endDate,
        cursor,
      );

      cursor = nextCursor ?? undefined;
      totalFetched += results.length;

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

        if (!va) {
          missedWithNoVA.push(reference);
          continue;
        }

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
            notes: 'Reconciled — missed webhook',
          },
        });

        totalReconciled++;
      }
    } while (cursor);

    return NextResponse.json({
      status: 'success',
      data: {
        totalFetched,
        totalReconciled,
        missedWithNoVA: missedWithNoVA.length,
        missedReferences: missedWithNoVA,
        message:
          totalReconciled > 0
            ? `${totalReconciled} missed transactions recovered`
            : 'All transactions already reconciled',
      },
    });
  } catch (error) {
    return formatApiError(error);
  }
}

export async function GET() {
  try {
    await requireAdmin();

    const transactions = await prisma.transaction.findMany({
      where: { notes: 'Reconciled — missed webhook' },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        customer: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({
      status: 'success',
      data: {
        total: transactions.length,
        transactions,
      },
    });
  } catch (error) {
    return formatApiError(error);
  }
}
