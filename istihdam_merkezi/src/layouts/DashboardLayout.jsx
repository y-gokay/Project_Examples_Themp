import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../components/common/Header";
import Sidebar from "../components/common/Sidebar";
import { PageWrapper } from "../components/common";
import { ToastContainer } from "../components/ui";
import { useAppStore } from "../store";
import { getToken, setToken, isTokenExpired } from "../lib/api";
import { ROUTES } from "../constants";

/**
 * Dashboard Layout
 * Used for authenticated user pages (profile, applications, etc.)
 */
const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAppStore();

  const token = getToken();
  const isValidAuth =
    isAuthenticated && !!user && !!token && !isTokenExpired(token);

  // Desktop'ta sidebar varsayılan açık
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isValidAuth) {
      if (isAuthenticated) {
        setToken(null);
        useAppStore.setState({ user: null, isAuthenticated: false });
      }
      const currentPath = window.location.pathname;
      const loginRoute = currentPath.startsWith("/isveren")
        ? ROUTES.EMPLOYER_LOGIN
        : ROUTES.LOGIN;
      navigate(loginRoute + "?sessionExpired=1", { replace: true });
    }
  }, [isValidAuth, isAuthenticated, navigate]);

  // Mobilde sayfa değiştiğinde sidebar'ı kapat
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  if (!isValidAuth) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Skip to main content link */}
      <a href="#main-content" className="skip-link">
        Ana içeriğe atla
      </a>

      <Header />

      <div className="flex-1 flex relative">
        {/* Sidebar - Sadece desktop'ta göster */}
        <div className="hidden lg:block">
          <Sidebar
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            userRole={user?.role}
          />
        </div>

        {/* Main Content */}
        <main
          id="main-content"
          className={`flex-1 transition-all duration-300 ${
            isSidebarOpen ? "lg:ml-64" : "lg:ml-0"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <PageWrapper>
              <Outlet />
            </PageWrapper>
          </div>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

export default DashboardLayout;
