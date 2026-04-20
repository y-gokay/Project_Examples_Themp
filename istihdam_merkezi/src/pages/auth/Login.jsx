import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAppStore } from "../../store";
import { ROUTES } from "../../constants";
import { SEOHead } from "../../components/common";
import atimLogo from "../../assets/atim.webp";
import atimLogoDark from "../../assets/atim_darkmode.webp";
import atakumunEssizSahili from "../../assets/atakumun-essiz-sahili.webp";
import atakumunEssizSahiliGece from "../../assets/atakumun-essiz-sahili-gece.webp";
import { Home, Building2, User, Eye, EyeOff, Moon, Sun } from "lucide-react";
import { showToast } from "../../components/ui/Toast";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { login, loading, theme, toggleTheme } = useAppStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [sessionExpiredMsg, setSessionExpiredMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (searchParams.get("sessionExpired") === "1") {
      setSessionExpiredMsg(
        "Oturumunuz sona erdi. Lütfen tekrar giriş yapın.",
      );
      searchParams.delete("sessionExpired");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
    if (sessionExpiredMsg) setSessionExpiredMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const result = await login(formData.email, formData.password, "user");
    if (result.success) {
      showToast({
        type: "success",
        message: "Giriş başarılı! Yönlendiriliyorsunuz...",
        duration: 2000,
      });
      setTimeout(() => {
        navigate(ROUTES.DASHBOARD);
      }, 500);
    } else {
      // Backend'den gelen errors array'ini veya error mesajını kullan
      const backendErrorMsg = result.errors?.length
        ? result.errors.map(e => e.message || e.msg).filter(Boolean).join(", ")
        : null;
      const errorMessage =
        backendErrorMsg || result.error || "Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.";
      setError(errorMessage);
      showToast({
        type: "error",
        message: errorMessage,
        duration: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen flex relative bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <SEOHead title="Giriş Yap" path="/giris" noindex />
      {/* Sol üst anasayfa butonu */}
      <Link
        to={ROUTES.HOME}
        className="fixed top-4 left-4 z-[100] flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-md hover:bg-white dark:hover:bg-gray-800 transition-all hover:scale-105 group"
      >
        <Home className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          Anasayfa
        </span>
      </Link>

      {/* Tema Toggle Butonu */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-[100] p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-md hover:bg-white dark:hover:bg-gray-800 transition-all hover:scale-105"
        aria-label="Tema Değiştir"
      >
        {theme === "dark" ? (
          <Sun className="w-5 h-5 text-yellow-500" />
        ) : (
          <Moon className="w-5 h-5 text-gray-700" />
        )}
      </button>

      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={theme === "dark" ? atakumunEssizSahiliGece : atakumunEssizSahili}
          alt="Atakum'un Eşsiz Sahili"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 flex items-start justify-center pt-20 px-12">
          <div className="text-white text-center max-w-2xl">
            <div className="mb-8">
              <h1 className="text-6xl md:text-7xl font-extrabold mb-6 tracking-tight drop-shadow-2xl">
                Atakum Belediyesi
              </h1>
              <div className="h-1 w-32 bg-white/80 mx-auto mb-6 rounded-full"></div>
              <p className="text-3xl md:text-4xl font-semibold text-white dark:text-white tracking-wide">
                İstihdam Merkezi
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <Link to={ROUTES.HOME} className="relative group">
              <img
                src={theme === "dark" ? atimLogoDark : atimLogo}
                alt="Atakum Belediyesi Logo"
                className="h-32 object-contain group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute -inset-2 bg-orange-600 rounded-full opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 text-center">
              Üye Girişi
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
              Hesabınıza giriş yapın
            </p>

            {sessionExpiredMsg && (
              <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg">
                <p className="text-amber-700 dark:text-amber-300 text-sm font-medium">
                  {sessionExpiredMsg}
                </p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  E-posta
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 ring-offset-white dark:ring-offset-gray-900 focus:ring-offset-1 focus:border-transparent outline-none transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="E-posta adresinizi girin"
                  disabled={loading}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Şifre
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 ring-offset-white dark:ring-offset-gray-900 focus:ring-offset-1 focus:border-transparent outline-none transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="Şifrenizi girin"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <Link
                  to={ROUTES.FORGOT_PASSWORD}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                >
                  Şifremi unuttum
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ring-offset-white dark:ring-offset-gray-900 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Giriş yapılıyor...
                  </span>
                ) : (
                  "Giriş Yap"
                )}
              </button>
            </form>

            <div className="mt-6">
              {/* Öneri Kısmı */}
              <div className="space-y-2">
                <Link
                  to={ROUTES.REGISTER}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors group"
                >
                  <User className="w-4 h-4 text-green-600 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-green-700">
                    Üye Kayıt
                  </span>
                </Link>
                <Link
                  to={ROUTES.EMPLOYER_LOGIN}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors group"
                >
                  <Building2 className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-purple-700">
                    İşveren Giriş
                  </span>
                </Link>
                <Link
                  to={ROUTES.EMPLOYER_REGISTER}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors group"
                >
                  <Building2 className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-indigo-700">
                    İşveren Kayıt
                  </span>
                </Link>
              </div>
            </div>
          </div>

          <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-6">
            © {new Date().getFullYear()} Atakum Belediyesi. Tüm hakları
            saklıdır.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
