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

export interface PaginatedDistributorsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Distributor[];
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
  customers_count: number;
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
  getDistributorsPage: async (page: number = 1, pageSize: number = 20, searchQuery: string = ''): Promise<PaginatedDistributorsResponse> => {
    const url = new URL(`${API_BASE_URL}/distributors/`, window.location.origin);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('page_size', pageSize.toString());
    if (searchQuery) {
      url.searchParams.append('search', searchQuery);
    }
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Failed to fetch distributors');
    const data = await response.json();
    // Ensure we return paginated format
    if (Array.isArray(data)) {
      return { count: data.length, next: null, previous: null, results: data };
    }
    return data;
  },
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
  getAllDistributors: async (): Promise<Distributor[]> => {
    // Fetch all distributors by requesting maximum page size and iterating through pages
    let allDistributors: Distributor[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const url = new URL(`${API_BASE_URL}/distributors/`, window.location.origin);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('page_size', '100'); // Max allowed by backend
      
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to fetch distributors');
      
      const data = await response.json();
      const results = Array.isArray(data) ? data : (data.results || []);
      
      allDistributors = [...allDistributors, ...results];
      
      // Check if there are more pages (pagination response has 'next' field)
      hasMore = !Array.isArray(data) && data.next !== null;
      page++;
    }
    
    return allDistributors;
  },
  getAll: async (): Promise<Distributor[]> => {
    const response = await fetch(`${API_BASE_URL}/distributors/`);
    if (!response.ok) throw new Error('Failed to fetch distributors');
    return response.json();
  },
  getListAll: async (): Promise<{id: number; name: string; location: string}[]> => {
    const response = await fetch(`${API_BASE_URL}/distributors/list_all/`);
    if (!response.ok) throw new Error('Failed to fetch distributors list');
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
  resetAllPoints: async (password: string): Promise<{ success: boolean; message: string }> => {
    // Extract CSRF token from cookies
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1] || '';

    const response = await fetch(`${API_BASE_URL}/dashboard/reset-all-points/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(csrfToken && { 'X-CSRFToken': csrfToken })
      },
      credentials: 'include',
      body: JSON.stringify({ password }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("Reset all points error:", response.status, error);
      throw new Error(error.message || 'Failed to reset points. Please check your password.');
    }
    return response.json();
  },
};

export interface AgentDashboardStats {
  pending_count: number;
  approved_count: number;
  processed_count: number;
  agent_points: number;
  active_distributors_count: number;
  team_name: string;
  agent_name: string;
}

export const agentDashboardApi = {
  getStats: async (): Promise<AgentDashboardStats> => {
    const response = await fetch(`${API_BASE_URL}/agent/dashboard/stats/`, {
      credentials: 'include',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("Agent dashboard stats error response:", response.status, error);
      throw new Error('Failed to fetch agent dashboard statistics');
    }
    return response.json();
  },
};