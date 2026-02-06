import { ReactNode, InputHTMLAttributes } from "react";
import { useTheme } from "next-themes";

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
  const { resolvedTheme } = useTheme();
  const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className={`${fullWidth ? "w-full" : ""} space-y-1.5 sm:space-y-2`}>
      <label
        htmlFor={fieldId}
        className={`block text-sm font-medium ${
          resolvedTheme === "dark" ? "text-gray-200" : "text-gray-700"
        }`}
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <input
        id={fieldId}
        className={`w-full rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${
          error
            ? "border-2 border-red-500 bg-red-50 dark:bg-red-900/10"
            : resolvedTheme === "dark"
              ? "border border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 hover:border-gray-600"
              : "border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 hover:border-gray-400"
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <span className="text-base">⚠</span>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p
          className={`text-xs sm:text-sm ${
            resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
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
  const { resolvedTheme } = useTheme();
  const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className={`${fullWidth ? "w-full" : ""} space-y-1.5 sm:space-y-2`}>
      <label
        htmlFor={fieldId}
        className={`block text-sm font-medium ${
          resolvedTheme === "dark" ? "text-gray-200" : "text-gray-700"
        }`}
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <textarea
        id={fieldId}
        className={`w-full rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed resize-y ${
          error
            ? "border-2 border-red-500 bg-red-50 dark:bg-red-900/10"
            : resolvedTheme === "dark"
              ? "border border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 hover:border-gray-600"
              : "border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 hover:border-gray-400"
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <span className="text-base">⚠</span>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p
          className={`text-xs sm:text-sm ${
            resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}
