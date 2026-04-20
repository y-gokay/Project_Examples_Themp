import { useState } from "react";
import { error as logError } from "../utils/logger";

/**
 * Async işlemleri loading ve error state'leri ile yönetmek için hook
 * 
 * @returns {Object} { loading, error, execute, resetError }
 */
export const useAsyncOperation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Loading ve error state yönetimi ile async fonksiyon çalıştır
   * @param {Function} asyncFunction - Çalıştırılacak async fonksiyon
   * @param {Object} options - Yapılandırma seçenekleri
   * @param {Function} options.onSuccess - Başarılı olduğunda callback
   * @param {Function} options.onError - Hata olduğunda callback
   * @returns {Promise<any>} Async fonksiyonun sonucu
   */
  const execute = async (asyncFunction, options = {}) => {
    const { onSuccess = null, onError = null } = options;

    setLoading(true);
    setError(null);

    try {
      const result = await asyncFunction();
      
      if (onSuccess) {
        onSuccess(result);
      }

      setLoading(false);
      return result;
    } catch (err) {
      // Geliştirici için detaylı hata log'u
      logError("Async operation error:", err);

      // Kullanıcıya gösterilecek genel hata mesajı (Türkçe ve anlaşılır)
      const userFriendlyMessage =
        "Şu anda işleminizi gerçekleştiremiyoruz. Lütfen daha sonra tekrar deneyin.";

      setError(userFriendlyMessage);

      if (onError) {
        onError(userFriendlyMessage);
      }

      setLoading(false);
      throw err;
    }
  };

  /**
   * Error state'ini sıfırla
   */
  const resetError = () => {
    setError(null);
  };

  return { loading, error, execute, resetError };
};

export default useAsyncOperation;


