import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { distributorsApi, type PaginatedDistributorsResponse } from '@/lib/distributors-api';

export function useDistributorsPage(
  page: number,
  pageSize: number,
  search: string,
  showArchived?: boolean,
  refetchInterval: number | false = 30_000,
) {
  return useQuery<PaginatedDistributorsResponse>({
    queryKey: queryKeys.distributors.page(page, pageSize, search, showArchived),
    queryFn: () => distributorsApi.getDistributorsPage(page, pageSize, search, showArchived),
    refetchInterval,
  });
}

export function useDistributorsList() {
  return useQuery({
    queryKey: queryKeys.distributors.listAll,
    queryFn: () => distributorsApi.getListAll(),
  });
}
