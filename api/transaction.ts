import { TransactionQuery, TransactionType } from '@/types/account';
import { fetchApi } from '.';
import { ApiResponse, PaginatedResponse } from '@/types';

export async function getMyTransactions(params?: TransactionQuery) {
  const res = await fetchApi<PaginatedResponse<TransactionType>>(
    `/accounts/transactions?${params}`,
    {
      credentials: 'include',
    },
  );
  return res;
}

interface MyTransactionStats {
  misdirectedCount: number;
  total: number;
  totalThisMonth: number;
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
