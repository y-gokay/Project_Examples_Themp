import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/helpers";

/**
 * Select Component
 */
const Select = forwardRef(
  (
    {
      label,
      error,
      helperText,
      options = [],
      placeholder = "Seçiniz",
      className = "",
      required = false,
      disabled = false,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    const selectClasses = cn(
      "w-full px-4 py-2 pr-10 border rounded-lg transition-colors appearance-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 cursor-pointer",
      "focus:outline-none focus:ring-2 ring-offset-white dark:ring-offset-gray-900 focus:ring-offset-1",
      error
        ? "border-red-500 dark:border-red-400 focus:border-red-500 focus:ring-red-500"
        : "border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400",
      disabled && "bg-gray-100 dark:bg-gray-900 cursor-not-allowed",
      className
    );

    // Check if options array already has a placeholder option (value="")
    const hasPlaceholderInOptions = options.some((opt) => opt.value === "");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {label}
            {required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={selectClasses}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${selectId}-error`
                : helperText
                ? `${selectId}-helper`
                : undefined
            }
            {...props}
          >
            {/* Only show placeholder option if options array doesn't already have one */}
            {placeholder && !hasPlaceholderInOptions && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500">
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>

        {error && (
          <p
            id={`${selectId}-error`}
            className="mt-1 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}

        {!error && helperText && (
          <p id={`${selectId}-helper`} className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
