import { prisma } from '@/lib/prisma';
import { requireUser } from '@/middlewares/auth.middleware';
import AppError from '@/utils/app-error';
import { formatApiError } from '@/utils/format-api-error';
import { NextResponse } from 'next/server';

export async function DELETE() {
  try {
    const { user } = await requireUser();
    const merchant = await prisma.merchant.findUnique({
      where: { userId: user.id },
    });
    if (!merchant) {
      throw new AppError('Merchant not found.', 404);
    }

    await prisma.apiKey.deleteMany({
      where: { merchantId: merchant.id },
    });

    return NextResponse.json(
      {
        data: { message: 'API key revoked successfully' },
      },
      { status: 200 },
    );
  } catch (error) {
    return formatApiError(error);
  }
}
