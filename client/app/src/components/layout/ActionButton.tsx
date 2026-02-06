import { ReactNode, ButtonHTMLAttributes } from "react";
import { useTheme } from "next-themes";

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
  const { resolvedTheme } = useTheme();

  const variantClasses = {
    primary:
      "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl disabled:bg-blue-400",
    secondary:
      resolvedTheme === "dark"
        ? "bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
        : "bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-sm",
    destructive:
      "bg-red-600 hover:bg-red-700 text-white shadow-lg disabled:bg-red-400",
    ghost:
      resolvedTheme === "dark"
        ? "hover:bg-gray-800 text-gray-300"
        : "hover:bg-gray-100 text-gray-700",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm min-h-[36px]",
    md: "px-4 py-2 text-sm sm:text-base min-h-[40px] sm:min-h-[44px]",
    lg: "px-6 py-3 text-base sm:text-lg min-h-[44px] sm:min-h-[48px]",
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
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
