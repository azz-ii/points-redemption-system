const API_BASE_URL = '/api'; // Proxied to Django backend

export interface Account {
  id: number;
  username: string;
  full_name: string;
  email: string;
  position: string;
  points: number;
  is_activated: boolean;
  is_banned: boolean;
  profile_picture?: string | null;
}

export interface PaginatedAccountsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Account[];
}

export const usersApi = {
  getAccountsPage: async (page: number = 1, pageSize: number = 20, searchQuery: string = ''): Promise<PaginatedAccountsResponse> => {
    const url = new URL(`${API_BASE_URL}/users/`, window.location.origin);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('page_size', pageSize.toString());
    if (searchQuery) {
      url.searchParams.append('search', searchQuery);
    }
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Failed to fetch accounts');
    const data = await response.json();
    // Ensure we return paginated format
    if (Array.isArray(data)) {
      return { count: data.length, next: null, previous: null, results: data };
    }
    return data;
  },
  getAccounts: async (searchQuery: string = ''): Promise<Account[]> => {
    const url = new URL(`${API_BASE_URL}/users/`, window.location.origin);
    if (searchQuery) {
      url.searchParams.append('search', searchQuery);
    }
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Failed to fetch accounts');
    const data = await response.json();
    // Handle both array and paginated response formats
    return Array.isArray(data) ? data : (data.results || []);
  },
  getAllAccounts: async (): Promise<Account[]> => {
    // Fetch all accounts by requesting maximum page size and iterating through pages
    let allAccounts: Account[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const url = new URL(`${API_BASE_URL}/users/`, window.location.origin);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('page_size', '100'); // Max allowed by backend
      
      const response = await fetch(url.toString());
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
};
