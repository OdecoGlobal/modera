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

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        virtualAccount: true,
      },
    });

    if (!customer) throw new AppError('Customer not found', 404);
    if (customer.merchantId !== merchant.id)
      throw new AppError('Forbidden', 403);

    const balanceData = await prisma.transaction.aggregate({
      where: { customerId: customer.id, status: 'success' },
      _sum: { amount: true },
    });

    return NextResponse.json({
      status: 'success',
      data: {
        ...customer,
        balance: balanceData._sum.amount ?? 0,
      },
    });
  } catch (error) {
    return formatApiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const merchant = await validateApiKey(req);
    const { id } = await params;
    const { name, email, phone } = await req.json();

    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new AppError('Customer not found', 404);
    if (customer.merchantId !== merchant.id)
      throw new AppError('Forbidden', 403);

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(email ? { email: email.toLowerCase().trim() } : {}),
        ...(phone ? { phone } : {}),
      },
    });

    if (name) {
      await prisma.virtualAccount.updateMany({
        where: { customerId: id },
        data: { bankAccountName: name.trim() },
      });
    }

    return NextResponse.json({ status: 'success', data: updated });
  } catch (error) {
    return formatApiError(error);
  }
}
