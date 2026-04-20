import { useEffect, useState, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { LuBuilding2, LuClock } from "react-icons/lu";
import LoadingSpinner from "../LoadingSpinner";
import { getReservations } from "../../api/axios";
import { APP_CONSTANTS } from "../../utils/constants";

const STATUS_COLORS = {
  preliminary: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const STATUS_LABELS = {
  preliminary: "Ön Rezervasyon",
  completed: "Tamamlandı",
  cancelled: "İptal Edildi",
};

export default function TodayEvents({
  selectedSalon,
  onReservationClick,
  refreshTrigger,
}) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Tüm etkinlik türlerini (normal + kültür) bir obje olarak oluştur
  const EVENT_TYPE_LABELS = useMemo(() => {
    const labels = {};
    // Normal salonlar için etkinlik türleri
    const normalEventTypes = APP_CONSTANTS.EVENT_TYPES || [];
    normalEventTypes.forEach((type) => {
      labels[type.value] = type.label;
    });
    // Kültür salonları için etkinlik türleri
    const cultureEventTypes = APP_CONSTANTS.CULTURE_EVENT_TYPES || [];
    cultureEventTypes.forEach((type) => {
      labels[type.value] = type.label;
    });
    return labels;
  }, []);

  // CamelCase veya birleşik yazılmış kelimeleri düzgün formata çevir
  const formatEventType = useCallback((eventType) => {
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
  }, []);

  // Etkinlik türü label'ını al (fallback olarak formatlar)
  const getEventTypeLabel = useCallback((event) => {
    // "other" etkinlik türü için özel kontrol
    if (
      (event.eventType === "other" || event.eventType === "otherEvent") &&
      (event.otherEvent || event.otherEventTitle)
    ) {
      return event.otherEvent || event.otherEventTitle;
    }
    // EVENT_TYPE_LABELS'de varsa onu kullan
    if (EVENT_TYPE_LABELS[event.eventType]) {
      return EVENT_TYPE_LABELS[event.eventType];
    }
    // Yoksa eventType'ı formatla (camelCase'i kelimelere ayır)
    if (event.eventType) {
      return formatEventType(event.eventType);
    }
    return event.eventType || "";
  }, [EVENT_TYPE_LABELS, formatEventType]);

  const loadTodayEvents = useCallback(
    async (isInitialLoad = true) => {
      // selectedSalon yoksa API çağrısı yapma
      if (!selectedSalon) {
        setEvents([]);
        return;
      }

      try {
        // Sadece ilk yüklemede loading göster, otomatik yenilemelerde gösterme
        if (isInitialLoad) {
          setLoading(true);
        }

        // Backend +3 saat (UTC+3) kullanıyor, bu yüzden UTC+3 timezone'una göre bugünü hesapla
        const now = new Date();
        const utcPlus3 = new Date(now.getTime() + 3 * 60 * 60 * 1000); // UTC+3

        // Bugün: UTC+3 timezone'unda günün başından günün sonuna kadar
        const startDate = new Date(
          utcPlus3.getFullYear(),
          utcPlus3.getMonth(),
          utcPlus3.getDate(),
          0,
          0,
          0,
          0
        );
        const endDate = new Date(
          utcPlus3.getFullYear(),
          utcPlus3.getMonth(),
          utcPlus3.getDate(),
          23,
          59,
          59,
          999
        );

        // Backend formatına uygun olarak tarih aralığını gönder
        const params = {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          salonID: selectedSalon,
          limit: 10,
        };

        const res = await getReservations(params);
        const reservations = res.data?.reservations || [];

        // Backend'den gelen tüm rezervasyonları al (backend zaten tarih aralığını filtrelemiş)
        setEvents(reservations);
      } catch (error) {
        // Hata durumunda mevcut verileri korumak için setEvents([]) yapmıyoruz
        /* console.error("Etkinlikler yüklenirken hata:", error); */
      } finally {
        if (isInitialLoad) {
          setLoading(false);
        }
      }
    },
    [selectedSalon]
  );

  useEffect(() => {
    loadTodayEvents();
  }, [loadTodayEvents]);

  // refreshTrigger değiştiğinde yeniden yükle (silent refresh)
  useEffect(() => {
    if (refreshTrigger > 0) {
      loadTodayEvents(false); // Otomatik yenilemede loading gösterme
    }
  }, [refreshTrigger, loadTodayEvents]);

  // Sayfalama mantığı
  const totalPages = Math.ceil(events.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEvents = events.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Etkinlikler değiştiğinde sayfa 1'e dön
  useEffect(() => {
    setCurrentPage(1);
  }, [events.length]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    date.setHours(date.getHours() - 3); // Backend'e +3 saat eklenerek gönderildiği için -3 saat çıkar
    return date.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
            Bugünkü Etkinlikler
          </h3>
          <span className="text-sm text-gray-500 dark:text-slate-300">
            Yükleniyor...
          </span>
        </div>
        <div
          className="flex-1 flex items-center justify-center"
          style={{ minHeight: "200px" }}
        >
          <LoadingSpinner
            message="Bugünkü etkinlikler yükleniyor..."
            size={24}
          />
        </div>
      </div>
    );
  }

  if (!selectedSalon) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
            Bugünkü Etkinlikler
          </h3>
          <span className="text-sm text-gray-500 dark:text-slate-300">
            Salon seçin
          </span>
        </div>
        <div
          className="flex-1 flex items-center justify-center"
          style={{ minHeight: "200px" }}
        >
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-3">
              <LuBuilding2 className="w-8 h-8 text-gray-400 dark:text-slate-500" />
            </div>
            <p className="text-gray-500 dark:text-slate-300 text-sm">
              Bugünkü etkinlikleri görüntülemek için bir salon seçin.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
            Bugünkü Etkinlikler
          </h3>
          <span className="text-sm text-gray-500 dark:text-slate-300">
            0 etkinlik
          </span>
        </div>
        <div
          className="flex-1 flex items-center justify-center"
          style={{ minHeight: "200px" }}
        >
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-3">
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-slate-300 text-sm">
              Bugün için etkinlik bulunmuyor.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
          Bugünkü Etkinlikler
        </h3>
        <span className="text-sm text-gray-500 dark:text-slate-300">
          {events.length} etkinlik
        </span>
      </div>

      <div
        className="flex-1 space-y-1.5 min-h-0"
        style={{ minHeight: "200px" }}
      >
        {currentEvents.map((event) => (
          <div
            key={event.id}
            className="relative bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onReservationClick?.(event)}
          >
            {/* Desktop Görünüm */}
            <div className="hidden md:block">
              {/* Etkinlik İsmi - En üstte, tam genişlik */}
              <h4 className="font-semibold text-gray-900 dark:text-slate-100 text-sm mb-2 leading-tight break-words">
                    {event.customerName}
                  </h4>
              
              {/* Salon ve Etkinlik Türü - İkinci satır */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 flex-shrink-0">
                    {event.salon.name}
                  </span>
                <span className="text-xs text-gray-600 dark:text-slate-400 font-medium flex-shrink-0">
                    {getEventTypeLabel(event)}
                  </span>
                </div>

              {/* Saat ve Kişi Sayısı - Üçüncü satır */}
              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-gray-600 dark:text-slate-300">
                  <LuClock className="w-3 h-3 mr-1 text-gray-400 dark:text-slate-500 flex-shrink-0" />
                  <span className="font-medium">
                    {formatTime(event.startDate)} - {formatTime(event.endDate)}
                  </span>
                </div>
                {event.guestCount && (
                  <div className="flex items-center text-xs text-gray-500 dark:text-slate-400">
                    <svg
                      className="w-3 h-3 mr-1 text-gray-400 dark:text-slate-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <span>{event.guestCount} kişi</span>
                  </div>
                )}
              </div>

              {/* Durum Badge - Sağ üst köşe */}
              <div className="absolute top-2 right-2">
              <span
                  className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                  STATUS_COLORS[event.status]
                }`}
              >
                {STATUS_LABELS[event.status]}
              </span>
              </div>
            </div>

            {/* Mobil Görünüm */}
            <div className="md:hidden space-y-2">
              {/* Başlık: Müşteri Adı - En üstte, tam genişlik */}
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-gray-900 dark:text-slate-100 text-sm leading-tight flex-1 break-words pr-2">
                  {event.customerName}
                </h4>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                    STATUS_COLORS[event.status]
                  }`}
                >
                  {STATUS_LABELS[event.status]}
                </span>
              </div>

              {/* Etkinlik Bilgileri */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 flex-shrink-0">
                  {event.salon.name}
                </span>
                <span className="text-xs text-gray-600 dark:text-slate-400 font-medium flex-shrink-0">
                  {getEventTypeLabel(event)}
                </span>
              </div>

              {/* Saat ve Kişi Sayısı */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center text-gray-600 dark:text-slate-300">
                  <LuClock className="w-3.5 h-3.5 mr-1 text-gray-400 dark:text-slate-500 flex-shrink-0" />
                  <span className="font-medium">
                    {formatTime(event.startDate)} - {formatTime(event.endDate)}
                  </span>
                </div>
                {event.guestCount && (
                  <div className="flex items-center text-gray-500 dark:text-slate-400">
                    <svg
                      className="w-3.5 h-3.5 mr-1 text-gray-400 dark:text-slate-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <span>{event.guestCount} kişi</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sayfalama Kontrolleri - Her zaman görünür */}
      <div className="flex items-center justify-between pt-3 border-gray-200 dark:border-slate-700 mt-auto">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1 || totalPages <= 1}
          className={`flex items-center px-3 py-1.5 text-sm rounded-lg transition-colors ${
            currentPage === 1 || totalPages <= 1
              ? "text-gray-400 dark:text-slate-600 cursor-not-allowed"
              : "text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700"
          }`}
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Önceki
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-slate-300">
            {totalPages > 1
              ? `${currentPage} / ${totalPages}`
              : `${events.length} etkinlik`}
          </span>
        </div>

        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages || totalPages <= 1}
          className={`flex items-center px-3 py-1.5 text-sm rounded-lg transition-colors ${
            currentPage === totalPages || totalPages <= 1
              ? "text-gray-400 dark:text-slate-600 cursor-not-allowed"
              : "text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700"
          }`}
        >
          Sonraki
          <svg
            className="w-4 h-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

TodayEvents.propTypes = {
  selectedSalon: PropTypes.number,
  onReservationClick: PropTypes.func,
  refreshTrigger: PropTypes.number,
};
