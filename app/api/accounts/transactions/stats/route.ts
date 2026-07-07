import { prisma } from '@/lib/prisma';
import { requireMerchant } from '@/middlewares/auth.middleware';
import { formatApiError } from '@/utils/format-api-error';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { merchant } = await requireMerchant();

    const [total, misdirectedCount, flagged, thisMonthTotal, totalCustomers] =
      await prisma.$transaction([
        prisma.transaction.count({
          where: { merchantId: merchant.id },
        }),
        prisma.transaction.count({
          where: { merchantId: merchant.id, status: 'misdirected' },
        }),
        prisma.transaction.count({
          where: { merchantId: merchant.id, status: 'flagged' },
        }),
        prisma.transaction.aggregate({
          where: {
            merchantId: merchant.id,
            status: 'success',
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
          _sum: { amount: true },
        }),
        prisma.customer.count({
          where: { merchantId: merchant.id },
        }),
      ]);

    return NextResponse.json(
      {
        status: 'success',
        data: {
          total,
          flagged,
          misdirectedCount,
          totalThisMonth: thisMonthTotal._sum.amount ?? 0,
          totalCustomers,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return formatApiError(error);
  }
}
