import { format, parseISO, isValid } from "date-fns";
import { tr } from "date-fns/locale";

// Date formatting utilities
export const formatDate = (date, formatStr = "dd.MM.yyyy") => {
  if (!date) return "";

  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) return "";

    return format(dateObj, formatStr, { locale: tr });
  } catch {
    return "";
  }
};

export const formatDateTime = (date, formatStr = "dd.MM.yyyy HH:mm") => {
  return formatDate(date, formatStr);
};

export const formatTime = (date, formatStr = "HH:mm") => {
  return formatDate(date, formatStr);
};

// Date range utilities
export const getDateRange = (range, customDates = {}) => {
  const today = new Date();
  const trKey = (d) =>
    new Date(d).toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const endOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    23,
    59,
    59
  );

  switch (range) {
    case "today": {
      const key = trKey(today);
      return { startDate: key, endDate: key };
    }

    case "week": {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
      return {
        startDate: trKey(startOfWeek),
        endDate: trKey(endOfWeek),
      };
    }

    case "month": {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return {
        startDate: trKey(startOfMonth),
        endDate: trKey(endOfMonth),
      };
    }

    case "year": {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const endOfYear = new Date(today.getFullYear(), 11, 31);
      return {
        startDate: trKey(startOfYear),
        endDate: trKey(endOfYear),
      };
    }

    case "custom":
      return {
        startDate: customDates.customStartDate || "2024-01-01",
        endDate: customDates.customEndDate || "2025-12-31",
      };

    default:
      return {
        startDate: "2024-01-01",
        endDate: "2025-12-31",
      };
  }
};

// Timezone utilities
export const toUTC = (dateTime) => {
  if (!dateTime) return null;

  try {
    const date = new Date(dateTime);
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - timezoneOffset).toISOString();
  } catch {
    return null;
  }
};

// Turkey timezone utilities
export const getTurkeyTime = (date = new Date()) => {
  return new Date(date.getTime() + 3 * 60 * 60 * 1000); // +3 hours
};

export const toTurkeyTime = (utcDate) => {
  if (!utcDate) return null;
  try {
    const date = new Date(utcDate);
    return new Date(date.getTime() + 3 * 60 * 60 * 1000); // +3 hours
  } catch {
    return null;
  }
};
export const toUTCFromTurkey = (turkeyDate) => {
  if (!turkeyDate) return null;
  try {
    const date = new Date(turkeyDate);
    return new Date(date.getTime() - 3 * 60 * 60 * 1000); // -3 hours
  } catch {
    return null;
  }
};

// Display utilities for consistent timezone handling
export const formatDisplayDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Istanbul",
  });
};

export const formatDisplayTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Istanbul",
  });
};

export const formatDisplayDateTime = (dateString) => {
  if (!dateString) return "";
  try {
    // Backend'e +3 saat eklenerek gönderildiği için, frontend'te -3 saat çıkar
    const date = new Date(dateString);
    date.setHours(date.getHours() - 3); // +3 saat geri al
    return date.toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString.replace("T", " ").slice(0, 16);
  }
};

export const formatCreatedAtDateTime = (dateString) => {
  if (!dateString) return "";
  try {
    // createdAt için timezone
    const date = new Date(dateString);
    return date.toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Istanbul",
    });
  } catch {
    return dateString.replace("T", " ").slice(0, 16);
  }
};

// Date comparison utilities
export const isToday = (date) => {
  if (!date) return false;

  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    const today = new Date();

    return (
      dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear()
    );
  } catch {
    return false;
  }
};

export const isThisMonth = (date) => {
  if (!date) return false;

  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    const today = new Date();

    return (
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear()
    );
  } catch {
    return false;
  }
};

export const isThisYear = (date) => {
  if (!date) return false;

  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    const today = new Date();

    return dateObj.getFullYear() === today.getFullYear();
  } catch {
    return false;
  }
};

// Rezervasyon kilitleme kontrolü - 1 ay geçen rezervasyonları kilitle
export const isReservationLocked = (startDate) => {
  try {
    if (!startDate) return false;

    const reservationDate =
      typeof startDate === "string" ? parseISO(startDate) : startDate;
    const today = new Date();

    const oneMonthAgo = new Date(today);
    oneMonthAgo.setDate(today.getDate() - 30);

    // Rezervasyon tarihi 1 ay öncesinden eskiyse kilitli
    return reservationDate < oneMonthAgo;
  } catch {
    return false;
  }
};

// Rezervasyon kilitleme mesajı
export const getReservationLockMessage = (startDate) => {
  if (!isReservationLocked(startDate)) return null;

  const reservationDate =
    typeof startDate === "string" ? parseISO(startDate) : startDate;
  const formattedDate = formatDate(reservationDate, "dd.MM.yyyy");

  return `Bu rezervasyon (${formattedDate}) 1 ay öncesinden eski olduğu için düzenlenemez veya silinemez.`;
};

// Tarih değişikliği kontrolü - mevcut günden geriye taşıma engeli
export const isDateInPast = (date) => {
  try {
    if (!date) return false;

    const targetDate = typeof date === "string" ? parseISO(date) : date;
    const today = new Date();

    // Bugünün başlangıcını al (00:00:00)
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    // Hedef tarihin başlangıcını al (00:00:00)
    const targetDateStart = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate()
    );

    // Hedef tarih bugünden önceyse geçmiş tarih
    return targetDateStart < todayStart;
  } catch {
    return false;
  }
};

// Tarih değişikliği uyarı mesajı
export const getDateInPastMessage = (date) => {
  if (!isDateInPast(date)) return null;

  const today = new Date();
  const formattedDate = formatDate(today, "dd.MM.yyyy");

  return `Bugünden (${formattedDate}) önce işlem yapılamaz. Lütfen bugün veya daha ileri bir tarih seçin.`;
};
