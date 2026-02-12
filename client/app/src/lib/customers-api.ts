import { API_URL } from './config';

const API_BASE_URL = API_URL;

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
  is_archived: boolean;
  date_archived?: string | null;
  archived_by?: number | null;
  archived_by_username?: string | null;
}

export interface PaginatedCustomersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Customer[];
}

export interface BatchUpdateResponse {
  message: string;
  updated_count: number;
  failed_count: number;
  updated_ids: number[];
  failed?: { id: number; error: string }[] | null;
}

export interface ChunkedUpdateProgress {
  currentChunk: number;
  totalChunks: number;
  processedRecords: number;
  totalRecords: number;
  successCount: number;
  failedCount: number;
}

export interface ChunkedUpdateResult {
  success: boolean;
  totalUpdated: number;
  totalFailed: number;
  allUpdatedIds: number[];
  allFailed: { id: number; error: string }[];
  partialSuccess: boolean;
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

  batchUpdatePoints: async (updates: { id: number; points: number }[], reason?: string): Promise<BatchUpdateResponse> => {
    const response = await fetch(`${API_BASE_URL}/customers/batch_update_points/`, {
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

  batchUpdatePointsChunked: async (
    updates: { id: number; points: number }[],
    onProgress?: (progress: ChunkedUpdateProgress) => void,
    chunkSize: number = 150,
    reason?: string
  ): Promise<ChunkedUpdateResult> => {
    // Split updates into chunks
    const chunks: { id: number; points: number }[][] = [];
    for (let i = 0; i < updates.length; i += chunkSize) {
      chunks.push(updates.slice(i, i + chunkSize));
    }

    const totalChunks = chunks.length;
    let totalUpdated = 0;
    let totalFailed = 0;
    const allUpdatedIds: number[] = [];
    const allFailed: { id: number; error: string }[] = [];

    // Process each chunk sequentially with retry logic
    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
      const chunk = chunks[chunkIndex];
      let retryCount = 0;
      const maxRetries = 1;
      let chunkSuccess = false;

      while (!chunkSuccess && retryCount <= maxRetries) {
        try {
          const result = await customersApi.batchUpdatePoints(chunk, reason);
          
          totalUpdated += result.updated_count;
          totalFailed += result.failed_count;
          allUpdatedIds.push(...result.updated_ids);
          if (result.failed) {
            allFailed.push(...result.failed);
          }

          chunkSuccess = true;

          // Report progress
          if (onProgress) {
            onProgress({
              currentChunk: chunkIndex + 1,
              totalChunks,
              processedRecords: (chunkIndex + 1) * chunkSize,
              totalRecords: updates.length,
              successCount: totalUpdated,
              failedCount: totalFailed,
            });
          }
        } catch (error) {
          retryCount++;
          if (retryCount > maxRetries) {
            // Mark all items in this chunk as failed
            chunk.forEach(item => {
              allFailed.push({
                id: item.id,
                error: `Chunk ${chunkIndex + 1} failed after ${maxRetries} retries: ${error instanceof Error ? error.message : 'Unknown error'}`
              });
            });
            totalFailed += chunk.length;

            // Report progress even on failure
            if (onProgress) {
              onProgress({
                currentChunk: chunkIndex + 1,
                totalChunks,
                processedRecords: (chunkIndex + 1) * chunkSize,
                totalRecords: updates.length,
                successCount: totalUpdated,
                failedCount: totalFailed,
              });
            }
            
            chunkSuccess = true; // Exit retry loop and continue with next chunk
          } else {
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }
      }
    }

    return {
      success: totalFailed === 0,
      totalUpdated,
      totalFailed,
      allUpdatedIds,
      allFailed,
      partialSuccess: totalUpdated > 0 && totalFailed > 0,
    };
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
  getAllCustomers: async (): Promise<Customer[]> => {
    // Fetch all customers by requesting maximum page size and iterating through pages
    let allCustomers: Customer[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const url = new URL(`${API_BASE_URL}/customers/`, window.location.origin);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('page_size', '100'); // Max allowed by backend
      
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
  getListAll: async (): Promise<{id: number; name: string; location: string}[]> => {
    const response = await fetch(`${API_BASE_URL}/customers/list_all/`, {
      credentials: 'include',
    });
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
  createCustomer: async (data: Omit<Customer, 'id' | 'date_added' | 'is_archived' | 'date_archived' | 'archived_by' | 'archived_by_username' | 'created_at' | 'updated_at' | 'added_by' | 'added_by_name'>): Promise<Customer> => {
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
