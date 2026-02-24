import { API_URL } from './config';

const API_BASE_URL = API_URL;

export interface Product {
  id: number;
  item_code: string;
  item_name: string;
  description: string;
  purpose: string;
  specifications: string;
  legend: string;
  category: string;
  points: string;
  price: string;
  pricing_type: string;
  min_order_qty: number;
  max_order_qty: number | null;
  has_stock: boolean;
  stock: number;
  committed_stock: number;
  available_stock: number;
  image: string | null;
  is_archived: boolean;
  date_added: string;
  added_by: number | null;
  date_archived: string | null;
  archived_by: number | null;
  requires_sales_approval?: boolean;
}

export interface PaginatedProductsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

export const catalogueApi = {
  getProductsPage: async (page: number = 1, pageSize: number = 20, searchQuery: string = ''): Promise<PaginatedProductsResponse> => {
    const url = new URL(`${API_BASE_URL}/catalogue/`, window.location.origin);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('page_size', pageSize.toString());
    if (searchQuery) {
      url.searchParams.append('search', searchQuery);
    }
    const response = await fetch(url.toString(), {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch products');
    const data = await response.json();
    
    // Ensure we return paginated format
    if (Array.isArray(data)) {
      return { count: data.length, next: null, previous: null, results: data };
    }
    return data;
  },

  getAllProducts: async (filters?: { search?: string; showArchived?: boolean }): Promise<Product[]> => {
    // Fetch all products by requesting maximum page size and iterating through pages
    let allProducts: Product[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const url = new URL(`${API_BASE_URL}/catalogue/`, window.location.origin);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('page_size', '100'); // Max recommended for performance
      
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
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const data = await response.json();
      const results = Array.isArray(data) ? data : (data.results || []);
      
      allProducts = [...allProducts, ...results];
      
      // Check if there are more pages (pagination response has 'next' field)
      hasMore = !Array.isArray(data) && data.next !== null;
      page++;
    }
    
    return allProducts;
  },
};
