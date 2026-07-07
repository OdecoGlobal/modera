export const QUERY_STALE_TIME = 1 * 60 * 1000;
const AUDIT_KEY = 'audit';
const ACCOUNT_KEY = 'account';
const TRANSACTION_KEY = 'transaction';
const KYC_KEY = 'kyc';
const API_KEY = 'api-key';

export const queryKeys = {
  account: {
    all: () => [ACCOUNT_KEY] as const,
    me: () => [ACCOUNT_KEY, 'me'] as const,
  },
  transaction: {
    all: () => [TRANSACTION_KEY] as const,
    me: () => [TRANSACTION_KEY, 'me'] as const,
    stats: () => [TRANSACTION_KEY, 'stats'] as const,
  },
  kyc: {
    all: () => [KYC_KEY] as const,
    me: () => [KYC_KEY, 'me'] as const,
  },
  apiKey: {
    all: () => [API_KEY] as const,
    me: () => [API_KEY, 'me'] as const,
  },

  audit: {
    all: () => [AUDIT_KEY],
  },
};
