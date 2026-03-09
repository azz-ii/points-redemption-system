import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { marketingRequestsApi, type RedemptionRequestResponse, type MarketingProcessingStatus } from '@/lib/api';

export function useMarketingRequests(refetchInterval: number | false = 30_000) {
  return useQuery<RedemptionRequestResponse[]>({
    queryKey: queryKeys.requests.list({ role: 'marketing' }),
    queryFn: () => marketingRequestsApi.getRequests(),
    refetchInterval,
  });
}

export function useMarketingHistory(refetchInterval: number | false = 30_000) {
  return useQuery<RedemptionRequestResponse[]>({
    queryKey: queryKeys.requests.marketingHistory,
    queryFn: () => marketingRequestsApi.getHistory(),
    refetchInterval,
  });
}

export function useMarketingProcessingStatus(requestId: number, enabled = true) {
  return useQuery<MarketingProcessingStatus>({
    queryKey: [...queryKeys.requests.detail(requestId), 'processing-status'] as const,
    queryFn: () => marketingRequestsApi.getMyProcessingStatus(requestId),
    enabled,
  });
}
