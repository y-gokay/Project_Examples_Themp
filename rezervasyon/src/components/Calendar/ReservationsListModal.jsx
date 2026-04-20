import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { isAdmin } from "../../utils/auth";
import { LuX } from "react-icons/lu";
import toast from "react-hot-toast";
import {
  getReservations,
  updateReservation,
  deleteReservation,
  getSalons,
  addPayment,
  deletePayment,
  getPdf,
  moveReservationDate,
  moveReservationSalon,
  createReservationMenu,
  updateReservationMenu,
  deleteReservationMenu,
  createSavedCustomer,
} from "../../api/axios";
import DatePickerModal from "./DatePickerModal";
import SavedCustomersModal from "./SavedCustomersModal";
import { formatCurrency } from "../../utils/currency";
import { calculateSalonPrice } from "../../utils/salonPricing";
import {
  isReservationLocked,
  getReservationLockMessage,
  isDateInPast,
  getDateInPastMessage,
  getTurkeyTime,
  formatDisplayDateTime,
  formatCreatedAtDateTime,
} from "../../utils/dateUtils";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";
import {
  translateBackendError,
  formatErrorMessage,
} from "../../utils/errorTranslations";
import { APP_CONSTANTS } from "../../utils/constants";
import {
  validateTC,
  validateTCOrTaxNumber,
  validateIBAN,
  validateBankName,
  validateAccountName,
  validateAddress,
} from "../../utils/validation";

const EVENT_TYPES = APP_CONSTANTS.EVENT_TYPES || [];
const CULTURE_EVENT_TYPES = APP_CONSTANTS.CULTURE_EVENT_TYPES || [];

const STATUS_OPTIONS = [
  { value: "preliminary", label: "Ön Rezervasyon" },
  { value: "completed", label: "Tamamlandı" },
  { value: "cancelled", label: "İptal Edildi" },
];

export default function ReservationsListModal({
  open,
  date,
  salonId,
  status = "all",
  onClose,
  onUpdated,
  onCreateNew,
  year = new Date().getFullYear(),
  selectedMonth = null,
  onStartDateChange,
  dateChangeMode,
  reservationToMove,
  onDateChangeComplete,
  onNavigateToCalendar,
  onStartSalonChange,
}) {
  // Kullanıcı yetkilerini al
  const { user } = useSelector((state) => state.auth);
  // Admin kullanıcıları için tüm yetkileri true yap
  const isUserAdmin = isAdmin(user);
  // Backend'den gelen yetkiler direkt user objesinin içinde olabilir, permissions objesine map et
  // user.permissions varsa onu kullan, eksik yetkileri user.allowXxx property'lerinden doldur
  const basePermissions = user?.permissions || {};
  const permissions = isUserAdmin
    ? {
        allowSozlesme: true,
        allowAddReservation: true,
        allowEditReservation: true,
        allowGetPayment: true,
        allowChangeDate: true,
        allowChangeSalon: true,
        allowCancelReservation: true,
        allowSearch: true,
        allowKasa: true,
        allowStatistics: true,
        allowExport: true,
        allowTodayActivities: true,
        allowSavedCustomers: true,
      }
    : {
        allowSozlesme:
          basePermissions.allowSozlesme ?? user?.allowSozlesme ?? false,
        allowAddReservation:
          basePermissions.allowAddReservation ??
          user?.allowAddReservation ??
          false,
        allowEditReservation:
          basePermissions.allowEditReservation ??
          user?.allowEditReservation ??
          false,
        allowGetPayment:
          basePermissions.allowGetPayment ?? user?.allowGetPayment ?? false,
        allowChangeDate:
          basePermissions.allowChangeDate ?? user?.allowChangeDate ?? false,
        allowChangeSalon:
          basePermissions.allowChangeSalon ?? user?.allowChangeSalon ?? false,
        allowCancelReservation:
          basePermissions.allowCancelReservation ??
          user?.allowCancelReservation ??
          false,
        allowSearch: basePermissions.allowSearch ?? user?.allowSearch ?? false,
        allowKasa: basePermissions.allowKasa ?? user?.allowKasa ?? false,
        allowStatistics:
          basePermissions.allowStatistics ?? user?.allowStatistics ?? false,
        allowExport: basePermissions.allowExport ?? user?.allowExport ?? false,
        allowTodayActivities:
          basePermissions.allowTodayActivities ??
          user?.allowTodayActivities ??
          false,
        allowSavedCustomers:
          basePermissions.allowSavedCustomers ??
          user?.allowSavedCustomers ??
          false,
      };

  // Fiyat bilgilerini görme yetkisi kontrolü
  const canViewPriceInfo =
    (permissions.allowAddReservation && permissions.allowEditReservation) ||
    permissions.allowGetPayment ||
    permissions.allowKasa;

  // allowChangeSalon yetkisi varsa buton gösterilir (admin ise veya normal kullanıcı ise)
  // Normal kullanıcılar için sistemdeki tüm salonlar arasında değiştirme yapılabilir
  const canChangeSalon = permissions.allowChangeSalon;

  const [reservations, setReservations] = useState([]);
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);

  // Modal açıkken veya düzenleme modalı açıkken scroll'u engelle
  useBodyScrollLock(open || editingReservation !== null);

  // ESC tuşu ile modalı kapat
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && open && !editingReservation) {
        onClose?.();
      }
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [open, onClose, editingReservation]);

  const [paymentReservation, setPaymentReservation] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [moveDateReservation, setMoveDateReservation] = useState(null);
  const [moveSalonReservation, setMoveSalonReservation] = useState(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    notes: "",
    paymentType: "cash",
    paymentDate: getTurkeyTime().toISOString().slice(0, 16), // Turkey timezone'da bugünün tarihi ve saati
  });
  const [moveDateForm, setMoveDateForm] = useState({
    startDate: "",
    endDate: "",
  });
  const [moveSalonForm, setMoveSalonForm] = useState({
    startDate: "",
    endDate: "",
    salonID: "",
  });
  const [form, setForm] = useState({
    customerName: "",
    customerTc: "",
    customerPhone: "",
    customerEmail: "",
    secondaryPhone: "",
    orgOwnerName: "",
    orgName: "",
    vergiDairesi: "",
    address: "",
    accountName: "",
    bank: "",
    iban: "",
    eventType: "wedding",
    guestCount: "",
    salonPrice: "",
    paidAmount: "",
    discount: "",
    discountPercentage: "",
    status: "preliminary",
    notes: "",
    startDate: "",
    endDate: "",
    // Wedding specific fields
    groomName: "",
    groomTc: "",
    groomBirthDate: "",
    groomFatherName: "",
    groomMotherName: "",
    brideName: "",
    brideTc: "",
    brideBirthDate: "",
    brideFatherName: "",
    brideMotherName: "",
    // Circumcision specific fields
    childName: "",
    childTc: "",
    childBirthDate: "",
    // Meeting specific fields
    meetingTitle: "",
    meetingDescription: "",
    // Henna specific fields
    hennaPersonName: "",
    hennaTc: "",
    hennaBirthDate: "",
    // Other event fields
    otherEventTitle: "",
    otherEventDescription: "",
    // Menu fields - yeni dinamik menü sistemi
    menus: [],
    // Message active
    isMessageActive: true,
    isContractSigned: false,
  });
  const [menuValidationErrors, setMenuValidationErrors] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [savedCustomersModalOpen, setSavedCustomersModalOpen] = useState(false);
  const [savingCustomer, setSavingCustomer] = useState(false);

  const cultureEventTypeValues = useMemo(
    () => APP_CONSTANTS.CULTURE_EVENT_TYPES?.map((type) => type.value) || [],
    []
  );

  const currentSalonType = useMemo(() => {
    if (editingReservation?.salon?.type) {
      return editingReservation.salon.type;
    }
    if (form.salonID) {
      const salon = salons.find((s) => s.id === Number(form.salonID));
      if (salon?.type) {
        return salon.type;
      }
    }
    return null;
  }, [editingReservation, salons, form.salonID]);

  const isCultureSalon = currentSalonType === "kultur";

  const nonCultureEventTypes = useMemo(() => {
    const filtered = (EVENT_TYPES || []).filter(
      (type) => !cultureEventTypeValues.includes(type.value)
    );
    // Normal salonlar için "other" seçeneğini ekle (CULTURE_EVENT_TYPES içindeki "other" filtrelenmiş olabilir)
    const hasOther = filtered.some((et) => et.value === "other");
    if (!hasOther) {
      filtered.push({ value: "other", label: "Diğer" });
    }
    return filtered;
  }, [cultureEventTypeValues]);

  const eventTypeOptions = isCultureSalon
    ? APP_CONSTANTS.CULTURE_EVENT_TYPES || []
    : nonCultureEventTypes;

  useEffect(() => {
    if (isCultureSalon && form.menus.length > 0) {
      setForm((prev) => ({
        ...prev,
        menus: [],
      }));
      setMenuValidationErrors({});
    }
  }, [isCultureSalon, form.menus.length]);

  // Auto-refresh için ref
  const autoRefreshIntervalRef = useRef(null);
  const loadReservations = useCallback(async () => {
    try {
      setLoading(true);

      const params = {};
      if (salonId) {
        params.salonID = salonId;
      }
      if (status && status !== "all") {
        params.status = status;
      }

      const reservationsResponse = await getReservations(params);

      const allReservations = reservationsResponse.data?.reservations || [];

      // Gelen stringi olduğu gibi kullanacak anahtar fonksiyonu.
      // Eğer 'd' string ise ilk 10 karakteri (YYYY-MM-DD) alır.
      // Eğer Date objesi ise toISOString()'dan UTC tarih kısmını alır.
      const toDateKey = (d) => {
        if (!d) return "";
        if (typeof d === "string") {
          // '2025-09-24' veya '2025-09-24T21:00:00.000Z' gibi formları destekler
          return d.length >= 10 ? d.substring(0, 10) : d;
        }
        // Date objesi -> ISO (UTC) tarih
        return d.toISOString().slice(0, 10);
      };

      const selectedDateKey = toDateKey(date);

      const dayReservations = allReservations.filter((reservation) => {
        const reservationDateKey = toDateKey(reservation.startDate);
        return reservationDateKey === selectedDateKey;
      });

      setReservations(dayReservations);
    } catch {
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, [date, salonId, status]);

  const loadSalons = useCallback(async () => {
    try {
      const response = await getSalons();
      const salonsData = response.data?.salons || response.data || [];
      setSalons(salonsData);
    } catch {
      setSalons([]);
    }
  }, []);
  const getPdfFunc = async (id) => {
    try {
      const response = await getPdf(id);
      const fileURL = window.URL.createObjectURL(new Blob([response.data]));
      const fileLink = document.createElement("a");
      fileLink.href = fileURL;
      fileLink.setAttribute("download", `rezervasyon_${id}.pdf`);
      document.body.appendChild(fileLink);
      fileLink.click();
      fileLink.remove();
    } catch {
      // Error handling
    }
  };

  useEffect(() => {
    if (open && date) {
      loadReservations();
      loadSalons();
    }
  }, [open, date, status, loadReservations, loadSalons]);

  // Otomatik yenileme mekanizması - modal açıkken her 30 saniyede bir
  useEffect(() => {
    if (!open) {
      // Modal kapalıysa interval'i temizle
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
        autoRefreshIntervalRef.current = null;
      }
      return;
    }

    // Modal açıkken 30 saniyede bir rezervasyonları yenile
    autoRefreshIntervalRef.current = setInterval(() => {
      loadReservations();
    }, 30000);

    return () => {
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
        autoRefreshIntervalRef.current = null;
      }
    };
  }, [open, loadReservations]);

  // Tarih değiştirme modunda form'u otomatik doldur
  useEffect(() => {
    if (dateChangeMode && reservationToMove && date) {
      // Rezervasyonun orijinal saatlerini al ve ekranda gösterilen saatle tutarlı olması için -3 saat uygula
      const originalStartDate = new Date(reservationToMove.startDate);
      const originalEndDate = new Date(reservationToMove.endDate);
      originalStartDate.setHours(originalStartDate.getHours() - 3);
      originalEndDate.setHours(originalEndDate.getHours() - 3);

      // Orijinal saatleri HH:MM formatında al
      const originalStartTime = originalStartDate.toTimeString().slice(0, 5);
      const originalEndTime = originalEndDate.toTimeString().slice(0, 5);

      // Seçilen tarih ve orijinal saatleri form'a doldur
      const startDate = new Date(`${date}T${originalStartTime}:00`);
      const endDate = new Date(`${date}T${originalEndTime}:00`);

      setMoveDateForm({
        startDate: `${startDate.getFullYear()}-${String(
          startDate.getMonth() + 1
        ).padStart(2, "0")}-${String(startDate.getDate()).padStart(
          2,
          "0"
        )}T${String(startDate.getHours()).padStart(2, "0")}:${String(
          startDate.getMinutes()
        ).padStart(2, "0")}`,
        endDate: `${endDate.getFullYear()}-${String(
          endDate.getMonth() + 1
        ).padStart(2, "0")}-${String(endDate.getDate()).padStart(
          2,
          "0"
        )}T${String(endDate.getHours()).padStart(2, "0")}:${String(
          endDate.getMinutes()
        ).padStart(2, "0")}`,
      });
    }
  }, [dateChangeMode, reservationToMove, date]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        if (datePickerOpen) {
          setDatePickerOpen(false);
        } else if (moveDateReservation) {
          setMoveDateReservation(null);
        } else if (editingReservation) {
          setEditingReservation(null);
          setMenuValidationErrors({});
        } else if (paymentReservation) {
          setPaymentReservation(null);
          setPaymentHistory([]);
        } else {
          onClose();
        }
      }
    };

    if (
      open ||
      editingReservation ||
      paymentReservation ||
      moveDateReservation ||
      datePickerOpen
    ) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [
    open,
    editingReservation,
    paymentReservation,
    moveDateReservation,
    datePickerOpen,
    onClose,
  ]);

  const handleEdit = (reservation) => {
    // 1 ay geçen rezervasyonları düzenlemeyi engelle
    if (isReservationLocked(reservation.startDate)) {
      toast.warning(getReservationLockMessage(reservation.startDate));
      return;
    }

    setEditingReservation(reservation);

    // Kültür salonu kontrolü - salon fiyatı işlemeden önce tanımlanmalı
    const isReservationCulture =
      reservation.salon?.type === "kultur" ||
      (reservation.salonID &&
        salons.find((s) => s.id === reservation.salonID)?.type === "kultur");

    const startD = new Date(reservation.startDate);
    startD.setHours(startD.getHours() + 3);
    const endd = new Date(reservation.endDate);
    endd.setHours(endd.getHours() + 3);
    const defaultCultureEventType =
      APP_CONSTANTS.CULTURE_EVENT_TYPES?.[0]?.value || "panel";
    const normalizedEventType = isReservationCulture
      ? cultureEventTypeValues.includes(reservation.eventType) ||
        reservation.eventType === "otherEvent"
        ? reservation.eventType === "otherEvent"
          ? "other"
          : reservation.eventType
        : defaultCultureEventType
      : reservation.eventType || "wedding";

    // Salon fiyatı değeri - dinamik fiyatlandırma varsa kullan
    let salonPriceValueInt = "";
    const salonForReservation =
      salons.find((s) => s.id === reservation.salonID) || reservation.salon;

    if (salonForReservation?.type === "dugun" && reservation.startDate) {
      // Düğün salonunda dinamik fiyat hesapla
      const startDateStr = reservation.startDate.includes("T")
        ? reservation.startDate.split("T")[0]
        : reservation.startDate;
      // startTime reservation'da yoksa startDate'ten çıkar veya default kullan
      const startTimeStr =
        reservation.startTime ||
        (reservation.startDate.includes("T")
          ? reservation.startDate.split("T")[1]?.slice(0, 5)
          : APP_CONSTANTS.DEFAULT_START_TIME);

      const calculatedPrice = calculateSalonPrice(
        salonForReservation,
        startDateStr,
        startTimeStr,
        normalizedEventType
      );
      salonPriceValueInt = calculatedPrice.toString();
    } else {
      // Backend'den salonPrice yoksa salon.defaultPrice kullan
      const salonPriceValue =
        reservation.salonPrice || reservation.salon?.defaultPrice || "";
      // Kültür salonlarında backend'den gelen 1 değerini frontend'de 0 olarak göster
      salonPriceValueInt = salonPriceValue
        ? Math.floor(Number(salonPriceValue)).toString()
        : "";
      if (
        isReservationCulture &&
        (salonPriceValueInt === "1" || salonPriceValueInt === "0.01")
      ) {
        salonPriceValueInt = "0";
      }
    }

    // Kültür salonlarında indirim yüzdesi hesaplama
    // Backend'den discountPercentage gelmiyorsa, discount ve salonPrice'tan hesapla
    let discountPercentageValue = reservation.discountPercentage || "";
    if (
      isReservationCulture &&
      !discountPercentageValue &&
      reservation.discount
    ) {
      const discountAmount = Number(reservation.discount) || 0;
      const salonPrice = Number(salonPriceValueInt) || 0;
      if (salonPrice > 0 && discountAmount > 0) {
        // Yüzdeyi hesapla: (indirim tutarı / salon fiyatı) * 100
        discountPercentageValue = ((discountAmount / salonPrice) * 100).toFixed(
          2
        );
      }
    }

    setForm({
      customerName: reservation.customerName || "",
      customerTc: reservation.customerTc || "",
      customerPhone: reservation.customerPhone || "",
      customerEmail: reservation.customerEmail || "",
      secondaryPhone: reservation.secondaryPhone || "",
      orgOwnerName: reservation.orgOwnerName || "",
      orgName: reservation.orgName || "",
      vergiDairesi: reservation.vergiDairesi || "",
      address: reservation.address || "",
      accountName: reservation.accountName || "",
      bank: reservation.bank || "",
      iban: reservation.iban || "",
      eventType: normalizedEventType,
      guestCount: reservation.guestCount || "",
      salonPrice: salonPriceValueInt,
      paidAmount: reservation.paidAmount || "",
      discount: reservation.discount
        ? Math.floor(Number(reservation.discount)).toString()
        : "",
      discountPercentage: discountPercentageValue,
      _priceAutoUpdated:
        salonForReservation?.type === "dugun"
          ? salonForReservation.id
          : undefined,
      status: reservation.status || "preliminary",
      notes: reservation.notes || "",
      // Wedding specific fields
      groomName: reservation.groomName || "",
      groomTc: reservation.groomTc || "",
      groomBirthDate: reservation.groomBirthDate || "",
      groomFatherName: reservation.groomFatherName || "",
      groomMotherName: reservation.groomMotherName || "",
      brideName: reservation.brideName || "",
      brideTc: reservation.brideTc || "",
      brideBirthDate: reservation.brideBirthDate || "",
      brideFatherName: reservation.brideFatherName || "",
      brideMotherName: reservation.brideMotherName || "",
      // Circumcision specific fields
      childName: reservation.childName || "",
      childTc: reservation.childTc || "",
      childBirthDate: reservation.childBirthDate || "",
      // Meeting specific fields
      meetingTitle: reservation.meetingTitle || "",
      meetingDescription: reservation.meetingDescription || "",
      // Henna specific fields
      hennaPersonName: reservation.hennaPersonName || "",
      hennaTc: reservation.hennaTc || "",
      hennaBirthDate: reservation.hennaBirthDate || "",
      // Other event fields
      otherEventTitle:
        reservation.otherEvent || reservation.otherEventTitle || "",
      otherEventDescription: reservation.otherEventDescription || "",
      // Menu fields - yeni dinamik menü sistemi
      menus: isReservationCulture
        ? []
        : reservation.reservationMenus?.map((menu, index) => ({
            id: `menu-${index}`,
            backendId: menu.id, // Backend'den gelen gerçek ID
            name: menu.menuName || "",
            price: menu.totalPrice || 0,
            quantity: menu.quantity || 0,
            unit: menu.unit || "adet",
            isNew: false,
            isModified: false,
          })) || [],
      // Additional services
      hasPhotography: reservation.hasPhotography || false,
      photographyPrice: reservation.photographyPrice || "",
      hasMusic: reservation.hasMusic || false,
      musicPrice: reservation.musicPrice || "",
      hasDecoration: reservation.hasDecoration || false,
      decorationPrice: reservation.decorationPrice || "",
      // Salon info
      salonID: reservation.salonID || "",
      // Date fields - doğrudan kullan
      startDate: reservation.startDate ? startD.toISOString().slice(0, 16) : "",
      endDate: reservation.endDate ? endd.toISOString().slice(0, 16) : "",
      // Message active
      isMessageActive:
        reservation.isMessageActive !== undefined
          ? reservation.isMessageActive
          : false,
      isContractSigned: Boolean(reservation.isContractSigned),
    });

    if (isReservationCulture) {
      setMenuValidationErrors({});
    }
  };

  // Not used here currently; kept for potential payment detail display inside this modal.

  // Error message component
  const ErrorMessage = useCallback(
    ({ fieldName }) => {
      if (!validationErrors[fieldName]) return null;
      return (
        <div className="mt-1 text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {validationErrors[fieldName]}
        </div>
      );
    },
    [validationErrors]
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Kültür salonlarında discountPercentage için maksimum 100 kontrolü
    let processedValue = value;
    if (name === "discountPercentage" && isCultureSalon && value) {
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue > 100) {
        processedValue = "100";
      }
    }

    // Salon fiyatı ve indirim için ondalık kısmı temizle (sadece tam sayı)
    if ((name === "salonPrice" || name === "discount") && value) {
      const numValue = Number(value);
      if (!isNaN(numValue)) {
        processedValue = Math.floor(numValue).toString();
      }
    }

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "secondaryPhone" && !isCultureSalon && !processedValue
          ? ""
          : type === "checkbox"
          ? checked
          : processedValue,
    }));

    // Real-time validation
    let validationResult = { isValid: true, error: null };

    // TC validations
    if (
      ["customerTc", "groomTc", "brideTc", "childTc", "hennaTc"].includes(name)
    ) {
      // Kültür salonlarında TC/Vergi No validasyonu
      if (name === "customerTc" && isCultureSalon) {
        validationResult = validateTCOrTaxNumber(value);
      } else {
        validationResult = validateTC(value);
      }
    }
    // Customer name validation (firma adı için kültür salonlarında farklı)
    else if (name === "customerName") {
      if (value) {
        if (isCultureSalon) {
          // Kültür salonlarında firma adı için rakam ve özel karakterlere izin ver
          if (value.trim().length < 2) {
            validationResult = {
              isValid: false,
              error: "Müşteri / Firma adı en az 2 karakter olmalıdır",
            };
          } else {
            validationResult = { isValid: true, error: null };
          }
        } else {
          // Normal validasyon için validateName kullanılabilir ama şimdilik sadece uzunluk kontrolü
          if (value.trim().length < 2) {
            validationResult = {
              isValid: false,
              error: "Müşteri adı en az 2 karakter olmalıdır",
            };
          } else {
            validationResult = { isValid: true, error: null };
          }
        }
      }
    }
    // Address validation
    else if (name === "address") {
      if (value) {
        validationResult = validateAddress(value);
      }
    }
    // Account name validation
    else if (name === "accountName") {
      if (value) {
        validationResult = validateAccountName(value);
      }
    }
    // Bank name validation
    else if (name === "bank") {
      if (value) {
        validationResult = validateBankName(value);
      }
    }
    // IBAN validation
    else if (name === "iban") {
      if (value) {
        validationResult = validateIBAN(value);
      }
    }
    // Discount percentage validation (kültür salonları için maksimum 100)
    else if (name === "discountPercentage" && isCultureSalon) {
      if (processedValue) {
        const numValue = Number(processedValue);
        if (isNaN(numValue) || numValue < 0) {
          validationResult = {
            isValid: false,
            error: "İndirim yüzdesi 0'dan küçük olamaz",
          };
        } else if (numValue > 100) {
          validationResult = {
            isValid: false,
            error: "İndirim yüzdesi en fazla 100 olabilir",
          };
        } else {
          validationResult = { isValid: true, error: null };
        }
      }
    }

    // Update validation errors
    setValidationErrors((prev) => {
      if (validationResult.isValid) {
        const { [name]: _, ...rest } = prev;
        return rest;
      } else {
        return {
          ...prev,
          [name]: validationResult.error,
        };
      }
    });

    // Düğün salonunda tarih/saat/eventType değiştiğinde dinamik fiyat güncelle
    if (
      (name === "eventType" || name === "startTime" || name === "startDate") &&
      editingReservation
    ) {
      const salonForReservation =
        salons.find((s) => s.id === editingReservation.salonID) ||
        editingReservation.salon;

      if (salonForReservation?.type === "dugun") {
        const newEventType =
          name === "eventType" ? processedValue : form.eventType;
        const newStartTime =
          name === "startTime" ? processedValue : form.startTime;
        const newStartDate =
          name === "startDate" ? processedValue : form.startDate;

        if (newStartDate && newStartTime && newEventType) {
          // Tarih string'ini Date objesine çevir (YYYY-MM-DD formatı)
          const dateForCalc = newStartDate.includes("T")
            ? newStartDate.split("T")[0]
            : newStartDate;

          const calculatedPrice = calculateSalonPrice(
            salonForReservation,
            dateForCalc,
            newStartTime,
            newEventType
          );

          // Fiyatı otomatik güncelle (kullanıcı manuel girmediyse veya salon için flag varsa)
          setForm((prev) => {
            if (
              prev._priceAutoUpdated === salonForReservation.id ||
              !prev.salonPrice ||
              prev.salonPrice === ""
            ) {
              return {
                ...prev,
                [name]: type === "checkbox" ? checked : processedValue,
                salonPrice: calculatedPrice.toString(),
                _priceAutoUpdated: salonForReservation.id,
              };
            }
            return {
              ...prev,
              [name]: type === "checkbox" ? checked : processedValue,
            };
          });
          return; // setForm zaten yapıldı, tekrar yapma
        }
      }
    }
  };

  // Menü validasyon fonksiyonu
  const validateMenuField = (field, value) => {
    switch (field) {
      case "name": {
        if (!value || !value.trim()) {
          return "Menü adı zorunludur";
        }
        if (value.trim().length < 2) {
          return "Menü adı en az 2 karakter olmalıdır";
        }
        return null;
      }
      case "price": {
        if (!value && value !== 0) {
          return "Fiyat zorunludur";
        }
        const priceNum = Number(value);
        if (isNaN(priceNum) || priceNum < 0) {
          return "Geçerli bir fiyat giriniz";
        }
        if (priceNum === 0) {
          return "Fiyat 0'dan büyük olmalıdır";
        }
        return null;
      }
      case "quantity": {
        if (!value && value !== 0) {
          return "Adet zorunludur";
        }
        const quantityNum = Number(value);
        if (isNaN(quantityNum) || quantityNum < 1) {
          return "Adet en az 1 olmalıdır";
        }
        return null;
      }
      case "unit": {
        if (!value || !value.trim()) {
          return "Birim zorunludur";
        }
        return null;
      }
      default:
        return null;
    }
  };

  // Yeni dinamik menü yönetimi fonksiyonları
  const addMenu = () => {
    const newMenu = {
      id: `menu-${Date.now()}`,
      name: "",
      price: 0,
      quantity: 1,
      unit: "adet",
      isNew: true,
      isModified: false,
    };
    setForm((prev) => ({
      ...prev,
      menus: [...prev.menus, newMenu],
    }));
  };

  const removeMenu = async (menuId) => {
    try {
      // Menüyü bul
      const menu = form.menus.find((m) => m.id === menuId);

      if (!menu) {
        toast.error("Menü bulunamadı!");
        return;
      }

      // Eğer menü backend'de kayıtlı ise (isNew: false), backend'den sil
      if (!menu.isNew && menu.backendId) {
        await deleteReservationMenu(menu.backendId);
        toast.success("Menü başarıyla silindi!");

        // Sadece frontend state'inden menüyü kaldır
        setForm((prev) => ({
          ...prev,
          menus: prev.menus.filter((m) => m.id !== menuId),
        }));

        // Arka planda rezervasyonları yeniden yükle (liste güncellenmesi için)
        loadReservations();
      } else {
        // Yeni eklenen menü için sadece frontend'den kaldır
        setForm((prev) => ({
          ...prev,
          menus: prev.menus.filter((m) => m.id !== menuId),
        }));
        toast.success("Menü kaldırıldı!");
      }

      // Bu menüye ait validasyon hatalarını da temizle
      setMenuValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[menuId];
        return newErrors;
      });
    } catch (error) {
      toast.error(formatErrorMessage(error, "Menü silinirken hata oluştu"));
    }
  };

  const updateMenu = (menuId, field, value) => {
    // Validasyon yap
    const error = validateMenuField(field, value);

    // Validasyon hatasını güncelle
    setMenuValidationErrors((prev) => {
      const newErrors = { ...prev };
      if (!newErrors[menuId]) {
        newErrors[menuId] = {};
      }
      if (error) {
        newErrors[menuId][field] = error;
      } else {
        delete newErrors[menuId][field];
        // Eğer bu menü için başka hata yoksa, menüyü tamamen sil
        if (Object.keys(newErrors[menuId]).length === 0) {
          delete newErrors[menuId];
        }
      }
      return newErrors;
    });

    // Form state'ini güncelle
    setForm((prev) => ({
      ...prev,
      menus: prev.menus.map((menu) =>
        menu.id === menuId
          ? { ...menu, [field]: value, isModified: !menu.isNew }
          : menu
      ),
    }));
  };

  // Menü ekleme fonksiyonu
  const handleAddMenuToReservation = async (menu) => {
    try {
      const price = Number(menu.price) || 0;
      const quantity = Number(menu.quantity) || 0;
      const payload = {
        reservationId: editingReservation.id,
        menuName: menu.name,
        quantity: quantity,
        unit: menu.unit,
        totalPrice: price,
      };

      await createReservationMenu(payload);

      // Menüyü başarılı olarak işaretle
      setForm((prev) => ({
        ...prev,
        menus: prev.menus.map((m) =>
          m.id === menu.id
            ? { ...m, isNew: false, isModified: false, backendId: menu.id }
            : m
        ),
      }));

      toast.success("Menü başarıyla eklendi!");
      loadReservations(); // Rezervasyonları yenile
    } catch (error) {
      toast.error(formatErrorMessage(error, "Menü eklenirken hata oluştu"));
    }
  };

  // Menü güncelleme fonksiyonu
  const handleUpdateMenuInReservation = async (menu) => {
    try {
      const price = Number(menu.price) || 0;
      const quantity = Number(menu.quantity) || 0;
      const payload = {
        menuName: menu.name,
        quantity: quantity,
        unit: menu.unit,
        totalPrice: price,
      };

      // Backend'den menü ID'sini al
      const menuId = menu.backendId;

      if (!menuId) {
        toast.error("Menü ID'si bulunamadı!");
        return;
      }

      await updateReservationMenu(menuId, payload);

      // Menüyü başarılı olarak işaretle
      setForm((prev) => ({
        ...prev,
        menus: prev.menus.map((m) =>
          m.id === menu.id ? { ...m, isModified: false, backendId: menuId } : m
        ),
      }));

      toast.success("Menü başarıyla güncellendi!");
      loadReservations(); // Rezervasyonları yenile
    } catch (error) {
      toast.error(formatErrorMessage(error, "Menü güncellenirken hata oluştu"));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    // Event type specific validations
    const errors = {};
    if (!isCultureSalon) {
      if (!isCultureSalon) {
        if (
          form.eventType === "wedding" ||
          form.eventType === "engagement" ||
          form.eventType === "nikah" ||
          form.eventType === "henna"
        ) {
          if (!form.groomFatherName || !form.groomFatherName.trim()) {
            errors.groomFatherName = "Damat baba adı zorunludur";
          }
          if (!form.groomMotherName || !form.groomMotherName.trim()) {
            errors.groomMotherName = "Damat anne adı zorunludur";
          }
          if (!form.brideFatherName || !form.brideFatherName.trim()) {
            errors.brideFatherName = "Gelin baba adı zorunludur";
          }
          if (!form.brideMotherName || !form.brideMotherName.trim()) {
            errors.brideMotherName = "Gelin anne adı zorunludur";
          }
        } else if (form.eventType === "other") {
          if (!form.otherEventTitle || !form.otherEventTitle.trim()) {
            errors.otherEventTitle = "Etkinlik başlığı zorunludur";
          }
        }
      }

      if (isCultureSalon) {
        if (form.eventType === "other") {
          if (!form.otherEventTitle || !form.otherEventTitle.trim()) {
            errors.otherEventTitle = "Etkinlik türü zorunludur";
          }
        }
        if (!form.orgName || !form.orgName.trim()) {
          errors.orgName = "Organizasyon ismi zorunludur";
        }
        if (!form.orgOwnerName || !form.orgOwnerName.trim()) {
          errors.orgOwnerName = "Organizasyon sahibi adı zorunludur";
        }
        if (!form.secondaryPhone || !form.secondaryPhone.trim()) {
          errors.secondaryPhone =
            "Organizasyon sahibi telefon numarası zorunludur";
        }

        // Yeni alanlar için validasyonlar (isteğe bağlı ama format kontrolü)
        if (form.address && form.address.trim()) {
          const addressValidation = validateAddress(form.address);
          if (!addressValidation.isValid) {
            errors.address = addressValidation.error;
          }
        }
        if (form.accountName && form.accountName.trim()) {
          const accountNameValidation = validateAccountName(form.accountName);
          if (!accountNameValidation.isValid) {
            errors.accountName = accountNameValidation.error;
          }
        }
        if (form.bank && form.bank.trim()) {
          const bankValidation = validateBankName(form.bank);
          if (!bankValidation.isValid) {
            errors.bank = bankValidation.error;
          }
        }
        if (form.iban && form.iban.trim()) {
          const ibanValidation = validateIBAN(form.iban);
          if (!ibanValidation.isValid) {
            errors.iban = ibanValidation.error;
          }
        }

        // TC/Vergi No validasyonu
        if (form.customerTc && form.customerTc.trim()) {
          const tcValidation = validateTCOrTaxNumber(form.customerTc);
          if (!tcValidation.isValid) {
            errors.customerTc = tcValidation.error;
          }
        }
      } else {
        // Normal salonlar için TC validasyonu
        if (form.customerTc && form.customerTc.trim()) {
          const tcValidation = validateTC(form.customerTc);
          if (!tcValidation.isValid) {
            errors.customerTc = tcValidation.error;
          }
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error("Lütfen formdaki hataları düzeltin");
      return;
    }

    // Clear validation errors before submit
    setValidationErrors({});

    // Menü validasyonlarını kontrol et
    if (!isCultureSalon && form.menus.length > 0) {
      const menuErrors = {};
      form.menus.forEach((menu) => {
        const menuFieldErrors = {};

        // Her alanı validate et
        const nameError = validateMenuField("name", menu.name);
        const priceError = validateMenuField("price", menu.price);
        const quantityError = validateMenuField("quantity", menu.quantity);
        const unitError = validateMenuField("unit", menu.unit);

        if (nameError) menuFieldErrors.name = nameError;
        if (priceError) menuFieldErrors.price = priceError;
        if (quantityError) menuFieldErrors.quantity = quantityError;
        if (unitError) menuFieldErrors.unit = unitError;

        if (Object.keys(menuFieldErrors).length > 0) {
          menuErrors[menu.id] = menuFieldErrors;
        }
      });

      if (Object.keys(menuErrors).length > 0) {
        setMenuValidationErrors(menuErrors);
        toast.error("Lütfen menü bilgilerini eksiksiz doldurun");
        return;
      }
    }

    try {
      setLoading(true);

      // Toplam fiyatı hesapla
      const salonPrice = Number(form.salonPrice) || 0;
      // Kültür salonlarında salonPrice 0 ise backend'e 1 gönder
      // Ancak kullanıcıya gösterilen ve hesaplamalarda kullanılan fiyat 0 kalmalı
      const finalSalonPrice =
        isCultureSalon && salonPrice === 0 ? 1 : salonPrice;

      const menuPrice = isCultureSalon
        ? 0
        : form.menus.reduce((total, menu) => {
            const price = Number(menu.price) || 0;

            return total + price;
          }, 0);
      const totalPrice = salonPrice + menuPrice;

      // Mevcut ödeme bilgilerini al
      const currentPaidAmount = Number(form.paidAmount) || 0;

      // Kültür salonlarında indirim yüzdesi, diğerlerinde TL cinsinden
      // Kültür salonlarında indirim sadece salon fiyatına uygulanır
      let currentDiscount = 0;
      let discountPercentageValue = null;
      if (isCultureSalon && form.discountPercentage) {
        const discountPercent = Number(form.discountPercentage) || 0;
        currentDiscount = (salonPrice * discountPercent) / 100;
        discountPercentageValue = discountPercent;
      } else {
        currentDiscount = Number(form.discount) || 0;
      }

      // Kalan fiyat kontrolü: (Toplam Fiyat) - (Ödenen + İndirim) >= 0
      const remainingAmount = totalPrice - currentPaidAmount - currentDiscount;

      if (remainingAmount < 0) {
        toast.error(
          `Ödenen tutar (${formatCurrency(
            currentPaidAmount,
            false
          )}) ve indirim (${formatCurrency(
            currentDiscount,
            false
          )}) toplamı, yeni toplam fiyattan (${formatCurrency(
            totalPrice,
            false
          )}) fazla olamaz! Kalan: ${formatCurrency(remainingAmount, false)}`,
          { duration: 5000 }
        );
        setLoading(false);
        return;
      }

      const payload = {
        customerName: form.customerName,
        customerTc: form.customerTc,
        customerPhone: form.customerPhone,
        eventType: form.eventType,
        guestCount: Number(form.guestCount) || 0,
        salonPrice: finalSalonPrice,
        paidAmount: currentPaidAmount,
        discount: currentDiscount,
        status: form.status,
        salonID: Number(form.salonID) || editingReservation.salonID,
        // Kültür salonlarında indirim yüzdesi
        ...(isCultureSalon && discountPercentageValue !== null
          ? { discountPercentage: discountPercentageValue }
          : {}),
        // Additional services
        hasPhotography: form.hasPhotography,
        photographyPrice: Number(form.photographyPrice) || 0,
        hasMusic: form.hasMusic,
        musicPrice: Number(form.musicPrice) || 0,
        hasDecoration: form.hasDecoration,
        decorationPrice: Number(form.decorationPrice) || 0,
        // Menü bilgileri
        menuPrice: isCultureSalon ? 0 : menuPrice,
        // Toplam fiyat
        totalPrice: totalPrice,
        // Kalan miktar
        remainingAmount: remainingAmount,
        // Date fields - doğrudan ISO string olarak gönder
        startDate: form.startDate ? new Date(form.startDate).toISOString() : "",
        endDate: form.endDate ? new Date(form.endDate).toISOString() : "",
      };

      // Sadece ikinci telefon doluysa ekle
      if (form.secondaryPhone && form.secondaryPhone.trim()) {
        payload.secondaryPhone = form.secondaryPhone;
      }

      // Sadece geçerli email varsa ekle
      if (
        form.customerEmail &&
        form.customerEmail.trim() &&
        form.customerEmail.includes("@")
      ) {
        payload.customerEmail = form.customerEmail;
      }

      // Not alanını her zaman ekle (boş olsa bile silmek için)
      payload.notes = form.notes ? form.notes.trim() : "";

      // Mesaj aktifliği
      payload.isMessageActive = form.isMessageActive;
      payload.isContractSigned = Boolean(form.isContractSigned);

      if (isCultureSalon) {
        payload.orgName = form.orgName ? form.orgName.trim() : null;
        payload.orgOwnerName = form.orgOwnerName
          ? form.orgOwnerName.trim()
          : null;
        payload.vergiDairesi = form.vergiDairesi
          ? form.vergiDairesi.trim()
          : null;
        payload.address = form.address ? form.address.trim() : null;
        payload.accountName = form.accountName ? form.accountName.trim() : null;
        payload.bank = form.bank ? form.bank.trim() : null;
        payload.iban = form.iban ? form.iban.trim() : null;
      }

      if (
        form.eventType === "wedding" ||
        form.eventType === "engagement" ||
        form.eventType === "nikah" ||
        form.eventType === "henna"
      ) {
        payload.groomName = form.groomName;
        payload.brideName = form.brideName;

        // Wedding, engagement, nikah ve henna için anne-baba adları zorunlu
        payload.groomFatherName = form.groomFatherName;
        payload.groomMotherName = form.groomMotherName;
        payload.brideFatherName = form.brideFatherName;
        payload.brideMotherName = form.brideMotherName;

        // Sadece dolu TC alanlarını gönder
        if (form.groomTc && form.groomTc.trim()) {
          payload.groomTc = form.groomTc.trim();
        }
        if (form.brideTc && form.brideTc.trim()) {
          payload.brideTc = form.brideTc.trim();
        }

        // Sadece geçerli tarih varsa ekle
        if (form.groomBirthDate && form.groomBirthDate.trim()) {
          payload.groomBirthDate = form.groomBirthDate;
        }
        if (form.brideBirthDate && form.brideBirthDate.trim()) {
          payload.brideBirthDate = form.brideBirthDate;
        }
      } else if (form.eventType === "circumcision") {
        payload.childName = form.childName;

        // Sadece dolu TC alanını gönder
        if (form.childTc && form.childTc.trim()) {
          payload.childTc = form.childTc.trim();
        }

        // Sadece geçerli tarih varsa ekle
        if (form.childBirthDate && form.childBirthDate.trim()) {
          payload.childBirthDate = form.childBirthDate;
        }
      } else if (form.eventType === "meeting") {
        if (form.meetingTitle && form.meetingTitle.trim()) {
          payload.meetingTitle = form.meetingTitle;
        }
        if (form.meetingDescription && form.meetingDescription.trim()) {
          payload.meetingDescription = form.meetingDescription;
        }
      } else if (isCultureSalon && form.eventType === "other") {
        // Kültür salonları için diğer etkinlik türü
        // eventType zaten "other" olarak gönderilecek (form.eventType'dan)
        payload.otherEvent = form.otherEventTitle;
        // Backend validation için otherEventTitle da gönderiliyor
        payload.otherEventTitle = form.otherEventTitle;
        // Kültür salonlarında otherEventDescription kullanılmıyor
      } else if (form.eventType === "other") {
        // Normal salonlar için diğer etkinlik türü
        payload.otherEventTitle = form.otherEventTitle;

        // Opsiyonel alanlar
        if (form.otherEventDescription && form.otherEventDescription.trim()) {
          payload.otherEventDescription = form.otherEventDescription;
        }
      }

      await updateReservation(editingReservation.id, payload);

      // Menüleri ayrı ayrı ekle/güncelle
      for (const menu of form.menus) {
        if (menu.isNew) {
          // Yeni menü ekle
          const price = Number(menu.price) || 0;
          const quantity = Number(menu.quantity) || 0;
          const menuPayload = {
            reservationId: editingReservation.id,
            menuName: menu.name,
            quantity: quantity,
            unit: menu.unit,
            totalPrice: price,
          };
          await createReservationMenu(menuPayload);
        } else if (menu.isModified && menu.backendId) {
          // Mevcut menüyü güncelle
          const price = Number(menu.price) || 0;
          const quantity = Number(menu.quantity) || 0;
          const _MENU_PAYLOAD = {
            menuName: menu.name,
            quantity: quantity,
            unit: menu.unit,
            totalPrice: price,
          };
          // await updateReservationMenu(menu.backendId, menuPayload);
        }
      }

      await loadReservations();
      setEditingReservation(null);
      setMenuValidationErrors({});
      toast.success("Rezervasyon başarıyla güncellendi!");
      onUpdated?.();
    } catch (error) {
      // Validation hatalarını göster
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors
          .map((err) => translateBackendError(err))
          .join("\n");
        toast.error(`Doğrulama Hatası: ${errorMessages}`);
      } else {
        toast.error(formatErrorMessage(error, "Rezervasyon güncellenemedi"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSavedCustomer = useCallback((customer) => {
    setForm((prev) => ({
      ...prev,
      customerName: customer.customerName || "",
      customerPhone: customer.customerPhone || "",
      secondaryPhone: customer.secondaryPhone || "",
      customerEmail: customer.customerEmail || "",
      customerTc: customer.customerTc || "",
      orgOwnerName: customer.orgOwnerName || "",
      orgName: customer.orgName || "",
      address: customer.address || "",
      accountName: customer.accountName || "",
      bank: customer.bank || "",
      iban: customer.iban || "",
      vergiDairesi: customer.vergiDairesi || "",
    }));
    toast.success("Müşteri bilgileri form'a yüklendi");
  }, []);

  const handleSaveCustomer = useCallback(async () => {
    // Validate required fields
    if (!form.customerName || !form.customerName.trim()) {
      toast.error("Müşteri adı zorunludur");
      return;
    }
    if (!form.customerPhone || !form.customerPhone.trim()) {
      toast.error("Telefon numarası zorunludur");
      return;
    }
    if (!form.customerTc || !form.customerTc.trim()) {
      toast.error("TC No / Vergi No zorunludur");
      return;
    }

    try {
      setSavingCustomer(true);
      const payload = {
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.trim(),
        customerTc: form.customerTc.trim(),
        secondaryPhone: form.secondaryPhone?.trim() || "",
        orgOwnerName: form.orgOwnerName?.trim() || "",
        orgName: form.orgName?.trim() || "",
        address: form.address?.trim() || "",
        accountName: form.accountName?.trim() || "",
        bank: form.bank?.trim() || "",
        iban: form.iban?.trim() || "",
        vergiDairesi: form.vergiDairesi?.trim() || "",
      };

      if (
        form.customerEmail &&
        form.customerEmail.trim() &&
        form.customerEmail.includes("@")
      ) {
        payload.customerEmail = form.customerEmail.trim();
      }

      await createSavedCustomer(payload);
      toast.success("Müşteri bilgileri kaydedildi");
    } catch (error) {
      console.error("Müşteri kaydedilirken hata:", error);
      toast.error(
        formatErrorMessage(error, "Müşteri kaydedilirken bir hata oluştu")
      );
    } finally {
      setSavingCustomer(false);
    }
  }, [form]);

  const _handleDelete = async (id) => {
    // Rezervasyonu bul ve kilitleme kontrolü yap
    const reservation = reservations.find((r) => r.id === id);

    // Geçmiş tarihli rezervasyon kontrolü
    if (reservation && isDateInPast(reservation.startDate)) {
      toast.error("Geçmiş tarihli rezervasyonlar iptal edilemez!");
      return;
    }

    // 1 ay öncesinden eski rezervasyon kontrolü
    if (reservation && isReservationLocked(reservation.startDate)) {
      toast.warning(getReservationLockMessage(reservation.startDate));
      return;
    }

    if (!confirm("Bu rezervasyonu silmek istediğinizden emin misiniz?")) return;

    try {
      setLoading(true);
      await deleteReservation(id);
      await loadReservations();
      onUpdated?.();
      toast.success("Rezervasyon başarıyla iptal edildi!");
    } catch {
      toast.error("Rezervasyon silinemedi");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = (reservation) => {
    setPaymentReservation(reservation);
    setPaymentForm({
      amount: "",
      notes: "",
      paymentType: "cash",
      paymentDate: getTurkeyTime().toISOString().slice(0, 16), // Turkey timezone'da bugünün tarihi ve saati
    });
    // Rezervasyon verilerindeki ödeme geçmişini kullan
    setPaymentHistory(reservation.reservationPayments || []);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentForm.amount || !paymentReservation) return;

    try {
      setLoading(true);
      //Payment +3 saat ekle
      const paymentDateAdjusted = paymentForm.paymentDate
        ? (() => {
            const d = new Date(`${paymentForm.paymentDate}:00`);
            d.setHours(d.getHours() + 3);
            return d;
          })()
        : null;

      await addPayment(
        paymentReservation.id,
        Number(paymentForm.amount),
        paymentForm.notes,
        paymentForm.paymentType,
        paymentDateAdjusted
      );
      await loadReservations();
      // Rezervasyon verilerini yeniden yükle ve ödeme geçmişini güncelle
      const updatedReservations = await getReservations({ salonID: salonId });
      const updatedReservation = updatedReservations.data?.reservations?.find(
        (r) => r.id === paymentReservation.id
      );
      if (updatedReservation) {
        setPaymentHistory(updatedReservation.reservationPayments || []);
        setPaymentReservation(updatedReservation);
      }
      setPaymentForm({
        amount: "",
        notes: "",
        paymentType: "cash",
        paymentDate: getTurkeyTime().toISOString().slice(0, 16), // Turkey timezone'da bugünün tarihi ve saati
      });
      onUpdated?.();
      toast.success("Ödeme başarıyla eklendi!");
    } catch {
      toast.error("Ödeme eklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm("Bu ödemeyi silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      setLoading(true);
      await deletePayment(paymentId);
      await loadReservations();
      // Rezervasyon verilerini yeniden yükle ve ödeme geçmişini güncelle
      const updatedReservations = await getReservations({ salonID: salonId });
      const updatedReservation = updatedReservations.data?.reservations?.find(
        (r) => r.id === paymentReservation.id
      );
      if (updatedReservation) {
        setPaymentHistory(updatedReservation.reservationPayments || []);
        setPaymentReservation(updatedReservation);
      }
      toast.success("Ödeme başarıyla silindi!");
    } catch (error) {
      toast.error(formatErrorMessage(error, "Ödeme silinirken hata oluştu"));
    } finally {
      setLoading(false);
    }
  };

  const handleMoveDate = (reservation) => {
    // 1 ay geçen rezervasyonları tarih değiştirmeyi engelle
    if (isReservationLocked(reservation.startDate)) {
      toast.warning(getReservationLockMessage(reservation.startDate));
      return;
    }

    // HomePage'deki tarih değiştirme modunu başlat
    if (onStartDateChange) {
      onStartDateChange(reservation);
      onClose(); // Modal'ı kapat

      // Eğer onNavigateToCalendar callback'i varsa, ana takvime yönlendir
      if (onNavigateToCalendar) {
        onNavigateToCalendar(reservation);
      }
    } else {
      // Fallback: eski DatePickerModal'ı kullan
      setMoveDateReservation(reservation);
      setDatePickerOpen(true);
    }
  };

  const handleDateSelect = (localDate) => {
    if (!moveDateReservation) return;

    // Seçilen tarih ve saati form'a doldur
    const startDate = new Date(localDate);
    // Orijinal sürenin korunması için duration hesapla
    const originalStart = new Date(moveDateReservation.startDate);
    const originalEnd = new Date(moveDateReservation.endDate);
    const durationMs = Math.max(
      0,
      originalEnd.getTime() - originalStart.getTime()
    );
    const endDate = new Date(startDate.getTime() + durationMs);

    setMoveDateForm({
      startDate: `${startDate.getFullYear()}-${String(
        startDate.getMonth() + 1
      ).padStart(2, "0")}-${String(startDate.getDate()).padStart(
        2,
        "0"
      )}T${String(startDate.getHours()).padStart(2, "0")}:${String(
        startDate.getMinutes()
      ).padStart(2, "0")}`,
      endDate: `${endDate.getFullYear()}-${String(
        endDate.getMonth() + 1
      ).padStart(2, "0")}-${String(endDate.getDate()).padStart(
        2,
        "0"
      )}T${String(endDate.getHours()).padStart(2, "0")}:${String(
        endDate.getMinutes()
      ).padStart(2, "0")}`,
    });

    // DatePicker'ı kapat ve move date modal'ını aç
    setDatePickerOpen(false);
  };

  const handleMoveDateSubmit = async (e) => {
    e.preventDefault();
    const reservation = moveDateReservation || reservationToMove;

    if (!moveDateForm.startDate || !moveDateForm.endDate || !reservation)
      return;

    // Tarih değişikliği kontrolü - mevcut günden geriye taşıma engeli
    if (isDateInPast(moveDateForm.startDate)) {
      alert(getDateInPastMessage(moveDateForm.startDate));
      return;
    }

    try {
      setLoading(true);
      // Backend UTC+3 beklediği için +3 saat ekle
      const startDateLocal = new Date(moveDateForm.startDate);
      const endDateLocal = new Date(moveDateForm.endDate);

      // Eğer bitiş, başlangıçtan küçük veya eşitse sonraki güne taşı
      if (endDateLocal <= startDateLocal) {
        endDateLocal.setDate(endDateLocal.getDate() + 1);
      }

      //UTC+3
      startDateLocal.setHours(startDateLocal.getHours() + 3);
      endDateLocal.setHours(endDateLocal.getHours() + 3);
      const startDateUTC = startDateLocal.toISOString();
      const endDateUTC = endDateLocal.toISOString();

      await moveReservationDate(reservation.id, startDateUTC, endDateUTC);
      await loadReservations();
      setMoveDateReservation(null);
      setMoveDateForm({ startDate: "", endDate: "" });
      onUpdated?.();
      toast.success("Rezervasyon tarihi başarıyla güncellendi!");

      // Tarih değiştirme modunu kapat
      if (dateChangeMode) {
        onDateChangeComplete?.();
        onClose();
      }
    } catch (error) {
      // Çakışma hatası kontrolü
      if (error.response?.status === 409 && error.response?.data?.conflict) {
        const conflict = error.response.data.conflict;
        const conflictStart = conflict.startDate.includes("T")
          ? conflict.startDate.split("T")[1].slice(0, 5)
          : "";
        const conflictEnd = conflict.endDate.includes("T")
          ? conflict.endDate.split("T")[1].slice(0, 5)
          : "";

        // Çakışan rezervasyonun müşteri adını bul
        const conflictingReservation = reservations.find(
          (r) => r.id === conflict.id
        );
        const customerName =
          conflictingReservation?.customerName || "Bilinmeyen Müşteri";

        toast.error(
          `Bu saatte çakışma var!\n${customerName} (${conflictStart} - ${conflictEnd})`,
          { duration: 5000 }
        );
      } else {
        toast.error("Rezervasyon tarihi güncellenemedi");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMoveSalon = (reservation) => {
    // 1 ay geçen rezervasyonları salon değiştirmeyi engelle
    if (isReservationLocked(reservation.startDate)) {
      toast.warning(getReservationLockMessage(reservation.startDate));
      return;
    }

    // Eğer onStartSalonChange prop'u varsa, HomePage üzerinden yönet
    if (onStartSalonChange) {
      onStartSalonChange(reservation);
      onClose(); // Modal'ı kapat
      return;
    }

    // Fallback: eski modal'ı kullan
    setMoveSalonReservation(reservation);
    setMoveSalonForm({
      startDate: reservation.startDate
        ? new Date(reservation.startDate).toISOString().slice(0, 16)
        : "",
      endDate: reservation.endDate
        ? new Date(reservation.endDate).toISOString().slice(0, 16)
        : "",
      salonID: reservation.salonID || "",
    });
  };

  const handleMoveSalonSubmit = async (e) => {
    e.preventDefault();

    if (
      !moveSalonForm.startDate ||
      !moveSalonForm.endDate ||
      !moveSalonForm.salonID ||
      !moveSalonReservation
    ) {
      toast.error("Lütfen tüm alanları doldurun");
      return;
    }

    // Tarih değişikliği kontrolü - mevcut günden geriye taşıma engeli
    if (isDateInPast(moveSalonForm.startDate)) {
      toast.error(getDateInPastMessage(moveSalonForm.startDate));
      return;
    }

    // Salon değişikliği var mı kontrol et
    if (Number(moveSalonForm.salonID) === moveSalonReservation.salonID) {
      toast.warning("Lütfen farklı bir salon seçin");
      return;
    }

    try {
      setLoading(true);
      const startDateLocal = new Date(moveSalonForm.startDate);
      const endDateLocal = new Date(moveSalonForm.endDate);

      // Eğer bitiş, başlangıçtan küçük veya eşitse sonraki güne taşı
      if (endDateLocal <= startDateLocal) {
        const newEndDate = new Date(startDateLocal);
        newEndDate.setDate(newEndDate.getDate() + 1);
        setMoveSalonForm((prev) => ({
          ...prev,
          endDate: newEndDate.toISOString().slice(0, 16),
        }));
        toast.error("Bitiş tarihi, başlangıç tarihinden sonra olmalıdır");
        return;
      }

      await moveReservationSalon(
        moveSalonReservation.id,
        moveSalonForm.startDate,
        moveSalonForm.endDate,
        Number(moveSalonForm.salonID)
      );

      toast.success("Rezervasyon başarıyla taşındı!");
      setMoveSalonReservation(null);
      setMoveSalonForm({ startDate: "", endDate: "", salonID: "" });

      if (onUpdated) onUpdated();
      if (onClose) onClose();
    } catch (error) {
      toast.error(formatErrorMessage(error, "Rezervasyon taşınamadı"));
    } finally {
      setLoading(false);
    }
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
    // Önce normal salonlar için etkinlik türlerini kontrol et
    const normalType = EVENT_TYPES.find((type) => type.value === eventType);
    if (normalType) return normalType.label;

    // Sonra kültür salonları için etkinlik türlerini kontrol et
    const cultureType = CULTURE_EVENT_TYPES.find(
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
    return (
      STATUS_OPTIONS.find((option) => option.value === status)?.label || status
    );
  };

  const getSalonName = (salonID) => {
    if (!salonID) return "Belirtilmemiş";
    const salon = salons.find((s) => s.id === salonID);
    return salon ? salon.name : `Salon ${salonID}`;
  };

  const filteredReservations = reservations.filter((reservation) => {
    if (statusFilter === "all") return true;
    return reservation.status === statusFilter;
  });

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}.${month}.${year}`;
  };

  if (!open) return null;

  // Tarih değiştirme modunda sadece move date modal'ını göster
  if (dateChangeMode && reservationToMove) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/70"
        onClick={handleOverlayClick}
      >
        <div className="w-full max-w-[95vw] card p-4 sm:p-6 mx-2 sm:mx-4 md:mx-0 sm:w-[400px] md:w-[500px]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-base sm:text-lg font-semibold flex-1 dark:text-slate-100">
              Tarih Değiştir
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-slate-600 flex-shrink-0"
              aria-label="Modalı kapat"
            >
              <LuX className="w-5 h-5 text-gray-600 dark:text-slate-300" />
            </button>
          </div>

          <div className="mb-4 text-sm text-gray-600 dark:text-slate-400">
            <p>
              <strong className="dark:text-slate-100">
                {reservationToMove.customerName}
              </strong>{" "}
              rezervasyonu için tarih ve saat seçin.
            </p>
            <div className="mt-2 text-xs space-y-1">
              <div>
                <strong>Mevcut Tarih:</strong>{" "}
                {new Date(reservationToMove.startDate).toLocaleDateString(
                  "tr-TR"
                )}
              </div>
              <div>
                <strong>Mevcut Saat:</strong>{" "}
                {reservationToMove.startDate.includes("T")
                  ? reservationToMove.startDate.split("T")[1].slice(0, 5)
                  : "00:00"}{" "}
                -{" "}
                {reservationToMove.endDate.includes("T")
                  ? reservationToMove.endDate.split("T")[1].slice(0, 5)
                  : "00:00"}
              </div>
              {(() => {
                const salon =
                  salons.find((s) => s.id === reservationToMove.salonID) ||
                  reservationToMove.salon;
                if (salon) {
                  const oldDateStr = reservationToMove.startDate;
                  const [oldDatePart, oldTimePart] = oldDateStr.split("T");
                  const oldTime = oldTimePart
                    ? oldTimePart.slice(0, 5)
                    : "12:00";
                  const oldPrice = calculateSalonPrice(
                    salon,
                    oldDatePart,
                    oldTime,
                    reservationToMove.eventType
                  );
                  const newDateStr = moveDateForm.startDate || oldDateStr;
                  const [newDatePart, newTimePart] = newDateStr.includes("T")
                    ? newDateStr.split("T")
                    : [newDateStr, oldTimePart];
                  const newTime = newTimePart
                    ? newTimePart.slice(0, 5)
                    : oldTime;
                  const newPrice = calculateSalonPrice(
                    salon,
                    newDatePart,
                    newTime,
                    reservationToMove.eventType
                  );
                  return (
                    <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
                      <div>
                        <strong>Eski Salon Fiyatı:</strong>{" "}
                        <span className="font-semibold">
                          {formatCurrency(oldPrice, false)}
                        </span>
                      </div>
                      <div>
                        <strong>Yeni Salon Fiyatı:</strong>{" "}
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(newPrice, false)}
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>

          <form onSubmit={handleMoveDateSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Başlangıç Saati *
              </label>
              <input
                type="time"
                value={
                  moveDateForm.startDate
                    ? moveDateForm.startDate.slice(11, 16)
                    : ""
                }
                onChange={(e) => {
                  // Kullanıcının seçtiği saati doğrudan kullan
                  const selectedTime = e.target.value;
                  const startDate = new Date(`${date}T${selectedTime}:00`);

                  setMoveDateForm({
                    startDate: `${startDate.getFullYear()}-${String(
                      startDate.getMonth() + 1
                    ).padStart(2, "0")}-${String(startDate.getDate()).padStart(
                      2,
                      "0"
                    )}T${String(startDate.getHours()).padStart(
                      2,
                      "0"
                    )}:${String(startDate.getMinutes()).padStart(2, "0")}`,
                    endDate:
                      moveDateForm.endDate ||
                      `${startDate.getFullYear()}-${String(
                        startDate.getMonth() + 1
                      ).padStart(2, "0")}-${String(
                        startDate.getDate()
                      ).padStart(2, "0")}T${String(
                        startDate.getHours()
                      ).padStart(2, "0")}:${String(
                        startDate.getMinutes()
                      ).padStart(2, "0")}`,
                  });
                }}
                required
                className="w-full rounded-lg border dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Bitiş Saati *
              </label>
              <input
                type="time"
                value={
                  moveDateForm.endDate ? moveDateForm.endDate.slice(11, 16) : ""
                }
                onChange={(e) => {
                  // Kullanıcının seçtiği saati doğrudan kullan
                  const selectedTime = e.target.value;
                  let endDate = new Date(`${date}T${selectedTime}:00`);

                  // Eğer bitiş saati 00:00 ise veya başlangıç saatinden küçükse, ertesi güne geç
                  const endHour = parseInt(selectedTime.split(":")[0]);

                  // 00:00 saati her zaman ertesi güne geçmeli
                  if (endHour === 0) {
                    endDate.setDate(endDate.getDate() + 1);
                  } else if (moveDateForm.startDate) {
                    const startTime = new Date(moveDateForm.startDate);
                    const startHour = startTime.getHours();

                    // Bitiş saati başlangıç saatinden küçükse ertesi güne geç
                    if (endHour < startHour) {
                      endDate.setDate(endDate.getDate() + 1);
                    }
                  }

                  setMoveDateForm((prev) => ({
                    ...prev,
                    endDate: `${endDate.getFullYear()}-${String(
                      endDate.getMonth() + 1
                    ).padStart(2, "0")}-${String(endDate.getDate()).padStart(
                      2,
                      "0"
                    )}T${String(endDate.getHours()).padStart(2, "0")}:${String(
                      endDate.getMinutes()
                    ).padStart(2, "0")}`,
                  }));
                }}
                required
                className="w-full rounded-lg border dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Seçilen gündeki diğer rezervasyonlar */}
            {(() => {
              const dayReservations = reservations.filter((reservation) => {
                const reservationDate = new Date(reservation.startDate);
                const reservationDateStr = reservationDate.toLocaleDateString(
                  "en-CA",
                  {
                    timeZone: "Europe/Istanbul",
                  }
                );
                return (
                  reservationDateStr === date &&
                  reservation.id !== reservationToMove.id &&
                  reservation.salonID === reservationToMove.salonID
                );
              });

              if (dayReservations.length > 0) {
                return (
                  <div>
                    <h4 className="font-medium mb-3 dark:text-slate-100">
                      Bu Tarihteki Rezervasyonlar ({dayReservations.length})
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {dayReservations.map((reservation) => {
                        const EVENT_TYPE_LABELS = {
                          wedding: "Düğün",
                          engagement: "Nişan",
                          nikah: "Nikah",
                          meeting: "Toplantı",
                          henna: "Kına",
                          circumcision: "Sünnet",
                          other: "Diğer",
                          panel: "Panel",
                          konser: "Konser",
                          koro: "Koro",
                          tiyatro: "Tiyatro",
                          cocukoyunu: "Çocuk Oyunu",
                          standup: "Stand-up",
                          seminer: "Seminer",
                          muzikal: "Müzikal",
                          dinleti: "Dinleti",
                          yilsonu: "Yıl Sonu Gösterisi",
                        };

                        return (
                          <div
                            key={reservation.id}
                            className="bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-lg p-3 text-sm"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium dark:text-slate-100">
                                  {reservation.customerName}
                                </div>
                                <div className="text-gray-600 dark:text-slate-300">
                                  {EVENT_TYPE_LABELS[reservation.eventType] ||
                                    reservation.eventType}
                                </div>
                                <div className="text-gray-500 dark:text-slate-500">
                                  {reservation.startDate.includes("T")
                                    ? reservation.startDate
                                        .split("T")[1]
                                        .slice(0, 5)
                                    : "00:00"}{" "}
                                  -{" "}
                                  {reservation.endDate.includes("T")
                                    ? reservation.endDate
                                        .split("T")[1]
                                        .slice(0, 5)
                                    : "00:00"}
                                </div>
                              </div>
                              <span
                                className={`
                                px-2 py-1 rounded text-xs font-medium
                                ${
                                  reservation.status === "preliminary"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                    : ""
                                }
                                ${
                                  reservation.status === "completed"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                    : ""
                                }
                                ${
                                  reservation.status === "cancelled"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                    : ""
                                }
                              `}
                              >
                                {reservation.status === "preliminary"
                                  ? "Ön Rezervasyon"
                                  : ""}
                                {reservation.status === "completed"
                                  ? "Tamamlandı"
                                  : ""}
                                {reservation.status === "cancelled"
                                  ? "İptal"
                                  : ""}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary font-medium disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Güncelleniyor..." : "Tarihi Güncelle"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60"
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-[95vw] max-h-[90vh] overflow-y-auto card p-3 sm:p-4 md:p-6 mx-2 sm:mx-4 md:mx-0 sm:w-[600px] md:w-[800px] lg:w-[900px]">
        {/* Normal modda ana içerik */}
        <>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-semibold">
                <span className="hidden sm:inline">
                  {formatDateForDisplay(date)} Tarihindeki Rezervasyonlar
                </span>
                <span className="sm:hidden">{date} Rezervasyonlar</span>
              </h3>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {permissions.allowAddReservation && (
                <button
                  onClick={() => {
                    onClose();
                    onCreateNew?.(date);
                  }}
                  className="btn-primary text-sm"
                >
                  <span className="hidden sm:inline">
                    Yeni Rezervasyon Ekle
                  </span>
                  <span className="sm:hidden">Yeni Ekle</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                aria-label="Modalı kapat"
              >
                <LuX className="w-5 h-5 text-gray-600 dark:text-slate-300" />
              </button>
            </div>
          </div>

          {/* Durum Filtreleme */}
          <div className="mb-4 flex items-center gap-4">
            <label className="text-sm font-medium">Durum Filtresi:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border px-3 py-2"
            >
              <option value="all">Tüm Durumlar</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-600 dark:text-slate-300">
              ({filteredReservations.length} rezervasyon)
            </span>
          </div>

          {loading && reservations.length === 0 ? (
            <div className="p-4 text-center">Rezervasyonlar yükleniyor...</div>
          ) : filteredReservations.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-slate-300">
              {statusFilter === "all"
                ? "Bu tarihte rezervasyon bulunmuyor."
                : "Seçilen durumda rezervasyon bulunmuyor."}
            </div>
          ) : (
            <div className="space-y-4">
              {salonId
                ? filteredReservations
                    .filter((a) => a.salon.id == salonId)
                    .map((reservation) => {
                      // Rezervasyon durumuna göre card rengi
                      const getCardStyle = (status) => {
                        switch (status) {
                          case "preliminary":
                            return "rounded-lg border border-yellow-200 dark:border-yellow-200 bg-yellow-50 dark:bg-yellow-600/20 p-3 sm:p-4 shadow-sm";
                          case "completed":
                            return "rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-3 sm:p-4 shadow-sm";
                          case "cancelled":
                            return "rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3 sm:p-4 shadow-sm";
                          default:
                            return "rounded-lg border dark:border-slate-700 p-3 sm:p-4 shadow-sm";
                        }
                      };

                      return (
                        <div
                          key={reservation.id}
                          className={getCardStyle(reservation.status)}
                        >
                          <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-base sm:text-lg dark:text-slate-100">
                                {reservation.customerName}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-slate-300">
                                <span className="hidden sm:inline">
                                  Telefon:{" "}
                                </span>
                                {reservation.customerPhone}
                              </p>
                              {/* Düğün salonları için ikinci telefon */}
                              {reservation.secondaryPhone &&
                                reservation.salon?.type !== "kultur" && (
                                  <p className="text-sm text-gray-500 dark:text-slate-300">
                                    <span className="hidden sm:inline">
                                      İkinci Telefon:{" "}
                                    </span>
                                    <span className="sm:hidden">2. Tel: </span>
                                    {reservation.secondaryPhone}
                                  </p>
                                )}
                              {/* Kültür salonları için organizasyon sahibi telefon */}
                              {reservation.secondaryPhone &&
                                reservation.salon?.type === "kultur" && (
                                  <p className="text-sm text-gray-500 dark:text-slate-300">
                                    <span className="hidden sm:inline">
                                      Organizasyon Sahibi Tel No:{" "}
                                    </span>
                                    <span className="sm:hidden">
                                      Org Sahibi Tel:{" "}
                                    </span>
                                    {reservation.secondaryPhone}
                                  </p>
                                )}

                              {reservation.salon?.type === "kultur" && (
                                <div className="mt-1 flex items-center gap-2">
                                  <span className="text-xs text-gray-500 dark:text-slate-400">
                                    Sözleşme:
                                  </span>
                                  <span
                                    className={`px-2 py-1 text-xs rounded-full font-medium ${
                                      reservation.isContractSigned
                                        ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200"
                                        : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"
                                    }`}
                                  >
                                    {reservation.isContractSigned
                                      ? "İmzalandı"
                                      : "İmzalanmadı"}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {permissions.allowSozlesme === true && (
                                <button
                                  onClick={() => getPdfFunc(reservation.id)}
                                  className="btn-error text-sm"
                                >
                                  Sözleşme İndir
                                </button>
                              )}
                              {permissions.allowEditReservation === true && (
                                <button
                                  onClick={() => handleEdit(reservation)}
                                  className={`text-sm ${
                                    isReservationLocked(reservation.startDate)
                                      ? "btn-disabled cursor-not-allowed opacity-50"
                                      : "btn-primary"
                                  }`}
                                  disabled={isReservationLocked(
                                    reservation.startDate
                                  )}
                                  title={
                                    isReservationLocked(reservation.startDate)
                                      ? getReservationLockMessage(
                                          reservation.startDate
                                        )
                                      : "Rezervasyonu düzenle"
                                  }
                                >
                                  Düzenle
                                </button>
                              )}
                              {permissions.allowGetPayment === true && (
                                <button
                                  onClick={() => handlePayment(reservation)}
                                  className="btn-success text-sm"
                                >
                                  Ödeme
                                </button>
                              )}
                              {permissions.allowChangeDate === true && (
                                <button
                                  onClick={() => handleMoveDate(reservation)}
                                  className={`text-sm ${
                                    isDateInPast(reservation.startDate)
                                      ? "btn-disabled cursor-not-allowed opacity-50"
                                      : "bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-3 py-1.5 font-medium transition-colors"
                                  }`}
                                  disabled={isDateInPast(reservation.startDate)}
                                  title={
                                    isDateInPast(reservation.startDate)
                                      ? "Geçmiş tarihli rezervasyonların tarihi değiştirilemez"
                                      : "Rezervasyon tarihini değiştir"
                                  }
                                >
                                  Tarih Değiştir
                                </button>
                              )}
                              {canChangeSalon && (
                                <button
                                  onClick={() => handleMoveSalon(reservation)}
                                  className={`text-sm ${
                                    isDateInPast(reservation.startDate)
                                      ? "btn-disabled cursor-not-allowed opacity-50"
                                      : "bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-1.5 font-medium transition-colors"
                                  }`}
                                  disabled={isDateInPast(reservation.startDate)}
                                  title={
                                    isDateInPast(reservation.startDate)
                                      ? "Geçmiş tarihli rezervasyonların salonu değiştirilemez"
                                      : "Rezervasyonu farklı bir salona taşı"
                                  }
                                >
                                  Salon Değiştir
                                </button>
                              )}
                              {permissions.allowCancelReservation === true && (
                                <button
                                  onClick={() => _handleDelete(reservation.id)}
                                  className={`text-sm ${
                                    isDateInPast(reservation.startDate)
                                      ? "btn-disabled cursor-not-allowed opacity-50"
                                      : "btn-error"
                                  }`}
                                  disabled={isDateInPast(reservation.startDate)}
                                  title={
                                    isDateInPast(reservation.startDate)
                                      ? "Geçmiş tarihli rezervasyonlar iptal edilemez"
                                      : "Rezervasyonu iptal et"
                                  }
                                >
                                  İptal
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="space-y-4">
                            {/* Temel Bilgiler */}
                            <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-3 border border-gray-200 dark:border-slate-700">
                              <h5 className="font-semibold text-sm mb-2 text-gray-700 dark:text-slate-300">
                                Temel Bilgiler
                              </h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="font-medium text-gray-600 dark:text-slate-400">
                                    Etkinlik Türü:
                                  </span>{" "}
                                  <span className="text-gray-900 dark:text-slate-100">
                                    {getEventTypeLabel(reservation.eventType)}
                                  </span>
                                </div>
                                {(reservation.eventType === "other" ||
                                  reservation.eventType === "otherEvent") &&
                                  (reservation.otherEvent ||
                                    reservation.otherEventTitle) && (
                                    <div>
                                      <span className="font-medium text-gray-600 dark:text-slate-400">
                                        Etkinlik Başlığı:
                                      </span>{" "}
                                      <span className="text-gray-900 dark:text-slate-100">
                                        {reservation.otherEvent ||
                                          reservation.otherEventTitle}
                                      </span>
                                    </div>
                                  )}
                                <div>
                                  <span className="font-medium text-gray-600 dark:text-slate-400">
                                    Salon:
                                  </span>{" "}
                                  <span className="text-gray-900 dark:text-slate-100">
                                    {getSalonName(reservation.salonID)}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600 dark:text-slate-400">
                                    Durum:
                                  </span>{" "}
                                  <span
                                    className={`rounded px-2 py-1 text-xs ${
                                      reservation.status === "cancelled"
                                        ? "bg-red-100 text-red-800"
                                        : reservation.status === "completed"
                                        ? "bg-green-200 text-green-800"
                                        : reservation.status === "preliminary"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-300"
                                    }`}
                                  >
                                    {getStatusLabel(reservation.status)}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600 dark:text-slate-400">
                                    Salon Kapasitesi:
                                  </span>{" "}
                                  <span className="text-gray-900 dark:text-slate-100">
                                    {reservation.guestCount}
                                  </span>
                                </div>
                                {reservation.salon?.type === "kultur" && (
                                  <>
                                    <div>
                                      <span className="font-medium text-gray-600 dark:text-slate-400">
                                        Organizasyon Adı:
                                      </span>{" "}
                                      <span className="text-gray-900 dark:text-slate-100">
                                        {reservation.orgName}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="font-medium text-gray-600 dark:text-slate-400">
                                        Organizasyon Sahibi:
                                      </span>{" "}
                                      <span className="text-gray-900 dark:text-slate-100">
                                        {reservation.orgOwnerName}
                                      </span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Tarih ve Fiyat Bilgileri - Yan Yana */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Tarih Bilgileri */}
                              <div className="bg-blue-50 dark:bg-blue-950/40 rounded-lg p-3 border border-blue-200 dark:border-blue-700/50">
                                <h5 className="font-semibold text-sm mb-2 text-blue-700 dark:text-blue-200">
                                  Tarih Bilgileri
                                </h5>
                                <div className="space-y-1 text-sm">
                                  <div>
                                    <span className="font-medium text-blue-600 dark:text-blue-300">
                                      Başlangıç:
                                    </span>{" "}
                                    <span className="text-blue-900 dark:text-blue-50">
                                      {formatDisplayDateTime(
                                        reservation.startDate
                                      )}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-blue-600 dark:text-blue-300">
                                      Bitiş:
                                    </span>{" "}
                                    <span className="text-blue-900 dark:text-blue-50">
                                      {formatDisplayDateTime(
                                        reservation.endDate
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Fiyat Bilgileri */}
                              {canViewPriceInfo && (
                                <div className="bg-green-50 dark:bg-green-950/40 rounded-lg p-3 border border-green-200 dark:border-green-700/50">
                                  <h5 className="font-semibold text-sm mb-2 text-green-700 dark:text-green-200">
                                    Fiyat Bilgileri
                                  </h5>
                                  <div className="space-y-1 text-sm">
                                    <div>
                                      <span className="font-medium text-green-600 dark:text-green-300">
                                        Salon Fiyatı:
                                      </span>{" "}
                                      <span className="text-green-900 dark:text-green-50 font-semibold">
                                        {formatCurrency(
                                          reservation.salonPrice || 0
                                        )}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="font-medium text-green-600 dark:text-green-300">
                                        İndirim:
                                      </span>{" "}
                                      <span className="text-purple-600 dark:text-purple-300 font-semibold">
                                        {reservation.discount > 0 ? "-" : ""}
                                        {formatCurrency(
                                          reservation.discount || 0
                                        )}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="font-medium text-green-600 dark:text-green-300">
                                        Toplam Fiyat:
                                      </span>{" "}
                                      <span className="text-green-900 dark:text-green-50 font-semibold">
                                        {formatCurrency(
                                          reservation.totalPrice || 0
                                        )}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="font-medium text-green-600 dark:text-green-300">
                                        Ödenen:
                                      </span>{" "}
                                      <span className="text-green-900 dark:text-green-50">
                                        {formatCurrency(
                                          reservation.paidAmount || 0
                                        )}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="font-medium text-green-600 dark:text-green-300">
                                        Kalan:
                                      </span>{" "}
                                      <span className="text-red-600 dark:text-red-300 font-semibold">
                                        {formatCurrency(
                                          reservation.remainingAmount || 0
                                        )}
                                      </span>
                                      {reservation.remainingAmount < 0 && (
                                        <div className="mt-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700 rounded text-xs font-semibold text-orange-800 dark:text-orange-200">
                                          Bu müşteriye{" "}
                                          {formatCurrency(
                                            Math.abs(
                                              reservation.remainingAmount
                                            ),
                                            false
                                          )}{" "}
                                          kadar ödeme yapılacaktır
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Kişi Bilgileri - Sadece Düğün Salonları */}
                            {(reservation.eventType === "wedding" ||
                              reservation.eventType === "engagement" ||
                              reservation.eventType === "nikah" ||
                              reservation.eventType === "henna") && (
                              <div className="bg-pink-50 dark:bg-pink-950/40 rounded-lg p-3 border border-pink-200 dark:border-pink-700/50">
                                <h5 className="font-semibold text-sm mb-2 text-pink-700 dark:text-pink-200">
                                  Kişi Bilgileri
                                </h5>
                                <div className="space-y-1 text-sm">
                                  {(reservation.groomName ||
                                    reservation.brideName) && (
                                    <div>
                                      <span className="font-medium text-pink-600 dark:text-pink-300">
                                        Damat ve Gelin:
                                      </span>{" "}
                                      <span className="text-pink-900 dark:text-pink-50">
                                        {[
                                          reservation.groomName,
                                          reservation.brideName,
                                        ]
                                          .filter(Boolean)
                                          .join(" ve ")}
                                      </span>
                                    </div>
                                  )}
                                  {(reservation.groomFatherName ||
                                    reservation.groomMotherName) && (
                                    <div>
                                      <span className="font-medium text-pink-600 dark:text-pink-300">
                                        Damatın Annesi ve Babası:
                                      </span>{" "}
                                      <span className="text-pink-900 dark:text-pink-50">
                                        {[
                                          reservation.groomFatherName,
                                          reservation.groomMotherName,
                                        ]
                                          .filter(Boolean)
                                          .join(" ve ")}
                                      </span>
                                    </div>
                                  )}
                                  {(reservation.brideFatherName ||
                                    reservation.brideMotherName) && (
                                    <div>
                                      <span className="font-medium text-pink-600 dark:text-pink-300">
                                        Gelinin Annesi ve Babası:
                                      </span>{" "}
                                      <span className="text-pink-900 dark:text-pink-50">
                                        {[
                                          reservation.brideFatherName,
                                          reservation.brideMotherName,
                                        ]
                                          .filter(Boolean)
                                          .join(" ve ")}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Seçilen Menüler */}
                          {reservation.reservationMenus &&
                            reservation.reservationMenus.length > 0 && (
                              <div className="mt-3">
                                <span className="font-medium text-sm">
                                  Seçilen Menüler:
                                </span>
                                <div className="mt-1 space-y-1">
                                  {reservation.reservationMenus.map(
                                    (menuItem, index) => (
                                      <div
                                        key={index}
                                        className="text-sm text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-700 rounded-lg p-3"
                                      >
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                          <div className="flex-1 min-w-0">
                                            <span className="font-medium text-gray-900 dark:text-slate-100 block truncate">
                                              {menuItem.menuName || "Menü"}
                                            </span>
                                          </div>
                                          <div className="flex items-center justify-between sm:justify-end gap-4">
                                            <span className="text-blue-600 dark:text-blue-400 font-medium whitespace-nowrap">
                                              {menuItem.quantity}{" "}
                                              {menuItem.unit || "adet"}
                                            </span>
                                            <span className="text-secondary-600 dark:text-secondary-200 font-bold whitespace-nowrap">
                                              {formatCurrency(
                                                menuItem.totalPrice
                                              )}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                          {/* Ek Hizmetler */}
                          <div className="mt-3">
                            <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                              {reservation.hasPhotography && (
                                <span className="text-green-600">
                                  📸 Fotoğraf (
                                  {formatCurrency(reservation.photographyPrice)}
                                  )
                                </span>
                              )}
                              {reservation.hasMusic && (
                                <span className="text-blue-600">
                                  🎵 Müzik (
                                  {formatCurrency(reservation.musicPrice)})
                                </span>
                              )}
                              {reservation.hasDecoration && (
                                <span className="text-purple-600">
                                  🎨 Dekorasyon (
                                  {formatCurrency(reservation.decorationPrice)})
                                </span>
                              )}
                            </div>
                          </div>

                          {reservation.notes && (
                            <div className="mt-3">
                              <span className="font-medium text-sm">
                                Notlar:
                              </span>
                              <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">
                                {reservation.notes}
                              </p>
                            </div>
                          )}

                          {/* Kullanıcı bilgisi ve oluşturulma tarihi - sağ alt köşe */}
                          <div className="mt-3 flex flex-col items-end gap-1">
                            {(reservation.user || reservation.createdBy) && (
                              <span className="text-xs text-gray-500 dark:text-slate-300">
                                Oluşturan:{" "}
                                {reservation.user?.name ||
                                  reservation.user?.firstName +
                                    " " +
                                    reservation.user?.lastName ||
                                  reservation.createdBy?.name ||
                                  reservation.createdBy?.firstName +
                                    " " +
                                    reservation.createdBy?.lastName ||
                                  (typeof reservation.user === "string"
                                    ? reservation.user
                                    : "") ||
                                  (typeof reservation.createdBy === "string"
                                    ? reservation.createdBy
                                    : "")}
                              </span>
                            )}
                            {reservation.createdAt && (
                              <span className="text-xs text-gray-500 dark:text-slate-300">
                                Oluşturulma:{" "}
                                {formatCreatedAtDateTime(reservation.createdAt)}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                : filteredReservations.map((reservation) => {
                    // Rezervasyon durumuna göre card rengi
                    const getCardStyle = (status) => {
                      switch (status) {
                        case "preliminary":
                          return "rounded-lg border border-yellow-200 bg-yellow-50 p-3 sm:p-4 shadow-sm";

                        case "completed":
                          return "rounded-lg border border-green-200 bg-green-50 p-3 sm:p-4 shadow-sm";
                        case "cancelled":
                          return "rounded-lg border border-red-200 bg-red-50 p-3 sm:p-4 shadow-sm";
                        default:
                          return "rounded-lg border p-3 sm:p-4 shadow-sm";
                      }
                    };

                    return (
                      <div
                        key={reservation.id}
                        className={getCardStyle(reservation.status)}
                      >
                        <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-base sm:text-lg">
                              {reservation.customerName}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-slate-300">
                              <span className="hidden sm:inline">
                                Telefon:{" "}
                              </span>
                              {reservation.customerPhone}
                            </p>
                            {/* Düğün salonları için ikinci telefon */}
                            {reservation.secondaryPhone &&
                              reservation.salon?.type !== "kultur" && (
                                <p className="text-sm text-gray-500 dark:text-slate-300">
                                  <span className="hidden sm:inline">
                                    İkinci Telefon:{" "}
                                  </span>
                                  <span className="sm:hidden">2. Tel: </span>
                                  {reservation.secondaryPhone}
                                </p>
                              )}
                            {/* Kültür salonları için organizasyon sahibi telefon */}
                            {reservation.secondaryPhone &&
                              reservation.salon?.type === "kultur" && (
                                <p className="text-sm text-gray-500 dark:text-slate-300">
                                  <span className="hidden sm:inline">
                                    Organizasyon Sahibi Tel No:{" "}
                                  </span>
                                  <span className="sm:hidden">
                                    Org Sahibi Tel:{" "}
                                  </span>
                                  {reservation.secondaryPhone}
                                </p>
                              )}
                            {reservation.salon?.type === "kultur" && (
                              <>
                                {reservation.orgName && (
                                  <p className="text-sm text-gray-500 dark:text-slate-300">
                                    Organizasyon İsmi: {reservation.orgName}
                                  </p>
                                )}
                                {reservation.orgOwnerName && (
                                  <p className="text-sm text-gray-500 dark:text-slate-300">
                                    Organizasyon Sahibi:{" "}
                                    {reservation.orgOwnerName}
                                  </p>
                                )}
                              </>
                            )}
                            {reservation.salon?.type === "kultur" && (
                              <div className="mt-1 flex items-center gap-2">
                                <span className="text-xs text-gray-500 dark:text-slate-400">
                                  Sözleşme:
                                </span>
                                <span
                                  className={`px-2 py-1 text-xs rounded-full font-medium ${
                                    reservation.isContractSigned
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200"
                                      : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"
                                  }`}
                                >
                                  {reservation.isContractSigned
                                    ? "İmzalandı"
                                    : "İmzalanmadı"}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {permissions.allowSozlesme === true && (
                              <button
                                onClick={() => getPdfFunc(reservation.id)}
                                className="btn-error text-sm"
                              >
                                Sözleşme İndir
                              </button>
                            )}
                            {permissions.allowEditReservation === true && (
                              <button
                                onClick={() => handleEdit(reservation)}
                                className={`text-sm ${
                                  isReservationLocked(reservation.startDate)
                                    ? "btn-disabled cursor-not-allowed opacity-50"
                                    : "btn-primary"
                                }`}
                                disabled={isReservationLocked(
                                  reservation.startDate
                                )}
                                title={
                                  isReservationLocked(reservation.startDate)
                                    ? getReservationLockMessage(
                                        reservation.startDate
                                      )
                                    : "Rezervasyonu düzenle"
                                }
                              >
                                Düzenle
                              </button>
                            )}
                            {permissions.allowGetPayment === true && (
                              <button
                                onClick={() => handlePayment(reservation)}
                                className="btn-success text-sm"
                              >
                                Ödeme
                              </button>
                            )}
                            {permissions.allowChangeDate === true && (
                              <button
                                onClick={() => handleMoveDate(reservation)}
                                className={`text-sm ${
                                  isDateInPast(reservation.startDate)
                                    ? "btn-disabled cursor-not-allowed opacity-50"
                                    : "bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-3 py-1.5 font-medium transition-colors"
                                }`}
                                disabled={isDateInPast(reservation.startDate)}
                                title={
                                  isDateInPast(reservation.startDate)
                                    ? "Geçmiş tarihli rezervasyonların tarihi değiştirilemez"
                                    : "Rezervasyon tarihini değiştir"
                                }
                              >
                                Tarih Değiştir
                              </button>
                            )}
                            {canChangeSalon && (
                              <button
                                onClick={() => handleMoveSalon(reservation)}
                                className={`text-sm ${
                                  isDateInPast(reservation.startDate)
                                    ? "btn-disabled cursor-not-allowed opacity-50"
                                    : "bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-1.5 font-medium transition-colors"
                                }`}
                                disabled={isDateInPast(reservation.startDate)}
                                title={
                                  isDateInPast(reservation.startDate)
                                    ? "Geçmiş tarihli rezervasyonların salonu değiştirilemez"
                                    : "Rezervasyonu farklı bir salona taşı"
                                }
                              >
                                Salon Değiştir
                              </button>
                            )}
                            {permissions.allowCancelReservation === true && (
                              <button
                                onClick={() => _handleDelete(reservation.id)}
                                className={`text-sm ${
                                  isDateInPast(reservation.startDate)
                                    ? "btn-disabled cursor-not-allowed opacity-50"
                                    : "btn-error"
                                }`}
                                disabled={isDateInPast(reservation.startDate)}
                                title={
                                  isDateInPast(reservation.startDate)
                                    ? "Geçmiş tarihli rezervasyonlar iptal edilemez"
                                    : "Rezervasyonu iptal et"
                                }
                              >
                                İptal
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                          {/* Temel Bilgiler */}
                          <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-3 border border-gray-200 dark:border-slate-700">
                            <h5 className="font-semibold text-sm mb-2 text-gray-700 dark:text-slate-300">
                              Temel Bilgiler
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="font-medium text-gray-600 dark:text-slate-400">
                                  Etkinlik Türü:
                                </span>{" "}
                                <span className="text-gray-900 dark:text-slate-100">
                                  {getEventTypeLabel(reservation.eventType)}
                                </span>
                              </div>
                              {(reservation.eventType === "other" ||
                                reservation.eventType === "otherEvent") &&
                                (reservation.otherEvent ||
                                  reservation.otherEventTitle) && (
                                  <div>
                                    <span className="font-medium text-gray-600 dark:text-slate-400">
                                      Etkinlik Başlığı:
                                    </span>{" "}
                                    <span className="text-gray-900 dark:text-slate-100">
                                      {reservation.otherEvent ||
                                        reservation.otherEventTitle}
                                    </span>
                                  </div>
                                )}
                              <div>
                                <span className="font-medium text-gray-600 dark:text-slate-400">
                                  Salon:
                                </span>{" "}
                                <span className="text-gray-900 dark:text-slate-100">
                                  {reservation.salon?.name ||
                                    reservation.salon?.displayName ||
                                    "-"}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600 dark:text-slate-400">
                                  Durum:
                                </span>{" "}
                                <span
                                  className={`rounded px-2 py-1 text-xs ${
                                    reservation.status === "cancelled"
                                      ? "bg-red-100 text-red-800"
                                      : reservation.status === "completed"
                                      ? "bg-green-200 text-green-800"
                                      : reservation.status === "preliminary"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-300"
                                  }`}
                                >
                                  {getStatusLabel(reservation.status)}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600 dark:text-slate-400">
                                  Salon Kapasitesi:
                                </span>{" "}
                                <span className="text-gray-900 dark:text-slate-100">
                                  {reservation.guestCount}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Tarih ve Fiyat Bilgileri - Yan Yana */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Tarih Bilgileri */}
                            <div className="bg-blue-50 dark:bg-blue-950/40 rounded-lg p-3 border border-blue-200 dark:border-blue-700/50">
                              <h5 className="font-semibold text-sm mb-2 text-blue-700 dark:text-blue-200">
                                Tarih Bilgileri
                              </h5>
                              <div className="space-y-1 text-sm">
                                <div>
                                  <span className="font-medium text-blue-600 dark:text-blue-300">
                                    Başlangıç:
                                  </span>{" "}
                                  <span className="text-blue-900 dark:text-blue-50">
                                    {formatDisplayDateTime(
                                      reservation.startDate
                                    )}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium text-blue-600 dark:text-blue-300">
                                    Bitiş:
                                  </span>{" "}
                                  <span className="text-blue-900 dark:text-blue-50">
                                    {formatDisplayDateTime(reservation.endDate)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Fiyat Bilgileri */}
                            {canViewPriceInfo && (
                              <div className="bg-green-50 dark:bg-green-950/40 rounded-lg p-3 border border-green-200 dark:border-green-700/50">
                                <h5 className="font-semibold text-sm mb-2 text-green-700 dark:text-green-200">
                                  Fiyat Bilgileri
                                </h5>
                                <div className="space-y-1 text-sm">
                                  <div>
                                    <span className="font-medium text-green-600 dark:text-green-300">
                                      Salon Fiyatı:
                                    </span>{" "}
                                    <span className="text-green-900 dark:text-green-50 font-semibold">
                                      {(() => {
                                        // Kültür salonlarında backend'den gelen 1 değerini 0 olarak göster
                                        if (
                                          reservation.salon?.type === "kultur"
                                        ) {
                                          const price =
                                            reservation.salonPrice ||
                                            reservation.salon?.defaultPrice ||
                                            0;
                                          const displayPrice =
                                            price === 1 ? 0 : price;
                                          return formatCurrency(displayPrice);
                                        }
                                        return formatCurrency(
                                          reservation.salonPrice || 0
                                        );
                                      })()}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-green-600 dark:text-green-300">
                                      İndirim:
                                    </span>{" "}
                                    <span className="text-purple-600 dark:text-purple-300 font-semibold">
                                      {reservation.discount > 0 ? "-" : ""}
                                      {formatCurrency(
                                        reservation.discount || 0
                                      )}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-green-600 dark:text-green-300">
                                      Toplam Fiyat:
                                    </span>{" "}
                                    <span className="text-green-900 dark:text-green-50 font-semibold">
                                      {formatCurrency(
                                        reservation.totalPrice || 0
                                      )}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-green-600 dark:text-green-300">
                                      Ödenen:
                                    </span>{" "}
                                    <span className="text-green-900 dark:text-green-50">
                                      {formatCurrency(
                                        reservation.paidAmount || 0
                                      )}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-green-600 dark:text-green-300">
                                      Kalan:
                                    </span>{" "}
                                    <span className="text-red-600 dark:text-red-300 font-semibold">
                                      {formatCurrency(
                                        reservation.remainingAmount || 0
                                      )}
                                    </span>
                                    {reservation.remainingAmount < 0 && (
                                      <div className="mt-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700 rounded text-xs font-semibold text-orange-800 dark:text-orange-200">
                                        Bu müşteriye{" "}
                                        {formatCurrency(
                                          Math.abs(reservation.remainingAmount),
                                          false
                                        )}{" "}
                                        kadar ödeme yapılacaktır
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Organizasyon Bilgileri - Sadece Kültür Salonları */}
                          {reservation.salon?.type === "kultur" && (
                            <div className="bg-purple-50 dark:bg-purple-950/40 rounded-lg p-3 border border-purple-200 dark:border-purple-700/50">
                              <h5 className="font-semibold text-sm mb-2 text-purple-700 dark:text-purple-200">
                                Organizasyon Bilgileri
                              </h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="font-medium text-purple-600 dark:text-purple-300">
                                    Organizasyon İsmi:
                                  </span>{" "}
                                  <span className="text-purple-900 dark:text-purple-50">
                                    {reservation.orgName || "-"}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium text-purple-600 dark:text-purple-300">
                                    Organizasyon Sahibi:
                                  </span>{" "}
                                  <span className="text-purple-900 dark:text-purple-50">
                                    {reservation.orgOwnerName || "-"}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium text-purple-600 dark:text-purple-300">
                                    Organizasyon Sahibi Tel:
                                  </span>{" "}
                                  <span className="text-purple-900 dark:text-purple-50">
                                    {reservation.secondaryPhone || "-"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Kişi Bilgileri - Sadece Düğün Salonları */}
                          {(reservation.eventType === "wedding" ||
                            reservation.eventType === "engagement" ||
                            reservation.eventType === "nikah" ||
                            reservation.eventType === "henna") && (
                            <div className="bg-pink-50 dark:bg-pink-950/40 rounded-lg p-3 border border-pink-200 dark:border-pink-700/50">
                              <h5 className="font-semibold text-sm mb-2 text-pink-700 dark:text-pink-200">
                                Kişi Bilgileri
                              </h5>
                              <div className="space-y-1 text-sm">
                                {(reservation.groomName ||
                                  reservation.brideName) && (
                                  <div>
                                    <span className="font-medium text-pink-600 dark:text-pink-300">
                                      Damat ve Gelin:
                                    </span>{" "}
                                    <span className="text-pink-900 dark:text-pink-50">
                                      {[
                                        reservation.groomName,
                                        reservation.brideName,
                                      ]
                                        .filter(Boolean)
                                        .join(" ve ")}
                                    </span>
                                  </div>
                                )}
                                {(reservation.groomFatherName ||
                                  reservation.groomMotherName) && (
                                  <div>
                                    <span className="font-medium text-pink-600 dark:text-pink-300">
                                      Damatın Annesi ve Babası:
                                    </span>{" "}
                                    <span className="text-pink-900 dark:text-pink-50">
                                      {[
                                        reservation.groomFatherName,
                                        reservation.groomMotherName,
                                      ]
                                        .filter(Boolean)
                                        .join(" ve ")}
                                    </span>
                                  </div>
                                )}
                                {(reservation.brideFatherName ||
                                  reservation.brideMotherName) && (
                                  <div>
                                    <span className="font-medium text-pink-600 dark:text-pink-300">
                                      Gelinin Annesi ve Babası:
                                    </span>{" "}
                                    <span className="text-pink-900 dark:text-pink-50">
                                      {[
                                        reservation.brideFatherName,
                                        reservation.brideMotherName,
                                      ]
                                        .filter(Boolean)
                                        .join(" ve ")}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Seçilen Menüler */}
                        {reservation.reservationMenus &&
                          reservation.reservationMenus.length > 0 && (
                            <div className="mt-3">
                              <span className="font-medium text-sm">
                                Seçilen Menüler:
                              </span>
                              <div className="mt-1 space-y-1">
                                {reservation.reservationMenus.map(
                                  (menuItem, index) => (
                                    <div
                                      key={index}
                                      className="text-sm text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-700 rounded-lg p-3"
                                    >
                                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                          <span className="font-medium text-gray-900 dark:text-slate-100 block truncate">
                                            {menuItem.menuName || "Menü"}
                                          </span>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-4">
                                          <span className="text-blue-600 dark:text-blue-400 font-medium whitespace-nowrap">
                                            {menuItem.quantity}{" "}
                                            {menuItem.unit || "adet"}
                                          </span>
                                          <span className="text-green-600 dark:text-green-400 font-bold whitespace-nowrap">
                                            {formatCurrency(
                                              menuItem.totalPrice
                                            )}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {/* Ek Hizmetler */}
                        <div className="mt-3">
                          <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                            {reservation.hasPhotography && (
                              <span className="text-green-600">
                                📸 Fotoğraf (
                                {formatCurrency(reservation.photographyPrice)})
                              </span>
                            )}
                            {reservation.hasMusic && (
                              <span className="text-blue-600">
                                🎵 Müzik (
                                {formatCurrency(reservation.musicPrice)})
                              </span>
                            )}
                            {reservation.hasDecoration && (
                              <span className="text-purple-600">
                                🎨 Dekorasyon (
                                {formatCurrency(reservation.decorationPrice)})
                              </span>
                            )}
                          </div>
                        </div>

                        {reservation.notes && (
                          <div className="mt-3">
                            <span className="font-medium text-sm">Notlar:</span>
                            <p className="text-sm text-gray-600 mt-1">
                              {reservation.notes}
                            </p>
                          </div>
                        )}

                        {/* Kullanıcı bilgisi ve oluşturulma tarihi - sağ alt köşe */}
                        <div className="mt-3 flex flex-col items-end gap-1">
                          {(reservation.user || reservation.createdBy) && (
                            <span className="text-xs text-gray-500 dark:text-slate-300">
                              Oluşturan:{" "}
                              {reservation.user?.name ||
                                reservation.user?.firstName +
                                  " " +
                                  reservation.user?.lastName ||
                                reservation.createdBy?.name ||
                                reservation.createdBy?.firstName +
                                  " " +
                                  reservation.createdBy?.lastName ||
                                (typeof reservation.user === "string"
                                  ? reservation.user
                                  : "") ||
                                (typeof reservation.createdBy === "string"
                                  ? reservation.createdBy
                                  : "")}
                            </span>
                          )}
                          {reservation.createdAt && (
                            <span className="text-xs text-gray-500 dark:text-slate-300">
                              Oluşturulma:{" "}
                              {formatDisplayDateTime(reservation.createdAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
            </div>
          )}

          {/* Edit Modal */}
          {editingReservation && (
            <div
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 dark:bg-black/70 p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setEditingReservation(null);
                  setMenuValidationErrors({});
                }
              }}
            >
              <div className="w-full max-w-[95vw] max-h-[90vh] overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-xl flex flex-col mx-2 sm:mx-4 md:mx-0 sm:w-[600px] md:w-[700px]">
                <div className="sticky top-0 bg-white dark:bg-slate-800 border-b dark:border-slate-700 px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
                  <h3 className="text-lg sm:text-xl font-semibold flex-1">
                    <span className="hidden sm:inline">
                      Rezervasyon Düzenle
                    </span>
                    <span className="sm:hidden">Düzenle</span>
                  </h3>
                  <button
                    onClick={() => {
                      setEditingReservation(null);
                      setMenuValidationErrors({});
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-slate-600 flex-shrink-0"
                    aria-label="Modalı kapat"
                  >
                    <LuX className="w-5 h-5 text-gray-600 dark:text-slate-300" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <form
                    id="edit-form"
                    onSubmit={handleUpdate}
                    className="space-y-4"
                    autoComplete="off"
                  >
                    {isCultureSalon ? (
                      <>
                        {/* Kültür Salonları için Yeni Form Yapısı */}
                        <div className="space-y-4">
                          {/* Kayıtlı Müşteriler Butonları - Sadece yetkisi olanlar görebilir */}
                          {permissions.allowSavedCustomers && (
                            <div className="flex flex-wrap gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                              <button
                                type="button"
                                onClick={() => setSavedCustomersModalOpen(true)}
                                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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
                                    d="M12 4v16m8-8H4"
                                  />
                                </svg>
                                Kayıtlı Müşteriler
                              </button>
                              <button
                                type="button"
                                onClick={handleSaveCustomer}
                                disabled={
                                  savingCustomer ||
                                  !form.customerName ||
                                  !form.customerPhone ||
                                  !form.customerTc
                                }
                                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                title="Mevcut form bilgilerini kayıtlı müşteri olarak kaydet"
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
                                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                                  />
                                </svg>
                                {savingCustomer
                                  ? "Kaydediliyor..."
                                  : "Müşteriyi Kaydet"}
                              </button>
                            </div>
                          )}
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* 1. Organizasyon İsmi - Tam Genişlik */}
                            <div className="md:col-span-2">
                              <label className="mb-1 block text-sm font-medium">
                                Organizasyon İsmi *
                              </label>
                              <input
                                name="orgName"
                                value={form.orgName}
                                onChange={handleChange}
                                required
                                className={`w-full rounded-lg border px-3 py-2 ${
                                  validationErrors.orgName
                                    ? "border-red-500"
                                    : ""
                                }`}
                                placeholder="Organizasyon İsmi"
                              />
                              <ErrorMessage fieldName="orgName" />
                            </div>

                            {/* 2. Müşteri / Firma Adı (Sol) ve Telefon (Sağ) */}
                            <div>
                              <label className="mb-1 block text-sm font-medium">
                                Müşteri / Firma Adı *
                              </label>
                              <input
                                name="customerName"
                                value={form.customerName}
                                onChange={handleChange}
                                required
                                autoComplete="off"
                                className={`w-full rounded-lg border px-3 py-2 ${
                                  validationErrors.customerName
                                    ? "border-red-500"
                                    : ""
                                }`}
                                placeholder="Müşteri / Firma Adı"
                              />
                              <ErrorMessage fieldName="customerName" />
                            </div>
                            <div>
                              <label className="mb-1 block text-sm font-medium">
                                Telefon *
                              </label>
                              <input
                                name="customerPhone"
                                value={form.customerPhone}
                                onChange={handleChange}
                                required
                                className={`w-full rounded-lg border px-3 py-2 ${
                                  validationErrors.customerPhone
                                    ? "border-red-500"
                                    : ""
                                }`}
                                placeholder="05xxxxxxxxx"
                              />
                              <ErrorMessage fieldName="customerPhone" />
                            </div>

                            {/* 3. Vergi Dairesi (Sol) ve TC No / Vergi No (Sağ) */}
                            <div>
                              <label className="mb-1 block text-sm font-medium">
                                Vergi Dairesi
                              </label>
                              <input
                                name="vergiDairesi"
                                value={form.vergiDairesi}
                                onChange={handleChange}
                                className={`w-full rounded-lg border px-3 py-2 ${
                                  validationErrors.vergiDairesi
                                    ? "border-red-500"
                                    : ""
                                }`}
                                placeholder="Vergi Dairesi"
                              />
                              <ErrorMessage fieldName="vergiDairesi" />
                            </div>
                            <div>
                              <label className="mb-1 block text-sm font-medium">
                                TC No / Vergi No *
                              </label>
                              <input
                                name="customerTc"
                                value={form.customerTc}
                                onChange={handleChange}
                                required
                                className={`w-full rounded-lg border px-3 py-2 ${
                                  validationErrors.customerTc
                                    ? "border-red-500"
                                    : ""
                                }`}
                                placeholder="TC No (11 haneli) veya Vergi No (10 haneli)"
                              />
                              <ErrorMessage fieldName="customerTc" />
                            </div>
                            {/* Organizasyon Sahibi Adı (Sol) ve Organizasyon Sahibi Tel No (Sağ) */}
                            <div>
                              <label className="mb-1 block text-sm font-medium">
                                Organizasyon Sahibi Adı *
                              </label>
                              <input
                                name="orgOwnerName"
                                value={form.orgOwnerName}
                                onChange={handleChange}
                                required
                                className={`w-full rounded-lg border px-3 py-2 ${
                                  validationErrors.orgOwnerName
                                    ? "border-red-500"
                                    : ""
                                }`}
                                placeholder="Organizasyon Sahibi Adı"
                              />
                              <ErrorMessage fieldName="orgOwnerName" />
                            </div>
                            <div>
                              <label className="mb-1 block text-sm font-medium">
                                Organizasyon Sahibi Tel No *
                              </label>
                              <input
                                name="secondaryPhone"
                                value={form.secondaryPhone}
                                onChange={handleChange}
                                required
                                className={`w-full rounded-lg border px-3 py-2 ${
                                  validationErrors.secondaryPhone
                                    ? "border-red-500"
                                    : ""
                                }`}
                                placeholder="05xxxxxxxxx"
                              />
                              <ErrorMessage fieldName="secondaryPhone" />
                            </div>

                            {/* Müşteri Adresi (Sol) ve E-posta Adresi (Sağ) */}
                            <div>
                              <label className="mb-1 block text-sm font-medium">
                                Müşteri Adresi
                              </label>
                              <textarea
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                className={`w-full rounded-lg border px-3 py-2 ${
                                  validationErrors.address
                                    ? "border-red-500"
                                    : ""
                                }`}
                                placeholder="Adres"
                                rows={2}
                              />
                              <ErrorMessage fieldName="address" />
                            </div>
                            <div>
                              <label className="mb-1 block text-sm font-medium">
                                E-posta Adresi
                              </label>
                              <input
                                name="customerEmail"
                                type="email"
                                value={form.customerEmail}
                                onChange={handleChange}
                                className={`w-full rounded-lg border px-3 py-2 ${
                                  validationErrors.customerEmail
                                    ? "border-red-500"
                                    : ""
                                }`}
                                placeholder="email@example.com"
                              />
                              <ErrorMessage fieldName="customerEmail" />
                            </div>
                          </div>

                          {/* Hesap Bilgileri Başlığı */}
                          <div className="border-t pt-4">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                              Hesap Bilgileri
                            </h3>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              {/* Müşteri Banka Adı (Sol) ve Müşteri Hesap Adı (Sağ) */}
                              <div>
                                <label className="mb-1 block text-sm font-medium">
                                  Müşteri Banka Adı
                                </label>
                                <input
                                  name="bank"
                                  value={form.bank}
                                  onChange={handleChange}
                                  className={`w-full rounded-lg border px-3 py-2 ${
                                    validationErrors.bank
                                      ? "border-red-500"
                                      : ""
                                  }`}
                                  placeholder="Banka Adı"
                                />
                                <ErrorMessage fieldName="bank" />
                              </div>
                              <div>
                                <label className="mb-1 block text-sm font-medium">
                                  Müşteri Hesap Adı
                                </label>
                                <input
                                  name="accountName"
                                  value={form.accountName}
                                  onChange={handleChange}
                                  className={`w-full rounded-lg border px-3 py-2 ${
                                    validationErrors.accountName
                                      ? "border-red-500"
                                      : ""
                                  }`}
                                  placeholder="Hesap Adı"
                                />
                                <ErrorMessage fieldName="accountName" />
                              </div>
                              {/* Müşteri IBAN - Tam Genişlik */}
                              <div className="md:col-span-2">
                                <label className="mb-1 block text-sm font-medium">
                                  Müşteri IBAN
                                </label>
                                <input
                                  name="iban"
                                  value={form.iban}
                                  onChange={handleChange}
                                  className={`w-full rounded-lg border px-3 py-2 ${
                                    validationErrors.iban
                                      ? "border-red-500"
                                      : ""
                                  }`}
                                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                                />
                                <ErrorMessage fieldName="iban" />
                              </div>
                            </div>
                          </div>

                          {/* Organizasyon Bilgileri Başlığı */}
                          <div className="border-t pt-4 space-y-4">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                              Organizasyon Bilgileri
                            </h3>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              {/* Etkinlik Türü */}
                              <div>
                                <label className="mb-1 block text-sm font-medium">
                                  Etkinlik Türü *
                                </label>
                                <select
                                  name="eventType"
                                  value={form.eventType}
                                  onChange={handleChange}
                                  required
                                  className="w-full rounded-lg border px-3 py-2"
                                >
                                  {eventTypeOptions.map((type) => (
                                    <option value={type.value} key={type.value}>
                                      {type.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Salon Kapasitesi ve Etkinlik Türü (Özel) - Kültür salonları için */}
                              {form.eventType === "other" ? (
                                <>
                                  <div>
                                    <label className="mb-1 block text-sm font-medium">
                                      Salon Kapasitesi *
                                    </label>
                                    <input
                                      name="guestCount"
                                      type="number"
                                      min="1"
                                      value={form.guestCount}
                                      onChange={handleChange}
                                      required
                                      className="w-full rounded-lg border px-3 py-2"
                                    />
                                  </div>
                                  <div>
                                    <label className="mb-1 block text-sm font-medium">
                                      Etkinlik Türü (Özel) *
                                    </label>
                                    <input
                                      name="otherEventTitle"
                                      value={form.otherEventTitle}
                                      onChange={handleChange}
                                      required
                                      className="w-full rounded-lg border px-3 py-2"
                                      placeholder="Etkinlik türünü giriniz"
                                    />
                                  </div>
                                </>
                              ) : (
                                <div>
                                  <label className="mb-1 block text-sm font-medium">
                                    Salon Kapasitesi *
                                  </label>
                                  <input
                                    name="guestCount"
                                    type="number"
                                    min="1"
                                    value={form.guestCount}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border px-3 py-2"
                                  />
                                </div>
                              )}

                              {/* Salon Fiyatı (Sol) ve İndirim (Sağ) */}
                              {canViewPriceInfo && (
                                <>
                                  <div>
                                    <label className="mb-1 block text-sm font-medium">
                                      Salon Fiyatı ({formatCurrency(0, false)})
                                    </label>
                                    <input
                                      name="salonPrice"
                                      type="number"
                                      inputMode="numeric"
                                      min="0"
                                      step="1"
                                      value={
                                        form.salonPrice
                                          ? Math.floor(
                                              Number(form.salonPrice)
                                            ).toString()
                                          : ""
                                      }
                                      onChange={handleChange}
                                      placeholder={
                                        editingReservation?.salon?.defaultPrice
                                          ? (() => {
                                              // Kültür salonlarında defaultPrice 1 ise placeholder'da 0 göster
                                              const defaultPrice = Number(
                                                editingReservation.salon
                                                  .defaultPrice
                                              );
                                              const displayPrice =
                                                editingReservation.salon
                                                  .type === "kultur" &&
                                                defaultPrice === 1
                                                  ? 0
                                                  : defaultPrice;
                                              return Math.floor(
                                                displayPrice
                                              ).toString();
                                            })()
                                          : "0"
                                      }
                                      className="w-full rounded-lg border px-3 py-2"
                                    />
                                  </div>
                                  <div>
                                    <label className="mb-1 block text-sm font-medium">
                                      <span>İndirim (%)</span>
                                      {form.discountPercentage &&
                                        Number(form.discountPercentage) > 0 && (
                                          <span className="ml-2 text-green-600 dark:text-green-400 font-semibold">
                                            (
                                            {(() => {
                                              const salonPrice =
                                                Number(form.salonPrice) || 0;
                                              const discountPercent =
                                                Number(
                                                  form.discountPercentage
                                                ) || 0;
                                              const calculatedDiscount =
                                                (salonPrice * discountPercent) /
                                                100;
                                              return (
                                                calculatedDiscount.toLocaleString(
                                                  "tr-TR",
                                                  {
                                                    minimumFractionDigits: 0,
                                                    maximumFractionDigits: 0,
                                                  }
                                                ) + " ₺"
                                              );
                                            })()}
                                            )
                                          </span>
                                        )}
                                    </label>
                                    <input
                                      name="discountPercentage"
                                      type="number"
                                      min="0"
                                      max="100"
                                      step="1"
                                      value={form.discountPercentage}
                                      onChange={handleChange}
                                      className="w-full rounded-lg border px-3 py-2"
                                      placeholder="10"
                                    />
                                  </div>
                                </>
                              )}

                              {/* Notlar - Tam Genişlik */}
                              <div className="md:col-span-2">
                                <label className="mb-1 block text-sm font-medium">
                                  Notlar
                                </label>
                                <textarea
                                  name="notes"
                                  value={form.notes}
                                  onChange={handleChange}
                                  rows={3}
                                  className="w-full rounded-lg border px-3 py-2"
                                />
                              </div>

                              {/* Checkboxlar - Tam Genişlik */}
                              <div className="md:col-span-2 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
                                <label
                                  htmlFor="isContractSignedEdit"
                                  className="flex items-center gap-2 text-sm font-medium cursor-pointer select-none"
                                >
                                  <input
                                    type="checkbox"
                                    id="isContractSignedEdit"
                                    name="isContractSigned"
                                    checked={form.isContractSigned}
                                    onChange={handleChange}
                                    className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-700"
                                  />
                                  Sözleşme İmzalandı
                                </label>
                                <label
                                  htmlFor="isMessageActiveEdit"
                                  className="flex items-center gap-2 text-sm font-medium cursor-pointer select-none"
                                >
                                  <input
                                    type="checkbox"
                                    id="isMessageActiveEdit"
                                    name="isMessageActive"
                                    checked={form.isMessageActive}
                                    onChange={(e) =>
                                      setForm((prev) => ({
                                        ...prev,
                                        isMessageActive: e.target.checked,
                                      }))
                                    }
                                    className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-700"
                                  />
                                  Mesaj Gönderimi Aktif
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Normal Salonlar için Eski Form Yapısı */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-sm font-medium">
                              Müşteri Adı *
                            </label>
                            <input
                              name="customerName"
                              value={form.customerName}
                              onChange={handleChange}
                              required
                              autoComplete="off"
                              className={`w-full rounded-lg border px-3 py-2 ${
                                validationErrors.customerName
                                  ? "border-red-500"
                                  : ""
                              }`}
                              placeholder="Ad Soyad"
                            />
                            <ErrorMessage fieldName="customerName" />
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium">
                              Müşteri TC *
                            </label>
                            <input
                              name="customerTc"
                              value={form.customerTc}
                              onChange={handleChange}
                              required
                              className={`w-full rounded-lg border px-3 py-2 ${
                                validationErrors.customerTc
                                  ? "border-red-500"
                                  : ""
                              }`}
                              placeholder="TC Kimlik No"
                            />
                            <ErrorMessage fieldName="customerTc" />
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium">
                              Telefon *
                            </label>
                            <input
                              name="customerPhone"
                              value={form.customerPhone}
                              onChange={handleChange}
                              required
                              className={`w-full rounded-lg border px-3 py-2 ${
                                validationErrors.customerPhone
                                  ? "border-red-500"
                                  : ""
                              }`}
                              placeholder="05xxxxxxxxx"
                            />
                            <ErrorMessage fieldName="customerPhone" />
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium">
                              İkinci Telefon
                            </label>
                            <input
                              name="secondaryPhone"
                              value={form.secondaryPhone}
                              onChange={handleChange}
                              className="w-full rounded-lg border px-3 py-2"
                              placeholder="05xxxxxxxxx"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium">
                              E-posta
                            </label>
                            <input
                              name="customerEmail"
                              type="email"
                              value={form.customerEmail}
                              onChange={handleChange}
                              className={`w-full rounded-lg border px-3 py-2 ${
                                validationErrors.customerEmail
                                  ? "border-red-500"
                                  : ""
                              }`}
                              placeholder="email@example.com"
                            />
                            <ErrorMessage fieldName="customerEmail" />
                          </div>
                        </div>

                        {/* Mesaj Gönderimi Aktif */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
                          <label
                            htmlFor="isMessageActiveNormal"
                            className="flex items-center gap-2 text-sm font-medium cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              id="isMessageActiveNormal"
                              name="isMessageActive"
                              checked={form.isMessageActive}
                              onChange={(e) =>
                                setForm((prev) => ({
                                  ...prev,
                                  isMessageActive: e.target.checked,
                                }))
                              }
                              className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-700"
                            />
                            Mesaj Gönderimi Aktif
                          </label>
                        </div>

                        {/* Salon ve Etkinlik Türü */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-sm font-medium">
                              Salon *
                            </label>
                            <select
                              name="salonID"
                              value={form.salonID}
                              onChange={handleChange}
                              required
                              className={`w-full rounded-lg border px-3 py-2 ${
                                validationErrors.salonID ? "border-red-500" : ""
                              }`}
                            >
                              <option value="">Salon Seçiniz</option>
                              {salons
                                ?.slice()
                                .sort((a, b) => a.id - b.id)
                                .map((salon) => (
                                  <option value={salon.id} key={salon.id}>
                                    {salon.name}
                                  </option>
                                ))}
                            </select>
                            <ErrorMessage fieldName="salonID" />
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium">
                              Etkinlik Türü *
                            </label>
                            <select
                              name="eventType"
                              value={form.eventType}
                              onChange={handleChange}
                              required
                              className="w-full rounded-lg border px-3 py-2"
                            >
                              {eventTypeOptions.map((type) => (
                                <option value={type.value} key={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Salon Kapasitesi */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-sm font-medium">
                              Salon Kapasitesi *
                            </label>
                            <input
                              name="guestCount"
                              type="number"
                              min="1"
                              value={form.guestCount}
                              onChange={handleChange}
                              required
                              className={`w-full rounded-lg border px-3 py-2 ${
                                validationErrors.guestCount
                                  ? "border-red-500"
                                  : ""
                              }`}
                              placeholder="200"
                            />
                            <ErrorMessage fieldName="guestCount" />
                          </div>
                        </div>

                        {/* Salon Fiyatı ve İndirim */}
                        {canViewPriceInfo && (
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                              <label className="mb-1 block text-sm font-medium">
                                Salon Fiyatı ({formatCurrency(0, false)}) *
                              </label>
                              <input
                                name="salonPrice"
                                type="number"
                                inputMode="numeric"
                                min="0"
                                step="1"
                                value={
                                  form.salonPrice
                                    ? Math.floor(
                                        Number(form.salonPrice)
                                      ).toString()
                                    : ""
                                }
                                onChange={handleChange}
                                required
                                className={`w-full rounded-lg border px-3 py-2 ${
                                  validationErrors.salonPrice
                                    ? "border-red-500"
                                    : ""
                                }`}
                                placeholder={
                                  editingReservation?.salon?.defaultPrice
                                    ? (() => {
                                        // Kültür salonlarında defaultPrice 1 ise placeholder'da 0 göster
                                        const defaultPrice = Number(
                                          editingReservation.salon.defaultPrice
                                        );
                                        const displayPrice =
                                          editingReservation.salon.type ===
                                            "kultur" && defaultPrice === 1
                                            ? 0
                                            : defaultPrice;
                                        return Math.floor(
                                          displayPrice
                                        ).toString();
                                      })()
                                    : "0"
                                }
                              />
                              <ErrorMessage fieldName="salonPrice" />
                            </div>
                            <div>
                              <label className="mb-1 block text-sm font-medium">
                                İndirim ({formatCurrency(0, false)})
                              </label>
                              <input
                                name="discount"
                                type="number"
                                inputMode="numeric"
                                min="0"
                                step="1"
                                value={
                                  form.discount
                                    ? Math.floor(
                                        Number(form.discount)
                                      ).toString()
                                    : ""
                                }
                                onChange={handleChange}
                                className={`w-full rounded-lg border px-3 py-2 ${
                                  validationErrors.discount
                                    ? "border-red-500"
                                    : ""
                                }`}
                                placeholder="0"
                              />
                              <ErrorMessage fieldName="discount" />
                            </div>
                          </div>
                        )}

                        {/* Notlar */}
                        <div>
                          <label className="mb-1 block text-sm font-medium">
                            Notlar
                          </label>
                          <textarea
                            name="notes"
                            value={form.notes}
                            onChange={handleChange}
                            rows={3}
                            className="w-full rounded-lg border px-3 py-2"
                            placeholder="Ek detaylar…"
                          />
                        </div>

                        {/* Etkinlik Türüne Özel Alanlar */}
                        {(form.eventType === "wedding" ||
                          form.eventType === "engagement" ||
                          form.eventType === "nikah" ||
                          form.eventType === "henna") && (
                          <div className="rounded-lg border dark:border-slate-700 p-4 dark:bg-slate-900">
                            <h4 className="mb-3 font-medium">
                              {form.eventType === "wedding"
                                ? "Düğün Detayları"
                                : form.eventType === "engagement"
                                ? "Nişan Detayları"
                                : form.eventType === "nikah"
                                ? "Nikah Detayları"
                                : "Kına Detayları"}
                            </h4>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div>
                                <label className="mb-1 block text-sm font-medium">
                                  Damat Adı *
                                </label>
                                <input
                                  name="groomName"
                                  value={form.groomName}
                                  onChange={handleChange}
                                  required
                                  className="w-full rounded-lg border px-3 py-2"
                                  placeholder="Damat adı soyadı"
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-sm font-medium">
                                  Gelin Adı *
                                </label>
                                <input
                                  name="brideName"
                                  value={form.brideName}
                                  onChange={handleChange}
                                  required
                                  className="w-full rounded-lg border px-3 py-2"
                                  placeholder="Gelin adı soyadı"
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-sm font-medium">
                                  Damat Baba Adı *
                                </label>
                                <input
                                  name="groomFatherName"
                                  value={form.groomFatherName}
                                  onChange={handleChange}
                                  required
                                  className="w-full rounded-lg border px-3 py-2"
                                  placeholder="Damat baba adı"
                                />
                              </div>

                              <div>
                                <label className="mb-1 block text-sm font-medium">
                                  Gelin Baba Adı *
                                </label>
                                <input
                                  name="brideFatherName"
                                  value={form.brideFatherName}
                                  onChange={handleChange}
                                  required
                                  className="w-full rounded-lg border px-3 py-2"
                                  placeholder="Gelin baba adı"
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-sm font-medium">
                                  Damat Anne Adı *
                                </label>
                                <input
                                  name="groomMotherName"
                                  value={form.groomMotherName}
                                  onChange={handleChange}
                                  required
                                  className="w-full rounded-lg border px-3 py-2"
                                  placeholder="Damat anne adı"
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-sm font-medium">
                                  Gelin Anne Adı *
                                </label>
                                <input
                                  name="brideMotherName"
                                  value={form.brideMotherName}
                                  onChange={handleChange}
                                  required
                                  className="w-full rounded-lg border px-3 py-2"
                                  placeholder="Gelin anne adı"
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-sm font-medium">
                                  Damat TC
                                </label>
                                <input
                                  name="groomTc"
                                  value={form.groomTc}
                                  onChange={handleChange}
                                  className="w-full rounded-lg border px-3 py-2"
                                  placeholder="12345678901"
                                />
                              </div>

                              <div>
                                <label className="mb-1 block text-sm font-medium">
                                  Gelin TC
                                </label>
                                <input
                                  name="brideTc"
                                  value={form.brideTc}
                                  onChange={handleChange}
                                  className="w-full rounded-lg border px-3 py-2"
                                  placeholder="98765432109"
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-sm font-medium">
                                  Damat Doğum Tarihi
                                </label>
                                <input
                                  name="groomBirthDate"
                                  type="date"
                                  value={form.groomBirthDate}
                                  onChange={handleChange}
                                  max="9999-12-31"
                                  className="w-full rounded-lg border px-3 py-2"
                                />
                              </div>

                              <div>
                                <label className="mb-1 block text-sm font-medium">
                                  Gelin Doğum Tarihi
                                </label>
                                <input
                                  name="brideBirthDate"
                                  type="date"
                                  value={form.brideBirthDate}
                                  onChange={handleChange}
                                  max="9999-12-31"
                                  className="w-full rounded-lg border px-3 py-2"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {form.eventType === "circumcision" && (
                          <div className="rounded-lg border dark:border-slate-700 p-4 dark:bg-slate-900">
                            <h4 className="mb-3 font-medium">
                              Sünnet Detayları
                            </h4>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                              <div>
                                <label className="mb-1 block text-sm font-medium">
                                  Çocuk Adı *
                                </label>
                                <input
                                  name="childName"
                                  value={form.childName}
                                  onChange={handleChange}
                                  required
                                  className="w-full rounded-lg border px-3 py-2"
                                  placeholder="Çocuk adı soyadı"
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-sm font-medium">
                                  Çocuk TC
                                </label>
                                <input
                                  name="childTc"
                                  value={form.childTc}
                                  onChange={handleChange}
                                  className="w-full rounded-lg border px-3 py-2"
                                  placeholder="12345678901"
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-sm font-medium">
                                  Çocuk Doğum Tarihi
                                </label>
                                <input
                                  name="childBirthDate"
                                  type="date"
                                  value={form.childBirthDate}
                                  onChange={handleChange}
                                  max="9999-12-31"
                                  className="w-full rounded-lg border px-3 py-2"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {form.eventType === "meeting" && (
                          <div className="rounded-lg border dark:border-slate-700 p-4 dark:bg-slate-900">
                            <h4 className="mb-3 font-medium">
                              Toplantı Detayları
                            </h4>
                            <div className="grid grid-cols-1 gap-4">
                              <div>
                                <label className="mb-1 block text-sm font-medium">
                                  Toplantı Başlığı *
                                </label>
                                <input
                                  name="meetingTitle"
                                  value={form.meetingTitle}
                                  onChange={handleChange}
                                  required
                                  className="w-full rounded-lg border px-3 py-2"
                                  placeholder="Toplantı başlığı"
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-sm font-medium">
                                  Toplantı Açıklaması
                                </label>
                                <textarea
                                  name="meetingDescription"
                                  value={form.meetingDescription}
                                  onChange={handleChange}
                                  className="w-full rounded-lg border px-3 py-2"
                                  rows={3}
                                  placeholder="Toplantı açıklaması"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {form.eventType === "other" && !isCultureSalon && (
                          <div className="rounded-lg border dark:border-slate-700 p-4 dark:bg-slate-900">
                            <h4 className="mb-3 font-medium">
                              Diğer Etkinlik Detayları
                            </h4>
                            <div className="grid grid-cols-1 gap-4">
                              <div>
                                <label className="mb-1 block text-sm font-medium">
                                  Etkinlik Başlığı *
                                </label>
                                <input
                                  name="otherEventTitle"
                                  value={form.otherEventTitle}
                                  onChange={handleChange}
                                  required
                                  className="w-full rounded-lg border px-3 py-2"
                                  placeholder="Etkinlik başlığı"
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-sm font-medium">
                                  Etkinlik Açıklaması
                                </label>
                                <textarea
                                  name="otherEventDescription"
                                  value={form.otherEventDescription}
                                  onChange={handleChange}
                                  className="w-full rounded-lg border px-3 py-2"
                                  rows={3}
                                  placeholder="Etkinlik açıklaması"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Menü Bilgileri */}
                    {!isCultureSalon && (
                      <div className="rounded-lg border p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <h4 className="font-medium">Menü Bilgileri</h4>
                          <button
                            type="button"
                            onClick={addMenu}
                            className="btn-secondary text-sm"
                          >
                            + Menü Ekle
                          </button>
                        </div>

                        {form.menus.length === 0 ? (
                          <div className="text-center py-4 text-gray-500 dark:text-slate-300">
                            <p>Henüz menü eklenmedi.</p>
                            <p className="text-sm">
                              Yukarıdaki "Menü Ekle" butonuna tıklayarak menü
                              ekleyebilirsiniz.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {form.menus.map((menu, index) => (
                              <div
                                key={menu.id}
                                className="border dark:border-slate-700 rounded-lg p-4 bg-gray-50 dark:bg-slate-900"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <h5 className="font-medium text-sm">
                                    Menü {index + 1}
                                  </h5>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (
                                        window.confirm(
                                          "Bu menüyü silmek istediğinizden emin misiniz?"
                                        )
                                      ) {
                                        removeMenu(menu.id);
                                      }
                                    }}
                                    className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded-lg font-medium transition-colors"
                                  >
                                    ✕ Kaldır
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                  <div>
                                    <label className="mb-1 block text-sm font-medium">
                                      Menü Adı *
                                    </label>
                                    <input
                                      type="text"
                                      value={menu.name}
                                      onChange={(e) =>
                                        updateMenu(
                                          menu.id,
                                          "name",
                                          e.target.value
                                        )
                                      }
                                      className={`input ${
                                        menuValidationErrors[menu.id]?.name
                                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                          : ""
                                      }`}
                                      placeholder="Örn: Düğün Menüsü"
                                    />
                                    {menuValidationErrors[menu.id]?.name && (
                                      <p className="text-red-600 text-xs mt-1">
                                        {menuValidationErrors[menu.id].name}
                                      </p>
                                    )}
                                  </div>
                                  <div>
                                    <label className="mb-1 block text-sm font-medium">
                                      Toplam Fiyatı (₺) *
                                    </label>
                                    <input
                                      type="number"
                                      inputMode="numeric"
                                      min="0"
                                      step="1"
                                      value={menu.price}
                                      onChange={(e) =>
                                        updateMenu(
                                          menu.id,
                                          "price",
                                          e.target.value
                                        )
                                      }
                                      className={`input ${
                                        menuValidationErrors[menu.id]?.price
                                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                          : ""
                                      }`}
                                      placeholder="150"
                                    />
                                    {menuValidationErrors[menu.id]?.price && (
                                      <p className="text-red-600 text-xs mt-1">
                                        {menuValidationErrors[menu.id].price}
                                      </p>
                                    )}
                                  </div>
                                  <div>
                                    <label className="mb-1 block text-sm font-medium">
                                      Adet *
                                    </label>
                                    <input
                                      type="number"
                                      min="1"
                                      step="1"
                                      value={menu.quantity}
                                      onChange={(e) =>
                                        updateMenu(
                                          menu.id,
                                          "quantity",
                                          e.target.value
                                        )
                                      }
                                      className={`input ${
                                        menuValidationErrors[menu.id]?.quantity
                                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                          : ""
                                      }`}
                                      placeholder="1"
                                    />
                                    {menuValidationErrors[menu.id]
                                      ?.quantity && (
                                      <p className="text-red-600 text-xs mt-1">
                                        {menuValidationErrors[menu.id].quantity}
                                      </p>
                                    )}
                                  </div>
                                  <div>
                                    <label className="mb-1 block text-sm font-medium">
                                      Birim *
                                    </label>
                                    <input
                                      type="text"
                                      value={menu.unit}
                                      onChange={(e) =>
                                        updateMenu(
                                          menu.id,
                                          "unit",
                                          e.target.value
                                        )
                                      }
                                      className={`input ${
                                        menuValidationErrors[menu.id]?.unit
                                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                          : ""
                                      }`}
                                      placeholder="Örn: Kişi, Porsiyon, Adet"
                                    />
                                    {menuValidationErrors[menu.id]?.unit && (
                                      <p className="text-red-600 text-xs mt-1">
                                        {menuValidationErrors[menu.id].unit}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Menü Butonları */}
                                <div className="mt-4 flex gap-2 items-center">
                                  {menu.isNew ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleAddMenuToReservation(menu)
                                      }
                                      className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors"
                                    >
                                      ✓ Menüyü Ekle
                                    </button>
                                  ) : menu.isModified ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleUpdateMenuInReservation(menu)
                                      }
                                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors"
                                    >
                                      🔄 Menüyü Güncelle
                                    </button>
                                  ) : (
                                    <div className="flex items-center gap-2 text-sm text-green-600 px-4 py-2">
                                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                      Kaydedildi
                                    </div>
                                  )}

                                  {/* Menü durumu göstergesi */}
                                  <div className="text-xs text-gray-500 dark:text-slate-300">
                                    {menu.isNew &&
                                      "Yeni menü - Kaydetmek için butona tıklayın"}
                                    {menu.isModified &&
                                      "Değiştirildi - Güncellemek için butona tıklayın"}
                                    {!menu.isNew &&
                                      !menu.isModified &&
                                      "Değişiklik yok"}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {form.menus.length > 0 && (
                          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-600/20 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-sm">
                                Toplam Menü Fiyatı:
                              </span>
                              <span className="font-bold text-blue-600 dark:text-blue-100 ">
                                {form.menus
                                  .reduce((total, menu) => {
                                    const price = Number(menu.price) || 0;
                                    return total + price; // Toplam fiyat
                                  }, 0)
                                  .toLocaleString("tr-TR", {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                  })}{" "}
                                ₺
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Ek Hizmetler */}
                    {/*                     <div className="rounded-lg border p-4">
                      <h4 className="mb-3 font-medium">Ek Hizmetler</h4>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="hasPhotography"
                              checked={form.hasPhotography}
                              onChange={(e) =>
                                setForm((prev) => ({
                                  ...prev,
                                  hasPhotography: e.target.checked,
                                }))
                              }
                              className="mr-2"
                            />
                            Fotoğraf Hizmeti
                          </label>
                          {form.hasPhotography && (
                            <input
                              type="number"
                              name="photographyPrice"
                              value={form.photographyPrice}
                              onChange={handleChange}
                              placeholder="Fiyat"
                              className="w-24 rounded border px-2 py-1 text-sm"
                            />
                          )}
                        </div>

                        <div className="flex items-center gap-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="hasMusic"
                              checked={form.hasMusic}
                              onChange={(e) =>
                                setForm((prev) => ({
                                  ...prev,
                                  hasMusic: e.target.checked,
                                }))
                              }
                              className="mr-2"
                            />
                            Müzik Hizmeti
                          </label>
                          {form.hasMusic && (
                            <input
                              type="number"
                              name="musicPrice"
                              value={form.musicPrice}
                              onChange={handleChange}
                              placeholder="Fiyat"
                              className="w-24 rounded border px-2 py-1 text-sm"
                            />
                          )}
                        </div>

                        <div className="flex items-center gap-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="hasDecoration"
                              checked={form.hasDecoration}
                              onChange={(e) =>
                                setForm((prev) => ({
                                  ...prev,
                                  hasDecoration: e.target.checked,
                                }))
                              }
                              className="mr-2"
                            />
                            Dekorasyon Hizmeti
                          </label>
                          {form.hasDecoration && (
                            <input
                              type="number"
                              name="decorationPrice"
                              value={form.decorationPrice}
                              onChange={handleChange}
                              placeholder="Fiyat"
                              className="w-24 rounded border px-2 py-1 text-sm"
                            />
                          )}
                        </div>
                      </div>
                    </div> */}
                  </form>
                </div>
                <div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t dark:border-slate-700 px-6 py-4 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingReservation(null);
                      setMenuValidationErrors({});
                    }}
                    className="rounded-lg border px-4 py-2 hover:bg-gray-50"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    form="edit-form"
                    disabled={loading}
                    className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Güncelleniyor..." : "Güncelle"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Payment Modal */}
          {paymentReservation && (
            <div
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 dark:bg-black/70"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setPaymentReservation(null);
                }
              }}
            >
              <div className="w-full max-w-[95vw] card p-3 sm:p-4 md:p-6 max-h-[90vh] overflow-y-auto mx-2 sm:mx-4 md:mx-0 sm:w-[600px] md:w-[700px] lg:w-[800px]">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-base sm:text-lg font-semibold flex-1">
                    <span className="hidden sm:inline">
                      Ödeme Ekle - {paymentReservation.customerName}
                    </span>
                    <span className="sm:hidden">
                      Ödeme - {paymentReservation.customerName}
                    </span>
                  </h3>
                  <button
                    onClick={() => {
                      setPaymentReservation(null);
                      setPaymentHistory([]);
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-slate-600 flex-shrink-0"
                    aria-label="Modalı kapat"
                  >
                    <LuX className="w-5 h-5 text-gray-600 dark:text-slate-300" />
                  </button>
                </div>

                {canViewPriceInfo && (
                  <div className="mb-4 text-sm text-gray-600 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span>Toplam Tutar:</span>
                      <span>
                        {formatCurrency(paymentReservation.totalPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ödenen:</span>
                      <span>
                        {formatCurrency(paymentReservation.paidAmount)}
                      </span>
                    </div>
                    {paymentReservation.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>İndirim:</span>
                        <span>
                          -{formatCurrency(paymentReservation.discount)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium text-red-600">
                      <span>Kalan:</span>
                      <div className="flex flex-col items-end">
                        <span>
                          {formatCurrency(paymentReservation.remainingAmount)}
                        </span>
                        {paymentReservation.remainingAmount < 0 && (
                          <div className="mt-2 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700 rounded text-xs font-semibold text-orange-800 dark:text-orange-200">
                            Bu müşteriye{" "}
                            {formatCurrency(
                              Math.abs(paymentReservation.remainingAmount),
                              false
                            )}{" "}
                            kadar ödeme yapılacaktır
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Ödeme Geçmişi */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-800 dark:text-slate-100 mb-3">
                    Ödeme Geçmişi
                  </h4>
                  <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 max-h-48 overflow-y-auto border dark:border-slate-700">
                    {paymentHistory.length > 0 ? (
                      <div className="space-y-3">
                        {paymentHistory.map((payment, index) => (
                          <div
                            key={payment.id || index}
                            className="flex items-center justify-between bg-white dark:bg-slate-700 p-3 rounded-lg border dark:border-slate-600"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900 dark:text-slate-100">
                                  {formatCurrency(payment.paidAmount)}
                                </span>
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    payment.paymentType === "cash"
                                      ? "bg-green-100 text-green-800  dark:bg-green-600/20 dark:text-green-200"
                                      : payment.paymentType === "card"
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-600/20 dark:text-blue-200"
                                      : "bg-purple-100 text-purple-800 dark:bg-purple-600/20 dark:text-purple-200"
                                  }`}
                                >
                                  {payment.paymentType === "cash"
                                    ? "💰 Nakit"
                                    : payment.paymentType === "card"
                                    ? "💳 Kart"
                                    : "🏦 Havale"}
                                </span>
                              </div>
                              {payment.notes && (
                                <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">
                                  {payment.notes}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 dark:text-slate-300 mt-1">
                                {formatDisplayDateTime(payment.paymentDate)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleDeletePayment(payment.id)}
                                className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-lg font-medium transition-colors"
                                title="Ödemeyi Sil"
                              >
                                ✕ Sil
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div className="text-gray-400 mb-2">
                          <span className="w-8 h-8 mx-auto flex items-center justify-center text-2xl font-bold text-gray-400">
                            ₺
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-slate-300">
                          Henüz ödeme yapılmamış
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Ödeme Miktarı (₺) *
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      step="1"
                      max={paymentReservation.remainingAmount}
                      value={paymentForm.amount}
                      onChange={(e) =>
                        setPaymentForm((prev) => ({
                          ...prev,
                          amount: e.target.value,
                        }))
                      }
                      required
                      className="w-full rounded-lg border px-3 py-2"
                      placeholder="Ödeme miktarını girin"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Ödeme Türü *
                    </label>
                    <select
                      value={paymentForm.paymentType}
                      onChange={(e) =>
                        setPaymentForm((prev) => ({
                          ...prev,
                          paymentType: e.target.value,
                        }))
                      }
                      required
                      className="w-full rounded-lg border px-3 py-2"
                    >
                      <option value="cash">Nakit</option>
                      <option value="card">Kredi Kartı</option>
                      <option value="bank_transfer">Banka Havalesi</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Ödeme Tarihi
                    </label>
                    <input
                      type="datetime-local"
                      value={paymentForm.paymentDate}
                      onChange={(e) =>
                        setPaymentForm((prev) => ({
                          ...prev,
                          paymentDate: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border px-3 py-2"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Boş bırakılırsa şu anki tarih kullanılır
                    </p>
                  </div>

                  {/*                   <div>
                    <label className="mb-1 block text-sm font-medium">
                      Ödeme Notu
                    </label>
                    <textarea
                      value={paymentForm.notes}
                      onChange={(e) =>
                        setPaymentForm((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full rounded-lg border px-3 py-2"
                      placeholder="Ödeme ile ilgili notlar..."
                    />
                  </div> */}

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentReservation(null);
                        setPaymentHistory([]);
                      }}
                      className="rounded-lg border px-4 py-2 hover:bg-gray-50"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !paymentForm.amount}
                      className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? "Ekleniyor..." : "Ödeme Ekle"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Move Date Modal */}
          {moveDateReservation && (
            <div
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 dark:bg-black/70"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setMoveDateReservation(null);
                }
              }}
            >
              <div className="w-full max-w-[95vw] card p-3 sm:p-4 md:p-6 mx-2 sm:mx-4 md:mx-0 sm:w-[400px] md:w-[500px]">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-base sm:text-lg font-semibold flex-1">
                    <span className="hidden sm:inline">
                      Tarih Değiştir - {moveDateReservation.customerName}
                    </span>
                    <span className="sm:hidden">
                      Tarih - {moveDateReservation.customerName}
                    </span>
                  </h3>
                  <button
                    onClick={() => setMoveDateReservation(null)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-slate-600 flex-shrink-0"
                    aria-label="Modalı kapat"
                  >
                    <LuX className="w-5 h-5 text-gray-600 dark:text-slate-300" />
                  </button>
                </div>

                <div className="mb-4 text-sm text-gray-600">
                  <div className="mb-2">
                    <strong>Mevcut Tarih:</strong>
                  </div>
                  <div className="pl-4">
                    <div>
                      Başlangıç:{" "}
                      {formatDisplayDateTime(moveDateReservation.startDate)}
                    </div>
                    <div>
                      Bitiş:{" "}
                      {formatDisplayDateTime(moveDateReservation.endDate)}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleMoveDateSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Yeni Başlangıç Tarihi *
                    </label>
                    <input
                      type="datetime-local"
                      value={moveDateForm.startDate}
                      onChange={(e) =>
                        setMoveDateForm((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                      required
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full rounded-lg border px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Yeni Bitiş Tarihi *
                    </label>
                    <input
                      type="datetime-local"
                      value={moveDateForm.endDate}
                      onChange={(e) =>
                        setMoveDateForm((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                      required
                      className="w-full rounded-lg border px-3 py-2"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setMoveDateReservation(null)}
                      className="rounded-lg border px-4 py-2 font-medium hover:bg-gray-100"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded-lg bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? "Güncelleniyor..." : "Tarihi Güncelle"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Salon Değiştir Modal */}
          {moveSalonReservation && (
            <div
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 dark:bg-black/70"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setMoveSalonReservation(null);
                }
              }}
            >
              <div className="w-full max-w-[95vw] card p-3 sm:p-4 md:p-6 mx-2 sm:mx-4 md:mx-0 sm:w-[400px] md:w-[500px]">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-base sm:text-lg font-semibold flex-1">
                    <span className="hidden sm:inline">
                      Salon Değiştir - {moveSalonReservation.customerName}
                    </span>
                    <span className="sm:hidden">
                      Salon - {moveSalonReservation.customerName}
                    </span>
                  </h3>
                  <button
                    onClick={() => setMoveSalonReservation(null)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-slate-600 flex-shrink-0"
                    aria-label="Modalı kapat"
                  >
                    <LuX className="w-5 h-5 text-gray-600 dark:text-slate-300" />
                  </button>
                </div>

                <div className="mb-4 text-sm text-gray-600 dark:text-slate-400">
                  <div className="mb-2">
                    <strong>Mevcut Bilgiler:</strong>
                  </div>
                  <div className="pl-4 space-y-1">
                    <div>
                      Salon: {getSalonName(moveSalonReservation.salonID)}
                    </div>
                    <div>
                      Başlangıç:{" "}
                      {formatDisplayDateTime(moveSalonReservation.startDate)}
                    </div>
                    <div>
                      Bitiş:{" "}
                      {formatDisplayDateTime(moveSalonReservation.endDate)}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleMoveSalonSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Yeni Salon *
                    </label>
                    <select
                      value={moveSalonForm.salonID}
                      onChange={(e) =>
                        setMoveSalonForm((prev) => ({
                          ...prev,
                          salonID: e.target.value,
                        }))
                      }
                      required
                      className="w-full rounded-lg border dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Salon Seçin</option>
                      {salons
                        .slice()
                        .sort((a, b) => a.id - b.id)
                        .map((salon) => (
                          <option key={salon.id} value={salon.id}>
                            {salon.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Yeni Başlangıç Tarihi *
                    </label>
                    <input
                      type="datetime-local"
                      value={moveSalonForm.startDate}
                      onChange={(e) =>
                        setMoveSalonForm((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                      required
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full rounded-lg border dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Yeni Bitiş Tarihi *
                    </label>
                    <input
                      type="datetime-local"
                      value={moveSalonForm.endDate}
                      onChange={(e) =>
                        setMoveSalonForm((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                      required
                      className="w-full rounded-lg border dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setMoveSalonReservation(null)}
                      className="rounded-lg border dark:border-slate-600 px-4 py-2 font-medium hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded-lg bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
                    >
                      {loading ? "Taşınıyor..." : "Salonu Değiştir"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
        {/* Date Picker Modal */}
        <DatePickerModal
          open={datePickerOpen}
          onClose={() => setDatePickerOpen(false)}
          onDateSelect={handleDateSelect}
          reservations={reservations}
          salonId={salonId}
          year={year}
          selectedMonth={selectedMonth}
          initialTime={(() => {
            if (!moveDateReservation) return undefined;
            const d = new Date(moveDateReservation.startDate);
            // Gösterilen saate -3 saat
            d.setHours(d.getHours() - 3);
            return d.toTimeString().slice(0, 5);
          })()}
        />
      </div>

      {/* Kayıtlı Müşteriler Modal - Sadece yetkisi olanlar görebilir */}
      {isCultureSalon && permissions.allowSavedCustomers && (
        <SavedCustomersModal
          open={savedCustomersModalOpen}
          onClose={() => setSavedCustomersModalOpen(false)}
          onSelectCustomer={handleSelectSavedCustomer}
          initialFormData={form}
        />
      )}
    </div>
  );
}

ReservationsListModal.propTypes = {
  open: PropTypes.bool,
  date: PropTypes.string,
  salonId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  status: PropTypes.string,
  onClose: PropTypes.func,
  onUpdated: PropTypes.func,
  onCreateNew: PropTypes.func,
  year: PropTypes.number,
  selectedMonth: PropTypes.number,
  onStartDateChange: PropTypes.func,
  dateChangeMode: PropTypes.bool,
  reservationToMove: PropTypes.object,
  onDateChangeComplete: PropTypes.func,
  onNavigateToCalendar: PropTypes.func,
  onStartSalonChange: PropTypes.func,
};
