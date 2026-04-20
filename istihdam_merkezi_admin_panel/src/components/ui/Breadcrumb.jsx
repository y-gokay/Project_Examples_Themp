import { Link, useLocation } from "react-router-dom";
import { ChevronRightIcon, HomeIcon } from "@heroicons/react/24/outline";

const routeLabels = {
  dashboard: "Anasayfa",
  users: "Kullanıcılar",
  businesses: "İşletmeler",
  "job-posts": "İş İlanları",
  contacts: "İletişim",
  faqs: "SSS",
  admins: "Adminler",
};

const Breadcrumb = ({ customItems }) => {
  const location = useLocation();

  const items = customItems || buildFromPath(location.pathname);

  if (items.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center flex-wrap gap-1 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.href || index} className="flex items-center">
              {index > 0 && (
                <ChevronRightIcon className="w-4 h-4 text-gray-400 dark:text-gray-400 mx-1 flex-shrink-0" />
              )}
              {index === 0 && (
                <HomeIcon className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-400 flex-shrink-0" />
              )}
              {isLast || !item.href ? (
                <span className="text-gray-600 dark:text-gray-300 font-medium truncate max-w-[200px]">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className="text-blue-600 dark:text-orange-400 hover:text-blue-800 dark:hover:text-orange-600 hover:underline transition-colors truncate max-w-[200px]"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

function buildFromPath(pathname) {
  const segments = pathname.split("/").filter(Boolean);
  const items = [];

  let currentPath = "";
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const label = routeLabels[segment];

    if (label) {
      items.push({ label, href: currentPath });
    } else if (/^\d+$/.test(segment)) {
      items.push({ label: `#${segment}` });
    }
  }

  return items;
}

export default Breadcrumb;
