/**
 * Accessibility helpers for form components
 */

// Enhanced validation messages with more details
export const getDetailedValidationMessage = (
  field: string,
  value: string,
): string | null => {
  switch (field) {
    case "parentName":
    case "parentSurname":
      if (!value.trim()) return "Bu alan zorunludur";
      if (value.trim().length < 2)
        return `En az 2 karakter olmalıdır (şu an ${value.trim().length} karakter)`;
      if (value.trim().length > 50)
        return `En fazla 50 karakter olmalıdır (şu an ${value.trim().length} karakter)`;
      if (!/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/.test(value.trim()))
        return "Sadece harf ve boşluk karakterleri kullanılabilir";
      break;
    case "parentTc":
      if (!value) return "Bu alan zorunludur";
      if (value.length !== 11)
        return `T.C. Kimlik No tam olarak 11 haneli olmalıdır (şu an ${value.length} hane)`;
      if (!/^\d+$/.test(value)) return "Sadece rakam kullanılabilir";
      // TC validation algorithm (simplified)
      if (value.length === 11) {
        const digits = value.split("").map(Number);
        const sum1 = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
        const sum2 = digits[1] + digits[3] + digits[5] + digits[7];
        const check1 = (sum1 * 7 - sum2) % 10;
        const check2 = (sum1 + sum2 + digits[9]) % 10;
        if (check1 !== digits[9] || check2 !== digits[10]) {
          return "Geçersiz T.C. Kimlik No formatı";
        }
      }
      break;
    case "parentPhone":
      if (!value) return "Bu alan zorunludur";
      if (value.length !== 11)
        return `Telefon numarası tam olarak 11 haneli olmalıdır (şu an ${value.length} hane)`;
      if (!/^\d+$/.test(value)) return "Sadece rakam kullanılabilir";
      if (!value.startsWith("0")) return "Telefon numarası 0 ile başlamalıdır";
      if (!/^05\d{9}$/.test(value))
        return "Geçerli bir cep telefonu numarası giriniz (05XX XXX XX XX formatında)";
      break;
    case "parentEmail":
      if (!value) return "Bu alan zorunludur";
      if (!value.includes("@")) return "E-posta adresi @ işareti içermelidir";
      if (!value.includes(".")) return "E-posta adresi nokta (.) içermelidir";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        return "Geçerli bir e-posta formatı giriniz (örn: ornek@email.com)";
      if (value.length > 100)
        return `E-posta adresi çok uzun (maksimum 100 karakter, şu an ${value.length})`;
      // Check for common typos
      if (value.includes(".."))
        return "E-posta adresinde çift nokta (..) olamaz";
      if (value.startsWith(".") || value.endsWith("."))
        return "E-posta adresi nokta ile başlayıp bitemez";
      break;
    case "parentBirthDate":
      if (!value || value.length !== 10) return "Doğum tarihi seçiniz";
      break;
    case "parentDistrict":
      if (!value) return "İlçe seçiniz";
      break;
    case "parentSecondaryAddress":
      if (!value.trim()) return "Bu alan zorunludur";
      if (value.trim().length < 10)
        return `En az 10 karakter olmalıdır (şu an ${value.trim().length} karakter). Lütfen sokak, cadde, bina ve daire bilgilerini ekleyiniz.`;
      if (value.trim().length > 200)
        return `En fazla 200 karakter olmalıdır (şu an ${value.trim().length} karakter)`;
      break;
    case "parentSocialSecurity":
      if (!value) return "Sosyal güvence seçiniz";
      break;
    case "firstChoiceKresId":
      // 1. tercih zorunlu
      if (!value) return "Çocuk Gelişim Merkezi seçiniz";
      break;
    case "secondChoiceKresId":
    case "thirdChoiceKresId":
    case "fourthChoiceKresId":
      // 2./3./4. tercih opsiyonel; boş veya "none" ise hata verme
      if (!value || value === "none") return null;
      break;
    case "childFirstName":
    case "childLastName":
      if (!value.trim()) return "Bu alan zorunludur";
      if (value.trim().length < 2)
        return `En az 2 karakter olmalıdır (şu an ${value.trim().length} karakter)`;
      if (value.trim().length > 50)
        return `En fazla 50 karakter olmalıdır (şu an ${value.trim().length} karakter)`;
      if (!/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/.test(value.trim()))
        return "Sadece harf ve boşluk karakterleri kullanılabilir";
      break;
    case "childTcno":
      if (!value) return "Bu alan zorunludur";
      if (value.length !== 11)
        return `T.C. Kimlik No tam olarak 11 haneli olmalıdır (şu an ${value.length} hane)`;
      if (!/^\d+$/.test(value)) return "Sadece rakam kullanılabilir";
      // TC validation algorithm (simplified)
      if (value.length === 11) {
        const digits = value.split("").map(Number);
        const sum1 = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
        const sum2 = digits[1] + digits[3] + digits[5] + digits[7];
        const check1 = (sum1 * 7 - sum2) % 10;
        const check2 = (sum1 + sum2 + digits[9]) % 10;
        if (check1 !== digits[9] || check2 !== digits[10]) {
          return "Geçersiz T.C. Kimlik No formatı";
        }
      }
      break;
    case "childBirthDate":
      if (!value || value.length !== 10) return "Doğum tarihi seçiniz";
      break;
    case "childToiletTrained":
      if (!value) return "Lütfen seçim yapınız";
      break;
    case "childGender":
      if (!value || (value !== "erkek" && value !== "kız"))
        return "Çocuğun cinsiyetini seçiniz";
      break;
    case "isMunicipalityEmployee":
      if (!value) return "Lütfen seçim yapınız";
      break;
    case "hasChronicDisease":
      if (!value) return "Lütfen seçim yapınız";
      break;
    case "areParentsSeparated":
    case "hasDisabledPersonAtHome":
    case "isMotherWorking":
    case "isFatherWorking":
    case "isMotherDisabled":
    case "isFatherDisabled":
    case "isMotherHealthy":
    case "isFatherHealthy":
      if (!value) return "Lütfen seçim yapınız";
      break;
    case "totalIncomeRangeId":
      if (!value) return "Gelir aralığı seçiniz";
      break;
    case "declarationAccepted":
      if (!value) return "Lütfen bilgilendirme metnini okuyup onaylayınız";
      break;
  }
  return null;
};

// Auto-save helper
const STORAGE_KEY = "kres_basvuru_form_data";

export const saveFormDataToStorage = (formData: any) => {
  try {
    const dataToSave = {
      formData,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (error) {
    console.warn("Form verisi kaydedilemedi:", error);
  }
};

export const loadFormDataFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    const parsed = JSON.parse(saved);
    // Check if data is older than 7 days
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    if (parsed.timestamp < sevenDaysAgo) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed.formData;
  } catch (error) {
    console.warn("Form verisi yüklenemedi:", error);
    return null;
  }
};

export const clearFormDataFromStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Form verisi temizlenemedi:", error);
  }
};
