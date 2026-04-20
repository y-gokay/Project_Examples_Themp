// Validation utilities

// TC validation
export const validateTC = (tc) => {
  if (!tc) return { isValid: true, error: null }; // Boş ise optional
  if (tc.length !== 11)
    return { isValid: false, error: "TC kimlik numarası 11 haneli olmalıdır" };
  if (!/^\d{11}$/.test(tc))
    return {
      isValid: false,
      error: "TC kimlik numarası sadece rakam içermelidir",
    };
  return { isValid: true, error: null };
};

// TC/Vergi No validation (for culture salons)
export const validateTCOrTaxNumber = (value) => {
  if (!value) return { isValid: true, error: null }; // Boş ise optional
  const trimmed = value.trim();
  // TC No: 11 haneli rakam
  if (/^\d{11}$/.test(trimmed)) {
    return { isValid: true, error: null };
  }
  // Vergi No: 10 haneli rakam
  if (/^\d{10}$/.test(trimmed)) {
    return { isValid: true, error: null };
  }
  return {
    isValid: false,
    error: "TC kimlik numarası (11 haneli) veya Vergi numarası (10 haneli) giriniz",
  };
};

// Email validation
export const validateEmail = (email) => {
  if (!email) return { isValid: true, error: null }; // Boş ise optional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    return { isValid: false, error: "Geçerli bir e-posta adresi giriniz" };
  return { isValid: true, error: null };
};

// Phone validation
export const validatePhone = (phone) => {
  if (!phone) return { isValid: false, error: "Telefon numarası zorunludur" };
  if (!/^[0-9]+$/.test(phone))
    return {
      isValid: false,
      error: "Telefon numarası sadece rakam içermelidir",
    };
  if (phone.length !== 11)
    return { isValid: false, error: "Telefon numarası 11 haneli olmalıdır" };
  if (!/^05\d{9}$/.test(phone))
    return { isValid: false, error: "Telefon numarası 05 ile başlamalıdır" };
  return { isValid: true, error: null };
};

// Name validation (Turkish characters allowed)
export const validateName = (name) => {
  if (!name) return { isValid: false, error: "İsim zorunludur" };
  if (!/^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$/.test(name))
    return { isValid: false, error: "İsim sadece harf içermelidir" };
  if (name.trim().length < 2)
    return { isValid: false, error: "İsim en az 2 karakter olmalıdır" };
  return { isValid: true, error: null };
};

// Number validation
export const validateNumber = (value, min = 0, max = Infinity) => {
  if (!value && value !== 0) return { isValid: true, error: null }; // Boş ise optional
  const num = Number(value);
  if (isNaN(num)) return { isValid: false, error: "Geçerli bir sayı giriniz" };
  if (num < min) return { isValid: false, error: `En az ${min} olmalıdır` };
  if (num > max) return { isValid: false, error: `En fazla ${max} olabilir` };
  return { isValid: true, error: null };
};

// Password validation
export const validatePassword = (password, isRequired = true) => {
  if (!password) {
    if (isRequired) return { isValid: false, error: "Şifre zorunludur" };
    return { isValid: true, error: null };
  }
  if (password.length < 8)
    return { isValid: false, error: "Şifre en az 8 karakter olmalıdır" };
  if (!/(?=.*[a-z])/.test(password))
    return { isValid: false, error: "Şifre en az 1 küçük harf içermelidir" };
  if (!/(?=.*[A-Z])/.test(password))
    return { isValid: false, error: "Şifre en az 1 büyük harf içermelidir" };
  if (!/(?=.*\d)/.test(password))
    return { isValid: false, error: "Şifre en az 1 rakam içermelidir" };
  return { isValid: true, error: null };
};

export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

export const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return false;
  return new Date(startDate) <= new Date(endDate);
};

export const validateTimeRange = (startTime, endTime) => {
  if (!startTime || !endTime) return false;
  return startTime < endTime;
};

// IBAN validation
export const validateIBAN = (iban) => {
  if (!iban) return { isValid: true, error: null }; // Boş ise optional
  const trimmed = iban.replace(/\s/g, ""); // Boşlukları kaldır
  // Türkiye IBAN formatı: TR + 2 kontrol hanesi + 4 banka kodu + 1 rezerv alan + 16 hesap numarası = 26 karakter
  if (!/^TR\d{24}$/i.test(trimmed)) {
    return {
      isValid: false,
      error: "Geçerli bir IBAN giriniz (TR ile başlamalı, 26 karakter)",
    };
  }
  return { isValid: true, error: null };
};

// Bank name validation
export const validateBankName = (bank) => {
  if (!bank) return { isValid: true, error: null }; // Boş ise optional
  if (bank.trim().length < 2) {
    return { isValid: false, error: "Banka adı en az 2 karakter olmalıdır" };
  }
  if (!/^[a-zA-ZçÇğĞıİöÖşŞüÜ0-9\s.]+$/.test(bank)) {
    return {
      isValid: false,
      error: "Banka adı sadece harf, rakam ve nokta içerebilir",
    };
  }
  return { isValid: true, error: null };
};

// Account name validation
export const validateAccountName = (accountName) => {
  if (!accountName) return { isValid: true, error: null }; // Boş ise optional
  if (accountName.trim().length < 2) {
    return { isValid: false, error: "Hesap adı en az 2 karakter olmalıdır" };
  }
  if (!/^[a-zA-ZçÇğĞıİöÖşŞüÜ0-9\s.]+$/.test(accountName)) {
    return {
      isValid: false,
      error: "Hesap adı sadece harf, rakam ve nokta içerebilir",
    };
  }
  return { isValid: true, error: null };
};

// Address validation
export const validateAddress = (address) => {
  if (!address) return { isValid: true, error: null }; // Boş ise optional
  if (address.trim().length < 5) {
    return { isValid: false, error: "Adres en az 5 karakter olmalıdır" };
  }
  return { isValid: true, error: null };
};

// Form validation helper
export const validateForm = (form, rules) => {
  const errors = {};

  Object.keys(rules).forEach((field) => {
    const rule = rules[field];
    const value = form[field];

    if (rule.required && !validateRequired(value)) {
      errors[field] = rule.requiredMessage || `${field} alanı zorunludur`;
    }

    if (value && rule.email && !validateEmail(value)) {
      errors[field] = rule.emailMessage || "Geçerli bir email adresi giriniz";
    }

    if (value && rule.phone && !validatePhone(value)) {
      errors[field] =
        rule.phoneMessage ||
        "Geçerli bir telefon numarası giriniz (05xxxxxxxxx)";
    }

    if (value && rule.tc && !validateTC(value)) {
      errors[field] =
        rule.tcMessage || "Geçerli bir TC kimlik numarası giriniz";
    }
  });

  return errors;
};
