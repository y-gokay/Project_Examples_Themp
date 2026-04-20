/**
 * useApiCall Hook - Standart API Çağrı Yönetimi
 * 
 * Bu hook, tüm API çağrıları için standart hata yönetimi ve loading state sağlar.
 * 
 * Neden Bu Hook Gerekli?
 * - Her API çağrısında aynı hata yönetimi kodunu tekrar yazmak yerine
 * - Tek bir hook ile loading, error ve success durumlarını yönetiriz
 * - Toast bildirimleri otomatik olarak gösterilir
 * - Kod tekrarını azaltır ve tutarlılık sağlar
 * 
 * Kullanım Örneği:
 * ```javascript
 * import { useApiCall } from '../hooks/useApiCall';
 * import { useAppStore } from '../store';
 * 
 * const MyComponent = () => {
 *   const { updateProfile } = useAppStore();
 *   const updateApi = useApiCall();
 *   
 *   const handleUpdate = async () => {
 *     await updateApi.execute(
 *       () => updateProfile(data),
 *       {
 *         successMessage: 'Profil başarıyla güncellendi',
 *         errorMessage: 'Profil güncellenirken bir hata oluştu',
 *         onSuccess: () => {
 *           console.log('Başarılı!');
 *         },
 *         onError: (error) => {
 *           console.error('Hata:', error);
 *         }
 *       }
 *     );
 *   };
 *   
 *   return (
 *     <button onClick={handleUpdate} disabled={updateApi.loading}>
 *       {updateApi.loading ? 'Yükleniyor...' : 'Güncelle'}
 *     </button>
 *   );
 * };
 * ```
 * 
 * @module hooks/useApiCall
 * @returns {Object} Hook return değerleri
 * @returns {boolean} loading - API çağrısı devam ediyor mu?
 * @returns {string|null} error - Hata mesajı (varsa)
 * @returns {Function} execute - API çağrısını yapan fonksiyon
 * @returns {Function} resetError - Hata state'ini sıfırlayan fonksiyon
 */

import { useState } from "react";
import { showToast } from "../components/ui/Toast";
import { error as logError } from "../utils/logger";

/**
 * useApiCall Hook
 * 
 * @returns {Object} { loading, error, execute, resetError }
 */
export const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Execute an async API function with standardized error handling
   * @param {Function} apiFunction - The async API function to execute
   * @param {Object} options - Configuration options
   * @param {boolean} options.showToast - Show toast on error (default: true)
   * @param {string} options.successMessage - Success message to show
   * @param {string} options.errorMessage - Custom error message
   * @returns {Promise<Object>} { success: boolean, data?: any, error?: string }
   */
  const execute = async (apiFunction, options = {}) => {
    const {
      showToastOnError = true,
      successMessage = null,
      errorMessage = null,
      onSuccess = null,
      onError = null,
    } = options;

    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction();

      if (result.success) {
        if (successMessage) {
          showToast({
            type: "success",
            message: successMessage,
            duration: 3000,
          });
        }

        if (onSuccess) {
          onSuccess(result.data);
        }

        setLoading(false);
        return { success: true, data: result.data };
      } else {
        // Backend'den gelen errors array'inden mesajları çıkar
        const backendErrorMsg = result.errors?.length
          ? result.errors.map(e => e.message || e.msg).filter(Boolean).join(", ")
          : null;
        const errorMsg = backendErrorMsg || result.error || errorMessage || "Bir hata oluştu";
        setError(errorMsg);

        if (showToastOnError) {
          showToast({
            type: "error",
            message: errorMsg,
            duration: 3000,
          });
        }

        if (onError) {
          onError(errorMsg);
        }

        setLoading(false);
        return { success: false, error: errorMsg, errors: result.errors || [] };
      }
    } catch (err) {
      // Geliştirici için detaylı hata log'u
      logError("API call error:", err);

      // Kullanıcıya gösterilecek genel hata mesajı (Türkçe ve anlaşılır)
      const fallbackMessage =
        "Şu anda işleminizi gerçekleştiremiyoruz. Lütfen daha sonra tekrar deneyin.";

      const errorMsg = errorMessage || fallbackMessage;
      setError(errorMsg);

      if (showToastOnError) {
        showToast({
          type: "error",
          message: errorMsg,
          duration: 3000,
        });
      }

      if (onError) {
        onError(errorMsg);
      }

      setLoading(false);
      return { success: false, error: errorMsg, errors: [] };
    }
  };

  /**
   * Reset error state
   */
  const resetError = () => {
    setError(null);
  };

  return { loading, error, execute, resetError };
};

export default useApiCall;


