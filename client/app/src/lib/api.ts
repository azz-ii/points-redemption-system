// API Configuration and Service Layer
// Use relative URLs to match the login flow (cookies are set for the same origin)
const API_BASE_URL = "/api";

// Backend API Response Types
export interface CatalogueItem {
  id: number;
  reward: string | null;
  item_name: string;
  description: string;
  purpose: string;
  specifications: string;
  legend: "COLLATERAL" | "GIVEAWAY" | "ASSET" | "BENEFIT";
  needs_driver: boolean;
  added_by: number | null;
  mktg_admin: number | null;
  mktg_admin_name: string | null;
  approver: number | null;
  approver_name: string | null;
  is_archived: boolean;
  date_archived: string | null;
  archived_by: number | null;
}

export type PricingType = 'FIXED' | 'PER_SQFT' | 'PER_INVOICE' | 'PER_DAY' | 'PER_EU_SRP';

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

export interface Variant {
  id: number;
  catalogue_item: CatalogueItem;
  catalogue_item_id: number;
  item_code: string;
  option_description: string | null;
  points: string;
  price: string;
  image_url: string | null;
  pricing_type: PricingType | null;
  points_multiplier: string | null;
  price_multiplier: string | null;
}

export interface CatalogueItemsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Variant[];
}

// Frontend Display Types
export interface RedeemItemData {
  id: string;
  name: string;
  points: number; // For FIXED items: per-unit points. For dynamic: the multiplier
  image: string;
  category: string;
  needs_driver: boolean;
  pricing_type: PricingType;
  points_multiplier: number | null; // For dynamic items: points per unit (sq ft, invoice, etc.)
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
  COLLATERAL: "Collateral",
  GIVEAWAY: "Giveaway",
  ASSET: "Asset",
  BENEFIT: "Benefit",
};

// Transform backend variant data to frontend format
export function transformVariantToRedeemItem(variant: Variant): RedeemItemData {
  console.log("[API] Transforming variant:", variant);
  
  // Parse points - handle both numeric and formula strings
  let pointsValue = 0;
  try {
    // Try to parse as number first
    const parsed = parseFloat(variant.points);
    if (!isNaN(parsed)) {
      pointsValue = parsed;
    } else {
      console.warn(`[API] Could not parse points value: ${variant.points}`);
      pointsValue = 0;
    }
  } catch (error) {
    console.error("[API] Error parsing points:", error);
    pointsValue = 0;
  }

  // Use placeholder image if no image_url provided
  const imageUrl = variant.image_url && variant.image_url.trim() !== "" 
    ? variant.image_url 
    : "/images/tshirt.png";

  console.log(`[API] Image URL for ${variant.catalogue_item.item_name}: ${imageUrl}`);

  // Get category from legend
  const category = legendToCategoryMap[variant.catalogue_item.legend] || variant.catalogue_item.legend;

  // Parse pricing type and multiplier
  const pricingType: PricingType = (variant.pricing_type as PricingType) || 'FIXED';
  let pointsMultiplier: number | null = null;
  if (variant.points_multiplier) {
    const parsed = parseFloat(variant.points_multiplier);
    if (!isNaN(parsed)) {
      pointsMultiplier = parsed;
    }
  }

  const transformed: RedeemItemData = {
    id: variant.id.toString(),
    name: variant.catalogue_item.item_name,
    points: pointsValue,
    image: imageUrl,
    category: category,
    needs_driver: variant.catalogue_item.needs_driver,
    pricing_type: pricingType,
    points_multiplier: pointsMultiplier,
  };

  console.log("[API] Transformed item:", transformed);
  return transformed;
}

// Fetch catalogue items from backend
export async function fetchCatalogueItems(): Promise<RedeemItemData[]> {
  console.log("[API] Fetching catalogue items from:", `${API_BASE_URL}/catalogue/`);
  
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
      throw new Error(`Failed to fetch catalogue items: ${response.status} ${response.statusText}`);
    }

    const data: CatalogueItemsResponse = await response.json();
    console.log("[API] Received data:", data);
    console.log("[API] Number of items:", data.results?.length || 0);

    if (!data.results || !Array.isArray(data.results)) {
      console.error("[API] Invalid response format - results not found or not an array");
      throw new Error("Invalid response format from server");
    }

    // Filter out archived items
    const activeItems = data.results.filter(variant => !variant.catalogue_item.is_archived);
    console.log("[API] Active (non-archived) items:", activeItems.length);

    // Transform to frontend format
    const transformedItems = activeItems.map(transformVariantToRedeemItem);
    console.log("[API] Transformed items:", transformedItems);

    return transformedItems;
  } catch (error) {
    console.error("[API] Error fetching catalogue items:", error);
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
  variant_id: string;
  quantity?: number; // For FIXED pricing items
  dynamic_quantity?: number; // For dynamic pricing items (PER_SQFT, etc.)
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
    variant: number;
    variant_name: string;
    variant_code: string;
    variant_option: string | null;
    catalogue_item_name: string;
    quantity: number;
    points_per_item: number;
    total_points: number;
    image_url: string | null;
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
  variant: number;
  variant_name: string;
  variant_code: string;
  variant_option: string | null;
  catalogue_item_name: string;
  catalogue_item_legend?: string;
  quantity: number;
  points_per_item: number;
  total_points: number;
  image_url: string | null;
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

