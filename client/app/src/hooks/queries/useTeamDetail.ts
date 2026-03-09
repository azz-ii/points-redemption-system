import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { API_URL } from '@/lib/config';
import type { TeamDetail } from '@/page/superadmin/Teams/modals/types';

async function fetchTeamDetail(id: number): Promise<TeamDetail> {
  const response = await fetch(`${API_URL}/teams/${id}/`, {
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch team details');
  return response.json();
}

export function useTeamDetail(id: number, enabled = true) {
  return useQuery<TeamDetail>({
    queryKey: queryKeys.teams.detail(id),
    queryFn: () => fetchTeamDetail(id),
    enabled,
    refetchInterval: 30_000,
  });
}
