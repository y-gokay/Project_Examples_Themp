import React, { useState, useCallback, useEffect } from "react";
import { LuDownload, LuLoader } from "react-icons/lu";
import {
  exportReservationsPDF,
  exportCashPDF,
  exportReservationsExcel,
  exportCashExcel,
  getSalons,
} from "../../api/axios";
import { translateBackendError } from "../../utils/errorTranslations";

const ExportManagement = ({ selectedSalon }) => {
  const [loading, setLoading] = useState(false);
  const [exportType, setExportType] = useState("reservations");
  const [exportFormat, setExportFormat] = useState("excel"); // excel veya pdf
  const [dateRange, setDateRange] = useState("month");
  const [customDateRange, setCustomDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [status, setStatus] = useState("all");
  const [salons, setSalons] = useState([]);
  // her zaman "Tüm Salonlar" ile başla
  const [selectedSalonId, setSelectedSalonId] = useState("");
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}.${month}.${year}`;
  };

  // Salon listesini yükle
  useEffect(() => {
    const loadSalons = async () => {
      try {
        const res = await getSalons();
        const salonsData = res.data?.salons || res.data || [];
        setSalons(Array.isArray(salonsData) ? salonsData : []);
      } catch (error) {
        /*  console.error("Salonlar yüklenirken hata:", error); */
      }
    };
    loadSalons();
  }, []);

  // Tarih aralığı hesaplayıcı (yerel 00:00–23:59:59.999)
  const getDateRange = useCallback(() => {
    const now = new Date();
    let startDate, endDate;

    if (
      dateRange === "custom" &&
      customDateRange.startDate &&
      customDateRange.endDate
    ) {
      startDate = new Date(customDateRange.startDate);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(customDateRange.endDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      switch (dateRange) {
        case "today":
          startDate = new Date();
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date();
          endDate.setHours(23, 59, 59, 999);
          break;
        case "week": {
          // Pazar başlangıçlı hafta; Pazartesi başlangıç istersen ayarlarız
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startDate = new Date(
            startOfWeek.getFullYear(),
            startOfWeek.getMonth(),
            startOfWeek.getDate(),
            0,
            0,
            0,
            0
          );
          endDate = new Date(
            startOfWeek.getFullYear(),
            startOfWeek.getMonth(),
            startOfWeek.getDate() + 6,
            23,
            59,
            59,
            999
          );
          break;
        }
        case "month":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            1,
            0,
            0,
            0,
            0
          );
          endDate = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0,
            23,
            59,
            59,
            999
          );
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
          endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
          break;
        default:
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            1,
            0,
            0,
            0,
            0
          );
          endDate = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0,
            23,
            59,
            59,
            999
          );
      }
    }

    return { startDate, endDate };
  }, [dateRange, customDateRange]);

  // YYYY-MM-DD (yerel, UTC’ye kaydırmadan)
  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // Ortak param oluşturucu (status="all" ve salon="" ise yollama)
  const buildParams = (startDate, endDate) => {
    const params = {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    };
    if (status && status !== "all") params.status = status;
    if (selectedSalonId !== "") params.salonID = selectedSalonId;
    return params;
  };

  // Excel - Rezervasyonlar
  const exportReservations = useCallback(async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = getDateRange();
      const params = buildParams(startDate, endDate);

      const response = await exportReservationsExcel(params);

      // Excel indir
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Rezervasyonlar_${formatDate(startDate)}_${formatDate(
        endDate
      )}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      /*     console.error("Excel dışa aktarma hatası:", error); */
      const errorMessage =
        translateBackendError(error) ||
        "Rezervasyonlar Excel olarak aktarılırken bir hata oluştu.";
      window.toast?.error?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getDateRange, status, selectedSalonId]);

  // Excel - Kasa
  const exportCash = useCallback(async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = getDateRange();
      const params = buildParams(startDate, endDate);

      const response = await exportCashExcel(params);

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Kasa_İşlemleri_${formatDate(startDate)}_${formatDate(
        endDate
      )}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      /* console.error("Excel dışa aktarma hatası:", error); */
      const errorMessage =
        translateBackendError(error) ||
        "Kasa işlemleri Excel olarak aktarılırken bir hata oluştu.";
      window.toast?.error?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getDateRange, status, selectedSalonId]);

  // PDF - Rezervasyonlar
  const handleExportReservationsPDF = useCallback(async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      const params = buildParams(startDate, endDate);

      const response = await exportReservationsPDF(params);

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `rezervasyonlar_${formatDate(startDate)}_${formatDate(
        endDate
      )}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      /* console.error("PDF dışa aktarma hatası:", error); */
      const errorMessage =
        translateBackendError(error) ||
        "Rezervasyonlar PDF olarak aktarılırken bir hata oluştu.";
      window.toast?.error?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getDateRange, status, selectedSalonId]);

  // PDF - Kasa
  const handleExportCashPDF = useCallback(async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      const params = buildParams(startDate, endDate);

      const response = await exportCashPDF(params);

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `kasa_islemleri_${formatDate(startDate)}_${formatDate(
        endDate
      )}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      /* console.error("PDF dışa aktarma hatası:", error); */
      const errorMessage =
        translateBackendError(error) ||
        "Kasa işlemleri PDF olarak aktarılırken bir hata oluştu.";
      window.toast?.error?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getDateRange, status, selectedSalonId]);

  // Tek tuş export
  const handleExport = () => {
    if (exportFormat === "excel") {
      if (exportType === "reservations") return exportReservations();
      if (exportType === "cash") return exportCash();
      return alert("Lütfen bir export türü seçin.");
    } else if (exportFormat === "pdf") {
      if (exportType === "reservations") return handleExportReservationsPDF();
      if (exportType === "cash") return handleExportCashPDF();
      return alert("Lütfen bir export türü seçin.");
    }
  };

  const getDateRangeLabel = (range) => {
    switch (range) {
      case "today":
        return "Bugün";
      case "week":
        return "Bu Hafta";
      case "month":
        return "Bu Ay";
      case "year":
        return "Bu Yıl";
      case "custom":
        return "Özel Tarih";
      default:
        return "Bu Ay";
    }
  };

  const resetFilters = () => {
    setSelectedSalonId("");
    setStatus("all");
    setDateRange("month"); // istersen "today"
    setCustomDateRange({ startDate: "", endDate: "" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border dark:border-slate-700">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
              Dışarıya Aktar
            </h2>
            <p className="text-gray-600 dark:text-slate-300">
              Rezervasyonlar ve kasa işlemlerini Excel veya PDF formatında
              dışarıya aktarın.
            </p>
          </div>
          <button
            onClick={resetFilters}
            className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700   text-sm font-medium"
          >
            Filtreleri Sıfırla
          </button>
        </div>
      </div>

      {/* Salon ve Durum Seçimi */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border dark:border-slate-700 ">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
          Filtre Seçenekleri
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Salon Seçimi
            </label>
            <select
              value={selectedSalonId}
              onChange={(e) => setSelectedSalonId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tüm Salonlar</option>
              {salons.map((salon) => (
                <option key={salon.id} value={salon.id}>
                  {salon.name}
                </option>
              ))}
            </select>
          </div>

          {exportType === "reservations" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Rezervasyon Durumu
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="continue">Devam Eden</option>
                <option value="cancelled">İptal Edilen</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Tarih Aralığı Seçimi */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
          Tarih Aralığı
        </h3>

        {/* Tarih Aralığı Butonları */}
        <div className="flex flex-wrap gap-2 mb-4">
          {["today", "week", "month", "year", "custom"].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateRange === range
                  ? "bg-blue-600 text-white dark:text-slate-100 dark:bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
              }`}
            >
              {getDateRangeLabel(range)}
            </button>
          ))}
        </div>

        {/* Özel Tarih Seçici */}
        {dateRange === "custom" && (
          <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Başlangıç Tarihi
                </label>
                <input
                  type="date"
                  value={customDateRange.startDate}
                  onChange={(e) =>
                    setCustomDateRange((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  max="9999-12-31"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Bitiş Tarihi
                </label>
                <input
                  type="date"
                  value={customDateRange.endDate}
                  onChange={(e) =>
                    setCustomDateRange((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  max="9999-12-31"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Export Türü Seçimi */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
          İşlem Türü
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setExportType("reservations")}
            className={`p-4 rounded-lg border-2 transition-colors ${
              exportType === "reservations"
                ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-600 dark:text-slate-100 dark:border-blue-600"
                : "border-gray-200 hover:border-gray-300 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-700"
            }`}
          >
            <div className="text-center">
              <svg
                className="w-8 h-8 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h4 className="font-medium">Rezervasyonlar</h4>
              <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">
                Tüm rezervasyon detayları
              </p>
            </div>
          </button>

          <button
            onClick={() => setExportType("cash")}
            className={`p-4 rounded-lg border-2 transition-colors ${
              exportType === "cash"
                ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-600 dark:text-slate-100 dark:border-blue-600"
                : "border-gray-200 hover:border-gray-300 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-700"
            }`}
          >
            <div className="text-center">
              <span className="w-8 h-8 mx-auto mb-2 flex items-center justify-center text-xl font-bold">
                ₺
              </span>
              <h4 className="font-medium">Kasa İşlemleri</h4>
              <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">
                Ödeme işlemleri
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Format Seçimi */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
          Dosya Formatı
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setExportFormat("excel")}
            className={`p-4 rounded-lg border-2 transition-colors ${
              exportFormat === "excel"
                ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-600 dark:text-slate-100 dark:border-green-600"
                : "border-gray-200 hover:border-gray-300 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-700"
            }`}
          >
            <div className="text-center">
              <svg
                className="w-8 h-8 mx-auto mb-2"
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
              <h4 className="font-medium">Excel (.xlsx)</h4>
              <p className="text-sm text-gray-600 dark:text-slate-200 mt-1">
                Düzenlenebilir tablo formatı
              </p>
            </div>
          </button>

          <button
            onClick={() => setExportFormat("pdf")}
            className={`p-4 rounded-lg border-2 transition-colors ${
              exportFormat === "pdf"
                ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-600 dark:text-slate-100 dark:border-red-600"
                : "border-gray-200 hover:border-gray-300 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-700"
            }`}
          >
            <div className="text-center">
              <svg
                className="w-8 h-8 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <h4 className="font-medium">PDF</h4>
              <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">
                Yazdırılabilir belge formatı
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Export Butonu */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border dark:border-slate-700">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
              {exportType === "reservations" &&
                "Rezervasyonları Dışarıya Aktar"}
              {exportType === "cash" && "Kasa İşlemlerini Dışarıya Aktar"}
            </h3>
            <p className="text-gray-600 dark:text-slate-300 mt-1">
              {dateRange === "custom"
                ? `${formatDateForDisplay(
                    customDateRange.startDate
                  )} - ${formatDateForDisplay(customDateRange.endDate)}`
                : getDateRangeLabel(dateRange)}{" "}
              verileri {exportFormat === "excel" ? "Excel" : "PDF"} formatında
              indirilecek.
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={
              loading ||
              (dateRange === "custom" &&
                (!customDateRange.startDate || !customDateRange.endDate))
            }
            className={`${
              exportFormat === "pdf" ? "btn-error" : "btn-success"
            } flex items-center gap-2 w-full sm:w-auto`}
          >
            {loading ? (
              <>
                <LuLoader className="w-4 h-4 animate-spin" />
                Aktarılıyor...
              </>
            ) : (
              <>
                <LuDownload className="w-5 h-5" />
                {exportFormat === "pdf" ? "PDF İndir" : "Excel İndir"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportManagement;
