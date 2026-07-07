import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';
import { KYC_TIERS } from '@/lib/kyc';
import { KycTierEnum } from '@/generated/prisma/enums';

interface KycLimitParams {
  customerId: string;
  merchantId: string;
  virtualAccountId: string;
  incomingAmount: number;
  transactionId: string;
  payerName: string | null;
  payerBank: string | null;
  requestId: string;
}

export async function enforceKycLimits({
  customerId,
  merchantId,
  virtualAccountId,
  incomingAmount,
  transactionId,
  payerName,
  payerBank,
  requestId,
}: KycLimitParams): Promise<{ flagged: boolean; reason?: string }> {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });

  if (!customer) return { flagged: false };

  const limits = KYC_TIERS[customer.kycTier as KycTierEnum];

  async function recordFlagged(notes: string) {
    try {
      await prisma.transaction.create({
        data: {
          merchantId,
          customerId,
          virtualAccountId,
          amount: incomingAmount,
          currency: 'NGN',
          reference: transactionId,
          payerName,
          payerBank,
          status: 'flagged',
          notes,
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.code !== 'P2002') throw err;
    }

    await createAuditLog({
      merchantId,
      action: 'TRANSACTION_FLAGGED',
      entity: 'Transaction',
      entityId: transactionId,
      metadata: {
        reason: notes,
        tier: customer!.kycTier,
        amount: incomingAmount,
        customerId,
      },
    });

    await prisma.webhookLog.updateMany({
      where: { requestId },
      data: {
        processed: true,
        processedAs: 'flagged',
      },
    });
  }

  // Check per-transaction limit
  if (incomingAmount > limits.transactionLimit) {
    const reason = `Exceeds ${customer.kycTier} tier transaction limit of ₦${limits.transactionLimit.toLocaleString()}`;
    await recordFlagged(reason);
    return { flagged: true, reason };
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const dailyTotal = await prisma.transaction.aggregate({
    where: {
      customerId,
      status: 'success',
      createdAt: { gte: startOfDay },
    },
    _sum: { amount: true },
  });

  const dailySpend = (dailyTotal._sum.amount ?? 0) + incomingAmount;

  if (dailySpend > limits.dailyLimit) {
    const reason = `Exceeds ${customer.kycTier} tier daily limit of ₦${limits.dailyLimit.toLocaleString()}`;
    await recordFlagged(reason);
    return { flagged: true, reason };
  }

  return { flagged: false };
}
