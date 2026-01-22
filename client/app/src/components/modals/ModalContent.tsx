import type { ModalContentProps } from "./types";

export function ModalContent({ children, className = "" }: ModalContentProps) {
  return (
    <div className={`p-8 space-y-6 max-h-[70vh] overflow-y-auto ${className}`}>
      {children}
    </div>
  );
}
