import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { usersApi } from '@/lib/users-api';
import type { MarketingUser } from '@/page/superadmin/Marketing/components/types';

export interface PaginatedMarketingUsersResponse {
  count: number;
  results: MarketingUser[];
}

export function useMarketingUsersPage(
  page: number,
  pageSize: number,
  search: string,
  refetchInterval: number | false = 30_000,
) {
  return useQuery<PaginatedMarketingUsersResponse>({
    queryKey: queryKeys.marketing.page(page, pageSize, search),
    queryFn: async () => {
      const [usersData, assignmentsData] = await Promise.all([
        usersApi.getMarketingUsersPage(page, pageSize, search),
        usersApi.getBulkAssignMarketing(),
      ]);

      // Build assignments map by user ID from product-level data
      const assignmentsByUser: Record<number, {
        legends: Record<string, { legend: string; item_count: number }>;
        products: { id: number; item_code: string; item_name: string; legend: string }[];
      }> = {};

      if (assignmentsData.products) {
        for (const product of assignmentsData.products) {
          if (product.mktg_admin_id) {
            if (!assignmentsByUser[product.mktg_admin_id]) {
              assignmentsByUser[product.mktg_admin_id] = { legends: {}, products: [] };
            }
            const entry = assignmentsByUser[product.mktg_admin_id];
            entry.products.push({
              id: product.id,
              item_code: product.item_code,
              item_name: product.item_name,
              legend: product.legend,
            });
            if (!entry.legends[product.legend]) {
              entry.legends[product.legend] = { legend: product.legend, item_count: 0 };
            }
            entry.legends[product.legend].item_count += 1;
          }
        }
      }

      // Merge users with their assignments
      const results: MarketingUser[] = usersData.results.map((account) => {
        const entry = assignmentsByUser[account.id];
        return {
          ...account,
          assigned_legends: entry ? Object.values(entry.legends) : [],
          assigned_products: entry ? entry.products : [],
        };
      });

      return { count: usersData.count, results };
    },
    refetchInterval,
  });
}
