import { useState, useRef } from "react";
import { showToast } from "../../components/ui/Toast";
import { validateFileUpload } from "../../utils/helpers";
import { FILE_LIMITS } from "../../constants";
import { error as logError } from "../../utils/logger";

/**
 * Profilde dosya yüklemelerini handle etmek için hook
 * @param {Object} options - Yapılandırma seçenekleri
 * @param {Function} options.uploadFunction - Yükleme için çağrılacak API fonksiyonu
 * @param {Object} options.fileLimits - Dosya validation limitleri
 * @param {string} options.successMessage - Başarılı toast mesajı
 * @param {string} options.errorMessage - Hata toast mesajı
 * @returns {Object} Yükleme handler'ları ve state
 */
export const useFileUpload = ({
  uploadFunction,
  fileLimits = FILE_LIMITS.DOCUMENT,
  successMessage = "Dosya başarıyla yüklendi",
  errorMessage = "Dosya yüklenirken bir hata oluştu",
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = async (file, additionalData = {}) => {
    if (!file) {
      showToast({
        type: "error",
        message: "Lütfen bir dosya seçin",
        duration: 3000,
      });
      return;
    }

    // Dosyayı validate et
    const validation = validateFileUpload(file, fileLimits);

    if (!validation.isValid) {
      showToast({
        type: "error",
        message: validation.error || "Geçersiz dosya",
        duration: 3000,
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setUploading(true);

    try {
      const result = await uploadFunction(file, additionalData);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (result.success) {
        showToast({
          type: "success",
          message: successMessage,
          duration: 3000,
        });
        return { success: true, data: result.data };
      } else {
        showToast({
          type: "error",
          message: result.error || errorMessage,
          duration: 3000,
        });
        return { success: false, error: result.error };
      }
    } catch (err) {
      logError("File upload error:", err);
      showToast({
        type: "error",
        message: errorMessage,
        duration: 3000,
      });
      return { success: false, error: err.message };
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = async (e, additionalData = {}) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    return handleUpload(file, additionalData);
  };

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return {
    uploading,
    fileInputRef,
    handleUpload,
    handleFileInputChange,
    resetFileInput,
  };
};

export default useFileUpload;
