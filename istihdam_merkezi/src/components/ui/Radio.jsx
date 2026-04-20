import { forwardRef } from "react";
import { cn } from "../../utils/helpers";

/**
 * Radio Component
 */
const Radio = forwardRef(
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
    const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={cn("flex items-start", className)}>
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="radio"
            id={radioId}
            className="sr-only peer"
            disabled={disabled}
            checked={checked}
            aria-invalid={!!error}
            {...props}
          />
          <label
            htmlFor={radioId}
            className={cn(
              "w-5 h-5 border-2 rounded-full flex items-center justify-center cursor-pointer transition-colors",
              "peer-focus:ring-2 peer-focus:ring-offset-1 peer-focus:ring-blue-500",
              checked
                ? "border-blue-600"
                : "border-gray-300 hover:border-blue-500",
              disabled && "opacity-50 cursor-not-allowed",
              error && "border-red-500"
            )}
          >
            {checked && (
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
            )}
          </label>
        </div>

        {(label || description) && (
          <div className="ml-3">
            {label && (
              <label
                htmlFor={radioId}
                className={cn(
                  "block text-sm font-medium text-gray-900 cursor-pointer",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-gray-500 mt-0.5">{description}</p>
            )}
            {error && (
              <p className="text-sm text-red-600 mt-0.5" role="alert">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Radio.displayName = "Radio";

export default Radio;
