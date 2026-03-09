import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { customersApi, type Customer } from '@/lib/customers-api';

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Customer>) => customersApi.createCustomer(data as Parameters<typeof customersApi.createCustomer>[0]),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Customer> }) =>
      customersApi.updateCustomer(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => customersApi.deleteCustomer(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
  });
}

export function useCreateProspect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => customersApi.createProspect(name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
  });
}

export function usePromoteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { brand: string; sales_channel: string } }) =>
      customersApi.promoteCustomer(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
  });
}

export function useMergeCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sourceId, targetId }: { sourceId: number; targetId: number }) =>
      customersApi.mergeCustomer(sourceId, targetId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.customers.all });
      qc.invalidateQueries({ queryKey: queryKeys.requests.all });
    },
  });
}
