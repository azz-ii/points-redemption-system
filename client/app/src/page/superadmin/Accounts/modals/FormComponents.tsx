import { useTheme } from "next-themes";
import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  hint?: string;
}

export function FormField({
  label,
  required = false,
  error,
  children,
  hint,
}: FormFieldProps) {
  const { resolvedTheme } = useTheme();

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && (
        <p
          className={`text-xs ${
            resolvedTheme === "dark" ? "text-gray-500" : "text-gray-600"
          }`}
        >
          {hint}
        </p>
      )}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

export function FormInput({
  label,
  error,
  required,
  ...props
}: FormInputProps) {
  const { resolvedTheme } = useTheme();

  const inputContent = (
    <input
      {...props}
      className={`w-full px-3 py-2 rounded-lg border transition-colors ${
        resolvedTheme === "dark"
          ? "bg-gray-800 border-gray-600 text-white placeholder-gray-500"
          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
      } focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${
        error ? "border-red-500 focus:ring-red-500/50 focus:border-red-500" : ""
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    />
  );

  if (!label) return inputContent;

  return (
    <FormField label={label} required={required} error={error}>
      {inputContent}
    </FormField>
  );
}

interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

export function FormTextarea({
  label,
  error,
  required,
  ...props
}: FormTextareaProps) {
  const { resolvedTheme } = useTheme();

  const textareaContent = (
    <textarea
      {...props}
      className={`w-full px-3 py-2 rounded-lg border transition-colors resize-none ${
        resolvedTheme === "dark"
          ? "bg-gray-800 border-gray-600 text-white placeholder-gray-500"
          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
      } focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${
        error ? "border-red-500 focus:ring-red-500/50 focus:border-red-500" : ""
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    />
  );

  if (!label) return textareaContent;

  return (
    <FormField label={label} required={required} error={error}>
      {textareaContent}
    </FormField>
  );
}

interface FormSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  required?: boolean;
  options: Array<{ value: string; label: string }>;
}

export function FormSelect({
  label,
  error,
  required,
  options,
  ...props
}: FormSelectProps) {
  const { resolvedTheme } = useTheme();

  const selectContent = (
    <select
      {...props}
      className={`w-full px-3 py-2 rounded-lg border transition-colors ${
        resolvedTheme === "dark"
          ? "bg-gray-800 border-gray-600 text-white"
          : "bg-white border-gray-300 text-gray-900"
      } focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${
        error ? "border-red-500 focus:ring-red-500/50 focus:border-red-500" : ""
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );

  if (!label) return selectContent;

  return (
    <FormField label={label} required={required} error={error}>
      {selectContent}
    </FormField>
  );
}
