import { API_URL } from './config';

const API_BASE_URL = API_URL;

export interface Customer {
  id: number;
  name: string;
  brand?: string;
  sales_channel?: string;
  date_added?: string;
  created_at?: string;
  updated_at?: string;
  added_by?: number;
  added_by_name?: string;
  is_prospect?: boolean;
  is_archived: boolean;
  date_archived?: string | null;
  archived_by?: number | null;
  archived_by_username?: string | null;
}

export interface SimilarCustomersResponse {
  exact_match: Customer | null;
  similar: Customer[];
}

export interface PaginatedCustomersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Customer[];
}

export const customersApi = {
  getCustomersPage: async (page: number = 1, pageSize: number = 20, searchQuery: string = ''): Promise<PaginatedCustomersResponse> => {
    const url = new URL(`${API_BASE_URL}/customers/`, window.location.origin);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('page_size', pageSize.toString());
    if (searchQuery) {
      url.searchParams.append('search', searchQuery);
    }
    const response = await fetch(url.toString(), {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch customers');
    const data = await response.json();
    // Ensure we return paginated format
    if (Array.isArray(data)) {
      return { count: data.length, next: null, previous: null, results: data };
    }
    return data;
  },

  getCustomers: async (searchQuery: string = ''): Promise<Customer[]> => {
    const url = new URL(`${API_BASE_URL}/customers/`, window.location.origin);
    if (searchQuery) {
      url.searchParams.append('search', searchQuery);
    }
    const response = await fetch(url.toString(), {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch customers');
    const data = await response.json();
    // Handle both array and paginated response formats
    return Array.isArray(data) ? data : (data.results || []);
  },
  getAllCustomers: async (filters?: { search?: string; showArchived?: boolean }): Promise<Customer[]> => {
    // Fetch all customers by requesting maximum page size and iterating through pages
    let allCustomers: Customer[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const url = new URL(`${API_BASE_URL}/customers/`, window.location.origin);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('page_size', '100'); // Max allowed by backend
      
      // Apply filters if provided
      if (filters?.search) {
        url.searchParams.append('search', filters.search);
      }
      if (filters?.showArchived !== undefined) {
        url.searchParams.append('show_archived', filters.showArchived.toString());
      }
      
      const response = await fetch(url.toString(), {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch customers');
      
      const data = await response.json();
      const results = Array.isArray(data) ? data : (data.results || []);
      
      allCustomers = [...allCustomers, ...results];
      
      // Check if there are more pages (pagination response has 'next' field)
      hasMore = !Array.isArray(data) && data.next !== null;
      page++;
    }
    
    return allCustomers;
  },
  getAll: async (): Promise<Customer[]> => {
    const response = await fetch(`${API_BASE_URL}/customers/`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch customers');
    return response.json();
  },
  getListAll: async (): Promise<{id: number; name: string; brand: string; sales_channel: string; is_prospect: boolean}[]> => {
    const response = await fetch(`${API_BASE_URL}/customers/list_all/`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch customers list');
    return response.json();
  },
  checkSimilar: async (name: string): Promise<SimilarCustomersResponse> => {
    const url = new URL(`${API_BASE_URL}/customers/check_similar/`, window.location.origin);
    url.searchParams.append('name', name);
    const response = await fetch(url.toString(), {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to check similar customers');
    return response.json();
  },
  createProspect: async (name: string): Promise<Customer> => {
    const response = await fetch(`${API_BASE_URL}/customers/create_prospect/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error('Failed to create prospect customer');
    return response.json();
  },
  promoteCustomer: async (id: number, data: { brand: string; sales_channel: string }): Promise<{ message: string; customer: Customer }> => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}/promote/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to promote customer');
    }
    return response.json();
  },
  mergeCustomer: async (sourceId: number, targetId: number): Promise<{ message: string; customer: Customer }> => {
    const response = await fetch(`${API_BASE_URL}/customers/${sourceId}/merge/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ merge_into_id: targetId }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to merge customers');
    }
    return response.json();
  },
  create: async (data: Omit<Customer, 'id' | 'date_added'>): Promise<Customer> => {
    const response = await fetch(`${API_BASE_URL}/customers/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create customer');
    return response.json();
  },
  createCustomer: async (data: Omit<Customer, 'id' | 'date_added' | 'is_archived' | 'date_archived' | 'archived_by' | 'archived_by_username' | 'created_at' | 'updated_at' | 'added_by' | 'added_by_name'>): Promise<Customer> => {
    const response = await fetch(`${API_BASE_URL}/customers/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create customer');
    return response.json();
  },
  update: async (id: number, data: Partial<Customer>): Promise<Customer> => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update customer');
    return response.json();
  },
  updateCustomer: async (id: number, data: Partial<Customer>): Promise<Customer> => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update customer');
    return response.json();
  },
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}/`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to delete customer');
  },
  deleteCustomer: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}/`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to delete customer');
  },
};
