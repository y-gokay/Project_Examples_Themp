import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setLoggedStatus } from "../../redux/features/authSlice";
import { useState, useEffect } from "react";
import QuickDeliver from "../../pages/Admin/dialogs/QuickDeliver";
import DashboardSidebar from "../DashboardSidebar/DashboardSidebar";
import logodark from "../../../public/belediyelogo.png";

const TITLES = {
  anasayfa: "Dashboard",
  kullanıcilar: "Kullanıcılar",
  "kullanici-kaydet": "Kullanıcı Kaydet",
  kitaplar: "Kitaplar",
  "kitap-ekle": "Kitap Ekle",
  "odunc-formu": "Ödünç Formu",
  oduncler: "Ödünç Verilmişler",
  duyurular: "Duyurular",
  excel: "Excel İşlemleri",
  kitap: "Kitap Detayı",
  kullanici: "Kullanıcı Detayı",
};

function getPageTitle(pathname) {
  const base = pathname.replace(/^\/admin\/?/, "").split("/")[0];
  if (base === "kitap" || base === "kullanici") return TITLES[base];
  return TITLES[base] || "Panel";
}

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [quickOpen, setQuickOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = location.pathname;

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(setLoggedStatus(false));
    navigate("/admin");
  };

  const title = getPageTitle(pathname);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <QuickDeliver open={quickOpen} handleClose={() => setQuickOpen(false)} />

      <header className="dashboard-header">
        <div className="dashboard-header__left">
          <button 
            className="mobile-menu-btn" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menüyü Aç/Kapat"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <img
            src={logodark}
            className="dashboard-header__logo"
            alt="Atakum Belediyesi"
          />
          <div className="dashboard-header__title-wrap">
            <h1 className="dashboard-header__title">{title}</h1>
          </div>
        </div>

        <div className="dashboard-header__right">
          <div className="dashboard-header__user">
            <div className="dashboard-header__avatar">A</div>
            <button
              type="button"
              className="dashboard-header__logout"
              onClick={handleLogout}
            >
              Çıkış
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-layout">
        {/* Mobile overlay */}
        {mobileMenuOpen && (
          <div className="mobile-sidebar-overlay" onClick={() => setMobileMenuOpen(false)}></div>
        )}
        <DashboardSidebar 
          onQuickDeliver={() => {
            setQuickOpen(true);
            setMobileMenuOpen(false);
          }} 
          mobileMenuOpen={mobileMenuOpen}
          handleLogout={handleLogout}
        />
        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
    </>
  );
}
