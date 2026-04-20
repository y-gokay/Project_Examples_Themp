import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useUrlPagination from "../hooks/useUrlPagination";
import useScrollRestoration from "../hooks/useScrollRestoration";
import useDebounce from "../hooks/useDebounce";
import {
  getAllUsers,
  getUserById,
  sendEmailToUser,
  deleteUser,
  restoreUser,
} from "../api/userService";
import { getNationalities, getDistrictsByCity } from "../api/lookupService";
import { getBasicStats } from "../api/dashboardService";
import {
  showError,
  showSuccess,
  showWarning,
  showConfirm,
} from "../utils/swal";
import MainLayout from "../components/layout/MainLayout";
import ModalBase from "../components/ui/ModalBase";
import { SkeletonListItem } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import Breadcrumb from "../components/ui/Breadcrumb";
import {
  UserGroupIcon,
  EnvelopeIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const Users = () => {
  useScrollRestoration();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useUrlPagination(10);
  const [filters, setFilters] = useState({
    search: "",
    isApproved: null,
    gender: null,
    nationalityId: null,
    workingStatus: null,
    districtId: null,
    age: null,
    ageMin: null,
    ageMax: null,
  });
  const [showDeleted, setShowDeleted] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [basicStats, setBasicStats] = useState(null);
  const [nationalities, setNationalities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const debouncedFilters = useDebounce(filters, 400);

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [natRes, distRes] = await Promise.all([
          getNationalities(),
          getDistrictsByCity(67),
        ]);
        if (natRes.success) setNationalities(natRes.data || []);
        if (distRes.success) setDistricts(distRes.data || []);
      } catch (error) {
        console.error("Error fetching lookups:", error);
      }
    };
    fetchLookups();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, showDeleted, debouncedFilters]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getBasicStats();
        const data = res?.data || res;
        if (data) {
          setBasicStats(data);
        }
      } catch (error) {
        console.error("Error fetching basic stats for users:", error);
        setBasicStats(null);
      }
    };
    fetchStats();
  }, []);

  const userStatsForView = useMemo(() => {
    const globalUserStats = basicStats?.users;
    if (globalUserStats) {
      return {
        total: globalUserStats.total ?? 0,
        approved: globalUserStats.approved ?? 0,
        pending: globalUserStats.pending ?? 0,
      };
    }

    const total = pagination.total || users.length;
    const approved = users.filter((u) => u.isApproved === true).length;
    const pending = users.filter(
      (u) => u.isApproved === false || u.isApproved === null,
    ).length;

    return {
      total,
      approved,
      pending,
    };
  }, [basicStats, users, pagination.total]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Only send non-null filters
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(
          ([_, value]) => value !== null && value !== "",
        ),
      );

      const response = await getAllUsers({
        page: pagination.page,
        limit: pagination.limit,
        filters: activeFilters,
        includeDeleted: showDeleted,
      });

      if (response.success) {
        setUsers(response.data.users || []);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      isApproved: null,
      gender: null,
      nationalityId: null,
      workingStatus: null,
      districtId: null,
      age: null,
      ageMin: null,
      ageMax: null,
    });
    setShowDeleted(false);
    setPagination({ ...pagination, page: 1 });
  };

  const handleViewDetail = (userId) => {
    navigate(`/dashboard/users/${userId}`);
  };

  const handleOpenEmail = async (userId) => {
    try {
      const response = await getUserById(userId);
      if (response.success) {
        setSelectedUser(response.data);
        setShowEmailModal(true);
      }
    } catch (error) {
      console.error("Error fetching user for email:", error);
      showError("Hata", "Kullanıcı bilgileri yüklenemedi.");
    }
  };

  const handleSendEmail = async (userId, emailData) => {
    try {
      setActionLoading({ ...actionLoading, [`email-${userId}`]: true });
      await sendEmailToUser(userId, emailData);
      showSuccess("Başarılı", "E-posta başarıyla gönderildi.");
      setShowEmailModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error sending email:", error);
      showError("Hata", "E-posta gönderilirken bir hata oluştu.");
    } finally {
      setActionLoading({ ...actionLoading, [`email-${userId}`]: false });
    }
  };

  const handleDeleteUser = async (userId) => {
    const result = await showConfirm(
      "Kullanıcıyı Sil",
      "Bu kullanıcıyı silmek istediğinize emin misiniz?",
      "Evet, Sil",
      "İptal",
    );

    if (!result.isConfirmed) {
      return;
    }

    try {
      setActionLoading({ ...actionLoading, [`delete-${userId}`]: true });
      await deleteUser(userId);
      await fetchUsers();
      showSuccess("Başarılı", "Kullanıcı başarıyla silindi.");
    } catch (error) {
      console.error("Error deleting user:", error);
      showError("Hata", "Kullanıcı silinirken bir hata oluştu.");
    } finally {
      setActionLoading({ ...actionLoading, [`delete-${userId}`]: false });
    }
  };

  const handleRestoreUser = async (userId) => {
    const result = await showConfirm(
      "Kullanıcıyı Geri Getir",
      "Bu kullanıcıyı geri getirmek istediğinize emin misiniz?",
      "Evet, Geri Getir",
      "İptal",
    );

    if (!result.isConfirmed) {
      return;
    }

    try {
      setActionLoading({ ...actionLoading, [`restore-${userId}`]: true });
      await restoreUser(userId);
      await fetchUsers();
      showSuccess("Başarılı", "Kullanıcı başarıyla geri getirildi.");
    } catch (error) {
      console.error("Error restoring user:", error);
      showError("Hata", "Kullanıcı geri getirilirken bir hata oluştu.");
    } finally {
      setActionLoading({ ...actionLoading, [`restore-${userId}`]: false });
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
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-xs font-semibold">
          Beklemede
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded-full text-xs font-semibold">
          Bilinmiyor
        </span>
      );
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-full overflow-x-hidden">
        <Breadcrumb />
        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Toplam Kullanıcı
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {userStatsForView.total}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Onaylı Kullanıcı
            </p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              {userStatsForView.approved}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Onay Bekleyen Kullanıcı
            </p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {userStatsForView.pending}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Toplam Başvuru
            </p>
            <p className="text-2xl font-bold text-indigo-700 dark:text-orange-400">
              {basicStats?.applications?.total ?? 0}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-100 dark:border-gray-700">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 font-semibold flex items-center gap-2"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
              {showFilters ? "Filtreleri Gizle" : "Filtrele"}
            </button>
          </div>
          {showFilters && (
            <div className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Ara (İsim, Soyisim, TC, Tel, Email)
                  </label>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ara..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Onay Durumu
                  </label>
                  <select
                    value={
                      filters.isApproved === null ? "" : filters.isApproved
                    }
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        isApproved:
                          e.target.value === ""
                            ? null
                            : e.target.value === "true",
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Tümü</option>
                    <option value="true">Onaylandı</option>
                    <option value="false">Beklemede</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Cinsiyet
                  </label>
                  <select
                    value={filters.gender || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, gender: e.target.value || null })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Tümü</option>
                    <option value="male">Erkek</option>
                    <option value="female">Kadın</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Çalışma Durumu
                  </label>
                  <select
                    value={
                      filters.workingStatus === null
                        ? ""
                        : filters.workingStatus
                    }
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        workingStatus:
                          e.target.value === ""
                            ? null
                            : e.target.value === "true",
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Tümü</option>
                    <option value="true">Çalışıyor</option>
                    <option value="false">Çalışmıyor</option>
                  </select>
                </div>
                {/*                 <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Yaş
                  </label>
                  <input
                    type="number"
                    value={filters.age || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        age: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Yaş"
                  />
                </div> */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Yaş Aralığı (Min)
                  </label>
                  <input
                    type="number"
                    value={filters.ageMin || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        ageMin: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Min yaş"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Yaş Aralığı (Max)
                  </label>
                  <input
                    type="number"
                    value={filters.ageMax || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        ageMax: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Max yaş"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    İlçe
                  </label>
                  <select
                    value={filters.districtId || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        districtId: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Tümü</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.title || d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Uyruk
                  </label>
                  <select
                    value={filters.nationalityId || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        nationalityId: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Tümü</option>
                    {nationalities.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.title || n.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={showDeleted}
                    onChange={(e) => setShowDeleted(e.target.checked)}
                    className="h-4 w-4 text-pink-600 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">
                    Silinmiş kullanıcıları göster
                  </span>
                </label>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold"
                >
                  Filtreleri Temizle
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Users List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
          {loading ? (
            <div className="divide-y divide-gray-100">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonListItem key={i} />
              ))}
            </div>
          ) : users.length === 0 ? (
            <EmptyState
              preset="noResults"
              title="Kullanıcı bulunamadı"
              description="Filtre veya arama kriterlerinizi değiştirerek tekrar deneyin."
            />
          ) : (
            <>
              <div className="divide-y divide-gray-100">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={`p-4 sm:p-6 transition-colors ${
                      user.isDeleted
                        ? "bg-gray-100 dark:bg-gray-700"
                        : "hover:bg-pink-50/30 dark:hover:bg-pink-900/20"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                            {user.name} {user.surname}
                          </h3>
                          {getStatusBadge(user.isApproved)}
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              TC Kimlik No
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {user.tc || "-"}
                            </p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              E-posta
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {user.email || "-"}
                            </p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              Telefon
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {user.phoneNumber || "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              Cinsiyet
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {user.gender === "male"
                                ? "Erkek"
                                : user.gender === "female"
                                  ? "Kadın"
                                  : "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              Doğum Tarihi
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {user.birthday
                                ? new Date(user.birthday).toLocaleDateString(
                                    "tr-TR",
                                  )
                                : "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              Kayıt Tarihi
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {new Date(user.createdAt).toLocaleDateString(
                                "tr-TR",
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleViewDetail(user.id)}
                          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-100 text-blue-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-lg hover:bg-blue-200 dark:hover:bg-orange-800/40 font-medium transition-colors text-sm flex items-center justify-center gap-2"
                        >
                          <EyeIcon className="w-4 h-4" />
                          <span className="hidden xs:inline sm:inline">
                            Detay
                          </span>
                        </button>
                        <button
                          onClick={() => handleOpenEmail(user.id)}
                          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 rounded-lg hover:bg-pink-200 dark:hover:bg-pink-800/40 font-medium transition-colors text-sm flex items-center justify-center gap-2"
                        >
                          <EnvelopeIcon className="w-4 h-4" />
                          <span className="hidden xs:inline sm:inline">
                            E-posta
                          </span>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={actionLoading[`delete-${user.id}`]}
                          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/40 font-medium transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <TrashIcon className="w-4 h-4" />
                          <span className="hidden xs:inline sm:inline">
                            {actionLoading[`delete-${user.id}`]
                              ? "Siliniyor..."
                              : "Sil"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="text-sm text-gray-700 dark:text-gray-200">
                    Toplam{" "}
                    <span className="font-medium">{pagination.total}</span>{" "}
                    kullanıcı
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
                      className="px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Önceki
                    </button>
                    <span className="px-3 sm:px-4 py-2 text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap">
                      {pagination.page} / {pagination.totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setPagination({
                          ...pagination,
                          page: pagination.page + 1,
                        })
                      }
                      disabled={pagination.page >= pagination.totalPages}
                      className="px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Email Modal */}
      {showEmailModal && selectedUser && (
        <SendEmailModal
          user={selectedUser}
          onClose={() => {
            setShowEmailModal(false);
            setSelectedUser(null);
          }}
          onSend={handleSendEmail}
          actionLoading={actionLoading}
        />
      )}
    </MainLayout>
  );
};

const SendEmailModal = ({ user, onClose, onSend, actionLoading }) => {
  const [formData, setFormData] = useState({
    subject: "",
    body: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.body.trim()) {
      showWarning("Uyarı", "Lütfen konu ve mesaj alanlarını doldurun.");
      return;
    }
    onSend(user.id, formData);
  };

  return (
    <ModalBase
      isOpen={true}
      onClose={onClose}
      title="E-posta Gönder"
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            İptal
          </button>
          <button
            type="submit"
            form="send-email-form"
            disabled={actionLoading[`email-${user.id}`]}
            className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
          >
            {actionLoading[`email-${user.id}`] ? "Gönderiliyor..." : "Gönder"}
          </button>
        </div>
      }
    >
      <form id="send-email-form" onSubmit={handleSubmit} className="space-y-6">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Alıcı</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {user.name} {user.surname} ({user.email})
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Konu *
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) =>
              setFormData({ ...formData, subject: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
            required
            placeholder="E-posta konusu"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Mesaj *
          </label>
          <textarea
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
            rows="8"
            required
            placeholder="E-posta mesajı"
          />
        </div>
      </form>
    </ModalBase>
  );
};

export default Users;
