import { getMyTransactions, getMyTransactionStats } from '@/api/transaction';
import { QUERY_STALE_TIME, queryKeys } from '@/constant/query';
import { TransactionQuery } from '@/types/account';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export function useGetMyTransactions(params?: TransactionQuery) {
  return useQuery({
    queryKey: queryKeys.transaction.me(),
    queryFn: () => getMyTransactions(params),
    staleTime: QUERY_STALE_TIME,
    placeholderData: keepPreviousData,
  });
}

export function useGetMyTransactionStats() {
  return useQuery({
    queryFn: getMyTransactionStats,
    queryKey: queryKeys.transaction.stats(),
    staleTime: QUERY_STALE_TIME,
    placeholderData: keepPreviousData,
  });
}
