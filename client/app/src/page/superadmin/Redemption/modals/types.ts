export interface RedemptionItem {
  id: number;
  requested_by: number;
  requested_by_name: string;
  requested_for: number;
  requested_for_name: string;
  status: string;
  processing_status?: string;
  total_points: number;
  date_requested: string;
  reviewed_by?: number;
  reviewed_by_name?: string;
  date_reviewed?: string;
  processed_by?: number;
  processed_by_name?: string;
  date_processed?: string;
  cancelled_by?: number;
  cancelled_by_name?: string;
  date_cancelled?: string;
  remarks?: string;
  rejection_reason?: string;
  items: Array<{
    id: number;
    catalogue_item: number;
    catalogue_item_name: string;
    variant: number | null;
    variant_name: string | null;
    quantity: number;
    points_per_item: number;
    total_points: number;
  }>;
}

export interface ModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
}
