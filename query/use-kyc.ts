import { getMyKycSubmission, submitKyc } from '@/api/kyc';
import { QUERY_STALE_TIME, queryKeys } from '@/constant/query';
import { formatError } from '@/utils/format-error';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';

export function useGetMyKycSubmission() {
  return useQuery({
    queryFn: getMyKycSubmission,
    queryKey: queryKeys.kyc.me(),
    placeholderData: keepPreviousData,
    staleTime: QUERY_STALE_TIME,
  });
}

export function useSubmitKyc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitKyc,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kyc.all() });
      toast.success('Success', {
        description: 'Kyc has been successfully submitted',
      });
    },
    onError: error => {
      toast.error('Error', {
        description: formatError(error) ?? 'Something went wrong',
      });
    },
  });
}
