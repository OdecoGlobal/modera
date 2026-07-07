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
    const user = await validateApiKey(req);
    const { ref } = await params;
    const va = await prisma.virtualAccount.findUnique({
      where: { accountRef: ref },
    });
    if (!va) {
      throw new AppError('Account not found', 404);
    }
    if (va.merchantId !== user.id) {
      throw new AppError('Forbidden', 403);
    }
    const balance = await prisma.transaction.aggregate({
      where: { merchantId: user.id, status: 'success' },
      _sum: { amount: true },
    });
    return NextResponse.json(
      {
        status: 'success',
        data: { ...va, balance: balance._sum.amount ?? 0 },
      },
      { status: 200 },
    );
  } catch (error) {
    return formatApiError(error);
  }
}
