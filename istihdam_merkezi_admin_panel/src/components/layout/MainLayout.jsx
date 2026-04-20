import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import {
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/outline";

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex">
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => {
            setSidebarOpen((prev) => !prev);
          }}
          isMobile={isMobile}
          closeMobile={() => setMobileMenuOpen(false)}
        />
      </div>

      <div className="flex-1 flex flex-col transition-all duration-300 min-w-0">
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10">
          <div className="px-4 lg:px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="mr-3 lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Bars3Icon className="w-6 h-6" />
                </button>
                <div className="h-10 w-1 bg-gradient-to-b from-blue-600 to-blue-800 dark:from-orange-400 dark:to-orange-600 rounded-full mr-3 lg:mr-4 hidden sm:block"></div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-orange-400 dark:to-orange-600 bg-clip-text text-transparent">
                    İstihdam Merkezi
                  </h1>
                  <p className="text-xs text-black dark:text-white">
                    Yönetim Paneli
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label={
                    isDarkMode ? "Açık moda geç" : "Karanlık moda geç"
                  }
                >
                  {isDarkMode ? (
                    <SunIcon className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <MoonIcon className="w-5 h-5" />
                  )}
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-orange-400 dark:to-orange-600 flex items-center justify-center text-white font-semibold text-sm">
                      {(user?.username || "A").charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:inline">
                      {user?.username || "Admin"}
                    </span>
                    <ChevronDownIcon
                      className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${showUserMenu ? "rotate-180" : ""}`}
                    />
                  </button>

                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => setShowUserMenu(false)}
                      ></div>
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-30">
                        <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {user?.username || "Admin"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Yönetici
                          </p>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                          Çıkış Yap
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main id="main-scroll-container" className="flex-1 p-3 sm:p-4 md:p-6 overflow-x-hidden overflow-y-auto min-w-0">
          <div className="w-full max-w-full min-w-0">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
