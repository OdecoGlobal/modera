/*
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/middlewares/auth.middleware';
import { SubmitKycSchema } from '@/schema/kyc.schema';
import AppError from '@/utils/app-error';
import { formatApiError } from '@/utils/format-api-error';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session = await requireUser();
    const body = await req.json();
    const { bvn, nin, dateOfBirth, address } = SubmitKycSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, kycTier: true },
    });

    if (!user) {
      throw new AppError('No user found', 404);
    }

    if (user.kycTier === 'verified') {
      throw new AppError('You are already in the highest tier', 400);
    }
    const pendingSubmission = await prisma.kycSubmission.findFirst({
      where: { userId: user.id, status: 'pending' },
      select: { id: true, status: true },
    });

    if (pendingSubmission) {
      throw new AppError('You have a pending KYC submission', 400);
    }
    const targetTier = user.kycTier === 'unverified' ? 'basic' : 'verified';

    await prisma.kycSubmission.create({
      data: {
        userId: user.id,
        tier: targetTier,
        bvn,
        nin,
        dateOfBirth,
        address,
        status: 'pending',
      },
    });

    return NextResponse.json(
      { staus: 'success', message: 'Kyc submitted succesfully' },
      { status: 200 },
    );
  } catch (error) {
    return formatApiError(error);
  }
}
*/
