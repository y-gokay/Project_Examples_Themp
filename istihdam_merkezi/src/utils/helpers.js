import { format, formatDistanceToNow, parseISO, isValid } from "date-fns";
import { tr } from "date-fns/locale";
import { DATE_FORMATS } from "../constants";
import { error as logError } from "./logger";

/**
 * Görüntüleme için tarih string'ini formatla
 * @param {string|Date} date - Formatlanacak tarih
 * @param {string} formatStr - Format string'i (varsayılan: DATE_FORMATS.DISPLAY)
 * @returns {string} Formatlanmış tarih
 */
export const formatDate = (date, formatStr = DATE_FORMATS.DISPLAY) => {
  if (!date) return "";

  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) return "";

    return format(dateObj, formatStr, { locale: tr });
  } catch (err) {
    logError("Date formatting error:", err);
    return "";
  }
};

/**
 * Tarihi relative time olarak formatla (örn: "2 saat önce")
 * @param {string|Date} date - Formatlanacak tarih
 * @returns {string} Relative time string'i
 */
export const formatRelativeTime = (date) => {
  if (!date) return "";

  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) return "";

    return formatDistanceToNow(dateObj, { addSuffix: true, locale: tr });
  } catch (err) {
    logError("Relative time formatting error:", err);
    return "";
  }
};

/**
 * Türk Lirası olarak para birimini formatla
 * @param {number} amount - Formatlanacak tutar
 * @param {boolean} showDecimals - Ondalık basamakları göster (varsayılan: false)
 * @returns {string} Formatlanmış para birimi
 */
export const formatCurrency = (amount, showDecimals = false) => {
  if (amount === null || amount === undefined) return "";

  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);
};

/**
 * Maaş aralığını formatla
 * @param {number} min - Minimum maaş
 * @param {number} max - Maximum maaş
 * @returns {string} Formatlanmış maaş aralığı
 */
export const formatSalaryRange = (min, max) => {
  if (!min && !max) return "Belirtilmemiş";
  if (min && !max) return `${formatCurrency(min)}+`;
  if (!min && max) return `${formatCurrency(max)}'e kadar`;
  return `${formatCurrency(min)} - ${formatCurrency(max)}`;
};

/**
 * Telefon numarasını görsel formatla (kullanıcıya gösterim için)
 * @param {string} phone - Formatlanacak telefon numarası
 * @returns {string} Formatlanmış telefon numarası (örn: "0(5xx) xxx xx xx")
 */
export const formatPhoneNumberDisplay = (phone) => {
  if (!phone) return "";

  // Tüm rakam olmayan karakterleri kaldır
  const cleaned = phone.replace(/\D/g, "");

  // 10 haneli format (5 ile başlayan): 5365425847 -> 0(5xx) xxx xx xx
  if (cleaned.length === 10 && cleaned.startsWith("5")) {
    return `0(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)} ${cleaned.slice(
      6,
      8,
    )} ${cleaned.slice(8)}`;
  }

  // 11 haneli format (0 ile başlayan): 05365425847 -> 0(5xx) xxx xx xx
  if (cleaned.length === 11 && cleaned.startsWith("0")) {
    const withoutZero = cleaned.slice(1);
    return `0(${withoutZero.slice(0, 3)}) ${withoutZero.slice(
      3,
      6,
    )} ${withoutZero.slice(6, 8)} ${withoutZero.slice(8)}`;
  }

  // 12 haneli format (+90 ile başlayan): 905365425847 -> 0(5xx) xxx xx xx
  if (cleaned.length === 12 && cleaned.startsWith("90")) {
    const withoutCountry = cleaned.slice(2);
    return `0(${withoutCountry.slice(0, 3)}) ${withoutCountry.slice(
      3,
      6,
    )} ${withoutCountry.slice(6, 8)} ${withoutCountry.slice(8)}`;
  }

  // Eğer formatlanamazsa olduğu gibi döndür
  return phone;
};

/**
 * Telefon numarasını backend formatına normalize et (10 haneli, 5 ile başlayan)
 * @param {string} phone - Normalize edilecek telefon numarası
 * @returns {string} Normalize edilmiş telefon numarası (örn: "5365425847")
 */
export const normalizePhoneNumber = (phone) => {
  if (!phone) return "";

  // Tüm rakam olmayan karakterleri kaldır
  const cleaned = phone.replace(/\D/g, "");

  // 10 haneli ve 5 ile başlıyorsa direkt döndür
  if (cleaned.length === 10 && cleaned.startsWith("5")) {
    return cleaned;
  }

  // 11 haneli ve 0 ile başlıyorsa başındaki 0'ı kaldır
  if (cleaned.length === 11 && cleaned.startsWith("0")) {
    return cleaned.slice(1);
  }

  // 12 haneli ve 90 ile başlıyorsa 90'ı kaldır
  if (cleaned.length === 12 && cleaned.startsWith("90")) {
    return cleaned.slice(2);
  }

  // Eğer zaten 10 haneli değilse ve formatlanamazsa, sadece rakamları döndür
  return cleaned;
};

/**
 * Telefon numarasını formatla (eski fonksiyon - geriye uyumluluk için)
 * @param {string} phone - Formatlanacak telefon numarası
 * @returns {string} Formatlanmış telefon numarası
 * @deprecated formatPhoneNumberDisplay kullanın
 */
export const formatPhoneNumber = (phone) => {
  return formatPhoneNumberDisplay(phone);
};

/**
 * Metni ellipsis ile kısalt
 * @param {string} text - Kısaltılacak metin
 * @param {number} maxLength - Maximum uzunluk
 * @returns {string} Kısaltılmış metin
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
};

/**
 * İsimden baş harfleri al
 * @param {string} name - Tam isim
 * @returns {string} Baş harfler (maksimum 2 harf)
 */
export const getInitials = (name) => {
  if (!name) return "";

  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Profil tamamlanma yüzdesini hesapla
 * @param {Object} profile - Kullanıcı profil objesi
 * @returns {number} Tamamlanma yüzdesi (0-100)
 */
export const calculateProfileCompleteness = (profile) => {
  if (!profile) return 0;

  const fields = [
    profile.name,
    profile.email,
    profile.phone,
    profile.headline,
    profile.summary,
    profile.location?.city,
    profile.skills?.length > 0,
    profile.education?.length > 0,
    profile.experience?.length > 0,
  ];

  const filledFields = fields.filter(Boolean).length;
  return Math.round((filledFields / fields.length) * 100);
};

/**
 * Eşleşme skoru etiketi ve rengini al
 * @param {number} score - Eşleşme skoru (0-100)
 * @returns {Object} {label, color, bgColor}
 */
export const getMatchScoreInfo = (score) => {
  if (score >= 80) {
    return {
      label: "Mükemmel Eşleşme",
      color: "text-green-600",
      bgColor: "bg-green-100",
    };
  } else if (score >= 60) {
    return {
      label: "İyi Eşleşme",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    };
  } else if (score >= 40) {
    return {
      label: "Orta Eşleşme",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    };
  } else {
    return {
      label: "Düşük Eşleşme",
      color: "text-red-600",
      bgColor: "bg-red-100",
    };
  }
};

/**
 * E-posta adresini validate et
 * @param {string} email - Validate edilecek e-posta
 * @returns {boolean} Geçerli mi
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Türk telefon numarasını validate et
 * @param {string} phone - Validate edilecek telefon
 * @returns {Object} {isValid: boolean, error?: string}
 */
export const validatePhoneNumber = (phone) => {
  if (!phone) {
    return { isValid: false, error: "Telefon numarası gereklidir" };
  }

  const cleaned = phone.replace(/\D/g, "");

  // Boş kontrolü
  if (cleaned.length === 0) {
    return { isValid: false, error: "Telefon numarası gereklidir" };
  }

  // Normalize et
  const normalized = normalizePhoneNumber(phone);

  // 10 haneli olmalı
  if (normalized.length !== 10) {
    return { isValid: false, error: "Telefon numarası 10 haneli olmalıdır" };
  }

  // 5 ile başlamalı (Türk mobil numarası)
  if (!normalized.startsWith("5")) {
    return { isValid: false, error: "Telefon numarası 5 ile başlamalıdır" };
  }

  return { isValid: true };
};

/**
 * T.C. Kimlik numarasını validate et
 * @param {string} tc - Validate edilecek TC kimlik numarası
 * @returns {{isValid: boolean, error?: string}}
 */
export const validateTcKimlikNumber = (tc) => {
  if (!tc) {
    return { isValid: false, error: "TC Kimlik No zorunludur" };
  }

  const cleaned = String(tc).replace(/\D/g, "");

  if (cleaned.length !== 11) {
    return { isValid: false, error: "TC Kimlik No 11 haneli olmalıdır" };
  }

  if (cleaned[0] === "0") {
    return { isValid: false, error: "TC Kimlik No 0 ile başlayamaz" };
  }

  const digits = cleaned.split("").map(Number);
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
  const tenthDigit = ((oddSum * 7 - evenSum) % 10 + 10) % 10;
  const eleventhDigit =
    (digits[0] +
      digits[1] +
      digits[2] +
      digits[3] +
      digits[4] +
      digits[5] +
      digits[6] +
      digits[7] +
      digits[8] +
      digits[9]) %
    10;

  if (digits[9] !== tenthDigit || digits[10] !== eleventhDigit) {
    return { isValid: false, error: "Geçersiz TC Kimlik No" };
  }

  return { isValid: true };
};

/**
 * Türk telefon numarasını validate et (eski fonksiyon - geriye uyumluluk için)
 * @param {string} phone - Validate edilecek telefon
 * @returns {boolean} Geçerli mi
 * @deprecated validatePhoneNumber kullanın
 */
export const isValidPhoneNumber = (phone) => {
  return validatePhoneNumber(phone).isValid;
};

/**
 * Şifre gücünü validate et
 * @param {string} password - Validate edilecek şifre
 * @returns {Object} {isValid, errors, error} - error: ilk hata mesajı (tek string)
 */
export const validatePassword = (password) => {
  const errors = [];

  if (!password) {
    errors.push("Şifre gereklidir");
    return { isValid: false, errors, error: "Şifre gereklidir" };
  }

  if (password.length < 8) {
    errors.push("Şifre en az 8 karakter olmalıdır");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Şifre en az bir küçük harf içermelidir");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Şifre en az bir büyük harf içermelidir");
  }

  return {
    isValid: errors.length === 0,
    errors,
    error: errors.length > 0 ? errors[0] : null,
  };
};

/**
 * Dosya yüklemeyi validate et
 * @param {File} file - Validate edilecek dosya
 * @param {Object} limits - Dosya limitleri {maxSize, allowedTypes}
 * @returns {Object} {isValid, error}
 */
export const validateFileUpload = (file, limits) => {
  if (!file) {
    return { isValid: false, error: "Dosya seçilmedi" };
  }

  if (file.size > limits.maxSize) {
    const maxSizeMB = (limits.maxSize / (1024 * 1024)).toFixed(0);
    return {
      isValid: false,
      error: `Dosya boyutu ${maxSizeMB}MB'dan küçük olmalıdır`,
    };
  }

  if (!limits.allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `İzin verilen dosya türleri: ${limits.extensions.join(", ")}`,
    };
  }

  return { isValid: true };
};

/**
 * Meslek adını API yanıtlarından güvenli şekilde çıkarır.
 * Profession objesi, user profession kaydı veya deneyim objesi olabilir.
 *
 * @param {Object} professionOrExp - Meslek objesi, user profession kaydı veya deneyim objesi
 * @param {string} [professionId] - Opsiyonel meslek ID (lookup fallback için)
 * @param {Object} [lookups] - Opsiyonel lookup verisi (professions array içermeli)
 * @returns {string} Meslek adı veya "Bilinmeyen Meslek"
 */
export const getProfessionDisplayName = (
  professionOrExp,
  professionId,
  lookups,
) => {
  if (!professionOrExp || typeof professionOrExp !== "object") {
    return "Bilinmeyen Meslek";
  }

  const p = professionOrExp.profession || professionOrExp;
  const pObj = p && typeof p === "object" ? p : null;

  // profession.profession as string (API'den gelen yaygın format)
  if (p && typeof p === "string") {
    return p.trim() || "Bilinmeyen Meslek";
  }
  if (pObj?.profession && typeof pObj.profession === "string") {
    return pObj.profession.trim() || "Bilinmeyen Meslek";
  }
  // Nested profession.profession.name
  if (
    pObj?.profession &&
    typeof pObj.profession === "object" &&
    pObj.profession?.name
  ) {
    return String(pObj.profession.name).trim() || "Bilinmeyen Meslek";
  }
  // profession.name
  if (pObj?.name && typeof pObj.name === "string") {
    return pObj.name.trim() || "Bilinmeyen Meslek";
  }
  // profession.title
  if (pObj?.title && typeof pObj.title === "string") {
    return pObj.title.trim() || "Bilinmeyen Meslek";
  }
  // Direct name
  if (
    professionOrExp.name &&
    typeof professionOrExp.name === "string"
  ) {
    return professionOrExp.name.trim() || "Bilinmeyen Meslek";
  }
  if (
    professionOrExp.title &&
    typeof professionOrExp.title === "string"
  ) {
    return professionOrExp.title.trim() || "Bilinmeyen Meslek";
  }

  // Lookup fallback
  const id =
    professionId ||
    professionOrExp.professionId?.toString() ||
    professionOrExp.id?.toString();
  if (id && lookups?.professions) {
    const found = lookups.professions.find(
      (item) => item.id?.toString() === id,
    );
    if (found) {
      if (found.profession && typeof found.profession === "string") {
        return found.profession.trim() || "Bilinmeyen Meslek";
      }
      if (
        found.profession?.name &&
        typeof found.profession.name === "string"
      ) {
        return found.profession.name.trim() || "Bilinmeyen Meslek";
      }
      if (found.name && typeof found.name === "string") {
        return found.name.trim() || "Bilinmeyen Meslek";
      }
      if (found.title && typeof found.title === "string") {
        return found.title.trim() || "Bilinmeyen Meslek";
      }
    }
  }

  return "Bilinmeyen Meslek";
};

/**
 * Metinden URL slug oluştur
 * @param {string} text - Slug'lanacak metin
 * @returns {string} URL slug
 */
export const slugify = (text) => {
  if (!text) return "";

  const turkishMap = {
    ç: "c",
    Ç: "C",
    ğ: "g",
    Ğ: "G",
    ı: "i",
    İ: "I",
    ö: "o",
    Ö: "O",
    ş: "s",
    Ş: "S",
    ü: "u",
    Ü: "U",
  };

  return text
    .split("")
    .map((char) => turkishMap[char] || char)
    .join("")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/**
 * Debounce fonksiyonu
 * @param {Function} func - Debounce edilecek fonksiyon
 * @param {number} wait - Bekleme süresi (ms)
 * @returns {Function} Debounce edilmiş fonksiyon
 */
export const debounce = (func, wait = 300) => {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle fonksiyonu
 * @param {Function} func - Throttle edilecek fonksiyon
 * @param {number} limit - Limit süresi (ms)
 * @returns {Function} Throttle edilmiş fonksiyon
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;

  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Objeyi deep clone yap
 * @param {any} obj - Clone'lanacak obje
 * @returns {any} Clone'lanmış obje
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== "object") return obj;

  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (err) {
    logError("Deep clone error:", err);
    return obj;
  }
};

/**
 * Class name'leri birleştir (Tailwind ile kullanışlı)
 * @param {...string} classes - Birleştirilecek class name'ler
 * @returns {string} Birleştirilmiş class name'ler
 */
export const cn = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

/**
 * Dosya boyutunu okunabilir formatta al
 * @param {number} bytes - Dosya boyutu (byte)
 * @returns {string} Formatlanmış dosya boyutu
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

/**
 * Query params objesini URL search string'ine çevir
 * @param {Object} params - Query parametreleri
 * @returns {string} URL search string'i
 */
export const objectToQueryString = (params) => {
  const filtered = Object.entries(params)
    .filter(
      ([_, value]) => value !== undefined && value !== null && value !== "",
    )
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value
          .map((v) => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`)
          .join("&");
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    });

  return filtered.length > 0 ? `?${filtered.join("&")}` : "";
};

/**
 * Query string'i objeye parse et
 * @param {string} queryString - URL query string'i
 * @returns {Object} Parse edilmiş parametreler
 */
export const queryStringToObject = (queryString) => {
  if (!queryString) return {};

  const params = new URLSearchParams(queryString);
  const result = {};

  for (const [key, value] of params.entries()) {
    if (result[key]) {
      if (Array.isArray(result[key])) {
        result[key].push(value);
      } else {
        result[key] = [result[key], value];
      }
    } else {
      result[key] = value;
    }
  }

  return result;
};

/**
 * Metni clipboard'a kopyala
 * @param {string} text - Kopyalanacak metin
 * @returns {Promise<boolean>} Başarı durumu
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    logError("Clipboard copy error:", err);

    // Eski browser'lar için fallback
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackError) {
      logError("Fallback clipboard copy error:", fallbackError);
      return false;
    }
  }
};

/**
 * Kullanıcının mobil cihazda olup olmadığını kontrol et
 * @returns {boolean} Mobil mi
 */
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
};

/**
 * Sayfanın en üstüne scroll yap
 * @param {boolean} smooth - Smooth scrolling kullan
 */
export const scrollToTop = (smooth = true) => {
  window.scrollTo({
    top: 0,
    behavior: smooth ? "smooth" : "auto",
  });
};

/**
 * URL'den dosya indir
 * @param {string} url - Dosya URL'i
 * @param {string} filename - Kaydedilecek dosya adı
 */
export const downloadFile = (url, filename) => {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Eğitim seviyelerini en yüksekten en düşüğe sırala
 * @param {Array} educationLevels - Sıralanacak eğitim seviyeleri array'i
 * @returns {Array} Sıralanmış eğitim seviyeleri (en yüksekten en düşüğe)
 */
export const sortEducationLevels = (educationLevels) => {
  if (!educationLevels || !Array.isArray(educationLevels)) {
    return [];
  }

  // Eğitim seviyesi sıralaması: Doktora > Yüksek Lisans > Lisans > Önlisans > Lise > Ortaokul > İlkokul
  const order = [
    "Doktora",
    "Yüksek Lisans",
    "Lisans",
    "Önlisans",
    "Ön Lisans",
    "Lise",
    "Ortaöğretim",
    "Ortaöğretim (Lise ve Dengi)",
    "Ortaokul",
    "İlköğretim",
    "İlkokul",
    "Okur Yazar"
  ];

  return [...educationLevels].sort((a, b) => {
    const aType =
      a.educationType?.type || a.type || a.educationType || a.name || "";
    const bType =
      b.educationType?.type || b.type || b.educationType || b.name || "";

    const aIndex = order.indexOf(aType);
    const bIndex = order.indexOf(bType);

    // Eğer sıralama listesinde yoksa, alfabetik sırala (en sona)
    if (aIndex === -1 && bIndex === -1) {
      return aType.localeCompare(bType, "tr");
    }
    if (aIndex === -1) return 1; // a listede yoksa en sona
    if (bIndex === -1) return -1; // b listede yoksa en sona

    return aIndex - bIndex; // Küçük index = daha yüksek seviye
  });
};

/**
 * Eğitim tiplerini en yüksekten en düşüğe sırala (dropdown'lar için)
 * @param {Array} educationTypes - Sıralanacak eğitim tipleri array'i
 * @returns {Array} Sıralanmış eğitim tipleri (en yüksekten en düşüğe)
 */
export const sortEducationTypes = (educationTypes) => {
  if (!educationTypes || !Array.isArray(educationTypes)) {
    return [];
  }

  // Eğitim seviyesi sıralaması: Doktora > Yüksek Lisans > Lisans > Önlisans > Lise > Ortaokul > İlkokul
  const order = [
    "Doktora",
    "Yüksek Lisans",
    "Lisans",
    "Önlisans",
    "Ön Lisans",
    "Lise",
    "Ortaöğretim",
    "Ortaöğretim (Lise ve Dengi)",
    "Ortaokul",
    "İlköğretim",
    "İlkokul",
    "Okur Yazar"
  ];

  return [...educationTypes].sort((a, b) => {
    const aType = a.type || a.title || a.name || "";
    const bType = b.type || b.title || b.name || "";

    const aIndex = order.indexOf(aType);
    const bIndex = order.indexOf(bType);

    // Eğer sıralama listesinde yoksa, alfabetik sırala (en sona)
    if (aIndex === -1 && bIndex === -1) {
      return aType.localeCompare(bType, "tr");
    }
    if (aIndex === -1) return 1; // a listede yoksa en sona
    if (bIndex === -1) return -1; // b listede yoksa en sona

    return aIndex - bIndex; // Küçük index = daha yüksek seviye
  });
};
