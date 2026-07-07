import { createAuditLog } from '@/lib/audit';
import { getNombaToken } from '@/lib/nomba';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/middlewares/auth.middleware';
import { reasonSchema } from '@/schema/account.schema';
import AppError from '@/utils/app-error';
import { formatApiError } from '@/utils/format-api-error';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ ref: string }> },
) {
  try {
    const session = await requireUser();
    const { ref } = await params;
    const body = await req.json();
    const { reason } = reasonSchema.parse(body);

    const merchant = await prisma.merchant.findUnique({
      where: { userId: session.user.id },
    });

    if (!merchant) throw new AppError('Merchant not found', 404);

    const va = await prisma.virtualAccount.findUnique({
      where: { accountRef: ref },
      select: {
        id: true,
        accountRef: true,
        status: true,
        merchantId: true,
        customerId: true,
      },
    });

    if (!va) throw new AppError('Account not found', 404);
    if (va.merchantId !== merchant.id) throw new AppError('Forbidden', 403);
    if (va.status === 'closed')
      throw new AppError('Account is already closed', 400);

    const updated = await prisma.virtualAccount.update({
      where: { accountRef: va.accountRef },
      data: { status: 'closed', closedAt: new Date() },
    });

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
      metadata: {
        reason: reason ?? 'No reason provided',
        customerId: va.customerId ?? null,
      },
    });

    return NextResponse.json({ status: 'success', data: updated });
  } catch (error) {
    return formatApiError(error);
  }
}
