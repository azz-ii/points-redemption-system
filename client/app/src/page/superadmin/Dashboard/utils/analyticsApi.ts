/**
 * Analytics API layer for the SuperAdmin Dashboard.
 * Fetches aggregated data for charts and reports.
 */
import { API_URL } from "@/lib/config";

const API_BASE_URL = API_URL;

// ── Response Types ──────────────────────────────────────

export interface AnalyticsOverview {
  total_requests: number;
  pending_count: number;
  approved_count: number;
  rejected_count: number;
  withdrawn_count: number;
  processed_count: number;
  not_processed_count: number;
  cancelled_count: number;
  total_points_redeemed: number;
  on_board_count: number;
  customers_count: number;
}

export interface TimeSeriesEntry {
  date: string;
  request_count: number;
  points_redeemed: number;
  approved_count: number;
  rejected_count: number;
}

export interface ItemPopularity {
  product_id: number;
  item_code: string;
  item_name: string;
  legend: string;
  category: string;
  total_quantity: number;
  total_points: number;
  request_count: number;
}

export interface AgentPerformance {
  agent_id: number;
  agent_name: string;
  team_name: string | null;
  total_requests: number;
  approved_count: number;
  rejected_count: number;
  withdrawn_count: number;
  processed_count: number;
  total_points: number;
  approval_rate: number;
}

export interface TeamPerformance {
  team_id: number;
  team_name: string;
  total_requests: number;
  approved_count: number;
  rejected_count: number;
  processed_count: number;
  total_points: number;
  approval_rate: number;
}

export interface TurnaroundOverall {
  avg_request_to_review_hours: number | null;
  avg_review_to_process_hours: number | null;
  avg_total_hours: number | null;
}

export interface TurnaroundTrendEntry {
  month: string;
  avg_total_hours: number | null;
  count: number;
}

export interface TurnaroundData {
  overall: TurnaroundOverall;
  trend: TurnaroundTrendEntry[];
}

export interface EntityAnalytics {
  entity_id: number;
  entity_name: string;
  entity_type: "distributor" | "customer";
  request_count: number;
  total_points: number;
  processed_count: number;
}

export interface ItemRequestDetail {
  request_id: number;
  date_requested: string | null;
  agent: string | null;
  team: string | null;
  requested_for: string | null;
  requested_for_type: string;
  item_name: string | null;
  item_code: string | null;
  quantity: number;
  points: number;
  status: string;
  processing_status: string;
  reviewed_by: string | null;
  date_reviewed: string | null;
  processed_by: string | null;
  date_processed: string | null;
  remarks: string;
}

export interface AgentRequestDetail {
  request_id: number;
  date_requested: string | null;
  requested_for: string | null;
  requested_for_type: string;
  items: string;
  total_points: number;
  status: string;
  processing_status: string;
  reviewed_by: string | null;
  date_reviewed: string | null;
  processed_by: string | null;
  date_processed: string | null;
  remarks: string;
  rejection_reason: string;
}

export type DateRange = "7" | "30" | "90" | "365" | "all";

// ── Helper ──────────────────────────────────────────────

async function fetchJson<T>(url: string): Promise<T> {
  console.debug(`[Analytics API] Fetching: ${url}`);
  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    console.error(`[Analytics API] Error ${res.status}:`, body);
    throw new Error(body.error || body.detail || `Request failed: ${res.status}`);
  }

  const data = await res.json();
  console.debug(`[Analytics API] Response from ${url}:`, data);
  return data as T;
}

// ── Public API ──────────────────────────────────────────

export const analyticsApi = {
  getOverview(range: DateRange = "30") {
    return fetchJson<AnalyticsOverview>(
      `${API_BASE_URL}/dashboard/analytics/overview/?range=${range}`,
    );
  },

  getTimeSeries(range: DateRange = "30", period: string = "auto") {
    return fetchJson<TimeSeriesEntry[]>(
      `${API_BASE_URL}/dashboard/analytics/time-series/?range=${range}&period=${period}`,
    );
  },

  getItems(range: DateRange = "30", limit: number = 10) {
    return fetchJson<ItemPopularity[]>(
      `${API_BASE_URL}/dashboard/analytics/items/?range=${range}&limit=${limit}`,
    );
  },

  getAgents(range: DateRange = "30", limit: number = 10) {
    return fetchJson<AgentPerformance[]>(
      `${API_BASE_URL}/dashboard/analytics/agents/?range=${range}&limit=${limit}`,
    );
  },

  getTeams(range: DateRange = "30") {
    return fetchJson<TeamPerformance[]>(
      `${API_BASE_URL}/dashboard/analytics/teams/?range=${range}`,
    );
  },

  getTurnaround(range: DateRange = "30") {
    return fetchJson<TurnaroundData>(
      `${API_BASE_URL}/dashboard/analytics/turnaround/?range=${range}`,
    );
  },

  getEntities(type: "distributor" | "customer", range: DateRange = "30", limit: number = 10) {
    return fetchJson<EntityAnalytics[]>(
      `${API_BASE_URL}/dashboard/analytics/entities/?type=${type}&range=${range}&limit=${limit}`,
    );
  },

  getItemRequests(productId: number, range: DateRange = "30") {
    return fetchJson<ItemRequestDetail[]>(
      `${API_BASE_URL}/dashboard/analytics/item-requests/?product_id=${productId}&range=${range}`,
    );
  },

  getAgentRequests(agentId: number, range: DateRange = "30") {
    return fetchJson<AgentRequestDetail[]>(
      `${API_BASE_URL}/dashboard/analytics/agent-requests/?agent_id=${agentId}&range=${range}`,
    );
  },
};
