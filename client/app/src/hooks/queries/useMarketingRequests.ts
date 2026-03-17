import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { handlerRequestsApi, type RedemptionRequestResponse, type HandlerProcessingStatus } from '@/lib/api';

export function useHandlerRequests(refetchInterval: number | false = 30_000) {
  return useQuery<RedemptionRequestResponse[]>({
    queryKey: queryKeys.requests.list({ role: 'handler' }),
    queryFn: () => handlerRequestsApi.getRequests(),
    refetchInterval,
  });
}

export function useHandlerHistory(refetchInterval: number | false = 30_000) {
  return useQuery<RedemptionRequestResponse[]>({
    queryKey: queryKeys.requests.handlerHistory,
    queryFn: () => handlerRequestsApi.getHistory(),
    refetchInterval,
  });
}

export function useHandlerProcessingStatus(requestId: number, enabled = true) {
  return useQuery<HandlerProcessingStatus>({
    queryKey: [...queryKeys.requests.detail(requestId), 'processing-status'] as const,
    queryFn: () => handlerRequestsApi.getMyProcessingStatus(requestId),
    enabled,
  });
}
