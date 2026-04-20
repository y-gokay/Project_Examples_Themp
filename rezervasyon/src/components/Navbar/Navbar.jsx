import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/authSlice";
import { isAdmin } from "../../utils/auth";
import { LuFileText, LuChevronDown, LuX, LuMenu } from "react-icons/lu";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";

export default function Navbar({
  activeTab,
  onTabChange,
  onSearchClick,
  onUpcomingEventsClick,
}) {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Permission kontrolü
  const permissions = {
    allowSearch:
      isAdmin(user) ||
      user?.permissions?.allowSearch ||
      user?.allowSearch ||
      false,
    allowKasa:
      isAdmin(user) || user?.permissions?.allowKasa || user?.allowKasa || false,
    allowStatistics:
      isAdmin(user) ||
      user?.permissions?.allowStatistics ||
      user?.allowStatistics ||
      false,
    allowExport:
      isAdmin(user) ||
      user?.permissions?.allowExport ||
      user?.allowExport ||
      false,
    allowTodayActivities:
      isAdmin(user) ||
      user?.permissions?.allowTodayActivities ||
      user?.allowTodayActivities ||
      false,
    allowSavedCustomers:
      isAdmin(user) ||
      user?.permissions?.allowSavedCustomers ||
      user?.allowSavedCustomers ||
      false,
  };

  // Dropdown dışına tıklandığında kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAdminDropdownOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest('[data-mobile-menu-button]')
      ) {
        setMobileMenuOpen(false);
      }
    };

    if (adminDropdownOpen || mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [adminDropdownOpen, mobileMenuOpen]);

  // ESC tuşu ile dropdown ve mobile menu'yu kapat
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        if (adminDropdownOpen) {
          setAdminDropdownOpen(false);
        }
        if (mobileMenuOpen) {
          setMobileMenuOpen(false);
        }
      }
    };

    if (adminDropdownOpen || mobileMenuOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [adminDropdownOpen, mobileMenuOpen]);

  // Active tab değiştiğinde dropdown ve mobile menu'yu kapat
  useEffect(() => {
    setAdminDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [activeTab]);

  // Body scroll'unu engelle (mobile menu açıkken)
  useBodyScrollLock(mobileMenuOpen);

  return (
    <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      {/* Desktop: Wrapped Navigation */}
      <nav className="hidden md:flex flex-wrap gap-1.5 md:gap-2 lg:gap-2.5 px-2 md:px-4 lg:px-6 py-2 md:py-3 justify-center items-center">
        <button
          onClick={() => onTabChange("calendar")}
          className={activeTab === "calendar" ? "nav-tab-active" : "nav-tab"}
        >
          <svg
            className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-1.5 inline"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="hidden lg:inline">Takvim</span>
          <span className="lg:hidden">Takvim</span>
        </button>
        {permissions.allowSearch && (
          <button onClick={onSearchClick} className="nav-tab">
            <svg
              className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-1.5 inline"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span className="hidden lg:inline">Arama</span>
            <span className="lg:hidden">Ara</span>
          </button>
        )}
        <button onClick={onUpcomingEventsClick} className="nav-tab">
          <svg
            className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-1.5 inline"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="hidden xl:inline">Yaklaşan Etkinlikler</span>
          <span className="xl:hidden">Etkinlikler</span>
        </button>
        {permissions.allowTodayActivities && (
          <button
            onClick={() => onTabChange("today-activities")}
            className={
              activeTab === "today-activities" ? "nav-tab-active" : "nav-tab"
            }
          >
            <svg
              className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-1.5 inline"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            <span className="hidden lg:inline">Hareketler</span>
            <span className="lg:hidden">Hareket</span>
          </button>
        )}
        {permissions.allowKasa && (
          <button
            onClick={() => onTabChange("cash")}
            className={activeTab === "cash" ? "nav-tab-active" : "nav-tab"}
          >
            <span className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-1.5 inline-flex items-center justify-center text-xs md:text-sm font-bold">
              ₺
            </span>
            <span className="hidden lg:inline">Kasa</span>
            <span className="lg:hidden">Kasa</span>
          </button>
        )}

        {permissions.allowStatistics && (
          <button
            onClick={() => onTabChange("statistics")}
            className={
              activeTab === "statistics" ? "nav-tab-active" : "nav-tab"
            }
          >
            <svg
              className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-1.5 inline"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <span className="hidden xl:inline">İstatistikler</span>
            <span className="xl:hidden">İstatistik</span>
          </button>
        )}

        {permissions.allowExport && (
          <button
            onClick={() => onTabChange("export")}
            className={activeTab === "export" ? "nav-tab-active" : "nav-tab"}
          >
            <svg
              className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-1.5 inline"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="hidden xl:inline">Dışarıya Aktar</span>
            <span className="xl:hidden">Aktar</span>
          </button>
        )}

        {/* Kayıtlı Müşteriler Sekmesi */}
        {permissions.allowSavedCustomers && (
          <button
            onClick={() => onTabChange("saved-customers")}
            className={
              activeTab === "saved-customers" ? "nav-tab-active" : "nav-tab"
            }
          >
            <svg
              className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-1.5 inline"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="hidden xl:inline">Kayıtlı Müşteriler</span>
            <span className="xl:hidden">Müşteriler</span>
          </button>
        )}

        {/* Yönetim Dropdown - Admin - Her zaman en sonda */}
        {isAdmin(user) && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
              className={`nav-tab flex items-center ${
                ["salons", "users", "logs"].includes(activeTab)
                  ? "nav-tab-active"
                  : ""
              }`}
            >
              <svg
                className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-1.5 inline"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="hidden xl:inline">Yönetim</span>
              <span className="xl:hidden">Yönetim</span>
              <LuChevronDown
                className={`w-3 h-3 ml-1 transition-transform ${
                  adminDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {adminDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 min-w-[180px] z-50">
                <button
                  onClick={() => {
                    onTabChange("salons");
                    setAdminDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                    activeTab === "salons"
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  Salon Yönetimi
                </button>
                <button
                  onClick={() => {
                    onTabChange("users");
                    setAdminDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                    activeTab === "users"
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  Kullanıcı Yönetimi
                </button>
                <button
                  onClick={() => {
                    onTabChange("logs");
                    setAdminDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                    activeTab === "logs"
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <LuFileText className="w-4 h-4" />
                  Loglar
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Mobile: Hamburger Menu */}
      <nav className="md:hidden">
        {/* Hamburger Button */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <button
            data-mobile-menu-button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Menüyü aç"
          >
            {mobileMenuOpen ? (
              <LuX className="w-6 h-6 text-gray-700 dark:text-slate-300" />
            ) : (
              <LuMenu className="w-6 h-6 text-gray-700 dark:text-slate-300" />
            )}
          </button>
          {/* Aktif sekme gösterimi - Ortada */}
          <span className="text-sm font-medium text-gray-600 dark:text-slate-400 flex-1 text-center">
            {activeTab === "calendar" && "Takvim"}
            {activeTab === "today-activities" && "Hareketler"}
            {activeTab === "cash" && "Kasa"}
            {activeTab === "statistics" && "İstatistikler"}
            {activeTab === "export" && "Dışarıya Aktar"}
            {activeTab === "saved-customers" && "Kayıtlı Müşteriler"}
            {activeTab === "salons" && "Salon Yönetimi"}
            {activeTab === "users" && "Kullanıcı Yönetimi"}
            {activeTab === "logs" && "Loglar"}
          </span>
          {/* Sağ tarafta boş alan - hamburger butonu ile simetri için */}
          <div className="w-[42px]"></div>
        </div>

        {/* Mobile Menu Sidebar - Portal ile body'ye render ediliyor */}
        {mobileMenuOpen &&
          createPortal(
            <>
              {/* Overlay */}
              <div
                className="fixed inset-0 bg-black/50 z-[100] md:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
              {/* Sidebar */}
              <div
                ref={mobileMenuRef}
                className="fixed top-0 left-0 h-full w-[280px] max-w-[85vw] bg-white dark:bg-slate-800 shadow-xl z-[110] overflow-y-auto transform transition-transform duration-300 ease-in-out"
              >
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                    Menü
                  </h2>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    aria-label="Menüyü kapat"
                  >
                    <LuX className="w-5 h-5 text-gray-600 dark:text-slate-300" />
                  </button>
                </div>

                <div className="p-2 space-y-1">
                {/* Takvim */}
                <button
                  onClick={() => {
                    onTabChange("calendar");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                    activeTab === "calendar"
                      ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-medium"
                      : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Takvim</span>
                </button>

                {/* Arama */}
                {permissions.allowSearch && (
                  <button
                    onClick={() => {
                      onSearchClick();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <span>Arama</span>
                  </button>
                )}

                {/* Yaklaşan Etkinlikler */}
                <button
                  onClick={() => {
                    onUpcomingEventsClick();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Yaklaşan Etkinlikler</span>
                </button>

                {/* Bugünkü Hareketler */}
                {permissions.allowTodayActivities && (
                  <button
                    onClick={() => {
                      onTabChange("today-activities");
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                      activeTab === "today-activities"
                        ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-medium"
                        : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                    <span>Bugünkü Hareketler</span>
                  </button>
                )}

                {/* Kasa */}
                {permissions.allowKasa && (
                  <button
                    onClick={() => {
                      onTabChange("cash");
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                      activeTab === "cash"
                        ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-medium"
                        : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    <span className="text-lg font-bold">₺</span>
                    <span>Kasa</span>
                  </button>
                )}

                {/* İstatistikler */}
                {permissions.allowStatistics && (
                  <button
                    onClick={() => {
                      onTabChange("statistics");
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                      activeTab === "statistics"
                        ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-medium"
                        : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    <span>İstatistikler</span>
                  </button>
                )}

                {/* Dışarıya Aktar */}
                {permissions.allowExport && (
                  <button
                    onClick={() => {
                      onTabChange("export");
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                      activeTab === "export"
                        ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-medium"
                        : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span>Dışarıya Aktar</span>
                  </button>
                )}

                {/* Kayıtlı Müşteriler */}
                {permissions.allowSavedCustomers && (
                  <button
                    onClick={() => {
                      onTabChange("saved-customers");
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                      activeTab === "saved-customers"
                        ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-medium"
                        : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <span>Kayıtlı Müşteriler</span>
                  </button>
                )}

                {/* Yönetim Bölümü - Admin */}
                {isAdmin(user) && (
                  <>
                    <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-700">
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        Yönetim
                      </div>
                    </div>

                    {/* Salon Yönetimi */}
                    <button
                      onClick={() => {
                        onTabChange("salons");
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                        activeTab === "salons"
                          ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-medium"
                          : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      <span>Salon Yönetimi</span>
                    </button>

                    {/* Kullanıcı Yönetimi */}
                    <button
                      onClick={() => {
                        onTabChange("users");
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                        activeTab === "users"
                          ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-medium"
                          : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      <span>Kullanıcı Yönetimi</span>
                    </button>

                    {/* Loglar */}
                    <button
                      onClick={() => {
                        onTabChange("logs");
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                        activeTab === "logs"
                          ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-medium"
                          : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      <LuFileText className="w-5 h-5" />
                      <span>Loglar</span>
                    </button>
                  </>
                )}

                {/* Çıkış Yap Butonu */}
                <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => {
                      dispatch(logout());
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span className="font-medium">Çıkış Yap</span>
                  </button>
                </div>
                </div>
              </div>
            </>,
            document.body
          )}
      </nav>
    </div>
  );
}

