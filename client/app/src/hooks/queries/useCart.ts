import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getCart, type BackendCartItem } from '@/lib/api';

export function useCart(enabled = true) {
  return useQuery<BackendCartItem[]>({
    queryKey: queryKeys.cart,
    queryFn: getCart,
    enabled,
  });
}
