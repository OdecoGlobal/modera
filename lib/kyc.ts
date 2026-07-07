import { KycTierType } from '@/types';
import { toKobo } from '@/utils';

export const KYC_TIERS = {
  unverified: {
    label: 'Unverified',
    dailyLimit: toKobo(50000),
    transactionLimit: toKobo(10000),
    monthlyLimit: toKobo(100000),
  },
  basic: {
    label: 'Basic',
    dailyLimit: toKobo(200000),
    transactionLimit: toKobo(50000),
    monthlyLimit: toKobo(1000000),
  },
  verified: {
    label: 'Verified',
    dailyLimit: toKobo(5000000),
    transactionLimit: toKobo(1000000),
    monthlyLimit: toKobo(50000000),
  },
} as const;

export function getKycLimits(tier: KycTierType) {
  return KYC_TIERS[tier];
}
export const KYC_REQUIREMENTS = {
  basic: ['bvn', 'dateOfBirth'],
  verified: ['bvn', 'nin', 'address'],
} as const;
