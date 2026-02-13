export type { ModalBaseProps } from "@/components/modals";
export type { RequestItem, RequestItemVariant } from "../../ProcessRequests/modals/types";
import type { RequestItem } from "../../ProcessRequests/modals/types";

export interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (format: "csv" | "excel") => Promise<void>;
  selectedItems: RequestItem[];
  isExporting: boolean;
}
