import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { usersApi, type PaginatedAccountsResponse } from '@/lib/users-api';

export function useAccountsPage(
  page: number,
  pageSize: number,
  search: string,
  showArchived?: boolean,
  refetchInterval: number | false = 30_000,
) {
  return useQuery<PaginatedAccountsResponse>({
    queryKey: queryKeys.accounts.page(page, pageSize, search, showArchived),
    queryFn: () => usersApi.getAccountsPage(page, pageSize, search, showArchived),
    refetchInterval,
  });
}
