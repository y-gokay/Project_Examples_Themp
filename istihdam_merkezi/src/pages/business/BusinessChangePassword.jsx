import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store";
import { ROLES, ROUTES } from "../../constants";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
} from "../../components/ui";
import { Loader2, Lock, Eye, EyeOff, Save } from "lucide-react";
import { showToast } from "../../components/ui/Toast";
import { validatePassword } from "../../utils/helpers";

const BusinessChangePassword = () => {
  const navigate = useNavigate();
  const { user, changeBusinessPassword, loading } = useAppStore();

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const profileLoadedRef = useRef(false);

  useEffect(() => {
    // Check if user is not business/employer, redirect
    const userRole = user?.role || user?.userType;
    if (
      userRole !== ROLES.EMPLOYER &&
      userRole !== "employer" &&
      userRole !== "business"
    ) {
      navigate(ROUTES.DASHBOARD, { replace: true });
      return;
    }

    // Prevent duplicate checks in Strict Mode
    if (profileLoadedRef.current) {
      return;
    }
    profileLoadedRef.current = true;
  }, [user, navigate]);

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = "Mevcut şifre zorunludur";
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = "Yeni şifre zorunludur";
    } else {
      const passwordValidation = validatePassword(passwordForm.newPassword);
      if (!passwordValidation.isValid) {
        newErrors.newPassword = passwordValidation.error;
      }
    }

    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = "Şifre tekrarı zorunludur";
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = "Şifreler eşleşmiyor";
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    setIsSubmitting(true);
    const result = await changeBusinessPassword(
      passwordForm.currentPassword,
      passwordForm.newPassword,
    );

    if (result.success) {
      showToast({
        type: "success",
        message: result.message || "Şifre başarıyla değiştirildi",
        duration: 3000,
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordErrors({});
    } else {
      if (result.errors && Array.isArray(result.errors)) {
        const fieldErrors = {};
        result.errors.forEach((err) => {
          if (err.field) {
            fieldErrors[err.field] = err.message;
          }
        });
        setPasswordErrors(fieldErrors);
      }

      showToast({
        type: "error",
        message: result.error || "Şifre değiştirilirken bir hata oluştu",
        duration: 3000,
      });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Şifre Değiştir
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Hesap güvenliğiniz için şifrenizi düzenli olarak güncelleyin.
          </p>
        </div>

        {/* Password Change Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Şifre Değiştir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mevcut Şifre <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                    placeholder="Mevcut şifrenizi girin"
                    error={passwordErrors.currentPassword}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Yeni Şifre <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="Yeni şifrenizi girin (min 8 karakter)"
                    error={passwordErrors.newPassword}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Şifre en az 8 karakter olmalı, en az bir büyük harf ve bir
                  küçük harf içermelidir.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Yeni Şifre (Tekrar) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Yeni şifrenizi tekrar girin"
                    error={passwordErrors.confirmPassword}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(ROUTES.EMPLOYER_PROFILE)}
                  disabled={isSubmitting || loading}
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="flex items-center gap-2"
                >
                  {isSubmitting || loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Güncelleniyor...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Şifreyi Güncelle</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessChangePassword;
