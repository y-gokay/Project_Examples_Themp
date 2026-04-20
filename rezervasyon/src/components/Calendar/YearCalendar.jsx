import { useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameMonth,
  isToday,
} from "date-fns";
import { tr } from "date-fns/locale";
import { APP_CONSTANTS } from "../../utils/constants";

export default function YearCalendar({
  reservations = [],
  onDateClick,
  year,
  selectedMonth = null,
  dateChangeMode = false,
  specialDays = [],
}) {
  const selectedYear = useMemo(() => year ?? new Date().getFullYear(), [year]);

  // Tarihi UTC stringten direk alıyoruz (timezone dönüşümü yok!)
  const getDateKey = useCallback((d) => {
    try {
      return d.substring(0, 10); // "2025-09-24"
    } catch {
      return "";
    }
  }, []);

  // Saat -> stringten al
  const getHour = useCallback((d) => {
    try {
      return parseInt(d.substring(11, 13), 10); // "2025-09-24T21:00:00.000Z" -> 21
    } catch {
      return 0;
    }
  }, []);

  const months = useMemo(() => {
    const allMonths = Array.from({ length: 12 }, (_, i) => i);
    if (selectedMonth !== null) {
      return [selectedMonth];
    }
    return allMonths;
  }, [selectedMonth]);

  const byDate = useMemo(() => {
    const map = new Map();
    for (const r of reservations) {
      const key = getDateKey(r.startDate);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(r);
    }
    return map;
  }, [reservations, getDateKey]);

  // Özel günleri dateKey'e göre Map'e çevir
  const specialDaysByDate = useMemo(() => {
    const map = new Map();
    for (const specialDay of specialDays) {
      if (specialDay.dateKey) {
        map.set(specialDay.dateKey, specialDay);
      }
    }
    return map;
  }, [specialDays]);

  const toISO = useCallback((dateObj) => format(dateObj, "yyyy-MM-dd"), []);

  const renderMonth = (monthIndex) => {
    const first = new Date(selectedYear, monthIndex, 1);
    const last = endOfMonth(first);
    const monthDays = eachDayOfInterval({ start: first, end: last });

    const startPad = (getDay(first) + 6) % 7;
    const padded = [
      ...Array.from({ length: startPad }, () => null),
      ...monthDays,
    ];

    return (
      <div className="h-full rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col min-h-[280px] sm:min-h-[320px]">
        <div className="border-b border-gray-100 dark:border-slate-700 px-2 sm:px-4 py-2 sm:py-3 text-center">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-slate-100">
            {format(first, "MMMM yyyy", { locale: tr })}
          </h3>
        </div>
        <div className="grid grid-cols-7 gap-0.5 p-2 sm:p-3 text-xs text-gray-500 dark:text-slate-300">
          {APP_CONSTANTS.WEEKDAYS.map((d) => (
            <div
              key={d}
              className="px-0.5 sm:px-1 py-1 sm:py-2 text-center font-medium text-gray-600 dark:text-slate-300 text-[10px] sm:text-xs"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5 p-2 sm:p-3 pt-0 flex-1">
          {padded.map((day, idx) => {
            if (!day) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="h-12 sm:h-16 md:h-20 rounded-lg bg-transparent"
                />
              );
            }
            const dateStr = toISO(day); // yyyy-MM-dd
            const items = byDate.get(dateStr) || [];
            const isCurrentMonth = isSameMonth(day, first);
            const today = isToday(day);
            const hasReservations = items.length > 0;
            const specialDay = specialDaysByDate.get(dateStr);
            const isSpecialDay = !!specialDay;

            let reservationBgColor;
            if (today) {
              reservationBgColor = hasReservations
                ? "bg-indigo-100 dark:bg-indigo-800/40 hover:bg-indigo-200 dark:hover:bg-indigo-900/60"
                : "bg-indigo-50 dark:bg-indigo-800/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/30";
            } else if (hasReservations) {
              reservationBgColor =
                "bg-blue-50 dark:bg-blue-700/30 hover:bg-blue-100 dark:hover:bg-blue-900/50";
            } else {
              reservationBgColor = isCurrentMonth
                ? "bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700"
                : "bg-gray-50 dark:bg-slate-900 text-gray-400 dark:text-slate-600";
            }

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => onDateClick?.(dateStr)}
                title={specialDay ? specialDay.title : undefined}
                className={[
                  "relative w-full rounded-lg text-left p-1 sm:p-2 transition-all duration-200",
                  "h-12 sm:h-16 md:h-20",
                  reservationBgColor,
                  "hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1",
                  today
                    ? "border border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-200 dark:ring-indigo-800"
                    : "border border-transparent hover:border-gray-200 dark:hover:border-slate-600",
                  !today && hasReservations
                    ? "ring-1 ring-blue-200 dark:ring-blue-800"
                    : "",
                  dateChangeMode && isCurrentMonth
                    ? "hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:border-purple-300 dark:hover:border-purple-700 hover:ring-1 hover:ring-purple-200 dark:hover:ring-purple-800"
                    : "",
                ].join(" ")}
              >
                <div className="flex items-start justify-between h-full">
                  <div className="flex flex-col">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-0.5">
                        <div
                          className={[
                            "text-[10px] sm:text-xs font-medium",
                            today
                              ? "text-indigo-800 dark:text-indigo-300 font-bold"
                              : isCurrentMonth
                              ? "text-gray-900 dark:text-slate-100"
                              : "text-gray-400 dark:text-slate-600",
                          ].join(" ")}
                        >
                          {format(day, "d")}
                        </div>
                      </div>
                      {isSpecialDay && specialDay.title && (
                        <div
                          className="text-[7px] sm:text-[9px] text-orange-600 dark:text-orange-400 font-medium leading-tight truncate max-w-full"
                          title={specialDay.title}
                        >
                          Bayram
                        </div>
                      )}
                    </div>

                    {items.length > 0 && (
                      <>
                        {/* Morning/Afternoon */}
                        {(() => {
                          const morningAfternoonItems = items.filter(
                            (item) =>
                              getHour(item.startDate) <
                              APP_CONSTANTS.EVENING_HOUR_THRESHOLD
                          );
                          if (morningAfternoonItems.length === 0) return null;

                          const preliminaryCount = morningAfternoonItems.filter(
                            (item) => item.status === "preliminary"
                          ).length;
                          const completedCount = morningAfternoonItems.filter(
                            (item) => item.status === "completed"
                          ).length;
                          const cancelledCount = morningAfternoonItems.filter(
                            (item) => item.status === "cancelled"
                          ).length;

                          return (
                            <div className="absolute bottom-0.5 sm:bottom-1 left-0.5 sm:left-1 flex flex-col items-start gap-0.5">
                              {preliminaryCount > 0 && (
                                <div className="bg-yellow-500 text-white text-[8px] sm:text-[9px] font-bold px-0.5 sm:px-1 rounded-sm min-w-[10px] sm:min-w-[12px] text-center leading-none shadow">
                                  {preliminaryCount}
                                </div>
                              )}
                              {completedCount > 0 && (
                                <div className="bg-green-500 text-white text-[8px] sm:text-[9px] font-bold px-0.5 sm:px-1 rounded-sm min-w-[10px] sm:min-w-[12px] text-center leading-none shadow">
                                  {completedCount}
                                </div>
                              )}
                              {cancelledCount > 0 && (
                                <div className="bg-red-500 text-white text-[8px] sm:text-[9px] font-bold px-0.5 sm:px-1 rounded-sm min-w-[10px] sm:min-w-[12px] text-center leading-none shadow">
                                  {cancelledCount}
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {/* Evening */}
                        {(() => {
                          const eveningItems = items.filter(
                            (item) =>
                              getHour(item.startDate) >=
                              APP_CONSTANTS.EVENING_HOUR_THRESHOLD
                          );
                          if (eveningItems.length === 0) return null;

                          const preliminaryCount = eveningItems.filter(
                            (item) => item.status === "preliminary"
                          ).length;
                          const completedCount = eveningItems.filter(
                            (item) => item.status === "completed"
                          ).length;
                          const cancelledCount = eveningItems.filter(
                            (item) => item.status === "cancelled"
                          ).length;

                          return (
                            <div className="absolute bottom-0.5 sm:bottom-1 right-0.5 sm:right-1 flex flex-col items-end gap-0.5">
                              {preliminaryCount > 0 && (
                                <div className="bg-yellow-500 text-white text-[8px] sm:text-[9px] font-bold px-0.5 sm:px-1 rounded-sm min-w-[10px] sm:min-w-[12px] text-center leading-none shadow">
                                  {preliminaryCount}
                                </div>
                              )}
                              {completedCount > 0 && (
                                <div className="bg-green-500 text-white text-[8px] sm:text-[9px] font-bold px-0.5 sm:px-1 rounded-sm min-w-[10px] sm:min-w-[12px] text-center leading-none shadow">
                                  {completedCount}
                                </div>
                              )}
                              {cancelledCount > 0 && (
                                <div className="bg-red-500 text-white text-[8px] sm:text-[9px] font-bold px-0.5 sm:px-1 rounded-sm min-w-[10px] sm:min-w-[12px] text-center leading-none shadow">
                                  {cancelledCount}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-4 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {months.map((m) => (
        <div key={m} className="w-full">
          {renderMonth(m)}
        </div>
      ))}
    </div>
  );
}

YearCalendar.propTypes = {
  reservations: PropTypes.arrayOf(
    PropTypes.shape({
      startDate: PropTypes.string.isRequired,
      customerName: PropTypes.string,
      eventType: PropTypes.oneOf([
        "wedding",
        "circumcision",
        "engagement",
        "nikah",
        "henna",
        "meeting",
        "other",
      ]),
    })
  ),
  onDateClick: PropTypes.func,
  year: PropTypes.number,
  selectedMonth: PropTypes.number,
  dateChangeMode: PropTypes.bool,
  specialDays: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      date: PropTypes.number.isRequired,
      dateKey: PropTypes.string.isRequired,
      localeDateString: PropTypes.string,
    })
  ),
};
