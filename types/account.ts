import z from 'zod';
// import { KycTierType } from '.';
import { accountNameSchema, reasonSchema } from '@/schema/account.schema';

export type TransactionQuery = {
  page?: number;
  limit?: number;
};
export type AccountStatusType = 'active' | 'suspended' | 'closed';

type TransactionTypeUnion = 'credit' | 'misdirected';
type TransactionStatusUnion = 'credit' | 'misdirected';
export type TransactionStatusType = 'success' | 'misdirected' | 'flagged';

export type TransactionType = {
  id: string;
  amount: number;
  createdAt: string;
  currency: string;
  notes: string;
  payerBank: string;
  payerName: string;
  reference: string;
  status: TransactionStatusUnion;
  type: TransactionTypeUnion;
  userId: string;
  virtualAccountId: string;
};

export type MerchantType = {
  businessName: string;
  businessEmail: string;
  id: string;
  isAdmin: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type VirtualAccountType = {
  accountHolderId: string;
  id: string;
  bankAccountNumber: string;
  bankAccountName: string;
  bankName: string;
  accountRef: string;
  bvn: string;
  closedAt: string | null;
  customerId: string;
  expired: boolean;
  merchantId: string;
  type: 'merchant' | 'customer';
  // status: AccountStatusType;
  createdAt: string;
  // balance: number;
  // user: {
  //   kycTier: KycTierType;
  // };
};

export type AccountNameType = z.infer<typeof accountNameSchema>;

export type ReasonType = z.infer<typeof reasonSchema>;
