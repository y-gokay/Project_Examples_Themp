import { useState } from "react";
import { showToast } from "../../components/ui/Toast";
import { error as logError } from "../../utils/logger";
import { validatePhoneNumber, normalizePhoneNumber } from "../../utils/helpers";

/**
 * E-posta ve telefon doğrulamasını handle etmek için hook
 * @param {Object} verificationFunctions - Doğrulama için API fonksiyonları
 * @returns {Object} Doğrulama handler'ları ve state
 */
export const useVerification = ({
  sendEmailCode,
  verifyEmail,
  sendPhoneCode,
  verifyPhone,
  requestEmailChange,
  verifyEmailChange,
  requestPhoneChange,
  verifyPhoneChange,
}) => {
  // E-posta doğrulama state'leri
  const [emailVerificationCode, setEmailVerificationCode] = useState("");
  const [sendingEmailCode, setSendingEmailCode] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [emailChangeMode, setEmailChangeMode] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailChangeCode, setEmailChangeCode] = useState("");
  const [emailChangeCodeSent, setEmailChangeCodeSent] = useState(false);
  const [requestingEmailChange, setRequestingEmailChange] = useState(false);
  const [verifyingEmailChange, setVerifyingEmailChange] = useState(false);

  // Telefon doğrulama state'leri
  const [phoneVerificationCode, setPhoneVerificationCode] = useState("");
  const [sendingPhoneCode, setSendingPhoneCode] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [phoneChangeMode, setPhoneChangeMode] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [phoneChangeCode, setPhoneChangeCode] = useState("");
  const [phoneChangeCodeSent, setPhoneChangeCodeSent] = useState(false);
  const [requestingPhoneChange, setRequestingPhoneChange] = useState(false);
  const [verifyingPhoneChange, setVerifyingPhoneChange] = useState(false);

  // E-posta doğrulama handler'ları
  const handleSendEmailCode = async () => {
    if (!sendEmailCode) return;

    setSendingEmailCode(true);
    try {
      const result = await sendEmailCode();
      if (result.success) {
        showToast({
          type: "success",
          message: "Doğrulama kodu e-posta adresinize gönderildi",
          duration: 3000,
        });
      } else {
        showToast({
          type: "error",
          message: result.error || "Kod gönderilirken bir hata oluştu",
          duration: 3000,
        });
      }
    } catch (err) {
      logError("Send email code error:", err);
      showToast({
        type: "error",
        message: "Kod gönderilirken bir hata oluştu",
        duration: 3000,
      });
    } finally {
      setSendingEmailCode(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!verifyEmail) return;

    if (!emailVerificationCode) {
      showToast({
        type: "error",
        message: "Lütfen doğrulama kodunu girin",
        duration: 3000,
      });
      return;
    }

    setVerifyingEmail(true);
    try {
      const result = await verifyEmail(emailVerificationCode);
      if (result.success) {
        showToast({
          type: "success",
          message: "E-posta başarıyla doğrulandı",
          duration: 3000,
        });
        setEmailVerificationCode("");
      } else {
        showToast({
          type: "error",
          message: result.error || "Doğrulama başarısız",
          duration: 3000,
        });
      }
    } catch (err) {
      logError("Verify email error:", err);
      showToast({
        type: "error",
        message: "Doğrulama başarısız",
        duration: 3000,
      });
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handleRequestEmailChange = async () => {
    if (!requestEmailChange) return;

    if (!newEmail) {
      showToast({
        type: "error",
        message: "Lütfen yeni e-posta adresini girin",
        duration: 3000,
      });
      return;
    }

    setRequestingEmailChange(true);
    try {
      const result = await requestEmailChange(newEmail);
      if (result.success) {
        showToast({
          type: "success",
          message: "Doğrulama kodu yeni e-posta adresinize gönderildi",
          duration: 3000,
        });
        setEmailChangeCodeSent(true);
      } else {
        showToast({
          type: "error",
          message: result.error || "E-posta değiştirme isteği başarısız",
          duration: 3000,
        });
      }
    } catch (err) {
      logError("Request email change error:", err);
      showToast({
        type: "error",
        message: "E-posta değiştirme isteği başarısız",
        duration: 3000,
      });
    } finally {
      setRequestingEmailChange(false);
    }
  };

  const handleVerifyEmailChange = async () => {
    if (!verifyEmailChange) return;

    if (!emailChangeCode) {
      showToast({
        type: "error",
        message: "Lütfen doğrulama kodunu girin",
        duration: 3000,
      });
      return;
    }

    setVerifyingEmailChange(true);
    try {
      const result = await verifyEmailChange(emailChangeCode);
      if (result.success) {
        showToast({
          type: "success",
          message: "E-posta başarıyla değiştirildi",
          duration: 3000,
        });
        setEmailChangeMode(false);
        setNewEmail("");
        setEmailChangeCode("");
        setEmailChangeCodeSent(false);
      } else {
        showToast({
          type: "error",
          message: result.error || "Doğrulama başarısız",
          duration: 3000,
        });
      }
    } catch (err) {
      logError("Verify email change error:", err);
      showToast({
        type: "error",
        message: "Doğrulama başarısız",
        duration: 3000,
      });
    } finally {
      setVerifyingEmailChange(false);
    }
  };

  // Telefon doğrulama handler'ları
  const handleSendPhoneCode = async () => {
    if (!sendPhoneCode) return;

    setSendingPhoneCode(true);
    try {
      const result = await sendPhoneCode();
      if (result.success) {
        showToast({
          type: "success",
          message: "Doğrulama kodu telefon numaranıza gönderildi",
          duration: 3000,
        });
      } else {
        showToast({
          type: "error",
          message: result.error || "Kod gönderilirken bir hata oluştu",
          duration: 3000,
        });
      }
    } catch (err) {
      logError("Send phone code error:", err);
      showToast({
        type: "error",
        message: "Kod gönderilirken bir hata oluştu",
        duration: 3000,
      });
    } finally {
      setSendingPhoneCode(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (!verifyPhone) return;

    if (!phoneVerificationCode) {
      showToast({
        type: "error",
        message: "Lütfen doğrulama kodunu girin",
        duration: 3000,
      });
      return;
    }

    setVerifyingPhone(true);
    try {
      const result = await verifyPhone(phoneVerificationCode);
      if (result.success) {
        showToast({
          type: "success",
          message: "Telefon başarıyla doğrulandı",
          duration: 3000,
        });
        setPhoneVerificationCode("");
      } else {
        showToast({
          type: "error",
          message: result.error || "Doğrulama başarısız",
          duration: 3000,
        });
      }
    } catch (err) {
      logError("Verify phone error:", err);
      showToast({
        type: "error",
        message: "Doğrulama başarısız",
        duration: 3000,
      });
    } finally {
      setVerifyingPhone(false);
    }
  };

  const handleRequestPhoneChange = async () => {
    if (!requestPhoneChange) return;

    if (!newPhoneNumber) {
      showToast({
        type: "error",
        message: "Lütfen yeni telefon numarasını girin",
        duration: 3000,
      });
      return;
    }

    // Telefon numarasını validate et
    const validation = validatePhoneNumber(newPhoneNumber);
    if (!validation.isValid) {
      showToast({
        type: "error",
        message: validation.error || "Geçerli bir telefon numarası giriniz",
        duration: 3000,
      });
      return;
    }

    // Backend formatına normalize et (10 haneli, 5 ile başlayan)
    const normalizedPhone = normalizePhoneNumber(newPhoneNumber);

    setRequestingPhoneChange(true);
    try {
      const result = await requestPhoneChange(normalizedPhone);
      if (result.success) {
        showToast({
          type: "success",
          message: "Doğrulama kodu yeni telefon numaranıza gönderildi",
          duration: 3000,
        });
        setPhoneChangeCodeSent(true);
      } else {
        showToast({
          type: "error",
          message: result.error || "Telefon değiştirme isteği başarısız",
          duration: 3000,
        });
      }
    } catch (err) {
      logError("Request phone change error:", err);
      showToast({
        type: "error",
        message: "Telefon değiştirme isteği başarısız",
        duration: 3000,
      });
    } finally {
      setRequestingPhoneChange(false);
    }
  };

  const handleVerifyPhoneChange = async () => {
    if (!verifyPhoneChange) return;

    if (!phoneChangeCode) {
      showToast({
        type: "error",
        message: "Lütfen doğrulama kodunu girin",
        duration: 3000,
      });
      return;
    }

    setVerifyingPhoneChange(true);
    try {
      const result = await verifyPhoneChange(phoneChangeCode);
      if (result.success) {
        showToast({
          type: "success",
          message: "Telefon başarıyla değiştirildi",
          duration: 3000,
        });
        setPhoneChangeMode(false);
        setNewPhoneNumber("");
        setPhoneChangeCode("");
        setPhoneChangeCodeSent(false);
      } else {
        showToast({
          type: "error",
          message: result.error || "Doğrulama başarısız",
          duration: 3000,
        });
      }
    } catch (err) {
      logError("Verify phone change error:", err);
      showToast({
        type: "error",
        message: "Doğrulama başarısız",
        duration: 3000,
      });
    } finally {
      setVerifyingPhoneChange(false);
    }
  };

  return {
    // E-posta state'leri
    emailVerificationCode,
    setEmailVerificationCode,
    sendingEmailCode,
    verifyingEmail,
    emailChangeMode,
    setEmailChangeMode,
    newEmail,
    setNewEmail,
    emailChangeCode,
    setEmailChangeCode,
    emailChangeCodeSent,
    setEmailChangeCodeSent,
    requestingEmailChange,
    verifyingEmailChange,
    // E-posta handler'ları
    handleSendEmailCode,
    handleVerifyEmail,
    handleRequestEmailChange,
    handleVerifyEmailChange,
    // Telefon state'leri
    phoneVerificationCode,
    setPhoneVerificationCode,
    sendingPhoneCode,
    verifyingPhone,
    phoneChangeMode,
    setPhoneChangeMode,
    newPhoneNumber,
    setNewPhoneNumber,
    phoneChangeCode,
    setPhoneChangeCode,
    phoneChangeCodeSent,
    requestingPhoneChange,
    verifyingPhoneChange,
    // Telefon handler'ları
    handleSendPhoneCode,
    handleVerifyPhone,
    handleRequestPhoneChange,
    handleVerifyPhoneChange,
  };
};

export default useVerification;
