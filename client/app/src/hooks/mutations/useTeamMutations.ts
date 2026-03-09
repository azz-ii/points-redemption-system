import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { API_URL } from '@/lib/config';

function getCsrfToken(): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split('; csrftoken=');
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function getHeaders(): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  const csrf = getCsrfToken();
  if (csrf) headers['X-CSRFToken'] = csrf;
  return headers;
}

export function useCreateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; approver?: number }) => {
      const res = await fetch(`${API_URL}/teams/`, {
        method: 'POST', headers: getHeaders(), credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || 'Failed to create team'); }
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.teams.all }); },
  });
}

export function useEditTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Record<string, unknown> }) => {
      const res = await fetch(`${API_URL}/teams/${id}/`, {
        method: 'PUT', headers: getHeaders(), credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || 'Failed to edit team'); }
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.teams.all }); },
  });
}

export function useDeleteTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API_URL}/teams/${id}/`, {
        method: 'DELETE', headers: getHeaders(), credentials: 'include',
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || 'Failed to delete team'); }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.teams.all }); },
  });
}

export function useAddTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: number; userId: number }) => {
      const res = await fetch(`${API_URL}/teams/${teamId}/add_member/`, {
        method: 'POST', headers: getHeaders(), credentials: 'include',
        body: JSON.stringify({ user_id: userId }),
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || 'Failed to add member'); }
      return res.json();
    },
    onSuccess: (_data, { teamId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.teams.all });
      qc.invalidateQueries({ queryKey: queryKeys.teams.detail(teamId) });
    },
  });
}

export function useRemoveTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: number; userId: number }) => {
      const res = await fetch(`${API_URL}/teams/${teamId}/remove_member/`, {
        method: 'POST', headers: getHeaders(), credentials: 'include',
        body: JSON.stringify({ user_id: userId }),
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || 'Failed to remove member'); }
      return res.json();
    },
    onSuccess: (_data, { teamId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.teams.all });
      qc.invalidateQueries({ queryKey: queryKeys.teams.detail(teamId) });
    },
  });
}
