import { closeMyAccount, getMyAccount, renameMyAccount } from '@/api/account';
import { QUERY_STALE_TIME, queryKeys } from '@/constant/query';
import { formatError } from '@/utils/format-error';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';

export function useGetMyAccount() {
  return useQuery({
    queryKey: queryKeys.account.me(),
    queryFn: getMyAccount,
    staleTime: QUERY_STALE_TIME,
    placeholderData: keepPreviousData,
  });
}

export function useRenameMyAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: renameMyAccount,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.account.all() });
      toast.success('Success', {
        description: 'Account has been renamed successfully',
      });
    },
    onError: error => {
      toast.error('Error', {
        description: formatError(error) ?? 'Something went wrong',
      });
    },
  });
}
export function useCloseMyAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: closeMyAccount,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.account.all() });
      toast.success('Success', {
        description: 'Account has been closed successfully',
      });
    },
    onError: error => {
      toast.error('Error', {
        description: formatError(error) ?? 'Something went wrong',
      });
    },
  });
}
