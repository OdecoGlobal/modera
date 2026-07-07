import { createAuditLog } from '@/lib/audit';
import { KYC_TIERS } from '@/lib/kyc';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/middlewares/auth.middleware';
import AppError from '@/utils/app-error';
import { formatApiError } from '@/utils/format-api-error';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user: adminMerchant } = await requireAdmin();
    const { id } = await params;

    const submission = await prisma.kycSubmission.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, kycTier: true },
        },
      },
    });

    if (!submission) throw new AppError('Submission not found', 404);
    if (submission.status !== 'pending') {
      throw new AppError('Submission has already been reviewed', 400);
    }

    const fromTier = submission.customer.kycTier;
    const toTier = submission.tier;

    if (fromTier === toTier) {
      throw new AppError(`Customer is already on ${toTier} tier`, 400);
    }

    await prisma.$transaction(async tx => {
      await tx.kycSubmission.update({
        where: { id },
        data: {
          status: 'approved',
          reviewedBy: adminMerchant.id,
          reviewedAt: new Date(),
        },
      });

      await tx.customer.update({
        where: { id: submission.customerId },
        data: { kycTier: toTier },
      });

      await tx.kycEvent.create({
        data: {
          customerId: submission.customerId,
          merchantId: submission.merchantId,
          fromTier,
          toTier,
        },
      });
    });

    await createAuditLog({
      merchantId: adminMerchant.id,
      action: 'KYC_TIER_CHANGED',
      entity: 'KycSubmission',
      entityId: id,
      metadata: {
        result: 'approved',
        fromTier,
        toTier,
        newLimits: KYC_TIERS[toTier],
        customerId: submission.customerId,
      },
    });

    return NextResponse.json(
      {
        status: 'success',
        data: {
          customerId: submission.customerId,
          fromTier,
          toTier,
          newLimits: KYC_TIERS[toTier],
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return formatApiError(error);
  }
}
