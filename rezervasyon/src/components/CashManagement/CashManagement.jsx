import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  CalendarIcon,
  MagnifyingGlassIcon,
  CreditCardIcon,
  BanknotesIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowsRightLeftIcon,
  BuildingOfficeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { getPaymentStats, getSalons } from "../../api/axios";
import { formatCurrency } from "../../utils/currency";
import {
  formatDate,
  formatDisplayDateTime,
  getDateRange,
} from "../../utils/dateUtils";
import LoadingSpinner from "../LoadingSpinner";

const CashManagement = () => {
  // State management
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [salons, setSalons] = useState([]);

  // Filter states
  const [dateRange, setDateRange] = useState("month");
  const [customStartDate, setCustomStartDate] = useState("2024-01-01");
  const [customEndDate, setCustomEndDate] = useState("2025-12-31");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [salonId, setSalonId] = useState(null);

  // UI states
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc", // En yeni tarihler önce (kronolojik)
  });

  // Sıralama fonksiyonu
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Date range options
  const dateRangeOptions = [
    { value: "today", label: "Bugün" },
    { value: "week", label: "Bu Hafta" },
    { value: "month", label: "Bu Ay" },
    { value: "year", label: "Bu Yıl" },
    { value: "custom", label: "Özel Tarih Aralığı" },
  ];

  // Payment type options
  const paymentTypeOptions = [
    { value: "all", label: "Tüm Ödeme Türleri", icon: null },
    { value: "cash", label: "Nakit", icon: BanknotesIcon },
    { value: "card", label: "Kart", icon: CreditCardIcon },
    { value: "bank_transfer", label: "Havale", icon: ArrowsRightLeftIcon },
  ];

  // Event type translations
  const eventTypeLabels = {
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
    otherEvent: "Diğer",
  };

  // Status translations
  const statusLabels = {
    preliminary: "Ön Rezervasyon",
    confirmed: "Onaylandı",
    cancelled: "İptal Edildi",
    completed: "Tamamlandı",
  };

  // Fetch salons
  const fetchSalons = useCallback(async () => {
    try {
      const response = await getSalons();
      const salonsData = response.data?.salons || response.data || [];
      setSalons(Array.isArray(salonsData) ? salonsData : []);
    } catch (err) {
      /* console.error("Salonlar yüklenirken bir hata oluştu:", err); */
    }
  }, []);

  // Fetch payment data
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { startDate, endDate } = getDateRange(dateRange, {
        customStartDate,
        customEndDate,
      });

      const params = {
        startDate,
        endDate,
        export: false,
      };

      const response = await getPaymentStats(salonId, params);
      setPayments(response.data.payments || []);
    } catch {
      setError("Ödeme verileri yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, [dateRange, customStartDate, customEndDate, salonId]);

  // Filter and sort payments
  const filteredAndSortedPayments = useMemo(() => {
    // Önce filtrele
    const filtered = payments.filter((payment) => {
      const matchesPaymentType =
        paymentTypeFilter === "all" ||
        payment.paymentType === paymentTypeFilter;

      const searchLower = searchTerm.toLocaleLowerCase("tr-TR");

      const matchesSearch =
        searchTerm === "" ||
        payment.reservation.customerName
          ?.toLocaleLowerCase("tr-TR")
          .includes(searchLower) ||
        payment.reservation.customerPhone?.includes(searchTerm) ||
        payment.reservation.reservationNumber
          ?.toLocaleLowerCase("tr-TR")
          .includes(searchLower);

      return matchesPaymentType && matchesSearch;
    });

    // Sonra sırala
    return [...filtered].sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case "customer":
          aValue = a.reservation?.customerName || "";
          bValue = b.reservation?.customerName || "";
          break;
        case "date":
          aValue = new Date(a.paymentDate);
          bValue = new Date(b.paymentDate);
          break;
        case "amount":
          aValue = Number(a.paidAmount) || 0;
          bValue = Number(b.paidAmount) || 0;
          break;
        case "paymentType":
          aValue =
            paymentTypeOptions.find((opt) => opt.value === a.paymentType)
              ?.label ||
            a.paymentType ||
            "";
          bValue =
            paymentTypeOptions.find((opt) => opt.value === b.paymentType)
              ?.label ||
            b.paymentType ||
            "";
          break;
        case "reservation":
          aValue = a.reservation?.reservationNumber || "";
          bValue = b.reservation?.reservationNumber || "";
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [payments, paymentTypeFilter, searchTerm, sortConfig]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalAmount = filteredAndSortedPayments.reduce(
      (sum, payment) => sum + parseFloat(payment.paidAmount),
      0
    );

    const cashAmount = filteredAndSortedPayments
      .filter((p) => p.paymentType === "cash")
      .reduce((sum, payment) => sum + parseFloat(payment.paidAmount), 0);

    const cardAmount = filteredAndSortedPayments
      .filter((p) => p.paymentType === "card")
      .reduce((sum, payment) => sum + parseFloat(payment.paidAmount), 0);

    const transferAmount = filteredAndSortedPayments
      .filter((p) => p.paymentType === "bank_transfer")
      .reduce((sum, payment) => sum + parseFloat(payment.paidAmount), 0);

    return {
      total: totalAmount,
      cash: cashAmount,
      card: cardAmount,
      transfer: transferAmount,
      count: filteredAndSortedPayments.length,
    };
  }, [filteredAndSortedPayments]);

  const formatPaymentDate = (dateString) => {
    if (!dateString) return "";
    try {
      // Backend'e +3 saat eklenerek gönderildiği için, frontend'te -3 saat çıkar
      const date = new Date(dateString);
      date.setHours(date.getHours() - 3); // +3 saat geri al

      return date.toLocaleString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString.replace("T", " ").slice(0, 16);
    }
  };

  // Toggle row expansion
  const toggleRowExpansion = (paymentId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(paymentId)) {
      newExpanded.delete(paymentId);
    } else {
      newExpanded.add(paymentId);
    }
    setExpandedRows(newExpanded);
  };

  // Reset filters
  const resetFilters = () => {
    setDateRange("month");
    setPaymentTypeFilter("all");
    setSearchTerm("");
    setSalonId(1);
  };

  // Initial data fetch
  useEffect(() => {
    fetchSalons();
  }, [fetchSalons]);

  useEffect(() => {
    fetchPayments();
  }, [dateRange, customStartDate, customEndDate, salonId, fetchPayments]);

  return (
    <div className="p-4 md:p-6 bg-gray-50 dark:bg-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 mb-6 border dark:border-slate-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 font-bold text-lg">
                    ₺
                  </span>
                </div>
                Kasa Yönetimi
              </h1>
              <p className="text-gray-600 dark:text-slate-300 mt-1">
                Ödeme takibi ve kasa raporu yönetimi
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={resetFilters}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 dark:text-slate-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
                Filtreleri Temizle
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 md:p-6 mb-6 border dark:border-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {/* Salon Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                <BuildingOfficeIcon className="w-4 h-4 inline mr-1" />
                Salon
              </label>
              <select
                value={salonId}
                onChange={(e) => setSalonId(parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {/* {console.log(salons)} */}
                <option value={null}>Tüm Salonlar</option>
                {salons
                  .sort((a, b) => a.id - b.id)
                  .map((salon) => (
                    <option key={salon.id} value={salon.id}>
                      {salon.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                <CalendarIcon className="w-4 h-4 inline mr-1" />
                Tarih Aralığı
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {dateRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Date Range */}
            {dateRange === "custom" && (
              <>
                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Başlangıç Tarihi
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    max="9999-12-31"
                    className="w-full p-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Bitiş Tarihi
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    max="9999-12-31"
                    className="w-full p-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </>
            )}

            {/* Payment Type Filter */}
            <div
              className={
                dateRange === "custom" ? "sm:col-span-2 lg:col-span-1" : ""
              }
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Ödeme Türü
              </label>
              <select
                value={paymentTypeFilter}
                onChange={(e) => setPaymentTypeFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {paymentTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="sm:col-span-2 lg:col-span-3 xl:col-span-5">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                <MagnifyingGlassIcon className="w-4 h-4 inline mr-1" />
                Arama
              </label>
              <input
                type="text"
                placeholder="Müşteri adı, telefon veya rezervasyon numarası..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={fetchPayments}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              {loading ? "Yükleniyor..." : "Filtrele"}
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-slate-300">
                  Toplam Tahsilat
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(statistics.total)}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 font-bold text-lg">
                  ₺
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-slate-300">
                  Nakit
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(statistics.cash)}
                </p>
              </div>
              <BanknotesIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-slate-300">
                  Kart
                </p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(statistics.card)}
                </p>
              </div>
              <CreditCardIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-slate-300">
                  Havale
                </p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {formatCurrency(statistics.transfer)}
                </p>
              </div>
              <ArrowsRightLeftIcon className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-slate-300">
                  Toplam İşlem
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                  {statistics.count}
                </p>
              </div>
              <div className="w-8 h-8 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                <span className="text-gray-600 dark:text-slate-300 font-bold">
                  #
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden border dark:border-slate-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
              Ödeme Listesi ({filteredAndSortedPayments.length} kayıt)
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center p-12">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <div className="text-red-600 dark:text-red-400 mb-2">⚠️ Hata</div>
              <p className="text-gray-600 dark:text-slate-300">{error}</p>
              <button
                onClick={fetchPayments}
                className="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Tekrar Dene
              </button>
            </div>
          ) : filteredAndSortedPayments.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-slate-300">
              <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                <span className="text-gray-400 dark:text-slate-500 font-bold text-2xl">
                  ₺
                </span>
              </div>
              <p>Seçilen kriterlere uygun ödeme bulunamadı.</p>
            </div>
          ) : (
            <>
              {/* Desktop: Tablo Görünümü */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                  <thead className="bg-gray-50 dark:bg-slate-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                        Rezervasyon
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 select-none"
                        onClick={() => handleSort("customer")}
                      >
                        <div className="flex items-center gap-1">
                          Müşteri
                          {sortConfig.key === "customer" && (
                            <svg
                              className={`w-4 h-4 ${
                                sortConfig.direction === "asc"
                                  ? "rotate-180"
                                  : ""
                              }`}
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
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ödeme
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 select-none"
                        onClick={() => handleSort("date")}
                      >
                        <div className="flex items-center gap-1">
                          Tarih
                          {sortConfig.key === "date" && (
                            <svg
                              className={`w-4 h-4 ${
                                sortConfig.direction === "asc"
                                  ? "rotate-180"
                                  : ""
                              }`}
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
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Detay
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                    {filteredAndSortedPayments.map((payment) => (
                      <React.Fragment key={payment.id}>
                        <tr className="hover:bg-gray-50 dark:hover:bg-slate-700">
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div className="font-medium text-gray-900 dark:text-slate-100 break-words">
                                {payment.reservation.reservationNumber}
                              </div>
                              <div className="text-gray-500 dark:text-slate-300 text-xs">
                                {(payment.reservation.eventType === "other" || payment.reservation.eventType === "otherEvent") &&
                                (payment.reservation.otherEvent || payment.reservation.otherEventTitle)
                                  ? (payment.reservation.otherEvent || payment.reservation.otherEventTitle)
                                  : eventTypeLabels[
                                      payment.reservation.eventType
                                    ] || payment.reservation.eventType}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div className="font-medium text-gray-900 dark:text-slate-100 break-words">
                                {payment.reservation.customerName}
                              </div>
                              <div className="text-gray-500 dark:text-slate-300 text-xs">
                                {payment.reservation.customerPhone}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div className="font-bold text-green-600 dark:text-green-400">
                                {formatCurrency(payment.paidAmount)}
                              </div>
                              <div className="flex items-center gap-1 text-gray-500 dark:text-slate-300 text-xs">
                                {payment.paymentType === "cash" ? (
                                  <BanknotesIcon className="w-3 h-3" />
                                ) : payment.paymentType === "card" ? (
                                  <CreditCardIcon className="w-3 h-3" />
                                ) : payment.paymentType === "bank_transfer" ? (
                                  <ArrowsRightLeftIcon className="w-3 h-3" />
                                ) : null}
                                <span>
                                  {
                                    paymentTypeOptions.find(
                                      (opt) => opt.value === payment.paymentType
                                    )?.label
                                  }
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-100">
                            {formatPaymentDate(payment.paymentDate)}
                          </td>

                          <td className="px-6 py-4 text-sm font-medium">
                            <button
                              onClick={() => toggleRowExpansion(payment.id)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 flex items-center gap-1"
                            >
                              {expandedRows.has(payment.id) ? (
                                <>
                                  <ChevronUpIcon className="w-4 h-4" />
                                  <span>Gizle</span>
                                </>
                              ) : (
                                <>
                                  <ChevronDownIcon className="w-4 h-4" />
                                  <span>Detay</span>
                                </>
                              )}
                            </button>
                          </td>
                        </tr>

                        {/* Expanded row content */}
                        {expandedRows.has(payment.id) && (
                          <tr>
                            <td
                              colSpan="5"
                              className="px-6 py-4 bg-gray-50 dark:bg-slate-900"
                            >
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium text-gray-900 dark:text-slate-100 mb-2">
                                    Rezervasyon Bilgileri
                                  </h4>
                                  <div className="space-y-1 text-sm text-gray-600 dark:text-slate-300">
                                    <div>
                                      <span className="font-medium">
                                        Salon:
                                      </span>{" "}
                                      {salons.find(
                                        (s) =>
                                          s.id === payment.reservation.salonID
                                      )?.name ||
                                        `Salon ${payment.reservation.salonID}`}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Etkinlik Tarihi:
                                      </span>{" "}
                                      {formatDate(
                                        payment.reservation.startDate
                                      )}{" "}
                                      -{" "}
                                      {formatDate(payment.reservation.endDate)}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Salon Kapasitesi:
                                      </span>{" "}
                                      {payment.reservation.guestCount}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Durum:
                                      </span>{" "}
                                      {statusLabels[
                                        payment.reservation.status
                                      ] || payment.reservation.status}
                                    </div>
                                    {payment.reservation.notes && (
                                      <div>
                                        <span className="font-medium">
                                          Notlar:
                                        </span>{" "}
                                        {payment.reservation.notes}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-medium text-gray-900 dark:text-slate-100 mb-2">
                                    Mali Bilgiler
                                  </h4>
                                  <div className="space-y-1 text-sm text-gray-600 dark:text-slate-300">
                                    <div>
                                      <span className="font-medium">
                                        Toplam Tutar:
                                      </span>{" "}
                                      {formatCurrency(
                                        payment.reservation.totalPrice
                                      )}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Ödenen:
                                      </span>{" "}
                                      {formatCurrency(
                                        payment.reservation.paidAmount
                                      )}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Kalan:
                                      </span>{" "}
                                      {formatCurrency(
                                        payment.reservation.remainingAmount
                                      )}
                                    </div>
                                    {/*                                     <div>
                                      <span className="font-medium">
                                        Taksitli:
                                      </span>{" "}
                                      {payment.reservation.isInstallment
                                        ? "Evet"
                                        : "Hayır"}
                                    </div> */}
                                    {payment.reservation.discount > 0 && (
                                      <div>
                                        <span className="font-medium">
                                          İndirim:
                                        </span>{" "}
                                        {formatCurrency(
                                          payment.reservation.discount
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile: Kart Görünümü */}
              <div className="md:hidden">
                {filteredAndSortedPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="border-b border-gray-200 dark:border-slate-700 last:border-b-0"
                  >
                    <div className="p-4 space-y-3">
                      {/* Başlık: Rezervasyon Numarası ve Tutar */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 dark:text-slate-100 text-sm truncate">
                            {payment.reservation.reservationNumber}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                            {(payment.reservation.eventType === "other" || payment.reservation.eventType === "otherEvent") &&
                            (payment.reservation.otherEvent || payment.reservation.otherEventTitle)
                              ? (payment.reservation.otherEvent || payment.reservation.otherEventTitle)
                              : eventTypeLabels[
                                  payment.reservation.eventType
                                ] || payment.reservation.eventType}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-bold text-green-600 dark:text-green-400 text-base">
                            {formatCurrency(payment.paidAmount)}
                          </div>
                          <div className="flex items-center justify-end gap-1 text-gray-500 dark:text-slate-400 text-xs mt-0.5">
                            {payment.paymentType === "cash" ? (
                              <BanknotesIcon className="w-3 h-3" />
                            ) : payment.paymentType === "card" ? (
                              <CreditCardIcon className="w-3 h-3" />
                            ) : payment.paymentType === "bank_transfer" ? (
                              <ArrowsRightLeftIcon className="w-3 h-3" />
                            ) : null}
                            <span>
                              {
                                paymentTypeOptions.find(
                                  (opt) => opt.value === payment.paymentType
                                )?.label
                              }
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Müşteri Bilgileri */}
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                          {payment.reservation.customerName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-slate-400">
                          {payment.reservation.customerPhone}
                        </div>
                      </div>

                      {/* Tarih */}
                      <div className="text-xs text-gray-500 dark:text-slate-400">
                        <CalendarIcon className="w-3 h-3 inline mr-1" />
                        {new Date(payment.paymentDate).toLocaleDateString(
                          "tr-TR",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </div>

                      {/* Detay Butonu */}
                      <button
                        onClick={() => toggleRowExpansion(payment.id)}
                        className="w-full mt-2 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg flex items-center justify-center gap-1 transition-colors"
                      >
                        {expandedRows.has(payment.id) ? (
                          <>
                            <ChevronUpIcon className="w-4 h-4" />
                            Gizle
                          </>
                        ) : (
                          <>
                            <ChevronDownIcon className="w-4 h-4" />
                            Detayları Gör
                          </>
                        )}
                      </button>

                      {/* Genişletilmiş Detaylar */}
                      {expandedRows.has(payment.id) && (
                        <div className="pt-3 mt-3 border-t border-gray-200 dark:border-slate-700 space-y-4">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-slate-100 mb-2 text-sm">
                              Rezervasyon Bilgileri
                            </h4>
                            <div className="space-y-1.5 text-xs text-gray-600 dark:text-slate-300">
                              <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-slate-400">
                                  Salon:
                                </span>
                                <span className="font-medium">
                                  {salons.find(
                                    (s) => s.id === payment.reservation.salonID
                                  )?.name ||
                                    `Salon ${payment.reservation.salonID}`}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-slate-400">
                                  Etkinlik:
                                </span>
                                <span className="font-medium text-right">
                                  {formatDate(payment.reservation.startDate)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-slate-400">
                                  Misafir:
                                </span>
                                <span className="font-medium">
                                  {payment.reservation.guestCount}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-slate-400">
                                  Durum:
                                </span>
                                <span className="font-medium">
                                  {statusLabels[payment.reservation.status] ||
                                    payment.reservation.status}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-slate-100 mb-2 text-sm">
                              Mali Bilgiler
                            </h4>
                            <div className="space-y-1.5 text-xs text-gray-600 dark:text-slate-300">
                              <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-slate-400">
                                  Toplam:
                                </span>
                                <span className="font-medium">
                                  {formatCurrency(
                                    payment.reservation.totalPrice
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-slate-400">
                                  Ödenen:
                                </span>
                                <span className="font-medium text-green-600 dark:text-green-400">
                                  {formatCurrency(
                                    payment.reservation.paidAmount
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-slate-400">
                                  Kalan:
                                </span>
                                <span className="font-medium text-orange-600 dark:text-orange-400">
                                  {formatCurrency(
                                    payment.reservation.remainingAmount
                                  )}
                                </span>
                              </div>
                              {payment.reservation.discount > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500 dark:text-slate-400">
                                    İndirim:
                                  </span>
                                  <span className="font-medium">
                                    {formatCurrency(
                                      payment.reservation.discount
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CashManagement;
