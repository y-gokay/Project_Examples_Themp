import { useLocation, useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { getBasicStats } from "../../api/dashboardService";
import { getAllContacts } from "../../api/contactService";
import {
  HomeIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  QuestionMarkCircleIcon,
  EnvelopeIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import belediyelogo from "../../assets/belediyelogo_darkmode.png";

const Sidebar = ({ isOpen = true, onToggle, isMobile, closeMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const toggleButtonRef = useRef(null);
  const [basicStats, setBasicStats] = useState(null);
  const [pendingContactsCount, setPendingContactsCount] = useState(0);

  const actualIsOpen = isMobile ? true : isOpen;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsResponse, contactsResponse] = await Promise.all([
          getBasicStats(),
          getAllContacts({ page: 1, limit: 1, status: "pending" }),
        ]);

        if (statsResponse.success) {
          setBasicStats(statsResponse.data);
        }
        if (contactsResponse.success) {
          setPendingContactsCount(
            contactsResponse?.data?.pagination?.total || 0,
          );
        }
      } catch (error) {
        console.error("Error fetching sidebar stats:", error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const allNavigation = [
    { name: "Anasayfa", href: "/dashboard", icon: HomeIcon },
    { name: "Kullanıcılar", href: "/dashboard/users", icon: UserGroupIcon },
    {
      name: "İşletmeler",
      href: "/dashboard/businesses",
      icon: BuildingOfficeIcon,
      badges: [
        {
          count: basicStats?.businesses?.pending || 0,
          label: "Onay Bekleyen",
          color: "bg-yellow-500",
        },
        {
          count: basicStats?.changeRequests?.pending || 0,
          label: "Değişim İsteği",
          color: "bg-orange-500",
        },
      ],
    },
    {
      name: "İş İlanları",
      href: "/dashboard/job-posts",
      icon: BriefcaseIcon,
      badges: [
        {
          count: basicStats?.jobPosts?.pending || 0,
          label: "Bekleyen İlan",
          color: "bg-yellow-500",
        },
        {
          count: basicStats?.applications?.pending || 0,
          label: "Bekleyen Başvuru",
          color: "bg-blue-500",
        },
        {
          count: basicStats?.jobPostUpdateRequests?.pending || 0,
          label: "Güncelleme İsteği",
          color: "bg-orange-500",
        },
      ],
    },
    { name: "İletişim", href: "/dashboard/contacts", icon: EnvelopeIcon },
    { name: "SSS", href: "/dashboard/faqs", icon: QuestionMarkCircleIcon },
    {
      name: "Adminler",
      href: "/dashboard/admins",
      icon: ShieldCheckIcon,
      requiresSuperAdmin: true,
    },
  ];

  const navigation = allNavigation.filter((item) => {
    if (item.requiresSuperAdmin) return user && user.isSuperAdmin;
    return true;
  });

  const isActive = (href) => {
    if (href === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(href);
  };

  const handleNavigate = (href) => {
    navigate(href);
    if (isMobile && closeMobile) closeMobile();
  };

  const getBadgeHref = (sectionName, badgeLabel) => {
    if (sectionName === "İşletmeler" && badgeLabel === "Onay Bekleyen")
      return "/dashboard/businesses?page=1&limit=10&isApproved=null";
    if (sectionName === "İşletmeler" && badgeLabel === "Değişim İsteği")
      return "/dashboard/businesses?page=1&limit=10&isApproved=true";
    if (sectionName === "İş İlanları" && badgeLabel === "Bekleyen İlan")
      return "/dashboard/job-posts?page=1&limit=10&isApproved=null";
    if (sectionName === "İş İlanları" && badgeLabel === "Bekleyen Başvuru")
      return "/dashboard/job-posts?page=1&limit=10&isApproved=true";
    if (sectionName === "İş İlanları" && badgeLabel === "Güncelleme İsteği")
      return "/dashboard/job-posts?page=1&limit=10&isApproved=true";
    const section = navigation.find((n) => n.name === sectionName);
    return section?.href || "/dashboard";
  };

  const sidebarBg = isDarkMode
    ? "bg-gradient-to-b from-gray-900 to-gray-800"
    : "bg-gradient-to-b from-blue-900 to-blue-800";

  const borderColor = isDarkMode ? "border-gray-700/50" : "border-blue-700/50";

  return (
    <div
      className={`${sidebarBg} shadow-2xl h-full min-h-screen flex flex-col transition-[width] duration-300 ease-in-out overflow-hidden ${
        actualIsOpen ? "w-64" : "w-20"
      }`}
    >
      <div
        className={`p-6 border-b ${borderColor} transition-all duration-300 ${actualIsOpen ? "" : "px-3"}`}
      >
        <div
          className={
            actualIsOpen
              ? "flex items-center justify-between"
              : "flex flex-col items-center justify-center gap-3"
          }
        >
          <div
            className={`flex items-center ${actualIsOpen ? "" : "justify-center"}`}
          >
            <img
              src={belediyelogo}
              alt="Atakum Belediyesi Logo"
              className={
                actualIsOpen
                  ? "h-10 object-contain flex-shrink-0"
                  : "h-12 object-contain flex-shrink-0"
              }
            />
            <div
              className={`transition-all duration-300 overflow-hidden whitespace-nowrap flex flex-col ${actualIsOpen ? "w-40 ml-3 opacity-100" : "w-0 ml-0 opacity-0"}`}
            >
              <h2 className="text-lg font-bold text-white">Admin Panel</h2>
              <p
                className={`text-xs ${isDarkMode ? "text-gray-400" : "text-blue-200"}`}
              >
                İstihdam Merkezi
              </p>
            </div>
          </div>

          {!isMobile && (
            <button
              ref={toggleButtonRef}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onToggle) onToggle(e);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className={`${actualIsOpen ? "ml-2" : ""} p-1.5 rounded-lg ${isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-blue-700/50"} transition-colors text-white`}
              title={actualIsOpen ? "Küçült" : "Büyüt"}
            >
              {actualIsOpen ? (
                <ChevronLeftIcon className="w-5 h-5" />
              ) : (
                <ChevronRightIcon className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>

      <nav
        className={`py-6 space-y-2 transition-all duration-300 ${actualIsOpen ? "px-4" : "px-2"}`}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <button
              key={item.name}
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleNavigate(item.href);
              }}
              className={`relative w-full flex items-center ${actualIsOpen ? "px-4" : "px-2 justify-center"} py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                active
                  ? isDarkMode
                    ? "bg-gray-700 text-white shadow-lg transform scale-105"
                    : "bg-white text-blue-900 shadow-lg transform scale-105"
                  : isDarkMode
                    ? "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                    : "text-white/90 hover:bg-blue-700/50 hover:text-white"
              }`}
              title={!actualIsOpen ? item.name : ""}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span
                className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${actualIsOpen ? "opacity-100 w-32 ml-3" : "opacity-0 w-0"}`}
              >
                {item.name}
              </span>
              {item.name === "İletişim" && pendingContactsCount > 0 && (
                <span
                  className={`${actualIsOpen ? "ml-auto" : "absolute -top-1 -right-1"} bg-red-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center`}
                  title={`Bekleyen iletişim talebi: ${pendingContactsCount}`}
                >
                  {pendingContactsCount > 99 ? "99+" : pendingContactsCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div
        className={`border-t ${borderColor} transition-opacity duration-300`}
      >
        {actualIsOpen ? (
          <div className="p-4 space-y-3">
            {navigation.find((item) => item.name === "İşletmeler")?.badges && (
              <div className="space-y-2">
                <p
                  className={`text-xs font-semibold uppercase tracking-wide ${isDarkMode ? "text-gray-400" : "text-blue-200"}`}
                >
                  İşletmeler
                </p>
                <div className="flex flex-col gap-1.5">
                  {navigation
                    .find((item) => item.name === "İşletmeler")
                    .badges.map((badge, i) => (
                      <div
                        key={i}
                        onClick={() =>
                          handleNavigate(
                            getBadgeHref("İşletmeler", badge.label),
                          )
                        }
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <span
                          className={`${badge.color} text-white text-xs font-semibold px-2 py-1 rounded-lg w-full flex items-center justify-between`}
                          title={`${badge.label}: ${badge.count}`}
                        >
                          <span>{badge.label}</span>
                          <span className="bg-white/30 px-2 py-0.5 rounded-full font-bold min-w-[1.75rem] text-center">
                            {badge.count > 99 ? "99+" : badge.count}
                          </span>
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
            {navigation.find((item) => item.name === "İş İlanları")?.badges && (
              <div className="space-y-2">
                <p
                  className={`text-xs font-semibold uppercase tracking-wide ${isDarkMode ? "text-gray-400" : "text-blue-200"}`}
                >
                  İş İlanları
                </p>
                <div className="flex flex-col gap-1.5">
                  {navigation
                    .find((item) => item.name === "İş İlanları")
                    .badges.map((badge, i) => (
                      <div
                        key={i}
                        onClick={() =>
                          handleNavigate(
                            getBadgeHref("İş İlanları", badge.label),
                          )
                        }
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <span
                          className={`${badge.color} text-white text-xs font-semibold px-2 py-1 rounded-lg w-full flex items-center justify-between`}
                          title={`${badge.label}: ${badge.count}`}
                        >
                          <span>{badge.label}</span>
                          <span className="bg-white/30 px-2 py-0.5 rounded-full font-bold min-w-[1.75rem] text-center">
                            {badge.count > 99 ? "99+" : badge.count}
                          </span>
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-2 flex flex-col items-center gap-2">
            {navigation
              .find((item) => item.name === "İşletmeler")
              ?.badges?.map((badge, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() =>
                    handleNavigate(getBadgeHref("İşletmeler", badge.label))
                  }
                  className="cursor-pointer hover:opacity-80 transition-opacity focus:outline-none"
                  title={`${badge.label}: ${badge.count}`}
                >
                  <span
                    className={`${badge.color} text-white text-[10px] font-semibold px-2 py-1 rounded-full min-w-[2.25rem] flex items-center justify-center`}
                  >
                    {badge.count > 99 ? "99+" : badge.count}
                  </span>
                </button>
              ))}
            {navigation
              .find((item) => item.name === "İş İlanları")
              ?.badges?.map((badge, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() =>
                    handleNavigate(getBadgeHref("İş İlanları", badge.label))
                  }
                  className="cursor-pointer hover:opacity-80 transition-opacity focus:outline-none"
                  title={`${badge.label}: ${badge.count}`}
                >
                  <span
                    className={`${badge.color} text-white text-[10px] font-semibold px-2 py-1 rounded-full min-w-[2.25rem] flex items-center justify-center`}
                  >
                    {badge.count > 99 ? "99+" : badge.count}
                  </span>
                </button>
              ))}
          </div>
        )}
      </div>

      <div className="flex-1"></div>

      <div
        className={`border-t ${borderColor} transition-all duration-300 overflow-hidden whitespace-nowrap ${actualIsOpen ? "p-4 opacity-100" : "h-0 p-0 opacity-0 border-t-0"}`}
      >
        <p
          className={`text-xs text-center ${isDarkMode ? "text-gray-400" : "text-blue-200"}`}
        >
          © {new Date().getFullYear()} Atakum Belediyesi
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
