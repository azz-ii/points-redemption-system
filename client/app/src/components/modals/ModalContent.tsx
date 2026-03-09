import type { ModalContentProps } from "./types";

export function ModalContent({ children, className = "" }: ModalContentProps) {
  return (
    <div className={`p-8 space-y-6 flex-1 overflow-y-auto min-h-0 ${className}`}>
      {children}
    </div>
  );
}
