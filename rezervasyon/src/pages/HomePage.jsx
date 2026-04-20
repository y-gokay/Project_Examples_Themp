import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  lazy,
  Suspense,
} from "react";
import toast, { Toaster } from "react-hot-toast";
import YearCalendar from "../components/Calendar/YearCalendar";
import ReservationModal from "../components/Calendar/ReservationModal";
import ReservationsListModal from "../components/Calendar/ReservationsListModal";
import TodayEvents from "../components/TodayEvents/TodayEvents";
import SearchModal from "../components/SearchModal";
import Header from "../components/Header/Header";
import Navbar from "../components/Navbar/Navbar";
import { isDateInPast } from "../utils/dateUtils";

const SalonList = lazy(() => import("../components/SalonManagement/SalonList"));
const UpcomingEvents = lazy(() =>
  import("../components/UpcomingEvents/UpcomingEvents")
);
const UserList = lazy(() => import("../components/UserManagement/UserList"));
const CashManagement = lazy(() =>
  import("../components/CashManagement/CashManagement")
);
const ExportManagement = lazy(() =>
  import("../components/Export/ExportManagement")
);
const LogPage = lazy(() => import("./LogPage"));
const Statistics = lazy(() => import("../components/Statistics/Statistics"));
const TodayActivities = lazy(() =>
  import("../components/TodayActivities/TodayActivities")
);
const SavedCustomersPage = lazy(() => import("./SavedCustomersPage"));
import {
  getReservations,
  getSalons,
  getDashboardStats,
  getPaymentStats,
  moveReservationSalon,
  getSpecialDays,
} from "../api/axios";
import { APP_CONSTANTS } from "../utils/constants";
import { formatCurrency } from "../utils/currency";
import { calculateSalonPrice } from "../utils/salonPricing";
import { useSelector, useDispatch } from "react-redux";
import { isAdmin } from "../utils/auth";
import { fetchCurrentUserAsync } from "../store/authSlice";

export default function HomePage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  // Permission kontrolü
  const permissions = {
    allowCreate:
      isAdmin(user) ||
      user?.permissions?.allowAddReservation ||
      user?.allowAddReservation ||
      false,
    allowSearch:
      isAdmin(user) ||
      user?.permissions?.allowSearch ||
      user?.allowSearch ||
      false,
    allowKasa:
      isAdmin(user) || user?.permissions?.allowKasa || user?.allowKasa || false,
    allowStatistics:
      isAdmin(user) ||
      user?.permissions?.allowStatistics ||
      user?.allowStatistics ||
      false,
    allowExport:
      isAdmin(user) ||
      user?.permissions?.allowExport ||
      user?.allowExport ||
      false,
    allowSavedCustomers:
      isAdmin(user) ||
      user?.permissions?.allowSavedCustomers ||
      user?.allowSavedCustomers ||
      false,
  };
  const [reservations, setReservations] = useState([]);
  const [salons, setSalons] = useState([]);
  const [salonsLoading, setSalonsLoading] = useState(true);
  const [specialDays, setSpecialDays] = useState([]);

  const [dashboardStats, setDashboardStats] = useState(null);
  const [, setPaymentStats] = useState(null);
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [listModalOpen, setListModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeTab, setActiveTab] = useState("calendar");
  // Tarih değiştirme modu
  const [dateChangeMode, setDateChangeMode] = useState(false);
  const [reservationToMove, setReservationToMove] = useState(null);
  // Salon değiştirme modu
  const [salonChangeMode, setSalonChangeMode] = useState(false);
  const [reservationToMoveSalon, setReservationToMoveSalon] = useState(null);
  const [selectedNewSalon, setSelectedNewSalon] = useState(null);
  const [salonSelectionModalOpen, setSalonSelectionModalOpen] = useState(false);
  const [timeSelectionModalOpen, setTimeSelectionModalOpen] = useState(false);
  const [selectedDateForMove, setSelectedDateForMove] = useState(null);
  const [moveTimeForm, setMoveTimeForm] = useState({
    startTime: "",
    endTime: "",
  });
  const [existingReservationsOnDate, setExistingReservationsOnDate] = useState(
    []
  );
  const [pendingReservationOpen, setPendingReservationOpen] = useState(null);
  const [upcomingEventsModalOpen, setUpcomingEventsModalOpen] = useState(false);
  const [showAllEventTypes, setShowAllEventTypes] = useState(false);

  const handleTabChange = useCallback(
    (tab) => {
      // Permission kontrolü
      if (tab === "cash" && !permissions.allowKasa) {
        toast.error("Bu özelliği kullanmak için yetkiniz bulunmamaktadır");
        return;
      }
      if (tab === "statistics" && !permissions.allowStatistics) {
        toast.error("Bu özelliği kullanmak için yetkiniz bulunmamaktadır");
        return;
      }
      if (tab === "export" && !permissions.allowExport) {
        toast.error("Bu özelliği kullanmak için yetkiniz bulunmamaktadır");
        return;
      }
      setActiveTab(tab);
    },
    [permissions]
  );
  const [selectedYear, setSelectedYear] = useState(APP_CONSTANTS.CURRENT_YEAR);
  const [selectedMonth, setSelectedMonth] = useState(
    APP_CONSTANTS.CURRENT_MONTH
  );
  const [isMobile, setIsMobile] = useState(false);
  // Filtreleme state'leri
  const [filters, setFilters] = useState({
    eventType: "all",
    status: "all",
    dateRange: "all", // all, thisMonth, nextMonth, thisYear
  });

  // Arama modal state'i
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const filtersContainerRef = useRef(null);
  const [filtersVisible, setFiltersVisible] = useState(true);

  // TodayEvents refresh trigger
  const [todayEventsRefreshTrigger, setTodayEventsRefreshTrigger] = useState(0);

  // Auto-refresh için state
  const [isPageVisible, setIsPageVisible] = useState(true);
  const autoRefreshIntervalRef = useRef(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  const monthNames = useMemo(() => APP_CONSTANTS.MONTH_NAMES, []);

  // Seçili salonun tipini kontrol et
  const selectedSalonData = useMemo(() => {
    if (!selectedSalon) return null;
    // selectedSalon string olabilir, salon.id number olabilir - her iki durumu da kontrol et
    return salons.find((s) => String(s.id) === String(selectedSalon));
  }, [salons, selectedSalon]);

  const isCultureSalon = selectedSalonData?.type === "kultur";

  // Etkinlik türü seçeneklerini salon tipine göre belirle
  const eventTypeOptions = useMemo(() => {
    if (!selectedSalon) {
      return [];
    }

    if (isCultureSalon) {
      // Kültür salonları için sadece kültür etkinlik türleri
      return APP_CONSTANTS.CULTURE_EVENT_TYPES || [];
    } else {
      // Normal salonlar için kültür etkinlik türleri hariç tüm etkinlik türleri
      const cultureEventTypeValues = (
        APP_CONSTANTS.CULTURE_EVENT_TYPES || []
      ).map((et) => et.value);
      const filtered = (APP_CONSTANTS.EVENT_TYPES || []).filter(
        (et) => !cultureEventTypeValues.includes(et.value)
      );
      // Normal salonlar için "other" seçeneğini ekle (CULTURE_EVENT_TYPES içindeki "other" filtrelenmiş olabilir)
      const hasOther = filtered.some((et) => et.value === "other");
      if (!hasOther) {
        filtered.push({ value: "other", label: "Diğer" });
      }
      return filtered;
    }
  }, [isCultureSalon, selectedSalon]);

  // Takvim sayfasına (HomePage) geçiş yapıldığında kullanıcı bilgilerini güncelle
  useEffect(() => {
    // Sadece "calendar" tab'ı aktifse güncelle
    if (user && user.id && activeTab === "calendar") {
      dispatch(fetchCurrentUserAsync());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]); // activeTab değiştiğinde ve "calendar" tab'ı aktifse çalışır

  // Component mount olduğunda ve "calendar" tab'ı aktifse güncelle
  useEffect(() => {
    if (user && user.id && activeTab === "calendar") {
      dispatch(fetchCurrentUserAsync());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Sadece component mount olduğunda çalışır

  // ESC tuşu ile açık modalları kapat
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        if (timeSelectionModalOpen) {
          setTimeSelectionModalOpen(false);
        } else if (salonSelectionModalOpen) {
          setSalonSelectionModalOpen(false);
        } else if (upcomingEventsModalOpen) {
          setUpcomingEventsModalOpen(false);
        } else if (listModalOpen) {
          setListModalOpen(false);
        } else if (modalOpen) {
          setModalOpen(false);
        }
      }
    };
    if (
      modalOpen ||
      listModalOpen ||
      salonSelectionModalOpen ||
      timeSelectionModalOpen ||
      upcomingEventsModalOpen
    ) {
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [
    modalOpen,
    listModalOpen,
    salonSelectionModalOpen,
    timeSelectionModalOpen,
    upcomingEventsModalOpen,
  ]);

  // Modal açıkken body scroll'unu engelle
  useEffect(() => {
    const isAnyModalOpen =
      modalOpen ||
      listModalOpen ||
      salonSelectionModalOpen ||
      timeSelectionModalOpen ||
      upcomingEventsModalOpen;

    if (isAnyModalOpen) {
      // Modal açıkken body scroll'unu engelle
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        // Modal kapandığında orijinal overflow değerini geri yükle
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [
    modalOpen,
    listModalOpen,
    salonSelectionModalOpen,
    timeSelectionModalOpen,
    upcomingEventsModalOpen,
  ]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Üst filtre alanının görünürlüğünü takip et
  useEffect(() => {
    if (!filtersContainerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setFiltersVisible(entry.isIntersecting);
      },
      { root: null, threshold: 0.1 }
    );

    observer.observe(filtersContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Page Visibility API - kullanıcı başka tab'a geçtiğinde polling'i durdur
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const loadReservations = useCallback(
    async (salonId = null, status = "all", silent = false) => {
      try {
        const params = {};
        if (salonId) {
          params.salonID = salonId;
        }
        if (status && status !== "all") {
          params.status = status;
        }
        const res = await getReservations(params);
        const reservationsData = res.data?.reservations || res.data || [];
        setReservations(reservationsData);
        // Son güncellenme zamanını güncelle
        setLastUpdateTime(new Date());
      } catch {
        // Silent refresh'te hata durumunda mevcut verileri koru
        if (!silent) {
          setReservations([]);
          toast.error("Rezervasyonlar yüklenirken bir hata oluştu");
        }
      }
    },
    []
  );

  const loadSalons = useCallback(async () => {
    try {
      setSalonsLoading(true);
      const res = await getSalons();
      const salonsData = res.data?.salons || res.data || [];
      const sortedSalons = Array.isArray(salonsData)
        ? [...salonsData].sort((a, b) => Number(a.id) - Number(b.id))
        : [];
      setSalons(sortedSalons);

      if (sortedSalons.length > 0 && !selectedSalon) {
        setSelectedSalon(sortedSalons[0].id);
      }
    } catch {
      setSalons([]);
      toast.error("Salonlar yüklenirken bir hata oluştu");
    } finally {
      setSalonsLoading(false);
    }
  }, [selectedSalon]);

  const loadSpecialDays = useCallback(async () => {
    try {
      const res = await getSpecialDays();
      const specialDaysData = res.data || [];
      // Tarihleri yyyy-MM-dd formatına çevir ve "kesin değil" yazılarını temizle
      const formattedSpecialDays = specialDaysData.map((day) => {
        const date = new Date(day.date);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const dayOfMonth = String(date.getDate()).padStart(2, "0");
        // "kesin değil" yazılarını temizle
        const cleanTitle = day.title
          ? day.title.replace(/\s*\(kesin değil\)/gi, "").trim()
          : day.title;
        return {
          ...day,
          title: cleanTitle,
          dateKey: `${year}-${month}-${dayOfMonth}`,
          date: day.date,
        };
      });
      setSpecialDays(formattedSpecialDays);
    } catch (error) {
      console.error("Özel günler yüklenirken hata:", error);
      setSpecialDays([]);
    }
  }, []);

  const loadDashboardStats = useCallback(async (salonId, params = {}) => {
    if (!salonId) return;

    try {
      const res = await getDashboardStats(null, params);
      const statsData = res.data;

      // Rezervasyonları kullanarak istatistikleri hesapla
      if (statsData.reservations) {
        // Backend +3 saat (UTC+3) kullanıyor, bu yüzden UTC+3 timezone'una göre hesapla
        const now = new Date();
        const utcPlus3 = new Date(now.getTime() + 3 * 60 * 60 * 1000); // UTC+3

        const today = new Date(
          utcPlus3.getFullYear(),
          utcPlus3.getMonth(),
          utcPlus3.getDate()
        );
        const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const monthEnd = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

        const todayReservations = statsData.reservations
          .filter((a) => a.status !== "cancelled")
          .filter((reservation) => {
            const eventDate = new Date(reservation.startDate);
            const eventDateOnly = new Date(
              eventDate.getFullYear(),
              eventDate.getMonth(),
              eventDate.getDate()
            );
            return eventDateOnly.getTime() === today.getTime();
          }).length;

        const thisWeekReservations = statsData.reservations
          .filter((a) => a.status !== "cancelled")
          .filter((reservation) => {
            const eventDate = new Date(reservation.startDate);
            return eventDate >= today && eventDate < weekEnd;
          }).length;

        const upcomingReservations = statsData.reservations
          .filter((a) => a.status !== "cancelled")
          .filter((reservation) => {
            const eventDate = new Date(reservation.startDate);
            return eventDate > today && eventDate < monthEnd;
          }).length;

        // İstatistikleri güncelle
        statsData.reservationStats = {
          ...statsData.reservationStats,
          todayReservations,
          thisWeekReservations,
          upcomingReservations,
        };
      }

      setDashboardStats(statsData);
    } catch {
      setDashboardStats(null);
      toast.error("Dashboard istatistikleri yüklenirken bir hata oluştu");
    }
  }, []);

  const loadPaymentStats = useCallback(async (salonId, params = {}) => {
    if (!salonId) return;

    try {
      const res = await getPaymentStats(salonId, params);
      setPaymentStats(res.data);
    } catch {
      setPaymentStats(null);
      toast.error("Ödeme istatistikleri yüklenirken bir hata oluştu");
    }
  }, []);

  // Otomatik yenileme mekanizması - her 30 saniyede bir
  useEffect(() => {
    // Sadece sayfa görünürse ve calendar tab'ındaysak otomatik yenile
    if (!isPageVisible || activeTab !== "calendar") {
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
        autoRefreshIntervalRef.current = null;
      }
      return;
    }

    // 30 saniyede bir yenile (silent refresh - ekran yanıp sönmez)
    const loadData = () => {
      loadReservations(selectedSalon, filters.status, true); // silent=true
      const params = {
        startDate: `${selectedYear}-01-01`,
        endDate: `${selectedYear}-12-31`,
        export: false,
      };
      loadDashboardStats(selectedSalon, params);
      loadPaymentStats(selectedSalon, params);
      // TodayEvents'i de yenile
      setTodayEventsRefreshTrigger((prev) => prev + 1);
    };

    autoRefreshIntervalRef.current = setInterval(loadData, 30000);

    return () => {
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
        autoRefreshIntervalRef.current = null;
      }
    };
  }, [
    isPageVisible,
    activeTab,
    selectedSalon,
    filters.status,
    selectedYear,
    loadReservations,
    loadDashboardStats,
    loadPaymentStats,
  ]);

  // Arama modal'ından rezervasyon tıklama fonksiyonu
  const handleSearchReservationClick = (reservation, reservationSalonId) => {
    // Rezervasyonun tarihini TR timezone'a göre ayarla

    const reservationDate = new Date(reservation.startDate).toLocaleDateString(
      "en-CA",
      { timeZone: "Europe/Istanbul" }
    );
    setSelectedDate(reservationDate);

    // Eğer rezervasyon farklı bir salonda ise, salon seçimini güncelle
    if (reservationSalonId && reservationSalonId !== selectedSalon) {
      const targetSalon = salons.find((s) => s.id === reservationSalonId);
      const salonName = targetSalon ? targetSalon.name : "Farklı salon";

      // Salon değişikliği sonrası modal açılması için pending state'i ayarla
      setPendingReservationOpen(reservationDate);

      setSelectedSalon(reservationSalonId);
      toast.success(`${salonName} salonuna geçildi`);
    } else {
      // Aynı salonda ise direkt modal'ı aç
      setListModalOpen(true);
    }

    // Arama modal'ını kapat
    setSearchModalOpen(false);
  };

  // TodayEvents'ten rezervasyon tıklama fonksiyonu
  const handleTodayEventClick = (reservation) => {
    // console.log(reservation);
    setSelectedSalon(reservation.salon.id);
    const dateStr = reservation.startDate.substring(0, 10);
    setSelectedDate(dateStr);
    setListModalOpen(true);
  };
  const handleUpcomingEventClick = (reservation) => {
    // YYYY-MM-DD
    const reservationDate = reservation.startDate.substring(0, 10);
    setSelectedDate(reservationDate);

    if (reservation.salonID && reservation.salonID !== selectedSalon) {
      const targetSalon =
        salons && Array.isArray(salons)
          ? salons.find((s) => s.id === reservation.salonID)
          : null;
      const salonName = targetSalon ? targetSalon.name : "Farklı salon";

      setPendingReservationOpen(reservationDate);
      setSelectedSalon(reservation.salonID);
      toast.success(`${salonName} salonuna geçildi`);
    } else {
      setListModalOpen(true);
    }

    setUpcomingEventsModalOpen(false);
  };

  // ReservationsListModal'dan ana takvime yönlendirme
  const handleNavigateToCalendar = (reservation) => {
    // Ana takvim sekmesine geç
    setActiveTab("calendar");

    // Bilgi mesajı göster
    toast.success(
      `${reservation.customerName} rezervasyonu için ana takvime yönlendirildi`
    );
  };

  useEffect(() => {
    loadSalons();
    loadSpecialDays();
  }, [loadSalons, loadSpecialDays]);

  // Salon değiştiğinde eventType filtresini kontrol et ve gerekirse sıfırla
  useEffect(() => {
    if (selectedSalon && filters.eventType !== "all") {
      const currentEventType = filters.eventType;
      const isValidForCurrentSalon = eventTypeOptions.some(
        (et) => et.value === currentEventType
      );
      if (!isValidForCurrentSalon) {
        setFilters((prev) => ({
          ...prev,
          eventType: "all",
        }));
      }
    }
  }, [selectedSalon, eventTypeOptions, filters.eventType]);

  useEffect(() => {
    if (selectedSalon) {
      const params = {
        startDate: `${selectedYear}-01-01`,
        endDate: `${selectedYear}-12-31`,
        export: false,
      };
      loadDashboardStats(selectedSalon, params);
      loadPaymentStats(selectedSalon, params);
      loadReservations(selectedSalon, filters.status);
    }
  }, [
    selectedSalon,
    selectedYear,
    filters.status,
    loadDashboardStats,
    loadPaymentStats,
    loadReservations,
  ]);

  // Salon değişikliği sonrası bekleyen rezervasyon modal'ını aç
  useEffect(() => {
    if (pendingReservationOpen && reservations.length > 0) {
      setListModalOpen(true);
      setPendingReservationOpen(null);
    }
  }, [pendingReservationOpen, reservations]);

  const handleDayClick = async (dateStr /* "YYYY-MM-DD" */) => {
    setSelectedDate(dateStr);

    // Salon değiştirme modundaysa
    if (salonChangeMode && reservationToMoveSalon && selectedNewSalon) {
      // Geçmiş tarihe taşımayı engelle
      if (isDateInPast(dateStr)) {
        toast.error("Geçmiş tarihe rezervasyon taşıyamazsınız!", {
          duration: 3000,
        });
        return;
      }

      // Tarih seçildi, şimdi saat seçim modal'ını aç
      // Timezone sorunu için direkt string'den saat al
      const startDateStr = reservationToMoveSalon.startDate; // "2025-10-20T15:00:00"
      const endDateStr = reservationToMoveSalon.endDate;

      // T'den sonraki saat kısmını al (HH:MM:SS formatında)
      const startTime = startDateStr.includes("T")
        ? startDateStr.split("T")[1].slice(0, 5)
        : "12:00";
      const endTime = endDateStr.includes("T")
        ? endDateStr.split("T")[1].slice(0, 5)
        : "18:00";

      // Seçilen tarihteki mevcut rezervasyonları bul (yeni salonda)
      const dayReservations = reservations
        .filter((res) => {
          if (res.salonID !== selectedNewSalon) return false;
          if (!res.startDate) return false;
          return res.startDate.startsWith(dateStr);
        })
        .map((res) => ({
          id: res.id,
          customerName: res.customerName,
          eventType: res.eventType,
          status: res.status,
          startTime: res.startDate.includes("T")
            ? res.startDate.split("T")[1].slice(0, 5)
            : "",
          endTime:
            res.endDate && res.endDate.includes("T")
              ? res.endDate.split("T")[1].slice(0, 5)
              : "",
          startDate: res.startDate,
          endDate: res.endDate,
        }));

      setSelectedDateForMove(dateStr);
      setMoveTimeForm({
        startTime: startTime,
        endTime: endTime,
      });
      setExistingReservationsOnDate(dayReservations);
      setTimeSelectionModalOpen(true);
      return;
    }

    // Tarih değiştirme modundaysa
    if (dateChangeMode && reservationToMove) {
      // Geçmiş tarihe taşımayı engelle
      if (isDateInPast(dateStr)) {
        toast.error("Geçmiş tarihe rezervasyon taşıyamazsınız!", {
          duration: 3000,
        });
        return;
      }
      // Sadece move date modal'ını aç, rezervasyon modal'ını açma
      setListModalOpen(true);
      return;
    }

    // Normal modda çalış
    const dayReservations = filteredReservations.filter((reservation) =>
      reservation.startDate?.startsWith(dateStr)
    );

    if (dayReservations.length > 0) {
      setListModalOpen(true);
    } else {
      // Rezervasyon oluşturma yetkisi kontrolü
      if (!permissions.allowCreate) {
        toast.error("Rezervasyon oluşturma yetkiniz bulunmamaktadır", {
          duration: 3000,
        });
        return;
      }
      // Geçmiş tarihe rezervasyon oluşturmayı engelle
      if (isDateInPast(dateStr)) {
        toast.error("Geçmiş tarihe rezervasyon oluşturamazsınız!", {
          duration: 3000,
        });
        return;
      }
      setModalOpen(true);
    }
  };

  const handleCreateNew = (dateStr) => {
    // Rezervasyon oluşturma yetkisi kontrolü
    if (!permissions.allowCreate) {
      toast.error("Rezervasyon oluşturma yetkiniz bulunmamaktadır", {
        duration: 3000,
      });
      return;
    }
    // Geçmiş tarihe rezervasyon oluşturmayı engelle
    if (isDateInPast(dateStr)) {
      toast.error("Geçmiş tarihe rezervasyon oluşturamazsınız!", {
        duration: 3000,
      });
      return;
    }
    setSelectedDate(dateStr);
    setModalOpen(true);
  };

  const handleStartDateChange = useCallback((reservation) => {
    setReservationToMove(reservation);
    setDateChangeMode(true);
  }, []);

  const handleCancelDateChange = useCallback(() => {
    setDateChangeMode(false);
    setReservationToMove(null);
    setListModalOpen(false);
  }, []);

  // Salon değiştirme handlers
  const handleStartSalonChange = useCallback((reservation) => {
    setReservationToMoveSalon(reservation);
    setSalonSelectionModalOpen(true);
  }, []);

  const handleSalonSelected = useCallback(
    (salonId) => {
      setSelectedNewSalon(salonId);
      setSalonSelectionModalOpen(false);
      setSalonChangeMode(true);
      setListModalOpen(false);
      setActiveTab("calendar");
      setSelectedSalon(salonId);

      toast.success(
        `${reservationToMoveSalon?.customerName} rezervasyonu için yeni tarih seçin`
      );
    },
    [reservationToMoveSalon]
  );

  const handleCancelSalonChange = useCallback(() => {
    setSalonChangeMode(false);
    setReservationToMoveSalon(null);
    setSelectedNewSalon(null);
    setTimeSelectionModalOpen(false);
    setSelectedDateForMove(null);
    setMoveTimeForm({ startTime: "", endTime: "" });
    setExistingReservationsOnDate([]);
  }, []);

  const handleTimeSelectionSubmit = async (e) => {
    e.preventDefault();

    if (
      !selectedDateForMove ||
      !moveTimeForm.startTime ||
      !moveTimeForm.endTime
    ) {
      toast.error("Lütfen tüm alanları doldurun");
      return;
    }

    const newStartDate = `${selectedDateForMove}T${moveTimeForm.startTime}:00`;
    const newEndDate = `${selectedDateForMove}T${moveTimeForm.endTime}:00`;

    try {
      await moveReservationSalon(
        reservationToMoveSalon.id,
        newStartDate,
        newEndDate,
        selectedNewSalon
      );

      toast.success("Rezervasyon başarıyla taşındı!");
      setTimeSelectionModalOpen(false);
      handleCancelSalonChange();
      loadReservations(selectedNewSalon);
      loadDashboardStats();
      // Bugünkü etkinlikleri yenile
      setTodayEventsRefreshTrigger((prev) => prev + 1);
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
        toast.error(
          "Rezervasyon taşınamadı: " +
            (error.response?.data?.message || error.message)
        );
      }
    }
  };

  const filteredReservations = useMemo(() => {
    return reservations.filter((reservation) => {
      if (!selectedSalon) return false;

      // Salon filtresi
      if (String(reservation.salonID) !== String(selectedSalon)) return false;

      // Event type filtresi
      if (
        filters.eventType !== "all" &&
        reservation.eventType !== filters.eventType
      ) {
        return false;
      }

      // Status filtresi
      if (filters.status !== "all" && reservation.status !== filters.status) {
        return false;
      }

      // Date range filtresi
      if (filters.dateRange !== "all") {
        const reservationDate = new Date(reservation.startDate);
        const now = new Date();

        switch (filters.dateRange) {
          case "thisMonth":
            if (
              reservationDate.getMonth() !== now.getMonth() ||
              reservationDate.getFullYear() !== now.getFullYear()
            ) {
              return false;
            }
            break;
          case "nextMonth": {
            const nextMonth = new Date(
              now.getFullYear(),
              now.getMonth() + 1,
              1
            );
            if (
              reservationDate.getMonth() !== nextMonth.getMonth() ||
              reservationDate.getFullYear() !== nextMonth.getFullYear()
            ) {
              return false;
            }
            break;
          }
          case "thisYear":
            if (reservationDate.getFullYear() !== now.getFullYear()) {
              return false;
            }
            break;
        }
      }

      return true;
    });
  }, [reservations, filters, selectedSalon]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header and Navigation */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="container mx-auto max-w-screen-2xl">
          <Header />
          <Navbar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onSearchClick={() => {
              if (permissions.allowSearch) {
                setSearchModalOpen(true);
              }
            }}
            onUpcomingEventsClick={() => setUpcomingEventsModalOpen(true)}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-screen-2xl py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
        {/* Tab Content */}
        {activeTab === "calendar" && (
          <div className="mb-6">
            {/* Dashboard Stats ve Bugünkü Etkinlikler */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Dashboard İstatistikleri - 2x2 Grid */}
                <div className="md:col-span-2 lg:col-span-2">
                  {dashboardStats ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
                      {/* Rezervasyon İstatistikleri */}
                      <div className="card-hover p-6 group h-full min-w-0">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm sm:text-sm font-semibold text-secondary-700 dark:text-slate-300 group-hover:text-secondary-900 dark:group-hover:text-slate-100 transition-colors">
                            Rezervasyonlar
                          </h3>
                          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                            <svg
                              className="w-5 h-5 text-primary-600"
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
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center min-w-0">
                            <span className="text-xs sm:text-sm text-secondary-600 dark:text-slate-300">
                              Toplam:
                            </span>
                            <span className="text-base md:text-lg font-bold text-secondary-900 dark:text-slate-100 whitespace-nowrap">
                              {dashboardStats.reservationStats
                                ?.totalReservations || 0}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-secondary-100">
                            <div className="text-center">
                              <div className="text-xs text-secondary-500 dark:text-slate-300 mb-1">
                                Bugün
                              </div>
                              <div className="text-sm font-semibold text-primary-600">
                                {dashboardStats.reservationStats
                                  ?.todayReservations || 0}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-secondary-500 dark:text-slate-300 mb-1">
                                Bu Hafta
                              </div>
                              <div className="text-sm font-semibold text-success-600 dark:text-success-400">
                                {dashboardStats.reservationStats
                                  ?.thisWeekReservations || 0}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-secondary-500 dark:text-slate-300 mb-1">
                                Bu Ay
                              </div>
                              <div className="text-sm font-semibold text-warning-600">
                                {dashboardStats.reservationStats
                                  ?.upcomingReservations || 0}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Finansal İstatistikler - Kasa yetkisi olmayan kullanıcılar için veriler 0 gösterilir */}
                      <div className="card-hover p-6 group h-full min-w-0">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm sm:text-sm font-semibold text-secondary-700 dark:text-slate-300 group-hover:text-secondary-900 dark:group-hover:text-slate-100 transition-colors">
                            Finansal
                          </h3>
                          <div className="w-10 h-10 bg-success-100 rounded-xl flex items-center justify-center group-hover:bg-success-200 transition-colors">
                            <span className="w-5 h-5 flex items-center justify-center text-success-600 text-lg font-bold">
                              ₺
                            </span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center min-w-0">
                            <span className="text-xs sm:text-sm text-secondary-600 dark:text-slate-300">
                              Toplam Gelir:
                            </span>
                            <span className="text-base md:text-lg font-bold text-secondary-900 dark:text-slate-100 whitespace-nowrap">
                              {permissions.allowKasa
                                ? formatCurrency(
                                    dashboardStats.financialStats?.totalRevenue
                                  )
                                : formatCurrency(0)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-secondary-100 dark:border-slate-700">
                            <div className="text-center">
                              <div className="text-xs text-secondary-500 dark:text-slate-300 mb-1">
                                Ödenen
                              </div>
                              <div className="text-sm font-semibold text-success-600 dark:text-success-400">
                                {permissions.allowKasa
                                  ? formatCurrency(
                                      dashboardStats.financialStats?.totalPaid
                                    )
                                  : formatCurrency(0)}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-secondary-500 dark:text-slate-300 mb-1">
                                Bekleyen
                              </div>
                              <div className="text-sm font-semibold text-warning-600">
                                {permissions.allowKasa
                                  ? formatCurrency(
                                      dashboardStats.financialStats
                                        ?.pendingAmount
                                    )
                                  : formatCurrency(0)}
                              </div>
                            </div>
                          </div>
                          {/*                                                   <div className="pt-2 border-t border-secondary-100 dark:border-slate-700">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-secondary-500 dark:text-slate-300">
                              Taksit Sayısı:
                            </span>
                            <span className="text-sm font-semibold text-primary-600">
                              {dashboardStats.financialStats
                                ?.installmentCount || 0}
                            </span>
                          </div>
                        </div> */}
                        </div>
                      </div>

                      {/* Etkinlik Türü İstatistikleri */}
                      <div className="card-hover p-6 group h-full min-w-0">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm sm:text-sm font-semibold text-secondary-700 dark:text-slate-300 group-hover:text-secondary-900 dark:group-hover:text-slate-100 transition-colors">
                            Etkinlik Türleri
                          </h3>
                          <div className="w-10 h-10 bg-warning-100 rounded-xl flex items-center justify-center group-hover:bg-warning-200 transition-colors">
                            <svg
                              className="w-5 h-5 text-warning-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="space-y-3 min-w-0">
                          {dashboardStats.eventTypeStats?.length > 0 ? (
                            <>
                              <div className="space-y-2">
                                {dashboardStats.eventTypeStats
                                  ?.slice(
                                    0,
                                    showAllEventTypes
                                      ? dashboardStats.eventTypeStats.length
                                      : 3
                                  )
                                  .map((stat) => {
                                    const eventTypeNames = {
                                      wedding: "Düğün",
                                      circumcision: "Sünnet",
                                      engagement: "Nişan",
                                      nikah: "Nikah",
                                      breakfast: "Kahvaltı",
                                      henna: "Kına",
                                      meeting: "Toplantı",
                                      other: "Diğer",
                                    };
                                    return (
                                      <div
                                        key={stat.eventType}
                                        className="flex justify-between items-center min-w-0"
                                      >
                                        <span className="text-sm text-secondary-600 dark:text-slate-300 truncate">
                                          {eventTypeNames[stat.eventType] ||
                                            (APP_CONSTANTS.CULTURE_EVENT_TYPES?.find(
                                              (ct) =>
                                                ct.value === stat.eventType
                                            )?.label ??
                                              stat.eventType)}
                                        </span>
                                        <span className="font-semibold text-secondary-900 dark:text-slate-100 text-sm whitespace-nowrap">
                                          {stat.count}
                                        </span>
                                      </div>
                                    );
                                  })}
                              </div>
                              {dashboardStats.eventTypeStats?.length > 3 && (
                                <button
                                  onClick={() =>
                                    setShowAllEventTypes(!showAllEventTypes)
                                  }
                                  className="w-full text-xs text-secondary-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 text-center pt-2 border-t border-secondary-100 dark:border-slate-700 transition-colors cursor-pointer hover:bg-secondary-50 dark:hover:bg-slate-700/50 rounded-md py-2"
                                >
                                  {showAllEventTypes ? (
                                    <span className="flex items-center justify-center gap-1">
                                      <svg
                                        className="w-3 h-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M5 15l7-7 7 7"
                                        />
                                      </svg>
                                      Daha az göster
                                    </span>
                                  ) : (
                                    <span className="flex items-center justify-center gap-1">
                                      <svg
                                        className="w-3 h-3"
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
                                      +
                                      {dashboardStats.eventTypeStats.length - 3}{" "}
                                      diğer tür
                                    </span>
                                  )}
                                </button>
                              )}
                            </>
                          ) : (
                            <p className="text-sm text-secondary-500 dark:text-slate-300 text-center py-4">
                              Veri bulunamadı
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Durum İstatistikleri */}
                      <div className="card-hover p-6 group h-full min-w-0">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm sm:text-sm font-semibold text-secondary-700 dark:text-slate-300 group-hover:text-secondary-900 dark:group-hover:text-slate-100 transition-colors">
                            Durum Dağılımı
                          </h3>
                          <div className="w-10 h-10 bg-secondary-100 rounded-xl flex items-center justify-center group-hover:bg-secondary-200 transition-colors">
                            <svg
                              className="w-5 h-5 text-secondary-600 dark:text-slate-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="space-y-3 min-w-0">
                          {dashboardStats.statusStats?.length > 0 ? (
                            <div className="space-y-2">
                              {dashboardStats.statusStats.map((stat) => {
                                const statusConfig = {
                                  preliminary: {
                                    name: "Ön Rezervasyon",
                                    color: "text-warning-600",
                                  },
                                  completed: {
                                    name: "Tamamlanmış",
                                    color: "text-primary-600",
                                  },
                                  cancelled: {
                                    name: "İptal Edilmiş",
                                    color: "text-error-600",
                                  },
                                };
                                const config = statusConfig[stat.status] || {
                                  name: stat.status,
                                  color: "text-secondary-600",
                                };
                                return (
                                  <div
                                    key={stat.status}
                                    className="flex justify-between items-center min-w-0"
                                  >
                                    <span className="text-sm text-secondary-600 dark:text-slate-300 truncate">
                                      {config.name}
                                    </span>
                                    <span
                                      className={`font-semibold text-sm ${config.color} whitespace-nowrap`}
                                    >
                                      {stat.count}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-secondary-500 dark:text-slate-300 text-center py-4">
                              Veri bulunamadı
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : selectedSalon || salonsLoading ? (
                    <div className="card p-8 text-center">
                      <div className="loading-spinner h-8 w-8 mx-auto mb-4"></div>
                      <p className="text-secondary-500 dark:text-slate-300 text-sm">
                        Dashboard istatistikleri yükleniyor...
                      </p>
                    </div>
                  ) : (
                    <div className="card p-8 text-center">
                      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-secondary-100 dark:bg-slate-700 flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-secondary-500 dark:text-slate-400"
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
                      </div>
                      <p className="text-secondary-700 dark:text-slate-300 font-medium mb-1">
                        Size atanmış salon bulunmamaktadır
                      </p>
                      <p className="text-secondary-500 dark:text-slate-400 text-sm">
                        Yetkili bir yönetici ile iletişime geçin.
                      </p>
                    </div>
                  )}
                </div>

                {/* Bugünkü Etkinlikler - Yan Panel */}
                <div className="md:col-span-2 lg:col-span-1">
                  <div
                    className="card p-6 flex flex-col"
                    style={{ height: "400px" }}
                  >
                    <TodayEvents
                      selectedSalon={selectedSalon}
                      onReservationClick={handleTodayEventClick}
                      refreshTrigger={todayEventsRefreshTrigger}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Year, Month and Salon Selectors */}
            <div className="mb-8">
              <div className="card p-6" ref={filtersContainerRef}>
                {/* Son Güncellenme Zamanı */}
                {lastUpdateTime && (
                  <div className="mb-4 flex items-center justify-end">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <svg
                        className="w-4 h-4 text-green-600 dark:text-green-400"
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
                      <span className="text-xs sm:text-sm text-green-700 dark:text-green-300 font-medium">
                        Son güncelleme:{" "}
                        {lastUpdateTime.toLocaleTimeString("tr-TR", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="form-group min-w-0">
                      <label className="form-label">Yıl</label>
                      <select
                        value={selectedYear}
                        onChange={(e) =>
                          setSelectedYear(Number(e.target.value))
                        }
                        className="input min-w-[100px]"
                      >
                        <option value={2024}>2024</option>
                        <option value={2025}>2025</option>
                        <option value={2026}>2026</option>
                      </select>
                    </div>

                    {/* Mobilde ay seçici - sadece mobilde görünür */}
                    <div className="form-group min-w-0 sm:hidden">
                      <label className="form-label">Ay</label>
                      <select
                        value={selectedMonth}
                        onChange={(e) =>
                          setSelectedMonth(Number(e.target.value))
                        }
                        className="input min-w-[120px]"
                      >
                        {monthNames.map((month, index) => (
                          <option key={index} value={index}>
                            {month}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group min-w-0">
                      <label className="form-label">Salon</label>
                      <select
                        value={selectedSalon || ""}
                        onChange={(e) => {
                          setSelectedSalon(e.target.value);
                          // Salon değiştiğinde eventType filtresini sıfırla
                          setFilters((prev) => ({
                            ...prev,
                            eventType: "all",
                          }));
                        }}
                        className="input min-w-[180px]"
                        disabled={salons.length === 0}
                      >
                        {salonsLoading ? (
                          <option value="">Salon yükleniyor...</option>
                        ) : salons.length === 0 ? (
                          <option value="">Salon atanmamış</option>
                        ) : (
                          salons.map((salon) => (
                            <option key={salon.id} value={salon.id}>
                              {salon.name}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Filters */}
                  {selectedSalon && (
                    <div className="flex flex-wrap items-center gap-4 pt-4 border-gray-200">
                      <div className="form-group min-w-0">
                        <label className="form-label">Etkinlik Türü</label>
                        <select
                          value={filters.eventType}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              eventType: e.target.value,
                            }))
                          }
                          className="input min-w-[150px]"
                        >
                          <option value="all">Tümü</option>
                          {eventTypeOptions.map((eventType) => (
                            <option
                              key={eventType.value}
                              value={eventType.value}
                            >
                              {eventType.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group min-w-0">
                        <label className="form-label">Durum</label>
                        <select
                          value={filters.status}
                          onChange={(e) => {
                            setFilters((prev) => ({
                              ...prev,
                              status: e.target.value,
                            }));
                            // Status filtresi değiştiğinde rezervasyonları yeniden yükle
                            loadReservations(selectedSalon, e.target.value);
                          }}
                          className="input min-w-[150px]"
                        >
                          <option value="all">Tümü</option>
                          <option value="preliminary">Ön Rezervasyon</option>
                          <option value="completed">Tamamlandı</option>
                          <option value="cancelled">İptal Edildi</option>
                        </select>
                      </div>

                      {/* <div className="form-group min-w-0">
                        <label className="form-label">Tarih Aralığı</label>
                        <select
                          value={filters.dateRange}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              dateRange: e.target.value,
                            }))
                          }
                          className="input min-w-[150px]"
                        >
                          <option value="all">Tümü</option>
                          <option value="thisMonth">Bu Ay</option>
                          <option value="nextMonth">Gelecek Ay</option>
                          <option value="thisYear">Bu Yıl</option>
                        </select>
                      </div> */}

                      <div className="form-group min-w-0">
                        <button
                          onClick={() =>
                            setFilters({
                              eventType: "all",
                              status: "all",
                              dateRange: "all",
                            })
                          }
                          className="btn-outline mt-4"
                        >
                          Filtreleri Temizle
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  {/*                   <div className="flex items-center gap-2">
                    <button
                      onClick={() => setModalOpen(true)}
                      className="btn-primary"
                      disabled={!selectedSalon}
                    >
                      <svg
                        className="w-4 h-4 mr-2"
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
                      Yeni Rezervasyon
                    </button>
                  </div> */}
                </div>
              </div>
            </div>

            {/* Tarih değiştirme modu header - Sabit (sticky) */}
            {dateChangeMode && reservationToMove && (
              <div className="sticky top-20 z-40 mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300">
                      Tarih Değiştirme Modu
                    </h3>
                    <p className="text-sm text-purple-600 dark:text-purple-400">
                      <strong>{reservationToMove.customerName}</strong>{" "}
                      rezervasyonu için yeni tarih seçin
                    </p>
                    <div className="mt-2 text-xs text-purple-500 dark:text-purple-400 space-y-1">
                      <div>
                      <strong>Mevcut Tarih:</strong>{" "}
                        {new Date(
                          reservationToMove.startDate
                        ).toLocaleDateString("tr-TR")}{" "}
                      {new Date(
                        new Date(reservationToMove.startDate).getTime() -
                          3 * 60 * 60 * 1000
                      ).toLocaleTimeString("tr-TR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      </div>
                      {(() => {
                        const salon = salons.find(
                          (s) => s.id === reservationToMove.salonID
                        );
                        if (salon) {
                          const oldDateStr = reservationToMove.startDate;
                          const [oldDatePart, oldTimePart] =
                            oldDateStr.split("T");
                          const oldTime = oldTimePart
                            ? oldTimePart.slice(0, 5)
                            : "12:00";
                          const oldPrice = calculateSalonPrice(
                            salon,
                            oldDatePart,
                            oldTime,
                            reservationToMove.eventType
                          );
                          return (
                            <div className="mt-2 pt-2 border-t border-purple-300 dark:border-purple-600">
                              <div>
                                <strong>Mevcut Salon Fiyatı:</strong>{" "}
                                <span className="font-semibold">
                                  {formatCurrency(oldPrice, false)}
                                </span>
                              </div>
                              <div className="text-purple-400 dark:text-purple-500 italic">
                                Yeni tarih seçildiğinde fiyat güncellenecek
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleCancelDateChange}
                      className="btn-secondary text-sm"
                    >
                      İptal Et
                    </button>
                  </div>
                </div>
              </div>
            )}

            {salonChangeMode && reservationToMoveSalon && selectedNewSalon && (
              <div className="sticky top-20 z-40 mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300">
                      Salon Değiştirme Modu
                    </h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      <strong>{reservationToMoveSalon.customerName}</strong>{" "}
                      rezervasyonu için yeni tarih seçin
                    </p>
                    <div className="mt-2 text-xs text-blue-500 dark:text-blue-400 space-y-1">
                      <div>
                        <strong>Mevcut Salon:</strong>{" "}
                        {
                          salons.find(
                            (s) => s.id === reservationToMoveSalon.salonID
                          )?.name
                        }
                      </div>
                      <div>
                        <strong>Yeni Salon:</strong>{" "}
                        {salons.find((s) => s.id === selectedNewSalon)?.name}
                      </div>
                      <div>
                        <strong>Mevcut Tarih:</strong>{" "}
                        {(() => {
                          const dateStr = reservationToMoveSalon.startDate;
                          const [datePart, timePart] = dateStr.split("T");
                          const [year, month, day] = datePart.split("-");
                          const time = timePart
                            ? timePart.slice(0, 5)
                            : "12:00";
                          return `${day}.${month}.${year} ${time}`;
                        })()}
                      </div>
                      {(() => {
                        const oldSalon = salons.find(
                          (s) => s.id === reservationToMoveSalon.salonID
                        );
                        const newSalon = salons.find(
                          (s) => s.id === selectedNewSalon
                        );
                        if (oldSalon && newSalon) {
                          const oldDateStr = reservationToMoveSalon.startDate;
                          const [oldDatePart, oldTimePart] =
                            oldDateStr.split("T");
                          const oldTime = oldTimePart
                            ? oldTimePart.slice(0, 5)
                            : "12:00";
                          const oldPrice = calculateSalonPrice(
                            oldSalon,
                            oldDatePart,
                            oldTime,
                            reservationToMoveSalon.eventType
                          );
                          const newDateStr = selectedDateForMove || oldDatePart;
                          const newTime = moveTimeForm.startTime || oldTime;
                          const newPrice = calculateSalonPrice(
                            newSalon,
                            newDateStr,
                            newTime,
                            reservationToMoveSalon.eventType
                          );
                          return (
                            <div className="mt-2 pt-2 border-t border-blue-300 dark:border-blue-600">
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
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleCancelSalonChange}
                      className="btn-secondary text-sm"
                    >
                      İptal Et
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="w-full">
              <YearCalendar
                reservations={filteredReservations}
                onDateClick={handleDayClick}
                year={selectedYear}
                selectedMonth={isMobile ? selectedMonth : null}
                dateChangeMode={dateChangeMode}
                reservationToMove={reservationToMove}
                specialDays={specialDays}
              />
            </div>

            {/* Floating Filter Button (üst filtre alanı görünmüyorsa göster) */}
            {!filtersVisible && (
              <button
                type="button"
                onClick={() => setFilterModalOpen(true)}
                className="fixed bottom-6 right-6 z-40 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white w-12 h-12 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Filtreleri Aç"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L14 13.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 018 17v-3.586L3.293 6.707A1 1 0 013 6V4z"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {activeTab === "salons" && (
          <div className="card p-6">
            <Suspense
              fallback={
                <div className="text-center py-8">Salonlar yükleniyor...</div>
              }
            >
              <SalonList />
            </Suspense>
          </div>
        )}

        {activeTab === "events" && (
          <div className="card p-6">
            <Suspense
              fallback={
                <div className="text-center py-8">
                  Etkinlikler yükleniyor...
                </div>
              }
            >
              <UpcomingEvents selectedSalon={selectedSalon} />
            </Suspense>
          </div>
        )}

        {activeTab === "cash" && permissions.allowKasa && (
          <div className="card p-6">
            <Suspense
              fallback={
                <div className="text-center py-8">
                  Kasa yönetimi yükleniyor...
                </div>
              }
            >
              <CashManagement selectedSalon={selectedSalon} />
            </Suspense>
          </div>
        )}

        {activeTab === "statistics" && permissions.allowStatistics && (
          <Suspense
            fallback={
              <div className="text-center py-8">
                İstatistikler yükleniyor...
              </div>
            }
          >
            <Statistics selectedSalon={selectedSalon} salons={salons} />
          </Suspense>
        )}

        {activeTab === "users" && (
          <div className="card p-6">
            <Suspense
              fallback={
                <div className="text-center py-8">
                  Kullanıcılar yükleniyor...
                </div>
              }
            >
              <UserList />
            </Suspense>
          </div>
        )}

        {activeTab === "export" && permissions.allowExport && (
          <div className="card p-6">
            <Suspense
              fallback={
                <div className="text-center py-8">
                  Export yönetimi yükleniyor...
                </div>
              }
            >
              <ExportManagement selectedSalon={selectedSalon} />
            </Suspense>
          </div>
        )}

        {activeTab === "today-activities" && (
          <div className="card p-6">
            <Suspense
              fallback={
                <div className="text-center py-8">
                  Bugün yapılanlar yükleniyor...
                </div>
              }
            >
              <TodayActivities />
            </Suspense>
          </div>
        )}

        {activeTab === "saved-customers" && permissions.allowSavedCustomers && (
          <div className="card p-6">
            <Suspense
              fallback={
                <div className="text-center py-8">
                  Kayıtlı müşteriler yükleniyor...
                </div>
              }
            >
              <SavedCustomersPage />
            </Suspense>
          </div>
        )}

        {activeTab === "logs" && (
          <Suspense
            fallback={
              <div className="text-center py-8">Log sayfası yükleniyor...</div>
            }
          >
            <LogPage />
          </Suspense>
        )}

        <ReservationModal
          open={modalOpen}
          date={selectedDate}
          salonId={selectedSalon}
          onClose={() => setModalOpen(false)}
          onCreated={() => {
            loadReservations(selectedSalon, filters.status);
            const params = {
              startDate: `${selectedYear}-01-01`,
              endDate: `${selectedYear}-12-31`,
              export: false,
            };
            loadDashboardStats(selectedSalon, params);
            setTodayEventsRefreshTrigger((prev) => prev + 1);
          }}
        />

        <ReservationsListModal
          open={listModalOpen}
          date={selectedDate}
          salonId={selectedSalon}
          status={filters.status}
          onClose={() => setListModalOpen(false)}
          onUpdated={() => {
            loadReservations(selectedSalon, filters.status);
            const params = {
              startDate: `${selectedYear}-01-01`,
              endDate: `${selectedYear}-12-31`,
              export: false,
            };
            loadDashboardStats(selectedSalon, params);
            setTodayEventsRefreshTrigger((prev) => prev + 1);
          }}
          onCreateNew={handleCreateNew}
          year={selectedYear}
          selectedMonth={isMobile ? selectedMonth : null}
          onStartDateChange={handleStartDateChange}
          dateChangeMode={dateChangeMode}
          reservationToMove={reservationToMove}
          onDateChangeComplete={handleCancelDateChange}
          onNavigateToCalendar={handleNavigateToCalendar}
          onStartSalonChange={handleStartSalonChange}
        />

        {/* Search Modal */}
        {permissions.allowSearch && (
          <SearchModal
            open={searchModalOpen}
            onClose={() => setSearchModalOpen(false)}
            selectedSalon={selectedSalon}
            setSelectedSalon={setSelectedSalon}
            salons={salons}
            onReservationClick={handleSearchReservationClick}
          />
        )}

        {/* Filter Modal */}
        {filterModalOpen && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 dark:bg-slate-900/50"
            onClick={(e) => {
              if (e.target === e.currentTarget) setFilterModalOpen(false);
            }}
          >
            <div className="w-full max-w-[95vw] sm:w-[520px] md:w-[560px] max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-4 sm:p-5 md:p-6 shadow-xl mx-2 dark:bg-slate-800 dark:border dark:border-slate-700">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-lg sm:text-xl font-semibold">Filtreler</h3>
                <button
                  onClick={() => setFilterModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-slate-600 dark:text-slate-300 flex-shrink-0"
                  aria-label="Modalı kapat"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Yıl</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="input w-full dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300"
                  >
                    <option value={2024}>2024</option>
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Salon</label>
                  <select
                    value={selectedSalon || ""}
                    onChange={(e) => {
                      setSelectedSalon(e.target.value);
                      // Salon değiştiğinde eventType filtresini sıfırla
                      setFilters((prev) => ({
                        ...prev,
                        eventType: "all",
                      }));
                    }}
                    className="input w-full dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300"
                    disabled={salons.length === 0}
                  >
                    {salonsLoading ? (
                      <option value="">Salon yükleniyor...</option>
                    ) : salons.length === 0 ? (
                      <option value="">Salon atanmamış</option>
                    ) : (
                      salons.map((salon) => (
                        <option key={salon.id} value={salon.id}>
                          {salon.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Etkinlik Türü</label>
                  <select
                    value={filters.eventType}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        eventType: e.target.value,
                      }))
                    }
                    className="input w-full dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300"
                  >
                    <option value="all">Tümü</option>
                    {eventTypeOptions.map((eventType) => (
                      <option key={eventType.value} value={eventType.value}>
                        {eventType.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Durum</label>
                  <select
                    value={filters.status}
                    onChange={(e) => {
                      setFilters((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }));
                      loadReservations(selectedSalon, e.target.value);
                    }}
                    className="input w-full dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300"
                  >
                    <option value="all">Tümü</option>
                    <option value="preliminary">Ön Rezervasyon</option>
                    <option value="completed">Tamamlandı</option>
                    <option value="cancelled">İptal Edildi</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <button
                  onClick={() =>
                    setFilters({
                      eventType: "all",
                      status: "all",
                      dateRange: "all",
                    })
                  }
                  className="btn-outline"
                >
                  Filtreleri Temizle
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFilterModalOpen(false)}
                    className="rounded-lg border px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 dark:text-slate-300"
                  >
                    Kapat
                  </button>
                  <button
                    onClick={() => setFilterModalOpen(false)}
                    className="btn-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300"
                  >
                    Uygula
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upcoming Events Modal */}
        <Suspense fallback={null}>
          <UpcomingEvents
            open={upcomingEventsModalOpen}
            onClose={() => setUpcomingEventsModalOpen(false)}
            selectedSalon={selectedSalon}
            onReservationClick={handleUpcomingEventClick}
          />
        </Suspense>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#fff",
              color: "#333",
              fontSize: "14px",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              border: "1px solid #e5e7eb",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
      </div>

      {/* Saat Seçim Modal */}
      {timeSelectionModalOpen &&
        selectedDateForMove &&
        reservationToMoveSalon && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 dark:bg-black/70"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setTimeSelectionModalOpen(false);
              }
            }}
          >
            <div className="w-full max-w-[95vw] card p-4 sm:p-6 mx-2 sm:mx-4 md:mx-0 sm:w-[400px] md:w-[500px]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-base sm:text-lg font-semibold flex-1">
                  Saat Seçin
                </h3>
                <button
                  onClick={() => setTimeSelectionModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4 text-sm text-gray-600 dark:text-slate-400">
                <p>
                  <strong>{reservationToMoveSalon.customerName}</strong>{" "}
                  rezervasyonu için saat seçin.
                </p>
                <div className="mt-2 text-xs space-y-1">
                  <div>
                    <strong>Tarih:</strong>{" "}
                    {new Date(selectedDateForMove).toLocaleDateString("tr-TR")}
                  </div>
                  <div>
                    <strong>Salon:</strong>{" "}
                    {salons.find((s) => s.id === selectedNewSalon)?.name}
                  </div>
                  {(() => {
                    const oldSalon = salons.find(
                      (s) => s.id === reservationToMoveSalon.salonID
                    );
                    const newSalon = salons.find(
                      (s) => s.id === selectedNewSalon
                    );
                    if (oldSalon && newSalon) {
                      const oldDateStr = reservationToMoveSalon.startDate;
                      const [oldDatePart, oldTimePart] = oldDateStr.split("T");
                      const oldTime = oldTimePart
                        ? oldTimePart.slice(0, 5)
                        : "12:00";
                      const oldPrice = calculateSalonPrice(
                        oldSalon,
                        oldDatePart,
                        oldTime,
                        reservationToMoveSalon.eventType
                      );
                      const newTime = moveTimeForm.startTime || oldTime;
                      const newPrice = calculateSalonPrice(
                        newSalon,
                        selectedDateForMove,
                        newTime,
                        reservationToMoveSalon.eventType
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

              <form onSubmit={handleTimeSelectionSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Başlangıç Saati *
                  </label>
                  <input
                    type="time"
                    value={moveTimeForm.startTime}
                    onChange={(e) =>
                      setMoveTimeForm((prev) => ({
                        ...prev,
                        startTime: e.target.value,
                      }))
                    }
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
                    value={moveTimeForm.endTime}
                    onChange={(e) =>
                      setMoveTimeForm((prev) => ({
                        ...prev,
                        endTime: e.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-lg border dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Bu tarihteki mevcut rezervasyonlar */}
                {existingReservationsOnDate.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3 dark:text-slate-100">
                      Bu Tarihteki Rezervasyonlar (
                      {existingReservationsOnDate.length})
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {existingReservationsOnDate.map((res) => (
                        <div
                          key={res.id}
                          className="bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-lg p-3 text-sm"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium dark:text-slate-100">
                                {res.customerName}
                              </div>
                              <div className="text-gray-600 dark:text-slate-300">
                                {(res.eventType === "other" ||
                                  res.eventType === "otherEvent") &&
                                (res.otherEvent || res.otherEventTitle)
                                  ? res.otherEvent || res.otherEventTitle
                                  : APP_CONSTANTS.EVENT_TYPES.find(
                                      (et) => et.value === res.eventType
                                    )?.label ||
                                    APP_CONSTANTS.CULTURE_EVENT_TYPES?.find(
                                      (ct) => ct.value === res.eventType
                                    )?.label ||
                                    res.eventType}
                              </div>
                              <div className="text-gray-500 dark:text-slate-500">
                                {res.startTime} - {res.endTime}
                              </div>
                            </div>
                            <span
                              className={`
                              px-2 py-1 rounded text-xs font-medium
                              ${
                                res.status === "preliminary"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                  : ""
                              }
                              ${
                                res.status === "completed"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : ""
                              }
                              ${
                                res.status === "cancelled"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                  : ""
                              }
                            `}
                            >
                              {res.status === "preliminary"
                                ? "Ön Rezervasyon"
                                : ""}
                              {res.status === "completed" ? "Tamamlandı" : ""}
                              {res.status === "cancelled" ? "İptal" : ""}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setTimeSelectionModalOpen(false)}
                    className="btn-secondary"
                  >
                    İptal
                  </button>
                  <button type="submit" className="btn-primary">
                    Rezervasyonu Taşı
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {/* Salon Seçim Modal */}
      {salonSelectionModalOpen && reservationToMoveSalon && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/70 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSalonSelectionModalOpen(false);
              setReservationToMoveSalon(null);
            }
          }}
        >
          <div className="w-full max-w-[95vw] max-h-[90vh] card p-4 sm:p-6 mx-2 sm:mx-4 md:mx-0 sm:w-[400px] md:w-[500px] flex flex-col">
            <div className="mb-4 flex items-center justify-between gap-3 flex-shrink-0">
              <h3 className="text-base sm:text-lg font-semibold flex-1">
                Salon Seçin
              </h3>
              <button
                onClick={() => {
                  setSalonSelectionModalOpen(false);
                  setReservationToMoveSalon(null);
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 text-sm text-gray-600 dark:text-slate-400 flex-shrink-0">
              <p>
                <strong>{reservationToMoveSalon.customerName}</strong>{" "}
                rezervasyonunu taşımak için yeni salon seçin.
              </p>
              <p className="mt-2 text-xs">
                Salon seçtikten sonra takvimden yeni tarih seçmeniz gerekecek.
              </p>
              {(() => {
                const oldSalon = salons.find(
                  (s) => s.id === reservationToMoveSalon.salonID
                );
                if (oldSalon) {
                  const oldDateStr = reservationToMoveSalon.startDate;
                  const [oldDatePart, oldTimePart] = oldDateStr.split("T");
                  const oldTime = oldTimePart
                    ? oldTimePart.slice(0, 5)
                    : "12:00";
                  const oldPrice = calculateSalonPrice(
                    oldSalon,
                    oldDatePart,
                    oldTime,
                    reservationToMoveSalon.eventType
                  );
                  return (
                    <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600 text-xs">
                      <div>
                        <strong>Mevcut Salon Fiyatı:</strong>{" "}
                        <span className="font-semibold">
                          {formatCurrency(oldPrice, false)}
                        </span>
                      </div>
                      <div className="text-gray-500 dark:text-slate-500 italic mt-1">
                        Yeni salon seçildiğinde fiyat güncellenecek
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            <div className="space-y-3 overflow-y-auto flex-1 min-h-0 pr-2">
              {salons
                .filter((salon) => salon.id !== reservationToMoveSalon.salonID)
                .map((salon) => (
                  <button
                    key={salon.id}
                    onClick={() => handleSalonSelected(salon.id)}
                    className="w-full p-4 text-left rounded-lg border-2 border-gray-200 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                  >
                    <div className="font-medium text-gray-900 dark:text-slate-100">
                      {salon.name}
                    </div>
                    {salon.address && (
                      <div className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                        {salon.address}
                      </div>
                    )}
                    {(() => {
                      const oldDateStr = reservationToMoveSalon.startDate;
                      const [oldDatePart, oldTimePart] = oldDateStr.split("T");
                      const oldTime = oldTimePart
                        ? oldTimePart.slice(0, 5)
                        : "12:00";
                      const newPrice = calculateSalonPrice(
                        salon,
                        oldDatePart,
                        oldTime,
                        reservationToMoveSalon.eventType
                      );
                      return (
                        <div className="text-xs text-gray-600 dark:text-slate-400 mt-2">
                          <strong>Fiyat (mevcut tarih/saat için):</strong>{" "}
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {formatCurrency(newPrice, false)}
                          </span>
                        </div>
                      );
                    })()}
                  </button>
                ))}
            </div>

            <div className="mt-4 flex justify-end gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  setSalonSelectionModalOpen(false);
                  setReservationToMoveSalon(null);
                }}
                className="btn-secondary"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 py-6 mt-8">
        <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-secondary-500 dark:text-slate-400">
              Atakum Belediyesi Bilgi İşlem Müdürlüğü tarafından tasarlanmıştır.
            </p>
            <p className="text-xs text-secondary-400 dark:text-slate-500 mt-2">
              © {new Date().getFullYear()} Atakum Belediyesi - Tüm hakları
              saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
