const API_BASE_URL = '/api'; // Proxied to Django backend

export interface Customer {
  id: number;
  name: string;
  contact_email?: string;
  phone?: string;
  location?: string;
  points?: number;
  date_added?: string;
  created_at?: string;
  updated_at?: string;
  added_by?: number;
  added_by_name?: string;
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
    const response = await fetch(url.toString());
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
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Failed to fetch customers');
    const data = await response.json();
    // Handle both array and paginated response formats
    return Array.isArray(data) ? data : (data.results || []);
  },
  getAllCustomers: async (): Promise<Customer[]> => {
    // Fetch all customers by requesting maximum page size and iterating through pages
    let allCustomers: Customer[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const url = new URL(`${API_BASE_URL}/customers/`, window.location.origin);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('page_size', '100'); // Max allowed by backend
      
      const response = await fetch(url.toString());
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
    const response = await fetch(`${API_BASE_URL}/customers/`);
    if (!response.ok) throw new Error('Failed to fetch customers');
    return response.json();
  },
  getListAll: async (): Promise<{id: number; name: string; location: string}[]> => {
    const response = await fetch(`${API_BASE_URL}/customers/list_all/`);
    if (!response.ok) throw new Error('Failed to fetch customers list');
    return response.json();
  },
  create: async (data: Omit<Customer, 'id' | 'date_added'>): Promise<Customer> => {
    const response = await fetch(`${API_BASE_URL}/customers/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create customer');
    return response.json();
  },
  createCustomer: async (data: Omit<Customer, 'id' | 'date_added'>): Promise<Customer> => {
    const response = await fetch(`${API_BASE_URL}/customers/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create customer');
    return response.json();
  },
  update: async (id: number, data: Partial<Customer>): Promise<Customer> => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update customer');
    return response.json();
  },
  updateCustomer: async (id: number, data: Partial<Customer>): Promise<Customer> => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update customer');
    return response.json();
  },
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete customer');
  },
  deleteCustomer: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete customer');
  },
};
