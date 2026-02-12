import type { InputHTMLAttributes } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  fullWidth?: boolean;
}

/**
 * FormField - Consistent form input component
 * Responsive layout with proper spacing and states
 */
export function FormField({
  label,
  error,
  helperText,
  required,
  fullWidth = true,
  className = "",
  id,
  ...props
}: FormFieldProps) {
  const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className={`${fullWidth ? "w-full" : ""} space-y-1.5 sm:space-y-2`}>
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-foreground"
      >
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>
      <input
        id={fieldId}
        className={`w-full rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${
          error
            ? "border-2 border-destructive bg-destructive/5"
            : "border border-input bg-background text-foreground placeholder:text-muted-foreground hover:border-ring/50"
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <span className="text-base">⚠</span>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-xs sm:text-sm text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
}

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  fullWidth?: boolean;
}

export function TextAreaField({
  label,
  error,
  helperText,
  required,
  fullWidth = true,
  className = "",
  id,
  ...props
}: TextAreaFieldProps) {
  const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className={`${fullWidth ? "w-full" : ""} space-y-1.5 sm:space-y-2`}>
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-foreground"
      >
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>
      <textarea
        id={fieldId}
        className={`w-full rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed resize-y ${
          error
            ? "border-2 border-destructive bg-destructive/5"
            : "border border-input bg-background text-foreground placeholder:text-muted-foreground hover:border-ring/50"
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <span className="text-base">⚠</span>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-xs sm:text-sm text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
}
