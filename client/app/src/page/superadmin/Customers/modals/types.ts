export type { ModalBaseProps } from "@/components/modals";

export interface Customer {
  id: number;
  name: string;
  contact_email?: string;
  phone?: string;
  location?: string;
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

export interface CustomerFormData {
  name: string;
  contact_email: string;
  phone: string;
  location: string;
}
