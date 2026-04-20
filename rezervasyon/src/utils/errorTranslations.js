// Backend'den gelen İngilizce hata mesajlarını Türkçe'ye çeviren fonksiyonlar

const errorTranslations = {
  // Genel hatalar
  "Internal server error": "Sunucu hatası oluştu",
  "Bad request": "Geçersiz istek",
  Unauthorized: "Yetkisiz erişim",
  Forbidden: "Erişim reddedildi",
  "Not found": "Bulunamadı",
  "Method not allowed": "İzin verilmeyen yöntem",
  "Request timeout": "İstek zaman aşımına uğradı",
  "Too many requests": "Çok fazla istek",
  "Service unavailable": "Servis kullanılamıyor",

  // Validation hataları
  "Validation failed": "Doğrulama başarısız",
  "Invalid input": "Geçersiz giriş",
  "Required field": "Zorunlu alan",
  "Invalid email or password": "Geçersiz e-posta adresi veya şifre",
  "Invalid email": "Geçersiz e-posta adresi",
  "Invalid phone number": "Geçersiz telefon numarası",
  "Invalid date": "Geçersiz tarih",
  "Invalid amount": "Geçersiz tutar",
  "Invalid status": "Geçersiz durum",

  // Rezervasyon hataları
  "Reservation not found": "Rezervasyon bulunamadı",
  "Reservation already exists": "Rezervasyon zaten mevcut",
  "Invalid reservation date": "Geçersiz rezervasyon tarihi",
  "Reservation date in past": "Rezervasyon tarihi geçmişte",
  "Reservation conflict": "Rezervasyon çakışması",
  "Invalid guest count": "Geçersiz Salon Kapasitesi",
  "Invalid event type": "Geçersiz etkinlik türü",

  // Ödeme hataları
  "Payment not found": "Ödeme bulunamadı",
  "Invalid payment amount": "Geçersiz ödeme tutarı",
  "Payment already exists": "Ödeme zaten mevcut",
  "Invalid payment type": "Geçersiz ödeme türü",
  "Payment date in past": "Ödeme tarihi geçmişte",

  // Menü hataları
  "Menu not found": "Menü bulunamadı",
  "Invalid menu": "Geçersiz menü",
  "Menu already exists": "Menü zaten mevcut",
  "Invalid menu quantity": "Geçersiz menü miktarı",
  "Invalid menu price": "Geçersiz menü fiyatı",

  // Salon hataları
  "Salon not found": "Salon bulunamadı",
  "Invalid salon": "Geçersiz salon",
  "Salon already exists": "Salon zaten mevcut",
  "Invalid salon price": "Geçersiz salon fiyatı",

  // Kullanıcı hataları
  "User not found": "Kullanıcı bulunamadı",
  "Invalid user": "Geçersiz kullanıcı",
  "User already exists": "Kullanıcı zaten mevcut",
  "User with this email already exists":
    "Bu e-posta adresi ile kayıtlı kullanıcı zaten mevcut",
  "Invalid password": "Geçersiz şifre",
  "Invalid username": "Geçersiz kullanıcı adı",
  "Please provide a valid phone number":
    "Lütfen geçerli bir telefon numarası girin",
  "Please provide a valid email": "Lütfen geçerli bir e-posta adresi girin",
  "First name is required": "Ad zorunludur",
  "Last name is required": "Soyad zorunludur",
  "Email is required": "E-posta adresi zorunludur",
  "Password is required": "Şifre zorunludur",
  "Role is required": "Rol zorunludur",

  // Veritabanı hataları
  "Database connection error": "Veritabanı bağlantı hatası",
  "Database query error": "Veritabanı sorgu hatası",
  "Database constraint error": "Veritabanı kısıtlama hatası",
  "Database timeout": "Veritabanı zaman aşımı",

  // Dosya hataları
  "File not found": "Dosya bulunamadı",
  "Invalid file format": "Geçersiz dosya formatı",
  "File too large": "Dosya çok büyük",
  "File upload failed": "Dosya yükleme başarısız",

  // Network hataları
  "Network error": "Ağ hatası",
  "Connection failed": "Bağlantı başarısız",
  "Connection timeout": "Bağlantı zaman aşımı",
  "Server not responding": "Sunucu yanıt vermiyor",

  // JWT/Auth hataları
  "Token expired": "Token süresi dolmuş",
  "Invalid token": "Geçersiz token",
  "Token not provided": "Token sağlanmadı",
  "Authentication failed": "Kimlik doğrulama başarısız",
  "Authorization failed": "Yetkilendirme başarısız",

  // API hataları
  "API rate limit exceeded": "API hız sınırı aşıldı",
  "API key invalid": "Geçersiz API anahtarı",
  "API endpoint not found": "API endpoint bulunamadı",
  "API method not allowed": "API yöntemi izin verilmiyor",

  // Business logic hataları
  "Business rule violation": "İş kuralı ihlali",
  "Operation not allowed": "İşlem izin verilmiyor",
  "Resource locked": "Kaynak kilitli",
  "Resource conflict": "Kaynak çakışması",
  "Operation timeout": "İşlem zaman aşımı",

  // Özel hatalar
  "Circumcision event requires child name":
    "Sünnet etkinliği için çocuk adı gerekli",
  "Wedding event requires groom and bride names":
    "Düğün etkinliği için damat ve gelin adları gerekli",
  "Henna event requires person name": "Kına etkinliği için kişi adı gerekli",
  "Meeting event requires meeting title":
    "Toplantı etkinliği için toplantı başlığı gerekli",
  "Invalid TC number": "Geçersiz TC kimlik numarası",
  "Invalid birth date": "Geçersiz doğum tarihi",
  "Date must be in future": "Tarih gelecekte olmalı",
  "Date must be in past": "Tarih geçmişte olmalı",
  "Amount must be positive": "Tutar pozitif olmalı",
  "Quantity must be positive": "Miktar pozitif olmalı",
  "Price must be positive": "Fiyat pozitif olmalı",
  "Guest count must be positive": "Salon Kapasitesi pozitif olmalı",
  "Phone number already exists": "Telefon numarası zaten mevcut",
  "Email already exists": "E-posta adresi zaten mevcut",
  "TC number already exists": "TC kimlik numarası zaten mevcut",
  "Reservation number already exists": "Rezervasyon numarası zaten mevcut",
  "Salon is not available": "Salon müsait değil",
  "Salon is fully booked": "Salon tamamen dolu",
  "Reservation is locked": "Rezervasyon kilitli",
  "Reservation cannot be modified": "Rezervasyon değiştirilemez",
  "Reservation cannot be deleted": "Rezervasyon silinemez",
  "Payment cannot be deleted": "Ödeme silinemez",
  "Payment cannot be modified": "Ödeme değiştirilemez",
  "Menu cannot be deleted": "Menü silinemez",
  "Menu cannot be modified": "Menü değiştirilemez",
  "User cannot be deleted": "Kullanıcı silinemez",
  "User cannot be modified": "Kullanıcı değiştirilemez",
  "Salon cannot be deleted": "Salon silinemez",
  "Salon cannot be modified": "Salon değiştirilemez",

  // TC Kimlik No hataları
  "TC must be 11 digits": "TC kimlik numarası 11 haneli olmalıdır",
  "TC must be exactly 11 digits":
    "TC kimlik numarası tam olarak 11 haneli olmalıdır",
  "must be 11 digits": "11 haneli olmalıdır",
  "must be exactly 11 digits": "Tam olarak 11 haneli olmalıdır",
  "TC must contain only numbers": "TC kimlik numarası sadece rakam içermelidir",
  "must contain only numbers": "Sadece rakam içermelidir",
  "must be numeric": "Sadece rakam içermelidir",
  "Invalid TC format": "Geçersiz TC kimlik numarası formatı",
  "TC number must be 11 characters long":
    "TC kimlik numarası 11 karakter uzunluğunda olmalıdır",
  "TC is required": "TC kimlik numarası zorunludur",
  "groomTc must be 11 digits": "Damat TC kimlik numarası 11 haneli olmalıdır",
  "brideTc must be 11 digits": "Gelin TC kimlik numarası 11 haneli olmalıdır",
  "childTc must be 11 digits": "Çocuk TC kimlik numarası 11 haneli olmalıdır",
  "hennaTc must be 11 digits": "Kişi TC kimlik numarası 11 haneli olmalıdır",
  "customerTc must be 11 digits":
    "Müşteri TC kimlik numarası 11 haneli olmalıdır",
  "TC must be 11 characters": "TC kimlik numarası 11 karakter olmalıdır",
  "must be 11 characters": "11 karakter olmalıdır",
  "Groom TC must be 11 characters":
    "Damat TC kimlik numarası 11 karakter olmalıdır",
  "Bride TC must be 11 characters":
    "Gelin TC kimlik numarası 11 karakter olmalıdır",
  "Child TC must be 11 characters":
    "Çocuk TC kimlik numarası 11 karakter olmalıdır",
  "Customer TC must be 11 characters":
    "Müşteri TC kimlik numarası 11 karakter olmalıdır",
  "groomTc must be 11 characters":
    "Damat TC kimlik numarası 11 karakter olmalıdır",
  "brideTc must be 11 characters":
    "Gelin TC kimlik numarası 11 karakter olmalıdır",
  "childTc must be 11 characters":
    "Çocuk TC kimlik numarası 11 karakter olmalıdır",
  "hennaTc must be 11 characters":
    "Kişi TC kimlik numarası 11 karakter olmalıdır",
  "customerTc must be 11 characters":
    "Müşteri TC kimlik numarası 11 karakter olmalıdır",

  // İsim/Ad hataları
  "must be at least": "En az",
  "characters long": "karakter uzunluğunda olmalıdır",
  "must not exceed": "En fazla",
  "Name must be at least 2 characters": "İsim en az 2 karakter olmalıdır",
  "Name must be at least 2 characters long":
    "İsim en az 2 karakter uzunluğunda olmalıdır",
  "Name must not exceed 100 characters": "İsim en fazla 100 karakter olmalıdır",
  "must contain only letters": "Sadece harf içermelidir",
  "Name must contain only letters": "İsim sadece harf içermelidir",
  "customerName is required": "Müşteri adı zorunludur",
  "groomName is required": "Damat adı zorunludur",
  "brideName is required": "Gelin adı zorunludur",
  "childName is required": "Çocuk adı zorunludur",
  "hennaPersonName is required": "Kişi adı zorunludur",

  // Telefon hataları
  "Phone must be 11 digits": "Telefon numarası 11 haneli olmalıdır",
  "Phone must start with 0": "Telefon numarası 0 ile başlamalıdır",
  "Invalid phone format": "Geçersiz telefon formatı",
  "Phone number must be 11 characters":
    "Telefon numarası 11 karakter olmalıdır",
  "must be a valid phone number": "Geçerli bir telefon numarası olmalıdır",
  "customerPhone is required": "Müşteri telefonu zorunludur",
  "secondaryPhone is required": "İkinci telefon numarası zorunludur",

  // Sayısal alan hataları
  "must be a number": "Sayı olmalıdır",
  "must be a positive number": "Pozitif bir sayı olmalıdır",
  "must be greater than": "Daha büyük olmalıdır",
  "must be less than": "Daha küçük olmalıdır",
  "must be between": "Arasında olmalıdır",
};

// Hata mesajını çeviren ana fonksiyon
export const translateError = (errorMessage) => {
  if (!errorMessage || typeof errorMessage !== "string") {
    return errorMessage;
  }

  // Önce tam eşleşme ara
  if (errorTranslations[errorMessage]) {
    return errorTranslations[errorMessage];
  }

  // Alan isimlerini Türkçe'ye çevir
  const fieldNameTranslations = {
    customerName: "Müşteri Adı",
    customerTc: "Müşteri TC",
    customerPhone: "Müşteri Telefonu",
    secondaryPhone: "İkinci Telefon Numarası",
    groomName: "Damat Adı",
    groomTc: "Damat TC",
    brideName: "Gelin Adı",
    brideTc: "Gelin TC",
    childName: "Çocuk Adı",
    childTc: "Çocuk TC",
    hennaPersonName: "Kişi Adı",
    hennaTc: "Kişi TC",
    personName: "Kişi Adı",
    guestCount: "Salon Kapasitesi",
    salonPrice: "Salon Fiyatı",
  };

  // Alan ismi + hata mesajı formatını ayır (örn: "groomTc must be 11 digits")
  let translatedMessage = errorMessage;

  // Alan ismini Türkçe'ye çevir
  for (const [englishField, turkishField] of Object.entries(
    fieldNameTranslations
  )) {
    if (errorMessage.startsWith(englishField)) {
      translatedMessage = translatedMessage.replace(englishField, turkishField);
      break;
    }
  }

  // Kısmi eşleşme ara (büyük/küçük harf duyarsız)
  const lowerErrorMessage = errorMessage.toLowerCase();
  for (const [english, turkish] of Object.entries(errorTranslations)) {
    if (lowerErrorMessage.includes(english.toLowerCase())) {
      // Eğer alan adı varsa ve çevrilmişse, onu koru
      if (translatedMessage !== errorMessage) {
        // Alan adından sonraki kısmı çevir
        const parts = errorMessage.split(" ");
        const fieldName = parts[0];

        if (fieldNameTranslations[fieldName]) {
          translatedMessage = `${fieldNameTranslations[fieldName]} ${turkish}`;
          return translatedMessage;
        }
      }
      return turkish;
    }
  }

  // Eğer çeviri bulunamazsa, ama alan adı çevrilmişse çevrilmiş halini döndür
  if (translatedMessage !== errorMessage) {
    return translatedMessage;
  }

  // Hiçbir çeviri bulunamadıysa "Bilinmeyen hata" yerine daha açıklayıcı bir mesaj
  return errorMessage;
};

// Backend'den gelen hata objesini işleyen fonksiyon
export const translateBackendError = (error) => {
  if (!error) return "Bilinmeyen hata";

  // Eğer error bir string ise, doğrudan translateError'a gönder
  if (typeof error === "string") {
    return translateError(error);
  }

  // error.response?.data?.message
  if (error.response?.data?.message) {
    return translateError(error.response.data.message);
  }

  // error.response?.data?.errors (validation errors)
  if (
    error.response?.data?.errors &&
    Array.isArray(error.response.data.errors)
  ) {
    return error.response.data.errors
      .map((err) => translateError(err.msg || err.message || err))
      .join(", ");
  }

  // error.message
  if (error.message) {
    return translateError(error.message);
  }

  // error.response?.status
  if (error.response?.status) {
    const statusMessages = {
      400: "Geçersiz istek",
      401: "Yetkisiz erişim",
      403: "Erişim reddedildi",
      404: "Bulunamadı",
      405: "İzin verilmeyen yöntem",
      408: "İstek zaman aşımına uğradı",
      409: "Çakışma",
      422: "Doğrulama hatası",
      429: "Çok fazla istek",
      500: "Sunucu hatası",
      502: "Geçersiz ağ geçidi",
      503: "Servis kullanılamıyor",
      504: "Ağ geçidi zaman aşımı",
    };
    return (
      statusMessages[error.response.status] ||
      `HTTP ${error.response.status} hatası`
    );
  }

  return "Bilinmeyen hata";
};

// Validation hatalarını çeviren fonksiyon
export const translateValidationErrors = (errors) => {
  if (!errors || !Array.isArray(errors)) return errors;

  return errors.map((error) => ({
    ...error,
    msg: translateError(error.msg || error.message || error),
  }));
};

// Hata mesajını kullanıcı dostu hale getiren fonksiyon
export const formatErrorMessage = (error, context = "") => {
  const translatedError = translateBackendError(error);

  if (context) {
    return `${context}: ${translatedError}`;
  }

  return translatedError;
};
