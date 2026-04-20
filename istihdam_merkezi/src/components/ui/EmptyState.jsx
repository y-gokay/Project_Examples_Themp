import { Inbox } from "lucide-react";
import Button from "./Button";

/**
 * Empty State Component
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Custom icon
 * @param {string} props.title - Title text
 * @param {string} props.description - Description text
 * @param {React.ReactNode} props.action - Action button/content
 * @param {string} props.className - Additional classes
 */
const EmptyState = ({
  icon,
  title = "Henüz içerik yok",
  description,
  action,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        {icon || <Inbox className="w-8 h-8 text-gray-400 dark:text-gray-500" />}
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>

      {description && (
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">{description}</p>
      )}

      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
