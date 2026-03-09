import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { saveCart, clearCartBackend } from '@/lib/api';
import type { CartItem } from '@/components/cart-modal';

export function useSaveCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: CartItem[]) => saveCart(items),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });
}

export function useClearCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => clearCartBackend(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });
}
