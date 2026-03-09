import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { agentDashboardApi, approverDashboardApi } from '@/lib/distributors-api';
import { marketingRequestsApi, type RedemptionRequestResponse } from '@/lib/api';

export function useAgentDashboardStats(refetchInterval: number | false = 30_000) {
  return useQuery({
    queryKey: queryKeys.dashboard.agent,
    queryFn: () => agentDashboardApi.getStats(),
    refetchInterval,
  });
}

export function useApproverDashboardStats(refetchInterval: number | false = 30_000) {
  return useQuery({
    queryKey: queryKeys.dashboard.approver,
    queryFn: () => approverDashboardApi.getStats(),
    refetchInterval,
  });
}

export function useMarketingDashboardData(refetchInterval: number | false = 30_000) {
  const requests = useQuery<RedemptionRequestResponse[]>({
    queryKey: queryKeys.requests.list({ role: 'marketing' }),
    queryFn: () => marketingRequestsApi.getRequests(),
    refetchInterval,
  });

  const history = useQuery<RedemptionRequestResponse[]>({
    queryKey: queryKeys.requests.marketingHistory,
    queryFn: () => marketingRequestsApi.getHistory(),
    refetchInterval,
  });

  return { requests, history };
}
