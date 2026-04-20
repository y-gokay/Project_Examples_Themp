import { APP_CONSTANTS } from "./constants";

/**
 * Tarih ve saatten hafta içi/hafta sonu ve gündüz/akşam bilgisini belirler
 * @param {Date|string} date - Rezervasyon tarihi
 * @param {string} startTime - Başlangıç saati (HH:mm formatında)
 * @returns {Object} { isWeekend: boolean, isEvening: boolean }
 */
export const getTimeContext = (date, startTime) => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const dayOfWeek = dateObj.getDay(); // 0 = Pazar, 1 = Pazartesi, ..., 5 = Cuma, 6 = Cumartesi

  // Akşam kontrolü: 18:00 ve sonrası
  const [hours] = (startTime || APP_CONSTANTS.DEFAULT_START_TIME)
    .split(":")
    .map(Number);
  const isEvening = hours >= APP_CONSTANTS.EVENING_HOUR_THRESHOLD;

  // Hafta sonu: Cumartesi (6), Pazar (0) veya Cuma akşamı (5 ve akşam)
  // Cuma akşamları hafta sonu akşam fiyatından baz alınır
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 || (dayOfWeek === 5 && isEvening);

  return { isWeekend, isEvening };
};

/**
 * Salon fiyatını dinamik olarak hesaplar
 * Backend'den gelen alanları kullanır:
 * - weekDayMorningPrice: Hafta içi gündüz
 * - weekdayMorningNight: Hafta içi akşam
 * - weekendMorningPrice: Hafta sonu gündüz
 * - weekendNightprice: Hafta sonu akşam
 * - nikahPrice: Nikah için özel fiyat (tüm durumlar için öncelikli)
 *
 * @param {Object} salon - Salon objesi
 * @param {Date|string} date - Rezervasyon tarihi
 * @param {string} startTime - Başlangıç saati (HH:mm formatında)
 * @param {string} eventType - Etkinlik türü ("wedding", "nikah", vb.)
 * @returns {number} Salon fiyatı
 */
export const calculateSalonPrice = (salon, date, startTime, eventType) => {
  // Kültür salonları için özel fiyatlandırma yok
  if (salon?.type === "kultur") {
    const defaultPrice = Number(salon.defaultPrice) || 0;
    // Kültür salonlarında 0.01 veya 1 olarak gelen defaultPrice frontend'de 0 gösterilir
    if (defaultPrice === 1 || defaultPrice === 0.01) {
      return 0;
    }
    return Math.floor(defaultPrice);
  }

  // Düğün salonları için dinamik fiyatlandırma
  if (salon?.type === "dugun") {
    const { isWeekend, isEvening } = getTimeContext(date, startTime);
    const isNikah = eventType === "nikah";

    // Nikah için özel fiyat varsa ve null değilse öncelikle onu kullan
    if (
      isNikah &&
      salon.nikahPrice !== null &&
      salon.nikahPrice !== undefined
    ) {
      const nikahPrice = Number(salon.nikahPrice);
      if (!isNaN(nikahPrice) && nikahPrice > 0) {
        return Math.floor(nikahPrice);
      }
    }

    // Normal fiyatlandırma (nikah fiyatı yoksa veya null ise)
    if (isWeekend && isEvening) {
      // Hafta sonu akşam
      const price =
        salon.weekendNightprice !== null &&
        salon.weekendNightprice !== undefined
          ? Number(salon.weekendNightprice)
          : null;
      if (price !== null && !isNaN(price) && price > 0) {
        return Math.floor(price);
      }
    } else if (isWeekend && !isEvening) {
      // Hafta sonu gündüz
      const price =
        salon.weekendMorningPrice !== null &&
        salon.weekendMorningPrice !== undefined
          ? Number(salon.weekendMorningPrice)
          : null;
      if (price !== null && !isNaN(price) && price > 0) {
        return Math.floor(price);
      }
    } else if (!isWeekend && isEvening) {
      // Hafta içi akşam
      const price =
        salon.weekdayMorningNight !== null &&
        salon.weekdayMorningNight !== undefined
          ? Number(salon.weekdayMorningNight)
          : null;
      if (price !== null && !isNaN(price) && price > 0) {
        return Math.floor(price);
      }
    } else {
      // Hafta içi gündüz
      const price =
        salon.weekDayMorningPrice !== null &&
        salon.weekDayMorningPrice !== undefined
          ? Number(salon.weekDayMorningPrice)
          : null;
      if (price !== null && !isNaN(price) && price > 0) {
        return Math.floor(price);
      }
    }

    // Fallback: defaultPrice
    const defaultPrice = Number(salon.defaultPrice) || 0;
    return Math.floor(defaultPrice);
  }

  // Diğer durumlar için defaultPrice
  const defaultPrice = Number(salon?.defaultPrice) || 0;
  return Math.floor(defaultPrice);
};
