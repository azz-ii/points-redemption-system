// Type definitions for Request History
export type { ModalBaseProps } from "@/components/modals";

export interface RequestHistoryItem {
  id: number;
  requested_by: number;
  requested_by_name: string;
  requested_for: number;
  requested_for_name: string;
  team?: number | null;
  team_name?: string | null;
  status: string;
  status_display: string;
  processing_status: string;
  processing_status_display: string;
  total_points: number;
  date_requested: string;
  // Legacy review fields
  reviewed_by?: number | null;
  reviewed_by_name?: string | null;
  date_reviewed?: string | null;
  // Dual approval - Sales
  requires_sales_approval?: boolean;
  sales_approval_status?: string | null;
  sales_approved_by?: number | null;
  sales_approved_by_name?: string | null;
  sales_approval_date?: string | null;
  sales_rejection_reason?: string | null;
  // Dual approval - Marketing
  requires_marketing_approval?: boolean;
  marketing_approval_status?: string | null;
  marketing_approved_by?: number | null;
  marketing_approved_by_name?: string | null;
  marketing_approval_date?: string | null;
  marketing_rejection_reason?: string | null;
  // Processing fields
  processed_by?: number | null;
  processed_by_name?: string | null;
  date_processed?: string | null;
  // Cancellation fields
  cancelled_by?: number | null;
  cancelled_by_name?: string | null;
  date_cancelled?: string | null;
  remarks?: string | null;
  rejection_reason?: string | null;
  points_deducted_from?: string;
  points_deducted_from_display?: string;
  items: RequestHistoryItemVariant[];
}

export interface RequestHistoryItemVariant {
  id: number;
  product_id: number;
  product_name: string;
  product_code: string;
  category: string | null;
  quantity: number;
  points_per_item: number;
  total_points: number;
  legend: string;
  is_processed: boolean;
  processed_by: number | null;
  processed_by_name: string | null;
  date_processed: string | null;
}
