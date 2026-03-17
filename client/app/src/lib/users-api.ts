import { API_URL } from './config';

const API_BASE_URL = API_URL;

export interface Account {
  id: number;
  username: string;
  full_name: string;
  email: string;
  position: string;
  points: number;
  uses_points: boolean;
  is_activated: boolean;
  is_active?: boolean;
  is_banned: boolean;
  is_archived: boolean;
  date_archived?: string | null;
  archived_by?: number | null;
  archived_by_username?: string | null;
  can_self_request?: boolean;
}

export interface PaginatedAccountsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Account[];
}

export interface BatchUpdateResponse {
  message: string;
  updated_count: number;
  failed_count: number;
  updated_ids: number[];
  failed?: { id: number; error: string }[] | null;
}

export const usersApi = {
  getAccountsPage: async (page: number = 1, pageSize: number = 20, searchQuery: string = '', showArchived?: boolean): Promise<PaginatedAccountsResponse> => {
    const url = new URL(`${API_BASE_URL}/users/`, window.location.origin);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('page_size', pageSize.toString());
    if (searchQuery) {
      url.searchParams.append('search', searchQuery);
    }
    if (showArchived) {
      url.searchParams.append('show_archived', 'true');
    }
    const response = await fetch(url.toString(), {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch accounts');
    const data = await response.json();
    
    // Ensure we return paginated format (backend now returns standard DRF pagination)
    if (Array.isArray(data)) {
      return { count: data.length, next: null, previous: null, results: data };
    }
    return data;
  },

  batchUpdatePoints: async (updates: { id: number; points: number }[], reason?: string): Promise<BatchUpdateResponse> => {
    const response = await fetch(`${API_BASE_URL}/users/batch_update_points/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ updates, reason: reason || '' }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to batch update points');
    }
    
    return data;
  },

  getAccounts: async (searchQuery: string = ''): Promise<Account[]> => {
    const url = new URL(`${API_BASE_URL}/users/`, window.location.origin);
    if (searchQuery) {
      url.searchParams.append('search', searchQuery);
    }
    const response = await fetch(url.toString(), {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch accounts');
    const data = await response.json();
    // Handle both array and paginated response formats
    return Array.isArray(data) ? data : (data.results || []);
  },
  getAllAccounts: async (filters?: { search?: string; showArchived?: boolean; position?: string }): Promise<Account[]> => {
    // Fetch all accounts by requesting maximum page size and iterating through pages
    let allAccounts: Account[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const url = new URL(`${API_BASE_URL}/users/`, window.location.origin);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('page_size', '100'); // Max allowed by backend
      
      // Apply filters if provided
      if (filters?.search) {
        url.searchParams.append('search', filters.search);
      }
      if (filters?.showArchived !== undefined) {
        url.searchParams.append('show_archived', filters.showArchived.toString());
      }
      if (filters?.position) {
        url.searchParams.append('position', filters.position);
      }
      
      const response = await fetch(url.toString(), {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch accounts');
      
      const data = await response.json();
      const results = Array.isArray(data) ? data : (data.results || []);
      
      allAccounts = [...allAccounts, ...results];
      
      // Check if there are more pages (pagination response has 'next' field)
      hasMore = !Array.isArray(data) && data.next !== null;
      page++;
    }
    
    return allAccounts;
  },

  getHandlerUsersPage: async (page: number = 1, pageSize: number = 20, searchQuery: string = ''): Promise<PaginatedAccountsResponse> => {
    const url = new URL(`${API_BASE_URL}/users/`, window.location.origin);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('page_size', pageSize.toString());
    url.searchParams.append('position', 'Handler,Admin');
    if (searchQuery) {
      url.searchParams.append('search', searchQuery);
    }
    const response = await fetch(url.toString(), { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch handler users');
    const data = await response.json();
    if (Array.isArray(data)) {
      return { count: data.length, next: null, previous: null, results: data };
    }
    return data;
  },

  getBulkAssignHandler: async (): Promise<{ products: Array<{ id: number; item_code: string; item_name: string; legend: string; mktg_admin_id: number | null }> }> => {
    const response = await fetch(`${API_BASE_URL}/catalogue/bulk-assign-handler/`, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch bulk assign handler data');
    return response.json();
  },
};
