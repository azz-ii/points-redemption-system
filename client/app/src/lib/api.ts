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
  needs_driver: boolean;
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
  // Parse points - handle both numeric and formula strings
  let pointsValue = 0;
  try {
    const parsed = parseFloat(variant.points);
    if (!isNaN(parsed)) {
      pointsValue = parsed;
    }
  } catch (error) {
    pointsValue = 0;
  }

  // Use placeholder image if no image_url provided
  const imageUrl =
    variant.image_url && variant.image_url.trim() !== ""
      ? variant.image_url
      : "/images/tshirt.png";

  // Get category from legend
  const category =
    legendToCategoryMap[variant.catalogue_item.legend] ||
    variant.catalogue_item.legend;

  return {
    id: variant.id.toString(),
    name: variant.catalogue_item.item_name,
    points: pointsValue,
    image: imageUrl,
    category: category,
    needs_driver: variant.catalogue_item.needs_driver,
  };
}

// Paginated catalogue items response for frontend
export interface PaginatedRedeemItemsResponse {
  items: RedeemItemData[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface FetchCatalogueItemsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
}

// Fetch catalogue items from backend with pagination and filtering
export async function fetchCatalogueItems(
  params: FetchCatalogueItemsParams = {}
): Promise<PaginatedRedeemItemsResponse> {
  const { page = 1, pageSize = 6, search = '', category = 'All' } = params;
  
  // Build query string
  const queryParams = new URLSearchParams();
  queryParams.set('page', page.toString());
  queryParams.set('page_size', pageSize.toString());
  if (search) queryParams.set('search', search);
  if (category && category !== 'All') queryParams.set('category', category);
  
  const url = `${API_BASE_URL}/catalogue/?${queryParams.toString()}`;
  console.log("[API] Fetching catalogue items from:", url);
  
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    console.log("[API] Response status:", response.status);

    if (!response.ok) {
      throw new Error(`Failed to fetch catalogue items: ${response.status}`);
    }

    const data: CatalogueItemsResponse = await response.json();
    console.log("[API] Received data - count:", data.count, "results:", data.results?.length);

    if (!data.results || !Array.isArray(data.results)) {
      throw new Error("Invalid response format from server");
    }

    // Transform to frontend format
    const transformedItems = data.results.map(transformVariantToRedeemItem);
    
    const totalPages = Math.ceil(data.count / pageSize);

    return {
      items: transformedItems,
      totalCount: data.count,
      totalPages,
      currentPage: page,
      hasNext: data.next !== null,
      hasPrevious: data.previous !== null,
    };
  } catch (error) {
    console.error("[API] Error fetching catalogue items:", error);
    throw error;
  }
}

// Fetch current user profile
export async function fetchCurrentUser(): Promise<UserProfile> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/me/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user profile: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching current user:", error);
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
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

// Helper to get headers with CSRF token
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const csrfToken = getCookie("csrftoken");
  if (csrfToken) {
    headers["X-CSRFToken"] = csrfToken;
  }

  return headers;
}

export interface RedemptionRequestItem {
  variant_id: string;
  quantity: number;
}

export interface CreateRedemptionRequestData {
  requested_for: number; // Distributor ID
  points_deducted_from: "SELF" | "DISTRIBUTOR";
  remarks?: string;
  items: RedemptionRequestItem[];
  // Service Vehicle Use fields (optional)
  svc_date?: string; // ISO date string (YYYY-MM-DD)
  svc_time?: string; // Time string (HH:MM)
  svc_driver?: "WITH_DRIVER" | "WITHOUT_DRIVER";
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
  async createRequest(
    data: CreateRedemptionRequestData
  ): Promise<RedemptionRequestResponse> {
    console.log("[Redemption API] Creating request:", data);

    const response = await fetch(`${API_BASE_URL}/redemption-requests/`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[Redemption API] Error creating request:", errorData);
      throw new Error(
        errorData.detail ||
          errorData.error ||
          "Failed to create redemption request"
      );
    }

    const result = await response.json();
    console.log("[Redemption API] Request created successfully:", result);
    return result;
  },

  async getRequests(): Promise<RedemptionRequestResponse[]> {
    const response = await fetch(`${API_BASE_URL}/redemption-requests/`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch redemption requests");
    }

    return response.json();
  },

  async getRequest(id: number): Promise<RedemptionRequestResponse> {
    const response = await fetch(`${API_BASE_URL}/redemption-requests/${id}/`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch redemption request");
    }

    return response.json();
  },

  async approveRequest(
    id: number,
    remarks?: string
  ): Promise<RedemptionRequestResponse> {
    const response = await fetch(
      `${API_BASE_URL}/redemption-requests/${id}/approve/`,
      {
        method: "POST",
        headers: getHeaders(),
        credentials: "include",
        body: JSON.stringify({ remarks }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to approve request");
    }

    return response.json();
  },

  async rejectRequest(
    id: number,
    rejection_reason: string,
    remarks?: string
  ): Promise<RedemptionRequestResponse> {
    const response = await fetch(
      `${API_BASE_URL}/redemption-requests/${id}/reject/`,
      {
        method: "POST",
        headers: getHeaders(),
        credentials: "include",
        body: JSON.stringify({ rejection_reason, remarks }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to reject request");
    }

    return response.json();
  },

  async markAsProcessed(
    id: number,
    remarks?: string
  ): Promise<RedemptionRequestResponse> {
    const response = await fetch(
      `${API_BASE_URL}/redemption-requests/${id}/mark_as_processed/`,
      {
        method: "POST",
        headers: getHeaders(),
        credentials: "include",
        body: JSON.stringify({ remarks }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to mark request as processed");
    }

    return response.json();
  },

  async cancelRequest(
    id: number,
    cancellation_reason: string,
    remarks?: string
  ): Promise<RedemptionRequestResponse> {
    const response = await fetch(
      `${API_BASE_URL}/redemption-requests/${id}/cancel_request/`,
      {
        method: "POST",
        headers: getHeaders(),
        credentials: "include",
        body: JSON.stringify({ cancellation_reason, remarks }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to cancel request");
    }

    return response.json();
  },

  async withdrawRequest(id: number, withdrawal_reason: string, remarks?: string): Promise<RedemptionRequestResponse> {
    const response = await fetch(`${API_BASE_URL}/redemption-requests/${id}/withdraw_request/`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ withdrawal_reason, remarks }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to withdraw request');
    }

    return response.json();
  },
};
