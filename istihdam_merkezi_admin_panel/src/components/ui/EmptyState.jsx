import { Link } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  FolderOpenIcon,
} from "@heroicons/react/24/outline";

const presets = {
  noData: {
    icon: FolderOpenIcon,
    iconColor: "text-gray-400 dark:text-orange-400",
  },
  noResults: {
    icon: MagnifyingGlassIcon,
    iconColor: "text-blue-400 dark:text-orange-400",
  },
};

const EmptyState = ({
  preset = "noData",
  icon: CustomIcon,
  title = "Veri bulunamadı",
  description,
  actionLabel,
  actionHref,
  onAction,
}) => {
  const config = presets[preset] || presets.noData;
  const Icon = CustomIcon || config.icon;

  return (
    <div className="p-12 text-center">
      <Icon className={`w-16 h-16 mx-auto mb-4 ${config.iconColor}`} />
      <h3 className="text-lg font-semibold text-gray-700  dark:text-gray-200 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
          {description}
        </p>
      )}
      {actionLabel && actionHref && (
        <Link
          to={actionHref}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 dark:bg-orange-400 text-white dark:text-white rounded-lg hover:bg-blue-700 dark:hover:bg-orange-600 font-medium transition-colors text-sm"
        >
          <PlusIcon className="w-4 h-4" />
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 dark:bg-orange-400 text-white dark:text-white rounded-lg hover:bg-blue-700 dark:hover:bg-orange-600 font-medium transition-colors text-sm"
        >
          <PlusIcon className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
