import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import ProtectedRoute from '../components/ProtectedRoute';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Users from '../pages/Users';
import UserDetail from '../pages/UserDetail';
import Businesses from '../pages/Businesses';
import BusinessDetail from '../pages/BusinessDetail';
import JobPosts from '../pages/JobPosts';
import JobPostDetail from '../pages/JobPostDetail';
import Contacts from '../pages/Contacts';
import FAQs from '../pages/FAQs';
import Admins from '../pages/Admins';

const AppRouter = () => {
  return (
    <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/users"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/users/:id"
            element={
              <ProtectedRoute>
                <UserDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/businesses"
            element={
              <ProtectedRoute>
                <Businesses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/businesses/:id"
            element={
              <ProtectedRoute>
                <BusinessDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/job-posts"
            element={
              <ProtectedRoute>
                <JobPosts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/job-posts/:id"
            element={
              <ProtectedRoute>
                <JobPostDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/contacts"
            element={
              <ProtectedRoute>
                <Contacts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/faqs"
            element={
              <ProtectedRoute>
                <FAQs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admins"
            element={
              <ProtectedRoute>
                <Admins />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
};

export default AppRouter;

