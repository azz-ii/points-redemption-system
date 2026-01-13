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
  added_by: number | null;
  is_archived: boolean;
  date_archived: string | null;
  archived_by: number | null;
}

export interface Variant {
  id: number;
  catalogue_item: CatalogueItem;
  catalogue_item_id: number;
  item_code: string;
  option_description: string | null;
  points: string;
  price: string;
  image_url: string | null;
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
  points: number;
  image: string;
  category: string;
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

  const transformed: RedeemItemData = {
    id: variant.id.toString(),
    name: variant.catalogue_item.item_name,
    points: pointsValue,
    image: imageUrl,
    category: category,
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
  quantity: number;
}

export interface CreateRedemptionRequestData {
  requested_for: number; // Distributor ID
  points_deducted_from: 'SELF' | 'DISTRIBUTOR';
  remarks?: string;
  items: RedemptionRequestItem[];
}

export interface RedemptionRequestResponse {
  id: number;
  requested_by: number;
  requested_by_name: string;
  requested_for: number;
  requested_for_name: string;
  team: number | null;
  team_name: string | null;
  points_deducted_from: string;
  points_deducted_from_display: string;
  total_points: number;
  status: string;
  status_display: string;
  date_requested: string;
  reviewed_by: number | null;
  reviewed_by_name: string | null;
  date_reviewed: string | null;
  remarks: string | null;
  rejection_reason: string | null;
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


