import { cn } from "../../utils/helpers";

/**
 * Loading Spinner Component
 */
const Loading = ({
  size = "md",
  className = "",
  fullScreen = false,
  text = "",
}) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const spinner = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        className
      )}
    >
      <div
        className={cn(
          "animate-spin rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-400",
          sizes[size]
        )}
        role="status"
        aria-label="Yükleniyor"
      />
      {text && <p className="text-gray-600 dark:text-gray-400 text-sm">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 bg-opacity-90 dark:bg-opacity-90 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

/**
 * Skeleton Loading Component
 */
export const Skeleton = ({ className = "", variant = "rect", ...props }) => {
  const variants = {
    rect: "rounded",
    circle: "rounded-full",
    text: "rounded h-4",
  };

  return (
    <div
      className={cn("bg-gray-200 dark:bg-gray-700 animate-pulse", variants[variant], className)}
      {...props}
    />
  );
};

/**
 * Card Skeleton
 */
export const CardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
};

export default Loading;
