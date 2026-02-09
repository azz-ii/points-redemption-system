import { API_URL } from './config';

const API_BASE_URL = API_URL;

export interface PointsAuditLog {
  id: number;
  entity_type: 'USER' | 'DISTRIBUTOR' | 'CUSTOMER';
  entity_type_display: string;
  entity_id: number;
  entity_name: string;
  previous_points: number;
  new_points: number;
  points_delta: number;
  action_type: 'INDIVIDUAL_SET' | 'BULK_DELTA' | 'BULK_RESET';
  action_type_display: string;
  changed_by: number | null;
  changed_by_username: string;
  reason: string;
  batch_id: string | null;
  created_at: string;
}

export interface PaginatedAuditResponse {
  count: number;
  page: number;
  page_size: number;
  results: PointsAuditLog[];
}

export const pointsAuditApi = {
  getHistory: async (
    entityType: string,
    entityId: number,
    page: number = 1,
    pageSize: number = 15,
  ): Promise<PaginatedAuditResponse> => {
    const url = new URL(`${API_BASE_URL}/points-audit/`, window.location.origin);
    url.searchParams.append('entity_type', entityType);
    url.searchParams.append('entity_id', entityId.toString());
    url.searchParams.append('page', page.toString());
    url.searchParams.append('page_size', pageSize.toString());

    const response = await fetch(url.toString(), {
      credentials: 'include',
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to fetch points history');
    }

    return response.json();
  },
};
