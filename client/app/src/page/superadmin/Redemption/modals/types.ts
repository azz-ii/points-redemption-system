export interface RequestItemVariant {
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

export interface RedemptionItem {
  id: number;
  requested_by: number;
  requested_by_name: string;
  requested_for: number;
  requested_for_name: string;
  team?: number | null;
  team_name?: string | null;
  status: string;
  status_display?: string;
  processing_status?: string;
  processing_status_display?: string;
  total_points: number;
  date_requested: string;
  reviewed_by?: number | null;
  reviewed_by_name?: string;
  date_reviewed?: string;
  processed_by?: number | null;
  processed_by_name?: string;
  date_processed?: string;
  cancelled_by?: number | null;
  cancelled_by_name?: string;
  date_cancelled?: string;
  remarks?: string;
  rejection_reason?: string;
  points_deducted_from?: string;
  points_deducted_from_display?: string;
  items: RequestItemVariant[];
}

export interface ModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
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
