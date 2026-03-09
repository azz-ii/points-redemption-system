import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { distributorsApi } from '@/lib/distributors-api';

export function useDistributorBatchUpdatePoints() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ updates, reason }: { updates: { id: number; points: number }[]; reason?: string }) =>
      distributorsApi.batchUpdatePoints(updates, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.distributors.all });
    },
  });
}
