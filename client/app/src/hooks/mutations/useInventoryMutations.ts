import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { inventoryApi } from '@/lib/inventory-api';

export function useInventoryBatchUpdateStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (updates: { id: number; adjustment: number; reason: string }[]) =>
      inventoryApi.batchUpdateStock(updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.inventory.all });
      qc.invalidateQueries({ queryKey: queryKeys.catalogue.all });
    },
  });
}

export function useInventoryBulkUpdateStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ stockDelta, password, reason }: { stockDelta: number; password: string; reason?: string }) =>
      inventoryApi.bulkUpdateStock(stockDelta, password, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.inventory.all });
      qc.invalidateQueries({ queryKey: queryKeys.catalogue.all });
    },
  });
}

export function useResetAllStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ password, reason }: { password: string; reason?: string }) =>
      inventoryApi.resetAllStock(password, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.inventory.all });
      qc.invalidateQueries({ queryKey: queryKeys.catalogue.all });
    },
  });
}
