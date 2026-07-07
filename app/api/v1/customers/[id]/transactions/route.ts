import { prisma } from '@/lib/prisma';
import { formatApiError } from '@/utils/format-api-error';
import AppError from '@/utils/app-error';
import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/middlewares/api-key';
import { TransactionStatusType } from '@/types/account';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const merchant = await validateApiKey(req);
    const { id } = await params;
    const { searchParams } = req.nextUrl;

    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new AppError('Customer not found', 404);
    if (customer.merchantId !== merchant.id)
      throw new AppError('Forbidden', 403);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;
    const status = searchParams.get('status') ?? undefined;

    const [transactions, total] = await prisma.$transaction([
      prisma.transaction.findMany({
        where: {
          customerId: id,
          ...(status ? { status: status as TransactionStatusType } : {}),
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({
        where: { customerId: id },
      }),
    ]);

    return NextResponse.json({
      status: 'success',
      data: transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return formatApiError(error);
  }
}
