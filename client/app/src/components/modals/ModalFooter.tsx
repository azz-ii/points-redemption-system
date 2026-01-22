import type { ModalFooterProps } from "./types";

export function ModalFooter({ children, className = "" }: ModalFooterProps) {
  return <div className={`p-8 ${className}`}>{children}</div>;
}
