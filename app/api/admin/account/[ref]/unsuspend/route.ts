import { createAuditLog } from '@/lib/audit';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/middlewares/auth.middleware';
import { reasonSchema } from '@/schema/account.schema';
import AppError from '@/utils/app-error';
import { formatApiError } from '@/utils/format-api-error';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ ref: string }> },
) {
  try {
    const { user } = await requireAdmin();
    const { ref } = await params;
    const body = await req.json();
    const { reason } = reasonSchema.parse(body);

    const adminMerchant = await prisma.merchant.findUnique({
      where: { userId: user.id },
    });

    if (!adminMerchant) throw new AppError('Admin merchant not found', 404);

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
    if (va.status === 'closed')
      throw new AppError('Cannot unsuspend a closed account', 400);
    if (va.status === 'active')
      throw new AppError('Account is already active', 400);

    const updated = await prisma.virtualAccount.update({
      where: { accountRef: va.accountRef },
      data: { status: 'active' },
    });

    await createAuditLog({
      merchantId: adminMerchant.id,
      action: 'ACCOUNT_REACTIVATED',
      entity: 'VirtualAccount',
      entityId: va.id,
      metadata: {
        reason: reason ?? 'No reason provided',
        reactivatedBy: user.id,
        targetMerchantId: va.merchantId,
        customerId: va.customerId ?? null,
      },
    });

    return NextResponse.json({ status: 'success', data: updated });
  } catch (error) {
    return formatApiError(error);
  }
}
