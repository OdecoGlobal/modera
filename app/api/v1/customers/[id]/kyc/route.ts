import { prisma } from '@/lib/prisma';

import AppError from '@/utils/app-error';
import { formatApiError } from '@/utils/format-api-error';
import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/middlewares/api-key';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const merchant = await validateApiKey(req);
    const { id: customerId } = await params;

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true, kycTier: true, merchantId: true },
    });

    if (!customer) throw new AppError('Customer not found', 404);
    if (customer.merchantId !== merchant.id)
      throw new AppError('Forbidden', 403);

    const submission = await prisma.kycSubmission.findFirst({
      where: { customerId: customer.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        tier: true,
        status: true,
        rejectionReason: true,
        reviewedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      status: 'success',
      data: {
        currentTier: customer.kycTier,
        // limits: KYC_TIERS[customer.kycTier as KycTierEnum],
        submission,
      },
    });
  } catch (error) {
    return formatApiError(error);
  }
}
