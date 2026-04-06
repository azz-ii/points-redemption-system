export type { ModalBaseProps } from "@/components/modals";

export interface Distributor {
  id: number;
  name: string;
  brand?: string;
  sales_channel?: string;
  points?: number;
  created_at?: string;
  updated_at?: string;
  date_added?: string;
  added_by?: number;
  added_by_name?: string;
  is_archived: boolean;
  date_archived?: string | null;
  archived_by?: number | null;
  archived_by_username?: string | null;
}

export interface DistributorFormData {
  name: string;
  brand: string;
  sales_channel: string;
  points?: number;
}
