import type { ReactNode, ButtonHTMLAttributes } from "react";

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "destructive" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  fullWidthOnMobile?: boolean;
}

/**
 * ActionButton - Consistent button component with variants
 * Touch-friendly sizing and responsive behavior
 */
export function ActionButton({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  fullWidthOnMobile = false,
  className = "",
  disabled,
  ...props
}: ActionButtonProps) {
  const variantClasses = {
    primary:
      "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm disabled:opacity-50",
    secondary:
      "bg-secondary hover:bg-accent text-secondary-foreground border border-border shadow-sm",
    destructive:
      "bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-sm disabled:opacity-50",
    ghost:
      "hover:bg-accent text-foreground",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm min-h-[36px]",
    md: "px-4 py-2 text-sm sm:text-base min-h-[40px] sm:min-h-[44px]",
    lg: "px-6 py-3 text-base sm:text-lg min-h-[44px] sm:min-h-[48px]",
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
        variantClasses[variant]
      } ${sizeClasses[size]} ${
        fullWidthOnMobile ? "w-full sm:w-auto" : ""
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === "left" && (
        <span className="shrink-0">{icon}</span>
      )}
      <span className="truncate">{children}</span>
      {icon && iconPosition === "right" && (
        <span className="shrink-0">{icon}</span>
      )}
    </button>
  );
}
