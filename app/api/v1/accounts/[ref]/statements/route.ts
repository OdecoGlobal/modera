import { prisma } from '@/lib/prisma';
import { validateApiKey } from '@/middlewares/api-key';
import AppError from '@/utils/app-error';
import { formatApiError } from '@/utils/format-api-error';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ref: string }> },
) {
  try {
    const authUser = await validateApiKey(req);
    const { searchParams } = req.nextUrl;
    const { ref } = await params;

    const from = searchParams.get('from')
      ? new Date(searchParams.get('from')!)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const to = searchParams.get('to')
      ? new Date(searchParams.get('to')!)
      : new Date();

    to.setHours(23, 59, 59, 999);

    if (from > to) {
      throw new AppError('from date cannot be after to date', 400);
    }
    const va = await prisma.virtualAccount.findUnique({
      where: { accountRef: ref },
    });
    if (!va) {
      throw new AppError('Account not found', 404);
    }
    if (va.merchantId !== authUser.id) {
      throw new AppError('Forbidden', 403);
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        merchantId: authUser.id,
        createdAt: { gte: from, lte: to },
      },
      orderBy: { createdAt: 'asc' },
    });

    const openingBalanceData = await prisma.transaction.aggregate({
      where: {
        merchantId: authUser.id,
        status: 'success',
        createdAt: { lt: from },
      },
      _sum: { amount: true },
    });

    const openingBalance = openingBalanceData._sum.amount ?? 0;

    let runningBalance = openingBalance;
    const transactionsWithBalance = transactions.map(tx => {
      if (tx.status === 'success') {
        runningBalance += tx.amount;
      }
      return { ...tx, runningBalance };
    });

    const successfulInRange = transactions.filter(
      tx => tx.status === 'success',
    );
    const totalCreditedInRange = successfulInRange.reduce(
      (sum, tx) => sum + tx.amount,
      0,
    );
    const closingBalance = openingBalance + totalCreditedInRange;

    const misdirectedCount = transactions.filter(
      tx => tx.status === 'misdirected',
    ).length;

    const flaggedCount = transactions.filter(
      tx => tx.status === 'flagged',
    ).length;

    return NextResponse.json({
      status: 'success',
      data: {
        account: {
          bankAccountNumber: va.bankAccountNumber,
          bankAccountName: va.bankAccountName,
          bankName: va.bankName,
        },
        period: {
          from: from.toISOString(),
          to: to.toISOString(),
        },
        summary: {
          openingBalance,
          closingBalance,
          totalCredited: totalCreditedInRange,
          totalTransactions: transactions.length,
          successfulTransactions: successfulInRange.length,
          misdirectedTransactions: misdirectedCount,
          flaggedTransactions: flaggedCount,
        },
        transactions: transactionsWithBalance,
      },
    });
  } catch (error) {
    return formatApiError(error);
  }
}
