import { prisma } from '@/lib/prisma';

import { createAuditLog } from '@/lib/audit';
import { getNombaToken } from '@/lib/nomba';
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

    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new AppError('Customer not found', 404);
    if (customer.merchantId !== merchant.id)
      throw new AppError('Forbidden', 403);

    const va = await prisma.virtualAccount.findUnique({
      where: { customerId: id },
    });

    if (!va) throw new AppError('Virtual account not found', 404);
    if (va.status === 'closed')
      throw new AppError('Account is already closed', 400);

    const updated = await prisma.virtualAccount.update({
      where: { id: va.id },
      data: { status: 'closed', closedAt: new Date() },
    });

    // Expire on Nomba
    const token = await getNombaToken();
    await fetch(
      `${process.env.NOMBA_BASE_URL}/v1/accounts/virtual/${va.accountRef}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          accountId: process.env.NOMBA_ACCOUNT_ID!,
        },
      },
    );

    await createAuditLog({
      merchantId: merchant.id,
      action: 'ACCOUNT_CLOSED',
      entity: 'VirtualAccount',
      entityId: va.id,
      metadata: { reason: reason ?? 'No reason provided', customerId: id },
    });

    return NextResponse.json({ status: 'success', data: updated });
  } catch (error) {
    return formatApiError(error);
  }
}
