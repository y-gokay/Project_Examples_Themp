import { useEffect, type ReactNode } from 'react';
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { VenuesListPage } from '@/pages/venues/VenuesListPage';
import { CategoriesPage } from '@/pages/categories/CategoriesPage';
import { ProductsPage } from '@/pages/products/ProductsPage';
import { AdminUsersPage } from '@/pages/admins/AdminUsersPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

function RootLayout() {
  return (
    <>
      <SessionRedirect />
      <Outlet />
    </>
  );
}

/** 401 sonrası token silindiğinde korumalı sayfadan /login'e taşır */
function SessionRedirect() {
  const token = useAppStore((s) => s.token);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token && location.pathname !== '/login') {
      navigate('/login', { replace: true, state: { from: location } });
    }
  }, [token, location, navigate]);

  return null;
}

function RequireSuperAdmin({ children }: { children: ReactNode }) {
  const role = useAppStore((s) => s.user?.role);
  if (role !== 'SUPER_ADMIN') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppShell />,
            children: [
              { index: true, element: <DashboardPage /> },
              {
                path: 'venues',
                element: (
                  <RequireSuperAdmin>
                    <VenuesListPage />
                  </RequireSuperAdmin>
                ),
              },
              { path: 'categories', element: <CategoriesPage /> },
              { path: 'products', element: <ProductsPage /> },
              {
                path: 'admins',
                element: (
                  <RequireSuperAdmin>
                    <AdminUsersPage />
                  </RequireSuperAdmin>
                ),
              },
              { path: '*', element: <NotFoundPage /> },
            ],
          },
        ],
      },
    ],
  },
]);

export default function App() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <RouterProvider router={router} />
    </div>
  );
}
