export const KYC_TIERS_ENUM = ['unverified', 'basic', 'verified'] as const;
export const KYC_STATUS_ENUM = ['pending', 'approved', 'rejected'] as const;
export const TRANSACTION_STATUS_ENUM = [
  'success',
  'misdirected',
  'flagged',
] as const;
export const VIRTUAL_ACCOUNT_STATUS = [
  'active',
  'suspended',
  'closed',
] as const;
