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
    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '10');
    const skip = (page - 1) * limit;
    const va = await prisma.virtualAccount.findUnique({
      where: { accountRef: ref },
    });
    if (!va) {
      throw new AppError('Account not found', 404);
    }
    if (va.merchantId !== user.id) {
      throw new AppError('Forbidden', 403);
    }
    const [transactions, total] = await prisma.$transaction([
      prisma.transaction.findMany({
        where: { virtualAccountId: va.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where: { virtualAccountId: va.id } }),
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
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return formatApiError(error);
  }
}
