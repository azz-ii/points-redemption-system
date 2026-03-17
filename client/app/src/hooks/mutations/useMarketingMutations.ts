import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { handlerRequestsApi, type ProcessItemData } from '@/lib/api';

export function useMarkItemsProcessed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, items }: { requestId: number; items: ProcessItemData[] }) =>
      handlerRequestsApi.markItemsProcessed(requestId, items),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.requests.all });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.handler });
    },
  });
}

export function useHandlerCancelRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, reason, remarks }: { requestId: number; reason: string; remarks?: string }) =>
      handlerRequestsApi.cancelRequest(requestId, reason, remarks),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.requests.all });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.handler });
    },
  });
}
