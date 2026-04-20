import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import MainLayout from "./Layout/MainLayout";
import Header from "./components/Header/header";
import Footer from "./components/Footer/Footer";

// User Pages
import UserMainPage from "./pages/User/UserMainPage/UserMainPage";
import LoginPageUser from "./pages/User/LoginPageUser/LoginPage";
import UserProfile from "./pages/User/UserProfile/UserProfile";
import UserSearchBooks from "./pages/User/UserSearchBooks/UserSearchBooks";
import Announcements from "./pages/User/Announcements/Announcements";
import ServicesPage from "./pages/User/ServicesPage/ServicesPage";
import NotFound from "./pages/NotFound/NotFound";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  const { loggedUser } = useSelector((state) => state.auth);

  return (
    <div key={location.pathname} className="page-transition">
      <Routes location={location}>
        {/* User Routes */}
        <Route path="/" element={<UserMainPage />} />
        <Route path="/giris" element={<LoginPageUser />} />
        <Route
          path="/profil"
          element={loggedUser ? <UserProfile /> : <LoginPageUser />}
        />
        <Route path="/kitaplar" element={<UserSearchBooks />} />
        <Route path="/duyurular" element={<Announcements />} />
        <Route path="/hizmetler" element={<ServicesPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <>
      <MainLayout>
        <ScrollToTop />
        <Header />
        <AnimatedRoutes />
        <Footer />
        <ToastContainer />
      </MainLayout>
    </>
  );
}

export default App;
