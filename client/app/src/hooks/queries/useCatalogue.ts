import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { catalogueApi, type PaginatedProductsResponse } from '@/lib/catalogue-api';
import { fetchCatalogueItems, type RedeemItemData } from '@/lib/api';

export function useCataloguePage(
  page: number,
  pageSize: number,
  search: string,
  showArchived?: boolean,
  refetchInterval: number | false = 30_000,
) {
  return useQuery<PaginatedProductsResponse>({
    queryKey: queryKeys.catalogue.page(page, pageSize, search, showArchived),
    queryFn: () => catalogueApi.getProductsPage(page, pageSize, search, showArchived),
    refetchInterval,
  });
}

export function useRedeemItems(refetchInterval: number | false = false) {
  return useQuery<RedeemItemData[]>({
    queryKey: queryKeys.catalogue.redeemItems,
    queryFn: fetchCatalogueItems,
    refetchInterval,
  });
}

export function useAssignedItemsPage(
  page: number,
  pageSize: number,
  search: string,
  refetchInterval: number | false = 30_000,
) {
  return useQuery<PaginatedProductsResponse>({
    queryKey: queryKeys.catalogue.assignedItems(page, pageSize, search),
    queryFn: () => catalogueApi.getAssignedItemsPage(page, pageSize, search),
    refetchInterval,
  });
}
