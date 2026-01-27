// Backend API response types (mirroring Django serializers)
export type { ModalBaseProps } from "@/components/modals";

export interface CatalogueItem {
  id: number;
  item_name: string;
  description: string;
  purpose: string;
  specifications: string;
  legend: string;
  reward: string | null;
  is_archived: boolean;
  date_added: string;
}

export interface RedemptionRequestItem {
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
}

export interface RedemptionRequest {
  id: number;
  requested_by: number;
  requested_by_name: string;
  requested_for: number;
  requested_for_name: string;
  team: number | null;
  team_name: string | null;
  points_deducted_from: "SELF" | "DISTRIBUTOR" | "CUSTOMER";
  points_deducted_from_display: string;
  total_points: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  status_display: string;
  processing_status: "NOT_PROCESSED" | "PROCESSED" | "CANCELLED";
  processing_status_display: string;
  date_requested: string;
  // Legacy review fields
  reviewed_by: number | null;
  reviewed_by_name: string | null;
  date_reviewed: string | null;
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
  remarks: string | null;
  rejection_reason: string | null;
  items: RedemptionRequestItem[];
}

export interface ViewRedemptionStatusModalProps extends ModalBaseProps {
  item: RedemptionRequestItem | null;
  request: RedemptionRequest | null;
}
