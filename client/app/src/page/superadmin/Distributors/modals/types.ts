export interface Distributor {
  id: number;
  name: string;
  contact_email: string;
  phone: string;
  location: string;
  region: string;
  points: number;
  team: number | null;
  team_name?: string;
  created_at: string;
  updated_at: string;
  date_added: string;
  added_by?: number;
  added_by_name?: string;
}

export interface DistributorFormData {
  name: string;
  contact_email: string;
  phone: string;
  location: string;
  region: string;
}

export interface ModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
}
