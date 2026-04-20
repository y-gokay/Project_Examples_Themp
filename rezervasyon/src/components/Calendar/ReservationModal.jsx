import { useEffect, useState, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { LuX } from "react-icons/lu";
import toast from "react-hot-toast";
import {
  createReservation,
  getReservationsByDate,
  getSalons,
  createSavedCustomer,
} from "../../api/axios";
import SavedCustomersModal from "./SavedCustomersModal";
import { APP_CONSTANTS } from "../../utils/constants";
import { isDateInPast } from "../../utils/dateUtils";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";
import { formatErrorMessage } from "../../utils/errorTranslations";
import { isAdmin } from "../../utils/auth";
import { formatCurrency } from "../../utils/currency";
import { calculateSalonPrice } from "../../utils/salonPricing";
import {
  validateTC,
  validateTCOrTaxNumber,
  validatePhone,
  validateName,
  validateNumber,
  validateIBAN,
  validateBankName,
  validateAccountName,
  validateAddress,
} from "../../utils/validation";

const formatDateForDisplay = (dateString) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}.${month}.${year}`;
};
// Validation hata mesajı component'i
const ErrorMessage = ({ fieldName, validationErrors }) => {
  if (!validationErrors[fieldName]) return null;

  return (
    <p className="text-red-600 text-sm mt-1">{validationErrors[fieldName]}</p>
  );
};

export default function ReservationModal({
  open,
  date,
  salonId,
  onClose,
  onCreated,
}) {
  const user = useSelector((state) => state.auth.user);
  const isUserAdmin = isAdmin(user);

  // Permissions objesi
  const permissions = useMemo(() => {
    return isUserAdmin
      ? {
          allowAddReservation: true,
          allowEditReservation: true,
          allowGetPayment: true,
          allowKasa: true,
          allowSavedCustomers: true,
        }
      : {
          allowAddReservation:
            user?.permissions?.allowAddReservation ||
            user?.allowAddReservation ||
            false,
          allowEditReservation:
            user?.permissions?.allowEditReservation ||
            user?.allowEditReservation ||
            false,
          allowGetPayment:
            user?.permissions?.allowGetPayment ||
            user?.allowGetPayment ||
            false,
          allowKasa: user?.permissions?.allowKasa || user?.allowKasa || false,
          allowSavedCustomers:
            user?.permissions?.allowSavedCustomers ||
            user?.allowSavedCustomers ||
            false,
        };
  }, [isUserAdmin, user]);

  // Fiyat bilgilerini görme yetkisi kontrolü
  const canViewPriceInfo = useMemo(() => {
    return (
      (permissions.allowAddReservation && permissions.allowEditReservation) ||
      permissions.allowGetPayment ||
      permissions.allowKasa
    );
  }, [permissions]);

  const canCreateReservation = useMemo(() => {
    return (
      isAdmin(user) ||
      user?.permissions?.allowAddReservation ||
      user?.allowAddReservation ||
      false
    );
  }, [user]);

  const [loading, setLoading] = useState(false);
  const [, setDayReservations] = useState([]);
  const [salons, setSalons] = useState([]);
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [menuValidationErrors, setMenuValidationErrors] = useState({});
  const [savedCustomersModalOpen, setSavedCustomersModalOpen] = useState(false);
  const [savingCustomer, setSavingCustomer] = useState(false);

  // Body scroll'unu engelle
  useBodyScrollLock(open);

  // Modal açıldığında veya kapandığında savedCustomersModalOpen state'ini sıfırla
  useEffect(() => {
    if (!open) {
      setSavedCustomersModalOpen(false);
    }
  }, [open]);

  // ESC tuşu ile modalı kapat
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && open) {
        onClose?.();
      }
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [open, onClose]);

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerTc: "",
    secondaryPhone: "",
    orgOwnerName: "",
    orgName: "",
    vergiDairesi: "",
    address: "",
    accountName: "",
    bank: "",
    iban: "",
    eventType: "wedding",
    // Menü bilgileri - birden fazla menü için array
    menus: [],
    startDate: "",
    endDate: "",
    startTime: APP_CONSTANTS.DEFAULT_START_TIME,
    endTime: APP_CONSTANTS.DEFAULT_END_TIME,
    guestCount: "",
    salonPrice: "",
    paidAmount: "",
    discount: "",
    discountPercentage: "",
    paymentType: "cash",
    isInstallment: false,
    status: "preliminary",
    notes: "",
    salonID: "",
    // Wedding
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
    // Circumcision
    childName: "",
    childTc: "",
    childBirthDate: "",
    childAge: "",

    // Meeting
    meetingTitle: "",
    meetingDescription: "",
    // Henna s
    hennaPersonName: "",
    hennaTc: "",
    hennaBirthDate: "",
    // Other
    otherEventTitle: "",
    otherEventDescription: "",
    // Person Name (for other events)
    personName: "",
    // Additional
    hasPhotography: false,
    photographyPrice: "",
    hasDecoration: false,
    decorationPrice: "",
    hasMusic: false,
    musicPrice: "",
    isMessageActive: true,
    isContractSigned: false,
  });

  const isCultureSalon = selectedSalon?.type === "kultur";
  const cultureEventTypeValues = useMemo(
    () => APP_CONSTANTS.CULTURE_EVENT_TYPES?.map((type) => type.value) || [],
    []
  );
  const nonCultureEventTypes = useMemo(() => {
    const filtered = (APP_CONSTANTS.EVENT_TYPES || []).filter(
      (type) =>
        !(APP_CONSTANTS.CULTURE_EVENT_TYPES || []).some(
          (cultureType) => cultureType.value === type.value
        )
    );
    // Normal salonlar için "other" seçeneğini ekle (CULTURE_EVENT_TYPES içindeki "other" filtrelenmiş olabilir)
    const hasOther = filtered.some((et) => et.value === "other");
    if (!hasOther) {
      filtered.push({ value: "other", label: "Diğer" });
    }
    return filtered;
  }, []);
  const eventTypeOptions = isCultureSalon
    ? APP_CONSTANTS.CULTURE_EVENT_TYPES || []
    : nonCultureEventTypes;

  // Yükleme sırasında veya validation hatası varsa butonu kilitle
  const hasMenuErrors =
    !isCultureSalon && Object.keys(menuValidationErrors).length > 0;

  const disabled =
    loading || Object.keys(validationErrors).length > 0 || hasMenuErrors;

  useEffect(() => {
    if (!open || !date) return;

    // Geçmiş tarihe rezervasyon oluşturmayı engelle
    if (isDateInPast(date)) {
      return;
    }

    setForm({
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      customerTc: "",
      secondaryPhone: "",
      orgOwnerName: "",
      orgName: "",
      vergiDairesi: "",
      address: "",
      accountName: "",
      bank: "",
      iban: "",
      eventType: "wedding",
      // Menü bilgileri - birden fazla menü için array
      menus: [],
      startDate: date,
      endDate: date,
      startTime: APP_CONSTANTS.DEFAULT_START_TIME,
      endTime: APP_CONSTANTS.DEFAULT_END_TIME,
      guestCount: "",
      salonPrice: "",
      paidAmount: "",
      discount: "",
      discountPercentage: "",
      paymentType: "cash",
      isInstallment: false,
      status: "preliminary",
      notes: "",
      salonID: salonId || "",
      // Wedding
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
      // Circumcision
      childName: "",
      childTc: "",
      childBirthDate: "",
      // Meeting
      meetingTitle: "",
      meetingDescription: "",
      // Henna
      hennaPersonName: "",
      hennaTc: "",
      hennaBirthDate: "",
      // Other
      otherEventTitle: "",
      otherEventDescription: "",
      // Person Name (for other events)
      personName: "",
      // Services
      hasPhotography: false,
      photographyPrice: "",
      hasDecoration: false,
      decorationPrice: "",
      hasMusic: false,
      musicPrice: "",
      isContractSigned: false,
    });

    setSelectedSalon(null);
    setValidationErrors({});
    setMenuValidationErrors({});

    Promise.all([getReservationsByDate(date, salonId), getSalons()])
      .then(([reservationsRes, salonsRes]) => {
        setDayReservations(reservationsRes.data?.reservations || []);
        const salonsData = salonsRes.data?.salons || salonsRes.data || [];
        setSalons(Array.isArray(salonsData) ? salonsData : []);
      })
      .catch(() => {
        setDayReservations([]);
        setSalons([]);
        alert("Veriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.");
      })
      .finally(() => {});
  }, [open, date, salonId]);

  // Salon seçimi yapıldığında otomatik olarak salon bilgilerini güncelle
  useEffect(() => {
    if (form.salonID && salons.length > 0) {
      const salon = salons.find((item) => item.id === Number(form.salonID));
      if (salon) {
        setSelectedSalon(salon);

        setForm((prev) => {
          const updates = {};

          // Fiyat güncellemesi - dinamik fiyatlandırma varsa kullan
          if (salon.type === "dugun" && prev.startDate && prev.startTime && prev.eventType) {
            // Düğün salonunda dinamik fiyat hesapla
            const calculatedPrice = calculateSalonPrice(
              salon,
              prev.startDate,
              prev.startTime,
              prev.eventType
            );
            if (!prev.salonPrice || prev.salonPrice === "") {
              updates.salonPrice = calculatedPrice.toString();
              updates._priceAutoUpdated = salon.id; // Flag: bu salon için fiyat otomatik güncellendi
            }
          } else if (salon.defaultPrice && !prev.salonPrice) {
            // Kültür salonlarında veya dinamik fiyat hesaplanamıyorsa defaultPrice kullan
            const defaultPriceValue = Number(salon.defaultPrice) || 0;
            const displayPrice = salon.type === "kultur" && (defaultPriceValue === 1 || defaultPriceValue === 0.01) ? 0 : defaultPriceValue;
            updates.salonPrice = Math.floor(displayPrice).toString();
          }

          if (salon.defaultCapacity && !prev.guestCount) {
            updates.guestCount = salon.defaultCapacity.toString();
          }

          if (salon.type === "kultur") {
            const defaultCultureEventType =
              APP_CONSTANTS.CULTURE_EVENT_TYPES?.[0]?.value || "panel";
            if (!cultureEventTypeValues.includes(prev.eventType)) {
              updates.eventType = defaultCultureEventType;
            }
          } else if (
            cultureEventTypeValues.includes(prev.eventType) &&
            prev.eventType !== "wedding"
          ) {
            updates.eventType = "wedding";
            if (prev.orgName) {
              updates.orgName = "";
            }
            if (prev.orgOwnerName) {
              updates.orgOwnerName = "";
            }
            if (prev.address) {
              updates.address = "";
            }
            if (prev.accountName) {
              updates.accountName = "";
            }
            if (prev.bank) {
              updates.bank = "";
            }
            if (prev.iban) {
              updates.iban = "";
            }
          }

          if (Object.keys(updates).length === 0) {
            return prev;
          }

          return {
            ...prev,
            ...updates,
          };
        });
      }
    } else {
      setSelectedSalon(null);
    }
  }, [form.salonID, salons, cultureEventTypeValues]);

  // Tarih, saat, etkinlik türü veya salon değiştiğinde otomatik fiyat güncelleme
  useEffect(() => {
    // Sadece düğün salonları için dinamik fiyat hesapla
    if (selectedSalon?.type === "dugun" && form.startDate && form.startTime && form.eventType && form.salonID) {
      const calculatedPrice = calculateSalonPrice(
        selectedSalon,
        form.startDate,
        form.startTime,
        form.eventType
      );
      
      // Kullanıcı manuel olarak fiyat girmemişse veya salon değişmişse otomatik güncelle
      setForm((prev) => {
        // Eğer salon değişmişse veya fiyat otomatik güncellenmiş flag'i varsa güncelle
        if (prev._priceAutoUpdated === selectedSalon.id || !prev.salonPrice || prev.salonPrice === "") {
          return {
            ...prev,
            salonPrice: calculatedPrice.toString(),
            _priceAutoUpdated: selectedSalon.id, // Flag: bu salon için fiyat otomatik güncellendi
          };
        }
        return prev;
      });
    }
  }, [form.startDate, form.startTime, form.eventType, form.salonID, selectedSalon]);

  useEffect(() => {
    if (!isCultureSalon) {
      setValidationErrors((prev) => {
        if (
          !prev.orgName &&
          !prev.orgOwnerName &&
          !prev.secondaryPhone &&
          !prev.address &&
          !prev.accountName &&
          !prev.bank &&
          !prev.iban
        )
          return prev;
        const {
          orgName: _omitOrgName,
          orgOwnerName: _omitOrg,
          secondaryPhone: _omitPhone,
          address: _omitAddress,
          accountName: _omitAccountName,
          bank: _omitBank,
          iban: _omitIban,
          ...rest
        } = prev;
        return rest;
      });
    }
  }, [isCultureSalon]);

  useEffect(() => {
    if (isCultureSalon && form.menus.length > 0) {
      setForm((prev) => ({
        ...prev,
        menus: [],
      }));
      setMenuValidationErrors({});
    }
  }, [isCultureSalon, form.menus.length]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [open, onClose]);

  // Menü ekleme fonksiyonu
  const addMenu = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      menus: [
        ...prev.menus,
        {
          id: Date.now(), // Unique ID için timestamp
          name: "",
          price: "",
          unit: "",
          quantity: "",
        },
      ],
    }));
  }, []);

  // Menü çıkarma fonksiyonu
  const removeMenu = useCallback((menuId) => {
    setForm((prev) => ({
      ...prev,
      menus: prev.menus.filter((menu) => menu.id !== menuId),
    }));
    // Bu menüye ait validasyon hatalarını da temizle
    setMenuValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[menuId];
      return newErrors;
    });
  }, []);

  // Menü validasyon fonksiyonu
  const validateMenuField = useCallback((field, value) => {
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
        if (!value || value === "") {
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
        if (!value || value === "") {
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
  }, []);

  // Menü güncelleme fonksiyonu
  const updateMenu = useCallback(
    (menuId, field, value) => {
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
          menu.id === menuId ? { ...menu, [field]: value } : menu
        ),
      }));
    },
    [validateMenuField]
  );

  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;

      // Kültür salonlarında discountPercentage için maksimum 100 kontrolü
      let processedValue = value;
      if (name === "discountPercentage" && isCultureSalon && value) {
        const numValue = Number(value);
        if (!isNaN(numValue) && numValue > 100) {
          processedValue = "100";
        }
      }
      
      // Salon fiyatı için ondalık kısmı temizle (sadece tam sayı)
      if (name === "salonPrice" && value) {
        const numValue = Number(value);
        if (!isNaN(numValue)) {
          processedValue = Math.floor(numValue).toString();
        }
      }

      // Real-time validation
      let validationResult = { isValid: true, error: null };

      // TC validations
      if (
        ["customerTc", "groomTc", "brideTc", "childTc", "hennaTc"].includes(
          name
        )
      ) {
        // Kültür salonlarında TC/Vergi No validasyonu
        if (name === "customerTc" && isCultureSalon) {
          validationResult = validateTCOrTaxNumber(value);
        } else {
          validationResult = validateTC(value);
        }
      }
      // Phone validations
      else if (name === "customerPhone") {
        validationResult = validatePhone(value);
      } else if (name === "secondaryPhone") {
        if (isCultureSalon || value) {
          validationResult = validatePhone(value);
        } else {
          validationResult = { isValid: true, error: null };
        }
      }
      // Name validations
      else if (
        [
          "groomName",
          "brideName",
          "childName",
          "hennaPersonName",
          "groomFatherName",
          "groomMotherName",
          "brideFatherName",
          "brideMotherName",
        ].includes(name)
      ) {
        if (value) {
          // Only validate if not empty
          validationResult = validateName(value);
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
            validationResult = validateName(value);
          }
        }
      }
      // Other text fields
      else if (
        ["meetingTitle", "otherEventTitle", "orgOwnerName", "orgName"].includes(
          name
        )
      ) {
        if (value) {
          // Only validate if not empty
          validationResult = validateName(value);
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
      // Number validations
      else if (["guestCount"].includes(name)) {
        validationResult = validateNumber(value, 1);
      } else if (
        [
          "salonPrice",
          "paidAmount",
          "discount",
          "photographyPrice",
          "decorationPrice",
          "musicPrice",
        ].includes(name)
      ) {
        validationResult = validateNumber(value, 0);
      }

      // Update validation errors
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        if (!validationResult.isValid) {
          newErrors[name] = validationResult.error;
        } else {
          delete newErrors[name];
        }
        return newErrors;
      });

      setForm((p) => ({
        ...p,
        [name]: type === "checkbox" ? checked : processedValue,
      }));

      if (name === "salonID" && value) {
        // Salon bilgilerini güncelle
        const salon = salons.find((salon) => salon.id === Number(value));
        if (salon) {
          setSelectedSalon(salon);

          // Salon fiyatını otomatik doldur - dinamik fiyatlandırma varsa kullan
          if (salon.type === "dugun" && form.startDate && form.startTime && form.eventType) {
            // Düğün salonunda dinamik fiyat hesapla
            const calculatedPrice = calculateSalonPrice(
              salon,
              form.startDate,
              form.startTime,
              form.eventType
            );
            setForm((prev) => ({
              ...prev,
              salonPrice: calculatedPrice.toString(),
              _priceAutoUpdated: salon.id,
            }));
          } else if (salon.defaultPrice) {
            // Kültür salonlarında veya dinamik fiyat hesaplanamıyorsa defaultPrice kullan
            const defaultPriceValue = Number(salon.defaultPrice) || 0;
            const displayPrice = salon.type === "kultur" && (defaultPriceValue === 1 || defaultPriceValue === 0.01) ? 0 : defaultPriceValue;
            setForm((prev) => ({
              ...prev,
              salonPrice: Math.floor(displayPrice).toString(),
            }));
          }

          // Salon kapasitesini Salon Kapasitesina otomatik doldur
          if (salon.defaultCapacity) {
            setForm((prev) => ({
              ...prev,
              guestCount: salon.defaultCapacity.toString(),
            }));
          }
        }
      } else if ((name === "eventType" || name === "startTime" || name === "startDate") && selectedSalon?.type === "dugun") {
        // Düğün salonunda tarih/saat/eventType değiştiğinde dinamik fiyat güncelle
        const newEventType = name === "eventType" ? processedValue : form.eventType;
        const newStartTime = name === "startTime" ? processedValue : form.startTime;
        const newStartDate = name === "startDate" ? processedValue : form.startDate;
        
        if (newStartDate && newStartTime && newEventType) {
          const calculatedPrice = calculateSalonPrice(
            selectedSalon,
            newStartDate,
            newStartTime,
            newEventType
          );
          
          // Fiyatı otomatik güncelle (kullanıcı manuel girmediyse veya salon için flag varsa)
          setForm((prev) => {
            if (prev._priceAutoUpdated === selectedSalon.id || !prev.salonPrice || prev.salonPrice === "") {
              return {
                ...prev,
                [name]: type === "checkbox" ? checked : processedValue,
                salonPrice: calculatedPrice.toString(),
                _priceAutoUpdated: selectedSalon.id,
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
    },
    [salons, isCultureSalon]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation kontrolü - Hata varsa submit etme
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Lütfen formdaki hataları düzeltin");
      return;
    }

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

    // Zorunlu alanları kontrol et
    const errors = {};
    if (!form.customerName || !form.customerName.trim())
      errors.customerName = isCultureSalon
        ? "Müşteri / Firma adı zorunludur"
        : "Müşteri adı zorunludur";
    if (!form.customerPhone || !form.customerPhone.trim())
      errors.customerPhone = "Telefon numarası zorunludur";
    if (!form.salonID) errors.salonID = "Salon seçimi zorunludur";
    if (!form.eventType) errors.eventType = "Etkinlik türü zorunludur";

    // TC/Vergi No validasyonu
    if (form.customerTc && form.customerTc.trim()) {
      if (isCultureSalon) {
        const tcValidation = validateTCOrTaxNumber(form.customerTc);
        if (!tcValidation.isValid) {
          errors.customerTc = tcValidation.error;
        }
      } else {
        const tcValidation = validateTC(form.customerTc);
        if (!tcValidation.isValid) {
          errors.customerTc = tcValidation.error;
        }
      }
    }

    // Event type'a göre özel validasyonlar
    if (
      form.eventType === "wedding" ||
      form.eventType === "engagement" ||
      form.eventType === "nikah"
    ) {
      if (!form.groomName || !form.groomName.trim())
        errors.groomName = "Damat adı zorunludur";
      if (!form.brideName || !form.brideName.trim())
        errors.brideName = "Gelin adı zorunludur";

      // Wedding, engagement, nikah ve henna için anne-baba adları zorunlu
      if (
        form.eventType === "wedding" ||
        form.eventType === "engagement" ||
        form.eventType === "nikah" ||
        form.eventType === "henna"
      ) {
        if (!form.groomFatherName || !form.groomFatherName.trim())
          errors.groomFatherName = "Damat baba adı zorunludur";
        if (!form.groomMotherName || !form.groomMotherName.trim())
          errors.groomMotherName = "Damat anne adı zorunludur";
        if (!form.brideFatherName || !form.brideFatherName.trim())
          errors.brideFatherName = "Gelin baba adı zorunludur";
        if (!form.brideMotherName || !form.brideMotherName.trim())
          errors.brideMotherName = "Gelin anne adı zorunludur";
      }
    } else if (form.eventType === "circumcision") {
      if (!form.childName || !form.childName.trim())
        errors.childName = "Çocuk adı zorunludur";
    } else if (form.eventType === "henna") {
      if (!form.groomName || !form.groomName.trim())
        errors.groomName = "Damat adı zorunludur";
      if (!form.brideName || !form.brideName.trim())
        errors.brideName = "Gelin adı zorunludur";
    } else if (form.eventType === "meeting") {
      if (!form.meetingTitle || !form.meetingTitle.trim())
        errors.meetingTitle = "Toplantı başlığı zorunludur";
    } else if (form.eventType === "other" && !isCultureSalon) {
      // Normal salonlar için diğer etkinlik türü
      if (!form.otherEventTitle || !form.otherEventTitle.trim())
        errors.otherEventTitle = "Etkinlik başlığı zorunludur";
    }

    if (isCultureSalon) {
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
    }

    // Salon fiyatı kontrolü - Kültür salonlarında 0 değerine izin ver
    const salonPriceValue = Number(form.salonPrice) || 0;
    if (isCultureSalon) {
      // Kültür salonlarında 0 veya pozitif değer kabul edilir
      if (salonPriceValue < 0) {
        errors.salonPrice = "Salon fiyatı negatif olamaz";
      }
    } else {
      // Normal salonlarda pozitif değer zorunlu
      if (!form.salonPrice || salonPriceValue <= 0) {
      errors.salonPrice = "Salon fiyatı girilmelidir";
      }
    }

    // Müşteri sayısı kontrolü
    if (!form.guestCount || Number(form.guestCount) <= 0) {
      errors.guestCount = "Müşteri sayısı girilmelidir";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error("Lütfen formdaki hataları düzeltin");
      return;
    }

    // Clear validation errors before submit
    setValidationErrors({});

    const dateTimeString = `${form.endDate}T${form.endTime}:00`; // "2025-10-21T18:00:00"
    const dateTimeString2 = `${form.startDate}T${form.startTime}:00`; // "2025-10-21T18:00:00"

    // Date nesnesi oluştur
    const startDateTime = new Date(dateTimeString2);
    const endDateTime = new Date(dateTimeString);
    // Eğer bitiş saati başlangıç saatinden küçükse, bir sonraki güne taşı (overnight)
    if (endDateTime < startDateTime) {
      endDateTime.setDate(endDateTime.getDate() + 1);
    }

    // Backend UTC+3 beklediği için +3 saat ekle
    startDateTime.setHours(startDateTime.getHours() + 3);
    endDateTime.setHours(endDateTime.getHours() + 3);

    // console.log(form);
    // Tarih validasyonu
    // if (new Date(form.startDate) > new Date(form.endDate)) {
    //   setValidationErrors({
    //     endDate: "Bitiş tarihi başlangıç tarihinden sonra olmalıdır.",
    //   });
    //   return;
    // }

    // // Aynı gün ise saat validasyonu
    // if (form.startDate === form.endDate && form.startTime >= form.endTime) {
    //   setValidationErrors({
    //     endTime: "Bitiş saati başlangıç saatinden sonra olmalıdır.",
    //   });
    //   return;
    // }

    if (!canCreateReservation) {
      toast.error("Rezervasyon oluşturma yetkiniz bulunmamaktadır", {
        duration: 3000,
      });
      return;
    }

    try {
      setLoading(true);

      const salonPrice = Number(form.salonPrice) || 0;
      const photographyPrice = form.hasPhotography
        ? Number(form.photographyPrice) || 0
        : 0;
      const decorationPrice = form.hasDecoration
        ? Number(form.decorationPrice) || 0
        : 0;
      const musicPrice = form.hasMusic ? Number(form.musicPrice) || 0 : 0;
      const menuPrice = isCultureSalon
        ? 0
        : form.menus.reduce((total, menu) => {
            const price = Number(menu.price) || 0;
            const quantity = Number(menu.quantity) || 0;
            return total + price * quantity;
          }, 0);

      // Kültür salonlarında salonPrice 0 ise backend'e 1 gönder
      // Ancak kullanıcıya gösterilen ve hesaplamalarda kullanılan fiyat 0 kalmalı
      const finalSalonPrice = isCultureSalon && salonPrice === 0 ? 1 : salonPrice;

      const totalPrice =
        salonPrice +
        photographyPrice +
        decorationPrice +
        musicPrice +
        menuPrice;
      const paidAmount = Number(form.paidAmount) || 0;

      // Kültür salonlarında indirim yüzdesi, diğerlerinde TL cinsinden
      // Kültür salonlarında indirim sadece salon fiyatına uygulanır
      let discount = 0;
      if (isCultureSalon && form.discountPercentage) {
        const discountPercent = Number(form.discountPercentage) || 0;
        discount = (salonPrice * discountPercent) / 100;
      } else {
        discount = Number(form.discount) || 0;
      }

      // Kalan fiyat kontrolü: (Toplam Fiyat) - (Ödenen + İndirim) >= 0
      const remainingAmount = totalPrice - paidAmount - discount;

      if (remainingAmount < 0) {
        toast.error(
          `Ödenen tutar (${formatCurrency(
            paidAmount,
            false
          )}) ve indirim (${formatCurrency(
            discount,
            false
          )}) toplamı, toplam fiyattan (${formatCurrency(
            totalPrice,
            false
          )}) fazla olamaz! Kalan: ${formatCurrency(remainingAmount, false)}`,
          { duration: 5000 }
        );
        setLoading(false);
        return;
      }

      // const startDate = new Date(form.startDate);
      // const endDate = new Date(form.endDate);
      // startDate.setHours(startDate.getHours() + 3);
      // endDate.setHours(endDate.getHours() + 3);

      const payload = {
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerTc: form.customerTc,
        eventType: form.eventType,
        startDate: startDateTime,
        endDate: endDateTime,
        guestCount: Number(form.guestCount) || 0,
        salonPrice: Number(finalSalonPrice) || 0,
        paidAmount: Number(paidAmount) || 0,
        discount: Number(discount) || 0,
        paymentType: form.paymentType || "cash",
        remainingAmount: remainingAmount,
        isInstallment: form.isInstallment,
        status: form.status,
        salonID: Number(form.salonID) || 1,
        totalPrice: Number(totalPrice) || 0,

        hasPhotography: form.hasPhotography,
        photographyPrice: Number(photographyPrice) || 0,
        hasDecoration: form.hasDecoration,
        decorationPrice: Number(decorationPrice) || 0,
        hasMusic: form.hasMusic,
        musicPrice: Number(musicPrice) || 0,

        // Menü bilgileri - backend formatına uygun
        selectedMenus: isCultureSalon
          ? []
          : form.menus.map((menu) => {
              const price = Number(menu.price) || 0;
              const quantity = Number(menu.quantity) || 0;
              return {
                menuName: menu.name,
                quantity: quantity,
                totalPrice: price * quantity, // Birim fiyat * adet = toplam fiyat
                unit: menu.unit,
              };
            }),
        menuPrice: isCultureSalon ? 0 : Number(menuPrice) || 0,
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

      // Sadece not varsa ekle
      if (form.notes && form.notes.trim()) {
        payload.notes = form.notes;
      }

      // Mesaj aktifliği
      payload.isMessageActive = form.isMessageActive;

      if (isCultureSalon) {
        if (form.orgName && form.orgName.trim()) {
          payload.orgName = form.orgName.trim();
        }
        if (form.orgOwnerName && form.orgOwnerName.trim()) {
          payload.orgOwnerName = form.orgOwnerName.trim();
        }
        if (form.vergiDairesi && form.vergiDairesi.trim()) {
          payload.vergiDairesi = form.vergiDairesi.trim();
        }
        if (form.address && form.address.trim()) {
          payload.address = form.address.trim();
        }
        if (form.accountName && form.accountName.trim()) {
          payload.accountName = form.accountName.trim();
        }
        if (form.bank && form.bank.trim()) {
          payload.bank = form.bank.trim();
        }
        if (form.iban && form.iban.trim()) {
          payload.iban = form.iban.trim();
        }
      }

      payload.isContractSigned = Boolean(form.isContractSigned);

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

        payload.childAge = Number(form.childAge) || 0;
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

      await createReservation(payload);
      setValidationErrors({});
      setMenuValidationErrors({});
      toast.success("Rezervasyon başarıyla oluşturuldu!");
      onCreated?.();
      onClose?.();
    } catch (err) {
      toast.error(formatErrorMessage(err, "Rezervasyon oluşturulamadı"));
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

  const ErrorMessage = useCallback(
    ({ fieldName }) => {
      if (!validationErrors[fieldName]) return null;
      return (
        <div className="mt-1 text-sm text-red-600 flex items-center">
          <svg
            className="w-4 h-4 mr-1 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
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

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60"
      // onClick={handleOverlayClick}
    >
      <div className="card w-full max-w-[95vw] max-h-[90vh] overflow-y-auto p-3 sm:p-4 md:p-6 mx-2 sm:mx-4 md:mx-0 sm:w-[600px] md:w-[700px] lg:w-[800px]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg sm:text-xl font-semibold flex-1">
            <span className="hidden sm:inline">
              {formatDateForDisplay(date)} - Rezervasyon Oluştur
            </span>
            <span className="sm:hidden">Yeni Rezervasyon – {date}</span>
          </h3>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-slate-600"
            aria-label="Modalı kapat"
          >
            <LuX className="w-5 h-5 text-gray-600 dark:text-slate-300" />
          </button>
        </div>

        {/* Geçmiş tarih uyarısı */}
        {validationErrors.date && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-400 dark:text-red-300 mr-2 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-red-700 dark:text-red-200 font-medium">
                {validationErrors.date}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          {/* Temel Bilgiler */}
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
                      {savingCustomer ? "Kaydediliyor..." : "Müşteriyi Kaydet"}
                    </button>
                  </div>
                )}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* 1. Organizasyon İsmi - Tam Genişlik */}
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium">
                      Organizasyon İsmi *
                    </label>
                    <input
                      name="orgName"
                      value={form.orgName}
                      onChange={handleChange}
                      required
                      className={`input ${
                        validationErrors.orgName ? "input-error" : ""
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
                      className={`input ${
                        validationErrors.customerName ? "input-error" : ""
                      }`}
                      placeholder="Müşteri / Firma Adı"
                    />
                    <ErrorMessage
                      fieldName="customerName"
                      validationErrors={validationErrors}
                    />
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
                      className={`input ${
                        validationErrors.customerPhone ? "input-error" : ""
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
                      className={`input ${
                        validationErrors.vergiDairesi ? "input-error" : ""
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
                      type="text"
                      value={form.customerTc}
                      onChange={handleChange}
                      required
                      className={`input ${
                        validationErrors.customerTc ? "input-error" : ""
                      }`}
                      placeholder="TC No (11 haneli) veya Vergi No (10 haneli)"
                    />
                    <ErrorMessage fieldName="customerTc" />
                  </div>
                  {/* Organizasyon Sahibi Adı (Sol) ve Organizasyon Sahibi Tel No (Sağ) */}
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Organizasyon Yekilisi Adı *
                    </label>
                    <input
                      name="orgOwnerName"
                      value={form.orgOwnerName}
                      onChange={handleChange}
                      required
                      className={`input ${
                        validationErrors.orgOwnerName ? "input-error" : ""
                      }`}
                      placeholder="Organizasyon Yekilisi Adı"
                    />
                    <ErrorMessage fieldName="orgOwnerName" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Organizasyon Yekilisi Tel No *
                    </label>
                    <input
                      name="secondaryPhone"
                      type="tel"
                      value={form.secondaryPhone}
                      onChange={handleChange}
                      required
                      className={`input ${
                        validationErrors.secondaryPhone ? "input-error" : ""
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
                      className={`input ${
                        validationErrors.address ? "input-error" : ""
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
                      className={`input ${
                        validationErrors.customerEmail ? "input-error" : ""
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
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Müşteri Banka Adı (Sol) ve Müşteri Hesap Adı (Sağ) */}
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Müşteri Banka Adı
                      </label>
                      <input
                        name="bank"
                        value={form.bank}
                        onChange={handleChange}
                        className={`input ${
                          validationErrors.bank ? "input-error" : ""
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
                        className={`input ${
                          validationErrors.accountName ? "input-error" : ""
                        }`}
                        placeholder="Hesap Adı"
                      />
                      <ErrorMessage fieldName="accountName" />
                    </div>
                    {/* Müşteri IBAN - Tam Genişlik */}
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-sm font-medium">
                        Müşteri IBAN
                      </label>
                      <input
                        name="iban"
                        value={form.iban}
                        onChange={handleChange}
                        className={`input ${
                          validationErrors.iban ? "input-error" : ""
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
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Başlangıç Saati (Sol) ve Bitiş Saati (Sağ) */}
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Başlangıç Saati *
                      </label>
                      <input
                        name="startTime"
                        type="time"
                        value={form.startTime}
                        onChange={handleChange}
                        required
                        className={`input ${
                          validationErrors.startTime ? "input-error" : ""
                        }`}
                      />
                      <ErrorMessage fieldName="startTime" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Bitiş Saati *
                      </label>
                      <input
                        name="endTime"
                        type="time"
                        value={form.endTime}
                        onChange={handleChange}
                        required
                        className={`input ${
                          validationErrors.endTime ? "input-error" : ""
                        }`}
                      />
                      <ErrorMessage fieldName="endTime" />
                    </div>

                    {/* Salon (Sol) ve Etkinlik Türü (Sağ) */}
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Salon *
                      </label>
                      <select
                        name="salonID"
                        value={form.salonID}
                        onChange={handleChange}
                        required
                        className={`input ${
                          validationErrors.salonID ? "input-error" : ""
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
                        className="input"
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
                            className={`input ${
                              validationErrors.guestCount ? "input-error" : ""
                            }`}
                            placeholder="200"
                          />
                          <ErrorMessage fieldName="guestCount" />
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
                            className={`input ${
                              validationErrors.otherEventTitle
                                ? "input-error"
                                : ""
                            }`}
                            placeholder="Etkinlik türünü giriniz"
                          />
                          <ErrorMessage fieldName="otherEventTitle" />
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
                          className={`input ${
                            validationErrors.guestCount ? "input-error" : ""
                          }`}
                          placeholder="200"
                        />
                        <ErrorMessage fieldName="guestCount" />
                      </div>
                    )}

                    {/* Salon Fiyatı (Sol) ve İndirim (Sağ) */}
                    {canViewPriceInfo && (
                      <>
                        <div>
                          <label className="mb-1 block text-sm font-medium">
                            Salon Fiyatı (₺) *
                          </label>
                          <input
                            name="salonPrice"
                            type="number"
                            inputMode="numeric"
                            min="0"
                            step="1"
                            value={form.salonPrice ? Math.floor(Number(form.salonPrice)).toString() : ""}
                            onChange={handleChange}
                            className={`input ${
                              validationErrors.salonPrice ? "input-error" : ""
                            }`}
                            placeholder="50000"
                          />
                          <ErrorMessage fieldName="salonPrice" />
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
                                      Number(form.discountPercentage) || 0;
                                    const calculatedDiscount =
                                      (salonPrice * discountPercent) / 100;
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
                            className="input"
                            placeholder="10"
                          />
                        </div>
                      </>
                    )}

                    {/* Notlar - Tam Genişlik */}
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-sm font-medium">
                        Notlar
                      </label>
                      <textarea
                        name="notes"
                        value={form.notes}
                        onChange={handleChange}
                        rows={3}
                        className="input"
                        placeholder="Ek detaylar…"
                      />
                    </div>

                    {/* Checkboxlar - Tam Genişlik */}
                    <div className="sm:col-span-2 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
                      <label
                        htmlFor="isContractSigned"
                        className="flex items-center gap-2 text-sm font-medium cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          id="isContractSigned"
                          name="isContractSigned"
                          checked={form.isContractSigned}
                          onChange={handleChange}
                          className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-700"
                        />
                        Sözleşme İmzalandı
                      </label>
                      <label
                        htmlFor="isMessageActive"
                        className="flex items-center gap-2 text-sm font-medium cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          id="isMessageActive"
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                    className={`input ${
                      validationErrors.customerName ? "input-error" : ""
                    }`}
                    placeholder="Ad Soyad"
                  />
                  <ErrorMessage
                    fieldName="customerName"
                    validationErrors={validationErrors}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    TC No *
                  </label>
                  <input
                    name="customerTc"
                    type="text"
                    value={form.customerTc}
                    onChange={handleChange}
                    required
                    className={`input ${
                      validationErrors.customerTc ? "input-error" : ""
                    }`}
                    placeholder="44455566677"
                  />
                  <ErrorMessage fieldName="customerTc" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Telefon *
                  </label>
                  <input
                    name="customerPhone"
                    value={form.customerPhone}
                    onChange={handleChange}
                    required
                    className={`input ${
                      validationErrors.customerPhone ? "input-error" : ""
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
                    type="tel"
                    value={form.secondaryPhone}
                    onChange={handleChange}
                    className={`input ${
                      validationErrors.secondaryPhone ? "input-error" : ""
                    }`}
                    placeholder="05xxxxxxxxx"
                  />
                  <ErrorMessage fieldName="secondaryPhone" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    E-posta
                  </label>
                  <input
                    name="customerEmail"
                    type="email"
                    value={form.customerEmail}
                    onChange={handleChange}
                    className={`input ${
                      validationErrors.customerEmail ? "input-error" : ""
                    }`}
                    placeholder="email@example.com"
                  />
                  <ErrorMessage fieldName="customerEmail" />
                </div>
              </div>
            </>
          )}

          {/* Normal salonlar için Saat Seçimi, Salon, Etkinlik Türü, Salon Kapasitesi */}
          {!isCultureSalon && (
            <>
              {/* Sözleşme ve Mesaj Bilgileri */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
                <label
                  htmlFor="isMessageActive"
                  className="flex items-center gap-2 text-sm font-medium cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    id="isMessageActive"
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

              {/* Saat Seçimi */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Başlangıç Saati *
                  </label>
                  <input
                    name="startTime"
                    type="time"
                    value={form.startTime}
                    onChange={handleChange}
                    required
                    className={`input ${
                      validationErrors.startTime ? "input-error" : ""
                    }`}
                  />
                  <ErrorMessage fieldName="startTime" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Bitiş Saati *
                  </label>
                  <input
                    name="endTime"
                    type="time"
                    value={form.endTime}
                    onChange={handleChange}
                    required
                    className={`input ${
                      validationErrors.endTime ? "input-error" : ""
                    }`}
                  />
                  <ErrorMessage fieldName="endTime" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Salon *
                  </label>
                  <select
                    name="salonID"
                    value={form.salonID}
                    onChange={handleChange}
                    required
                    className={`input ${
                      validationErrors.salonID ? "input-error" : ""
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
                    className="input"
                  >
                    {eventTypeOptions.map((type) => (
                      <option value={type.value} key={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Normal salonlar için Salon Kapasitesi */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                    className={`input ${
                      validationErrors.guestCount ? "input-error" : ""
                    }`}
                    placeholder="200"
                  />
                  <ErrorMessage fieldName="guestCount" />
                </div>
              </div>
            </>
          )}

          {!isCultureSalon && (
            <>
              {/* Etkinlik Türüne Özel Alanlar */}
              {(form.eventType === "wedding" ||
                form.eventType === "engagement" ||
                form.eventType === "nikah" ||
                form.eventType === "henna") && (
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                  <h4 className="mb-3 font-medium text-slate-900 dark:text-slate-100">
                    {form.eventType === "wedding"
                      ? "Düğün Detayları"
                      : form.eventType === "engagement"
                      ? "Nişan Detayları"
                      : form.eventType === "nikah"
                      ? "Nikah Detayları"
                      : "Kına Detayları"}
                  </h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Damat Adı *
                      </label>
                      <input
                        name="groomName"
                        value={form.groomName}
                        onChange={handleChange}
                        required
                        className={`input ${
                          validationErrors.groomName ? "input-error" : ""
                        }`}
                        placeholder="Damat adı soyadı"
                      />
                      <ErrorMessage fieldName="groomName" />
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
                        className={`input ${
                          validationErrors.brideName ? "input-error" : ""
                        }`}
                        placeholder="Gelin adı soyadı"
                      />
                      <ErrorMessage fieldName="brideName" />
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
                        className={`input ${
                          validationErrors.groomFatherName ? "input-error" : ""
                        }`}
                        placeholder="Damat baba adı"
                      />
                      <ErrorMessage fieldName="groomFatherName" />
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
                        className={`input ${
                          validationErrors.brideFatherName ? "input-error" : ""
                        }`}
                        placeholder="Gelin baba adı"
                      />
                      <ErrorMessage fieldName="brideFatherName" />
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
                        className={`input ${
                          validationErrors.groomMotherName ? "input-error" : ""
                        }`}
                        placeholder="Damat anne adı"
                      />
                      <ErrorMessage fieldName="groomMotherName" />
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
                        className={`input ${
                          validationErrors.brideMotherName ? "input-error" : ""
                        }`}
                        placeholder="Gelin anne adı"
                      />
                      <ErrorMessage fieldName="brideMotherName" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Damat TC
                      </label>
                      <input
                        name="groomTc"
                        value={form.groomTc}
                        onChange={handleChange}
                        className={`input ${
                          validationErrors.groomTc ? "input-error" : ""
                        }`}
                        placeholder="12345678901"
                      />
                      <ErrorMessage fieldName="groomTc" />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Gelin TC
                      </label>
                      <input
                        name="brideTc"
                        value={form.brideTc}
                        onChange={handleChange}
                        className={`input ${
                          validationErrors.brideTc ? "input-error" : ""
                        }`}
                        placeholder="98765432109"
                      />
                      <ErrorMessage fieldName="brideTc" />
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
                        className={`input ${
                          validationErrors.groomBirthDate ? "input-error" : ""
                        }`}
                      />
                      <ErrorMessage fieldName="groomBirthDate" />
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
                        className="input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {form.eventType === "circumcision" && (
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                  <h4 className="mb-3 font-medium text-slate-900 dark:text-slate-100">
                    Sünnet Detayları
                  </h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Çocuk Adı *
                      </label>
                      <input
                        name="childName"
                        value={form.childName}
                        onChange={handleChange}
                        required
                        className={`input ${
                          validationErrors.childName ? "input-error" : ""
                        }`}
                        placeholder="Çocuk adı soyadı"
                      />
                      <ErrorMessage fieldName="childName" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Çocuk TC
                      </label>
                      <input
                        name="childTc"
                        value={form.childTc}
                        onChange={handleChange}
                        className={`input ${
                          validationErrors.childTc ? "input-error" : ""
                        }`}
                        placeholder="12345678901"
                      />
                      <ErrorMessage fieldName="childTc" />
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
                        className={`input ${
                          validationErrors.childBirthDate ? "input-error" : ""
                        }`}
                      />
                      <ErrorMessage fieldName="childBirthDate" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Çocuk Yaşı
                      </label>
                      <input
                        name="childAge"
                        type="number"
                        min="1"
                        max="18"
                        value={form.childAge}
                        onChange={handleChange}
                        className={`input ${
                          validationErrors.childAge ? "input-error" : ""
                        }`}
                        placeholder="7"
                      />
                      <ErrorMessage fieldName="childAge" />
                    </div>
                  </div>
                </div>
              )}

              {form.eventType === "meeting" && (
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                  <h4 className="mb-3 font-medium text-slate-900 dark:text-slate-100">
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
                        className={`input ${
                          validationErrors.meetingTitle ? "input-error" : ""
                        }`}
                        placeholder="Toplantı başlığı"
                      />
                      <ErrorMessage fieldName="meetingTitle" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Toplantı Açıklaması
                      </label>
                      <textarea
                        name="meetingDescription"
                        value={form.meetingDescription}
                        onChange={handleChange}
                        className="input"
                        rows={3}
                        placeholder="Toplantı açıklaması"
                      />
                    </div>
                  </div>
                </div>
              )}

              {form.eventType === "other" && !isCultureSalon && (
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                  <h4 className="mb-3 font-medium text-slate-900 dark:text-slate-100">
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
                        className={`input ${
                          validationErrors.otherEventTitle ? "input-error" : ""
                        }`}
                        placeholder="Etkinlik başlığı"
                      />
                      <ErrorMessage fieldName="otherEventTitle" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Kişi Adı
                      </label>
                      <input
                        name="personName"
                        value={form.personName}
                        onChange={handleChange}
                        className={`input ${
                          validationErrors.personName ? "input-error" : ""
                        }`}
                        placeholder="Kişi adı soyadı"
                      />
                      <ErrorMessage fieldName="personName" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Etkinlik Açıklaması
                      </label>
                      <textarea
                        name="otherEventDescription"
                        value={form.otherEventDescription}
                        onChange={handleChange}
                        className="input"
                        rows={3}
                        placeholder="Etkinlik açıklaması"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Ek Hizmetler */}
          {/*           
          <div className="rounded-lg border p-4">
            <h4 className="mb-3 font-medium">Ek Hizmetler</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="hasPhotography"
                    checked={form.hasPhotography}
                    onChange={handleChange}
                    className="rounded"
                  />
                  Fotoğrafçılık
                </label>
                {form.hasPhotography && (
                  <input
                    type="number"
                    name="photographyPrice"
                    value={form.photographyPrice}
                    onChange={handleChange}
                    className="w-32 rounded border px-2 py-1"
                    placeholder="Price"
                  />
                )}
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="hasDecoration"
                    checked={form.hasDecoration}
                    onChange={handleChange}
                    className="rounded"
                  />
                  Dekorasyon
                </label>
                {form.hasDecoration && (
                  <input
                    type="number"
                    name="decorationPrice"
                    value={form.decorationPrice}
                    onChange={handleChange}
                    className="w-32 rounded border px-2 py-1"
                    placeholder="Price"
                  />
                )}
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="hasMusic"
                    checked={form.hasMusic}
                    onChange={handleChange}
                    className="rounded"
                  />
                  Müzik
                </label>
                {form.hasMusic && (
                  <input
                    type="number"
                    name="musicPrice"
                    value={form.musicPrice}
                    onChange={handleChange}
                    className="w-32 rounded border px-2 py-1"
                    placeholder="Price"
                  />
                )}
              </div>
            </div>
          </div> */}

          {/* Menü Bilgileri */}
          {!isCultureSalon && (
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="font-medium text-slate-900 dark:text-slate-100">
                  Menü Bilgileri
                </h4>
                <button
                  type="button"
                  onClick={addMenu}
                  className="btn-secondary text-sm"
                >
                  + Menü Ekle
                </button>
              </div>

              {form.menus.length === 0 ? (
                <div className="text-center py-4 text-gray-500 dark:text-slate-400">
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
                      className="border border-slate-200 dark:border-slate-600 rounded-lg p-4 bg-gray-50 dark:bg-slate-700"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-sm text-slate-900 dark:text-slate-100">
                          Menü {index + 1}
                        </h5>
                        <button
                          type="button"
                          onClick={() => removeMenu(menu.id)}
                          className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm"
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
                              updateMenu(menu.id, "name", e.target.value)
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
                              updateMenu(menu.id, "price", e.target.value)
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
                              updateMenu(menu.id, "quantity", e.target.value)
                            }
                            className={`input ${
                              menuValidationErrors[menu.id]?.quantity
                                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                : ""
                            }`}
                            placeholder="1"
                          />
                          {menuValidationErrors[menu.id]?.quantity && (
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
                              updateMenu(menu.id, "unit", e.target.value)
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
                    </div>
                  ))}
                </div>
              )}

              {form.menus.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm text-slate-900 dark:text-slate-100">
                      Toplam Menü Fiyatı:
                    </span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(
                        form.menus.reduce((total, menu) => {
                          const price = Number(menu.price) || 0;
                          return total + price; // Toplam fiyat
                        }, 0),
                        true
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Normal salonlar için Fiyatlandırma ve Notlar */}
          {!isCultureSalon && (
            <>
              {/* Fiyatlandırma */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {canViewPriceInfo && (
                  <>
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Salon Fiyatı (₺) *
                      </label>
                      <input
                        name="salonPrice"
                        type="number"
                        inputMode="numeric"
                        min="0"
                        step="1"
                        value={form.salonPrice ? Math.floor(Number(form.salonPrice)).toString() : ""}
                        onChange={handleChange}
                        className={`input ${
                          validationErrors.salonPrice ? "input-error" : ""
                        }`}
                        placeholder="50000"
                      />
                      <ErrorMessage fieldName="salonPrice" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        İndirim (₺)
                      </label>
                      <input
                        name="discount"
                        type="number"
                        inputMode="numeric"
                        min="0"
                        step="1"
                        value={form.discount}
                        onChange={handleChange}
                        className="input"
                        placeholder="10000"
                      />
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Notlar</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  className="input"
                  placeholder="Ek detaylar…"
                />
              </div>
            </>
          )}

          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 w-full sm:w-auto"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={disabled}
              className="btn-primary font-medium disabled:cursor-not-allowed disabled:opacity-60 w-full sm:w-auto"
            >
              <span className="hidden sm:inline">
                {loading ? "Kaydediliyor…" : "Rezervasyon Oluştur"}
              </span>
              <span className="sm:hidden">
                {loading ? "Kaydediliyor…" : "Oluştur"}
              </span>
            </button>
          </div>
        </form>
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

ReservationModal.propTypes = {
  open: PropTypes.bool,
  date: PropTypes.string,
  salonId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onClose: PropTypes.func,
  onCreated: PropTypes.func,
};
