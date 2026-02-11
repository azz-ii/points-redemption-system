interface LoadingStateProps {
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * LoadingState - Consistent loading indicator
 * Responsive sizing and messaging
 */
export function LoadingState({
  message = "Loading...",
  className = "",
  size = "md",
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-6 w-6 border-2",
    md: "h-10 w-10 sm:h-12 sm:w-12 border-3",
    lg: "h-16 w-16 sm:h-20 sm:w-20 border-4",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20 px-4 ${className}`}
    >
      <div
        className={`animate-spin rounded-full border-muted border-b-foreground ${sizeClasses[size]}`}
      />
      {message && (
        <p className="mt-4 text-sm sm:text-base text-muted-foreground">
          {message}
        </p>
      )}
    </div>
  );
}
