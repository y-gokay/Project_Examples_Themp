import React, { useEffect, useCallback, lazy, Suspense } from "react";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MainLayout, AuthLayout, DashboardLayout } from "./layouts";
import { ROUTES } from "./constants";
import {
  ScrollToTop,
  ErrorBoundary,
  PageTransition,
} from "./components/common";
import { useAppStore } from "./store";
import { getToken, setToken, isTokenExpired } from "./lib/api";

// Public Sayfalar — lazy loaded
const Home = lazy(() => import("./pages/Home"));
const NotFound = lazy(() => import("./pages/NotFound"));
const JobList = lazy(() => import("./pages/jobs/JobList"));
const JobDetail = lazy(() => import("./pages/jobs/JobDetail"));
const About = lazy(() => import("./pages/static/About"));
const Contact = lazy(() => import("./pages/static/Contact"));
const Kvkk = lazy(() => import("./pages/static/Kvkk"));
const Terms = lazy(() => import("./pages/static/Terms"));
const Privacy = lazy(() => import("./pages/static/Privacy"));

// Kimlik Doğrulama Sayfaları — lazy loaded
const Login = lazy(() => import("./pages/auth/Login"));
const RegisterSeeker = lazy(() => import("./pages/auth/RegisterSeeker"));
const BusinessLogin = lazy(() => import("./pages/auth/BusinessLogin"));
const BusinessRegister = lazy(() => import("./pages/auth/BusinessRegister"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const BusinessForgotPassword = lazy(
  () => import("./pages/auth/BusinessForgotPassword"),
);

// İş Arayan Sayfaları — lazy loaded
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Applications = lazy(() => import("./pages/seeker/Applications"));
const Favorites = lazy(() => import("./pages/seeker/Favorites"));
const CVs = lazy(() => import("./pages/seeker/CVs"));
const Appointments = lazy(() => import("./pages/seeker/Appointments"));
const SavedSearches = lazy(() => import("./pages/seeker/SavedSearches"));

// İşveren Sayfaları — lazy loaded (TipTap editörü burada, kritik)
const BusinessDashboard = lazy(
  () => import("./pages/business/BusinessDashboard"),
);
const BusinessProfile = lazy(() => import("./pages/business/BusinessProfile"));
const BusinessJobPosts = lazy(
  () => import("./pages/business/BusinessJobPosts"),
);
const BusinessAccounts = lazy(
  () => import("./pages/business/BusinessAccounts"),
);
const BusinessChangePassword = lazy(
  () => import("./pages/business/BusinessChangePassword"),
);
const CreateJobPost = lazy(() => import("./pages/business/CreateJobPost"));
const EditJobPost = lazy(() => import("./pages/business/EditJobPost"));

// Toast Container - Global bildirimler için
import { ToastContainer } from "./components/ui";

/**
 * Ana App Component'i
 *
 * Tüm route'lar burada tanımlanır.
 * Her route bir layout ile sarılır ve bir sayfa component'i render eder.
 *
 * @returns {JSX.Element} Ana uygulama component'i
 */
const TOKEN_CHECK_INTERVAL = 60 * 1000;

function App() {
  const { theme, isAuthenticated } = useAppStore();

  const checkTokenExpiration = useCallback(() => {
    if (!isAuthenticated) return;
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      setToken(null);
      useAppStore.setState({ user: null, isAuthenticated: false });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    checkTokenExpiration();
    const interval = setInterval(checkTokenExpiration, TOKEN_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [checkTokenExpiration]);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <ErrorBoundary>
      <Router>
        <ScrollToTop />
        <PageTransition />
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <Routes>
            {/* Public Routes with MainLayout */}
            <Route element={<MainLayout />}>
              <Route path={ROUTES.HOME} element={<Home />} />
              <Route path={ROUTES.JOBS} element={<JobList />} />
              <Route path={ROUTES.JOB_DETAIL} element={<JobDetail />} />
              <Route path={ROUTES.ABOUT} element={<About />} />
              <Route path={ROUTES.CONTACT} element={<Contact />} />
              <Route path={ROUTES.KVKK} element={<Kvkk />} />
              <Route path={ROUTES.PRIVACY} element={<Privacy />} />
              <Route path={ROUTES.TERMS} element={<Terms />} />
            </Route>

            {/* Auth Routes with AuthLayout */}
            <Route element={<AuthLayout />}>
              <Route path={ROUTES.LOGIN} element={<Login />} />
              <Route path={ROUTES.REGISTER} element={<RegisterSeeker />} />
              <Route
                path={ROUTES.FORGOT_PASSWORD}
                element={<ForgotPassword />}
              />
              <Route path={ROUTES.EMPLOYER_LOGIN} element={<BusinessLogin />} />
              <Route
                path={ROUTES.EMPLOYER_REGISTER}
                element={<BusinessRegister />}
              />
              <Route
                path={ROUTES.EMPLOYER_FORGOT_PASSWORD}
                element={<BusinessForgotPassword />}
              />
            </Route>

            {/* Dashboard Routes with DashboardLayout */}
            <Route element={<DashboardLayout />}>
              {/* Normal Import - Sık kullanılan sayfalar */}
              <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
              <Route path={ROUTES.PROFILE} element={<Profile />} />
              <Route
                path={ROUTES.MY_APPLICATIONS_PANEL}
                element={<Applications />}
              />
              <Route path={ROUTES.MY_FAVORITES_PANEL} element={<Favorites />} />
              <Route path={ROUTES.MY_CVS_PANEL} element={<CVs />} />
              <Route
                path={ROUTES.APPOINTMENTS_PANEL}
                element={<Appointments />}
              />
              <Route
                path={ROUTES.SAVED_SEARCHES_PANEL}
                element={<SavedSearches />}
              />
              {/* Business Routes - Normal Import (sık kullanılan) */}
              <Route
                path={ROUTES.EMPLOYER_DASHBOARD}
                element={<BusinessDashboard />}
              />
              <Route
                path={ROUTES.EMPLOYER_PANEL}
                element={<BusinessDashboard />}
              />
              <Route
                path={ROUTES.EMPLOYER_PROFILE}
                element={<BusinessProfile />}
              />
              <Route
                path={ROUTES.EMPLOYER_MY_JOBS}
                element={<BusinessJobPosts />}
              />
              <Route
                path={ROUTES.EMPLOYER_ACCOUNTS}
                element={<BusinessAccounts />}
              />
              <Route
                path={ROUTES.EMPLOYER_CHANGE_PASSWORD}
                element={<BusinessChangePassword />}
              />
              <Route
                path={ROUTES.EMPLOYER_JOB_CREATE}
                element={<CreateJobPost />}
              />
              <Route
                path={ROUTES.EMPLOYER_JOB_EDIT}
                element={<EditJobPost />}
              />
            </Route>

            {/* 404 - Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <ToastContainer />
      </Router>
    </ErrorBoundary>
  );
}

export default App;
