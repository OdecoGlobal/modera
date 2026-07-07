import { prisma } from '@/lib/prisma';
import { formatApiError } from '@/utils/format-api-error';
import AppError from '@/utils/app-error';
import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/middlewares/api-key';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const merchant = await validateApiKey(req);
    const { id } = await params;
    const { searchParams } = req.nextUrl;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: { virtualAccount: true },
    });

    if (!customer) throw new AppError('Customer not found', 404);
    if (customer.merchantId !== merchant.id)
      throw new AppError('Forbidden', 403);

    const from = searchParams.get('from')
      ? new Date(searchParams.get('from')!)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const to = searchParams.get('to')
      ? new Date(searchParams.get('to')!)
      : new Date();
    to.setHours(23, 59, 59, 999);

    if (from > to) throw new AppError('from date cannot be after to date', 400);

    const openingBalanceData = await prisma.transaction.aggregate({
      where: {
        customerId: id,
        status: 'success',
        createdAt: { lt: from },
      },
      _sum: { amount: true },
    });

    const openingBalance = openingBalanceData._sum.amount ?? 0;

    const transactions = await prisma.transaction.findMany({
      where: { customerId: id, createdAt: { gte: from, lte: to } },
      orderBy: { createdAt: 'asc' },
    });

    let runningBalance = openingBalance;
    const transactionsWithBalance = transactions.map(tx => {
      if (tx.status === 'success') runningBalance += tx.amount;
      return { ...tx, runningBalance };
    });

    const successful = transactions.filter(tx => tx.status === 'success');
    const totalCredited = successful.reduce((sum, tx) => sum + tx.amount, 0);

    return NextResponse.json({
      status: 'success',
      data: {
        account: {
          bankAccountNumber: customer.virtualAccount?.bankAccountNumber,
          bankAccountName: customer.virtualAccount?.bankAccountName,
          bankName: customer.virtualAccount?.bankName,
        },
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          kycTier: customer.kycTier,
        },
        period: { from: from.toISOString(), to: to.toISOString() },
        summary: {
          openingBalance,
          closingBalance: openingBalance + totalCredited,
          totalCredited,
          totalTransactions: transactions.length,
          successfulTransactions: successful.length,
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
