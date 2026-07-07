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
    await requireAdmin();
    const { ref } = await params;
    const body = await req.json();
    const { reason } = reasonSchema.parse(body);
    const va = await prisma.virtualAccount.findUnique({
      where: { accountRef: ref },
      select: {
        id: true,
        accountRef: true,
        bankAccountName: true,
        bankAccountNumber: true,
        status: true,
        merchantId: true,
      },
    });

    if (!va) {
      throw new AppError('Account not found', 404);
    }

    // if (va.userId !== session.user.id) {
    //   throw new AppError('Forbidden', 403);
    // }

    if (va.status === 'closed') {
      throw new AppError('Cannot suspend a closed account', 400);
    }
    if (va.status === 'suspended') {
      throw new AppError('Account is already suspended', 400);
    }

    const updated = await prisma.virtualAccount.update({
      where: { accountRef: va.accountRef },
      data: { status: 'suspended' },
    });

    await createAuditLog({
      merchantId: va.merchantId,
      action: 'ACCOUNT_SUSPENDED',
      entity: 'VirtualAccount',
      entityId: va.id,
      metadata: { reason: reason ?? 'No reason provided' },
    });

    return NextResponse.json(
      { status: 'success', data: updated },
      { status: 200 },
    );
  } catch (error) {
    return formatApiError(error);
  }
}
