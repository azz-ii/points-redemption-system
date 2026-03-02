import type { InventoryItem } from '@/page/superadmin/Inventory/modals/types';
import { API_URL as API_BASE_URL } from './config';

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

  batchUpdateStock: async (updates: { id: number; adjustment: number; reason: string }[]): Promise<BatchUpdateResponse> => {
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

  bulkUpdateStock: async (stockDelta: number, password: string, reason: string = ''): Promise<BulkUpdateResponse> => {
    const response = await fetch(`${API_BASE_URL}/inventory/bulk_update_stock/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        stock_delta: stockDelta,
        password: password,
        reason: reason,
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update stock');
    }
    
    return data;
  },

  resetAllStock: async (password: string, reason: string = ''): Promise<BulkUpdateResponse> => {
    const response = await fetch(`${API_BASE_URL}/inventory/bulk_update_stock/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        reset_to_zero: true,
        password: password,
        reason: reason,
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to reset stock');
    }
    
    return data;
  },

  getAllInventory: async (filters?: { search?: string; status?: string }): Promise<InventoryItem[]> => {
    // Fetch all inventory items by requesting maximum page size and iterating through pages
    let allItems: InventoryItem[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const url = new URL(`${API_BASE_URL}/inventory/`, window.location.origin);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('page_size', '100'); // Use 100 for efficiency
      
      // Apply filters if provided
      if (filters?.search) {
        url.searchParams.append('search', filters.search);
      }
      if (filters?.status) {
        url.searchParams.append('status', filters.status);
      }
      
      const response = await fetch(url.toString(), {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch inventory items');
      
      const data = await response.json();
      const results = Array.isArray(data) ? data : (data.results || []);
      
      allItems = [...allItems, ...results];
      
      // Check if there are more pages (pagination response has 'next' field)
      hasMore = !Array.isArray(data) && data.next !== null;
      page++;
    }
    
    return allItems;
  },
};

export interface StockAuditLog {
  id: number;
  product: number;
  product_name: string;
  previous_stock: number;
  new_stock: number;
  stock_delta: number;
  adjustment_type: 'ADD' | 'DECREASE' | 'BULK_ADD' | 'BULK_DECREASE' | 'BULK_RESET';
  reason: string;
  changed_by_username: string;
  batch_id: string | null;
  created_at: string;
}

export interface StockAuditLogResponse {
  count: number;
  page: number;
  page_size: number;
  results: StockAuditLog[];
}

export const stockAuditApi = {
  getStockHistory: async (
    productId: number,
    page: number = 1,
    pageSize: number = 15,
  ): Promise<StockAuditLogResponse> => {
    const url = new URL(`${API_BASE_URL}/inventory/${productId}/stock-audit/`, window.location.origin);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('page_size', pageSize.toString());
    const response = await fetch(url.toString(), { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch stock history');
    return response.json();
  },
};
