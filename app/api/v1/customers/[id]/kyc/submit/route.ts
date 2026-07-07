import { prisma } from '@/lib/prisma';

import AppError from '@/utils/app-error';
import { formatApiError } from '@/utils/format-api-error';
import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/middlewares/api-key';
import { SubmitKycSchema } from '@/schema/kyc.schema';
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const merchant = await validateApiKey(req);
    const { id: customerId } = await params;
    const body = await req.json();
    const { bvn, nin, dateOfBirth, address } = SubmitKycSchema.parse(body);

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true, kycTier: true, merchantId: true },
    });

    if (!customer) throw new AppError('Customer not found', 404);
    if (customer.merchantId !== merchant.id)
      throw new AppError('Forbidden', 403);
    if (customer.kycTier === 'verified') {
      throw new AppError('Customer is already on the highest tier', 400);
    }

    const pending = await prisma.kycSubmission.findFirst({
      where: { customerId: customer.id, status: 'pending' },
    });

    if (pending) {
      throw new AppError('Customer already has a pending KYC submission', 400);
    }

    await prisma.kycSubmission.create({
      data: {
        customerId: customer.id,
        merchantId: merchant.id,
        tier: 'verified',
        bvn,
        nin,
        dateOfBirth,
        address,
        status: 'pending',
      },
    });

    return NextResponse.json(
      { status: 'success', message: 'KYC submitted successfully' },
      { status: 201 },
    );
  } catch (error) {
    return formatApiError(error);
  }
}
