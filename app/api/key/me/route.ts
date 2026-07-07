import { prisma } from '@/lib/prisma';
import { requireUser } from '@/middlewares/auth.middleware';
import AppError from '@/utils/app-error';
import { formatApiError } from '@/utils/format-api-error';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { user } = await requireUser();
    const merchant = await prisma.merchant.findUnique({
      where: { userId: user.id },
    });
    if (!merchant) {
      throw new AppError('Merchant not found.', 404);
    }
    const apiKey = await prisma.apiKey.findUnique({
      where: { merchantId: merchant.id },
      select: {
        prefix: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        data: apiKey,
      },
      { status: 200 },
    );
  } catch (error) {
    return formatApiError(error);
  }
}
