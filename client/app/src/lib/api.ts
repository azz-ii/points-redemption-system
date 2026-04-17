// API Configuration and Service Layer
// Import API URL from central configuration
import { API_URL } from './config';

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}



const API_BASE_URL = API_URL;

// Backend API Response Types
export type LegendType = 'Collateral' | 'Giveaway' | 'Asset' | 'Benefit';

export interface Product {
  id: number;
  item_code: string;
  item_name: string;
  description: string;
  purpose: string;
  specifications: string;
  legend: LegendType;
  category: string;
  points: string;
  price: string;
  pricing_formula?: 'NONE' | 'DRIVER_MULTIPLIER' | 'AREA_RATE' | 'PER_SQFT' | 'PER_INVOICE' | 'PER_DAY' | null;
  min_order_qty: number;
  max_order_qty: number | null;
  has_stock: boolean;
  stock: number;
  committed_stock: number;
  available_stock: number;
  image?: string | null;
  mktg_admin?: number | null;
  requires_sales_approval?: boolean;
  is_archived: boolean;
  date_added: string;
  added_by: number | null;
  date_archived: string | null;
  archived_by: number | null;
  request_count?: number;
}

// Backward compatibility aliases
export type CatalogueItem = Product;
export type Variant = Product;

export interface ProductsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

// Backward compatibility alias
export type CatalogueItemsResponse = ProductsResponse;

// Frontend Display Types
export interface RedeemItemData {
  id: string;
  name: string;
  points: number; // For FIXED items: per-unit points. For dynamic: the multiplier
  category: string;
  pricing_formula?: 'NONE' | 'DRIVER_MULTIPLIER' | 'AREA_RATE' | 'PER_SQFT' | 'PER_INVOICE' | 'PER_DAY' | null;
  has_stock: boolean; // Whether item tracks inventory or is made-to-order
  available_stock: number; // Available stock (stock - committed)
  min_order_qty: number; // Minimum quantity per order
  max_order_qty: number | null; // Maximum quantity per order (null = unlimited)
  request_count: number; // Number of approved requests containing this item
  
  // Rich item details for view modal
  description?: string;
  purpose?: string;
  specifications?: string;
  item_code?: string;
  legend?: string;

  // Additional fields for cart functionality
  image?: string;
  needs_driver?: boolean;
  points_multiplier?: number | null;
  extra_fields?: any[];
}

export interface UserProfile {
  id: number;
  username: string;
  full_name: string;
  email: string;
  position: string;
  is_activated: boolean;
  is_banned: boolean;
  is_archived: boolean;
  uses_points: boolean;
  points: number;
  can_self_request?: boolean;
  team_id?: number | null;
  team_name?: string | null;
  approver_teams?: Array<{ id: number; name: string }>;
  profile: {
    uses_points: boolean;
    points: number;
    can_self_request?: boolean;
  };
}

// Map backend legend to frontend category (values are already title-case; map is identity)
const legendToCategoryMap: Record<string, string> = {
  Collateral: "Collateral",
  Giveaway: "Giveaway",
  Asset: "Asset",
  Benefit: "Benefit",
};

// Transform backend product data to frontend format
export function transformProductToRedeemItem(product: Product): RedeemItemData {
  console.log("[API] Transforming product:", product);
  console.log("[API] Product image field:", product.image);
  
  // Parse points - handle both numeric and formula strings
  let pointsValue = 0;
  try {
    // Try to parse as number first
    const parsed = parseFloat(product.points);
    if (!isNaN(parsed)) {
      pointsValue = parsed;
    } else {
      console.warn(`[API] Could not parse points value: ${product.points}`);
      pointsValue = 0;
    }
  } catch (error) {
    console.error("[API] Error parsing points:", error);
    pointsValue = 0;
  }

  // Get category from legend
  const category = legendToCategoryMap[product.legend] || product.legend;

  const transformed: RedeemItemData = {
    id: product.id.toString(),
    name: product.item_name,
    points: pointsValue,
    category: category,
    pricing_formula: product.pricing_formula,
    has_stock: product.has_stock ?? true,
    available_stock: product.available_stock || 0,
    min_order_qty: product.min_order_qty ?? 1,
    max_order_qty: product.max_order_qty ?? null,
    request_count: product.request_count ?? 0,
    description: product.description,
    purpose: product.purpose,
    specifications: product.specifications,
    item_code: product.item_code,
    legend: product.legend,
    image: product.image || undefined,
  };

  console.log("[API] Transformed item:", transformed);
  console.log("[API] Transformed item image:", transformed.image);
  return transformed;
}

// Backward compatibility alias
export const transformVariantToRedeemItem = transformProductToRedeemItem;

// Fetch catalogue items (products) from backend
export async function fetchCatalogueItems(): Promise<RedeemItemData[]> {
  console.log("[API] Fetching products from:", `${API_BASE_URL}/catalogue/`);
  
  try {
    // Fetch all items with a large page_size to get everything at once
    const response = await fetch(`${API_BASE_URL}/catalogue/?page_size=1000&ordering=popularity`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies for session authentication
    });

    console.log("[API] Response status:", response.status);
    console.log("[API] Response ok:", response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[API] Error response:", errorText);
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
    }

    const data: ProductsResponse = await response.json();
    console.log("[API] Received data:", data);
    console.log("[API] Number of items:", data.results?.length || 0);

    if (!data.results || !Array.isArray(data.results)) {
      console.error("[API] Invalid response format - results not found or not an array");
      throw new Error("Invalid response format from server");
    }

    // Filter out archived items
    const activeItems = data.results.filter(product => !product.is_archived);
    console.log("[API] Active (non-archived) items:", activeItems.length);

    // Transform to frontend format
    const transformedItems = activeItems.map(transformProductToRedeemItem);
    console.log("[API] Transformed items:", transformedItems);

    // Log image diagnostics
    const withImage = transformedItems.filter(i => i.image);
    const withoutImage = transformedItems.filter(i => !i.image);
    console.log(`[API] Image summary: ${withImage.length} with image, ${withoutImage.length} without`);
    if (withoutImage.length > 0) {
      console.warn("[API] Items missing images:", withoutImage.map(i => `${i.name} (id=${i.id})`));
    }

    return transformedItems;
  } catch (error) {
    console.error("[API] Error fetching products:", error);
    if (error instanceof Error) {
      console.error("[API] Error message:", error.message);
      console.error("[API] Error stack:", error.stack);
    }
    throw error;
  }
}

// Fetch current user profile
export async function fetchCurrentUser(): Promise<UserProfile> {
  console.log("[API] Fetching current user profile from:", `${API_BASE_URL}/users/me/`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/users/me/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies for session authentication
    });

    console.log("[API] User profile response status:", response.status);
    console.log("[API] User profile response ok:", response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[API] Error response:", errorText);
      throw new Error(`Failed to fetch user profile: ${response.status} ${response.statusText}`);
    }

    const userData: UserProfile = await response.json();
    console.log("[API] Received user profile:", userData);
    console.log("[API] User points:", userData.points || userData.profile?.points);

    return userData;
  } catch (error) {
    console.error("[API] Error fetching current user:", error);
    if (error instanceof Error) {
      console.error("[API] Error message:", error.message);
      console.error("[API] Error stack:", error.stack);
    }
    throw error;
  }
}

// ============================================
// Redemption Requests API
// ============================================

// Helper function to get CSRF token
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// Helper to get headers with CSRF token
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const csrfToken = getCookie('csrftoken');
  if (csrfToken) {
    headers['X-CSRFToken'] = csrfToken;
  }
  
  return headers;
}

export interface RedemptionRequestItem {
  product_id: string;
  quantity?: number;
  extra_data?: Record<string, any>;
}

// Backward compatibility - some older code may still use variant_id
export interface LegacyRedemptionRequestItem {
  product_id: string; // Now uses product_id
  quantity?: number;
  extra_data?: Record<string, any>;
}

export type RequestedForType = 'DISTRIBUTOR' | 'CUSTOMER' | 'SELF';

export interface CreateRedemptionRequestData {
  requested_for?: number; // Distributor ID (optional when type is CUSTOMER or SELF)
  requested_for_customer?: number; // Customer ID (optional when type is DISTRIBUTOR or SELF)
  requested_for_type: RequestedForType;
  points_deducted_from: 'SELF' | 'DISTRIBUTOR';
  remarks?: string;
  items: RedemptionRequestItem[];
  // Service Vehicle Use fields (optional)
  svc_date?: string; // ISO date string (YYYY-MM-DD)
  svc_time?: string; // Time string (HH:MM)
  svc_driver?: 'WITH_DRIVER' | 'WITHOUT_DRIVER';
}

export interface RedemptionRequestResponse {
  id: number;
  requested_by: number;
  requested_by_name: string;
  requested_by_username: string;
  requested_for: number | null;
  requested_for_name: string;
  requested_for_customer: number | null;
  requested_for_customer_name: string | null;
  requested_for_type: RequestedForType;
  team: number | null;
  team_name: string | null;
  points_deducted_from: 'SELF' | 'DISTRIBUTOR';
  points_deducted_from_display: string;
  total_points: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  status_display: string;
  processing_status: 'NOT_PROCESSED' | 'PROCESSED' | 'CANCELLED';
  processing_status_display: string;
  date_requested: string;
  reviewed_by: number | null;
  reviewed_by_name: string | null;
  date_reviewed: string | null;
  processed_by: number | null;
  processed_by_name: string | null;
  date_processed: string | null;
  remarks: string | null;
  initial_remarks?: string | null;
  approver_remarks?: string | null;
  processing_remarks?: string | null;
  rejection_reason: string | null;
  // Service Vehicle Use fields
  svc_date: string | null;
  svc_time: string | null;
  svc_driver: string | null;
  items: Array<{
    id: number;
    product: number;
    product_name: string;
    product_code: string;
    category: string | null;
    quantity: number;
    points_per_item: number;
    total_points: number;
    // Fulfillment tracking (present on detail/processing endpoints)
    fulfilled_quantity?: number;
    remaining_quantity?: number | null;
    is_fully_fulfilled?: boolean;
    fulfillment_logs?: Array<{ id: number; fulfilled_quantity: number; fulfilled_by: number | null; fulfilled_by_name: string | null; fulfilled_at: string; notes?: string | null }>;
    item_processed_by?: number | null;
    item_processed_by_name?: string | null;
    item_processed_at?: string | null;
    pricing_formula?: string | null;
  }>;
  // Acknowledgement Receipt fields
  ar_status: string | null;
  ar_status_display: string | null;
  acknowledgement_receipt: string | null;
  ar_uploaded_by: number | null;
  ar_uploaded_by_name: string | null;
  ar_uploaded_at: string | null;
  // Processing photos
  processing_photos?: Array<{
    id: number;
    photo: string;
    uploaded_by: number | null;
    uploaded_by_name: string | null;
    uploaded_at: string;
    caption: string | null;
  }>;
}

export const redemptionRequestsApi = {
  async createRequest(data: CreateRedemptionRequestData): Promise<RedemptionRequestResponse> {
    console.log('[Redemption API] Creating request:', data);
    
    const response = await fetch(`${API_BASE_URL}/redemption-requests/`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Redemption API] Error creating request:', errorData);
      throw new Error(errorData.detail || errorData.error || 'Failed to create redemption request');
    }

    const result = await response.json();
    console.log('[Redemption API] Request created successfully:', result);
    return result;
  },

  async getRequests(params?: { notProcessed?: boolean; processed?: boolean }): Promise<RedemptionRequestResponse[]> {
    const url = new URL(`${API_BASE_URL}/redemption-requests/`, window.location.origin);
    if (params?.notProcessed) url.searchParams.set('not_processed', '1');
    else if (params?.processed) url.searchParams.set('processed', '1');
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch redemption requests');
    }

    return response.json();
  },

  async getRequest(id: number): Promise<RedemptionRequestResponse> {
    const response = await fetch(`${API_BASE_URL}/redemption-requests/${id}/`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch redemption request');
    }

    return response.json();
  },

  async approveRequest(id: number, remarks?: string): Promise<RedemptionRequestResponse> {
    const response = await fetch(`${API_BASE_URL}/redemption-requests/${id}/approve/`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ remarks }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to approve request');
    }

    return response.json();
  },

  async rejectRequest(id: number, rejection_reason: string, remarks?: string): Promise<RedemptionRequestResponse> {
    const response = await fetch(`${API_BASE_URL}/redemption-requests/${id}/reject/`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ rejection_reason, remarks }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to reject request');
    }

    return response.json();
  },

  async markAsProcessed(id: number, remarks?: string): Promise<RedemptionRequestResponse> {
    const response = await fetch(`${API_BASE_URL}/redemption-requests/${id}/mark_as_processed/`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ remarks }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to mark request as processed');
    }

    return response.json();
  },

  async cancelRequest(id: number, cancellation_reason: string): Promise<RedemptionRequestResponse> {
    const response = await fetch(`${API_BASE_URL}/redemption-requests/${id}/cancel_request/`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ cancellation_reason }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to cancel request');
    }

    return response.json();
  },

  async uploadAcknowledgementReceipt(id: number, file: File): Promise<RedemptionRequestResponse> {
    const formData = new FormData();
    formData.append('acknowledgement_receipt', file);

    const csrfToken = getCookie('csrftoken');
    const headers: HeadersInit = {};
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }

    const response = await fetch(`${API_BASE_URL}/redemption-requests/${id}/upload_acknowledgement_receipt/`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to upload acknowledgement receipt');
    }

    return response.json();
  },
};

// ============================================
// Handler Requests API (for Handler users)
// ============================================

export interface HandlerProcessingStatusItem {
  id: number;
  product: number;
  product_name: string;
  product_code: string;
  product_legend?: string;
  quantity: number;
  points_per_item: number;
  total_points: number;
  fulfilled_quantity: number;
  remaining_quantity: number | null;
  is_fully_fulfilled: boolean;
  item_processed_by?: number | null;
  item_processed_by_name?: string | null;
  item_processed_at?: string | null;
}

export interface HandlerProcessingStatus {
  request_id: number;
  total_assigned_items: number;
  pending_items: number;
  processed_items: number;
  all_my_items_processed: boolean;
  overall_processing_complete: boolean;
  items: HandlerProcessingStatusItem[];
}

export interface MarkItemsProcessedResponse {
  message: string;
  partially_processed_count: number;
  fully_processed_count: number;
  remaining_count: number;
  all_processing_complete: boolean;
  request: RedemptionRequestResponse;
}

export interface ProcessItemData {
  item_id: number;
  fulfilled_quantity?: number;
  notes?: string;
}

export const handlerRequestsApi = {
  /**
   * Get all redemption requests that have items assigned to the current handler user.
   * Backend filters to show only APPROVED requests with items this user is assigned to.
   */
  async getRequests(): Promise<RedemptionRequestResponse[]> {
    const response = await fetch(`${API_BASE_URL}/redemption-requests/`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch requests');
    }

    return response.json();
  },

  /**
   * Get the current user's processing status for a specific request.
   * Shows which items are assigned to them and their processed status.
   */
  async getMyProcessingStatus(requestId: number): Promise<HandlerProcessingStatus> {
    const response = await fetch(`${API_BASE_URL}/redemption-requests/${requestId}/my_processing_status/`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch processing status');
    }

    return response.json();
  },

  /**
   * Mark specific items as processed (partial or full fulfillment).
   * Each item entry specifies which item, how many units to fulfill, and optional notes.
   */
  async markItemsProcessed(requestId: number, items: ProcessItemData[]): Promise<MarkItemsProcessedResponse> {
    const response = await fetch(`${API_BASE_URL}/redemption-requests/${requestId}/mark_items_processed/`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to mark items as processed');
    }

    return response.json();
  },

  /**
   * Upload a processing photo (handover proof) for a request.
   * Can be called by Handler or Admin users during item processing.
   */
  async uploadProcessingPhoto(requestId: number, file: File, caption?: string): Promise<RedemptionRequestResponse> {
    const formData = new FormData();
    formData.append('photo', file);
    if (caption) {
      formData.append('caption', caption);
    }

    const csrfToken = getCookie('csrftoken');
    const headers: HeadersInit = {};
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }

    const response = await fetch(`${API_BASE_URL}/redemption-requests/${requestId}/upload_processing_photo/`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to upload processing photo');
    }

    return response.json();
  },

  /**
   * Cancel a redemption request. Refunds points and restores stock.
   */
  async cancelRequest(requestId: number, cancellation_reason: string, remarks?: string): Promise<RedemptionRequestResponse> {
    const response = await fetch(`${API_BASE_URL}/redemption-requests/${requestId}/cancel_request/`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ cancellation_reason, ...(remarks ? { remarks } : {}) }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to cancel request');
    }

    return response.json();
  },

  /**
   * Get the handler user's history of processed requests.
   * Shows all requests where the current user has processed items.
   */
  async getHistory(): Promise<RedemptionRequestResponse[]> {
    const response = await fetch(`${API_BASE_URL}/redemption-requests/handler-history/`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch handler history');
    }

    return response.json();
  },
};

// Request History API - Admin only, shows all processed requests
export const requestHistoryApi = {
  /**
   * Get all processed redemption requests (Admin only).
   * Returns all requests with processing_status='PROCESSED' regardless of assignment.
   */
  async getProcessedRequests(params?: {
    page?: number;
    page_size?: number;
    search?: string;
    ordering?: string;
  }): Promise<PaginatedResponse<RedemptionRequestResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.ordering) queryParams.append('ordering', params.ordering);

    const qs = queryParams.toString();
    const url = `${API_BASE_URL}/redemption-requests/history/${qs ? '?' + qs : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch processed requests');
    }

    return response.json();
  },
};

// ============================================
// Cart Persistence API
// ============================================

export interface BackendCartItem {
  product_id: string;
  quantity: number;
  needs_driver?: boolean;
  extra_data?: Record<string, any>;
}

/**
 * Fetch the current user's saved cart from the server.
 * Returns raw backend items; callers should cross-reference against the live
 * catalogue to resolve full CartItem fields and drop any archived products.
 */
export async function getCart(): Promise<BackendCartItem[]> {
  const response = await fetch(`${API_BASE_URL}/cart/`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch cart: ${response.status}`);
  }

  const data = await response.json();
  return (data.items ?? []) as BackendCartItem[];
}

/**
 * Fully replace the server-side cart with the given items.
 * Call this (debounced) on every cart mutation.
 */
export async function saveCart(items: import('@/components/cart-modal').CartItem[]): Promise<void> {
  const payload: BackendCartItem[] = items.map(item => ({
    product_id: item.id,
    quantity: item.quantity,
    needs_driver: item.needs_driver ?? false,
    extra_data: item.extra_data,
  }));

  const response = await fetch(`${API_BASE_URL}/cart/`, {
    method: 'PUT',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify({ items: payload }),
  });

  if (!response.ok) {
    throw new Error(`Failed to save cart: ${response.status}`);
  }
}

/**
 * Clear the server-side cart. Call after a redemption request is successfully submitted.
 */
export async function clearCartBackend(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/cart/`, {
    method: 'DELETE',
    headers: getHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to clear cart: ${response.status}`);
  }
}

