import { getNombaToken } from '@/lib/nomba';
import { prisma } from '@/lib/prisma';
import { validateApiKey } from '@/middlewares/api-key';
import AppError from '@/utils/app-error';
import { formatApiError } from '@/utils/format-api-error';
import { NextRequest, NextResponse } from 'next/server';

import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const merchant = await validateApiKey(req);
    const existing = await prisma.virtualAccount.findUnique({
      where: { merchantId: merchant.id },
    });
    if (existing) {
      throw new AppError('Virtual account already exist for this user', 400);
    }
    const accountRef = crypto.randomUUID();

    const token = await getNombaToken();

    const nombaRes = await fetch(
      `${process.env.NOMBA_BASE_URL}/v1/accounts/virtual`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          accountId: process.env.NOMBA_ACCOUNT_ID!,
          'X-Idempotent-key': accountRef,
        },
        body: JSON.stringify({
          accountRef,
          accountName: merchant.businessName,
          currency: 'NGN',
        }),
      },
    );
    const nombaData = await nombaRes.json();
    if (nombaData.code !== '00') {
      throw new AppError(`Nomba error: ${nombaData.description}`, 500);
    }

    const virtualAccount = await prisma.virtualAccount.create({
      data: {
        merchantId: merchant.id,
        accountRef,
        bankAccountNumber: nombaData.data.bankAccountNumber,
        bankAccountName: nombaData.data.bankAccountName,
        bankName: nombaData.data.bankName,
        accountHolderId: nombaData.data.accountHolderId,
        bvn: nombaData.data.bvn,
      },
    });
    return NextResponse.json(
      { status: 'success', data: virtualAccount },
      { status: 201 },
    );
  } catch (error) {
    return formatApiError(error);
  }
}
