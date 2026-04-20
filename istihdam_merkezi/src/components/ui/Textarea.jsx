import { forwardRef } from "react";
import { cn } from "../../utils/helpers";

/**
 * Textarea Component
 */
const Textarea = forwardRef(
  (
    {
      label,
      error,
      helperText,
      className = "",
      required = false,
      disabled = false,
      rows = 4,
      maxLength,
      showCount = false,
      id,
      value = "",
      ...props
    },
    ref
  ) => {
    const textareaId =
      id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    const textareaClasses = cn(
      "w-full px-4 py-2 border rounded-lg transition-colors resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
      "focus:outline-none focus:ring-2 ring-offset-white dark:ring-offset-gray-900 focus:ring-offset-1",
      error
        ? "border-red-500 dark:border-red-400 focus:border-red-500 focus:ring-red-500"
        : "border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400",
      disabled && "bg-gray-100 dark:bg-gray-900 cursor-not-allowed",
      className
    );

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {label}
            {required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          className={textareaClasses}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          value={value}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${textareaId}-error`
              : helperText
              ? `${textareaId}-helper`
              : undefined
          }
          {...props}
        />

        <div className="flex items-center justify-between mt-1">
          <div className="flex-1">
            {error && (
              <p
                id={`${textareaId}-error`}
                className="text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {error}
              </p>
            )}

            {!error && helperText && (
              <p id={`${textareaId}-helper`} className="text-sm text-gray-500 dark:text-gray-400">
                {helperText}
              </p>
            )}
          </div>

          {showCount && maxLength && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {value.length} / {maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
