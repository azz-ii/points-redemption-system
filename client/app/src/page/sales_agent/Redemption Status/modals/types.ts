export interface StatusItem {
  id: string;
  type: string;
  details: string;
  status: "Approved" | "Pending" | "Rejected";
  date: string;
  image: string;
}

export interface ModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ViewRedemptionStatusModalProps extends ModalBaseProps {
  item: StatusItem | null;
}
