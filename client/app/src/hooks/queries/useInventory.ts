import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { inventoryApi, type PaginatedInventoryResponse } from '@/lib/inventory-api';

export function useInventoryPage(
  page: number,
  pageSize: number,
  search: string,
  refetchInterval: number | false = 30_000,
) {
  return useQuery<PaginatedInventoryResponse>({
    queryKey: queryKeys.inventory.page(page, pageSize, search),
    queryFn: () => inventoryApi.getInventoryPage(page, pageSize, search),
    refetchInterval,
  });
}
