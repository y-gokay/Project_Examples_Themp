import { useEffect, useState, useCallback } from "react";
import { getMyLogs, getSalons } from "../../api/axios";
import {
  formatCreatedAtDateTime,
  formatDisplayDateTime,
} from "../../utils/dateUtils";
import { formatCurrency } from "../../utils/currency";
import { APP_CONSTANTS } from "../../utils/constants";

export default function TodayActivities() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(10);
  const [expandedLogs, setExpandedLogs] = useState(new Set());
  const [salons, setSalons] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  const loadLogs = useCallback(
    async (page = 1, pageLimit = limit) => {
      try {
        setLoading(true);
        const params = { page, limit: pageLimit };
        if (filterType) {
          // Backend büyük harf bekliyor: RESERVATION, PAYMENT, MENU
          params.type = filterType.toUpperCase();
        }
        if (filterDate) {
          // Backend DATE parametresi bekliyor (büyük harf)
          params.Date = filterDate;
        }

        /* console.log("Filtreleme parametreleri:", params); */
        const response = await getMyLogs(params);
        const data = response.data;
        setLogs(data.logs || []);
        setPagination({
          currentPage: data.page || 1,
          totalPages: data.totalPages || 1,
          total: data.total || 0,
        });
      } catch (error) {
        console.error("Loglar yüklenirken hata:", error);
        window.toast?.error?.("İşlemler yüklenirken bir hata oluştu");
        setLogs([]);
      } finally {
        setLoading(false);
      }
    },
    [limit, filterType, filterDate]
  );

  // Salon listesini yükle
  useEffect(() => {
    const loadSalons = async () => {
      try {
        const response = await getSalons();
        const salonsData = response.data?.salons || response.data || [];
        setSalons(Array.isArray(salonsData) ? salonsData : []);
      } catch (error) {
        console.error("Salonlar yüklenirken hata:", error);
      }
    };
    loadSalons();
  }, []);

  // Filtre değiştiğinde sayfa numarasını 1'e sıfırla
  useEffect(() => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, [filterType, filterDate]);

  useEffect(() => {
    loadLogs(1, limit);
  }, [loadLogs, limit]);

  const toggleLogDetails = (logId) => {
    setExpandedLogs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const handleLimitChange = (e) => {
    const newLimit = Number(e.target.value);
    setLimit(newLimit);
    setExpandedLogs(new Set()); // Limit değiştiğinde tüm detayları kapat
    setPagination((prev) => ({ ...prev, currentPage: 1 })); // Sayfayı 1'e sıfırla
  };

  // CamelCase veya birleşik yazılmış kelimeleri düzgün formata çevir
  const formatEventType = (eventType) => {
    if (!eventType) return "";

    // CamelCase'i kelimelere ayır (büyük harflerden önce boşluk ekle)
    const formatted = eventType
      .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase split
      .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2") // consecutive capitals
      .split(" ")
      .map((word) => {
        // Her kelimenin ilk harfini büyük yap
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(" ");

    return formatted;
  };

  const getEventTypeLabel = (eventType) => {
    // Önce APP_CONSTANTS'tan label'ı kontrol et
    const normalType = APP_CONSTANTS.EVENT_TYPES.find(
      (type) => type.value === eventType
    );
    if (normalType) return normalType.label;

    const cultureType = APP_CONSTANTS.CULTURE_EVENT_TYPES.find(
      (type) => type.value === eventType
    );
    if (cultureType) return cultureType.label;

    // Bulunamazsa eventType'ı formatla (camelCase'i kelimelere ayır)
    if (eventType) {
      return formatEventType(eventType);
    }

    return eventType || "";
  };

  const getStatusLabel = (status) => {
    const statuses = {
      preliminary: "Ön Rezervasyon",
      completed: "Tamamlandı",
      cancelled: "İptal Edildi",
    };
    return statuses[status] || status;
  };

  // Tarih ve saat formatlama - basit ve kullanıcı dostu
  // Backend'den gelen tarihler UTC+3 formatında olduğu için -3 saat çıkarıyoruz
  const formatDateTime = (dateString, includeTime = true) => {
    if (!dateString) return "-";
    try {
      // formatDisplayDateTime kullanarak doğru timezone dönüşümü yapıyoruz
      if (includeTime) {
        return formatDisplayDateTime(dateString);
      } else {
        // Sadece tarih için
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "-";
        date.setHours(date.getHours() - 3); // +3 saat geri al
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
      }
    } catch {
      return "-";
    }
  };

  // Salon ID'sinden salon ismini al
  const getSalonName = (salonId) => {
    if (!salonId) return "-";
    const salon = salons.find((s) => s.id === Number(salonId));
    return salon?.name || salonId;
  };

  // Alan grupları ve sıralaması
  const fieldGroups = {
    "Müşteri Bilgileri": [
      "Müşteri Adı",
      "Telefon",
      "İkinci Telefon",
      "E-posta",
      "TC/ Vergi No",
      "Müşteri Adresi",
    ],
    "Rezervasyon Bilgileri": [
      "Rezervasyon Numarası",
      "Etkinlik Türü",
      "Başlangıç Tarihi",
      "Bitiş Tarihi",
      "Misafir Sayısı",
      "Salon",
      "Durum",
      "Notlar",
      "Sözleşme İmzalandı",
      "Mesaj Gönderimi",
    ],
    "Kasa Bilgiler": [
      "Salon Fiyatı",
      "İndirim",
      "İndirim Yüzdesi",
      "Toplam Tutar",
      "Menü Tutarı",
      "Toplam Ödenen",
      "Kalan",
    ],
    "Düğün Bilgileri": [
      "Damat Adı",
      "Gelin Adı",
      "Damatın Babası",
      "Damatın Annesi",
      "Gelinin Babası",
      "Gelinin Annesi",
    ],
    "Kültür Salonu Bilgileri": [
      "Organizasyon Adı",
      "Organizasyon Sahibi",
      "Organizasyon Sahibi Tel",
      "Vergi Dairesi",
      "Müşteri Banka Adı",
      "Müşteri Hesap Adı",
      "Müşteri IBAN",
    ],
    "Salon Bilgileri": [
      "Salon Adı",
      "Adres",
      "Telefon",
      "Varsayılan Kapasite",
      "Varsayılan Fiyat",
    ],
    "Ödeme Bilgileri": ["Yatırılan Tutar", "Ödeme Türü", "Ödeme Tarihi", "Not"],
    "Menü Bilgileri": ["Menü Adı", "Miktar", "Birim", "Birim Fiyat"],
  };

  // Alanı hangi gruba ait olduğunu belirle
  const getFieldGroup = (fieldLabel) => {
    for (const [group, fields] of Object.entries(fieldGroups)) {
      if (fields.includes(fieldLabel)) return group;
    }
    return "Diğer Bilgiler";
  };

  // Alan adını Türkçe etikete çevir
  const getFieldLabel = (fieldName) => {
    const fieldMap = {
      customerName: "Müşteri Adı",
      customerPhone: "Telefon",
      secondaryPhone: "İkinci Telefon",
      customerEmail: "E-posta",
      customerTc: "TC/ Vergi No",
      reservationNumber: "Rezervasyon Numarası",
      eventType: "Etkinlik Türü",
      startDate: "Başlangıç Tarihi",
      endDate: "Bitiş Tarihi",
      guestCount: "Misafir Sayısı",
      salonID: "Salon",
      salonPrice: "Salon Fiyatı",
      discount: "İndirim",
      totalPrice: "Toplam Tutar",
      menuPrice: "Menü Tutarı",
      paidAmount: "Toplam Ödenen",
      remainingAmount: "Kalan",
      status: "Durum",
      notes: "Notlar",
      isContractSigned: "Sözleşme İmzalandı",
      isMessageActive: "Mesaj Gönderimi",
      groomName: "Damat Adı",
      brideName: "Gelin Adı",
      groomFatherName: "Damatın Babası",
      groomMotherName: "Damatın Annesi",
      brideFatherName: "Gelinin Babası",
      brideMotherName: "Gelinin Annesi",
      orgName: "Organizasyon Adı",
      orgOwnerName: "Organizasyon Sahibi",
      address: "Müşteri Adresi",
      bank: "Müşteri Banka Adı",
      accountName: "Müşteri Hesap Adı",
      iban: "Müşteri IBAN",
      vergiDairesi: "Vergi Dairesi",
      discountPercentage: "İndirim Yüzdesi",
      menuName: "Menü Adı",
      quantity: "Miktar",
      unit: "Birim",
      unitPrice: "Birim Fiyat",
      amount: "Yatırılan Tutar",
      paymentType: "Ödeme Türü",
      paymentDate: "Ödeme Tarihi",
    };
    return fieldMap[fieldName] || fieldName;
  };

  // oldData'yı temizleyip kullanıcıya uygun formata çevir
  const formatOldData = (oldData, type = "reservation") => {
    if (!oldData) return null;

    // Backend detaylarını filtrele
    const excludedFields = [
      "id",
      "userId",
      "createdAt",
      "updatedAt",
      "reservationId",
    ];

    const cleanedData = { ...oldData };
    excludedFields.forEach((field) => {
      delete cleanedData[field];
    });

    // Rezervasyon için formatlama
    if (type === "reservation") {
      // Kültür salonu kontrolü
      const isCultureSalon =
        (cleanedData.orgName || cleanedData.orgOwnerName) &&
        !(cleanedData.groomName || cleanedData.brideName);

      const formatted = {
        "Rezervasyon Numarası": cleanedData.reservationNumber || "-",
        "Müşteri Adı": cleanedData.customerName || "-",
        Telefon: cleanedData.customerPhone || "-",
        "İkinci Telefon": cleanedData.secondaryPhone || "-",
        "E-posta": cleanedData.customerEmail || "-",
        "TC/ Vergi No": cleanedData.customerTc || "-",
        "Etkinlik Türü": cleanedData.eventType
          ? getEventTypeLabel(cleanedData.eventType)
          : "-",
        "Başlangıç Tarihi": formatDateTime(cleanedData.startDate),
        "Bitiş Tarihi": formatDateTime(cleanedData.endDate),
        "Misafir Sayısı": cleanedData.guestCount
          ? `${cleanedData.guestCount} kişi`
          : "-",
        Salon: cleanedData.salonID ? getSalonName(cleanedData.salonID) : "-",
        "Salon Fiyatı": cleanedData.salonPrice
          ? formatCurrency(cleanedData.salonPrice)
          : "-",
        İndirim: cleanedData.discount
          ? formatCurrency(cleanedData.discount)
          : "-",
        "Toplam Tutar": cleanedData.totalPrice
          ? formatCurrency(cleanedData.totalPrice)
          : "-",
        "Toplam Ödenen": cleanedData.paidAmount
          ? formatCurrency(cleanedData.paidAmount)
          : "-",
        Kalan: cleanedData.remainingAmount
          ? formatCurrency(cleanedData.remainingAmount)
          : "-",
        Durum: cleanedData.status ? getStatusLabel(cleanedData.status) : "-",
        Notlar: cleanedData.notes || "-",
        "Sözleşme İmzalandı": cleanedData.isContractSigned ? "Evet" : "Hayır",
        "Mesaj Gönderimi": cleanedData.isMessageActive ? "Aktif" : "Pasif",
        ...(cleanedData.groomName
          ? { "Damat Adı": cleanedData.groomName }
          : {}),
        ...(cleanedData.brideName
          ? { "Gelin Adı": cleanedData.brideName }
          : {}),
        ...(cleanedData.groomFatherName
          ? { "Damatın Babası": cleanedData.groomFatherName }
          : {}),
        ...(cleanedData.groomMotherName
          ? { "Damatın Annesi": cleanedData.groomMotherName }
          : {}),
        ...(cleanedData.brideFatherName
          ? { "Gelinin Babası": cleanedData.brideFatherName }
          : {}),
        ...(cleanedData.brideMotherName
          ? { "Gelinin Annesi": cleanedData.brideMotherName }
          : {}),
        ...(cleanedData.orgName
          ? { "Organizasyon Adı": cleanedData.orgName }
          : {}),
        ...(cleanedData.orgOwnerName
          ? { "Organizasyon Sahibi": cleanedData.orgOwnerName }
          : {}),
        ...(cleanedData.address
          ? { "Müşteri Adresi": cleanedData.address }
          : {}),
        ...(cleanedData.bank ? { "Müşteri Banka Adı": cleanedData.bank } : {}),
        ...(cleanedData.accountName
          ? { "Müşteri Hesap Adı": cleanedData.accountName }
          : {}),
        ...(cleanedData.iban ? { "Müşteri IBAN": cleanedData.iban } : {}),
        ...(cleanedData.vergiDairesi
          ? { "Vergi Dairesi": cleanedData.vergiDairesi }
          : {}),
        ...(cleanedData.discountPercentage
          ? { "İndirim Yüzdesi": `%${cleanedData.discountPercentage}` }
          : {}),
      };

      // Kültür salonlarında menuPrice'ı ekleme
      if (!isCultureSalon && cleanedData.menuPrice) {
        formatted["Menü Tutarı"] = formatCurrency(cleanedData.menuPrice);
      }

      return formatted;
    }

    // Menü için formatlama
    if (type === "menu") {
      return {
        "Menü Adı": cleanedData.menuName || "-",
        Miktar: cleanedData.quantity
          ? `${cleanedData.quantity} ${cleanedData.unit || ""}`
          : "-",
        "Toplam Tutar": cleanedData.totalPrice
          ? formatCurrency(cleanedData.totalPrice)
          : "-",
      };
    }

    // Salon için formatlama
    if (type === "salon") {
      return {
        "Salon Adı": cleanedData.name || "-",
        Adres: cleanedData.address || "-",
        Telefon: cleanedData.phoneNumber || "-",
        "Varsayılan Kapasite": cleanedData.defaultCapacity
          ? `${cleanedData.defaultCapacity} kişi`
          : "-",
        "Varsayılan Fiyat": cleanedData.defaultPrice
          ? formatCurrency(cleanedData.defaultPrice)
          : "-",
      };
    }

    return cleanedData;
  };

  const getActionInfo = (log) => {
    const { text, body, oldData } = log;

    // Rezervasyon güncelleme işlemleri için yardımcı fonksiyon
    const getBaseReservationInfo = (excludeSalon = false) => {
      const info = oldData ? formatOldData(oldData, "reservation") : {};
      if (info) {
        delete info["Başlangıç Tarihi"];
        delete info["Bitiş Tarihi"];
        if (excludeSalon) delete info["Salon"];
      }
      return info;
    };

    switch (text) {
      case "LOGGED":
        return {
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          ),
          title: "Sisteme Giriş Yapıldı",
          type: "Giriş",
          color: "border-l-blue-500",
          iconColor: "text-blue-600 dark:text-blue-400",
          iconBg: "bg-blue-50 dark:bg-blue-900/30",
        };

      case "CREATE RESERVATION": {
        // Kültür salonu kontrolü
        const isCreateCultureSalon =
          body &&
          (body.orgName ||
            body.organizationName ||
            body.orgOwnerName ||
            body.organizationOwnerName) &&
          !(body.groomName || body.brideName);

        return {
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          ),
          title: "Yeni Rezervasyon Oluşturuldu",
          type: "Rezervasyon",
          color: "border-l-green-500",
          iconColor: "text-green-600 dark:text-green-400",
          iconBg: "bg-green-50 dark:bg-green-900/30",
          details: body
            ? {
                "Müşteri Adı": body.customerName || "-",
                Telefon: body.customerPhone || "-",
                "İkinci Telefon": body.secondaryPhone || "-",
                "E-posta": body.customerEmail || "-",
                "TC/ Vergi No": body.customerTc || "-",
                Salon: body.salonID ? getSalonName(body.salonID) : "-",
                "Etkinlik Türü": body.eventType
                  ? getEventTypeLabel(body.eventType)
                  : "-",
                "Başlangıç Tarihi": formatDateTime(body.startDate),
                "Bitiş Tarihi": formatDateTime(body.endDate),
                "Misafir Sayısı": body.guestCount
                  ? `${body.guestCount} kişi`
                  : "-",
                "Salon Fiyatı": body.salonPrice
                  ? formatCurrency(body.salonPrice)
                  : "-",
                İndirim: body.discount ? formatCurrency(body.discount) : "-",
                "Toplam Tutar": body.totalPrice
                  ? formatCurrency(body.totalPrice)
                  : "-",
                "Toplam Ödenen": body.paidAmount
                  ? formatCurrency(body.paidAmount)
                  : "-",
                Kalan: body.remainingAmount
                  ? formatCurrency(body.remainingAmount)
                  : "-",
                Durum: body.status ? getStatusLabel(body.status) : "-",
                Notlar: body.notes || "-",
                "Sözleşme İmzalandı": body.isContractSigned ? "Evet" : "Hayır",
                "Mesaj Gönderimi": body.isMessageActive ? "Aktif" : "Pasif",
                // Kültür salonlarında menuPrice'ı ekleme
                ...(!isCreateCultureSalon && body.menuPrice
                  ? { "Menü Tutarı": formatCurrency(body.menuPrice) }
                  : {}),
                // Düğün salonları için ek bilgiler
                ...(body.groomName ? { "Damat Adı": body.groomName } : {}),
                ...(body.brideName ? { "Gelin Adı": body.brideName } : {}),
                ...(body.groomFatherName
                  ? { "Damatın Babası": body.groomFatherName }
                  : {}),
                ...(body.groomMotherName
                  ? { "Damatın Annesi": body.groomMotherName }
                  : {}),
                ...(body.brideFatherName
                  ? { "Gelinin Babası": body.brideFatherName }
                  : {}),
                ...(body.brideMotherName
                  ? { "Gelinin Annesi": body.brideMotherName }
                  : {}),
                // Kültür salonları için ek bilgiler
                ...(body.orgName || body.organizationName
                  ? {
                      "Organizasyon Adı": body.orgName || body.organizationName,
                    }
                  : {}),
                ...(body.orgOwnerName || body.organizationOwnerName
                  ? {
                      "Organizasyon Sahibi":
                        body.orgOwnerName || body.organizationOwnerName,
                    }
                  : {}),
                ...(body.organizationOwnerPhone
                  ? { "Organizasyon Sahibi Tel": body.organizationOwnerPhone }
                  : {}),
                ...(body.address || body.customerAddress
                  ? {
                      "Müşteri Adresi": body.address || body.customerAddress,
                    }
                  : {}),
                ...(body.bank || body.customerBankName
                  ? { "Müşteri Banka Adı": body.bank || body.customerBankName }
                  : {}),
                ...(body.accountName || body.customerAccountName
                  ? {
                      "Müşteri Hesap Adı":
                        body.accountName || body.customerAccountName,
                    }
                  : {}),
                ...(body.iban || body.customerIban
                  ? { "Müşteri IBAN": body.iban || body.customerIban }
                  : {}),
                ...(body.vergiDairesi || body.taxOffice
                  ? { "Vergi Dairesi": body.vergiDairesi || body.taxOffice }
                  : {}),
                ...(body.discountPercentage
                  ? { "İndirim Yüzdesi": `%${body.discountPercentage}` }
                  : {}),
              }
            : null,
        };
      }

      case "UPDATE RESERVATION": {
        // Kültür salonu kontrolü
        const isUpdateCultureSalon =
          body &&
          (body.orgName ||
            body.organizationName ||
            body.orgOwnerName ||
            body.organizationOwnerName ||
            oldData?.orgName ||
            oldData?.orgOwnerName) &&
          !(
            body.groomName ||
            body.brideName ||
            oldData?.groomName ||
            oldData?.brideName
          );

        return {
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          ),
          title: "Rezervasyon Güncellendi",
          type: "Güncelleme",
          color: "border-l-yellow-500",
          iconColor: "text-yellow-600 dark:text-yellow-400",
          iconBg: "bg-yellow-50 dark:bg-yellow-900/30",
          oldData: oldData ? formatOldData(oldData, "reservation") : null,
          details: body
            ? {
                "Müşteri Adı": body.customerName || "-",
                Telefon: body.customerPhone || "-",
                "İkinci Telefon": body.secondaryPhone || "-",
                "E-posta": body.customerEmail || "-",
                "TC/ Vergi No": body.customerTc || "-",
                Salon: body.salonID ? getSalonName(body.salonID) : "-",
                "Etkinlik Türü": body.eventType
                  ? getEventTypeLabel(body.eventType)
                  : "-",
                "Başlangıç Tarihi": formatDateTime(body.startDate),
                "Bitiş Tarihi": formatDateTime(body.endDate),
                "Misafir Sayısı": body.guestCount
                  ? `${body.guestCount} kişi`
                  : "-",
                "Salon Fiyatı": body.salonPrice
                  ? formatCurrency(body.salonPrice)
                  : "-",
                İndirim: body.discount ? formatCurrency(body.discount) : "-",
                "Toplam Tutar": body.totalPrice
                  ? formatCurrency(body.totalPrice)
                  : "-",
                "Toplam Ödenen": body.paidAmount
                  ? formatCurrency(body.paidAmount)
                  : "-",
                Kalan: body.remainingAmount
                  ? formatCurrency(body.remainingAmount)
                  : "-",
                Durum: body.status ? getStatusLabel(body.status) : "-",
                Notlar: body.notes || "-",
                "Sözleşme İmzalandı": body.isContractSigned ? "Evet" : "Hayır",
                "Mesaj Gönderimi": body.isMessageActive ? "Aktif" : "Pasif",
                // Kültür salonlarında menuPrice'ı ekleme
                ...(!isUpdateCultureSalon && body.menuPrice
                  ? { "Menü Tutarı": formatCurrency(body.menuPrice) }
                  : {}),
                // Düğün salonları için ek bilgiler
                ...(body.groomName ? { "Damat Adı": body.groomName } : {}),
                ...(body.brideName ? { "Gelin Adı": body.brideName } : {}),
                ...(body.groomFatherName
                  ? { "Damatın Babası": body.groomFatherName }
                  : {}),
                ...(body.groomMotherName
                  ? { "Damatın Annesi": body.groomMotherName }
                  : {}),
                ...(body.brideFatherName
                  ? { "Gelinin Babası": body.brideFatherName }
                  : {}),
                ...(body.brideMotherName
                  ? { "Gelinin Annesi": body.brideMotherName }
                  : {}),
                // Kültür salonları için ek bilgiler
                ...(body.orgName || body.organizationName
                  ? {
                      "Organizasyon Adı": body.orgName || body.organizationName,
                    }
                  : {}),
                ...(body.orgOwnerName || body.organizationOwnerName
                  ? {
                      "Organizasyon Sahibi":
                        body.orgOwnerName || body.organizationOwnerName,
                    }
                  : {}),
                ...(body.organizationOwnerPhone
                  ? { "Organizasyon Sahibi Tel": body.organizationOwnerPhone }
                  : {}),
                ...(body.address || body.customerAddress
                  ? {
                      "Müşteri Adresi": body.address || body.customerAddress,
                    }
                  : {}),
                ...(body.bank || body.customerBankName
                  ? { "Müşteri Banka Adı": body.bank || body.customerBankName }
                  : {}),
                ...(body.accountName || body.customerAccountName
                  ? {
                      "Müşteri Hesap Adı":
                        body.accountName || body.customerAccountName,
                    }
                  : {}),
                ...(body.iban || body.customerIban
                  ? { "Müşteri IBAN": body.iban || body.customerIban }
                  : {}),
                ...(body.vergiDairesi || body.taxOffice
                  ? { "Vergi Dairesi": body.vergiDairesi || body.taxOffice }
                  : {}),
                ...(body.discountPercentage
                  ? { "İndirim Yüzdesi": `%${body.discountPercentage}` }
                  : {}),
              }
            : null,
        };
      }

      case "UPDATE RESERVATION DATE": {
        const baseInfo = getBaseReservationInfo();

        return {
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          ),
          title: "Rezervasyon Tarihi Değiştirildi",
          type: "Tarih Değişikliği",
          color: "border-l-purple-500",
          iconColor: "text-purple-600 dark:text-purple-400",
          iconBg: "bg-purple-50 dark:bg-purple-900/30",
          oldData: oldData
            ? {
                ...baseInfo,
                "Eski Başlangıç Tarihi": formatDateTime(oldData.startDate),
                "Eski Bitiş Tarihi": formatDateTime(oldData.endDate),
              }
            : null,
          details: body
            ? {
                ...baseInfo,
                "Yeni Başlangıç Tarihi": formatDateTime(body.startDate),
                "Yeni Bitiş Tarihi": formatDateTime(body.endDate),
              }
            : null,
        };
      }

      case "UPDATE RESERVATION SALON+DATE": {
        const baseInfo = getBaseReservationInfo(true); // true = excludeSalon

        // Yeni salon bilgisini al
        const newSalonName = body.salon
          ? typeof body.salon === "object"
            ? body.salon.name || getSalonName(body.salon.id) || "-"
            : body.salon
          : body.salonID
          ? getSalonName(body.salonID)
          : "-";

        return {
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          ),
          title: "Rezervasyon Salonu ve Tarihi Değiştirildi",
          type: "Salon & Tarih Değişikliği",
          color: "border-l-indigo-500",
          iconColor: "text-indigo-600 dark:text-indigo-400",
          iconBg: "bg-indigo-50 dark:bg-indigo-900/30",
          oldData: oldData
            ? {
                ...baseInfo,
                "Eski Salon": getSalonName(oldData.salonID),
                "Eski Başlangıç Tarihi": formatDateTime(oldData.startDate),
                "Eski Bitiş Tarihi": formatDateTime(oldData.endDate),
              }
            : null,
          details: body
            ? {
                ...baseInfo,
                "Yeni Salon": newSalonName,
                "Yeni Başlangıç Tarihi": formatDateTime(body.startDate),
                "Yeni Bitiş Tarihi": formatDateTime(body.endDate),
              }
            : null,
        };
      }

      case "ADD PAYMENT RESERVATION": {
        // Tüm rezervasyon bilgilerini oldData'dan al
        const allReservationInfo = oldData
          ? formatOldData(oldData, "reservation")
          : {};

        return {
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          ),
          title: "Ödeme Alındı",
          type: "Ödeme",
          color: "border-l-emerald-500",
          iconColor: "text-emerald-600 dark:text-emerald-400",
          iconBg: "bg-emerald-50 dark:bg-emerald-900/30",
          oldData: allReservationInfo,
          details: body
            ? {
                ...allReservationInfo,
                "Yatırılan Tutar": body.amount
                  ? formatCurrency(body.amount)
                  : "-",
                "Ödeme Türü":
                  body.paymentType === "cash"
                    ? "Nakit"
                    : body.paymentType === "card"
                    ? "Kart"
                    : body.paymentType || "-",
                "Ödeme Tarihi": formatDateTime(body.paymentDate),
                Not: body.notes || "-",
              }
            : null,
        };
      }

      case "DELETE RESERVATION": {
        // Tüm rezervasyon bilgilerini oldData'dan al
        const allReservationInfo = oldData
          ? formatOldData(oldData, "reservation")
          : {};

        return {
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          ),
          title: "Rezervasyon İptal Edildi",
          type: "Silme",
          color: "border-l-red-500",
          iconColor: "text-red-600 dark:text-red-400",
          iconBg: "bg-red-50 dark:bg-red-900/30",
          oldData: allReservationInfo,
          details: allReservationInfo,
        };
      }

      case "DELETE PAYMENT RESERVATION": {
        // Tüm rezervasyon bilgilerini oldData'dan al
        const allReservationInfo = oldData
          ? formatOldData(oldData, "reservation")
          : {};

        return {
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ),
          title: "Ödeme Kaydı Silindi",
          type: "Silme",
          color: "border-l-red-500",
          iconColor: "text-red-600 dark:text-red-400",
          iconBg: "bg-red-50 dark:bg-red-900/30",
          oldData: allReservationInfo,
          details: null,
        };
      }

      case "CREATE MENU":
        return {
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          ),
          title: "Menü Eklendi",
          type: "Menü",
          color: "border-l-orange-500",
          iconColor: "text-orange-600 dark:text-orange-400",
          iconBg: "bg-orange-50 dark:bg-orange-900/30",
          details: body
            ? {
                "Menü Adı": body.menuName || "-",
                Miktar: body.quantity
                  ? `${body.quantity} ${body.unit || ""}`
                  : "-",
                "Birim Fiyat": body.unitPrice
                  ? formatCurrency(body.unitPrice)
                  : "-",
                "Toplam Tutar": body.totalPrice
                  ? formatCurrency(body.totalPrice)
                  : "-",
              }
            : null,
        };

      case "UPDATE MENU":
        return {
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          ),
          title: "Menü Güncellendi",
          type: "Güncelleme",
          color: "border-l-amber-500",
          iconColor: "text-amber-600 dark:text-amber-400",
          iconBg: "bg-amber-50 dark:bg-amber-900/30",
          oldData: oldData ? formatOldData(oldData, "menu") : null,
          details: body
            ? {
                "Menü Adı": body.menuName || "-",
                Miktar: body.quantity
                  ? `${body.quantity} ${body.unit || ""}`
                  : "-",
                "Toplam Tutar": body.totalPrice
                  ? formatCurrency(body.totalPrice)
                  : "-",
              }
            : null,
        };

      case "DELETE MENU":
        return {
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          ),
          title: "Menü Silindi",
          type: "Silme",
          color: "border-l-red-500",
          iconColor: "text-red-600 dark:text-red-400",
          iconBg: "bg-red-50 dark:bg-red-900/30",
          oldData: oldData ? formatOldData(oldData, "menu") : null,
        };

      case "UPDATE SALON":
        return {
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          ),
          title: "Salon Güncellendi",
          type: "Güncelleme",
          color: "border-l-yellow-500",
          iconColor: "text-yellow-600 dark:text-yellow-400",
          iconBg: "bg-yellow-50 dark:bg-yellow-900/30",
          oldData: oldData ? formatOldData(oldData, "salon") : null,
          details: body
            ? {
                "Salon Adı": body.name || "-",
                Adres: body.address || "-",
                Telefon: body.phoneNumber || "-",
                "Varsayılan Kapasite": body.defaultCapacity
                  ? `${body.defaultCapacity} kişi`
                  : "-",
                "Varsayılan Fiyat": body.defaultPrice
                  ? formatCurrency(body.defaultPrice)
                  : "-",
              }
            : null,
        };

      case "CREATE SALON":
        return {
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          ),
          title: "Yeni Salon Oluşturuldu",
          type: "Salon",
          color: "border-l-green-500",
          iconColor: "text-green-600 dark:text-green-400",
          iconBg: "bg-green-50 dark:bg-green-900/30",
          details: body
            ? {
                "Salon Adı": body.name || "-",
                Adres: body.address || "-",
                Telefon: body.phoneNumber || "-",
                "Varsayılan Kapasite": body.defaultCapacity
                  ? `${body.defaultCapacity} kişi`
                  : "-",
                "Varsayılan Fiyat": body.defaultPrice
                  ? formatCurrency(body.defaultPrice)
                  : "-",
              }
            : null,
        };

      default:
        return {
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          ),
          title: text || "İşlem Yapıldı",
          type: "Diğer",
          color: "border-l-gray-500",
          iconColor: "text-gray-600 dark:text-gray-400",
          iconBg: "bg-gray-50 dark:bg-gray-900/30",
        };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
            Hareketler
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Bugün gerçekleştirilen tüm işlemler
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {pagination.total}
            </div>
            <div className="text-xs text-gray-500 dark:text-slate-400">
              Toplam İşlem
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-slate-400 whitespace-nowrap">
              Sayfa başına:
            </label>
            <select
              value={limit}
              onChange={handleLimitChange}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filtreler */}
      <div className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-colors cursor-pointer appearance-none"
            >
              <option value="">Tüm İşlemler</option>
              <option value="reservation">Rezervasyon İşlemleri</option>
              <option value="payment">Ödeme İşlemleri</option>
              <option value="menu">Menü İşlemleri</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full sm:w-auto pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-colors cursor-pointer"
            />
          </div>

          {(filterType || filterDate) && (
            <button
              onClick={() => {
                setFilterType("");
                setFilterDate("");
              }}
              className="w-full sm:w-auto ml-auto px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Temizle
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="loading-spinner h-8 w-8 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-slate-400">
            İşlemler yükleniyor...
          </p>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400 dark:text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-slate-400 text-lg font-medium">
            Bugün henüz işlem yapılmamış
          </p>
          <p className="text-gray-400 dark:text-slate-500 text-sm mt-2">
            Gerçekleştirdiğiniz işlemler burada görüntülenecektir
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {logs.map((log) => {
              const actionInfo = getActionInfo(log);

              // Özet bilgi (müşteri adı ve salon)
              const summaryCustomer =
                log.body?.customerName ||
                log.oldData?.customerName ||
                log.body?.groomName ||
                log.oldData?.groomName;

              const summarySalonId = log.body?.salonID || log.oldData?.salonID;

              const summarySalonName =
                (log.body?.salon &&
                  (log.body.salon.name || getSalonName(log.body.salon.id))) ||
                (summarySalonId ? getSalonName(summarySalonId) : null);

              return (
                <div
                  key={log.id}
                  className={`bg-white dark:bg-slate-800 rounded-lg border-l-4 ${actionInfo.color} border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow`}
                >
                  <div className="p-5">
                    {/* Başlık Bölümü */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        {/* İkon */}
                        <div
                          className={`${actionInfo.iconBg} ${actionInfo.iconColor} rounded-lg p-2.5 flex-shrink-0`}
                        >
                          {actionInfo.icon}
                        </div>

                        {/* Başlık ve Tip */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">
                              {actionInfo.title}
                            </h3>
                            <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300">
                              {actionInfo.type}
                            </span>
                          </div>

                          {/* Müşteri ve Salon Özeti */}
                          {(summaryCustomer || summarySalonName) && (
                            <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-slate-400">
                              {summaryCustomer && (
                                <div className="flex items-center gap-1.5">
                                  <svg
                                    className="w-4 h-4 text-gray-400 dark:text-slate-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                  </svg>
                                  <span className="font-medium">
                                    {summaryCustomer}
                                  </span>
                                </div>
                              )}
                              {summarySalonName && (
                                <div className="flex items-center gap-1.5">
                                  <svg
                                    className="w-4 h-4 text-gray-400 dark:text-slate-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                    />
                                  </svg>
                                  <span className="font-medium">
                                    {summarySalonName}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-slate-400">
                            <div className="flex items-center gap-1.5">
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              {formatCreatedAtDateTime(log.createdAt)}
                            </div>
                            {log.user && (
                              <div className="flex items-center gap-1.5">
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                                {log.user.firstName} {log.user.lastName}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Detaylar Bölümü - Accordion */}
                    {((actionInfo.details &&
                      Object.keys(actionInfo.details).length > 0) ||
                      (actionInfo.oldData &&
                        Object.keys(actionInfo.oldData).length > 0)) && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                        <button
                          onClick={() => toggleLogDetails(log.id)}
                          className="w-full flex items-center justify-between text-sm font-medium text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100 transition-colors"
                        >
                          <span>
                            Detayları{" "}
                            {expandedLogs.has(log.id) ? "Gizle" : "Göster"}
                          </span>
                          <svg
                            className={`w-5 h-5 transition-transform ${
                              expandedLogs.has(log.id) ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                        {expandedLogs.has(log.id) && (
                          <div className="mt-4 animate-in fade-in duration-200">
                            {(() => {
                              // Özel gösterim gerektiren işlemler (Ödeme, Menü Ekle/Sil, Rezervasyon Silme)
                              const isSpecialDisplayAction =
                                log.text === "ADD PAYMENT RESERVATION" ||
                                log.text === "DELETE PAYMENT RESERVATION" ||
                                log.text === "DELETE RESERVATION" ||
                                log.text === "CREATE MENU" ||
                                log.text === "DELETE MENU";

                              // Bu işlemlerde sadece details veya oldData'yı göster (karşılaştırma yok)
                              if (isSpecialDisplayAction) {
                                const specialFields = [];
                                const addedKeys = new Set();

                                // oldData varsa göster
                                if (actionInfo.oldData) {
                                  Object.entries(actionInfo.oldData).forEach(
                                    ([key, value]) => {
                                      if (
                                        value &&
                                        value !== "-" &&
                                        !addedKeys.has(key)
                                      ) {
                                        specialFields.push({
                                          key,
                                          oldValue: null,
                                          newValue: value,
                                          hasChanged: false,
                                        });
                                        addedKeys.add(key);
                                      }
                                    }
                                  );
                                }

                                // details varsa göster (duplicate kontrolü ile)
                                if (actionInfo.details) {
                                  Object.entries(actionInfo.details).forEach(
                                    ([key, value]) => {
                                      if (
                                        value &&
                                        value !== "-" &&
                                        !addedKeys.has(key)
                                      ) {
                                        specialFields.push({
                                          key,
                                          oldValue: null,
                                          newValue: value,
                                          hasChanged: false,
                                        });
                                        addedKeys.add(key);
                                      }
                                    }
                                  );
                                }

                                if (specialFields.length === 0) {
                                  return (
                                    <p className="text-sm text-gray-500 dark:text-slate-400">
                                      Detay bulunmuyor
                                    </p>
                                  );
                                }

                                // Alanları gruplara ayır
                                const groupedSpecialFields = {};
                                specialFields.forEach((field) => {
                                  const group = getFieldGroup(field.key);
                                  if (!groupedSpecialFields[group]) {
                                    groupedSpecialFields[group] = [];
                                  }
                                  groupedSpecialFields[group].push(field);
                                });

                                const specialGroupOrder = [
                                  "Müşteri Bilgileri",
                                  "Rezervasyon Bilgileri",
                                  "Kasa Bilgiler",
                                  "Kültür Salonu Bilgileri",
                                  "Düğün Bilgileri",
                                  "Salon Bilgileri",
                                  "Ödeme Bilgileri",
                                  "Menü Bilgileri",
                                  "Diğer Bilgiler",
                                ];

                                return (
                                  <div className="space-y-6">
                                    {specialGroupOrder.map((groupName) => {
                                      const fields =
                                        groupedSpecialFields[groupName];
                                      if (!fields || fields.length === 0) {
                                        return null;
                                      }

                                      return (
                                        <div key={groupName}>
                                          <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                            <svg
                                              className="w-4 h-4"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                              />
                                            </svg>
                                            {groupName}
                                          </h4>
                                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {fields.map((field) => (
                                              <div
                                                key={field.key}
                                                className="flex flex-col"
                                              >
                                                <span className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                                                  {field.key}
                                                </span>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                  <span className="text-sm text-gray-900 dark:text-slate-100">
                                                    {(() => {
                                                      // Değeri string'e çevir (obje ise)
                                                      const val =
                                                        field.newValue;
                                                      if (
                                                        val === null ||
                                                        val === undefined
                                                      )
                                                        return "-";
                                                      if (
                                                        typeof val === "object"
                                                      ) {
                                                        return (
                                                          val.name ||
                                                          val.id ||
                                                          JSON.stringify(val)
                                                        );
                                                      }

                                                      // Alan key'ini bul
                                                      const fieldKeyMap = {
                                                        "Sözleşme İmzalandı":
                                                          "isContractSigned",
                                                        "Mesaj Gönderimi":
                                                          "isMessageActive",
                                                        Durum: "status",
                                                        "Etkinlik Türü":
                                                          "eventType",
                                                        Salon: "salonID",
                                                      };
                                                      const fieldKey =
                                                        fieldKeyMap[
                                                          field.key
                                                        ] || null;

                                                      // Tarih string'i kontrolü
                                                      if (
                                                        (fieldKey
                                                          ?.toLowerCase()
                                                          .includes("date") ||
                                                          field.key
                                                            ?.toLowerCase()
                                                            .includes(
                                                              "tarih"
                                                            )) &&
                                                        typeof val ===
                                                          "string" &&
                                                        (val.includes("T") ||
                                                          val.match(
                                                            /^\d{4}-\d{2}-\d{2}/
                                                          ))
                                                      ) {
                                                        return formatDateTime(
                                                          val
                                                        );
                                                      }

                                                      // Durum formatla
                                                      if (
                                                        fieldKey === "status" ||
                                                        field.key === "Durum"
                                                      ) {
                                                        return getStatusLabel(
                                                          val
                                                        );
                                                      }

                                                      // Etkinlik türü formatla
                                                      if (
                                                        fieldKey ===
                                                          "eventType" ||
                                                        field.key ===
                                                          "Etkinlik Türü"
                                                      ) {
                                                        return getEventTypeLabel(
                                                          val
                                                        );
                                                      }

                                                      // Sözleşme imzalandı formatla
                                                      if (
                                                        fieldKey ===
                                                          "isContractSigned" ||
                                                        field.key ===
                                                          "Sözleşme İmzalandı"
                                                      ) {
                                                        return val === true ||
                                                          val === "true"
                                                          ? "Evet"
                                                          : "Hayır";
                                                      }

                                                      // Mesaj gönderimi formatla
                                                      if (
                                                        fieldKey ===
                                                          "isMessageActive" ||
                                                        field.key ===
                                                          "Mesaj Gönderimi"
                                                      ) {
                                                        return val === true ||
                                                          val === "true"
                                                          ? "Aktif"
                                                          : "Pasif";
                                                      }

                                                      // Salon ID formatla
                                                      if (
                                                        fieldKey ===
                                                          "salonID" ||
                                                        field.key === "Salon"
                                                      ) {
                                                        return getSalonName(
                                                          val
                                                        );
                                                      }

                                                      return String(val);
                                                    })()}
                                                  </span>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                );
                              }

                              // oldData ve body'yi karşılaştır, tüm alanları göster
                              const allFields = [];

                              // Kültür salonu kontrolü (orgName veya orgOwnerName varsa)
                              const isCultureSalon =
                                (log.oldData?.orgName ||
                                  log.oldData?.orgOwnerName ||
                                  log.body?.orgName ||
                                  log.body?.orgOwnerName) &&
                                !(
                                  log.oldData?.groomName ||
                                  log.oldData?.brideName ||
                                  log.body?.groomName ||
                                  log.body?.brideName
                                );

                              // UPDATE RESERVATION DATE ve UPDATE RESERVATION SALON+DATE için özel kontrol
                              if (
                                (log.text === "UPDATE RESERVATION DATE" ||
                                  log.text ===
                                    "UPDATE RESERVATION SALON+DATE") &&
                                actionInfo.oldData &&
                                actionInfo.details
                              ) {
                                // Formatlanmış oldData ve details'i birleştir
                                Object.entries(actionInfo.oldData).forEach(
                                  ([key, oldValue]) => {
                                    // Yeni değeri details'ten bul
                                    const newKey = key.replace("Eski", "Yeni");
                                    const newValue =
                                      actionInfo.details[newKey] || null;

                                    allFields.push({
                                      key: key.replace("Eski ", ""),
                                      oldValue: oldValue,
                                      newValue: newValue,
                                      hasChanged: oldValue !== newValue,
                                    });
                                  }
                                );

                                // Details'te olup oldData'da olmayan alanları ekle
                                Object.entries(actionInfo.details).forEach(
                                  ([key, newValue]) => {
                                    if (
                                      !allFields.some(
                                        (f) =>
                                          f.key === key.replace("Yeni ", "")
                                      )
                                    ) {
                                      allFields.push({
                                        key: key.replace("Yeni ", ""),
                                        oldValue: null,
                                        newValue: newValue,
                                        hasChanged: false,
                                      });
                                    }
                                  }
                                );
                              } else if (log.oldData && log.body) {
                                const oldDataRaw = log.oldData;
                                const bodyRaw = log.body;

                                // Tüm alanları kontrol et
                                const allKeys = new Set([
                                  ...Object.keys(oldDataRaw || {}),
                                  ...Object.keys(bodyRaw || {}),
                                ]);

                                allKeys.forEach((key) => {
                                  // Backend detaylarını atla
                                  if (
                                    [
                                      "id",
                                      "userId",
                                      "createdAt",
                                      "updatedAt",
                                      "reservationNumber",
                                      "reservationId",
                                    ].includes(key)
                                  ) {
                                    return;
                                  }

                                  // Kültür salonlarında menuPrice'ı atla
                                  if (isCultureSalon && key === "menuPrice") {
                                    return;
                                  }

                                  const oldVal = oldDataRaw?.[key];
                                  const newVal = bodyRaw?.[key];

                                  // Değerleri normalize et (karşılaştırma için)
                                  const normalizeValue = (val) => {
                                    if (val === null || val === undefined)
                                      return "";
                                    // Obje ise string'e çevir
                                    if (typeof val === "object") {
                                      return (
                                        val.name ||
                                        val.id ||
                                        JSON.stringify(val)
                                      );
                                    }
                                    if (typeof val === "string") {
                                      const trimmed = val.trim();
                                      // Sayısal string'i sayıya çevir (örn: "32500.00" -> 32500)
                                      const numVal = parseFloat(trimmed);
                                      if (!isNaN(numVal) && isFinite(numVal)) {
                                        return numVal;
                                      }
                                      return trimmed;
                                    }
                                    if (typeof val === "number") return val;
                                    if (typeof val === "boolean") return val;
                                    return String(val);
                                  };

                                  const normalizedOld = normalizeValue(oldVal);
                                  const normalizedNew = normalizeValue(newVal);

                                  // Formatlanmış değerleri formatOldData ve details'ten al
                                  const fieldLabel = getFieldLabel(key);

                                  // oldData'dan formatlanmış değeri bul
                                  let oldFormatted = null;
                                  if (actionInfo.oldData) {
                                    const oldDataKey = Object.keys(
                                      actionInfo.oldData
                                    ).find((k) => k === fieldLabel);
                                    if (oldDataKey) {
                                      oldFormatted =
                                        actionInfo.oldData[oldDataKey];
                                    }
                                  }

                                  // details'ten formatlanmış değeri bul
                                  let newFormatted = null;
                                  if (actionInfo.details) {
                                    const detailsKey = Object.keys(
                                      actionInfo.details
                                    ).find((k) => k === fieldLabel);
                                    if (detailsKey) {
                                      newFormatted =
                                        actionInfo.details[detailsKey];
                                    }
                                  }

                                  // Tarih alanlarını tespit et
                                  const isDateField =
                                    key.toLowerCase().includes("date") ||
                                    key.toLowerCase().includes("tarih");

                                  // Salon ID alanını tespit et
                                  const isSalonField =
                                    key.toLowerCase() === "salonid" ||
                                    fieldLabel === "Salon";

                                  // Özel alanları tespit et
                                  const isStatusField =
                                    key === "status" || fieldLabel === "Durum";
                                  const isEventTypeField =
                                    key === "eventType" ||
                                    fieldLabel === "Etkinlik Türü";
                                  const isContractSignedField =
                                    key === "isContractSigned" ||
                                    fieldLabel === "Sözleşme İmzalandı";
                                  const isMessageActiveField =
                                    key === "isMessageActive" ||
                                    fieldLabel === "Mesaj Gönderimi";

                                  // Eğer formatlanmış değer bulunamadıysa, ham değeri kullan
                                  if (
                                    !oldFormatted &&
                                    oldVal !== null &&
                                    oldVal !== undefined
                                  ) {
                                    // Obje ise string'e çevir
                                    if (
                                      typeof oldVal === "object" &&
                                      oldVal !== null
                                    ) {
                                      oldFormatted =
                                        oldVal.name ||
                                        oldVal.id ||
                                        JSON.stringify(oldVal);
                                    } else if (
                                      isDateField &&
                                      typeof oldVal === "string" &&
                                      (oldVal.includes("T") ||
                                        oldVal.match(/^\d{4}-\d{2}-\d{2}/))
                                    ) {
                                      // Tarih string'i ise formatla
                                      oldFormatted = formatDateTime(oldVal);
                                    } else if (isSalonField) {
                                      // Salon ID ise salon ismine çevir
                                      oldFormatted = getSalonName(oldVal);
                                    } else if (isStatusField) {
                                      // Durum ise formatla
                                      oldFormatted = getStatusLabel(oldVal);
                                    } else if (isEventTypeField) {
                                      // Etkinlik türü ise formatla
                                      oldFormatted = getEventTypeLabel(oldVal);
                                    } else if (isContractSignedField) {
                                      // Sözleşme imzalandı ise boolean'ı çevir
                                      oldFormatted =
                                        oldVal === true || oldVal === "true"
                                          ? "Evet"
                                          : "Hayır";
                                    } else if (isMessageActiveField) {
                                      // Mesaj gönderimi ise boolean'ı çevir
                                      oldFormatted =
                                        oldVal === true || oldVal === "true"
                                          ? "Aktif"
                                          : "Pasif";
                                    } else {
                                      oldFormatted = oldVal;
                                    }
                                  }
                                  if (
                                    !newFormatted &&
                                    newVal !== null &&
                                    newVal !== undefined
                                  ) {
                                    // Obje ise string'e çevir
                                    if (
                                      typeof newVal === "object" &&
                                      newVal !== null
                                    ) {
                                      newFormatted =
                                        newVal.name ||
                                        newVal.id ||
                                        JSON.stringify(newVal);
                                    } else if (
                                      isDateField &&
                                      typeof newVal === "string" &&
                                      (newVal.includes("T") ||
                                        newVal.match(/^\d{4}-\d{2}-\d{2}/))
                                    ) {
                                      // Tarih string'i ise formatla
                                      newFormatted = formatDateTime(newVal);
                                    } else if (isSalonField) {
                                      // Salon ID ise salon ismine çevir
                                      newFormatted = getSalonName(newVal);
                                    } else if (isStatusField) {
                                      // Durum ise formatla
                                      newFormatted = getStatusLabel(newVal);
                                    } else if (isEventTypeField) {
                                      // Etkinlik türü ise formatla
                                      newFormatted = getEventTypeLabel(newVal);
                                    } else if (isContractSignedField) {
                                      // Sözleşme imzalandı ise boolean'ı çevir
                                      newFormatted =
                                        newVal === true || newVal === "true"
                                          ? "Evet"
                                          : "Hayır";
                                    } else if (isMessageActiveField) {
                                      // Mesaj gönderimi ise boolean'ı çevir
                                      newFormatted =
                                        newVal === true || newVal === "true"
                                          ? "Aktif"
                                          : "Pasif";
                                    } else {
                                      newFormatted = newVal;
                                    }
                                  }

                                  // Değerler farklı mı?
                                  const hasChanged =
                                    normalizedOld !== normalizedNew;

                                  // Tüm alanları ekle (değişen ve değişmeyen)
                                  if (oldFormatted || newFormatted) {
                                    allFields.push({
                                      key: fieldLabel,
                                      oldValue: oldFormatted || null,
                                      newValue: newFormatted || null,
                                      hasChanged,
                                    });
                                  }
                                });
                              }

                              // Eğer oldData yoksa, sadece details'i göster
                              if (!log.oldData && actionInfo.details) {
                                Object.entries(actionInfo.details).forEach(
                                  ([key, value]) => {
                                    // Kültür salonlarında menuPrice'ı atla
                                    if (
                                      isCultureSalon &&
                                      key === "Menü Tutarı"
                                    ) {
                                      return;
                                    }
                                    if (value && value !== "-") {
                                      allFields.push({
                                        key,
                                        oldValue: null,
                                        newValue: value,
                                        hasChanged: false,
                                      });
                                    }
                                  }
                                );
                              }

                              if (allFields.length === 0) {
                                return (
                                  <p className="text-sm text-gray-500 dark:text-slate-400">
                                    Detay bulunmuyor
                                  </p>
                                );
                              }

                              // Alanları gruplara ayır
                              const groupedFields = {};
                              allFields.forEach((field) => {
                                const group = getFieldGroup(field.key);
                                if (!groupedFields[group]) {
                                  groupedFields[group] = [];
                                }
                                groupedFields[group].push(field);
                              });

                              // Grup sıralaması
                              const groupOrder = [
                                "Müşteri Bilgileri",
                                "Rezervasyon Bilgileri",
                                "Kasa Bilgiler",
                                "Kültür Salonu Bilgileri",
                                "Düğün Bilgileri",
                                "Salon Bilgileri",
                                "Ödeme Bilgileri",
                                "Menü Bilgileri",
                                "Diğer Bilgiler",
                              ];

                              return (
                                <div className="space-y-6">
                                  {groupOrder.map((groupName) => {
                                    let fields = groupedFields[groupName];
                                    if (!fields || fields.length === 0) {
                                      return null;
                                    }

                                    // Alanları grup içindeki tanımlı sıraya göre sırala
                                    if (fieldGroups[groupName]) {
                                      fields.sort((a, b) => {
                                        const indexA = fieldGroups[
                                          groupName
                                        ].indexOf(a.key);
                                        const indexB = fieldGroups[
                                          groupName
                                        ].indexOf(b.key);

                                        if (indexA !== -1 && indexB !== -1)
                                          return indexA - indexB;
                                        if (indexA !== -1) return -1;
                                        if (indexB !== -1) return 1;
                                        return 0;
                                      });
                                    }

                                    return (
                                      <div key={groupName}>
                                        <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                          <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                          </svg>
                                          {groupName}
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                          {fields.map((field) => (
                                            <div
                                              key={field.key}
                                              className="flex flex-col"
                                            >
                                              <span className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                                                {field.key}
                                              </span>
                                              <div className="flex items-center gap-2 flex-wrap">
                                                {(() => {
                                                  // Değerleri string'e çevir (obje ise)
                                                  const formatValue = (
                                                    val,
                                                    fieldKey,
                                                    fieldLabel
                                                  ) => {
                                                    if (
                                                      val === null ||
                                                      val === undefined
                                                    )
                                                      return null;
                                                    if (
                                                      typeof val === "object"
                                                    ) {
                                                      return (
                                                        val.name ||
                                                        val.id ||
                                                        JSON.stringify(val)
                                                      );
                                                    }

                                                    // Özel alan kontrolleri
                                                    const isStatusField =
                                                      fieldKey === "status" ||
                                                      fieldLabel === "Durum";
                                                    const isEventTypeField =
                                                      fieldKey ===
                                                        "eventType" ||
                                                      fieldLabel ===
                                                        "Etkinlik Türü";
                                                    const isContractSignedField =
                                                      fieldKey ===
                                                        "isContractSigned" ||
                                                      fieldLabel ===
                                                        "Sözleşme İmzalandı";
                                                    const isMessageActiveField =
                                                      fieldKey ===
                                                        "isMessageActive" ||
                                                      fieldLabel ===
                                                        "Mesaj Gönderimi";
                                                    const isSalonField =
                                                      fieldKey === "salonID" ||
                                                      fieldLabel === "Salon";
                                                    const isDateField =
                                                      fieldKey
                                                        ?.toLowerCase()
                                                        .includes("date") ||
                                                      fieldLabel
                                                        ?.toLowerCase()
                                                        .includes("tarih");

                                                    // Tarih string'i kontrolü (ISO format: 2025-12-24T18:00:00.000Z)
                                                    if (
                                                      isDateField &&
                                                      typeof val === "string" &&
                                                      (val.includes("T") ||
                                                        val.match(
                                                          /^\d{4}-\d{2}-\d{2}/
                                                        ))
                                                    ) {
                                                      return formatDateTime(
                                                        val
                                                      );
                                                    }

                                                    // Durum formatla
                                                    if (isStatusField) {
                                                      return getStatusLabel(
                                                        val
                                                      );
                                                    }

                                                    // Etkinlik türü formatla
                                                    if (isEventTypeField) {
                                                      return getEventTypeLabel(
                                                        val
                                                      );
                                                    }

                                                    // Sözleşme imzalandı formatla
                                                    if (isContractSignedField) {
                                                      return val === true ||
                                                        val === "true"
                                                        ? "Evet"
                                                        : "Hayır";
                                                    }

                                                    // Mesaj gönderimi formatla
                                                    if (isMessageActiveField) {
                                                      return val === true ||
                                                        val === "true"
                                                        ? "Aktif"
                                                        : "Pasif";
                                                    }

                                                    // Salon ID formatla
                                                    if (isSalonField) {
                                                      return getSalonName(val);
                                                    }

                                                    return String(val);
                                                  };

                                                  // Alan key'ini bul (field.key'den)
                                                  const fieldKeyMap = {
                                                    "Sözleşme İmzalandı":
                                                      "isContractSigned",
                                                    "Mesaj Gönderimi":
                                                      "isMessageActive",
                                                    Durum: "status",
                                                    "Etkinlik Türü":
                                                      "eventType",
                                                    Salon: "salonID",
                                                  };
                                                  const fieldKey =
                                                    fieldKeyMap[field.key] ||
                                                    null;

                                                  const oldValueStr =
                                                    formatValue(
                                                      field.oldValue,
                                                      fieldKey,
                                                      field.key
                                                    );
                                                  const newValueStr =
                                                    formatValue(
                                                      field.newValue,
                                                      fieldKey,
                                                      field.key
                                                    );

                                                  if (
                                                    field.hasChanged &&
                                                    oldValueStr &&
                                                    newValueStr
                                                  ) {
                                                    return (
                                                      <>
                                                        <span className="text-sm text-red-600 dark:text-red-400 line-through">
                                                          {oldValueStr}
                                                        </span>
                                                        <svg
                                                          className="w-4 h-4 text-gray-400 dark:text-slate-500 flex-shrink-0"
                                                          fill="none"
                                                          stroke="currentColor"
                                                          viewBox="0 0 24 24"
                                                        >
                                                          <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                                                          />
                                                        </svg>
                                                        <span className="text-sm text-green-600 dark:text-green-400 font-semibold">
                                                          {newValueStr}
                                                        </span>
                                                      </>
                                                    );
                                                  } else if (newValueStr) {
                                                    return (
                                                      <span className="text-sm text-gray-900 dark:text-slate-100">
                                                        {newValueStr}
                                                      </span>
                                                    );
                                                  } else if (oldValueStr) {
                                                    return (
                                                      <span className="text-sm text-red-600 dark:text-red-400 line-through">
                                                        {oldValueStr}
                                                      </span>
                                                    );
                                                  }
                                                  return null;
                                                })()}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => loadLogs(pagination.currentPage - 1, limit)}
                disabled={pagination.currentPage === 1 || loading}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Önceki
              </button>
              <span className="text-sm text-gray-600 dark:text-slate-400 px-4">
                Sayfa {pagination.currentPage} / {pagination.totalPages}
              </span>
              <button
                onClick={() => loadLogs(pagination.currentPage + 1, limit)}
                disabled={
                  pagination.currentPage === pagination.totalPages || loading
                }
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sonraki →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
