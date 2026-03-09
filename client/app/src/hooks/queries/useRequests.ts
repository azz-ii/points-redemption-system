import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { redemptionRequestsApi, type RedemptionRequestResponse } from '@/lib/api';

interface UseRequestsOptions {
  refetchInterval?: number | false;
  notProcessed?: boolean;
  processed?: boolean;
}

export function useRequests(
  refetchIntervalOrOptions: number | false | UseRequestsOptions = 30_000,
) {
  const options: UseRequestsOptions =
    typeof refetchIntervalOrOptions === 'object' && refetchIntervalOrOptions !== null
      ? refetchIntervalOrOptions
      : { refetchInterval: refetchIntervalOrOptions as number | false };

  const { refetchInterval = 30_000, notProcessed, processed } = options;
  const filters = notProcessed
    ? { not_processed: true }
    : processed
      ? { processed: true }
      : undefined;

  return useQuery<RedemptionRequestResponse[]>({
    queryKey: queryKeys.requests.list(filters),
    queryFn: () => redemptionRequestsApi.getRequests({ notProcessed, processed }),
    refetchInterval,
  });
}

export function useRequestDetail(id: number, enabled = true) {
  return useQuery<RedemptionRequestResponse>({
    queryKey: queryKeys.requests.detail(id),
    queryFn: () => redemptionRequestsApi.getRequest(id),
    enabled,
  });
}
