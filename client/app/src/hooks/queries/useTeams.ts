import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { API_URL } from '@/lib/config';
import type { Team } from '@/page/superadmin/Teams/modals/types';

export type { Team };

async function fetchTeams(): Promise<Team[]> {
  const response = await fetch(`${API_URL}/teams/`, {
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch teams');
  const data = await response.json();
  return Array.isArray(data) ? data : data.results ?? [];
}

export function useTeams(refetchInterval: number | false = 30_000) {
  return useQuery<Team[]>({
    queryKey: queryKeys.teams.all,
    queryFn: fetchTeams,
    refetchInterval,
  });
}
