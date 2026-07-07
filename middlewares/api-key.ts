import { prisma } from '@/lib/prisma';
import AppError from '@/utils/app-error';
import { NextRequest } from 'next/server';
import crypto from 'crypto';

export async function validateApiKey(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key');
  if (!apiKey) {
    throw new AppError('Missing x-api-key header', 401);
  }
  if (!apiKey.startsWith('nva_')) {
    throw new AppError('Invalid API key format', 401);
  }
  const incomingHash = crypto.createHash('sha256').update(apiKey).digest('hex');

  const record = await prisma.apiKey.findUnique({
    where: { keyHash: incomingHash },
    include: {
      merchant: {
        include: { virtualAccount: true },
      },
    },
  });
  if (!record) {
    throw new AppError('Invalid API key', 401);
  }

  return record.merchant;
}
