import { useState } from "react";
import { NavLink } from "react-router-dom";
import qrscanner from "../../../public/scan-icon.svg";

const ROUTES = [
  { path: "anasayfa", label: "Dashboard", icon: "grid" },
  { path: "kullanıcilar", label: "Kullanıcılar", icon: "users" },
  { path: "kullanici-kaydet", label: "Kullanıcı Kaydet", icon: "userPlus" },
  { path: "kitaplar", label: "Kitaplar", icon: "book" },
  { path: "kitap-ekle", label: "Kitap Ekle", icon: "bookPlus" },
  { path: "odunc-formu", label: "Ödünç Ver", icon: "clipboard" },
  { path: "oduncler", label: "Ödünçler", icon: "list" },
  { path: "duyurular", label: "Duyurular", icon: "bell" },
  { path: "excel", label: "Excel", icon: "file" },
];

const icons = {
  grid: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  users: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  userPlus: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  ),
  book: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  bookPlus: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M12 6v6" />
      <path d="M9 9h6" />
    </svg>
  ),
  clipboard: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  ),
  list: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  bell: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  file: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
};

export default function DashboardSidebar({ onQuickDeliver, mobileMenuOpen, handleLogout }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`dashboard-sidebar ${collapsed ? "dashboard-sidebar--collapsed" : ""} ${mobileMenuOpen ? "dashboard-sidebar--mobile-open" : ""}`}
    >
      <button
        type="button"
        className="sidebar-nav__collapse-btn"
        onClick={() => setCollapsed((c) => !c)}
        title={collapsed ? "Sidebar'ı aç" : "Sidebar'ı kapat"}
        aria-label={collapsed ? "Genişlet" : "Daralt"}
      >
        {collapsed ? (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        ) : (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        )}
      </button>

      <nav className="sidebar-nav">
        {ROUTES.map((r) => (
          <NavLink
            key={r.path}
            to={`/admin/${r.path}`}
            className={({ isActive }) =>
              `sidebar-nav__link ${isActive ? "active" : ""}`
            }
            title={r.label}
          >
            <span className="sidebar-nav__icon">
              {icons[r.icon] || icons.grid}
            </span>
            <span className="sidebar-nav__label">{r.label}</span>
          </NavLink>
        ))}
        <div className="sidebar-nav__divider" />
        <button
          type="button"
          className="sidebar-nav__quick"
          onClick={onQuickDeliver}
          title="Hızlı Teslim"
        >
          <span className="sidebar-nav__icon">
            <img src={qrscanner} alt="" />
          </span>
          <span className="sidebar-nav__label">Hızlı Teslim</span>
        </button>
      </nav>
      <div className="sidebar-nav__user" title="Admin">
        <div className="sidebar-nav__user-info">
          <span className="sidebar-nav__user-avatar">A</span>
          <span className="sidebar-nav__label">Admin</span>
        </div>
        <button 
          className="sidebar-nav__logout-mobile" 
          onClick={handleLogout}
          title="Çıkış Yap"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span className="sidebar-nav__label">Çıkış</span>
        </button>
      </div>
    </aside>
  );
}
