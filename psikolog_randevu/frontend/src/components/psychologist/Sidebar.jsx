import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  UserCog,
  BookOpen,
  NotebookPen,
  LogOut,
  History,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { absoluteUrl } from '../../lib/markdown';

const NAV_ITEMS = [
  { to: '/psikolog/panel', label: 'Panel', Icon: LayoutDashboard },
  { to: '/profilim', label: 'Profilim', Icon: UserCog },
  { to: '/psikolog/musaitlik', label: 'Müsaitlik', Icon: CalendarDays },
  { to: '/psikolog/hastalar', label: 'Hasta Notları', Icon: NotebookPen },
  { to: '/yazilarim', label: 'Yazılarım', Icon: BookOpen },
  { to: '/psikolog/gecmis', label: 'Geçmiş', Icon: History },
];

const Sidebar = ({ psyName, avatarUrl }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (!confirm("Çıkış yapmak istediğinize emin misiniz?")) return;
    await logout();
    navigate('/giris');
  };

  return (
    <aside
      className="hidden md:flex flex-col w-[280px] flex-shrink-0 sticky top-[6.5rem] self-start"
      style={{ height: 'calc(100vh - 8rem)' }}
    >
      <div
        className="flex-1 flex flex-col overflow-hidden rounded-[2.5rem] border shadow-2xl relative"
        style={{
          background: 'rgba(var(--bg-elev), 0.7)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderColor: 'rgba(var(--border-strong))',
          boxShadow: '0 24px 50px -12px rgba(var(--shadow-color), 0.15)'
        }}
      >
        {/* Soft Glow Ambient at the top inside sidebar */}
        <div
          className="absolute top-0 left-0 w-full h-40 opacity-20 pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgb(var(--accent)) 0%, transparent 100%)' }}
        />

        {/* Profile Card */}
        <div className="px-6 pt-10 pb-6 relative z-10 flex flex-col items-center text-center">
          <div className="relative mb-5 group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-blue-500 rounded-[2rem] blur-md opacity-30 group-hover:opacity-50 transition duration-500" />
            <div className="relative w-24 h-24 rounded-[2rem] border-2 border-white/20 dark:border-white/10 shadow-xl overflow-hidden flex items-center justify-center bg-white dark:bg-slate-800 transition-transform duration-300 group-hover:scale-[1.02]">
              {avatarUrl ? (
                <img
                  src={absoluteUrl(avatarUrl)}
                  alt={psyName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-3xl font-black text-white"
                  style={{ background: 'linear-gradient(135deg, rgb(var(--brand-blue)), rgb(var(--accent)))' }}
                >
                  {psyName?.[0]?.toUpperCase() || 'P'}
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center shadow-sm"
              style={{ background: 'rgb(var(--bg-elev))' }}>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
          </div>

          <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
            {psyName || 'Yükleniyor...'}
          </h3>
          <span
            className="text-[11px] font-bold px-3 py-1 rounded-full mt-2 uppercase tracking-wider"
            style={{ background: 'rgba(var(--accent), 0.15)', color: 'rgb(var(--accent))' }}
          >
            Klinik Psikolog
          </span>
        </div>

        {/* Divider */}
        <div className="px-6 relative z-10 mb-2">
          <div className="h-[1px] w-full" style={{ background: 'rgba(var(--border))' }} />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto z-10 custom-scrollbar">
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/psikolog/panel'}
              className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[14px] font-semibold transition-all duration-300 relative group overflow-hidden"
              style={({ isActive }) =>
                isActive
                  ? { background: 'rgba(var(--accent), 0.10)', color: 'rgb(var(--accent))', boxShadow: 'inset 0 0 0 1px rgba(var(--accent), 0.2)' }
                  : { color: 'rgb(var(--text-2))', hover: { background: 'rgba(var(--bg-muted), 0.5)' } }
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 w-1.5 h-8 -translate-y-1/2 rounded-r-md transition-all duration-300 shadow-[0_0_10px_rgba(var(--accent),0.5)]"
                      style={{ background: 'rgb(var(--accent))' }}
                    />
                  )}
                  <div className="relative z-10 flex items-center gap-3 w-full">
                    <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                    <span className="flex-1">{label}</span>
                    {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
                  </div>

                  {/* Hover background effect directly via tailwind arbitrary or group hover */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout Section */}
        <div className="p-4 relative z-10">
          <button
            onClick={handleLogout}
            className="group flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 bg-rose-50/50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400"
          >
            <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Güvenli Çıkış</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
