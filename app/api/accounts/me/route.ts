import { prisma } from '@/lib/prisma';
import { requireMerchant } from '@/middlewares/auth.middleware';
import AppError from '@/utils/app-error';
import { formatApiError } from '@/utils/format-api-error';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { merchant } = await requireMerchant();
    const [virtualAccount, balanceData] = await prisma.$transaction([
      prisma.virtualAccount.findUnique({
        where: { merchantId: merchant.id, type: 'merchant' },
      }),
      prisma.transaction.aggregate({
        where: { merchantId: merchant.id, status: 'success' },
        _sum: { amount: true },
      }),
    ]);
    if (!virtualAccount) {
      throw new AppError('No account found', 404);
    }
    return NextResponse.json(
      {
        status: 'success',
        data: {
          merchant,
          virtualAccount,
          balance: balanceData._sum.amount ?? 0,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return formatApiError(error);
  }
}
