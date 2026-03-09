import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { API_URL } from '@/lib/config';

function getCsrfToken(): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split('; csrftoken=');
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export function useBulkAssignMarketing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const csrf = getCsrfToken();
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (csrf) headers['X-CSRFToken'] = csrf;

      const res = await fetch(`${API_URL}/catalogue/bulk-assign-marketing/`, {
        method: 'POST', headers, credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || 'Failed to assign marketing'); }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.catalogue.all });
      qc.invalidateQueries({ queryKey: queryKeys.marketing.all });
    },
  });
}
