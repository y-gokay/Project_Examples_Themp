import { cn } from "../../utils/helpers";

/**
 * Card Component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional classes
 * @param {boolean} props.hoverable - Enable hover effect
 * @param {boolean} props.clickable - Enable click cursor
 * @param {Function} props.onClick - Click handler
 * @param {string} props.padding - Padding size (none|sm|md|lg)
 */
const Card = ({
  children,
  className = "",
  hoverable = false,
  clickable = false,
  onClick,
  padding = "md",
  ...props
}) => {
  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  const classes = cn(
    "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-gray-900/30 transition-all duration-300",
    hoverable &&
      "hover:shadow-xl dark:hover:shadow-gray-900/50 hover:border-blue-200 dark:hover:border-blue-500 transform hover:-translate-y-1",
    clickable && "cursor-pointer",
    paddings[padding],
    className
  );

  return (
    <div className={classes} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

/**
 * Card Header
 */
export const CardHeader = ({ children, className = "", ...props }) => {
  return (
    <div className={cn("mb-4", className)} {...props}>
      {children}
    </div>
  );
};

/**
 * Card Title
 */
export const CardTitle = ({ children, className = "", ...props }) => {
  return (
    <h3
      className={cn("text-lg font-semibold text-gray-900 dark:text-gray-100", className)}
      {...props}
    >
      {children}
    </h3>
  );
};

/**
 * Card Content
 */
export const CardContent = ({ children, className = "", ...props }) => {
  return (
    <div className={cn("text-gray-700 dark:text-gray-300", className)} {...props}>
      {children}
    </div>
  );
};

/**
 * Card Footer
 */
export const CardFooter = ({ children, className = "", ...props }) => {
  return (
    <div
      className={cn("mt-4 pt-4 border-t border-gray-200 dark:border-gray-700", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
