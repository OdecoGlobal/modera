import { createAuditLog } from '@/lib/audit';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/middlewares/auth.middleware';
import { reasonSchema } from '@/schema/account.schema';
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
    const body = await req.json();
    const { reason } = reasonSchema.parse(body);

    const submission = await prisma.kycSubmission.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        customerId: true,
        merchantId: true,
        tier: true,
      },
    });

    if (!submission) throw new AppError('Submission not found', 404);
    if (submission.status !== 'pending') {
      throw new AppError('Submission has already been reviewed', 400);
    }

    await prisma.kycSubmission.update({
      where: { id },
      data: {
        status: 'rejected',
        rejectionReason: reason,
        reviewedBy: adminMerchant.id,
        reviewedAt: new Date(),
      },
    });

    await createAuditLog({
      merchantId: adminMerchant.id,
      action: 'KYC_TIER_CHANGED',
      entity: 'KycSubmission',
      entityId: id,
      metadata: {
        result: 'rejected',
        reason,
        customerId: submission.customerId,
        merchantId: submission.merchantId,
        appliedForTier: submission.tier,
      },
    });

    return NextResponse.json(
      {
        status: 'success',
        data: { message: 'KYC rejected', reason },
      },
      { status: 200 },
    );
  } catch (error) {
    return formatApiError(error);
  }
}
