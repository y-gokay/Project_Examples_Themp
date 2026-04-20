import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Badge } from "@mui/material";
import Notifications from "../../pages/User/dialogs/Notifications";
import "./header.css";
import logo from "../../../public/HasanAli/HasanAliYucelNoBg.png";

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { loggedUser, notifications, notificationCount } = useSelector(
    (state) => state.auth,
  );

  // Scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <header className={`modern-header ${scrolled ? "scrolled" : ""}`}>
        <div className="header-container">
          {/* Left: Logo & Branding */}
          <div className="header-brand-section" onClick={() => navigate("/")}>
            <img
              src={logo}
              alt="Hasan Ali Yücel - Kültür ve Bilim Merkezi"
              className="header-logo-img"
            />
            <div className="header-titles">
              <span className="details-title">T.C. ATAKUM BELEDİYESİ</span>
              <span className="main-title">
                HASAN ALİ YÜCEL KÜLTÜR VE BİLİM MERKEZİ
              </span>
            </div>
          </div>

          {/* Hamburger Menu Icon (Mobile Only) */}
          <button
            className="mobile-menu-toggle"
            onClick={toggleMenu}
            aria-label="Menüyü Aç"
          >
            <i
              className={`fa-solid ${isMenuOpen ? "fa-xmark" : "fa-bars"}`}
            ></i>
          </button>

          {/* Navigation Links */}
          <nav className={`header-nav ${isMenuOpen ? "mobile-open" : ""}`}>
            {isMenuOpen && (
              <div className="mobile-menu-header">
                <span className="mobile-menu-title">Menü</span>
                <button
                  className="close-menu-btn"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            )}
            <button
              onClick={() => {
                navigate("/");
                setIsMenuOpen(false);
              }}
              className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
            >
              Ana Sayfa
            </button>
            <button
              onClick={() => {
                navigate("/kitaplar");
                setIsMenuOpen(false);
              }}
              className={`nav-link ${location.pathname === "/kitaplar" ? "active" : ""}`}
            >
              Kitaplar
            </button>
            <button
              onClick={() => {
                navigate("/duyurular");
                setIsMenuOpen(false);
              }}
              className={`nav-link ${location.pathname === "/duyurular" ? "active" : ""}`}
            >
              Duyurular
            </button>
            <button
              onClick={() => {
                navigate("/hizmetler");
                setIsMenuOpen(false);
              }}
              className={`nav-link ${location.pathname === "/hizmetler" ? "active" : ""}`}
            >
              Hizmetler
            </button>

            {/* Mobile Actions */}
            <div className="mobile-only-actions">
              {!loggedUser && (
                <button
                  onClick={() => {
                    navigate("/giris");
                    setIsMenuOpen(false);
                  }}
                  className="btn-primary-auth w-100"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Giriş Yap
                </button>
              )}

              {loggedUser && (
                <div className="mobile-user-controls-container">
                  <div
                    className="user-profile-pill"
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      marginBottom: "1rem",
                    }}
                    onClick={() => {
                      navigate("/profil");
                      setIsMenuOpen(false);
                    }}
                  >
                    <div className="avatar-circle">
                      {loggedUser.name ? (
                        loggedUser.name.charAt(0).toUpperCase()
                      ) : (
                        <i className="fa-solid fa-user"></i>
                      )}
                    </div>
                    <span className="user-name-text">Hesabım</span>
                  </div>

                  <div className="action-buttons-row">
                    <button
                      onClick={handleNotificationClick}
                      className="icon-btn-highlight"
                      title="Bildirimler"
                    >
                      <Badge badgeContent={notificationCount} color="error">
                        <i className="fa-solid fa-bell"></i>
                      </Badge>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="btn-logout"
                      title="Çıkış Yap"
                    >
                      <i className="fa-solid fa-right-from-bracket"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right: Search & User Actions (Desktop View) */}
          <div className="header-actions desktop-actions">
            {/*             <form className="modern-search-bar" onSubmit={handleSearch}>
              <button type="submit" className="search-icon-btn">
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
              <input
                type="text"
                placeholder="Kitap Ara..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </form> */}

            <div className="user-controls">
              {!loggedUser && (
                <button
                  onClick={() => navigate("/giris")}
                  className="btn-primary-auth"
                >
                  Giriş Yap
                </button>
              )}

              {loggedUser && (
                <>
                  <button
                    onClick={handleNotificationClick}
                    className="icon-btn-highlight"
                    title="Bildirimler"
                  >
                    <Badge badgeContent={notificationCount} color="error">
                      <i className="fa-solid fa-bell"></i>
                    </Badge>
                  </button>

                  <Notifications
                    notifications={notifications}
                    open={Boolean(anchorEl)}
                    handleClose={handleClose}
                    anchorEl={anchorEl}
                  />

                  <div
                    className="user-profile-pill"
                    onClick={() => navigate("/profil")}
                  >
                    <div className="avatar-circle">
                      {loggedUser.name ? (
                        loggedUser.name.charAt(0).toUpperCase()
                      ) : (
                        <i className="fa-solid fa-user"></i>
                      )}
                    </div>
                    <span className="user-name-text">Hesabım</span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="btn-logout"
                    title="Çıkış Yap"
                  >
                    <i className="fa-solid fa-right-from-bracket"></i>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Actions Drawer (Bottom Fixed or Integrated) - Optional cleanup */}
      {isMenuOpen && (
        <div
          className="menu-overlay"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </>
  );
}

export default Header;
