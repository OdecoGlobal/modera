import { prisma } from '@/lib/prisma';

import { formatApiError } from '@/utils/format-api-error';
import AppError from '@/utils/app-error';
import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/middlewares/api-key';
import { Prisma } from '@/generated/prisma/client';

export async function POST(req: NextRequest) {
  try {
    const merchant = await validateApiKey(req);
    const { name, email, phone } = await req.json();

    if (!name) throw new AppError('name is required', 400);

    if (email) {
      const existing = await prisma.customer.findFirst({
        where: { merchantId: merchant.id, email: email.toLowerCase().trim() },
      });
      if (existing)
        throw new AppError('A customer with this email already exists', 400);
    }

    const customer = await prisma.customer.create({
      data: {
        merchantId: merchant.id,
        name: name.trim(),
        email: email?.toLowerCase().trim() ?? null,
        phone: phone ?? null,
      },
    });

    const provisionRes = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/accounts/provision`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId: merchant.id,
          customerId: customer.id,
          accountName: name.trim(),
          type: 'customer',
        }),
      },
    );

    const provisionData = await provisionRes.json();

    if (!provisionRes.ok) {
      await prisma.customer.delete({ where: { id: customer.id } });
      throw new AppError(provisionData.error ?? 'VA provisioning failed', 500);
    }

    return NextResponse.json(
      {
        status: 'success',
        data: {
          customer,
          virtualAccount: provisionData.data,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return formatApiError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const merchant = await validateApiKey(req);
    const { searchParams } = req.nextUrl;

    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;
    const search = searchParams.get('search');

    const where: Prisma.CustomerWhereInput = { merchantId: merchant.id };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [customers, total] = await prisma.$transaction([
      prisma.customer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          virtualAccount: {
            select: {
              id: true,
              bankAccountNumber: true,
              bankAccountName: true,
              bankName: true,
              accountRef: true,
              status: true,
            },
          },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    return NextResponse.json({
      status: 'success',
      data: customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return formatApiError(error);
  }
}
