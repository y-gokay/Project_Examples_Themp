import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import type { Role } from '@/types/api';

interface ProtectedRouteProps {
  requiredRole?: Role;
}

export function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const location = useLocation();
  const token = useAppStore((s) => s.token);
  const user = useAppStore((s) => s.user);
  const hydrate = useAppStore((s) => s.hydrate);
  const logout = useAppStore((s) => s.logout);
  const [hydrating, setHydrating] = useState(Boolean(token) && !user);

  useEffect(() => {
    let cancelled = false;
    if (token && !user) {
      setHydrating(true);
      hydrate()
        .then(() => {
          /* ok */
        })
        .catch(() => {
          if (!cancelled) logout();
        })
        .finally(() => {
          if (!cancelled) setHydrating(false);
        });
    } else {
      setHydrating(false);
    }
    return () => {
      cancelled = true;
    };
  }, [token, user, hydrate, logout]);

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (hydrating) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Yükleniyor…
      </div>
    );
  }

  if (requiredRole && user && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
