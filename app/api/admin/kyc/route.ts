import { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/middlewares/auth.middleware';
import { KycStatusType } from '@/types';
import { formatApiError } from '@/utils/format-api-error';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = req.nextUrl;

    const submissionStatus = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const whereClause: Prisma.KycSubmissionWhereInput = {};

    if (submissionStatus && submissionStatus !== '') {
      whereClause.status = submissionStatus as KycStatusType;
    }

    const [submission, total] = await prisma.$transaction([
      prisma.kycSubmission.findMany({
        where: whereClause,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              kycTier: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.kycSubmission.count({
        where: whereClause,
      }),
    ]);
    return NextResponse.json(
      {
        status: 'success',
        data: submission,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return formatApiError(error);
  }
}
