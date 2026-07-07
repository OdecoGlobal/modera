// import { KYC_TIERS } from '@/lib/kyc';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/middlewares/auth.middleware';
import AppError from '@/utils/app-error';
import { formatApiError } from '@/utils/format-api-error';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { user: authUser } = await requireUser();
    const merchant = await prisma.merchant.findUnique({
      where: { userId: authUser.id },
    });
    if (!merchant) {
      throw new AppError('Merchant not found.', 404);
    }
    const submission = await prisma.kycSubmission.findFirst({
      where: { merchantId: merchant.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        tier: true,
        status: true,
        rejectionReason: true,
        reviewedAt: true,
        createdAt: true,
        customer: {
          select: {
            id: true,
            kycTier: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        status: 'success',
        data: {
          // currentTier: merchant.kycTier,
          // limits: KYC_TIERS[merchant.kycTier],
          submission,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return formatApiError(error);
  }
}
