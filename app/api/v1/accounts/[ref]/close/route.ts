import { createAuditLog } from '@/lib/audit';
import { getNombaToken } from '@/lib/nomba';
import { prisma } from '@/lib/prisma';
import { validateApiKey } from '@/middlewares/api-key';
import { reasonSchema } from '@/schema/account.schema';
import AppError from '@/utils/app-error';
import { formatApiError } from '@/utils/format-api-error';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ ref: string }> },
) {
  try {
    const authUser = await validateApiKey(req);
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

    if (va.merchantId !== authUser.id) {
      throw new AppError('Forbidden', 403);
    }

    if (va.status === 'closed') {
      throw new AppError('Account is already closed', 400);
    }

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
      merchantId: authUser.id,
      action: 'ACCOUNT_CLOSED',
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
