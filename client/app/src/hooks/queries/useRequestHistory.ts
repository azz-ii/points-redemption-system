import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { requestHistoryApi, type RedemptionRequestResponse } from '@/lib/api';

export function useRequestHistory(refetchInterval: number | false = 30_000) {
  return useQuery<RedemptionRequestResponse[]>({
    queryKey: queryKeys.requests.history,
    queryFn: () => requestHistoryApi.getProcessedRequests(),
    refetchInterval,
  });
}
