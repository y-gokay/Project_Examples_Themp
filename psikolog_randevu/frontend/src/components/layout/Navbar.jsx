import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, LogOut, Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';

const DASHBOARD_PATH = {
  user: '/randevularim',
  psychologist: '/psikolog/panel',
  admin: '/admin',
};

const NAV_ITEMS = [
  { to: '/', label: 'Anasayfa', match: (p) => p === '/' },
  { to: '/psikologlar', label: 'Psikologlarımız', match: (p) => p.startsWith('/psikologlar') },
  { to: '/blog', label: 'Blog', match: (p) => p.startsWith('/blog') },
  { to: '/sss', label: 'SSS', match: (p) => p.startsWith('/sss') },
];

const NavLink = ({ to, active, children, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-200"
    style={{
      color: active ? 'rgb(var(--accent))' : 'rgb(var(--text-2))',
      background: active ? 'rgba(var(--accent), 0.08)' : 'transparent',
    }}
  >
    {children}
  </Link>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Çıkış yapıldı');
    navigate('/');
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);
  const dashboardPath = user ? DASHBOARD_PATH[user.role] || '/' : '/';

  return (
    <header className="sticky top-0 z-40 nav-blur transition-all duration-300">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 h-[72px] flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3.5" onClick={closeMenu}>
          <div
            className="w-[42px] h-[42px] rounded-xl flex-shrink-0 shadow-soft"
            style={{ background: 'linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent-2)))' }}
          />
          <div className="flex flex-col leading-[1.15]">
            <span
              className="text-[9px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: 'rgb(var(--text-3))' }}
            >
              Atakum Belediyesi
            </span>
            <span className="text-sm font-bold tracking-wide" style={{ color: 'rgb(var(--text-1))' }}>
              PDR Danışmanlık
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-0.5">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} active={item.match(location.pathname)}>
              {item.label}
            </NavLink>
          ))}
          {user?.role === 'user' && (
            <NavLink to="/hesabim" active={location.pathname === '/hesabim'}>
              Hesabım
            </NavLink>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Temayı değiştir"
            className="w-9 h-9 rounded-lg border flex items-center justify-center transition-all duration-200 hover:border-[rgb(var(--accent))] hover:text-[rgb(var(--accent))]"
            style={{
              background: 'rgb(var(--bg-elev))',
              borderColor: 'rgba(var(--border))',
              color: 'rgb(var(--text-2))',
            }}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user ? (
            <>
              <Link
                to={dashboardPath}
                title="Panelime git"
                className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full border transition-all duration-200 hover:border-[rgb(var(--accent))]"
                style={{ borderColor: 'rgba(var(--border))' }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent-2)))' }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-bold max-w-[110px] truncate" style={{ color: 'rgb(var(--text-1))' }}>
                  {user.name.split(' ')[0]}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all duration-200"
                aria-label="Çıkış"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/giris"
                className="text-[13px] font-semibold px-5 py-2 rounded-[10px] border-[1.5px] transition-all duration-200 hover:border-[rgb(var(--accent))] hover:text-[rgb(var(--accent))]"
                style={{
                  borderColor: 'rgba(var(--border))',
                  color: 'rgb(var(--text-1))',
                }}
              >
                Giriş Yap
              </Link>
              <Link
                to="/kayit"
                className="text-[13px] font-bold px-[22px] py-2.5 rounded-[10px] text-white transition-all duration-200 hover:-translate-y-px"
                style={{
                  background: 'rgb(var(--accent))',
                  boxShadow: '0 6px 20px rgba(240,100,32,0.35)',
                }}
              >
                Kayıt Ol
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-lg border flex items-center justify-center"
            style={{
              background: 'rgb(var(--bg-elev))',
              borderColor: 'rgba(var(--border))',
              color: 'rgb(var(--text-2))',
            }}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="p-2 rounded-lg transition-transform duration-200"
            style={{ color: 'rgb(var(--text-1))' }}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div
        className="md:hidden overflow-hidden transition-all duration-300"
        style={{
          maxHeight: menuOpen ? '480px' : '0',
          borderTop: menuOpen ? '1px solid rgba(var(--border))' : 'none',
          background: 'rgb(var(--bg-elev))',
        }}
      >
        <div className="px-4 py-3 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              active={item.match(location.pathname)}
              onClick={closeMenu}
            >
              {item.label}
            </NavLink>
          ))}
          {user?.role === 'user' && (
            <NavLink to="/hesabim" active={location.pathname === '/hesabim'} onClick={closeMenu}>
              Hesabım
            </NavLink>
          )}
          {user && (
            <NavLink
              to={dashboardPath}
              active={location.pathname === dashboardPath}
              onClick={closeMenu}
            >
              {user.role === 'user' ? 'Randevularım' : user.role === 'psychologist' ? 'Panelim' : 'Admin'}
            </NavLink>
          )}
          <div className="my-2 h-px" style={{ background: 'rgba(var(--border))' }} />
          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-sm font-bold transition-colors"
            >
              <LogOut className="w-4 h-4" /> Çıkış Yap
            </button>
          ) : (
            <div className="flex gap-2">
              <Link
                to="/giris"
                onClick={closeMenu}
                className="flex-1 text-center px-3 py-2 rounded-[10px] border text-sm font-semibold transition-all"
                style={{ borderColor: 'rgba(var(--border))', color: 'rgb(var(--text-1))' }}
              >
                Giriş Yap
              </Link>
              <Link
                to="/kayit"
                onClick={closeMenu}
                className="flex-1 text-center px-3 py-2 rounded-[10px] text-white text-sm font-bold"
                style={{ background: 'rgb(var(--accent))' }}
              >
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
