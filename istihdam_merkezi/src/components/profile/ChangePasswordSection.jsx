import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from "../ui";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { showToast } from "../ui/Toast";
import { validatePassword } from "../../utils/helpers";

/**
 * ChangePasswordSection Component
 * Handles password change functionality
 *
 * @param {Object} props
 * @param {Function} props.onChangePassword - Handler for password change
 * @param {boolean} props.loading - General loading state
 */
const ChangePasswordSection = ({ onChangePassword, loading = false }) => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Mevcut şifre zorunludur";
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = "Yeni şifre zorunludur";
    } else {
      const passwordValidation = validatePassword(passwordData.newPassword);
      if (!passwordValidation.isValid) {
        newErrors.newPassword = passwordValidation.error;
      }
    }
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Şifre tekrarı zorunludur";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Şifreler eşleşmiyor";
    }
    if (passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword = "Yeni şifre mevcut şifre ile aynı olamaz";
    }
    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) {
      return;
    }

    if (!onChangePassword) {
      showToast({
        type: "error",
        message: "Şifre değiştirme fonksiyonu bulunamadı",
        duration: 3000,
      });
      return;
    }

    setChangingPassword(true);
    const result = await onChangePassword(
      passwordData.currentPassword,
      passwordData.newPassword,
      passwordData.confirmPassword,
    );
    setChangingPassword(false);

    if (result.success) {
      showToast({
        type: "success",
        message: "Şifreniz başarıyla değiştirildi",
        duration: 3000,
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordErrors({});
    } else {
      showToast({
        type: "error",
        message: result.error || "Şifre değiştirilemedi",
        duration: 3000,
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Şifre Değiştir
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-w-2xl">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Hesap güvenliğiniz için şifrenizi düzenli olarak güncelleyin.
            Şifreniz en az 8 karakter olmalı ve en az bir büyük harf, bir küçük
            harf içermelidir.
          </p>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <Input
                label="Mevcut Şifre"
                type={showPasswords.current ? "text" : "password"}
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                error={passwordErrors.currentPassword}
                placeholder="Mevcut şifrenizi girin"
                required
                rightIcon={
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowPasswords((prev) => ({
                        ...prev,
                        current: !prev.current,
                      }));
                    }}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                  >
                    {showPasswords.current ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
              />
            </div>

            <div>
              <Input
                label="Yeni Şifre"
                type={showPasswords.new ? "text" : "password"}
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                error={passwordErrors.newPassword}
                placeholder="En az 8 karakter, büyük ve küçük harf"
                required
                rightIcon={
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowPasswords((prev) => ({
                        ...prev,
                        new: !prev.new,
                      }));
                    }}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
              />
            </div>

            <div>
              <Input
                label="Yeni Şifre Tekrar"
                type={showPasswords.confirm ? "text" : "password"}
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                error={passwordErrors.confirmPassword}
                placeholder="Yeni şifrenizi tekrar girin"
                required
                rightIcon={
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowPasswords((prev) => ({
                        ...prev,
                        confirm: !prev.confirm,
                      }));
                    }}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                loading={changingPassword}
                disabled={changingPassword || loading}
                className="min-w-[150px]"
              >
                {changingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Değiştiriliyor...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Şifreyi Değiştir
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChangePasswordSection;
