export interface RequestItem {
  id: number;
  requested_by: number;
  requested_by_name: string;
  requested_for: number;
  requested_for_name: string;
  team: number | null;
  team_name: string | null;
  status: string;
  status_display: string;
  total_points: number;
  date_requested: string;
  reviewed_by?: number;
  reviewed_by_name?: string;
  date_reviewed?: string;
  remarks?: string;
  rejection_reason?: string;
  points_deducted_from: string;
  points_deducted_from_display: string;
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

export interface ModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
}
