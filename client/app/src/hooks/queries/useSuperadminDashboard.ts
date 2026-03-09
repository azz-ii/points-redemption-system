import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { queryKeys } from '@/lib/query-keys';
import {
  analyticsApi,
  type DateRange,
  type AnalyticsOverview,
  type TimeSeriesEntry,
  type ItemPopularity,
  type AgentPerformance,
  type TeamPerformance,
  type TurnaroundData,
  type EntityAnalytics,
} from '@/page/superadmin/Dashboard/utils/analyticsApi';

export function useSuperadminDashboard(dateRange: DateRange) {
  const queryClient = useQueryClient();
  const baseKey = queryKeys.dashboard.superadmin(dateRange);

  const overview = useQuery<AnalyticsOverview>({
    queryKey: [...baseKey, 'overview'],
    queryFn: () => analyticsApi.getOverview(dateRange),
  });

  const timeSeries = useQuery<TimeSeriesEntry[]>({
    queryKey: [...baseKey, 'timeSeries'],
    queryFn: () => analyticsApi.getTimeSeries(dateRange),
  });

  const items = useQuery<ItemPopularity[]>({
    queryKey: [...baseKey, 'items'],
    queryFn: () => analyticsApi.getItems(dateRange),
  });

  const agents = useQuery<AgentPerformance[]>({
    queryKey: [...baseKey, 'agents'],
    queryFn: () => analyticsApi.getAgents(dateRange),
  });

  const teams = useQuery<TeamPerformance[]>({
    queryKey: [...baseKey, 'teams'],
    queryFn: () => analyticsApi.getTeams(dateRange),
  });

  const turnaround = useQuery<TurnaroundData>({
    queryKey: [...baseKey, 'turnaround'],
    queryFn: () => analyticsApi.getTurnaround(dateRange),
  });

  const distributors = useQuery<EntityAnalytics[]>({
    queryKey: [...baseKey, 'distributors'],
    queryFn: () => analyticsApi.getEntities('distributor', dateRange),
  });

  const customers = useQuery<EntityAnalytics[]>({
    queryKey: [...baseKey, 'customers'],
    queryFn: () => analyticsApi.getEntities('customer', dateRange),
  });

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: baseKey });
  }, [queryClient, baseKey]);

  return {
    overview,
    timeSeries,
    items,
    agents,
    teams,
    turnaround,
    distributors,
    customers,
    invalidateAll,
  };
}
