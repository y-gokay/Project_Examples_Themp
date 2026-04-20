import { forwardRef } from "react";
import { Check } from "lucide-react";
import { cn } from "../../utils/helpers";

/**
 * Checkbox Component
 */
const Checkbox = forwardRef(
  (
    {
      label,
      description,
      error,
      className = "",
      disabled = false,
      id,
      checked,
      ...props
    },
    ref
  ) => {
    const checkboxId =
      id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={cn("flex items-start", className)}>
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className="sr-only peer"
            disabled={disabled}
            checked={checked}
            aria-invalid={!!error}
            {...props}
          />
          <label
            htmlFor={checkboxId}
            className={cn(
              "w-5 h-5 border-2 rounded flex items-center justify-center cursor-pointer transition-colors",
              "peer-focus:ring-2 peer-focus:ring-offset-1 peer-focus:ring-blue-500 dark:peer-focus:ring-blue-400",
              checked
                ? "bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500"
                : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400",
              disabled && "opacity-50 cursor-not-allowed",
              error && "border-red-500 dark:border-red-600"
            )}
          >
            {checked && (
              <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
            )}
          </label>
        </div>

        {(label || description) && (
          <div className="ml-3">
            {label && (
              <label
                htmlFor={checkboxId}
                className={cn(
                  "block text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
            )}
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-0.5" role="alert">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
