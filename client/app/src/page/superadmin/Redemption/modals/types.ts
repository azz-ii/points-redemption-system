export type { ModalBaseProps } from "@/components/modals";

export interface ItemFulfillmentLog {
  id: number;
  fulfilled_quantity: number;
  fulfilled_by: number | null;
  fulfilled_by_name: string | null;
  fulfilled_at: string;
  notes?: string | null;
}

export interface RequestItemVariant {
  id: number;
  product: number;
  product_name: string;
  product_code: string;
  category?: string | null;
  quantity: number;
  points_per_item: number;
  total_points: number;
  pricing_type?: string | null;
  // Partial fulfillment tracking
  fulfilled_quantity: number;
  remaining_quantity: number | null;
  is_fully_fulfilled: boolean;
  fulfillment_logs?: ItemFulfillmentLog[];
  item_processed_by?: number | null;
  item_processed_by_name?: string | null;
  item_processed_at?: string | null;
  extra_data?: Record<string, any> | null;
}

/** Data sent per-item when calling mark_items_processed */
export interface ProcessItemData {
  item_id: number;
  fulfilled_quantity?: number;
  notes?: string;
}

export interface RedemptionItem {
  id: number;
  requested_by: number;
  requested_by_name: string;
  requested_for: number;
  requested_for_name: string;
  requested_for_type?: string | null;
  team?: number | null;
  team_name?: string | null;
  status: string;
  status_display?: string;
  processing_status?: string;
  processing_status_display?: string;
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
  // Dual approval - Handler
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
  initial_remarks?: string | null;
  approver_remarks?: string | null;
  processing_remarks?: string | null;
  rejection_reason?: string | null;
  // Acknowledgement Receipt fields
  ar_status?: string | null;
  ar_uploaded_by_name?: string | null;
  ar_uploaded_at?: string | null;
  // Processing photos
  processing_photos?: Array<{
    id: number;
    photo: string;
    uploaded_by: number | null;
    uploaded_by_name: string | null;
    uploaded_at: string;
    caption: string | null;
  }>;
  points_deducted_from?: string;
  points_deducted_from_display?: string;
  items: RequestItemVariant[];
}

export interface MyProcessingStatus {
  request_id: number;
  total_assigned_items: number;
  pending_items: number;
  processed_items: number;
  all_my_items_processed: boolean;
  overall_processing_complete: boolean;
  items: RequestItemVariant[];
}
