import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { usersApi } from '@/lib/users-api';

export function useAccountBatchUpdatePoints() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ updates, reason }: { updates: { id: number; points: number }[]; reason?: string }) =>
      usersApi.batchUpdatePoints(updates, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.accounts.all });
      qc.invalidateQueries({ queryKey: queryKeys.currentUser });
    },
  });
}
