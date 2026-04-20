import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { LuSearch, LuFilter, LuDownload, LuRefreshCw } from "react-icons/lu";
import { formatDateTime } from "../utils/dateUtils";
import { getLogs } from "../api/axios";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";

// HTTP Method'ları
const HTTP_METHODS = [
  { value: "ALL", label: "Tüm Method'lar", color: "gray" },
  { value: "GET", label: "GET", color: "blue" },
  { value: "POST", label: "POST", color: "green" },
  { value: "PUT", label: "PUT", color: "yellow" },
  { value: "DELETE", label: "DELETE", color: "red" },
];

// İşlem türleri (text alanından)
const LOG_ACTIONS = [
  { value: "ALL", label: "Tüm İşlemler" },
  { value: "LOGGED", label: "Giriş Yapıldı" },
  { value: "CREATE RESERVATION", label: "Rezervasyon Oluşturma" },
  { value: "DELETE RESERVATION", label: "Rezervasyon Silme" },
  { value: "UPDATE RESERVATION", label: "Rezervasyon Güncelleme" },
  { value: "CREATE USER", label: "Kullanıcı Oluşturma" },
  { value: "UPDATE USER", label: "Kullanıcı Güncelleme" },
  { value: "DELETE USER", label: "Kullanıcı Silme" },
  { value: "CREATE SALON", label: "Salon Oluşturma" },
  { value: "UPDATE SALON", label: "Salon Güncelleme" },
  { value: "CREATE MENU", label: "Menü Oluşturma" },
  { value: "UPDATE MENU", label: "Menü Güncelleme" },
];

export default function LogPage() {
  const { user } = useSelector((state) => state.auth);
  const [allLogs, setAllLogs] = useState([]); // Tüm loglar (backend'den gelen)
  const [filteredLogs, setFilteredLogs] = useState([]); // Filtrelenmiş loglar (frontend'de)
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("ALL");
  const [selectedAction, setSelectedAction] = useState("ALL");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalLogs: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [selectedLog, setSelectedLog] = useState(null);
  const [showBodyModal, setShowBodyModal] = useState(false);

  // Modal fonksiyonları
  const openBodyModal = useCallback((log) => {
    setSelectedLog(log);
    setShowBodyModal(true);
  }, []);

  const closeBodyModal = useCallback(() => {
    setSelectedLog(null);
    setShowBodyModal(false);
  }, []);

  // Body scroll'unu engelle
  useBodyScrollLock(showBodyModal);

  // ESC tuşu ile modal'ı kapat
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && showBodyModal) {
        closeBodyModal();
      }
    };

    if (showBodyModal) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [showBodyModal, closeBodyModal]);

  // Admin kontrolü
  const isAdmin = user?.role === "admin";

  // Log text'lerini Türkçeleştir
  const translateLogText = (text) => {
    const translations = {
      "LOGGED": "Sisteme Giriş Yapıldı",
      "CREATE RESERVATION": "Rezervasyon Oluşturuldu",
      "UPDATE RESERVATION": "Rezervasyon Güncellendi",
      "DELETE RESERVATION": "Rezervasyon İptal Edildi",
      "UPDATE RESERVATION DATE": "Rezervasyon Tarihi Değiştirildi",
      "UPDATE RESERVATION SALON+DATE": "Rezervasyon Salonu ve Tarihi Değiştirildi",
      "ADD PAYMENT RESERVATION": "Ödeme Alındı",
      "DELETE PAYMENT RESERVATION": "Ödeme Kaydı Silindi",
      "CREATE MENU": "Menü Eklendi",
      "UPDATE MENU": "Menü Güncellendi",
      "DELETE MENU": "Menü Silindi",
      "CREATE USER": "Kullanıcı Oluşturuldu",
      "UPDATE USER": "Kullanıcı Güncellendi",
      "DELETE USER": "Kullanıcı Silindi",
      "CREATE SALON": "Yeni Salon Oluşturuldu",
      "UPDATE SALON": "Salon Güncellendi",
    };
    return translations[text] || text;
  };

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      // Gerçek API'den logları getir
      const response = await getLogs({
        page: currentPage,
        limit: itemsPerPage,
      });

      setAllLogs(response.data?.logs || []);
      setPagination({
        currentPage: response.data?.page || 1,
        totalPages: response.data?.totalPages || 1,
        totalLogs: response.data?.total || 0,
        hasNextPage:
          (response.data?.page || 1) < (response.data?.totalPages || 1),
        hasPrevPage: (response.data?.page || 1) > 1,
      });
    } catch (error) {
      setAllLogs([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalLogs: 0,
        hasNextPage: false,
        hasPrevPage: false,
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  const filterLogs = useCallback(() => {
    if (!allLogs || !Array.isArray(allLogs)) {
      setFilteredLogs([]);
      return;
    }

    let filtered = [...allLogs];

    // Arama terimi - yeni veri yapısına göre (Türkçe büyük/küçük harf duyarsız)
    if (searchTerm) {
      const searchLower = searchTerm.toLocaleLowerCase("tr-TR");
      filtered = filtered.filter((log) => {
        const textMatch = log.text
          ?.toLocaleLowerCase("tr-TR")
          .includes(searchLower);
        const urlMatch = log.url
          ?.toLocaleLowerCase("tr-TR")
          .includes(searchLower);
        const userFullName = log.user
            ? `${log.user.firstName} ${log.user.lastName}`
          : "";
        const userMatch = userFullName
          .toLocaleLowerCase("tr-TR")
          .includes(searchLower);
        const methodMatch = log.method
          ?.toLocaleLowerCase("tr-TR")
          .includes(searchLower);

        return textMatch || urlMatch || userMatch || methodMatch;
      });
    }

    // HTTP Method filtreleme
    if (selectedMethod !== "ALL") {
      filtered = filtered.filter((log) => log.method === selectedMethod);
    }

    // İşlem türü (eski action yerine text)
    if (selectedAction !== "ALL") {
      filtered = filtered.filter((log) => log.text === selectedAction);
    }

    // Tarih aralığı
    if (dateRange.startDate) {
      filtered = filtered.filter(
        (log) => new Date(log.createdAt) >= new Date(dateRange.startDate)
      );
    }
    if (dateRange.endDate) {
      filtered = filtered.filter(
        (log) => new Date(log.createdAt) <= new Date(dateRange.endDate)
      );
    }

    setFilteredLogs(filtered);
  }, [allLogs, searchTerm, selectedMethod, selectedAction, dateRange]);

  useEffect(() => {
    if (isAdmin) {
      loadLogs();
    }
  }, [isAdmin, currentPage, loadLogs]);

  useEffect(() => {
    filterLogs();
  }, [
    allLogs,
    searchTerm,
    selectedMethod,
    selectedAction,
    dateRange,
    filterLogs,
  ]);

  const getMethodColor = (method) => {
    switch (method) {
      case "GET":
        return "bg-blue-100 text-blue-800";
      case "POST":
        return "bg-green-100 text-green-800";
      case "PUT":
        return "bg-yellow-100 text-yellow-800";
      case "DELETE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // const getActionLabel = (action) => {
  //   const actionObj = LOG_ACTIONS.find((a) => a.value === action);
  //   return actionObj ? actionObj.label : action;
  // };

  const formatBody = (body) => {
    if (!body) return "Yok";
    if (typeof body === "string") return body;
    return JSON.stringify(body, null, 2);
  };

  // const exportLogs = () => {
  //   if (!filteredLogs || !Array.isArray(filteredLogs)) {
  //     return;
  //   }

  //   const csvContent = [
  //     ["Tarih", "Method", "URL", "İşlem", "Kullanıcı", "Body"],
  //     ...filteredLogs.map((log) => [
  //       formatDateTime(log.createdAt),
  //       log.method,
  //       log.url,
  //       log.text,
  //       `${log.user.firstName} ${log.user.lastName}`,
  //       formatBody(log.body),
  //     ]),
  //   ]
  //     .map((row) => row.map((cell) => `"${cell}"`).join(","))
  //     .join("\n");

  //   const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  //   const link = document.createElement("a");
  //   const url = URL.createObjectURL(blob);
  //   link.setAttribute("href", url);
  //   link.setAttribute(
  //     "download",
  //     `logs_${new Date().toISOString().split("T")[0]}.csv`
  //   );
  //   link.style.visibility = "hidden";
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedMethod("ALL");
    setSelectedAction("ALL");
    setDateRange({ startDate: "", endDate: "" });
  };

  // Sayfalama - Backend'den gelen pagination bilgisi kullanılacak
  // Frontend filtreleme için mevcut sayfadaki logları göster
  const currentLogs = filteredLogs || [];

  if (!isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4">
            Erişim Reddedildi
          </h1>
          <p className="text-gray-600 dark:text-slate-300">
            Bu sayfaya erişim için admin yetkisi gereklidir.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900  p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">
            Sistem Logları
          </h1>
          <p className="text-gray-600 dark:text-slate-300">
            Sistem aktivitelerini ve kullanıcı işlemlerini takip edin
          </p>
        </div>

        {/* Filtreler ve Arama */}
        <div className="mb-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border dark:border-slate-700 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {/* Arama */}
            <div className="flex-1">
              <div className="relative">
                <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Log detaylarında ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Filtre Butonu */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <LuFilter className="w-4 h-4" />
              <span className="text-sm">
                <span className="hidden xs:inline">Filtreler</span>
                <span className="xs:hidden">Filtre</span>
              </span>
            </button>

            {/* Yenile */}
            <button
              onClick={loadLogs}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <LuRefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              <span className="text-sm">Yenile</span>
            </button>

            {/* Export */}
            {/*             <button
              onClick={exportLogs}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <LuDownload className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button> */}
          </div>

          {/* Gelişmiş Filtreler */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
              {/* Log Seviyesi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  HTTP Method
                </label>
                <select
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {HTTP_METHODS.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* İşlem Türü */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  İşlem Türü
                </label>
                <select
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {LOG_ACTIONS.map((action) => (
                    <option key={action.value} value={action.value}>
                      {action.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Başlangıç Tarihi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Başlangıç Tarihi
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  max="9999-12-31"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Bitiş Tarihi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Bitiş Tarihi
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  max="9999-12-31"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Filtre Temizle */}
          {(searchTerm ||
            selectedMethod !== "ALL" ||
            selectedAction !== "ALL" ||
            dateRange.startDate ||
            dateRange.endDate) && (
            <div className="pt-4 border-t">
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Filtreleri Temizle
              </button>
            </div>
          )}
        </div>

        {/* Sonuç Sayısı */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-slate-300">
            {filteredLogs?.length || 0} log bulundu
            {filteredLogs?.length !== allLogs?.length &&
              ` (${allLogs?.length || 0} toplam)`}
          </p>
        </div>

        {/* Log Tablosu */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border dark:border-slate-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            </div>
          ) : currentLogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-slate-300">
                Log bulunamadı
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Tablo */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                        Tarih/Saat
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                        URL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                        İşlem
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                        Kullanıcı
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                        Body
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700 dark:text-slate-300">
                    {currentLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="hover:bg-gray-50 dark:hover:bg-slate-700 dark:text-slate-300"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">
                          {formatDateTime(log.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMethodColor(
                              log.method
                            )}`}
                          >
                            {log.method}
                          </span>
                        </td>
                        <td
                          className="px-6 py-4 text-sm text-gray-900 dark:text-slate-300 max-w-xs truncate"
                          title={log.url}
                        >
                          {log.url}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">
                          {translateLogText(log.text)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">
                          {log.user
                            ? `${log.user.firstName} ${log.user.lastName}`
                            : "Bilinmeyen Kullanıcı"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-300 max-w-xs">
                          {log.body ? (
                            <button
                              onClick={() => openBodyModal(log)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 underline cursor-pointer"
                            >
                              Body Görüntüle
                            </button>
                          ) : (
                            <span className="text-gray-400 dark:text-slate-300">
                              Yok
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Kartlar */}
              <div className="lg:hidden">
                {currentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 border-b border-gray-200 dark:border-slate-700 last:border-b-0"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMethodColor(
                            log.method
                          )}`}
                        >
                          {log.method}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-slate-300">
                          {formatDateTime(log.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-slate-300">
                        {translateLogText(log.text)}
                      </h3>
                      <p className="text-sm text-gray-600 break-all">
                        {log.url}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-slate-300 mb-2">
                      <div>
                        Kullanıcı:{" "}
                        {log.user
                          ? `${log.user.firstName} ${log.user.lastName}`
                          : "Bilinmeyen Kullanıcı"}
                      </div>
                    </div>
                    {log.body && (
                      <button
                        onClick={() => openBodyModal(log)}
                        className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 underline cursor-pointer"
                      >
                        Body Görüntüle
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Sayfalama - Backend pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-slate-300">
              Sayfa {pagination.currentPage} / {pagination.totalPages} (
              {pagination.totalLogs} toplam)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={!pagination.hasPrevPage}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                Önceki
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, pagination.totalPages)
                  )
                }
                disabled={!pagination.hasNextPage}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                Sonraki
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Body Modal */}
      {showBodyModal && selectedLog && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={(e) => {
            // Sadece backdrop'a tıklandığında modal'ı kapat
            if (e.target === e.currentTarget) {
              closeBodyModal();
            }
          }}
        >
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden mx-2 sm:mx-0">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b bg-gray-50 dark:bg-slate-800">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-300">
                <span className="hidden sm:inline">Log Body Detayı</span>
                <span className="sm:hidden">Body Detayı</span>
              </h3>
              <button
                onClick={closeBodyModal}
                className="text-gray-400 hover:text-gray-600 dark:text-slate-300 dark:hover:text-slate-200 text-xl sm:text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                aria-label="Kapat"
              >
                ×
              </button>
            </div>

            <div className="p-3 sm:p-6 overflow-y-auto max-h-[calc(95vh-140px)] sm:max-h-[calc(90vh-140px)]">
              <div className="space-y-4">
                {/* Log Bilgileri */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm ">
                  <div className="flex flex-col sm:flex-row dark:text-slate-300">
                    <span className="font-medium text-gray-700 dark:text-slate-300 mb-1 sm:mb-0 sm:min-w-[60px]">
                      ID:
                    </span>
                    <span className="text-gray-900 dark:text-slate-300 sm:ml-2">
                      {selectedLog.id}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row dark:text-slate-300">
                    <span className="font-medium text-gray-700 dark:text-slate-300 mb-1 sm:mb-0 sm:min-w-[80px]">
                      Method:
                    </span>
                    <span
                      className={`sm:ml-2 px-2 py-1 text-xs font-semibold rounded-full inline-block w-fit ${getMethodColor(
                        selectedLog.method
                      )}`}
                    >
                      {selectedLog.method}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:col-span-2">
                    <span className="font-medium text-gray-700 dark:text-slate-300 mb-1 sm:mb-0 sm:min-w-[60px]">
                      URL:
                    </span>
                    <span className="text-gray-900 dark:text-slate-300 break-all sm:ml-2">
                      {selectedLog.url}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row">
                    <span className="font-medium text-gray-700 dark:text-slate-300 mb-1 sm:mb-0 sm:min-w-[80px]">
                      İşlem:
                    </span>
                    <span className="text-gray-900 dark:text-slate-300 sm:ml-2">
                      {translateLogText(selectedLog.text)}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row">
                    <span className="font-medium text-gray-700 dark:text-slate-300 mb-1 sm:mb-0 sm:min-w-[80px]">
                      Kullanıcı:
                    </span>
                    <span className="text-gray-900 dark:text-slate-300 sm:ml-2">
                      {selectedLog.user.firstName} {selectedLog.user.lastName}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:col-span-2">
                    <span className="font-medium text-gray-700 dark:text-slate-300 mb-1 sm:mb-0 sm:min-w-[60px]">
                      Tarih:
                    </span>
                    <span className="text-gray-900 dark:text-slate-300 sm:ml-2">
                      {formatDateTime(selectedLog.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Body İçeriği */}
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Body İçeriği:
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border dark:bg-slate-800">
                    <pre className="text-xs sm:text-sm text-gray-900 dark:text-slate-300 whitespace-pre-wrap overflow-auto max-h-60 sm:max-h-80">
                      {formatBody(selectedLog.body)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-0 p-3 sm:p-6 border-t bg-gray-50 dark:bg-slate-800">
              <button
                onClick={closeBodyModal}
                className="w-full sm:w-auto px-4 py-2 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors text-sm sm:text-base font-medium"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
