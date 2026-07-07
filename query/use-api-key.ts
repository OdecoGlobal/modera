import { generateMyApiKey, getMyApiKey, revokeMyApiKey } from '@/api/api-key';
import { QUERY_STALE_TIME, queryKeys } from '@/constant/query';
import { formatError } from '@/utils/format-error';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';

export function useGetMyApiKey() {
  return useQuery({
    queryFn: getMyApiKey,
    queryKey: queryKeys.apiKey.me(),
    staleTime: QUERY_STALE_TIME,
    placeholderData: keepPreviousData,
  });
}

export function useGenerateMyApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: generateMyApiKey,
    onSuccess() {
      qc.invalidateQueries({ queryKey: queryKeys.apiKey.all() });
      toast.success('Success', {
        description:
          'API key generated — copy it now. It will not be shown again.',
      });
    },
    onError(error) {
      toast.error('Error', {
        description: formatError(error) ?? 'Something went wrong',
      });
    },
  });
}
export function useRevokeMyApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: revokeMyApiKey,
    onSuccess() {
      qc.invalidateQueries({ queryKey: queryKeys.apiKey.all() });
      toast.success('Success', {
        description: 'You api key has been revoked successfully.',
      });
    },
    onError(error) {
      toast.error('Error', {
        description: formatError(error) ?? 'Something went wrong',
      });
    },
  });
}
