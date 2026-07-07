import { prisma } from '@/lib/prisma';
import { requireUser } from '@/middlewares/auth.middleware';
import AppError from '@/utils/app-error';
import { formatApiError } from '@/utils/format-api-error';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAuditLog } from '@/lib/audit';

export async function POST() {
  try {
    const { user } = await requireUser();
    const merchant = await prisma.merchant.findUnique({
      where: { userId: user.id },
    });
    if (!merchant) {
      throw new AppError(
        'Complete onboarding before generating an API key',
        404,
      );
    }

    const existing = await prisma.apiKey.findUnique({
      where: { merchantId: merchant.id },
      select: { id: true },
    });
    if (existing) {
      throw new AppError(
        'API key already exists. Revoke it first before generating a new one.',
        400,
      );
    }
    const raw = crypto.randomBytes(32).toString('hex');
    const key = `nva_${raw}`;
    const keyHash = crypto.createHash('sha256').update(key).digest('hex');
    const prefix = key.slice(0, 10);

    await prisma.apiKey.create({
      data: {
        merchantId: merchant.id,
        keyHash,
        prefix,
      },
    });
    await createAuditLog({
      merchantId: merchant.id,
      action: 'API_KEY_GENERATED',
      entity: 'ApiKey',
      entityId: merchant.id,
      metadata: { prefix },
    });

    return NextResponse.json(
      {
        data: {
          key,
          message: 'Copy this key now. It will not be shown again.',
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return formatApiError(error);
  }
}
