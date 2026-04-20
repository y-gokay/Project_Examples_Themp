import { cn } from "../../utils/helpers";

/**
 * Badge Component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Badge content
 * @param {string} props.variant - Badge variant (default|primary|success|warning|danger|info)
 * @param {string} props.size - Badge size (sm|md|lg)
 * @param {boolean} props.dot - Show dot indicator
 * @param {string} props.className - Additional classes
 */
const Badge = ({
  children,
  variant = "default",
  size = "md",
  dot = false,
  className = "",
  ...props
}) => {
  const variants = {
    default: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
    primary: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
    success: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
    warning: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
    danger: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
    info: "bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200",
    purple: "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  const dotColors = {
    default: "bg-gray-400",
    primary: "bg-blue-500",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500",
    info: "bg-cyan-500",
    purple: "bg-purple-500",
  };

  const classes = cn(
    "inline-flex items-center font-medium rounded-full",
    variants[variant],
    sizes[size],
    className
  );

  return (
    <span className={classes} {...props}>
      {dot && (
        <span
          className={cn("w-2 h-2 rounded-full mr-1.5", dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
