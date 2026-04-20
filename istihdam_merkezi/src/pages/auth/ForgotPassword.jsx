import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Input } from "../../components/ui";
import { useAppStore } from "../../store";
import { ROUTES } from "../../constants";
import { SEOHead } from "../../components/common";
import {
  Phone,
  ArrowLeft,
  Shield,
  RefreshCw,
  Moon,
  Sun,
  Home,
} from "lucide-react";
import { showToast } from "../../components/ui/Toast";
import {
  formatPhoneNumberDisplay,
  normalizePhoneNumber,
  validatePhoneNumber,
  validatePassword as validatePasswordHelper,
} from "../../utils/helpers";
import atimLogo from "../../assets/atim.webp";
import atimLogoDark from "../../assets/atim_darkmode.webp";
import atakumunEssizSahili from "../../assets/atakumun-essiz-sahili.webp";
import atakumunEssizSahiliGece from "../../assets/atakumun-essiz-sahili-gece.webp";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const {
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    loading,
    theme,
    toggleTheme,
  } = useAppStore();

  const [formData, setFormData] = useState({
    phoneNumber: "",
  });
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // 1: phone, 2: otp, 3: reset
  const [countdown, setCountdown] = useState(0); // 10 minutes = 600 seconds
  const countdownIntervalRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validatePhone = () => {
    const newErrors = {};
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Telefon numarası zorunludur";
    } else {
      const validation = validatePhoneNumber(formData.phoneNumber);
      if (!validation.isValid) {
        newErrors.phoneNumber =
          validation.error || "Geçerli bir telefon numarası giriniz";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Start countdown timer
  const startCountdown = () => {
    setCountdown(600); // 10 minutes = 600 seconds
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  // Format countdown to MM:SS
  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSubmitPhone = async (e) => {
    e.preventDefault();
    if (!validatePhone()) {
      return;
    }

    const normalizedPhone = normalizePhoneNumber(formData.phoneNumber);
    const result = await forgotPassword(normalizedPhone);
    if (result.success) {
      showToast({
        type: "success",
        message: result.message || "OTP kodu telefonunuza gönderildi",
        duration: 3000,
      });
      startCountdown();
      setStep(2);
    } else {
      setErrors({ form: result.error || "Bir hata oluştu" });
      showToast({
        type: "error",
        message: result.error || "Bir hata oluştu",
        duration: 3000,
      });
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) {
      return;
    }

    const normalizedPhone = normalizePhoneNumber(formData.phoneNumber);
    const result = await forgotPassword(normalizedPhone);
    if (result.success) {
      showToast({
        type: "success",
        message: result.message || "OTP kodu telefonunuza gönderildi",
        duration: 3000,
      });
      startCountdown();
    } else {
      showToast({
        type: "error",
        message: result.error || "Bir hata oluştu",
        duration: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen flex relative bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <SEOHead title="Şifremi Unuttum" path="/sifremi-unuttum" noindex />
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

      {/* Sol tarafta görsel alan - login ile uyumlu */}
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
              <p className="text-3xl md:text-4xl font-semibold text-blue-100 tracking-wide">
                İstihdam Merkezi
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sağ tarafta form kartı */}
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
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Şifremi Unuttum
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                Telefon numaranızı girerek şifre sıfırlama kodunu alın.
              </p>
            </div>

            {step === 1 && (
              <form onSubmit={handleSubmitPhone} className="space-y-6">
                <Input
                  label="Telefon Numarası"
                  type="tel"
                  name="phoneNumber"
                  value={formatPhoneNumberDisplay(formData.phoneNumber)}
                  onChange={(e) => {
                    // Sadece rakamları al
                    const cleaned = e.target.value.replace(/\D/g, "");
                    // Maksimum 11 haneli olabilir (0 ile başlayabilir)
                    if (cleaned.length <= 11) {
                      setFormData((prev) => ({
                        ...prev,
                        phoneNumber: cleaned,
                      }));
                      if (errors.phoneNumber) {
                        setErrors((prev) => ({ ...prev, phoneNumber: "" }));
                      }
                    }
                  }}
                  error={errors.phoneNumber}
                  placeholder="0(5xx) xxx xx xx"
                  leftIcon={<Phone className="w-5 h-5 text-gray-400" />}
                  required
                  autoComplete="tel"
                />

                {errors.form && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-300 font-medium">
                      {errors.form}
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  loading={loading}
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Kod Gönder
                </Button>
              </form>
            )}

            {step === 2 && (
              <ResetPasswordStep
                phoneNumber={formData.phoneNumber}
                onBack={() => setStep(1)}
                countdown={countdown}
                formatCountdown={formatCountdown}
                onResendCode={handleResendCode}
              />
            )}

            <div className="mt-6 text-center">
              <Link
                to={ROUTES.LOGIN}
                className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium hover:underline transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Giriş sayfasına dön
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reset Password Step Component
const ResetPasswordStep = ({
  phoneNumber,
  onBack,
  countdown,
  formatCountdown,
  onResendCode,
}) => {
  const navigate = useNavigate();
  const { verifyResetOtp, resetPassword, loading } = useAppStore();

  const [formData, setFormData] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [resetToken, setResetToken] = useState(null);
  const [currentStep, setCurrentStep] = useState(1); // 1: otp, 2: new password

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!formData.otp) {
      setErrors({ otp: "OTP kodu zorunludur" });
      return;
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const result = await verifyResetOtp(normalizedPhone, formData.otp);
    if (result.success) {
      setResetToken(result.resetToken || result.data?.resetToken);
      setCurrentStep(2);
      showToast({
        type: "success",
        message: "OTP doğrulandı. Yeni şifrenizi girin",
        duration: 3000,
      });
    } else {
      setErrors({ form: result.error || "OTP doğrulanamadı" });
      showToast({
        type: "error",
        message: result.error || "OTP doğrulanamadı",
        duration: 3000,
      });
    }
  };

  const validatePassword = () => {
    const newErrors = {};
    if (!formData.newPassword) {
      newErrors.newPassword = "Yeni şifre zorunludur";
    } else {
      const passwordValidation = validatePasswordHelper(formData.newPassword);
      if (!passwordValidation.isValid) {
        newErrors.newPassword = passwordValidation.error;
      }
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Şifre tekrarı zorunludur";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Şifreler eşleşmiyor";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!validatePassword()) {
      return;
    }

    if (!resetToken) {
      showToast({
        type: "error",
        message: "OTP doğrulanmadı. Lütfen tekrar deneyin",
        duration: 3000,
      });
      setCurrentStep(1);
      return;
    }

    const result = await resetPassword(resetToken, formData.newPassword);
    if (result.success) {
      showToast({
        type: "success",
        message: result.message || "Şifreniz başarıyla sıfırlandı",
        duration: 3000,
      });
      setTimeout(() => {
        navigate(ROUTES.LOGIN);
      }, 1500);
    } else {
      setErrors({ form: result.error || "Şifre sıfırlanamadı" });
      showToast({
        type: "error",
        message: result.error || "Şifre sıfırlanamadı",
        duration: 3000,
      });
    }
  };

  return (
    <div className="space-y-6">
      {currentStep === 1 && (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Telefon: {phoneNumber}
            </label>
            <Input
              label="OTP Kodu"
              type="text"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              error={errors.otp}
              placeholder="6 haneli kod"
              maxLength={6}
              required
            />
            {countdown > 0 && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Yeniden kod göndermek için: </span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {formatCountdown(countdown)}
                </span>
              </div>
            )}
          </div>

          {errors.form && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-300 font-medium">
                {errors.form}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="flex-1"
              >
                Geri
              </Button>
              <Button
                type="submit"
                loading={loading}
                disabled={loading}
                className="flex-1 bg-gradient-to-r bg-blue-500 hover:bg-blue-600 text-white"
              >
                Doğrula
              </Button>
            </div>
            {countdown === 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={onResendCode}
                disabled={loading}
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Yeniden Gönder
              </Button>
            )}
          </div>
        </form>
      )}

      {currentStep === 2 && (
        <form onSubmit={handleResetPassword} className="space-y-6">
          <Input
            label="Yeni Şifre"
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            error={errors.newPassword}
            placeholder="En az 8 karakter, büyük ve küçük harf"
            required
          />

          <Input
            label="Yeni Şifre Tekrar"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="Şifrenizi tekrar girin"
            required
          />

          {errors.form && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-medium">{errors.form}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(ROUTES.LOGIN)}
              className="flex-1"
            >
              Geri
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Şifreyi Sıfırla
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
