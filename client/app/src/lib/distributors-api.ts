const API_BASE_URL = '/api'; // Proxied to Django backend

export interface Distributor {
  id: number;
  name: string;
  contact_email?: string;
  phone?: string;
  location?: string;
  region?: string;
  points?: number;
  team?: string;
  date_added?: string;
}

export interface DashboardStats {
  total_requests: number;
  pending_count: number;
  approved_count: number;
  rejected_count: number;
  processed_count: number;
  not_processed_count: number;
  cancelled_count: number;
  on_board_count: number;
}

export interface RedemptionRequest {
  id: number;
  requested_by: number;
  requested_by_name: string;
  requested_for: number;
  requested_for_name: string;
  team: number | null;
  team_name: string | null;
  points_deducted_from: string;
  points_deducted_from_display: string;
  total_points: number;
  status: string;
  status_display: string;
  processing_status: string;
  processing_status_display: string;
  date_requested: string;
  reviewed_by: number | null;
  reviewed_by_name: string | null;
  date_reviewed: string | null;
  processed_by: number | null;
  processed_by_name: string | null;
  date_processed: string | null;
  cancelled_by: number | null;
  cancelled_by_name: string | null;
  date_cancelled: string | null;
  remarks: string | null;
  rejection_reason: string | null;
  items: any[];
}

export interface PaginatedResponse<T> {
  count: number;
  limit: number;
  offset: number;
  results: T[];
}

export const distributorsApi = {
  getDistributors: async (searchQuery: string = ''): Promise<Distributor[]> => {
    const url = new URL(`${API_BASE_URL}/distributors/`, window.location.origin);
    if (searchQuery) {
      url.searchParams.append('search', searchQuery);
    }
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Failed to fetch distributors');
    const data = await response.json();
    // Handle both array and paginated response formats
    return Array.isArray(data) ? data : (data.results || []);
  },
  getAll: async (): Promise<Distributor[]> => {
    const response = await fetch(`${API_BASE_URL}/distributors/`);
    if (!response.ok) throw new Error('Failed to fetch distributors');
    return response.json();
  },
  create: async (data: Omit<Distributor, 'id' | 'date_added'>): Promise<Distributor> => {
    const response = await fetch(`${API_BASE_URL}/distributors/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create distributor');
    return response.json();
  },
  update: async (id: number, data: Partial<Distributor>): Promise<Distributor> => {
    const response = await fetch(`${API_BASE_URL}/distributors/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update distributor');
    return response.json();
  },
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/distributors/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete distributor');
  },
};

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats/`, {
      credentials: 'include',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("Dashboard stats error response:", response.status, error);
      throw new Error('Failed to fetch dashboard statistics');
    }
    return response.json();
  },
  getRedemptionRequests: async (limit: number = 10, offset: number = 0): Promise<PaginatedResponse<RedemptionRequest>> => {
    const url = new URL(`${API_BASE_URL}/dashboard/redemption-requests/`, window.location.origin);
    url.searchParams.append('limit', limit.toString());
    url.searchParams.append('offset', offset.toString());
    console.log("Fetching from URL:", url.toString());
    const response = await fetch(url.toString(), {
      credentials: 'include',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("Dashboard requests error response:", response.status, error);
      throw new Error('Failed to fetch redemption requests');
    }
    const data = await response.json();
    console.log("Redemption requests data:", data);
    return data;
  },
};