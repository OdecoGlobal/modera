import { prisma } from '@/lib/prisma';
import { requireUser } from '@/middlewares/auth.middleware';
import AppError from '@/utils/app-error';
import { formatApiError } from '@/utils/format-api-error';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { user } = await requireUser();
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
      },
    });
    if (!user) {
      throw new AppError('No user found', 404);
    }
    return NextResponse.json(
      {
        status: 'success',
        data: dbUser,
      },
      { status: 200 },
    );
  } catch (error) {
    return formatApiError(error);
  }
}
