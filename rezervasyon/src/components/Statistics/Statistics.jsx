import { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import LoadingSpinner from "../LoadingSpinner";
import { getDashboardStats } from "../../api/axios";
import { formatCurrency } from "../../utils/currency";
import { APP_CONSTANTS } from "../../utils/constants";

export default function Statistics({ salons }) {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === "admin";
  const allowKasa =
    isAdmin || user?.permissions?.allowKasa || user?.allowKasa || false;
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSalon] = useState(salons[0].id);
  const [statsFilters, setStatsFilters] = useState({
    dateRange: "all", // all, today, week, month, year, custom
    customStartDate: "",
    customEndDate: "",
    selectedSalonFilter: null, // İstatistikler için ayrı salon filtresi
  });

  // Tarih formatını yyyy-mm-dd'den dd-mm-yyyy'ye çeviren fonksiyon
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}.${month}.${year}`;
  };

  // Tarih aralığı hesaplama fonksiyonu
  const getStatsDateRange = useCallback(() => {
    const now = new Date();
    let startDate, endDate;

    switch (statsFilters.dateRange) {
      case "today": {
        const today = new Date();
        const pad = (n) => n.toString().padStart(2, "0");
        const yyyy = today.getFullYear();
        const mm = pad(today.getMonth() + 1);
        const dd = pad(today.getDate());
        startDate = `${yyyy}-${mm}-${dd}`;
        endDate = `${yyyy}-${mm}-${dd}`;
        break;
      }
      case "week": {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Pazartesi
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Pazar
        startDate = startOfWeek.toISOString().split("T")[0];
        endDate = endOfWeek.toISOString().split("T")[0];
        break;
      }
      case "month": {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        startDate = startOfMonth.toISOString().split("T")[0];
        endDate = endOfMonth.toISOString().split("T")[0];
        break;
      }
      case "year": {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(now.getFullYear(), 11, 31);
        startDate = startOfYear.toISOString().split("T")[0];
        endDate = endOfYear.toISOString().split("T")[0];
        break;
      }
      case "custom": {
        startDate = statsFilters.customStartDate || "";
        endDate = statsFilters.customEndDate || "";

        // Custom tarih seçimi için validasyon
        if (!startDate || !endDate) {
          // Eğer custom tarih seçilmemişse, bu ayı kullan
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          startDate = startOfMonth.toISOString().split("T")[0];
          endDate = endOfMonth.toISOString().split("T")[0];
        }
        break;
      }
      default: {
        // "all" - tüm zamanlar için geçerli tarih aralığı
        const startOfYear = new Date(2020, 0, 1); // 2020'den başla
        const endOfYear = new Date(2030, 11, 31); // 2030'a kadar
        startDate = startOfYear.toISOString().split("T")[0];
        endDate = endOfYear.toISOString().split("T")[0];
        break;
      }
    }

    return { startDate, endDate };
  }, [statsFilters]);

  // İstatistikler için dashboard stats yükleme
  const loadStatsDashboardStats = useCallback(async () => {
    // İstatistikler için salon filtresi varsa onu kullan, yoksa selectedSalon'u kullan
    const salonToUse = statsFilters.selectedSalonFilter || selectedSalon;
    if (!salonToUse) return;

    try {
      setLoading(true);
      const dateRange = getStatsDateRange();

      // Tarih parametrelerini hazırla
      const params = {
        export: false,
      };

      // Sadece geçerli tarihler varsa ekle
      if (
        dateRange.startDate &&
        dateRange.startDate !== "" &&
        dateRange.startDate !== "Invalid Date"
      ) {
        params.startDate = dateRange.startDate;
      }
      if (
        dateRange.endDate &&
        dateRange.endDate !== "" &&
        dateRange.endDate !== "Invalid Date"
      ) {
        params.endDate = dateRange.endDate;
      }

      const res = await getDashboardStats(salonToUse, params);
      const statsData = res.data;

      setDashboardStats(statsData);
    } catch {
      setDashboardStats(null);
    } finally {
      setLoading(false);
    }
  }, [selectedSalon, statsFilters.selectedSalonFilter, getStatsDateRange]);

  useEffect(() => {
    loadStatsDashboardStats();
  }, [loadStatsDashboardStats]);

  // selectedSalon değiştiğinde istatistikler salon filtresini güncelle
  useEffect(() => {
    if (selectedSalon && !statsFilters.selectedSalonFilter) {
      setStatsFilters((prev) => ({
        ...prev,
        selectedSalonFilter: selectedSalon,
      }));
    }
  }, [selectedSalon, statsFilters.selectedSalonFilter]);

  // Loading durumunda tüm sayfayı değiştirmek yerine sadece içeriği değiştir

  // Salon listesi ve seçili salon yüklenene kadar bekle
  if (!salons || salons.length === 0 || !selectedSalon) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner message="Salonlar yükleniyor..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:flex-wrap gap-3 mb-6">
          <h2 className="text-2xl font-bold mb-4 sm:mb-0 dark:text-slate-100">
            Rezervasyon İstatistikleri
          </h2>

          {/* Filtreleme UI */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Salon Filtresi */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Salon:
              </label>
              <select
                value={statsFilters.selectedSalonFilter || ""}
                onChange={(e) =>
                  setStatsFilters((prev) => ({
                    ...prev,
                    selectedSalonFilter: e.target.value ? e.target.value : null,
                  }))
                }
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={null}>Tümü</option>
                {salons.map((salon) => (
                  <option key={salon.id} value={salon.id}>
                    {salon.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  setStatsFilters((prev) => ({
                    ...prev,
                    dateRange: "today",
                  }))
                }
                className={`px-3 py-1.5 text-sm rounded-lg ${
                  statsFilters.dateRange === "today"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-600"
                }`}
              >
                Bugün
              </button>
              <button
                onClick={() =>
                  setStatsFilters((prev) => ({
                    ...prev,
                    dateRange: "week",
                  }))
                }
                className={`px-3 py-1.5 text-sm rounded-lg ${
                  statsFilters.dateRange === "week"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-600"
                }`}
              >
                Bu Hafta
              </button>
              <button
                onClick={() =>
                  setStatsFilters((prev) => ({
                    ...prev,
                    dateRange: "month",
                  }))
                }
                className={`px-3 py-1.5 text-sm rounded-lg ${
                  statsFilters.dateRange === "month"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-600"
                }`}
              >
                Bu Ay
              </button>
              <button
                onClick={() =>
                  setStatsFilters((prev) => ({
                    ...prev,
                    dateRange: "year",
                  }))
                }
                className={`px-3 py-1.5 text-sm rounded-lg ${
                  statsFilters.dateRange === "year"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-600"
                }`}
              >
                Bu Yıl
              </button>
              <button
                onClick={() =>
                  setStatsFilters((prev) => ({
                    ...prev,
                    dateRange: "all",
                  }))
                }
                className={`px-3 py-1.5 text-sm rounded-lg ${
                  statsFilters.dateRange === "all"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-600"
                }`}
              >
                Tümü
              </button>
              <button
                onClick={() =>
                  setStatsFilters((prev) => ({
                    ...prev,
                    dateRange: "custom",
                  }))
                }
                className={`px-3 py-1.5 text-sm rounded-lg ${
                  statsFilters.dateRange === "custom"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-600"
                }`}
              >
                Özel Aralık
              </button>
            </div>
          </div>
        </div>

        {/* Özel tarih aralığı seçimi */}
        {statsFilters.dateRange === "custom" && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border dark:border-slate-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">
              Tarih Aralığı Seçin
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">
                  Başlangıç Tarihi
                </label>
                <input
                  type="date"
                  value={statsFilters.customStartDate}
                  onChange={(e) =>
                    setStatsFilters((prev) => ({
                      ...prev,
                      customStartDate: e.target.value,
                    }))
                  }
                  max="9999-12-31"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">
                  Bitiş Tarihi
                </label>
                <input
                  type="date"
                  value={statsFilters.customEndDate}
                  onChange={(e) =>
                    setStatsFilters((prev) => ({
                      ...prev,
                      customEndDate: e.target.value,
                    }))
                  }
                  max="9999-12-31"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {!statsFilters.selectedSalonFilter && !selectedSalon ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-slate-300">
              İstatistikleri görüntülemek için bir salon seçin
            </p>
          </div>
        ) : !dashboardStats ? (
          <LoadingSpinner message="İstatistikler yükleniyor..." size={28} />
        ) : (
          <div className="relative min-w-0">
            {/* Loading overlay */}
            {loading && (
              <div className="absolute inset-0 bg-white dark:bg-slate-800 bg-opacity-75 dark:bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                <LoadingSpinner message="Güncelleniyor..." size={24} />
              </div>
            )}

            {/* Seçilen tarih aralığı bilgisi */}
            <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2"
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
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  {statsFilters.dateRange === "today" && "Bugün"}
                  {statsFilters.dateRange === "week" && "Bu Hafta"}
                  {statsFilters.dateRange === "month" && "Bu Ay"}
                  {statsFilters.dateRange === "year" && "Bu Yıl"}
                  {statsFilters.dateRange === "all" && "Tüm Zamanlar"}
                  {statsFilters.dateRange === "custom" &&
                    `Özel Aralık: ${formatDateForDisplay(
                      statsFilters.customStartDate
                    )} - ${formatDateForDisplay(
                      statsFilters.customEndDate
                    )}`}{" "}
                  için istatistikler
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6 min-w-0">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg break-words border dark:border-blue-800">
                <h3 className="font-semibold text-blue-800 dark:text-blue-300">
                  Toplam Rezervasyon
                </h3>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {dashboardStats.reservationStats?.totalReservations || 0}
                </p>
              </div>
              {/*               <div className="bg-green-50 p-4 rounded-lg break-words">
                <h3 className="font-semibold text-green-800">Onaylanan</h3>
                <p className="text-2xl font-bold text-green-600">
                  {dashboardStats.statusStats?.find(
                    (s) => s.status === "completed"
                  )?.count || 0}
                </p>
              </div> */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg break-words border dark:border-yellow-800">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">
                  Bekleyen
                </h3>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {dashboardStats.statusStats?.find(
                    (s) => s.status === "preliminary"
                  )?.count || 0}
                </p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg break-words border dark:border-emerald-800">
                <h3 className="font-semibold text-emerald-800 dark:text-emerald-300">
                  Tamamlanan
                </h3>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {dashboardStats.statusStats?.find(
                    (s) => s.status === "completed"
                  )?.count || 0}
                </p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg break-words border dark:border-red-800">
                <h3 className="font-semibold text-red-800 dark:text-red-300">
                  İptal Edilen
                </h3>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {dashboardStats.statusStats?.find(
                    (s) => s.status === "cancelled"
                  )?.count || 0}
                </p>
              </div>
              {allowKasa && (
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg break-words border dark:border-purple-800">
                  <h3 className="font-semibold text-purple-800 dark:text-purple-300">
                    Toplam Gelir
                  </h3>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {formatCurrency(dashboardStats.financialStats?.totalRevenue)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {dashboardStats && dashboardStats.eventTypeStats && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4 dark:text-slate-100">
              Etkinlik Türü Dağılımı
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-w-0">
              {dashboardStats.eventTypeStats.map((stat) => {
                // CamelCase veya birleşik yazılmış kelimeleri düzgün formata çevir
                const formatEventType = (eventType) => {
                  if (!eventType) return "";
                  
                  // Önce APP_CONSTANTS'tan label'ı kontrol et
                  const normalType = APP_CONSTANTS.EVENT_TYPES.find(
                    (type) => type.value === eventType
                  );
                  if (normalType) return normalType.label;
                  
                  const cultureType = APP_CONSTANTS.CULTURE_EVENT_TYPES.find(
                    (type) => type.value === eventType
                  );
                  if (cultureType) return cultureType.label;
                  
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
                  return formatEventType(eventType);
                };

                return (
                  <div
                    key={stat.eventType}
                    className="bg-gray-50 dark:bg-slate-900 p-3 rounded-lg break-words border dark:border-slate-700"
                  >
                    <h4 className="font-medium dark:text-slate-100">
                      {getEventTypeLabel(stat.eventType)}
                    </h4>
                    <p className="text-xl font-bold dark:text-slate-100">
                      {stat.count}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/*         {dashboardStats && dashboardStats.menuUsage && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4 dark:text-slate-100">
              Menü Kullanım İstatistikleri
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-w-0">
              {dashboardStats.menuUsage.map((menu) => (
                <div
                  key={menu.menuName}
                  className="bg-gray-50 dark:bg-slate-900 p-3 rounded-lg break-words border dark:border-slate-700"
                >
                  <h4 className="font-medium dark:text-slate-100">
                    {menu.menuName}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-slate-300">
                    Toplam Miktar: {menu.totalQuantity}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-slate-300">
                    Sipariş Sayısı: {menu.orderCount}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
}

Statistics.propTypes = {
  selectedSalon: PropTypes.number,
  salons: PropTypes.array,
};
