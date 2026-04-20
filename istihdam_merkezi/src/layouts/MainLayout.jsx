import { Outlet } from "react-router-dom";
import Header from "../components/common/Header";
import { PageWrapper } from "../components/common";
import Footer from "../components/common/Footer";
import { ToastContainer } from "../components/ui";

/**
 * Main Layout
 * Used for public pages (home, jobs, etc.)
 */
const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="skip-link">
        Ana içeriğe atla
      </a>

      <Header />

      <main id="main-content" className="flex-1 bg-gray-50 dark:bg-gray-900">
        <PageWrapper>
          <Outlet />
        </PageWrapper>
      </main>

      <Footer />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default MainLayout;
