import {
  KYC_STATUS_ENUM,
  KYC_TIERS_ENUM,
  TRANSACTION_STATUS_ENUM,
  VIRTUAL_ACCOUNT_STATUS,
} from '@/constant/enum';
import z from 'zod';

export const KycStatusEnum = z.enum(KYC_STATUS_ENUM);
export const KycTierEnum = z.enum(KYC_TIERS_ENUM);
export const TransactionStatusEnum = z.enum(TRANSACTION_STATUS_ENUM);
export const VirtualAccountEnum = z.enum(VIRTUAL_ACCOUNT_STATUS);
