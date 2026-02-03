import type { InventoryItem } from '@/page/superadmin/Inventory/modals/types';

const API_BASE_URL = '/api'; // Proxied to Django backend

export interface PaginatedInventoryResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: InventoryItem[];
}

export interface BulkUpdateResponse {
  message: string;
  updated_count: number;
  failed_count: number;
  total_affected: number;
  operation: string;
  stock_delta?: number;
  failed_items?: string[];
}

export interface BatchUpdateResponse {
  message: string;
  updated_count: number;
  failed_count: number;
  updated_ids: number[];
  failed?: { id: number; error: string }[] | null;
}

export const inventoryApi = {
  getInventoryPage: async (page: number = 1, pageSize: number = 20, searchQuery: string = ''): Promise<PaginatedInventoryResponse> => {
    const url = new URL(`${API_BASE_URL}/inventory/`, window.location.origin);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('page_size', pageSize.toString());
    if (searchQuery) {
      url.searchParams.append('search', searchQuery);
    }
    const response = await fetch(url.toString(), {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch inventory items');
    const data = await response.json();
    // Ensure we return paginated format
    if (Array.isArray(data)) {
      return { count: data.length, next: null, previous: null, results: data };
    }
    return data;
  },

  batchUpdateStock: async (updates: { id: number; stock: number }[]): Promise<BatchUpdateResponse> => {
    const response = await fetch(`${API_BASE_URL}/inventory/batch_update_stock/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ updates }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to batch update stock');
    }
    
    return data;
  },

  bulkUpdateStock: async (stockDelta: number, password: string): Promise<BulkUpdateResponse> => {
    const response = await fetch(`${API_BASE_URL}/inventory/bulk_update_stock/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        stock_delta: stockDelta,
        password: password,
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update stock');
    }
    
    return data;
  },

  resetAllStock: async (password: string): Promise<BulkUpdateResponse> => {
    const response = await fetch(`${API_BASE_URL}/inventory/bulk_update_stock/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        reset_to_zero: true,
        password: password,
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to reset stock');
    }
    
    return data;
  },
};
