// Backend API response types (mirroring Django serializers)
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
  points_deducted_from: "SELF" | "DISTRIBUTOR";
  points_deducted_from_display: string;
  total_points: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "WITHDRAWN";
  status_display: string;
  processing_status: "NOT_PROCESSED" | "PROCESSED" | "CANCELLED";
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
  withdrawal_reason: string | null;
  items: RedemptionRequestItem[];
}

export interface ModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ViewRedemptionStatusModalProps extends ModalBaseProps {
  item: RedemptionRequestItem | null;
  request: RedemptionRequest | null;
}
