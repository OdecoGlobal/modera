import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AppError from '@/utils/app-error';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return session;
}

export async function requireMerchant() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new AppError('Unauthorized', 401);

  const merchant = await prisma.merchant.findUnique({
    where: { userId: session.user.id },
  });

  if (!merchant) throw new AppError('Merchant not found', 404);

  return { session, merchant };
}
export async function requireAdmin() {
  const session = await requireUser();
  if (session.user.role?.toLowerCase() !== 'admin') {
    throw NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return session;
}
