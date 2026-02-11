import type { ReactNode } from "react";

interface PageLayoutProps {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  className?: string;
}

/**
 * PageLayout - Consistent page wrapper with responsive padding and max-width
 * Provides standard spacing and ensures content doesn't stretch too wide on large screens
 */
export function PageLayout({
  children,
  maxWidth = "full",
  className = "",
}: PageLayoutProps) {
  const maxWidthClasses = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    "2xl": "max-w-screen-2xl",
    full: "max-w-full",
  };

  return (
    <div className="flex-1 overflow-auto bg-background">
      <div
        className={`${maxWidthClasses[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
