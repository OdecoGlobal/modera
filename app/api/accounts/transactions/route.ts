import { prisma } from '@/lib/prisma';
import { requireMerchant } from '@/middlewares/auth.middleware';
import { formatApiError } from '@/utils/format-api-error';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { merchant } = await requireMerchant();
    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    const status = searchParams.get('status') ?? undefined;

    const [
      transactions,
      total,
      misdirectedCount,
      flaggedCount,
      thisMonthTotal,
    ] = await prisma.$transaction([
      prisma.transaction.findMany({
        where: {
          merchantId: merchant.id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(status ? { status: status as any } : {}),
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          customer: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
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
    ]);

    return NextResponse.json(
      {
        status: 'success',
        data: transactions,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          misdirectedCount,
          flaggedCount,
          totalThisMonth: thisMonthTotal._sum.amount ?? 0,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return formatApiError(error);
  }
}
