import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Store,
  ListTree,
  UtensilsCrossed,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

export interface SidebarNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  superAdminOnly?: boolean;
}

export const SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
  { to: '/', label: 'Panel', icon: LayoutDashboard },
  { to: '/venues', label: 'Mekanlar', icon: Store, superAdminOnly: true },
  { to: '/categories', label: 'Kategoriler', icon: ListTree },
  { to: '/products', label: 'Ürünler', icon: UtensilsCrossed },
  { to: '/admins', label: 'Admin Kullanıcılar', icon: Users, superAdminOnly: true },
];

interface SidebarNavProps {
  layoutId?: string;
  onNavigate?: () => void;
}

export function SidebarNav({ layoutId = 'sidebar-active', onNavigate }: SidebarNavProps) {
  const user = useAppStore((s) => s.user);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  return (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      {SIDEBAR_NAV_ITEMS.filter((it) => !it.superAdminOnly || isSuperAdmin).map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span
                  layoutId={layoutId}
                  className="absolute inset-0 rounded-lg bg-primary-50"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-3">
                <item.icon className="h-4 w-4" />
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
