import type { ReactNode } from "react";

export interface ModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ModalWrapperProps extends ModalBaseProps {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  role?: "dialog" | "alertdialog";
}

export interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  titleId?: string;
}

export interface ModalContentProps {
  children: ReactNode;
  className?: string;
}

export interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}
