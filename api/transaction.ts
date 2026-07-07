import { TransactionQuery, TransactionType } from '@/types/account';
import { fetchApi } from '.';
import { ApiResponse, PaginatedResponse } from '@/types';

export async function getMyTransactions(params?: TransactionQuery) {
  const res = await fetchApi<PaginatedResponse<TransactionType>>(
    `/accounts/transactions?${new URLSearchParams(params as Record<string, string>).toString()}`,
    {
      credentials: 'include',
    },
  );
  return res;
}

interface MyTransactionStats {
  misdirectedCount: number;
  total: number;
  flagged: number;
  totalThisMonth: number;
  totalCustomers: number;
}
export async function getMyTransactionStats() {
  const res = await fetchApi<ApiResponse<MyTransactionStats>>(
    '/accounts/transactions/stats',
    {
      credentials: 'include',
    },
  );

  return res;
}
