/* eslint-disable @typescript-eslint/no-explicit-any */

import { AuditAction } from '@/types/audit';
import { prisma } from './prisma';

export async function createAuditLog({
  merchantId,
  action,
  entity,
  entityId,
  metadata,
}: {
  merchantId: string;
  action: AuditAction;
  entity: string;
  entityId: string;
  metadata?: Record<string, any>;
}) {
  try {
    await prisma.auditLog.create({
      data: { merchantId, action, entity, entityId, metadata },
    });
  } catch (err) {
    // Never throw from audit log
    console.error('Audit log failed:', err);
  }
}

/*
Use

await createAuditLog({
  userId: user.id,
  action: "ACCOUNT_PROVISIONED",
  entity: "VirtualAccount",
  entityId: virtualAccount.id,
  metadata: { accountNumber: virtualAccount.bankAccountNumber }
})
*/
