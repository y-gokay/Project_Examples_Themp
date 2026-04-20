import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useUrlPagination from "../hooks/useUrlPagination";
import useScrollRestoration from "../hooks/useScrollRestoration";
import {
  getAllJobPosts,
  approveJobPost,
  rejectJobPost,
  deleteJobPost,
  restoreJobPost,
} from "../api/jobPostService";
import { getBasicStats } from "../api/dashboardService";
import MainLayout from "../components/layout/MainLayout";
import Breadcrumb from "../components/ui/Breadcrumb";
import EmptyState from "../components/ui/EmptyState";
import { SkeletonListItem } from "../components/ui/Skeleton";
import {
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { showError, showConfirm, showSuccess } from "../utils/swal";
import {
  getWorkingMethods,
  getCities,
  getDistrictsByCity,
  getSectors,
  searchProfessions,
} from "../api/lookupService";

const JobPosts = () => {
  useScrollRestoration();
  const navigate = useNavigate();
  const location = useLocation();
  const [jobPosts, setJobPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useUrlPagination(10);
  const [businessFilter, setBusinessFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState("approved"); // null: all, pending, approved, rejected
  const [showDeleted, setShowDeleted] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [pendingCount, setPendingCount] = useState(0);
  const [basicStats, setBasicStats] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const isApprovedParam = params.get("isApproved");

    if (isApprovedParam !== null) {
      if (isApprovedParam === "null") setStatusFilter("pending");
      else if (isApprovedParam === "true") setStatusFilter("approved");
      else if (isApprovedParam === "false") setStatusFilter("rejected");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Lookup data
  const [lookups, setLookups] = useState({
    professions: [],
    workingMethods: [],
    sectors: [],
    cities: [],
    districts: [],
  });
  const [lookupsLoading, setLookupsLoading] = useState(false);

  // Advanced filters (basic)
  const [filters, setFilters] = useState({
    search: "",
    onlySearchInTitle: false,
    cityId: "",
    isForDisabled: false,
    showExpired: false,
  });

  // Multi-select ID filters
  const [selectedProfessionIds, setSelectedProfessionIds] = useState([]);
  const [selectedWorkingMethods, setSelectedWorkingMethods] = useState([]);
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]);

  // Meslek arama inputu (sadece bu sayfanın içinde filter için)
  const [professionSearch, setProfessionSearch] = useState("");
  const [professionOptions, setProfessionOptions] = useState([]);
  const [searchingProfessions, setSearchingProfessions] = useState(false);
  const [professionLoadingMore, setProfessionLoadingMore] = useState(false);
  const [professionPage, setProfessionPage] = useState(1);
  const [professionHasMore, setProfessionHasMore] = useState(false);
  const professionSearchTimeoutRef = useRef(null);
  const professionListRef = useRef(null);

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        setLookupsLoading(true);
        const [workingMethodsRes, sectorsRes, citiesRes] = await Promise.all([
          getWorkingMethods().catch(() => ({ data: [] })),
          getSectors().catch(() => ({ data: [] })),
          getCities().catch(() => ({ data: [] })),
        ]);

        setLookups({
          professions: [],
          workingMethods: workingMethodsRes.data || [],
          sectors: sectorsRes.data || [],
          cities: citiesRes.data || [],
          districts: [],
        });
      } catch (error) {
        console.error("Error fetching lookups for job posts:", error);
      } finally {
        setLookupsLoading(false);
      }
    };

    fetchLookups();
  }, []);

  // Meslek araması için API çağrısı (pagination destekli)
  const loadProfessions = async (query, pageNum, append = false) => {
    try {
      if (append) {
        setProfessionLoadingMore(true);
      } else {
        setSearchingProfessions(true);
      }
      const res = await searchProfessions(query, 30, pageNum);
      const list = res?.data?.professions || res?.data || [];
      const pagination = res?.pagination || {};
      if (append) {
        setProfessionOptions((prev) => [...prev, ...list]);
      } else {
        setProfessionOptions(list);
      }
      setProfessionPage(pageNum);
      setProfessionHasMore(
        pagination.page < pagination.totalPages && pagination.totalPages > 1,
      );
    } catch (err) {
      console.error("Error searching professions:", err);
      if (!append) setProfessionOptions([]);
    } finally {
      setSearchingProfessions(false);
      setProfessionLoadingMore(false);
    }
  };

  useEffect(() => {
    if (professionSearchTimeoutRef.current) {
      clearTimeout(professionSearchTimeoutRef.current);
    }

    if (!professionSearch.trim()) {
      // Boş arama ile ilk sayfayı yükle
      loadProfessions("", 1, false);
      return;
    }

    setSearchingProfessions(true);
    professionSearchTimeoutRef.current = setTimeout(() => {
      loadProfessions(professionSearch.trim(), 1, false);
    }, 300);

    return () => {
      if (professionSearchTimeoutRef.current) {
        clearTimeout(professionSearchTimeoutRef.current);
      }
    };
  }, [professionSearch]);

  useEffect(() => {
    fetchJobPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pagination.page,
    businessFilter,
    statusFilter,
    filters,
    selectedProfessionIds,
    selectedWorkingMethods,
    selectedSectors,
    selectedDistricts,
    showDeleted,
  ]);

  const fetchBasicStats = async () => {
    try {
      const res = await getBasicStats();
      const data = res?.data || res;
      if (data) {
        setBasicStats(data);
        const count = data.jobPosts?.pending ?? 0;
        setPendingCount(Number(count));
      }
    } catch {
      setBasicStats(null);
      setPendingCount(0);
    }
  };

  useEffect(() => {
    fetchBasicStats();
  }, []);

  const fetchJobPosts = async () => {
    try {
      setLoading(true);

      let isApprovedParam = null;
      if (statusFilter === "approved") {
        isApprovedParam = true;
      } else if (statusFilter === "rejected") {
        isApprovedParam = false;
      } else if (statusFilter === "pending") {
        isApprovedParam = "null";
      }

      const response = await getAllJobPosts({
        page: pagination.page,
        limit: pagination.limit,
        lightweight: true,
        businessId: businessFilter,
        isApproved: isApprovedParam,
        professionIds:
          selectedProfessionIds && selectedProfessionIds.length > 0
            ? selectedProfessionIds.map((id) => Number(id))
            : null,
        workingMethodIds:
          selectedWorkingMethods && selectedWorkingMethods.length > 0
            ? selectedWorkingMethods.map((id) => Number(id))
            : null,
        sectorIds:
          selectedSectors && selectedSectors.length > 0
            ? selectedSectors.map((id) => Number(id))
            : null,
        districtIds:
          selectedDistricts && selectedDistricts.length > 0
            ? selectedDistricts.map((id) => Number(id))
            : null,
        isForDisabled: filters.isForDisabled ? true : null,
        search: filters.search,
        onlySearchInTitle: filters.onlySearchInTitle,
        includeDeleted: showDeleted,
        includeExpired: filters.showExpired,
      });

      if (response.success) {
        const posts = response.data.jobPosts || [];
        setJobPosts(posts);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching job posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCityChange = async (e) => {
    const cityId = e.target.value;
    setFilters((prev) => ({
      ...prev,
      cityId,
    }));
    // City change resets selected districts
    setSelectedDistricts([]);

    if (!cityId) {
      setLookups((prev) => ({ ...prev, districts: [] }));
      return;
    }

    try {
      const res = await getDistrictsByCity(cityId);
      setLookups((prev) => ({
        ...prev,
        districts: res.data || [],
      }));
    } catch (error) {
      console.error("Error fetching districts for city:", error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      onlySearchInTitle: false,
      cityId: "",
      isForDisabled: false,
      showExpired: false,
    });
    setSelectedProfessionIds([]);
    setSelectedWorkingMethods([]);
    setSelectedSectors([]);
    setSelectedDistricts([]);
    setProfessionSearch("");
    setProfessionOptions([]);
    setLookups((prev) => ({ ...prev, districts: [] }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Meslek listesi artık API'den geliyor, client-side filter kaldırıldı

  const isExpired = (jobPost) => {
    if (!jobPost.applicationUntilDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const until = new Date(jobPost.applicationUntilDate);
    if (Number.isNaN(until.getTime())) return false;
    return until < today;
  };

  const filteredJobPosts = useMemo(() => {
    if (filters.showExpired) {
      return jobPosts;
    }
    return jobPosts.filter((jobPost) => !isExpired(jobPost));
  }, [jobPosts, filters.showExpired]);

  const statsForView = useMemo(() => {
    // Kartlarda gösterilen toplam/aktif/bekleyen sayıları "page" ve "showExpired"
    // filtrelerinden etkilenmesin diye basic stats'tan alıyoruz.
    const total =
      basicStats?.jobPosts?.total ?? pagination.total ?? filteredJobPosts.length;
    const active =
      basicStats?.jobPosts?.active ??
      filteredJobPosts.filter((j) => j.isApproved === true).length;
    const pending =
      basicStats?.jobPosts?.pending ??
      filteredJobPosts.filter((j) => j.isApproved === null).length;
    const applicationsTotal =
      basicStats?.applications?.total ??
      filteredJobPosts.reduce((sum, j) => sum + (j.applicationCount || 0), 0);
    return {
      total,
      active,
      pending,
      applicationsTotal,
    };
  }, [filteredJobPosts, pagination.total, basicStats]);

  const handleApprove = async (id) => {
    try {
      setActionLoading({ ...actionLoading, [`approve-${id}`]: true });
      await approveJobPost(id);
      await fetchJobPosts();
      fetchBasicStats();
    } catch (error) {
      console.error("Error approving job post:", error);
      showError("Hata", "Onaylama işlemi başarısız oldu.");
    } finally {
      setActionLoading({ ...actionLoading, [`approve-${id}`]: false });
    }
  };

  const handleReject = async (id) => {
    const result = await showConfirm(
      "İş İlanını Reddet",
      "Bu iş ilanını reddetmek istediğinize emin misiniz?",
      "Evet, Reddet",
      "İptal",
    );

    if (!result.isConfirmed) {
      return;
    }

    try {
      setActionLoading({ ...actionLoading, [`reject-${id}`]: true });
      await rejectJobPost(id);
      await fetchJobPosts();
      fetchBasicStats();
      showSuccess("Başarılı", "İş ilanı başarıyla reddedildi.");
    } catch (error) {
      console.error("Error rejecting job post:", error);
      showError("Hata", "Reddetme işlemi başarısız oldu.");
    } finally {
      setActionLoading({ ...actionLoading, [`reject-${id}`]: false });
    }
  };

  const handleViewDetail = (jobPostId) => {
    // Silinmiş ilan görünümünde detay açarken backend'e includeDeleted bilgisi iletelim.
    navigate(
      `/dashboard/job-posts/${jobPostId}${
        showDeleted ? "?includeDeleted=true" : ""
      }`,
    );
  };

  const handleDeleteJobPost = async (id) => {
    const result = await showConfirm(
      "İş İlanını Sil",
      "Bu iş ilanını silmek istediğinize emin misiniz?",
      "Evet, Sil",
      "İptal",
    );

    if (!result.isConfirmed) {
      return;
    }

    try {
      setActionLoading((prev) => ({ ...prev, [`delete-${id}`]: true }));
      await deleteJobPost(id);
      await fetchJobPosts();
      showSuccess("Başarılı", "İş ilanı başarıyla silindi.");
    } catch (error) {
      console.error("Error deleting job post:", error);
      showError("Hata", "İş ilanı silinirken bir hata oluştu.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [`delete-${id}`]: false }));
    }
  };

  const handleRestoreJobPost = async (id) => {
    const result = await showConfirm(
      "İş İlanını Geri Getir",
      "Bu iş ilanını geri getirmek istediğinize emin misiniz?",
      "Evet, Geri Getir",
      "İptal",
    );

    if (!result.isConfirmed) {
      return;
    }

    try {
      setActionLoading((prev) => ({ ...prev, [`restore-${id}`]: true }));
      await restoreJobPost(id);
      await fetchJobPosts();
      showSuccess("Başarılı", "İş ilanı başarıyla geri getirildi.");
    } catch (error) {
      console.error("Error restoring job post:", error);
      showError("Hata", "İş ilanı geri getirilirken bir hata oluştu.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [`restore-${id}`]: false }));
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
      <div className="space-y-6 max-w-full overflow-x-hidden">
        <Breadcrumb />
        {/* Top Stats + Status Filter Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Toplam İş İlanı</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {statsForView.total}
              </p>
            </div>
            <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Aktif İlan</p>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                {statsForView.active}
              </p>
            </div>
            <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Onay Bekleyen</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {statsForView.pending}
              </p>
            </div>
            <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Başvuru Süresi Geçmiş</p>
              <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
                {basicStats?.jobPosts?.expired ?? 0}
              </p>
            </div>
            <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Silinmiş İş İlanları</p>
              <p className="text-2xl font-bold text-gray-700 dark:text-gray-200">
                {basicStats?.jobPosts?.deleted ?? 0}
              </p>
            </div>
            <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Toplam Başvuru</p>
              <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
                {statsForView.applicationsTotal}
              </p>
            </div>
          </div>

          {/* Applications breakdown (alt row) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Bekleyen Başvuru</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {basicStats?.applications?.pending ?? 0}
              </p>
            </div>
            <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Onaylanmış Başvuru</p>
              <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
                {basicStats?.applications?.accepted ?? 0}
              </p>
            </div>
            <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">İşe Alınmış</p>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                {basicStats?.applications?.employed ?? 0}
              </p>
            </div>
            <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reddedilmiş Başvuru</p>
              <p className="text-2xl font-bold text-rose-700 dark:text-rose-400">
                {basicStats?.applications?.rejected ?? 0}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 dark:border-gray-700 pt-3">
            <div className="flex flex-wrap gap-3 items-center">
              <button
                onClick={() => {
                  setStatusFilter("approved");
                  setPagination({ ...pagination, page: 1 });
                }}
                className={`px-4 sm:px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 text-sm ${
                  statusFilter === "approved"
                    ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg transform scale-105"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105"
                }`}
              >
                Onaylananlar
              </button>
              <button
                onClick={() => {
                  setStatusFilter("rejected");
                  setPagination({ ...pagination, page: 1 });
                }}
                className={`px-4 sm:px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 text-sm ${
                  statusFilter === "rejected"
                    ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg transform scale-105"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105"
                }`}
              >
                Reddedilenler
              </button>
              <button
                onClick={() => {
                  setStatusFilter("pending");
                  setPagination({ ...pagination, page: 1 });
                }}
                className={`px-4 sm:px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 text-sm ${
                  statusFilter === "pending"
                    ? "bg-gradient-to-r from-yellow-600 to-yellow-700 text-white shadow-lg transform scale-105"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105"
                }`}
              >
                Bekleyenler ({pendingCount})
              </button>
            </div>
            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-500 text-sm font-semibold"
            >
              {showFilters ? "Filtreleri Gizle" : "Filtreleri Göster"}
            </button>
          </div>
        </div>

        {/* Filters (inline under stats card) */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-100 dark:border-gray-700 space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="İlan başlığı veya açıklama ara..."
                className="flex-1 sm:w-64 sm:flex-none px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              <label className="inline-flex items-center gap-2 text-xs text-gray-600 dark:text-gray-200 whitespace-nowrap">
                <input
                  type="checkbox"
                  name="onlySearchInTitle"
                  checked={filters.onlySearchInTitle}
                  onChange={handleFilterChange}
                  className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
                />
                Sadece başlıkta ara
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* Meslek (search + multi-select checkbox + pagination) */}
              <div className="space-y-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Meslek (birden fazla seçilebilir)
                </p>
                <input
                  type="text"
                  value={professionSearch}
                  onChange={(e) => setProfessionSearch(e.target.value)}
                  placeholder="Meslek ara..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <div
                  ref={professionListRef}
                  className="mt-1 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-2 space-y-1 bg-white dark:bg-gray-800"
                  onScroll={(e) => {
                    const el = e.target;
                    if (
                      professionHasMore &&
                      !professionLoadingMore &&
                      !searchingProfessions &&
                      el.scrollHeight - el.scrollTop <= el.clientHeight + 50
                    ) {
                      loadProfessions(
                        professionSearch.trim(),
                        professionPage + 1,
                        true,
                      );
                    }
                  }}
                >
                  {searchingProfessions ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400 px-1">Aranıyor...</p>
                  ) : professionOptions.length === 0 ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400 px-1">
                      Meslek bulunamadı
                    </p>
                  ) : (
                    <>
                      {professionOptions.map((p) => {
                        const id = p.id?.toString();
                        if (!id) return null;
                        const label =
                          p.profession || p.name || p.title || `Meslek #${id}`;
                        const checked = selectedProfessionIds.includes(id);
                        return (
                          <label
                            key={id}
                            className="flex items-center gap-2 text-xs cursor-pointer dark:text-gray-200"
                          >
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
                              checked={checked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedProfessionIds((prev) => [
                                    ...prev,
                                    id,
                                  ]);
                                } else {
                                  setSelectedProfessionIds((prev) =>
                                    prev.filter((v) => v !== id),
                                  );
                                }
                                setPagination((prev) => ({ ...prev, page: 1 }));
                              }}
                            />
                            <span className="text-gray-700 dark:text-gray-200 text-xs truncate">
                              {label}
                            </span>
                          </label>
                        );
                      })}
                      {professionLoadingMore && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 px-1 py-1">
                          Yükleniyor...
                        </p>
                      )}
                      {professionHasMore && !professionLoadingMore && (
                        <button
                          type="button"
                          onClick={() =>
                            loadProfessions(
                              professionSearch.trim(),
                              professionPage + 1,
                              true,
                            )
                          }
                          className="w-full text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 py-1 font-medium"
                        >
                          Daha fazla yükle
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Çalışma Şekli (multi-select checkbox) */}
              <div className="space-y-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">Çalışma Şekli</p>
                <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-2 space-y-1 bg-white dark:bg-gray-800">
                  {lookups.workingMethods &&
                  lookups.workingMethods.length > 0 ? (
                    lookups.workingMethods.map((m) => {
                      const id = m.id?.toString();
                      if (!id) return null;
                      const checked = selectedWorkingMethods.includes(id);
                      return (
                        <label
                          key={id}
                          className="flex items-center gap-2 text-xs cursor-pointer dark:text-gray-200"
                        >
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedWorkingMethods((prev) => [
                                  ...prev,
                                  id,
                                ]);
                              } else {
                                setSelectedWorkingMethods((prev) =>
                                  prev.filter((v) => v !== id),
                                );
                              }
                              setPagination((prev) => ({ ...prev, page: 1 }));
                            }}
                          />
                          <span className="text-gray-700 dark:text-gray-200 text-xs truncate">
                            {m.title}
                          </span>
                        </label>
                      );
                    })
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 px-1">
                      Çalışma şekli bulunamadı
                    </p>
                  )}
                </div>
              </div>

              {/* Sektör (multi-select checkbox) */}
              <div className="space-y-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">Sektör</p>
                <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-2 space-y-1 bg-white dark:bg-gray-800">
                  {lookups.sectors && lookups.sectors.length > 0 ? (
                    lookups.sectors.map((s) => {
                      const id = s.id?.toString();
                      if (!id) return null;
                      const label =
                        s.sector || s.title || s.name || `Sektör #${id}`;
                      const checked = selectedSectors.includes(id);
                      return (
                        <label
                          key={id}
                          className="flex items-center gap-2 text-xs cursor-pointer dark:text-gray-200"
                        >
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSectors((prev) => [...prev, id]);
                              } else {
                                setSelectedSectors((prev) =>
                                  prev.filter((v) => v !== id),
                                );
                              }
                              setPagination((prev) => ({ ...prev, page: 1 }));
                            }}
                          />
                          <span className="text-gray-700 dark:text-gray-200 text-xs truncate">
                            {label}
                          </span>
                        </label>
                      );
                    })
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 px-1">
                      Sektör bulunamadı
                    </p>
                  )}
                </div>
              </div>

              {/* İl / İlçe (city select + district multi-select) */}
              <div className="space-y-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">İl / İlçe</p>
                <select
                  name="cityId"
                  value={filters.cityId}
                  onChange={handleCityChange}
                  className="w-full mb-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Tüm iller</option>
                  {lookups.cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
                <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-2 space-y-1 bg-white dark:bg-gray-800">
                  {!filters.cityId ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400 px-1">
                      İl seçerek ilçeleri filtreleyebilirsiniz
                    </p>
                  ) : lookups.districts && lookups.districts.length > 0 ? (
                    lookups.districts.map((d) => {
                      const id = d.id?.toString();
                      if (!id) return null;
                      const label = d.title || d.name || `İlçe #${id}`;
                      const checked = selectedDistricts.includes(id);
                      return (
                        <label
                          key={id}
                          className="flex items-center gap-2 text-xs cursor-pointer dark:text-gray-200"
                        >
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDistricts((prev) => [...prev, id]);
                              } else {
                                setSelectedDistricts((prev) =>
                                  prev.filter((v) => v !== id),
                                );
                              }
                              setPagination((prev) => ({ ...prev, page: 1 }));
                            }}
                          />
                          <span className="text-gray-700 dark:text-gray-200 text-xs truncate">
                            {label}
                          </span>
                        </label>
                      );
                    })
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 px-1">
                      İlçe bulunamadı
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                  <input
                    type="checkbox"
                    name="isForDisabled"
                    checked={filters.isForDisabled}
                    onChange={handleFilterChange}
                    className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
                  />
                  Sadece engelli bireylere uygun ilanlar
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                  <input
                    type="checkbox"
                    name="showExpired"
                    checked={filters.showExpired}
                    onChange={handleFilterChange}
                    className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
                  />
                  Süresi geçmiş ilanları da göster
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                  <input
                    type="checkbox"
                    checked={showDeleted}
                    onChange={(e) => setShowDeleted(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
                  />
                  Silinmiş ilanları göster
                </label>
              </div>

              <button
                type="button"
                onClick={handleResetFilters}
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white underline underline-offset-2"
                disabled={lookupsLoading}
              >
                Filtreleri Temizle
              </button>
            </div>
          </div>
        )}

        {/* Job Posts List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
          {loading ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonListItem key={i} />
              ))}
            </div>
          ) : filteredJobPosts.length === 0 ? (
            <EmptyState
              preset="noResults"
              title="İş ilanı bulunamadı"
              description="Filtre kriterlerinizi değiştirerek tekrar deneyin."
            />
          ) : (
            <>
              <div className="space-y-4">
                {filteredJobPosts.map((jobPost) => (
                  <div
                    key={jobPost.id}
                    className={`relative p-4 sm:p-6 rounded-lg border transition-colors overflow-hidden ${
                      jobPost.isDeleted
                        ? "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-600"
                        : jobPost.hasPendingUpdateRequest
                          ? "bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700 hover:bg-purple-100/50 dark:hover:bg-purple-900/40"
                          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-purple-50/30 dark:hover:bg-purple-900/20"
                    }`}
                  >
                    {isExpired(jobPost) && (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <span className="select-none text-4xl sm:text-5xl md:text-6xl font-extrabold uppercase tracking-widest text-red-600 opacity-10">
                          BAŞVURU SÜRESİ DOLDU
                        </span>
                      </div>
                    )}
                    <div className="relative flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                              {jobPost.postTitle}
                            </h3>
                            {jobPost.hasPendingUpdateRequest && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded-full text-xs font-semibold">
                                Bekleyen Değişiklik Talebi
                              </span>
                            )}
                            {/* Application Status Badges */}
                            {jobPost.applicationStats && (
                              <div className="flex gap-1 flex-wrap">
                                <span className="px-2 py-0.5 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 rounded-full text-xs font-semibold">
                                  Bekleyen:{" "}
                                  {jobPost.applicationStats
                                    .pendingApplications || 0}
                                </span>
                                <span className="px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-semibold">
                                  Onaylanmış:{" "}
                                  {jobPost.applicationStats
                                    .acceptedApplications || 0}
                                </span>
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-semibold">
                                  İşe Alınmış:{" "}
                                  {jobPost.applicationStats
                                    .employedApplications || 0}
                                </span>
                                <span className="px-2 py-0.5 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-semibold">
                                  Reddedilen:{" "}
                                  {jobPost.applicationStats
                                    .rejectedApplications || 0}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                            {!jobPost.isActive && (
                              <span className="px-2 py-0.5 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 rounded-full text-xs font-semibold whitespace-nowrap">
                                Aktif Değil
                              </span>
                            )}
                            {!jobPost.isShown && (
                              <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-full text-xs font-semibold whitespace-nowrap">
                                Gizli
                              </span>
                            )}
                            <button
                              onClick={() => handleViewDetail(jobPost.id)}
                              className="px-3 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 text-xs font-medium flex items-center gap-1"
                            >
                              <CheckCircleIcon className="w-4 h-4" />
                              Detay
                            </button>
                            {jobPost.isDeleted ? (
                              <button
                                onClick={() => handleRestoreJobPost(jobPost.id)}
                                disabled={
                                  actionLoading[`restore-${jobPost.id}`]
                                }
                                className="px-3 py-1.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 text-xs font-medium flex items-center gap-1 disabled:opacity-50"
                              >
                                <CheckCircleIcon className="w-4 h-4" />
                                {actionLoading[`restore-${jobPost.id}`]
                                  ? "Geri Getiriliyor..."
                                  : "Geri Getir"}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleDeleteJobPost(jobPost.id)}
                                disabled={actionLoading[`delete-${jobPost.id}`]}
                                className="px-3 py-1.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 text-xs font-medium flex items-center gap-1 disabled:opacity-50"
                              >
                                <TrashIcon className="w-4 h-4" />
                                {actionLoading[`delete-${jobPost.id}`]
                                  ? "Siliniyor..."
                                  : "Sil"}
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              İşletme
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {jobPost.business?.businessName || "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Meslek</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {jobPost.professions?.profession || "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              Çalışma Şekli
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {jobPost.workingMethod?.title || "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              Alınacak Kişi
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {jobPost.hiringCount} kişi
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              Başvuru Sayısı
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {jobPost.applicationCount || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              Görüntülenme
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {jobPost.viewCount || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              Son Başvuru
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {new Date(
                                jobPost.applicationUntilDate,
                              ).toLocaleDateString("tr-TR")}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              Oluşturulma
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {new Date(jobPost.createdAt).toLocaleDateString(
                                "tr-TR",
                              )}
                            </p>
                          </div>
                        </div>
                        {/* Ehliyet Gereksinimleri */}
                        {jobPost.drivingLisenceRequirements &&
                          jobPost.drivingLisenceRequirements.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                Ehliyet Gereksinimleri
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {jobPost.drivingLisenceRequirements.map(
                                  (req) => (
                                    <span
                                      key={req.id}
                                      className="px-2 py-1 bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 rounded-lg text-xs font-semibold"
                                    >
                                      {req.drivingLisenceType?.title || "-"}
                                    </span>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                        <div
                          className="text-sm text-gray-700 dark:text-gray-200 prose prose-sm max-w-none line-clamp-2 rich-html-content"
                          dangerouslySetInnerHTML={{
                            __html: jobPost.postDescription,
                          }}
                        />
                      </div>
                      {jobPost.isApproved === null && (
                        <div
                          className="flex flex-row sm:flex-col gap-2 flex-shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleApprove(jobPost.id)}
                            disabled={actionLoading[`approve-${jobPost.id}`]}
                            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                            <span>
                              {actionLoading[`approve-${jobPost.id}`]
                                ? "Onaylanıyor..."
                                : "Onayla"}
                            </span>
                          </button>
                          <button
                            onClick={() => handleReject(jobPost.id)}
                            disabled={actionLoading[`reject-${jobPost.id}`]}
                            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <XCircleIcon className="w-4 h-4" />
                            <span>
                              {actionLoading[`reject-${jobPost.id}`]
                                ? "Reddediliyor..."
                                : "Reddet"}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="text-sm text-gray-700 dark:text-gray-200">
                    Toplam{" "}
                    <span className="font-medium">{pagination.total}</span> iş
                    ilanı
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
    </MainLayout>
  );
};

export default JobPosts;
