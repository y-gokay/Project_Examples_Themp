import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useUrlPagination from "../hooks/useUrlPagination";
import useScrollRestoration from "../hooks/useScrollRestoration";
import {
  getAllBusinesses,
  approveBusiness,
  rejectBusiness,
  createBusiness,
  deleteBusiness,
  restoreBusiness,
} from "../api/businessService";
import { getBasicStats } from "../api/dashboardService";
import { getSectors, getBusinessRoles } from "../api/lookupService";
import MainLayout from "../components/layout/MainLayout";
import {
  showError,
  showConfirm,
  showSuccess,
  showWarning,
} from "../utils/swal";
import {
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import ModalBase from "../components/ui/ModalBase";
import { SkeletonCard } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import Breadcrumb from "../components/ui/Breadcrumb";
import FieldError from "../components/ui/FieldError";

const Businesses = () => {
  useScrollRestoration();
  const navigate = useNavigate();
  const location = useLocation();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useUrlPagination(10);
  const [filter, setFilter] = useState(true); // null: pending, true: approved, false: rejected
  const [showDeleted, setShowDeleted] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [basicStats, setBasicStats] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const isApprovedParam = params.get("isApproved");

    if (isApprovedParam !== null) {
      if (isApprovedParam === "null") setFilter(null);
      else if (isApprovedParam === "true") setFilter(true);
      else if (isApprovedParam === "false") setFilter(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchBusinesses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filter, debouncedSearchTerm, showDeleted]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getBasicStats();
        const data = res?.data || res;
        if (data) {
          setBasicStats(data);
        }
      } catch (error) {
        console.error("Error fetching basic stats for businesses:", error);
        setBasicStats(null);
      }
    };
    fetchStats();
  }, []);

  const businessStatsForView = useMemo(() => {
    // Top stats: sayfalama filtresinden bağımsız, basic stats endpointinden gelsin.
    const total =
      basicStats?.businesses?.total ??
      pagination.total ??
      businesses.length ??
      0;

    const approved =
      basicStats?.businesses?.approved ??
      businesses.filter((b) => b.isApproved === true).length;

    const pending =
      basicStats?.businesses?.pending ??
      businesses.filter((b) => b.isApproved === null).length;

    // basic stats bazı versiyonlarda sadece approved/pending gönderiyor; rejected = total - approved - pending
    const rejected =
      basicStats?.businesses?.rejected ??
      Math.max(0, Number(total) - Number(approved) - Number(pending));

    const deleted = Number(basicStats?.businesses?.deleted ?? 0);
    return {
      total,
      approved,
      pending,
      rejected,
      deleted,
    };
  }, [businesses, pagination.total, basicStats]);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const response = await getAllBusinesses({
        page: pagination.page,
        limit: pagination.limit,
        isApproved: filter,
        includeDeleted: showDeleted,
      });

      if (response.success) {
        let filteredBusinesses = response.data.businesses;

        // Search filter
        if (debouncedSearchTerm.trim()) {
          filteredBusinesses = filteredBusinesses.filter((business) =>
            business.businessName
              .toLowerCase()
              .includes(debouncedSearchTerm.toLowerCase().trim()),
          );
        }

        setBusinesses(filteredBusinesses);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching businesses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setActionLoading({ ...actionLoading, [id]: "approve" });
      await approveBusiness(id);
      await fetchBusinesses();
    } catch (error) {
      console.error("Error approving business:", error);
      showError("Hata", "Onaylama işlemi başarısız oldu.");
    } finally {
      setActionLoading({ ...actionLoading, [id]: null });
    }
  };

  const handleReject = async (id) => {
    const result = await showConfirm(
      "İşletmeyi Reddet",
      "Bu işletmeyi reddetmek istediğinize emin misiniz?",
      "Evet, Reddet",
      "İptal",
    );

    if (!result.isConfirmed) {
      return;
    }

    try {
      setActionLoading({ ...actionLoading, [id]: "reject" });
      await rejectBusiness(id);
      await fetchBusinesses();
      showSuccess("Başarılı", "İşletme başarıyla reddedildi.");
    } catch (error) {
      console.error("Error rejecting business:", error);
      showError("Hata", "Reddetme işlemi başarısız oldu.");
    } finally {
      setActionLoading({ ...actionLoading, [id]: null });
    }
  };

  const handleViewDetail = (id) => {
    navigate(`/dashboard/businesses/${id}`);
  };

  const handleDeleteBusiness = async (id) => {
    const result = await showConfirm(
      "İşletmeyi Sil",
      "Bu işletmeyi silmek istediğinize emin misiniz?",
      "Evet, Sil",
      "İptal",
    );

    if (!result.isConfirmed) {
      return;
    }

    try {
      setActionLoading({ ...actionLoading, [id]: "delete" });
      await deleteBusiness(id);
      await fetchBusinesses();
      showSuccess("Başarılı", "İşletme başarıyla silindi.");
    } catch (error) {
      console.error("Error deleting business:", error);
      showError("Hata", "İşletme silinirken bir hata oluştu.");
    } finally {
      setActionLoading({ ...actionLoading, [id]: null });
    }
  };

  const handleRestoreBusiness = async (id) => {
    const result = await showConfirm(
      "İşletmeyi Geri Getir",
      "Bu işletmeyi geri getirmek istediğinize emin misiniz?",
      "Evet, Geri Getir",
      "İptal",
    );

    if (!result.isConfirmed) {
      return;
    }

    try {
      setActionLoading({ ...actionLoading, [id]: "restore" });
      await restoreBusiness(id);
      await fetchBusinesses();
      showSuccess("Başarılı", "İşletme başarıyla geri getirildi.");
    } catch (error) {
      console.error("Error restoring business:", error);
      showError("Hata", "İşletme geri getirilirken bir hata oluştu.");
    } finally {
      setActionLoading({ ...actionLoading, [id]: null });
    }
  };

  const getStatusBadge = (isApproved) => {
    if (isApproved === true) {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-semibold">
          Onaylandı
        </span>
      );
    } else if (isApproved === false) {
      return (
        <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-semibold">
          Reddedildi
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-xs font-semibold">
          Beklemede
        </span>
      );
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 w-full max-w-full overflow-x-hidden">
        <Breadcrumb />
        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Toplam İşletme
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {businessStatsForView.total}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Onaylı İşletme
            </p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              {businessStatsForView.approved}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Onay Bekleyen İşletme
            </p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {businessStatsForView.pending}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Reddedilmiş İşletme
            </p>
            <p className="text-2xl font-bold text-rose-700 dark:text-rose-400">
              {businessStatsForView.rejected}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Silinmiş İşletme
            </p>
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-200">
              {businessStatsForView.deleted}
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-100 dark:border-gray-700">
          <div className="mb-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-400" />
              <input
                type="text"
                placeholder="İşletme adına göre ara..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPagination({ ...pagination, page: 1 });
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setFilter(true);
                  setPagination({ ...pagination, page: 1 });
                }}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                  filter === true
                    ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg transform scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Onaylananlar
              </button>
              <button
                onClick={() => {
                  setFilter(false);
                  setPagination({ ...pagination, page: 1 });
                }}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                  filter === false
                    ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg transform scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Reddedilenler
              </button>
              <button
                onClick={() => {
                  setFilter(null);
                  setPagination({ ...pagination, page: 1 });
                }}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                  filter === null
                    ? "bg-gradient-to-r from-yellow-600 to-yellow-700 text-white shadow-lg transform scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Bekleyenler
              </button>
            </div>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                <input
                  type="checkbox"
                  checked={showDeleted}
                  onChange={(e) => setShowDeleted(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded"
                />
                Silinmiş işletmeleri göster
              </label>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
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
                Yeni İşletme
              </button>
            </div>
          </div>
        </div>

        {/* Business List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 w-full max-w-full min-w-0">
          {loading ? (
            <div className="p-6 grid grid-cols-1 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : businesses.length === 0 ? (
            <EmptyState
              preset="noResults"
              title="İşletme bulunamadı"
              description="Filtre veya arama kriterlerinizi değiştirerek tekrar deneyin."
              actionLabel="Yeni İşletme Ekle"
              onAction={() => setShowCreateModal(true)}
            />
          ) : (
            <>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-6">
                  {businesses.map((business) => (
                    <div
                      key={business.id}
                      className={`border border-gray-200 dark:border-gray-600 rounded-xl p-6 hover:shadow-lg transition-all ${
                        business.isDeleted
                          ? "bg-gray-100 dark:bg-gray-700"
                          : "bg-white dark:bg-gray-800"
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <BuildingOfficeIcon className="w-6 h-6 text-blue-600 dark:text-orange-400" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                              {business.businessName}
                            </h3>
                            {business.pendingChangeRequestsCount > 0 && (
                              <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-xs font-semibold">
                                Bekleyen Değişiklik:{" "}
                                {business.pendingChangeRequestsCount}
                              </span>
                            )}
                          </div>
                          {getStatusBadge(business.isApproved)}
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <button
                            onClick={() => handleViewDetail(business.id)}
                            className="px-3 py-1.5 bg-blue-100 text-blue-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-lg hover:bg-blue-200 dark:hover:bg-orange-800/40 text-xs font-medium flex items-center gap-1"
                          >
                            <EyeIcon className="w-4 h-4" />
                            Detay
                          </button>
                          {business.isDeleted ? (
                            <button
                              onClick={() => handleRestoreBusiness(business.id)}
                              disabled={
                                actionLoading[business.id] === "restore"
                              }
                              className="px-3 py-1.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/40 text-xs font-medium flex items-center gap-1 disabled:opacity-50"
                            >
                              <CheckCircleIcon className="w-4 h-4" />
                              {actionLoading[business.id] === "restore"
                                ? "Geri Getiriliyor..."
                                : "Geri Getir"}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDeleteBusiness(business.id)}
                              disabled={actionLoading[business.id] === "delete"}
                              className="px-3 py-1.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/40 text-xs font-medium flex items-center gap-1 disabled:opacity-50"
                            >
                              <TrashIcon className="w-4 h-4" />
                              {actionLoading[business.id] === "delete"
                                ? "Siliniyor..."
                                : "Sil"}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Business Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-start gap-3">
                          <EnvelopeIcon className="w-5 h-5 text-gray-400 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                              E-posta
                            </p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {business.businessEmail}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <PhoneIcon className="w-5 h-5 text-gray-400 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                              Telefon
                            </p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {business.businessContactPhoneNumber}
                            </p>
                          </div>
                        </div>

                        {business.address && (
                          <div className="flex items-start gap-3">
                            <MapPinIcon className="w-5 h-5 text-gray-400 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                                Adres
                              </p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                                {business.address}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-start gap-3">
                          <UsersIcon className="w-5 h-5 text-gray-400 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                              Çalışan Sayısı
                            </p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {business.workerCount}
                            </p>
                          </div>
                        </div>

                        {business.vergiNo && (
                          <div className="flex items-start gap-3">
                            <div className="w-5 h-5 flex-shrink-0"></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                                Vergi No
                              </p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {business.vergiNo}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Sectors */}
                      {business.sectors && business.sectors.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            Sektörler
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {business.sectors.map((sectorItem) => (
                              <span
                                key={sectorItem.id}
                                className="px-2 py-1 bg-blue-50 text-blue-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-lg text-xs font-semibold"
                              >
                                {sectorItem.sector.sector}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      {business.description && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Açıklama
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-200 line-clamp-3">
                            {business.description}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      {business.isApproved === null && (
                        <div
                          className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-600"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleApprove(business.id)}
                            disabled={actionLoading[business.id] === "approve"}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/40 font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                            {actionLoading[business.id] === "approve"
                              ? "Onaylanıyor..."
                              : "Onayla"}
                          </button>
                          <button
                            onClick={() => handleReject(business.id)}
                            disabled={actionLoading[business.id] === "reject"}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/40 font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <XCircleIcon className="w-4 h-4" />
                            {actionLoading[business.id] === "reject"
                              ? "Reddediliyor..."
                              : "Reddet"}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-600">
                  <div className="text-sm text-gray-700 dark:text-gray-200">
                    Toplam{" "}
                    <span className="font-medium">{pagination.total}</span>{" "}
                    işletme
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setPagination({
                          ...pagination,
                          page: pagination.page - 1,
                        })
                      }
                      disabled={pagination.page === 1}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Önceki
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                      Sayfa {pagination.page} / {pagination.totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setPagination({
                          ...pagination,
                          page: pagination.page + 1,
                        })
                      }
                      disabled={pagination.page >= pagination.totalPages}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sonraki
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Business Modal */}
      {showCreateModal && (
        <CreateBusinessModal
          onClose={() => {
            setShowCreateModal(false);
            fetchBusinesses();
          }}
        />
      )}
    </MainLayout>
  );
};

// Helper functions
const formatPhoneNumberDisplay = (phone) => {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 0) return "";
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6)
    return `0(${cleaned.slice(1, 4)}) ${cleaned.slice(4)}`;
  if (cleaned.length <= 8)
    return `0(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  return `0(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
};

const normalizePhoneNumber = (phone) => {
  if (!phone) return "";
  return phone.replace(/\D/g, "");
};

const validatePhoneNumber = (phone) => {
  const cleaned = normalizePhoneNumber(phone);
  if (!cleaned) {
    return { isValid: false, error: "Telefon numarası zorunludur" };
  }
  if (cleaned.length < 10 || cleaned.length > 11) {
    return { isValid: false, error: "Telefon numarası 10-11 haneli olmalıdır" };
  }
  if (!cleaned.startsWith("0") && cleaned.length === 10) {
    return { isValid: false, error: "Telefon numarası 0 ile başlamalıdır" };
  }
  return { isValid: true };
};

const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, error: "Şifre zorunludur" };
  }
  if (password.length < 8) {
    return { isValid: false, error: "Şifre en az 8 karakter olmalıdır" };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: "Şifre en az bir küçük harf içermelidir" };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: "Şifre en az bir büyük harf içermelidir" };
  }
  return { isValid: true };
};

// Create Business Modal Component
const CreateBusinessModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    businessName: "",
    address: "",
    businessEmail: "",
    businessContactPhoneNumber: "",
    workerCount: "",
    description: "",
    vergiNo: "",
    businessSectors: [],
    accountData: {
      tc: "",
      name: "",
      surname: "",
      email: "",
      password: "",
      passwordConfirm: "",
      phoneNumber: "",
      roleId: "",
    },
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [lookups, setLookups] = useState({
    sectors: [],
    businessRoles: [],
  });
  const [lookupsLoading, setLookupsLoading] = useState(true);

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        setLookupsLoading(true);
        const [sectorsRes, rolesRes] = await Promise.all([
          getSectors().catch(() => ({ success: false, data: [] })),
          getBusinessRoles().catch(() => ({ success: false, data: [] })),
        ]);

        setLookups({
          sectors: sectorsRes.success ? sectorsRes.data : [],
          businessRoles: rolesRes.success ? rolesRes.data : [],
        });
      } catch (error) {
        console.error("Error fetching lookups:", error);
      } finally {
        setLookupsLoading(false);
      }
    };

    fetchLookups();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      accountData: {
        ...prev.accountData,
        [name]: value,
      },
    }));
    if (errors[`accountData.${name}`]) {
      setErrors((prev) => ({ ...prev, [`accountData.${name}`]: "" }));
    }
  };

  const handleSectorChange = (sectorId) => {
    setFormData((prev) => {
      const sectors = prev.businessSectors || [];
      if (sectors.includes(sectorId)) {
        return {
          ...prev,
          businessSectors: sectors.filter((id) => id !== sectorId),
        };
      } else {
        return {
          ...prev,
          businessSectors: [...sectors, sectorId],
        };
      }
    });
    if (errors.businessSectors) {
      setErrors((prev) => ({ ...prev, businessSectors: "" }));
    }
  };

  const workerCountOptions = [
    { value: "", label: "Seçiniz", disabled: true },
    { value: "1-10", label: "1-10" },
    { value: "10-50", label: "10-50" },
    { value: "50-100", label: "50-100" },
    { value: "100+", label: "100+" },
  ];

  const validateForm = () => {
    const newErrors = {};

    // Business Info
    if (!formData.businessName) {
      newErrors.businessName = "Şirket adı zorunludur";
    }
    if (!formData.address) {
      newErrors.address = "Adres zorunludur";
    }
    if (
      formData.businessEmail &&
      !/\S+@\S+\.\S+/.test(formData.businessEmail)
    ) {
      newErrors.businessEmail = "Geçerli bir e-posta adresi giriniz";
    }
    if (!formData.businessContactPhoneNumber) {
      newErrors.businessContactPhoneNumber =
        "Şirket telefon numarası zorunludur";
    } else {
      const validation = validatePhoneNumber(
        formData.businessContactPhoneNumber,
      );
      if (!validation.isValid) {
        newErrors.businessContactPhoneNumber =
          validation.error || "Geçerli bir telefon numarası giriniz";
      }
    }
    if (!formData.workerCount) {
      newErrors.workerCount = "Çalışan sayısı zorunludur";
    }
    if (
      formData.vergiNo &&
      (formData.vergiNo.length < 10 || formData.vergiNo.length > 11)
    ) {
      newErrors.vergiNo = "Vergi numarası 10-11 haneli olmalıdır";
    }
    if (formData.businessSectors.length === 0) {
      newErrors.businessSectors = "En az bir sektör seçmelisiniz";
    }

    // Personal Info (yetkili kişi alanları opsiyonel)
    const hasAnyAccountField =
      formData.accountData.tc ||
      formData.accountData.name ||
      formData.accountData.surname ||
      formData.accountData.email ||
      formData.accountData.phoneNumber ||
      formData.accountData.password ||
      formData.accountData.passwordConfirm ||
      formData.accountData.roleId;

    if (hasAnyAccountField) {
      if (
        formData.accountData.tc &&
        !/^\d{11}$/.test(formData.accountData.tc.replace(/\s/g, ""))
      ) {
        newErrors["accountData.tc"] = "TC Kimlik No 11 haneli olmalıdır";
      }
      if (
        formData.accountData.email &&
        !/\S+@\S+\.\S+/.test(formData.accountData.email)
      ) {
        newErrors["accountData.email"] = "Geçerli bir e-posta adresi giriniz";
      }
      if (formData.accountData.phoneNumber) {
        const validation = validatePhoneNumber(
          formData.accountData.phoneNumber,
        );
        if (!validation.isValid) {
          newErrors["accountData.phoneNumber"] =
            validation.error || "Geçerli bir telefon numarası giriniz";
        }
      }
      if (formData.accountData.password) {
        const passwordValidation = validatePassword(
          formData.accountData.password,
        );
        if (!passwordValidation.isValid) {
          newErrors["accountData.password"] = passwordValidation.error;
        }
      }
      if (
        formData.accountData.password ||
        formData.accountData.passwordConfirm
      ) {
        if (!formData.accountData.passwordConfirm) {
          newErrors["accountData.passwordConfirm"] = "Şifre tekrarı zorunludur";
        } else if (
          formData.accountData.password !== formData.accountData.passwordConfirm
        ) {
          newErrors["accountData.passwordConfirm"] = "Şifreler eşleşmiyor";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstErrorKey = Object.keys(errors)[0];
      const firstErrorMessage = errors[firstErrorKey];
      if (firstErrorMessage) {
        showWarning("Uyarı", firstErrorMessage);
      } else {
        showWarning("Uyarı", "Lütfen tüm zorunlu alanları doldurun");
      }
      if (firstErrorKey) {
        const element = document.querySelector(`[name="${firstErrorKey}"]`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      return;
    }

    try {
      setLoading(true);
      const submitData = {
        businessName: formData.businessName,
        address: formData.address,
        businessEmail: formData.businessEmail,
        businessContactPhoneNumber: normalizePhoneNumber(
          formData.businessContactPhoneNumber,
        ),
        workerCount: formData.workerCount,
        description: formData.description || "",
        vergiNo: formData.vergiNo,
        businessSectors: formData.businessSectors.map((id) => parseInt(id)),
      };

      const hasAnyAccountField =
        formData.accountData.tc ||
        formData.accountData.name ||
        formData.accountData.surname ||
        formData.accountData.email ||
        formData.accountData.phoneNumber ||
        formData.accountData.password ||
        formData.accountData.passwordConfirm ||
        formData.accountData.roleId;

      if (hasAnyAccountField) {
        submitData.accountData = {
          tc: formData.accountData.tc || undefined,
          name: formData.accountData.name || undefined,
          surname: formData.accountData.surname || undefined,
          email: formData.accountData.email || undefined,
          password: formData.accountData.password || undefined,
          phoneNumber: formData.accountData.phoneNumber
            ? normalizePhoneNumber(formData.accountData.phoneNumber)
            : undefined,
          roleId: formData.accountData.roleId
            ? parseInt(formData.accountData.roleId)
            : undefined,
        };
      }
      const response = await createBusiness(submitData);
      if (response.success) {
        showSuccess("Başarılı", "İşletme başarıyla oluşturuldu.");
        onClose();
      }
    } catch (error) {
      console.error("Error creating business:", error);
      const responseData = error.responseData;
      if (responseData?.errors && Array.isArray(responseData.errors)) {
        const fieldErrors = {};
        const messages = [];
        responseData.errors.forEach((e) => {
          const field = e.field;
          const msg = e.message || e.msg;
          if (field) fieldErrors[field] = msg;
          if (msg) messages.push(msg);
        });
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
        showError(
          "Hata",
          messages.length
            ? messages.join("\n")
            : "İşletme oluşturulurken bir hata oluştu.",
        );
        const firstField = responseData.errors[0]?.field;
        if (firstField) {
          const el =
            document.querySelector(`[name="${firstField}"]`) ||
            (firstField.includes(".")
              ? document.querySelector(
                  `[name="${firstField.split(".").pop()}"]`,
                )
              : null);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } else {
        showError(
          "Hata",
          error.responseData?.message ||
            error.message ||
            "İşletme oluşturulurken bir hata oluştu.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (lookupsLoading) {
    return (
      <ModalBase
        isOpen={true}
        onClose={onClose}
        title="Yeni İşletme Oluştur"
        size="lg"
      >
        <div className="text-center p-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Yükleniyor...</p>
        </div>
      </ModalBase>
    );
  }

  return (
    <ModalBase
      isOpen={true}
      onClose={onClose}
      title="Yeni İşletme Oluştur"
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
          >
            İptal
          </button>
          <button
            type="submit"
            form="create-business-form"
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 font-medium transition-all shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Oluşturuluyor...
              </span>
            ) : (
              "Oluştur"
            )}
          </button>
        </div>
      }
    >
      <form
        id="create-business-form"
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Business Info */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-800 rounded-xl p-6 border border-purple-100 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <BuildingOfficeIcon className="w-4 h-4 text-white" />
            </div>
            Şirket Bilgileri
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Şirket Adı <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-400" />
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.businessName ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                  placeholder="Şirket adınız"
                />
              </div>
              <FieldError error={errors.businessName} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Vergi No{" "}
                <span className="text-gray-400 dark:text-gray-400 font-normal">
                  (Opsiyonel)
                </span>
              </label>
              <div className="relative">
                <DocumentTextIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="vergiNo"
                  value={formData.vergiNo}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 11);
                    setFormData({ ...formData, vergiNo: value });
                    if (errors.vergiNo) {
                      setErrors({ ...errors, vergiNo: "" });
                    }
                  }}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.vergiNo ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                  placeholder="10-11 haneli vergi numarası"
                  maxLength={11}
                />
              </div>
              <FieldError error={errors.vergiNo} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Adres <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-400" />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.address ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                  placeholder="Şirket adresiniz"
                />
              </div>
              <FieldError error={errors.address} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Şirket E-posta{" "}
                <span className="text-gray-400 dark:text-gray-400 font-normal">
                  (Opsiyonel)
                </span>
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-400" />
                <input
                  type="email"
                  name="businessEmail"
                  value={formData.businessEmail}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.businessEmail ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                  placeholder="info@firma.com"
                />
              </div>
              <FieldError error={errors.businessEmail} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Şirket Telefon <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-400" />
                <input
                  type="tel"
                  name="businessContactPhoneNumber"
                  value={formatPhoneNumberDisplay(
                    formData.businessContactPhoneNumber,
                  )}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, "");
                    if (cleaned.length <= 11) {
                      setFormData({
                        ...formData,
                        businessContactPhoneNumber: cleaned,
                      });
                      if (errors.businessContactPhoneNumber) {
                        setErrors({
                          ...errors,
                          businessContactPhoneNumber: "",
                        });
                      }
                    }
                  }}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.businessContactPhoneNumber ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                  placeholder="0(536) 542 58 47"
                />
              </div>
              <FieldError error={errors.businessContactPhoneNumber} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Çalışan Sayısı <span className="text-red-500">*</span>
              </label>
              <select
                name="workerCount"
                value={formData.workerCount}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.workerCount ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
              >
                {workerCountOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
              <FieldError error={errors.workerCount} />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">
                <span className="w-1.5 h-1.5 bg-purple-600 rounded-full"></span>
                Sektörler <span className="text-red-500">*</span>
              </label>
              <div className="relative p-6 border-2 border-gray-200 dark:border-gray-600 rounded-2xl bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/80 hover:border-purple-400/60 dark:hover:border-purple-500/40 transition-all duration-300 shadow-sm hover:shadow-md max-h-[220px] overflow-y-auto">
                {lookups.sectors && lookups.sectors.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {lookups.sectors.map((sector) => {
                      const isSelected = formData.businessSectors.includes(
                        sector.id?.toString(),
                      );
                      return (
                        <button
                          key={sector.id}
                          type="button"
                          onClick={() =>
                            handleSectorChange(sector.id?.toString())
                          }
                          className={`group relative px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 text-center overflow-hidden flex items-center justify-center gap-2 ${
                            isSelected
                              ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 scale-105 ring-2 ring-purple-400/50"
                              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:text-purple-700 dark:hover:text-purple-300 border-2 border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500/50 hover:bg-gradient-to-br hover:from-purple-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-800 hover:shadow-md hover:scale-105"
                          }`}
                        >
                          {isSelected && (
                            <CheckCircleIcon className="w-4 h-4 text-white" />
                          )}
                          <span className="relative z-10">
                            {sector.title || sector.name || sector.sector}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center min-h-[100px]">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Sektörler yükleniyor...
                    </span>
                  </div>
                )}
              </div>
              <FieldError error={errors.businessSectors} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Şirket Açıklaması (Opsiyonel)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Şirketiniz hakkında kısa bir açıklama"
              />
            </div>
          </div>
        </div>
      </form>
    </ModalBase>
  );
};

export default Businesses;
