// Type definitions for Request History
export interface RequestHistoryItem {
  id: number;
  requested_by: number;
  requested_by_name: string;
  requested_for: number;
  requested_for_name: string;
  status: string;
  status_display: string;
  processing_status: string;
  processing_status_display: string;
  total_points: number;
  date_requested: string;
  items: RequestHistoryItemVariant[];
}

export interface RequestHistoryItemVariant {
  id: number;
  catalogue_item_id: number;
  catalogue_item_name: string;
  variant_id: number;
  variant_name: string;
  quantity: number;
  points_per_item: number;
  total_points: number;
  legend: string;
  is_processed: boolean;
  processed_by: number | null;
  processed_by_name: string | null;
  date_processed: string | null;
}
