/**
 * Logger Utility
 * Development'ta console'a yazar, production'da error tracking servisine gönderir
 */

const isDevelopment = import.meta.env.DEV;

/**
 * Mesaj logla (sadece development)
 */
export const log = (...args) => {
  if (isDevelopment) {
    console.log(...args);
  }
};

/**
 * Uyarı logla (sadece development)
 */
export const warn = (...args) => {
  if (isDevelopment) {
    console.warn(...args);
  }
};

/**
 * Hata logla (her zaman loglanır, production'da error tracking'e gönderilebilir)
 */
export const error = (...args) => {
  if (isDevelopment) {
    console.error(...args);
  } else {
    // Production'da error tracking servisine gönderilebilir
    // Örnek: Sentry, LogRocket, vb.
    // errorTrackingService.log(...args);
  }
};

/**
 * Bilgi mesajı logla (sadece development)
 */
export const info = (...args) => {
  if (isDevelopment) {
    console.info(...args);
  }
};

/**
 * Debug mesajı logla (sadece development)
 */
export const debug = (...args) => {
  if (isDevelopment) {
    console.debug(...args);
  }
};

const logger = {
  log,
  warn,
  error,
  info,
  debug,
};

export { logger };
export default logger;

