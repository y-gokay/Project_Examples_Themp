import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  UserCog,
  BookOpen,
  NotebookPen,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/psikolog/panel',     label: 'Panel',    Icon: LayoutDashboard },
  { to: '/profilim',           label: 'Profil',   Icon: UserCog },
  { to: '/psikolog/musaitlik', label: 'Müsaitlik',Icon: CalendarDays },
  { to: '/psikolog/hastalar',  label: 'Notlar',   Icon: NotebookPen },
  { to: '/yazilarim',          label: 'Yazılar',  Icon: BookOpen },
];

const BottomNav = () => (
  <nav
    className="md:hidden fixed bottom-0 inset-x-0 z-50 flex items-center px-2 pb-[env(safe-area-inset-bottom)] pt-2"
    style={{
      background: 'rgba(var(--bg-elev), 0.85)',
      borderTop: '1px solid rgba(var(--border-strong))',
      backdropFilter: 'blur(30px)',
      WebkitBackdropFilter: 'blur(30px)',
      boxShadow: '0 -10px 40px rgba(0,0,0,0.05)'
    }}
  >
    <div className="flex w-full justify-around mb-2">
      {NAV_ITEMS.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/psikolog/panel'}
          className="relative flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-300"
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <div 
                  className="absolute inset-0 rounded-2xl opacity-15"
                  style={{ background: 'rgb(var(--accent))' }}
                />
              )}
              {isActive && (
                <div 
                  className="absolute -top-3 w-8 h-1 rounded-full shadow-[0_2px_8px_rgba(var(--accent),0.8)]"
                  style={{ background: 'rgb(var(--accent))' }}
                />
              )}
              <Icon 
                className={`w-5 h-5 mb-1 transition-transform duration-300 ${isActive ? 'scale-110 mb-1.5' : ''}`} 
                style={{ color: isActive ? 'rgb(var(--accent))' : 'rgb(var(--text-3))' }} 
              />
              <span 
                className={`text-[10px] font-bold transition-all duration-300 ${isActive ? 'opacity-100 transform translate-y-0 text-accent' : 'opacity-70 transform -translate-y-0.5'}`}
                style={{ color: isActive ? 'rgb(var(--accent))' : 'rgb(var(--text-3))' }}
              >
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  </nav>
);

export default BottomNav;
