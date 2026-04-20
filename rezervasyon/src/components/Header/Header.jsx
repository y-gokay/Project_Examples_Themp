import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/authSlice";
import { isAdmin } from "../../utils/auth";
import iconImage from "../../assets/icon.png";
import iconDarkImage from "../../assets/icon-darkmode.png";
import { useDarkMode } from "../../hooks/useDarkMode";

export default function Header() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const { isDark, toggleTheme } = useDarkMode();

  return (
    <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center space-x-2 sm:space-x-4">
        <img
          src={isDark ? iconDarkImage : iconImage}
          alt="Logo"
          className="h-8 w-8 sm:h-12 sm:w-12"
        />
        <div>
          <h1 className="text-sm sm:text-lg font-bold text-slate-800 dark:text-slate-100">
            <span className="hidden sm:inline">Rezervasyon Yönetimi</span>
            <span className="sm:hidden">Rezervasyon</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300">
            <span className="hidden sm:inline">Atakum Belediyesi</span>
            <span className="sm:hidden">Belediye</span>
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
            {user ? `${user.firstName} ${user.lastName}` : "Kullanıcı"}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-300">
            {user ? (isAdmin(user) ? "Admin" : "Personel") : ""}
          </p>
        </div>
        <button
          onClick={toggleTheme}
          className="btn btn-ghost px-2 sm:px-3 py-2 flex items-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          aria-label="Tema değiştir"
          title={isDark ? "Açık tema" : "Karanlık tema"}
        >
          {isDark ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
        <button
          onClick={() => dispatch(logout())}
          className="hidden md:flex btn btn-ghost px-2 sm:px-3 py-2 items-center space-x-1 sm:space-x-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          aria-label="Çıkış yap"
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
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span className="text-xs sm:text-sm font-medium">Çıkış Yap</span>
        </button>
      </div>
    </div>
  );
}
