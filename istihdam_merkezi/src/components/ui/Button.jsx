import { cn } from "../../utils/helpers";

/**
 * Button Component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.variant - Button variant (primary|secondary|outline|ghost|danger)
 * @param {string} props.size - Button size (sm|md|lg)
 * @param {boolean} props.fullWidth - Full width button
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.loading - Loading state
 * @param {React.ReactNode} props.leftIcon - Left icon
 * @param {React.ReactNode} props.rightIcon - Right icon
 * @param {string} props.className - Additional classes
 * @param {string} props.type - Button type
 * @param {Function} props.onClick - Click handler
 * @param {string} props.ariaLabel - ARIA label for accessibility (required if no children)
 * @param {string} props.ariaDescribedBy - ARIA describedby
 */
const Button = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  className = "",
  type = "button",
  onClick,
  ariaLabel,
  ariaDescribedBy,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white focus:ring-blue-500 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300",
    secondary:
      "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 dark:from-gray-500 dark:to-gray-600 dark:hover:from-gray-600 dark:hover:to-gray-700 text-white focus:ring-gray-500 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300",
    outline:
      "border-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-700 dark:hover:border-blue-400 focus:ring-blue-500 transition-all duration-300",
    ghost:
      "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-gray-500 transition-all duration-200",
    danger:
      "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 dark:from-red-500 dark:to-red-600 dark:hover:from-red-600 dark:hover:to-red-700 text-white focus:ring-red-500 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-4 py-2 text-base gap-2",
    lg: "px-6 py-3 text-lg gap-2.5",
  };

  const classes = cn(
    baseClasses,
    variants[variant],
    sizes[size],
    fullWidth && "w-full",
    className
  );

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={ariaLabel || (children ? undefined : "Button")}
      aria-describedby={ariaDescribedBy}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4 flex-shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!loading && leftIcon && (
        <span className="inline-flex items-center justify-center flex-shrink-0">
          {leftIcon}
        </span>
      )}
      {children && (
        <span className="inline-flex items-center whitespace-nowrap">
          {children}
        </span>
      )}
      {!loading && rightIcon && (
        <span className="inline-flex items-center justify-center flex-shrink-0">
          {rightIcon}
        </span>
      )}
    </button>
  );
};

export default Button;
