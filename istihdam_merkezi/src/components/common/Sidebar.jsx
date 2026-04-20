import { Link, useLocation, useNavigate } from "react-router-dom";
import { X, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useAppStore } from "../../store";
import { ROLES, ROUTES } from "../../constants";
import { warn as logWarn } from "../../utils/logger";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Calendar,
  Settings,
  Users,
  Building2,
  BarChart3,
  HelpCircle,
  Heart,
  Lock,
} from "lucide-react";
import { cn } from "../../utils/helpers";
import logoImage from "../../assets/atim.webp";
import logoImageDark from "../../assets/atim_darkmode.webp";

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, getBusinessAccounts, theme } = useAppStore();
  const isSidebarOpen = isOpen;
  const [isOperator, setIsOperator] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.HOME);
    // Mobilde sidebar'ı kapat
    if (window.innerWidth < 1024 && onToggle) {
      onToggle();
    }
  };

  // Operatör kontrolü - sadece business/employer kullanıcılar için
  useEffect(() => {
    const checkOperatorStatus = async () => {
      const userRole = user?.role || user?.userType;
      if (
        (userRole === ROLES.EMPLOYER ||
          userRole === "employer" ||
          userRole === "business") &&
        getBusinessAccounts
      ) {
        try {
          const result = await getBusinessAccounts();
          if (result.success && result.data) {
            const accounts = result.data || [];
            const currentAccount = accounts.find(
              (acc) => acc.email === user?.email,
            );
            setIsOperator(currentAccount?.isOperator === true);
          }
        } catch (error) {
          // Hata durumunda operatör değil kabul et
          setIsOperator(false);
        }
      } else {
        setIsOperator(false);
      }
    };

    if (user) {
      checkOperatorStatus();
    }
  }, [user, getBusinessAccounts]);

  // Kullanıcı rolüne göre menü öğeleri
  const getMenuItems = () => {
    // User yoksa veya role yoksa varsayılan olarak seeker menüsünü göster
    const role = user?.role || ROLES.SEEKER;

    if (role === ROLES.SEEKER || role === "seeker") {
      return [
        {
          label: "Gösterge Paneli",
          icon: LayoutDashboard,
          path: ROUTES.DASHBOARD,
          exact: true,
        },
        {
          label: "Profilim",
          icon: Users,
          path: ROUTES.PROFILE,
        },
        {
          label: "Başvurularım",
          icon: FileText,
          path: ROUTES.MY_APPLICATIONS_PANEL,
        },
        {
          label: "Favorilerim",
          icon: Heart,
          path: ROUTES.MY_FAVORITES_PANEL,
        },
      ];
    }

    if (role === ROLES.EMPLOYER || role === "employer" || role === "business") {
      const menuItems = [
        {
          label: "Gösterge Paneli",
          icon: LayoutDashboard,
          path: ROUTES.EMPLOYER_PANEL,
        },
        {
          label: "Şirket Profili",
          icon: Building2,
          path: ROUTES.EMPLOYER_PROFILE,
        },
        {
          label: "İlanlarım",
          icon: Briefcase,
          path: ROUTES.EMPLOYER_MY_JOBS,
        },
        {
          label: "Şifre Değiştir",
          icon: Lock,
          path: ROUTES.EMPLOYER_CHANGE_PASSWORD,
        },
      ];

      // Hesaplar menüsü sadece operatörler için
      if (isOperator) {
        menuItems.push({
          label: "Hesaplar",
          icon: Users,
          path: ROUTES.EMPLOYER_ACCOUNTS,
        });
      }

      return menuItems;
    }

    if (role === ROLES.ADVISOR || role === "advisor") {
      return [
        {
          label: "Gösterge Paneli",
          icon: LayoutDashboard,
          path: "/danisman/panel",
        },
        {
          label: "Randevularım",
          icon: Calendar,
          path: "/danisman/randevular",
        },
        {
          label: "Adaylarım",
          icon: Users,
          path: "/danisman/adaylar",
        },
        {
          label: "Müsaitlik Ayarları",
          icon: Settings,
          path: "/danisman/musaitlik",
        },
        {
          label: "İstatistikler",
          icon: BarChart3,
          path: "/danisman/istatistikler",
        },
        {
          label: "Raporlar",
          icon: FileText,
          path: "/danisman/raporlar",
        },
      ];
    }

    if (role === ROLES.ADMIN || role === "admin") {
      return [
        {
          label: "Gösterge Paneli",
          icon: LayoutDashboard,
          path: "/admin/panel",
        },
        {
          label: "Kullanıcılar",
          icon: Users,
          path: "/admin/kullanicilar",
        },
        {
          label: "İlanlar",
          icon: Briefcase,
          path: "/admin/ilanlar",
        },
        {
          label: "İşverenler",
          icon: Building2,
          path: "/admin/isverenler",
        },
        {
          label: "Etkinlikler",
          icon: Calendar,
          path: "/admin/etkinlikler",
        },
        {
          label: "İstatistikler",
          icon: BarChart3,
          path: "/admin/istatistikler",
        },
        {
          label: "Raporlar",
          icon: FileText,
          path: "/admin/raporlar",
        },
        {
          label: "Ayarlar",
          icon: Settings,
          path: "/admin/ayarlar",
        },
      ];
    }

    return [];
  };

  const menuItems = getMenuItems();

  if (menuItems.length === 0) {
    logWarn("Sidebar: No menu items found. User:", user, "Role:", user?.role);
  }

  return (
    <>
      {/* Overlay - Mobilde sidebar açıkken */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 z-40 h-[calc(100vh-5rem)] w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg transition-transform duration-300 ease-in-out",
          "lg:translate-x-0 lg:z-30 lg:h-[calc(100vh-6rem)]",
          "top-20 lg:top-24", // Header'ın altından başla (mobil: 5rem, desktop: 6rem)
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Navigation */}
        <nav className="flex flex-col p-4 pt-6 overflow-y-auto h-full">
          <ul className="space-y-1 flex-1">
            {menuItems.length > 0 ? (
              menuItems.map((item) => {
                const Icon = item.icon;
                // Exact match için exact flag kontrolü, yoksa startsWith kontrolü
                const isActive = item.exact
                  ? location.pathname === item.path
                  : location.pathname === item.path ||
                    location.pathname.startsWith(item.path + "/");

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                        "hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 dark:hover:text-orange-400",
                        isActive
                          ? "bg-orange-50 dark:bg-gray-700 text-orange-600 dark:text-orange-400 font-semibold border-l-4 border-orange-600 dark:border-orange-400"
                          : "text-gray-700 dark:text-gray-300",
                      )}
                      onClick={() => {
                        // Mobilde menü öğesine tıklandığında sidebar'ı kapat
                        if (window.innerWidth < 1024 && onToggle) {
                          onToggle();
                        }
                      }}
                    >
                      <Icon
                        className={cn(
                          "w-5 h-5 flex-shrink-0",
                          isActive
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-gray-500 dark:text-gray-400",
                        )}
                      />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  </li>
                );
              })
            ) : (
              <li className="px-3 py-2.5 text-sm text-gray-500 dark:text-gray-400">
                Menü öğeleri yükleniyor...
              </li>
            )}
          </ul>

          {/* Alt kısımda yardım linki ve çıkış yap butonu */}
          <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 space-y-1">
            <Link
              to={ROUTES.CONTACT}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              onClick={() => {
                // Mobilde menü öğesine tıklandığında sidebar'ı kapat
                if (window.innerWidth < 1024 && onToggle) {
                  onToggle();
                }
              }}
            >
              <HelpCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">Yardım & Destek</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-300 transition-colors"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">Çıkış Yap</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
