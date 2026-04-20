import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import YearCalendar from "./YearCalendar";
import { LuX } from "react-icons/lu";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";

const EVENT_TYPES = {
  wedding: "Düğün",
  circumcision: "Sünnet",
  engagement: "Nişan",
  nikah: "Nikah",
  henna: "Kına",
  meeting: "Toplantı",
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

export default function DatePickerModal({
  open,
  onClose,
  onDateSelect,
  reservations = [],
  // salonId (şimdilik kullanılmıyor)
  salonId,
  year = new Date().getFullYear(),
  selectedMonth = null,
  initialTime,
}) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(initialTime || "18:00");

  // Body scroll'unu engelle
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

  // Modal açıldığında veya initialTime değiştiğinde, varsayılan saati ayarla
  useEffect(() => {
    if (open && initialTime) {
      setSelectedTime(initialTime);
    }
  }, [open, initialTime]);

  // Seçilen tarihteki rezervasyonları filtrele
  const dayReservations = useMemo(() => {
    if (!selectedDate) return [];

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    return reservations.filter((reservation) =>
      reservation.startDate?.startsWith(dateStr)
    );
  }, [selectedDate, reservations]);

  // YearCalendar'dan gelen tarih seçimi için handler
  const handleCalendarDateClick = (dateStr) => {
    const date = new Date(dateStr + "T00:00:00");
    setSelectedDate(date);
  };

  // Escape tuşu ile kapanma
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

  const handleTimeChange = (e) => {
    setSelectedTime(e.target.value);
  };

  const handleConfirm = () => {
    if (!selectedDate) return;

    // Tarih + saat'i birleştir (LOCAL Date olarak döndür)
    const dateTime = new Date(
      `${format(selectedDate, "yyyy-MM-dd")}T${selectedTime}:00`
    );

    onDateSelect(dateTime, selectedDate, dayReservations);
    onClose();
  };

  const _getReservationCount = (date) => {
    if (!date) return 0;
    const dateStr = format(date, "yyyy-MM-dd");
    return reservations.filter((reservation) =>
      reservation.startDate?.startsWith(dateStr)
    ).length;
  };

  const formatTurkishDateTime = (dateString) => {
    const date = new Date(dateString);
    const turkishDate = new Date(date.getTime() + 3 * 60 * 60 * 1000);
    return turkishDate.toLocaleString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 dark:bg-black/70"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-[95vw] max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-800 p-3 sm:p-4 md:p-6 shadow-xl mx-2 sm:mx-4 md:mx-0 sm:w-[600px] md:w-[700px] lg:w-[800px]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg sm:text-xl font-semibold dark:text-slate-100">
            <span className="hidden sm:inline">Tarih ve Saat Seç</span>
            <span className="sm:hidden">Tarih Seç</span>
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-slate-600 flex-shrink-0"
            aria-label="Modalı kapat"
          >
            <LuX className="w-5 h-5 text-gray-600 dark:text-slate-300" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Sol taraf - YearCalendar */}
          <div>
            <div className="mb-4">
              <h4 className="text-lg font-medium mb-2 dark:text-slate-100">
                Tarih Seçin ({year})
              </h4>
              <p className="text-sm text-gray-600 dark:text-slate-300">
                Takvim üzerinden bir tarih seçin
              </p>
            </div>

            <div className="border dark:border-slate-700 rounded-lg p-4 bg-gray-50 dark:bg-slate-900">
              <YearCalendar
                reservations={reservations}
                onDateClick={handleCalendarDateClick}
                year={year}
                selectedMonth={selectedMonth}
              />
            </div>
          </div>

          {/* Sağ taraf - Saat seçimi ve rezervasyonlar */}
          <div className="space-y-6">
            {/* Saat seçimi */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Başlangıç Saati
              </label>
              <input
                type="time"
                value={selectedTime}
                onChange={handleTimeChange}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>

            {/* Seçilen tarih bilgisi */}
            {selectedDate && (
              <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-lg border dark:border-slate-700">
                <h4 className="font-medium mb-2 dark:text-slate-100">
                  Seçilen Tarih:{" "}
                  {format(selectedDate, "dd.MM.yyyy", { locale: tr })}
                </h4>
                <p className="text-sm text-gray-600 dark:text-slate-300">
                  Saat: {selectedTime}
                </p>
              </div>
            )}

            {/* O günkü rezervasyonlar */}
            {dayReservations.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 dark:text-slate-100">
                  Bu Tarihteki Rezervasyonlar ({dayReservations.length})
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {dayReservations.map((reservation) => (
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
                            {EVENT_TYPES[reservation.eventType] ||
                              reservation.eventType}
                          </div>
                          <div className="text-gray-500 dark:text-slate-500">
                            {formatTurkishDateTime(reservation.startDate)} -{" "}
                            {formatTurkishDateTime(reservation.endDate)}
                          </div>
                        </div>
                        <span
                          className={`
                          px-2 py-1 rounded text-xs font-medium
                          
                          ${
                            reservation.status === "preliminary"
                              ? "bg-yellow-100 text-yellow-800"
                              : ""
                          }
                          ${
                            reservation.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : ""
                          }
                          ${
                            reservation.status === "cancelled"
                              ? "bg-red-100 text-red-800"
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
                          {reservation.status === "cancelled" ? "İptal" : ""}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Onay butonu */}
            <div className="flex justify-end gap-2 pt-4 border-t dark:border-slate-700">
              <button
                onClick={onClose}
                className="rounded-lg border dark:border-slate-600 px-4 py-2 font-medium hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-slate-100"
              >
                İptal
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedDate}
                className="rounded-lg bg-purple-600 dark:bg-purple-700 px-4 py-2 font-medium text-white hover:bg-purple-700 dark:hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Tarihi Seç
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

DatePickerModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onDateSelect: PropTypes.func.isRequired,
  reservations: PropTypes.array,
  salonId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  year: PropTypes.number,
  selectedMonth: PropTypes.number,
  initialTime: PropTypes.string,
};
