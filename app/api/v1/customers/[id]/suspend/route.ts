import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';
import { formatApiError } from '@/utils/format-api-error';
import AppError from '@/utils/app-error';
import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/middlewares/api-key';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const merchant = await validateApiKey(req);
    const { id } = await params;
    const { reason } = await req.json();

    if (!reason) throw new AppError('reason is required', 400);

    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new AppError('Customer not found', 404);
    if (customer.merchantId !== merchant.id)
      throw new AppError('Forbidden', 403);

    const va = await prisma.virtualAccount.findUnique({
      where: { customerId: id },
    });

    if (!va) throw new AppError('Virtual account not found', 404);
    if (va.status === 'closed')
      throw new AppError('Cannot suspend a closed account', 400);
    if (va.status === 'suspended')
      throw new AppError('Account is already suspended', 400);

    const updated = await prisma.virtualAccount.update({
      where: { id: va.id },
      data: { status: 'suspended' },
    });

    await createAuditLog({
      merchantId: merchant.id,
      action: 'ACCOUNT_SUSPENDED',
      entity: 'VirtualAccount',
      entityId: va.id,
      metadata: { reason, customerId: id },
    });

    return NextResponse.json({ status: 'success', data: updated });
  } catch (error) {
    return formatApiError(error);
  }
}
