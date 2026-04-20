import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { LuBuilding2, LuX } from "react-icons/lu";
import LoadingSpinner from "../LoadingSpinner";
import { getReservations, getSalonById, getSalons } from "../../api/axios";
import { formatCurrency } from "../../utils/currency";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";
import { isAdmin } from "../../utils/auth";

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

const EVENT_TYPE_LABELS = {
  wedding: "Düğün",
  circumcision: "Sünnet",
  engagement: "Nişan",
  nikah: "Nikah",
  breakfast: "Kahvaltı",
  meeting: "Toplantı",
  henna: "Kına",
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
  filmGosterimi: "Film Gösterimi",
  otherEvent: "Diğer",
};

export default function UpcomingEvents({
  selectedSalon,
  open,
  onClose,
  onReservationClick,
}) {
  const { user } = useSelector((state) => state.auth);
  const isUserAdmin = isAdmin(user);
  
  // Permissions objesi
  const permissions = useMemo(() => {
    return isUserAdmin
      ? {
          allowAddReservation: true,
          allowEditReservation: true,
          allowGetPayment: true,
          allowKasa: true,
        }
      : {
          allowAddReservation: user?.permissions?.allowAddReservation || user?.allowAddReservation || false,
          allowEditReservation: user?.permissions?.allowEditReservation || user?.allowEditReservation || false,
          allowGetPayment: user?.permissions?.allowGetPayment || user?.allowGetPayment || false,
          allowKasa: user?.permissions?.allowKasa || user?.allowKasa || false,
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

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("today");
  const [_salonDetails, setSalonDetails] = useState(null);
  const [salons, setSalons] = useState([]);
  const [localSelectedSalon, setLocalSelectedSalon] = useState(selectedSalon);

  // Auto-refresh için ref
  const autoRefreshIntervalRef = useRef(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  useBodyScrollLock(open);

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

  const loadSalons = useCallback(async () => {
    try {
      const res = await getSalons();
      const salonsData = res.data?.salons || res.data || [];
      const sortedSalons = Array.isArray(salonsData)
        ? [...salonsData].sort((a, b) => Number(a.id) - Number(b.id))
        : [];
      setSalons(sortedSalons);
    } catch {
      setSalons([]);
    }
  }, []);

  const handleSalonChange = (salonId) => {
    setLocalSelectedSalon(salonId);
  };

  useEffect(() => {
    const fetchSalonDetails = async () => {
      if (localSelectedSalon) {
        try {
          const res = await getSalonById(localSelectedSalon);
          setSalonDetails(res.data);
        } catch {
          setSalonDetails(null);
        }
      } else {
        setSalonDetails(null);
      }
    };

    fetchSalonDetails();
  }, [localSelectedSalon]);

  useEffect(() => {
    loadSalons();
  }, [loadSalons]);

  useEffect(() => {
    setLocalSelectedSalon(selectedSalon);
  }, [selectedSalon]);

  const loadEvents = useCallback(
    async (filter) => {
      if (!localSelectedSalon) {
        setEvents([]);
        return;
      }

      try {
        setLoading(true);

        const now = new Date();
        const utcPlus3 = new Date(now.getTime() + 3 * 60 * 60 * 1000); // UTC+3
        let startDate, endDate;

        switch (filter) {
          case "today":
            startDate = new Date(
              utcPlus3.getFullYear(),
              utcPlus3.getMonth(),
              utcPlus3.getDate(),
              0,
              0,
              0,
              0
            );
            endDate = new Date(
              utcPlus3.getFullYear(),
              utcPlus3.getMonth(),
              utcPlus3.getDate(),
              23,
              59,
              59,
              999
            );
            break;
          case "week":
            // Bu hafta: UTC+3 timezone'unda bugünden itibaren 7 gün
            startDate = new Date(
              utcPlus3.getFullYear(),
              utcPlus3.getMonth(),
              utcPlus3.getDate()
            );
            endDate = new Date(
              utcPlus3.getFullYear(),
              utcPlus3.getMonth(),
              utcPlus3.getDate() + 7
            );
            break;
          case "month":
            // Bu ay: UTC+3 timezone'unda bugünden itibaren 30 gün
            startDate = new Date(
              utcPlus3.getFullYear(),
              utcPlus3.getMonth(),
              utcPlus3.getDate()
            );
            endDate = new Date(
              utcPlus3.getFullYear(),
              utcPlus3.getMonth(),
              utcPlus3.getDate() + 30
            );
            break;
          default:
            startDate = new Date(
              utcPlus3.getFullYear(),
              utcPlus3.getMonth(),
              utcPlus3.getDate()
            );
            endDate = new Date(
              utcPlus3.getFullYear(),
              utcPlus3.getMonth(),
              utcPlus3.getDate() + 1
            );
        }

        const params = {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          limit: 50,
        };

        if (localSelectedSalon) {
          params.salonID = localSelectedSalon;
        }

        const res = await getReservations(params);
        const reservations = res.data?.reservations || [];

        const sortedEvents = reservations.sort(
          (a, b) => new Date(a.startDate) - new Date(b.startDate)
        );

        setEvents(sortedEvents);
        // Son güncellenme zamanını güncelle
        setLastUpdateTime(new Date());
      } catch {
        setEvents([]);
        alert("Yaklaşan etkinlikler yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    },
    [localSelectedSalon]
  );

  useEffect(() => {
    loadEvents(activeFilter);
  }, [loadEvents, activeFilter]);

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

    // Modal açıkken 30 saniyede bir etkinlikleri yenile
    autoRefreshIntervalRef.current = setInterval(() => {
      loadEvents(activeFilter);
    }, 30000);

    return () => {
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
        autoRefreshIntervalRef.current = null;
      }
    };
  }, [open, loadEvents, activeFilter]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    date.setHours(date.getHours() - 3); // Backend'e +3 saat eklenerek gönderildiği için -3 saat çıkar
    return date.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getFilterLabel = (filter) => {
    switch (filter) {
      case "today":
        return "Bugün";
      case "week":
        return "Bu Hafta";
      case "month":
        return "Bu Ay";
      default:
        return "Bugün";
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="card w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
              Yaklaşan Etkinlikler
            </h2>
            {/*             {lastUpdateTime && (
              <div className="mt-1 flex items-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5 text-green-600 dark:text-green-400"
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
                <span className="text-xs text-green-700 dark:text-green-300">
                  {lastUpdateTime.toLocaleTimeString("tr-TR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>
            )} */}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
            aria-label="Modalı kapat"
          >
            <LuX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!selectedSalon ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                <LuBuilding2 className="w-12 h-12 text-gray-400 dark:text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2">
                Salon Seçimi Gerekli
              </h3>
              <p className="text-slate-500 dark:text-slate-300">
                Yaklaşan etkinlikleri görüntülemek için bir salon seçin.
              </p>
            </div>
          ) : loading ? (
            <LoadingSpinner message="Etkinlikler yükleniyor..." size={28} />
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex gap-2">
                    {["today", "week", "month"].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-3 py-1.5 text-sm rounded-lg ${
                          activeFilter === filter
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-600"
                        }`}
                      >
                        {getFilterLabel(filter)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {events.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-12 h-12 text-gray-400 dark:text-slate-300"
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
                  <p
                    className="text-lg dark:text-slate-300"
                    style={{ color: "#64748b" }}
                  >
                    {getFilterLabel(activeFilter)} için etkinlik bulunmuyor.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer group min-h-[120px]"
                      onClick={() => {
                        if (onReservationClick) {
                          onReservationClick(event);
                        }
                      }}
                    >
                      {/* Vertical Layout */}
                      <div className="p-4 h-full flex flex-col">
                        {/* Header with Name and Status */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0 pr-3">
                            <h3 className="font-semibold text-gray-900 dark:text-slate-100 text-base leading-tight group-hover:text-blue-600 transition-colors break-words">
                              {event.customerName}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-slate-300 mt-1 truncate">
                              {(event.eventType === "other" || event.eventType === "otherEvent") && (event.otherEvent || event.otherEventTitle)
                                ? (event.otherEvent || event.otherEventTitle)
                                : EVENT_TYPE_LABELS[event.eventType] ||
                                  event.eventType}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                              STATUS_COLORS[event.status]
                            }`}
                          >
                            {STATUS_LABELS[event.status]}
                          </span>
                        </div>

                        <span
                          className={` mb-4 px-3 py-1 text-sm rounded-full font-medium 
                                bg-blue-100 dark:bg-blue-600/20 text-yellow-800"
                              }`}
                        >
                          {event?.salon?.name}
                        </span>

                        {/* Date and Time */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-slate-300 mb-3">
                          <div className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-2 text-gray-400 dark:text-slate-300 flex-shrink-0"
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
                            <span className="font-medium">
                              {formatDate(event.startDate)}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-2 text-gray-400 dark:text-slate-300 flex-shrink-0"
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
                            <span className="font-medium">
                              {formatTime(event.startDate)} -{" "}
                              {formatTime(event.endDate)}
                            </span>
                          </div>
                        </div>

                        {/* Notes - Middle */}
                        {event.notes && (
                          <p className="text-sm text-slate-500 dark:text-slate-300 italic mb-3 line-clamp-2">
                            "{event.notes}"
                          </p>
                        )}

                        {/* Bottom Section - Guest Count and Price */}
                        <div className="mt-auto pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            {event.guestCount && (
                              <div className="flex items-center">
                                <svg
                                  className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0"
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
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                  {event.guestCount} kişi
                                </span>
                              </div>
                            )}
                            {canViewPriceInfo && event.totalPrice && (
                              <div className="flex items-center">
                                <span className="w-4 h-4 mr-2 text-gray-400 dark:text-slate-300 flex items-center justify-center text-sm font-bold"></span>
                                <span className="text-sm font-semibold text-green-600">
                                  {formatCurrency(event.totalPrice)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

UpcomingEvents.propTypes = {
  selectedSalon: PropTypes.number,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onReservationClick: PropTypes.func,
};
