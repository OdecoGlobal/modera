import { createAuditLog } from '@/lib/audit';
import { getNombaToken } from '@/lib/nomba';
import { prisma } from '@/lib/prisma';
import { validateApiKey } from '@/middlewares/api-key';
import { accountNameSchema } from '@/schema/account.schema';
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
    const { accountName } = accountNameSchema.parse(body);

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
      throw new AppError('Cannot rename a closed account', 400);
    }

    const oldName = va.bankAccountName;
    const updated = await prisma.virtualAccount.update({
      where: { accountRef: va.accountRef },
      data: { bankAccountName: accountName.trim() },
    });

    const token = await getNombaToken();

    await fetch(
      `${process.env.NOMBA_BASE_URL}/v1/accounts/virtual/${va.accountRef}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          accountId: process.env.NOMBA_ACCOUNT_ID!,
        },
        body: JSON.stringify({ accountName: accountName.trim() }),
      },
    );
    await createAuditLog({
      merchantId: authUser.id,
      action: 'ACCOUNT_RENAMED',
      entity: 'VirtualAccount',
      entityId: va.id,
      metadata: { oldName, newName: updated.bankAccountName },
    });
    return NextResponse.json(
      { status: 'success', data: updated },
      { status: 200 },
    );
  } catch (error) {
    return formatApiError(error);
  }
}
