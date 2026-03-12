import { PASSWORD_RULES } from "@/lib/password-validation";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

/**
 * Displays a live checklist of password strength rules as the user types.
 * Each rule shows a green check when satisfied and a red cross when not.
 */
export function PasswordStrengthIndicator({
  password,
  className,
}: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  return (
    <ul className={cn("mt-2 space-y-1", className)}>
      {PASSWORD_RULES.map((rule) => {
        const passed = rule.test(password);
        return (
          <li
            key={rule.label}
            className={cn(
              "flex items-center gap-1.5 text-xs transition-colors",
              passed ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
            )}
          >
            {passed ? (
              <Check className="h-3 w-3 shrink-0 text-green-600 dark:text-green-400" />
            ) : (
              <X className="h-3 w-3 shrink-0 text-destructive" />
            )}
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
