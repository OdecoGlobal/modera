import { prisma } from '@/lib/prisma';
import { requireMerchant } from '@/middlewares/auth.middleware';
import AppError from '@/utils/app-error';
import { formatApiError } from '@/utils/format-api-error';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { merchant } = await requireMerchant();
    const { searchParams } = req.nextUrl;

    const from = searchParams.get('from')
      ? new Date(searchParams.get('from')!)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const to = searchParams.get('to')
      ? new Date(searchParams.get('to')!)
      : new Date();

    to.setHours(23, 59, 59, 999);

    if (from > to) throw new AppError('from date cannot be after to date', 400);

    const merchantVA = await prisma.virtualAccount.findFirst({
      where: {
        merchantId: merchant.id,
        type: 'merchant',
      },
    });

    if (!merchantVA) throw new AppError('No virtual account found', 404);

    const transactions = await prisma.transaction.findMany({
      where: {
        merchantId: merchant.id,
        createdAt: { gte: from, lte: to },
      },
      orderBy: { createdAt: 'asc' },
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    const openingBalanceData = await prisma.transaction.aggregate({
      where: {
        merchantId: merchant.id,
        status: 'success',
        createdAt: { lt: from },
      },
      _sum: { amount: true },
    });

    const openingBalance = openingBalanceData._sum.amount ?? 0;

    let runningBalance = openingBalance;
    const transactionsWithBalance = transactions.map(tx => {
      if (tx.status === 'success') runningBalance += tx.amount;
      return { ...tx, runningBalance };
    });

    const successfulInRange = transactions.filter(
      tx => tx.status === 'success',
    );
    const totalCreditedInRange = successfulInRange.reduce(
      (sum, tx) => sum + tx.amount,
      0,
    );

    return NextResponse.json({
      status: 'success',
      data: {
        account: {
          bankAccountNumber: merchantVA.bankAccountNumber,
          bankAccountName: merchantVA.bankAccountName,
          bankName: merchantVA.bankName,
        },
        merchant: {
          id: merchant.id,
          businessName: merchant.businessName,
        },
        period: { from: from.toISOString(), to: to.toISOString() },
        summary: {
          openingBalance,
          closingBalance: openingBalance + totalCreditedInRange,
          totalCredited: totalCreditedInRange,
          totalTransactions: transactions.length,
          successfulTransactions: successfulInRange.length,
          misdirectedTransactions: transactions.filter(
            tx => tx.status === 'misdirected',
          ).length,
          flaggedTransactions: transactions.filter(
            tx => tx.status === 'flagged',
          ).length,
        },
        transactions: transactionsWithBalance,
      },
    });
  } catch (error) {
    return formatApiError(error);
  }
}
