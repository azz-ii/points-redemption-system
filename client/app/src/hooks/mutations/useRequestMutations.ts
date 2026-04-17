import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  redemptionRequestsApi,
  type CreateRedemptionRequestData,
} from '@/lib/api';

export function useCreateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRedemptionRequestData) =>
      redemptionRequestsApi.createRequest(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.requests.all });
      qc.invalidateQueries({ queryKey: queryKeys.cart });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.agent });
      qc.invalidateQueries({ queryKey: queryKeys.currentUser });
    },
  });
}

export function useApproveRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, remarks }: { id: number; remarks?: string }) =>
      redemptionRequestsApi.approveRequest(id, remarks),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.requests.all });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.approver });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.agent });
    },
  });
}

export function useRejectRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason, remarks }: { id: number; reason: string; remarks?: string }) =>
      redemptionRequestsApi.rejectRequest(id, reason, remarks),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.requests.all });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.approver });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.agent });
    },
  });
}

export function useMarkAsProcessed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, remarks }: { id: number; remarks?: string }) =>
      redemptionRequestsApi.markAsProcessed(id, remarks),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.requests.all });
    },
  });
}

export function useCancelRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      redemptionRequestsApi.cancelRequest(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.requests.all });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.agent });
      qc.invalidateQueries({ queryKey: queryKeys.currentUser });
    },
  });
}

export function useWithdrawRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason, remarks }: { id: number; reason: string; remarks?: string }) => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : 'http://localhost:8000'}/api/redemption-requests/${id}/withdraw_request/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ withdrawal_reason: reason, remarks }),
        },
      );
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to withdraw request');
      }
      return response.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.requests.all });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.agent });
    },
  });
}

export function useUploadAcknowledgementReceipt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      redemptionRequestsApi.uploadAcknowledgementReceipt(id, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.requests.all });
    },
  });
}
