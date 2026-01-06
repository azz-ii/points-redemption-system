export interface Account {
  id: number;
  username: string;
  full_name: string;
  email: string;
  position: string;
  points: number;
  is_activated: boolean;
  is_banned: boolean;
}

export interface ModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
}

export const POSITION_OPTIONS = [
  { value: "", label: "Select position" },
  { value: "Sales Agent", label: "Sales Agent" },
  { value: "Approver", label: "Approver" },
  { value: "Marketing", label: "Marketing" },
  { value: "Reception", label: "Reception" },
  { value: "Executive Assistant", label: "Executive Assistant" },
];
