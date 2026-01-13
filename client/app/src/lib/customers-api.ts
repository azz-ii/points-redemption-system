const API_BASE_URL = '/api'; // Proxied to Django backend

export interface Customer {
  id: number;
  name: string;
  contact_email?: string;
  phone?: string;
  location?: string;
  points?: number;
  date_added?: string;
  added_by?: number;
  added_by_name?: string;
}

export const customersApi = {
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
  getAll: async (): Promise<Customer[]> => {
    const response = await fetch(`${API_BASE_URL}/customers/`);
    if (!response.ok) throw new Error('Failed to fetch customers');
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
