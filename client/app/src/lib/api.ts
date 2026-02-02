// API Configuration and Service Layer
// Use relative URLs to match the login flow (cookies are set for the same origin)
const API_BASE_URL = "/api";

// Backend API Response Types
export type PricingType = 'FIXED' | 'PER_SQFT' | 'PER_INVOICE' | 'PER_DAY' | 'PER_EU_SRP';
export type LegendType = 'GIVEAWAY' | 'MERCH' | 'PROMO' | 'AD_MATERIALS' | 'POINT_OF_SALE' | 'OTHERS';

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
  pricing_type: PricingType;
  min_order_qty: number;
  max_order_qty: number | null;
  has_stock: boolean;
  stock: number;
  committed_stock: number;
  available_stock: number;
  is_archived: boolean;
  date_added: string;
  added_by: number | null;
  date_archived: string | null;
  archived_by: number | null;
}

// Backward compatibility aliases
export type CatalogueItem = Product;
export type Variant = Product;

export const PRICING_TYPE_LABELS: Record<PricingType, string> = {
  FIXED: 'Fixed',
  PER_SQFT: 'Per Sq Ft',
  PER_INVOICE: 'Per Invoice Amount',
  PER_DAY: 'Per Day',
  PER_EU_SRP: 'Per EU SRP',
};

export const DYNAMIC_QUANTITY_LABELS: Record<PricingType, string> = {
  FIXED: 'Quantity',
  PER_SQFT: 'Total Square Footage',
  PER_INVOICE: 'Invoice Amount',
  PER_DAY: 'Number of Days',
  PER_EU_SRP: 'End User SRP Amount',
};

export const PRICING_TYPE_DESCRIPTIONS: Record<PricingType, string> = {
  FIXED: 'Standard fixed-price item. Points are calculated per unit.',
  PER_SQFT: 'Points calculated based on total square footage. Enter the area measurement to calculate total points.',
  PER_INVOICE: 'Points calculated as a percentage of the invoice amount. Enter the invoice total (in currency) to calculate points.',
  PER_DAY: 'Points calculated per day. Enter the number of days to calculate total points.',
  PER_EU_SRP: 'Points calculated as a percentage of End User Suggested Retail Price (EU SRP). Enter the SRP amount to calculate points.',
};

export const PRICING_TYPE_INPUT_HINTS: Record<PricingType, string> = {
  FIXED: '',
  PER_SQFT: 'sq ft',
  PER_INVOICE: 'USD',
  PER_DAY: 'days',
  PER_EU_SRP: 'USD',
};

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
  pricing_type: PricingType;
  has_stock: boolean; // Whether item tracks inventory or is made-to-order
  available_stock: number; // Available stock (stock - committed)
  min_order_qty: number; // Minimum quantity per order
  max_order_qty: number | null; // Maximum quantity per order (null = unlimited)
  // Additional fields for cart functionality
  image?: string;
  needs_driver?: boolean;
  points_multiplier?: number | null;
}

export interface UserProfile {
  id: number;
  username: string;
  full_name: string;
  email: string;
  position: string;
  is_activated: boolean;
  is_banned: boolean;
  uses_points: boolean;
  points: number;
  profile: {
    uses_points: boolean;
    points: number;
  };
}

// Map backend legend to frontend category
const legendToCategoryMap: Record<string, string> = {
  GIVEAWAY: "Giveaway",
  MERCH: "Merch",
  PROMO: "Promo",
  AD_MATERIALS: "Ad Materials",
  POINT_OF_SALE: "Point of Sale",
  OTHERS: "Others",
};

// Transform backend product data to frontend format
export function transformProductToRedeemItem(product: Product): RedeemItemData {
  console.log("[API] Transforming product:", product);
  
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

  // Parse pricing type
  const pricingType: PricingType = (product.pricing_type as PricingType) || 'FIXED';

  const transformed: RedeemItemData = {
    id: product.id.toString(),
    name: product.item_name,
    points: pointsValue,
    category: category,
    pricing_type: pricingType,
    has_stock: product.has_stock ?? true,
    available_stock: product.available_stock || 0,
    min_order_qty: product.min_order_qty ?? 1,
    max_order_qty: product.max_order_qty ?? null,
  };

  console.log("[API] Transformed item:", transformed);
  return transformed;
}

// Backward compatibility alias
export const transformVariantToRedeemItem = transformProductToRedeemItem;

// Fetch catalogue items (products) from backend
export async function fetchCatalogueItems(): Promise<RedeemItemData[]> {
  console.log("[API] Fetching products from:", `${API_BASE_URL}/catalogue/`);
  
  try {
    // Fetch all items with a large page_size to get everything at once
    const response = await fetch(`${API_BASE_URL}/catalogue/?page_size=1000`, {
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
  quantity?: number; // For FIXED pricing items
  dynamic_quantity?: number; // For dynamic pricing items (PER_SQFT, etc.)
}

// Backward compatibility - some older code may still use variant_id
export interface LegacyRedemptionRequestItem {
  product_id: string; // Now uses product_id
  quantity?: number;
  dynamic_quantity?: number;
}

export type RequestedForType = 'DISTRIBUTOR' | 'CUSTOMER';

export interface CreateRedemptionRequestData {
  requested_for?: number; // Distributor ID (optional when type is CUSTOMER)
  requested_for_customer?: number; // Customer ID (optional when type is DISTRIBUTOR)
  requested_for_type: RequestedForType;
  points_deducted_from: 'SELF' | 'DISTRIBUTOR' | 'CUSTOMER';
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
  requested_for: number | null;
  requested_for_name: string;
  requested_for_customer: number | null;
  requested_for_customer_name: string | null;
  requested_for_type: RequestedForType;
  team: number | null;
  team_name: string | null;
  points_deducted_from: string;
  points_deducted_from_display: string;
  total_points: number;
  status: string;
  status_display: string;
  processing_status: string;
  processing_status_display: string;
  date_requested: string;
  reviewed_by: number | null;
  reviewed_by_name: string | null;
  date_reviewed: string | null;
  processed_by: number | null;
  processed_by_name: string | null;
  date_processed: string | null;
  remarks: string | null;
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
    category?: string | null;
    quantity: number;
    points_per_item: number;
    total_points: number;
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

  async getRequests(): Promise<RedemptionRequestResponse[]> {
    const response = await fetch(`${API_BASE_URL}/redemption-requests/`, {
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

  async cancelRequest(id: number, cancellation_reason: string, remarks?: string): Promise<RedemptionRequestResponse> {
    const response = await fetch(`${API_BASE_URL}/redemption-requests/${id}/cancel_request/`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ cancellation_reason, remarks }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to cancel request');
    }

    return response.json();
  },
};

// ============================================
// Marketing Requests API (for Marketing users)
// ============================================

export interface MarketingProcessingStatusItem {
  id: number;
  product: number;
  product_name: string;
  product_code: string;
  product_legend?: string;
  quantity: number;
  points_per_item: number;
  total_points: number;
  item_processed_by?: number | null;
  item_processed_by_name?: string | null;
  item_processed_at?: string | null;
}

export interface MarketingProcessingStatus {
  request_id: number;
  total_assigned_items: number;
  pending_items: number;
  processed_items: number;
  all_my_items_processed: boolean;
  overall_processing_complete: boolean;
  items: MarketingProcessingStatusItem[];
}

export interface MarkItemsProcessedResponse {
  message: string;
  processed_count: number;
  all_processing_complete: boolean;
  request: RedemptionRequestResponse;
}

export const marketingRequestsApi = {
  /**
   * Get all redemption requests that have items assigned to the current marketing user.
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
  async getMyProcessingStatus(requestId: number): Promise<MarketingProcessingStatus> {
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
   * Mark the current marketing user's assigned items as processed.
   * Each Marketing user must process their own assigned items.
   */
  async markItemsProcessed(requestId: number): Promise<MarkItemsProcessedResponse> {
    const response = await fetch(`${API_BASE_URL}/redemption-requests/${requestId}/mark_items_processed/`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to mark items as processed');
    }

    return response.json();
  },

  /**
   * Get the marketing user's history of processed requests.
   * Shows all requests where the current user has processed items.
   */
  async getHistory(): Promise<RedemptionRequestResponse[]> {
    const response = await fetch(`${API_BASE_URL}/redemption-requests/marketing-history/`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch marketing history');
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
  async getProcessedRequests(): Promise<RedemptionRequestResponse[]> {
    const response = await fetch(`${API_BASE_URL}/redemption-requests/history/`, {
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

