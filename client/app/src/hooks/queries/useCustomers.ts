import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { customersApi, type PaginatedCustomersResponse } from '@/lib/customers-api';

export function useCustomersPage(
  page: number,
  pageSize: number,
  search: string,
  showArchived?: boolean,
  refetchInterval: number | false = 30_000,
) {
  return useQuery<PaginatedCustomersResponse>({
    queryKey: queryKeys.customers.page(page, pageSize, search, showArchived),
    queryFn: () => customersApi.getCustomersPage(page, pageSize, search, showArchived),
    refetchInterval,
  });
}

export function useCustomersList() {
  return useQuery({
    queryKey: queryKeys.customers.listAll,
    queryFn: () => customersApi.getListAll(),
  });
}
