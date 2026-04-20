import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  User,
  LogOut,
  Briefcase,
  Calendar,
  BookOpen,
  ChevronDown,
  TrendingUp,
  Users,
  Building2,
  FileText,
  Heart,
  Moon,
  Sun,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useAppStore } from "../../store";
import { ROUTES, ROLES } from "../../constants";
import {
  Button,
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownDivider,
  Badge,
} from "../ui";
import { getToken, isTokenExpired, setToken } from "../../lib/api";
import logoImage from "../../assets/atim.webp";
import logoImageDark from "../../assets/atim_darkmode.webp";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    user,
    isAuthenticated: storeAuth,
    logout,
    theme,
    toggleTheme,
  } = useAppStore();

  const token = getToken();
  const isAuthenticated =
    storeAuth && !!token && !isTokenExpired(token);

  useEffect(() => {
    if (storeAuth && (!token || isTokenExpired(token))) {
      setToken(null);
      useAppStore.setState({ user: null, isAuthenticated: false });
    }
  }, [storeAuth, token]);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.HOME);
  };

  // Force theme update on header
  useEffect(() => {
    // Force re-render when theme changes
  }, [theme]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Handle ESC key to close mobile menu
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMobileMenuOpen]);

  // Business kullanıcıları için "İş İlanları" linkini kendi ilanlarına yönlendir
  const navigation = useMemo(() => {
    const userRole = user?.role || user?.userType;
    const isBusiness =
      userRole === ROLES.EMPLOYER ||
      userRole === "employer" ||
      userRole === "business";
    const jobsHref = isBusiness ? ROUTES.EMPLOYER_MY_JOBS : ROUTES.JOBS;
    const jobsName = isBusiness ? "İş İlanlarım" : "İş İlanları";

    return [
      {
        name: "Anasayfa",
        href: ROUTES.HOME,
        icon: Building2,
        color: "text-orange-600",
      },
      {
        name: jobsName,
        href: jobsHref,
        icon: Briefcase,
        color: "text-gray-700",
      },
      {
        name: "Hakkımızda",
        href: ROUTES.ABOUT,
        icon: BookOpen,
        color: "text-gray-700",
      },
      {
        name: "İletişim",
        href: ROUTES.CONTACT,
        icon: Calendar,
        color: "text-gray-700",
      },
    ];
  }, [user]);

  return (
    <>
      <header className="bg-white dark:bg-gray-800 backdrop-blur-md shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex items-center justify-between h-20 sm:h-20 lg:h-24">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0">
              <Link
                to={ROUTES.HOME}
                className="flex items-center gap-2 sm:gap-3 lg:gap-3 group"
                aria-label="Ana sayfaya git"
              >
                <div className="relative">
                  <img
                    src={theme === "dark" ? logoImageDark : logoImage}
                    alt="Atakum Belediyesi Logo"
                    className="w-20 h-20 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute -inset-2 bg-orange-600 rounded-full opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
                </div>
                <div className="block">
                  <span className="text-sm sm:text-base lg:text-lg xl:text-2xl font-bold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors whitespace-nowrap">
                    Atakum Belediyesi
                  </span>
                  <p className="text-xs sm:text-sm lg:text-sm xl:text-base text-gray-600 dark:text-gray-300 font-semibold whitespace-nowrap">
                    İstihdam Merkezi
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navigation.map((item) => {
                // Aktif sayfa kontrolü
                let isActive = false;
                if (item.href === ROUTES.HOME) {
                  // Anasayfa için sadece tam eşleşme
                  isActive = location.pathname === ROUTES.HOME;
                } else {
                  // Diğer sayfalar için tam eşleşme veya alt sayfalar
                  isActive =
                    location.pathname === item.href ||
                    location.pathname.startsWith(item.href + "/");
                }

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group relative flex items-center gap-1.5 xl:gap-2 px-2 lg:px-3 xl:px-4 py-2 lg:py-3 rounded-xl transition-all duration-300 ${
                      isActive
                        ? "text-orange-600 dark:text-orange-400 font-semibold bg-orange-50 dark:bg-gray-700 shadow-sm"
                        : "text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <item.icon
                      className={`w-5 h-5 xl:w-6 xl:h-6 transition-colors flex-shrink-0 ${
                        isActive
                          ? "text-orange-600 dark:text-orange-400"
                          : "text-gray-500 dark:text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400"
                      }`}
                    />
                    <span className="font-semibold text-sm xl:text-base text-gray-900 dark:text-gray-100 whitespace-nowrap">
                      {item.name}
                    </span>
                    {item.badge && (
                      <span className="px-2 xl:px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs xl:text-sm font-bold rounded-full shadow-sm">
                        {item.badge}
                      </span>
                    )}
                    {/* Hover effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                );
              })}
            </nav>

            {/* Right Side - Login Buttons or User Menu */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 sm:p-2.5 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-300 group border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-500"
                aria-label={
                  theme === "dark"
                    ? "Aydınlık temaya geç"
                    : "Karanlık temaya geç"
                }
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <Moon className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </button>

              {isAuthenticated ? (
                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                  {/* Desktop: Avatar with Dropdown */}
                  <div className="hidden lg:block">
                    <Dropdown
                      trigger={
                        <button className="flex items-center gap-3 p-2 hover:bg-orange-50 dark:hover:bg-gray-700 rounded-xl transition-all duration-300 group">
                          <Avatar
                            src={user?.avatar}
                            alt={user?.name}
                            size="md"
                            className="ring-2 ring-orange-200 group-hover:ring-orange-300 transition-all w-10 h-10"
                          />
                          <div className="text-left">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                              {user?.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {user?.role === ROLES.EMPLOYER
                                ? "İşveren"
                                : "İş Arayan"}
                            </p>
                          </div>
                          <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors" />
                        </button>
                      }
                      align="end"
                    >
                      <DropdownItem
                        icon={<TrendingUp className="w-4 h-4" />}
                        onClick={() => {
                          const userRole = user?.role || user?.userType;
                          if (
                            userRole === ROLES.EMPLOYER ||
                            userRole === "employer" ||
                            userRole === "business"
                          ) {
                            navigate("/isveren");
                          } else {
                            navigate("/panel");
                          }
                        }}
                      >
                        Panel
                      </DropdownItem>
                      <DropdownItem
                        icon={<User className="w-4 h-4" />}
                        onClick={() => {
                          const userRole = user?.role || user?.userType;
                          if (
                            userRole === ROLES.EMPLOYER ||
                            userRole === "employer" ||
                            userRole === "business"
                          ) {
                            navigate("/isveren/profil");
                          } else {
                            navigate("/profil");
                          }
                        }}
                      >
                        Profilim
                      </DropdownItem>
                      {/* Başvurularım ve Favorilerim sadece iş arayanlar için */}
                      {(() => {
                        const userRole = user?.role || user?.userType;
                        if (
                          userRole === ROLES.EMPLOYER ||
                          userRole === "employer" ||
                          userRole === "business"
                        ) {
                          return null;
                        }
                        return (
                          <>
                            <DropdownDivider />
                            <DropdownItem
                              icon={<FileText className="w-4 h-4" />}
                              onClick={() =>
                                navigate(ROUTES.MY_APPLICATIONS_PANEL)
                              }
                            >
                              Başvurularım
                            </DropdownItem>
                            <DropdownItem
                              icon={<Heart className="w-4 h-4" />}
                              onClick={() =>
                                navigate(ROUTES.MY_FAVORITES_PANEL)
                              }
                            >
                              Favorilerim
                            </DropdownItem>
                          </>
                        );
                      })()}
                      <DropdownDivider />
                      <DropdownItem
                        icon={<LogOut className="w-4 h-4" />}
                        onClick={handleLogout}
                        className="text-red-600"
                      >
                        Çıkış Yap
                      </DropdownItem>
                    </Dropdown>
                  </div>
                </div>
              ) : (
                <div className="hidden sm:flex gap-2 lg:gap-2 xl:gap-3 flex-shrink-0">
                  <Link to="/giris">
                    <Button
                      size="sm"
                      leftIcon={
                        <Users className="w-4 h-4 lg:w-4 xl:w-4 2xl:w-5 2xl:h-5" />
                      }
                      className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 sm:px-4 sm:py-2.5 lg:px-3 lg:py-2 2xl:px-5 2xl:py-2.5 text-xs sm:text-sm lg:text-sm 2xl:text-base font-semibold shadow-md hover:shadow-lg transition-all duration-300 whitespace-nowrap"
                    >
                      <span className="hidden 2xl:inline">Üye Girişi</span>
                      <span className="2xl:hidden">Giriş</span>
                    </Button>
                  </Link>
                  <Link to="/isveren/giris">
                    <Button
                      size="sm"
                      leftIcon={
                        <Briefcase className="w-4 h-4 lg:w-4 xl:w-4 2xl:w-5 2xl:h-5" />
                      }
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2.5 lg:px-3 lg:py-2 2xl:px-5 2xl:py-2.5 text-xs sm:text-sm lg:text-sm 2xl:text-base font-semibold shadow-md hover:shadow-lg transition-all duration-300 whitespace-nowrap"
                    >
                      <span className="hidden 2xl:inline">İşveren Girişi</span>
                      <span className="2xl:hidden">İşveren</span>
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button - Tek hamburger menü */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden relative p-2.5 sm:p-3 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-300 group ml-2 border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-500"
                aria-label={isMobileMenuOpen ? "Menüyü kapat" : "Menüyü aç"}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
              >
                <div className="flex flex-col gap-1.5 w-5 h-5 sm:w-6 sm:h-6 justify-center">
                  {isMobileMenuOpen ? (
                    <>
                      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-0.5 bg-current rotate-45 transition-all duration-300"></span>
                      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-0.5 bg-current -rotate-45 transition-all duration-300"></span>
                    </>
                  ) : (
                    <>
                      <span className="w-full h-0.5 bg-current rounded-full transition-all duration-300 group-hover:bg-orange-600"></span>
                      <span className="w-full h-0.5 bg-current rounded-full transition-all duration-300 group-hover:bg-orange-600"></span>
                      <span className="w-full h-0.5 bg-current rounded-full transition-all duration-300 group-hover:bg-orange-600"></span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Sidebar Style */}
      <>
        {/* Overlay */}
        <div
          className={`lg:hidden fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${
            isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
        {/* Sidebar Panel */}
        <div
          id="mobile-menu"
          className={`lg:hidden fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-800 shadow-2xl z-[70] transform transition-all duration-300 ease-in-out overflow-y-auto ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-menu-title"
        >
          {/* Header - Kullanıcı bilgisi veya Menü başlığı */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-orange-50 to-red-50 dark:from-gray-700 dark:to-gray-600">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Avatar
                  src={user?.avatar}
                  alt={user?.name}
                  size="md"
                  className="ring-2 ring-orange-200 w-10 h-10"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {user?.name} {user?.surname}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(() => {
                      const userRole = user?.role || user?.userType;
                      if (
                        userRole === ROLES.EMPLOYER ||
                        userRole === "employer" ||
                        userRole === "business"
                      ) {
                        return "İşveren";
                      }
                      return "İş Arayan";
                    })()}
                  </p>
                </div>
              </div>
            ) : (
              <h2
                id="mobile-menu-title"
                className="text-lg font-bold text-gray-900 dark:text-gray-100"
              >
                Menü
              </h2>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-orange-500"
              aria-label="Menüyü Kapat"
            >
              <div className="w-6 h-6 relative">
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-0.5 bg-current rotate-45"></span>
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-0.5 bg-current -rotate-45"></span>
              </div>
            </button>
          </div>

          <nav
            className="p-4 space-y-2"
            role="navigation"
            aria-label="Mobil navigasyon"
          >
            {/* Giriş yapmış kullanıcılar için Panel menüsü */}
            {isAuthenticated && (
              <>
                <p className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Hesabım
                </p>
                {(() => {
                  const userRole = user?.role || user?.userType;
                  const isEmployer =
                    userRole === ROLES.EMPLOYER ||
                    userRole === "employer" ||
                    userRole === "business";

                  const userMenuItems = isEmployer
                    ? [
                        {
                          name: "Gösterge Paneli",
                          href: "/isveren",
                          icon: TrendingUp,
                          exact: true,
                        },
                        {
                          name: "Şirket Profili",
                          href: "/isveren/profil",
                          icon: Building2,
                        },
                      ]
                    : [
                        {
                          name: "Gösterge Paneli",
                          href: "/panel",
                          icon: TrendingUp,
                          exact: true,
                        },
                        { name: "Profilim", href: "/profil", icon: User },
                        {
                          name: "Başvurularım",
                          href: ROUTES.MY_APPLICATIONS_PANEL,
                          icon: FileText,
                        },
                        {
                          name: "Favorilerim",
                          href: ROUTES.MY_FAVORITES_PANEL,
                          icon: Heart,
                        },
                      ];

                  return userMenuItems.map((item) => {
                    const isActive = item.exact
                      ? location.pathname === item.href
                      : location.pathname === item.href ||
                        location.pathname.startsWith(item.href + "/");

                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ${
                          isActive
                            ? "bg-orange-100 dark:bg-gray-700 text-orange-600 dark:text-orange-400 font-semibold"
                            : "text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 dark:hover:text-orange-400"
                        }`}
                      >
                        <item.icon
                          className={`w-5 h-5 ${isActive ? "text-orange-600 dark:text-orange-400" : "text-gray-500 dark:text-gray-400"}`}
                        />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    );
                  });
                })()}

                <div className="my-3 border-t border-gray-200 dark:border-gray-700"></div>
                {/* <p className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Navigasyon</p> */}
              </>
            )}

            {/* Ana navigasyon linkleri */}
            {navigation.map((item) => {
              const isActive =
                location.pathname === item.href ||
                (item.href !== ROUTES.HOME &&
                  location.pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-orange-100 dark:bg-gray-700 text-orange-600 dark:text-orange-400 font-semibold"
                      : "text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 dark:hover:text-orange-400"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <item.icon
                    className={`w-5 h-5 transition-colors ${
                      isActive
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-gray-500 dark:text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400"
                    }`}
                    aria-hidden="true"
                  />
                  <span className="font-medium">{item.name}</span>
                  {item.badge && (
                    <span className="ml-auto px-2 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Giriş yapmamış kullanıcılar için giriş butonları */}
            {!isAuthenticated && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <Link to="/giris" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    fullWidth
                    className="bg-gradient-to-r bg-blue-500 hover:bg-blue-600 text-white py-3 my-2 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2"
                  >
                    <Users className="w-5 h-5" />
                    <span>Üye Giriş</span>
                  </Button>
                </Link>
                <Link
                  to="/isveren/giris"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button
                    fullWidth
                    className="bg-gradient-to-r bg-blue-500 hover:bg-blue-600 text-white py-3 my-2 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2"
                  >
                    <Briefcase className="w-5 h-5" />
                    <span>İşveren Giriş</span>
                  </Button>
                </Link>
              </div>
            )}

            {/* Giriş yapmış kullanıcılar için çıkış butonu */}
            {isAuthenticated && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Çıkış Yap</span>
                </button>
              </div>
            )}
          </nav>
        </div>
      </>
    </>
  );
};

export default Header;
