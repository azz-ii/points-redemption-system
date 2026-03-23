// Backend API response types (mirroring Django serializers)
import type { ModalBaseProps } from "@/components/modals";
export type { ModalBaseProps };

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
  product: number;
  product_name: string;
  product_code: string;
  category: string | null;
  quantity: number;
  points_per_item: number;
  total_points: number;
  extra_data?: Record<string, any> | null;
}

export interface RedemptionRequest {
  id: number;
  requested_by: number;
  requested_by_name: string;
  requested_for: number | null;
  requested_for_name: string;
  requested_for_type: "SELF" | "DISTRIBUTOR" | "CUSTOMER";
  team: number | null;
  team_name: string | null;
  points_deducted_from: "SELF" | "DISTRIBUTOR";
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
  // Acknowledgement Receipt fields
  ar_status?: string | null;
  ar_status_display?: string | null;
  ar_number?: string | null;
  acknowledgement_receipt?: string | null;
  ar_uploaded_by?: number | null;
  ar_uploaded_by_name?: string | null;
  ar_uploaded_at?: string | null;
  // E-signature fields
  received_by_signature?: string | null;
  received_by_signature_method?: "DRAWN" | "PHOTO" | null;
  received_by_signature_method_display?: string | null;
  received_by_name?: string | null;
  received_by_date?: string | null;
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

export interface ViewRedemptionStatusModalProps extends ModalBaseProps {
  item: RedemptionRequestItem | null;
  request: RedemptionRequest | null;
  onRequestWithdrawn?: () => void;
  username?: string | null;
  userPosition?: string | null;
  onApprove?: (request: RedemptionRequest) => void;
  onReject?: (request: RedemptionRequest) => void;
}

export interface WithdrawConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  requestId: number;
  isSubmitting: boolean;
}

export interface BulkWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  requests: RedemptionRequest[];
  isSubmitting: boolean;
}
