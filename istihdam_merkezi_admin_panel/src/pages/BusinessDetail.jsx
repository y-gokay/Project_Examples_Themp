import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getBusinessById,
  getBusinessJobPosts,
  getBusinessAccounts,
  updateBusiness,
  createBusinessAccount,
  updateBusinessAccount,
  deleteBusinessAccount,
  restoreBusinessAccount,
  approveBusiness,
  rejectBusiness,
} from "../api/businessService";
import { createJobPost, getJobPostApplications } from "../api/jobPostService";
import {
  getChangeRequestById,
  approveChangeRequest,
  rejectChangeRequest,
  getBusinessChangeRequests,
} from "../api/changeRequestService";
import {
  getWorkingMethods,
  getCities,
  getDistrictsByCity,
  getEducationTypes,
  getApplicantRights,
  getDrivingLicenseTypes,
  getWorkDays,
  getWorkingExperiences,
  getSectors,
  getBusinessRoles,
  searchProfessions,
} from "../api/lookupService";
import MainLayout from "../components/layout/MainLayout";
import RichTextEditor from "../components/RichTextEditor";
import {
  BriefcaseIcon,
  UserGroupIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  DocumentTextIcon,
  MapPinIcon,
  CalendarIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  showConfirm,
  showError,
  showSuccess,
  showWarning,
} from "../utils/swal";

const BusinessDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [jobPosts, setJobPosts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [jobPostApplications, setJobPostApplications] = useState({}); // { jobPostId: [applications] }
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info"); // info, jobPosts, accounts, changeRequests
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [showCreateJobPostModal, setShowCreateJobPostModal] = useState(false);
  const [jobPostsPagination, setJobPostsPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [accountsPagination, setAccountsPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [actionLoading, setActionLoading] = useState({});
  const [changeRequests, setChangeRequests] = useState([]);
  const [changeRequestsLoading, setChangeRequestsLoading] = useState(false);
  const [sectors, setSectors] = useState([]);
  const [selectedChangeRequest, setSelectedChangeRequest] = useState(null);
  const [showDeletedJobPosts, setShowDeletedJobPosts] = useState(false);
  const [showExpiredJobPosts, setShowExpiredJobPosts] = useState(false);
  const [showDeletedAccounts, setShowDeletedAccounts] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBusinessDetail();
    }
  }, [id]);

  useEffect(() => {
    if (id && activeTab === "jobPosts") {
      fetchJobPosts();
    }
  }, [id, activeTab, jobPostsPagination.page]);

  useEffect(() => {
    if (id && activeTab === "accounts") {
      fetchAccounts();
    }
  }, [id, activeTab, accountsPagination.page, showDeletedAccounts]);

  useEffect(() => {
    if (activeTab === "changeRequests") {
      fetchSectors();
      fetchChangeRequests();
    }
  }, [id, activeTab]);

  const fetchBusinessDetail = async () => {
    try {
      setLoading(true);
      const response = await getBusinessById(id);
      if (response.success) {
        setBusiness(response.data);
      }
    } catch (error) {
      console.error("Error fetching business detail:", error);
      showError(
        "Hata",
        getBackendErrorMessage(error, "İşletme detayları yüklenemedi."),
      );
      navigate("/dashboard/businesses");
    } finally {
      setLoading(false);
    }
  };

  const fetchJobPosts = async () => {
    try {
      const response = await getBusinessJobPosts(id, {
        page: jobPostsPagination.page,
        limit: jobPostsPagination.limit,
      });
      if (response.success) {
        setJobPosts(response.data.jobPosts);
        setJobPostsPagination(response.data.pagination);

        // Fetch applications for each job post
        const applicationsMap = {};
        await Promise.all(
          response.data.jobPosts.map(async (jobPost) => {
            try {
              const appResponse = await getJobPostApplications(jobPost.id);
              if (appResponse.success) {
                applicationsMap[jobPost.id] =
                  appResponse.data.applications || [];
              }
            } catch (error) {
              console.error(
                `Error fetching applications for job post ${jobPost.id}:`,
                error,
              );
              applicationsMap[jobPost.id] = [];
            }
          }),
        );
        setJobPostApplications(applicationsMap);
      }
    } catch (error) {
      console.error("Error fetching job posts:", error);
    }
  };

  const isJobPostExpired = (jobPost) => {
    if (!jobPost.applicationUntilDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const until = new Date(jobPost.applicationUntilDate);
    if (Number.isNaN(until.getTime())) return false;
    return until < today;
  };

  const visibleJobPosts = useMemo(() => {
    return jobPosts.filter((jp) => {
      if (!showDeletedJobPosts && jp.isDeleted) return false;
      if (!showExpiredJobPosts && isJobPostExpired(jp)) return false;
      return true;
    });
  }, [jobPosts, showDeletedJobPosts, showExpiredJobPosts]);

  const fetchAccounts = async () => {
    try {
      const response = await getBusinessAccounts(id, {
        page: accountsPagination.page,
        limit: accountsPagination.limit,
        showDeleted: showDeletedAccounts,
      });
      if (response.success) {
        setAccounts(response.data.accounts);
        setAccountsPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  const fetchSectors = async () => {
    try {
      const response = await getSectors();
      if (response.success) {
        setSectors(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching sectors:", error);
    }
  };

  const fetchChangeRequests = async () => {
    try {
      setChangeRequestsLoading(true);
      const response = await getBusinessChangeRequests(id);
      if (response.success) {
        setChangeRequests(response.data.changeRequests || []);
      }
    } catch (error) {
      console.error("Error fetching change requests:", error);
      setChangeRequests([]);
    } finally {
      setChangeRequestsLoading(false);
    }
  };

  const handleViewChangeRequest = async (requestId) => {
    try {
      const response = await getChangeRequestById(requestId);
      if (response.success) {
        setSelectedChangeRequest(response.data.changeRequest);
      }
    } catch (error) {
      console.error("Error fetching change request:", error);
      showError(
        "Hata",
        getBackendErrorMessage(error, "Değişim isteği yüklenemedi."),
      );
    }
  };

  const handleApproveChangeRequest = async (requestId) => {
    const result = await showConfirm(
      "Değişim İsteğini Onayla",
      "Bu değişim isteğini onaylamak istediğinize emin misiniz?",
      "Evet, Onayla",
      "İptal",
    );

    if (!result.isConfirmed) {
      return;
    }

    try {
      setActionLoading({ ...actionLoading, [`approve-cr-${requestId}`]: true });
      await approveChangeRequest(requestId);
      showSuccess("Başarılı", "Değişim isteği onaylandı.");
      await fetchChangeRequests();
      await fetchBusinessDetail();
      setSelectedChangeRequest(null);
    } catch (error) {
      console.error("Error approving change request:", error);
      showError(
        "Hata",
        getBackendErrorMessage(
          error,
          "Değişim isteği onaylanırken bir hata oluştu.",
        ),
      );
    } finally {
      setActionLoading({
        ...actionLoading,
        [`approve-cr-${requestId}`]: false,
      });
    }
  };

  const handleRejectChangeRequest = async (requestId) => {
    const result = await showConfirm(
      "Değişim İsteğini Reddet",
      "Bu değişim isteğini reddetmek istediğinize emin misiniz?",
      "Evet, Reddet",
      "İptal",
    );

    if (!result.isConfirmed) {
      return;
    }

    try {
      setActionLoading({ ...actionLoading, [`reject-cr-${requestId}`]: true });
      await rejectChangeRequest(requestId);
      showSuccess("Başarılı", "Değişim isteği reddedildi.");
      await fetchChangeRequests();
      setSelectedChangeRequest(null);
    } catch (error) {
      console.error("Error rejecting change request:", error);
      showError(
        "Hata",
        getBackendErrorMessage(
          error,
          "Değişim isteği reddedilirken bir hata oluştu.",
        ),
      );
    } finally {
      setActionLoading({ ...actionLoading, [`reject-cr-${requestId}`]: false });
    }
  };

  const getSectorName = (sectorId) => {
    const sector = sectors.find((s) => s.id === sectorId);
    return sector ? sector.sector : `Sektör #${sectorId}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDeleteAccount = async (accountId) => {
    const result = await showConfirm(
      "Hesabı Sil",
      "Bu hesabı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.",
      "Evet, Sil",
      "İptal",
    );

    if (!result.isConfirmed) {
      return;
    }

    try {
      await deleteBusinessAccount(id, accountId);
      await fetchAccounts();
      showSuccess("Başarılı", "Hesap başarıyla silindi.");
    } catch (error) {
      console.error("Error deleting account:", error);
      showError(
        "Hata",
        getBackendErrorMessage(error, "Hesap silinirken bir hata oluştu."),
      );
    }
  };

  const handleRestoreAccount = async (accountId) => {
    try {
      await restoreBusinessAccount(id, accountId);
      await fetchAccounts();
      showSuccess("Başarılı", "Hesap başarıyla geri getirildi.");
    } catch (error) {
      console.error("Error restoring account:", error);
      showError(
        "Hata",
        getBackendErrorMessage(
          error,
          "Hesap geri getirilirken bir hata oluştu.",
        ),
      );
    }
  };

  const handleApprove = async () => {
    try {
      setActionLoading({ ...actionLoading, approve: true });
      await approveBusiness(id);
      await fetchBusinessDetail();
    } catch (error) {
      console.error("Error approving business:", error);
      showError(
        "Hata",
        getBackendErrorMessage(error, "Onaylama işlemi başarısız oldu."),
      );
    } finally {
      setActionLoading({ ...actionLoading, approve: false });
    }
  };

  const handleReject = async () => {
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
      setActionLoading({ ...actionLoading, reject: true });
      await rejectBusiness(id);
      await fetchBusinessDetail();
      showSuccess("Başarılı", "İşletme başarıyla reddedildi.");
    } catch (error) {
      console.error("Error rejecting business:", error);
      showError(
        "Hata",
        getBackendErrorMessage(error, "Reddetme işlemi başarısız oldu."),
      );
    } finally {
      setActionLoading({ ...actionLoading, reject: false });
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Yükleniyor...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!business) {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6 max-w-full overflow-x-hidden">
        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
              >
                <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                {business.businessName}
              </h1>
            </div>
          </div>
          <div className="border-b border-gray-200 dark:border-gray-600">
            <nav
              className="flex -mb-px overflow-x-auto scrollbar-hide"
              aria-label="Tabs"
            >
              <button
                onClick={() => setActiveTab("info")}
                className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === "info"
                    ? "border-blue-600 dark:border-orange-400 text-blue-600 dark:text-orange-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-200"
                }`}
              >
                Genel Bilgiler
              </button>
              <button
                onClick={() => setActiveTab("jobPosts")}
                className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === "jobPosts"
                    ? "border-blue-600 dark:border-orange-400 text-blue-600 dark:text-orange-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-200"
                }`}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <BriefcaseIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  İş İlanları
                </div>
              </button>
              <button
                onClick={() => setActiveTab("accounts")}
                className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === "accounts"
                    ? "border-blue-600 dark:border-orange-400 text-blue-600 dark:text-orange-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-200"
                }`}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <UserGroupIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  Hesaplar
                </div>
              </button>
              <button
                onClick={() => setActiveTab("changeRequests")}
                className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === "changeRequests"
                    ? "border-blue-600 dark:border-orange-400 text-blue-600 dark:text-orange-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-200"
                }`}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  Değişim İstekleri
                </div>
              </button>
            </nav>
          </div>

          <div className="p-4 sm:p-6">
            {/* Info Tab */}
            {activeTab === "info" && (
              <div className="space-y-6">
                <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                  <div className="flex flex-wrap gap-2">
                    {business.isApproved === null && (
                      <>
                        <button
                          onClick={handleApprove}
                          disabled={actionLoading.approve}
                          className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-green-600 to-green-700 dark:from-green-500 dark:to-green-600 text-white rounded-xl hover:from-green-700 hover:to-green-800 dark:hover:from-green-600 dark:hover:to-green-700 disabled:opacity-50 font-semibold transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed text-sm"
                        >
                          {actionLoading.approve ? "Onaylanıyor..." : "Onayla"}
                        </button>
                        <button
                          onClick={handleReject}
                          disabled={actionLoading.reject}
                          className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-500 dark:to-red-600 text-white rounded-xl hover:from-red-700 hover:to-red-800 dark:hover:from-red-600 dark:hover:to-red-700 disabled:opacity-50 font-semibold transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed text-sm"
                        >
                          {actionLoading.reject ? "Reddediliyor..." : "Reddet"}
                        </button>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-orange-500 text-white dark:hover:bg-orange-600 rounded-lg hover:bg-blue-700 dark:hover:bg-orange-600 transition-colors text-sm"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Düzenle
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">İşletme Adı</p>
                    <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white break-words">
                      {business.businessName}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Vergi No</p>
                    <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                      {business.vergiNo}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">E-posta</p>
                    <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white break-all">
                      {business.businessEmail}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Telefon</p>
                    <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                      {business.businessContactPhoneNumber}
                    </p>
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Adres</p>
                    <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white break-words">
                      {business.address}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Çalışan Sayısı</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {business.workerCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Durum</p>
                    {business.isApproved === true ? (
                      <span className="px-4 py-1.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-semibold">
                        Onaylandı
                      </span>
                    ) : business.isApproved === false ? (
                      <span className="px-4 py-1.5 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full text-sm font-semibold">
                        Reddedildi
                      </span>
                    ) : (
                      <span className="px-4 py-1.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-sm font-semibold">
                        Beklemede
                      </span>
                    )}
                  </div>
                </div>

                {business.description && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Açıklama</p>
                    <p className="text-gray-900 dark:text-white">{business.description}</p>
                  </div>
                )}

                {business.sectors && business.sectors.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Sektörler</p>
                    <div className="flex flex-wrap gap-2">
                      {business.sectors.map((sectorItem) => (
                        <span
                          key={sectorItem.id}
                          className="px-4 py-2 bg-blue-50 dark:bg-orange-900/20 text-blue-700 dark:text-orange-300 rounded-lg text-sm font-semibold"
                        >
                          {sectorItem.sector.sector}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Job Posts Tab */}
            {activeTab === "jobPosts" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                      <input
                        type="checkbox"
                        checked={showDeletedJobPosts}
                        onChange={(e) =>
                          setShowDeletedJobPosts(e.target.checked)
                        }
                        className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded"
                      />
                      Silinmiş ilanları göster
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                      <input
                        type="checkbox"
                        checked={showExpiredJobPosts}
                        onChange={(e) =>
                          setShowExpiredJobPosts(e.target.checked)
                        }
                        className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded"
                      />
                      Süresi geçmiş ilanları da göster
                    </label>
                  </div>
                  <button
                    onClick={() => setShowCreateJobPostModal(true)}
                    className="px-6 py-2 bg-blue-600 dark:bg-orange-500 text-white dark:hover:bg-orange-600 rounded-lg hover:bg-blue-700 dark:hover:bg-orange-600 font-semibold flex items-center gap-2"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Yeni İş İlanı
                  </button>
                </div>
                {visibleJobPosts.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <BriefcaseIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Henüz iş ilanı bulunmamaktadır.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {visibleJobPosts.map((jobPost) => (
                        <div
                          key={jobPost.id}
                          onClick={() =>
                            navigate(`/dashboard/job-posts/${jobPost.id}`)
                          }
                          className="relative border border-gray-200 dark:border-gray-600 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                        >
                          {isJobPostExpired(jobPost) && (
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                              <span className="select-none text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-widest text-red-600 opacity-10">
                                BAŞVURU SÜRESİ DOLDU
                              </span>
                            </div>
                          )}
                          <div className="relative">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {jobPost.postTitle}
                                  </h3>
                                  {/* Application Status Badges */}
                                  {jobPostApplications[jobPost.id] &&
                                    jobPostApplications[jobPost.id].length >
                                      0 && (
                                      <div className="flex gap-1 flex-wrap">
                                        {jobPostApplications[jobPost.id].some(
                                          (app) =>
                                            !app.isAccepted &&
                                            !app.isRejected &&
                                            !app.isEmployed,
                                        ) && (
                                          <span className="px-2 py-0.5 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 rounded-full text-xs font-semibold">
                                            Bekleyen
                                          </span>
                                        )}
                                        {jobPostApplications[jobPost.id].some(
                                          (app) =>
                                            app.isAccepted && !app.isEmployed,
                                        ) && (
                                          <span className="px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-semibold">
                                            Onaylanmış
                                          </span>
                                        )}
                                        {jobPostApplications[jobPost.id].some(
                                          (app) => app.isEmployed,
                                        ) && (
                                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-orange-900/30 dark:text-orange-400 rounded-full text-xs font-semibold">
                                            İşe Alınmış
                                          </span>
                                        )}
                                        {jobPostApplications[jobPost.id].some(
                                          (app) => app.isRejected,
                                        ) && (
                                          <span className="px-2 py-0.5 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-semibold">
                                            Reddedilen
                                          </span>
                                        )}
                                      </div>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {jobPost.professions?.profession} •{" "}
                                  {jobPost.workingMethod?.title}
                                </p>
                              </div>
                              {jobPost.isApproved === null && (
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-xs font-semibold">
                                  Beklemede
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  İşe Alınacak Kişi
                                </p>
                                <p className="text-sm font-semibold">
                                  {jobPost.hiringCount} kişi
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Başvuru Sayısı
                                </p>
                                <p className="text-sm font-semibold">
                                  {jobPost.applicationCount}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Son Başvuru
                                </p>
                                <p className="text-sm font-semibold">
                                  {new Date(
                                    jobPost.applicationUntilDate,
                                  ).toLocaleDateString("tr-TR")}
                                </p>
                              </div>
                            </div>
                            <div
                              className="text-sm text-gray-700 dark:text-gray-200 prose prose-sm max-w-none rich-html-content"
                              dangerouslySetInnerHTML={{
                                __html: jobPost.postDescription,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {jobPostsPagination.totalPages > 1 && (
                      <div className="flex justify-center gap-2 mt-6">
                        <button
                          onClick={() =>
                            setJobPostsPagination({
                              ...jobPostsPagination,
                              page: jobPostsPagination.page - 1,
                            })
                          }
                          disabled={jobPostsPagination.page === 1}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
                        >
                          Önceki
                        </button>
                        <span className="px-4 py-2">
                          {jobPostsPagination.page} /{" "}
                          {jobPostsPagination.totalPages}
                        </span>
                        <button
                          onClick={() =>
                            setJobPostsPagination({
                              ...jobPostsPagination,
                              page: jobPostsPagination.page + 1,
                            })
                          }
                          disabled={
                            jobPostsPagination.page >=
                            jobPostsPagination.totalPages
                          }
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
                        >
                          Sonraki
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Accounts Tab */}
            {activeTab === "changeRequests" && (
              <div className="space-y-4">
                {changeRequestsLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">Yükleniyor...</p>
                  </div>
                ) : changeRequests.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <ExclamationTriangleIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Henüz değişim isteği bulunmamaktadır.</p>
                  </div>
                ) : (
                  <>
                    {selectedChangeRequest ? (
                      <ChangeRequestDetail
                        request={selectedChangeRequest}
                        sectors={sectors}
                        getSectorName={getSectorName}
                        formatDate={formatDate}
                        onBack={() => setSelectedChangeRequest(null)}
                        onApprove={handleApproveChangeRequest}
                        onReject={handleRejectChangeRequest}
                        actionLoading={actionLoading}
                      />
                    ) : (
                      <div className="space-y-4">
                        {changeRequests.map((request) => (
                          <div
                            key={request.id}
                            className="border border-gray-200 dark:border-gray-600 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => handleViewChangeRequest(request.id)}
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                  Değişim İsteği #{request.id}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                                  <span>
                                    İstek Tarihi:{" "}
                                    {formatDate(request.createdAt)}
                                  </span>
                                  {request.requestedByAccount && (
                                    <span>
                                      İsteyen: {request.requestedByAccount.name}{" "}
                                      ({request.requestedByAccount.role?.role})
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {request.status === "pending" && (
                                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-xs font-semibold">
                                    Beklemede
                                  </span>
                                )}
                                {request.status === "approved" && (
                                  <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-semibold">
                                    Onaylandı
                                  </span>
                                )}
                                {request.status === "rejected" && (
                                  <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-semibold">
                                    Reddedildi
                                  </span>
                                )}
                                {request.status === "cancelled" && (
                                  <span className="px-3 py-1 bg-gray-100 text-gray-800 dark:text-gray-100 rounded-full text-xs font-semibold">
                                    İptal Edildi
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  Eski Değer
                                </p>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {request.oldPayload?.businessName || "-"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  Yeni Değer
                                </p>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {request.newPayload?.businessName || "-"}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === "accounts" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showDeletedAccounts}
                      onChange={(e) => {
                        const next = e.target.checked;
                        setShowDeletedAccounts(next);
                        setAccountsPagination((prev) => ({
                          ...prev,
                          page: 1,
                        }));
                      }}
                      className="h-4 w-4"
                    />
                    Silinenleri Göster
                  </label>
                  <button
                    onClick={() => setShowAddAccountModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-500 text-white dark:hover:bg-green-600 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Hesap Ekle
                  </button>
                </div>

                {accounts.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <UserGroupIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Henüz hesap bulunmamaktadır.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {accounts.map((account) => (
                        <div
                          key={account.id}
                          className={`border border-gray-200 dark:border-gray-600 rounded-xl p-6 transition-shadow ${
                            account.isDeleted
                              ? "bg-gray-100 dark:bg-gray-700"
                              : "hover:shadow-md"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  Ad Soyad
                                </p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                  {account.name} {account.surname}
                                  {account.isOperator && (
                                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded-full text-xs font-semibold">
                                      Yetkili
                                    </span>
                                  )}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  Rol
                                </p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {account.role?.role || "-"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  E-posta
                                </p>
                                <p className="text-sm text-gray-900 dark:text-white">
                                  {account.email}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  Telefon
                                </p>
                                <p className="text-sm text-gray-900 dark:text-white">
                                  {account.phoneNumber || "-"}
                                </p>
                              </div>
                            </div>
                            <div className="ml-4 flex gap-1">
                              <button
                                onClick={() => setEditingAccount(account)}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
                                title="Düzenle"
                              >
                                <PencilIcon className="w-5 h-5" />
                              </button>
                              {account.isDeleted ? (
                                <button
                                  onClick={() =>
                                    handleRestoreAccount(account.id)
                                  }
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Geri Getir"
                                >
                                  <CheckCircleIcon className="w-5 h-5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleDeleteAccount(account.id)
                                  }
                                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                  title="Sil"
                                >
                                  <TrashIcon className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {accountsPagination.totalPages > 1 && (
                      <div className="flex justify-center gap-2 mt-6">
                        <button
                          onClick={() =>
                            setAccountsPagination({
                              ...accountsPagination,
                              page: accountsPagination.page - 1,
                            })
                          }
                          disabled={accountsPagination.page === 1}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
                        >
                          Önceki
                        </button>
                        <span className="px-4 py-2">
                          {accountsPagination.page} /{" "}
                          {accountsPagination.totalPages}
                        </span>
                        <button
                          onClick={() =>
                            setAccountsPagination({
                              ...accountsPagination,
                              page: accountsPagination.page + 1,
                            })
                          }
                          disabled={
                            accountsPagination.page >=
                            accountsPagination.totalPages
                          }
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
                        >
                          Sonraki
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Business Modal */}
      {showEditModal && (
        <EditBusinessModal
          business={business}
          onClose={() => {
            setShowEditModal(false);
            fetchBusinessDetail();
          }}
        />
      )}

      {/* Add Account Modal */}
      {showAddAccountModal && (
        <AddAccountModal
          businessId={id}
          onClose={() => {
            setShowAddAccountModal(false);
            fetchAccounts();
          }}
        />
      )}

      {/* Edit Account Modal */}
      {editingAccount && (
        <EditAccountModal
          account={editingAccount}
          onClose={() => {
            setEditingAccount(null);
            fetchAccounts();
          }}
        />
      )}

      {/* Create Job Post Modal */}
      {showCreateJobPostModal && business && (
        <CreateJobPostModal
          businessId={parseInt(id)}
          onClose={() => {
            setShowCreateJobPostModal(false);
            fetchJobPosts();
          }}
        />
      )}
    </MainLayout>
  );
};

// Edit Business Modal Component
const EditBusinessModal = ({ business, onClose }) => {
  const [formData, setFormData] = useState({
    businessName: business.businessName || "",
    address: business.address || "",
    businessEmail: business.businessEmail || "",
    businessContactPhoneNumber: business.businessContactPhoneNumber || "",
    workerCount: business.workerCount || "",
    description: business.description || "",
    vergiNo: business.vergiNo || "",
    sectorIds: business.sectors?.map((s) => s.sectorId) || [],
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateBusiness(business.id, formData);
      onClose();
    } catch (error) {
      console.error("Error updating business:", error);
      showError(
        "Hata",
        getBackendErrorMessage(
          error,
          "İşletme güncellenirken bir hata oluştu.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">İşletme Düzenle</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                İşletme Adı
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) =>
                  setFormData({ ...formData, businessName: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Vergi No
              </label>
              <input
                type="text"
                value={formData.vergiNo}
                onChange={(e) =>
                  setFormData({ ...formData, vergiNo: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                E-posta
              </label>
              <input
                type="email"
                value={formData.businessEmail}
                onChange={(e) =>
                  setFormData({ ...formData, businessEmail: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Telefon
              </label>
              <input
                type="tel"
                value={formData.businessContactPhoneNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    businessContactPhoneNumber: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Adres
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Çalışan Sayısı
              </label>
              <select
                value={formData.workerCount}
                onChange={(e) =>
                  setFormData({ ...formData, workerCount: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Seçiniz</option>
                <option value="1-10">1-10</option>
                <option value="10-50">10-50</option>
                <option value="51-200">51-200</option>
                <option value="201-500">201-500</option>
                <option value="500+">500+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Açıklama
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                rows="3"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 dark:bg-orange-500 text-white dark:hover:bg-orange-600 rounded-lg hover:bg-blue-700 dark:hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add Account Modal Component
const normalizePhone = (phone) => {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("0") ? digits.slice(1) : digits;
};

const isNetworkError = (error) =>
  !error.responseData && /fetch|network|ağ|timeout|abort/i.test(error.message);

const getBackendErrorMessage = (error, fallback) => {
  if (isNetworkError(error)) return fallback;
  const rd = error.responseData;
  if (rd?.errors && Array.isArray(rd.errors) && rd.errors.length > 0) {
    return rd.errors.map((e) => e.message || e.msg).join("\n");
  }
  if (rd?.message) return rd.message;
  if (error.message && error.message !== "Failed to fetch")
    return error.message;
  return fallback;
};

const AddAccountModal = ({ businessId, onClose }) => {
  const [formData, setFormData] = useState({
    tc: "",
    name: "",
    surname: "",
    email: "",
    password: "",
    phoneNumber: "",
    roleId: "",
    isOperator: false,
  });
  const [businessRoles, setBusinessRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let mounted = true;
    getBusinessRoles()
      .then((res) => {
        if (!mounted) return;
        const roles = res?.data || [];
        setBusinessRoles(roles);
        setFormData((prev) => {
          if (prev.roleId !== "" || roles.length === 0) return prev;
          return { ...prev, roleId: String(roles[0].id) };
        });
      })
      .catch(() => {
        if (!mounted) return;
        setBusinessRoles([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrors({});
      await createBusinessAccount(businessId, {
        ...formData,
        phoneNumber: normalizePhone(formData.phoneNumber),
        roleId: parseInt(formData.roleId, 10),
      });
      onClose();
    } catch (error) {
      console.error("Error creating account:", error);
      const rd = error.responseData;
      if (rd?.errors && Array.isArray(rd.errors)) {
        const fieldErrors = {};
        rd.errors.forEach((e) => {
          if (e.field) fieldErrors[e.field] = e.message || e.msg;
        });
        setErrors(fieldErrors);
      }
      showError(
        "Hata",
        getBackendErrorMessage(error, "Hesap oluşturulurken bir hata oluştu."),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full">
        <div className="p-6 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Yeni Hesap Ekle</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                TC Kimlik No
              </label>
              <input
                type="text"
                value={formData.tc}
                onChange={(e) => {
                  setFormData({ ...formData, tc: e.target.value });
                  if (errors.tc) setErrors((prev) => ({ ...prev, tc: "" }));
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.tc ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"}`}
                required
              />
              {errors.tc && (
                <p className="mt-1 text-sm text-red-600">{errors.tc}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Rol
              </label>
              <select
                value={formData.roleId}
                onChange={(e) => {
                  setFormData({ ...formData, roleId: e.target.value });
                  if (errors.roleId)
                    setErrors((prev) => ({ ...prev, roleId: "" }));
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.roleId ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"}`}
                required
              >
                <option value="">Seçiniz</option>
                {businessRoles.map((role) => (
                  <option key={role.id} value={String(role.id)}>
                    {role.role || role.title || role.name || `Rol ${role.id}`}
                  </option>
                ))}
              </select>
              {errors.roleId && (
                <p className="mt-1 text-sm text-red-600">{errors.roleId}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Ad
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.name ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"}`}
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Soyad
              </label>
              <input
                type="text"
                value={formData.surname}
                onChange={(e) => {
                  setFormData({ ...formData, surname: e.target.value });
                  if (errors.surname)
                    setErrors((prev) => ({ ...prev, surname: "" }));
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.surname ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"}`}
                required
              />
              {errors.surname && (
                <p className="mt-1 text-sm text-red-600">{errors.surname}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                E-posta
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email)
                    setErrors((prev) => ({ ...prev, email: "" }));
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.email ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"}`}
                required
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Telefon
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => {
                  setFormData({ ...formData, phoneNumber: e.target.value });
                  if (errors.phoneNumber)
                    setErrors((prev) => ({ ...prev, phoneNumber: "" }));
                }}
                placeholder="05XX XXX XXXX"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.phoneNumber ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"}`}
                required
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Başında 0 ile veya 0 olmadan girebilirsiniz
              </p>
              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.phoneNumber}
                </p>
              )}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Şifre
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (errors.password)
                    setErrors((prev) => ({ ...prev, password: "" }));
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.password ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"}`}
                required
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isOperator}
                  onChange={(e) =>
                    setFormData({ ...formData, isOperator: e.target.checked })
                  }
                  className="w-5 h-5 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Yetkili (Operatör)
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Aynı anda yalnızca 1 hesap yetkili olabilir
                  </p>
                </div>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white dark:hover:bg-green-600 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? "Oluşturuluyor..." : "Oluştur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Account Modal Component
const EditAccountModal = ({ account, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: account?.name || "",
    surname: account?.surname || "",
    email: account?.email || "",
    phoneNumber: account?.phoneNumber || "",
    tc: account?.tc || "",
    roleId: account?.role?.id || "",
    password: "",
    isOperator: account?.isOperator ?? false,
  });
  const [businessRoles, setBusinessRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getBusinessRoles()
      .then((res) => setBusinessRoles(res?.data || []))
      .catch(() => setBusinessRoles([]));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updateData = {
      name: formData.name,
      surname: formData.surname,
      email: formData.email,
      phoneNumber: normalizePhone(formData.phoneNumber),
      tc: formData.tc,
      roleId: parseInt(formData.roleId),
      isOperator: formData.isOperator,
    };
    if (formData.password?.trim()) {
      updateData.password = formData.password;
    }
    try {
      setLoading(true);
      setErrors({});
      const response = await updateBusinessAccount(account.id, updateData);
      if (response?.success) {
        showSuccess("Başarılı", "Hesap başarıyla güncellendi.");
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      console.error("Error updating account:", error);
      const rd = error.responseData;
      if (rd?.errors && Array.isArray(rd.errors)) {
        const fieldErrors = {};
        rd.errors.forEach((e) => {
          if (e.field) fieldErrors[e.field] = e.message || e.msg;
        });
        setErrors(fieldErrors);
      }
      showError(
        "Hata",
        getBackendErrorMessage(error, "Hesap güncellenirken bir hata oluştu."),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Hesabı Düzenle</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Ad
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.name ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"}`}
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Soyad
              </label>
              <input
                type="text"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.surname ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"}`}
                required
              />
              {errors.surname && (
                <p className="mt-1 text-sm text-red-600">{errors.surname}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                TC Kimlik No
              </label>
              <input
                type="text"
                name="tc"
                value={formData.tc}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.tc ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"}`}
              />
              {errors.tc && (
                <p className="mt-1 text-sm text-red-600">{errors.tc}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                E-posta
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.email ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"}`}
                required
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Telefon
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.phoneNumber ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"}`}
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.phoneNumber}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Rol
              </label>
              <select
                name="roleId"
                value={formData.roleId}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.roleId ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"}`}
                required
              >
                <option value="">Seçiniz</option>
                {businessRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.role || role.title || role.name || `Rol ${role.id}`}
                  </option>
                ))}
              </select>
              {errors.roleId && (
                <p className="mt-1 text-sm text-red-600">{errors.roleId}</p>
              )}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Yeni Şifre
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Değiştirmek istemiyorsanız boş bırakın"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.password ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"}`}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Boş bırakılırsa şifre değişmez
              </p>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isOperator}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isOperator: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Yetkili (Operatör)
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Aynı anda yalnızca 1 hesap yetkili olabilir
                  </p>
                </div>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 dark:bg-orange-500 text-white dark:hover:bg-orange-600 rounded-lg hover:bg-blue-700 dark:hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Create Job Post Modal
const CreateJobPostModal = ({ businessId, onClose }) => {
  const [formData, setFormData] = useState({
    businessId: businessId,
    postTitle: "",
    postDescription: "",
    qualifications: "",
    professionId: "",
    professionLabel: "",
    workingMethodId: "",
    hiringCount: "",
    minExperienceYear: "",
    ageMin: "",
    ageMax: "",
    weeklyWorkingHours: "",
    genderOption: null,
    militaryStatus: null,
    coverLetterRequest: false,
    isPostForDisabledPersons: false,
    workStartedAt: "",
    workEndAt: "",
    applicationUntilDate: "",
    districts: [],
    applicantRights: [],
    drivingLisenceRequirements: [],
    educationLevels: [],
    workDays: [],
    workingExperiences: [],
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedCityId, setSelectedCityId] = useState("");
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [lookups, setLookups] = useState({
    professions: [],
    workingMethods: [],
    cities: [],
    educationTypes: [],
    applicantRights: [],
    drivingLicenseTypes: [],
    workDays: [],
    workingExperiences: [],
  });
  const [lookupsLoading, setLookupsLoading] = useState(true);

  // Meslek arama bileşeni - backend pagination ve search destekli
  const ProfessionSearchSelect = ({ value, label, onChange, error }) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [open, setOpen] = useState(false);
    const [dropdownPos, setDropdownPos] = useState({
      top: 0,
      left: 0,
      width: 0,
    });
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const timerRef = useRef(null);
    const wrapperRef = useRef(null);
    const triggerRef = useRef(null);
    const listRef = useRef(null);

    const doSearch = async (q, pageNum = 1, append = false) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setSearching(true);
        }
        const res = await searchProfessions(q, 30, pageNum);
        const data = res?.data || [];
        const pagination = res?.pagination || {};
        if (append) {
          setResults((prev) => [...prev, ...data]);
        } else {
          setResults(data);
        }
        setHasMore(
          pagination.page < pagination.totalPages && pagination.totalPages > 1,
        );
      } catch (e) {
        console.error(e);
      } finally {
        setSearching(false);
        setLoadingMore(false);
      }
    };

    useEffect(() => {
      if (!open) return;
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setPage(1);
        doSearch(query, 1, false);
      }, 300);
      return () => clearTimeout(timerRef.current);
    }, [query, open]);

    useEffect(() => {
      if (open && results.length === 0 && !query) {
        doSearch("", 1, false);
      }
    }, [open]);

    useEffect(() => {
      const handleClick = (e) => {
        if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
          const dropdown = document.getElementById("profession-dropdown-job");
          if (dropdown && dropdown.contains(e.target)) return;
          setOpen(false);
        }
      };
      if (open) document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    const loadMore = () => {
      if (!loadingMore && hasMore) {
        const nextPage = page + 1;
        setPage(nextPage);
        doSearch(query, nextPage, true);
      }
    };

    const handleScroll = (e) => {
      const el = e.target;
      if (el.scrollHeight - el.scrollTop <= el.clientHeight + 50) {
        loadMore();
      }
    };

    const openDropdown = () => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setDropdownPos({
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width,
        });
      }
      setOpen(!open);
    };

    return (
      <div ref={wrapperRef}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          Meslek <span className="text-red-500">*</span>
        </label>
        <div
          ref={triggerRef}
          className={`w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 cursor-pointer flex items-center justify-between min-h-[42px] ${
            error ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
          }`}
          onClick={openDropdown}
        >
          <span className={label || value ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-400"}>
            {label || (value ? `ID: ${value}` : "Meslek arayın...")}
          </span>
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("", "");
                setOpen(false);
              }}
              className="text-gray-400 dark:text-gray-400 hover:text-red-500 ml-2"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
        {open && (
          <div
            id="profession-dropdown-job"
            className="fixed z-[9999] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl"
            style={{
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
              maxHeight: 320,
            }}
          >
            <div className="p-2 border-b border-gray-100 dark:border-gray-700">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Meslek ara..."
                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>
            <div
              ref={listRef}
              className="overflow-y-auto"
              style={{ maxHeight: 270 }}
              onScroll={handleScroll}
            >
              {searching ? (
                <div className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  Aranıyor...
                </div>
              ) : results.length === 0 ? (
                <div className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  Sonuç bulunamadı
                </div>
              ) : (
                <>
                  {results.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        onChange(String(p.id), p.profession);
                        setOpen(false);
                        setQuery("");
                      }}
                      className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-orange-900/30 ${
                        String(p.id) === String(value)
                          ? "bg-blue-100 dark:bg-orange-900/40 font-medium"
                          : ""
                      }`}
                    >
                      {p.profession}
                    </div>
                  ))}
                  {loadingMore && (
                    <div className="px-3 py-2 text-center text-sm text-gray-500 dark:text-gray-400">
                      Yükleniyor...
                    </div>
                  )}
                  {hasMore && !loadingMore && (
                    <div
                      className="px-3 py-2 text-center text-sm text-blue-600 cursor-pointer hover:bg-blue-50 dark:hover:bg-orange-900/30"
                      onClick={loadMore}
                    >
                      Daha fazla yükle
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  };

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        setLookupsLoading(true);
        const [
          workingMethods,
          cities,
          educationTypes,
          applicantRights,
          drivingLicenseTypes,
          workDays,
          workingExperiences,
        ] = await Promise.all([
          getWorkingMethods().catch(() => ({ data: [] })),
          getCities().catch(() => ({ data: [] })),
          getEducationTypes().catch(() => ({ data: [] })),
          getApplicantRights().catch(() => ({ data: [] })),
          getDrivingLicenseTypes().catch(() => ({ data: [] })),
          getWorkDays().catch(() => ({ data: [] })),
          getWorkingExperiences().catch(() => ({ data: [] })),
        ]);

        setLookups({
          professions: [],
          workingMethods: workingMethods.data || workingMethods || [],
          cities: cities.data || cities || [],
          educationTypes: educationTypes.data || educationTypes || [],
          applicantRights: applicantRights.data || applicantRights || [],
          drivingLicenseTypes:
            drivingLicenseTypes.data || drivingLicenseTypes || [],
          workDays: workDays.data || workDays || [],
          workingExperiences:
            workingExperiences.data || workingExperiences || [],
        });
      } catch (error) {
        console.error("Error fetching lookups:", error);
      } finally {
        setLookupsLoading(false);
      }
    };

    fetchLookups();
  }, []);

  useEffect(() => {
    if (selectedCityId) {
      const loadDistricts = async () => {
        try {
          const result = await getDistrictsByCity(selectedCityId);
          setAvailableDistricts(result.data || result || []);
        } catch (error) {
          console.error("Error loading districts:", error);
          setAvailableDistricts([]);
        }
      };
      loadDistricts();
    } else {
      setAvailableDistricts([]);
      setFormData((prev) => ({ ...prev, districts: [] }));
    }
  }, [selectedCityId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Rich text editor için özel handler
  const handleRichTextChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleMultiSelect = (name, value) => {
    setFormData((prev) => {
      const currentValues = prev[name] || [];
      if (currentValues.includes(value)) {
        return {
          ...prev,
          [name]: currentValues.filter((v) => v !== value),
        };
      } else {
        return {
          ...prev,
          [name]: [...currentValues, value],
        };
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.postTitle) {
      newErrors.postTitle = "İlan başlığı zorunludur";
    }
    // HTML içeriğini temizleyerek kontrol et
    // Tiptap boş içerik için <p></p> veya <p><br></p> gibi boş tag'ler gönderebilir
    if (formData.postDescription) {
      // HTML tag'lerini ve entity'leri kaldır, sadece gerçek içeriği kontrol et
      const cleanDescription = formData.postDescription
        .replace(/<[^>]*>/g, "") // HTML tag'lerini kaldır
        .replace(/&nbsp;/g, " ") // &nbsp; entity'lerini boşlukla değiştir
        .replace(/&[a-z]+;/gi, "") // Diğer HTML entity'leri kaldır
        .replace(/\s+/g, " ") // Çoklu boşlukları tek boşluğa çevir
        .trim();

      // Eğer temizlenmiş içerik boşsa hata ver
      if (!cleanDescription || cleanDescription.length === 0) {
        newErrors.postDescription = "İş Tanımı zorunludur";
      }
    } else {
      newErrors.postDescription = "İş Tanımı zorunludur";
    }
    if (!formData.professionId) {
      newErrors.professionId = "Meslek seçimi zorunludur";
    }
    if (!formData.workingMethodId) {
      newErrors.workingMethodId = "Çalışma şekli zorunludur";
    }
    if (!formData.hiringCount) {
      newErrors.hiringCount = "Pozisyon sayısı zorunludur";
    }
    if (!formData.districts || formData.districts.length === 0) {
      newErrors.districts = "En az bir ilçe seçmelisiniz";
    }
    if (!formData.applicationUntilDate) {
      newErrors.applicationUntilDate = "Son başvuru tarihi zorunludur";
    }

    // Age validation
    if (formData.ageMin && formData.ageMax) {
      const ageMin = parseInt(formData.ageMin);
      const ageMax = parseInt(formData.ageMax);
      if (ageMin >= ageMax) {
        newErrors.ageMax = "Maksimum yaş, minimum yaştan büyük olmalıdır";
      }
      if (ageMin < 18) {
        newErrors.ageMin = "Minimum yaş 18'den küçük olamaz";
      }
    }

    // Work hours validation
    if (formData.workStartedAt && formData.workEndAt) {
      if (formData.workStartedAt >= formData.workEndAt) {
        newErrors.workEndAt =
          "İş bitiş saati, başlangıç saatinden sonra olmalıdır";
      }
    }

    // Minimum selections validation
    if (!formData.workDays || formData.workDays.length === 0) {
      newErrors.workDays = "En az bir çalışma günü seçmelisiniz";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showWarning("Uyarı", "Lütfen form hatalarını düzeltin");
      return;
    }

    try {
      setLoading(true);
      const submitData = {
        ...formData,
        businessId: parseInt(formData.businessId),
        professionId: parseInt(formData.professionId),
        workingMethodId: parseInt(formData.workingMethodId),
        hiringCount: parseInt(formData.hiringCount),
        // Min deneyim boşsa 0 gitsin
        minExperienceYear: formData.minExperienceYear
          ? parseInt(formData.minExperienceYear)
          : 0,
        districts: formData.districts.map((id) => parseInt(id)),
        applicantRights: formData.applicantRights.map((id) => parseInt(id)),
        drivingLisenceRequirements: formData.drivingLisenceRequirements.map(
          (id) => parseInt(id),
        ),
        educationLevels: formData.educationLevels.map((id) => parseInt(id)),
        workDays: formData.workDays.map((id) => parseInt(id)),
        workingExperiences: formData.workingExperiences.map((id) =>
          parseInt(id),
        ),
      };

      // Boş bırakılan isteğe bağlı sayısal alanları hiç gönderme
      if (!formData.ageMin) {
        delete submitData.ageMin;
      } else {
        submitData.ageMin = parseInt(formData.ageMin);
      }

      if (!formData.ageMax) {
        delete submitData.ageMax;
      } else {
        submitData.ageMax = parseInt(formData.ageMax);
      }

      if (!formData.weeklyWorkingHours) {
        delete submitData.weeklyWorkingHours;
      } else {
        submitData.weeklyWorkingHours = parseInt(formData.weeklyWorkingHours);
      }

      // Çalışma saatleri boşsa backend'e hiç gönderme
      if (!formData.workStartedAt) {
        delete submitData.workStartedAt;
      }
      if (!formData.workEndAt) {
        delete submitData.workEndAt;
      }

      // genderOption ve militaryStatus: boolean/null olarak gönder
      if (
        formData.genderOption === null ||
        formData.genderOption === undefined
      ) {
        delete submitData.genderOption;
      } else {
        submitData.genderOption = formData.genderOption;
      }

      if (
        formData.militaryStatus === null ||
        formData.militaryStatus === undefined
      ) {
        delete submitData.militaryStatus;
      } else {
        submitData.militaryStatus = formData.militaryStatus;
      }

      const response = await createJobPost(submitData);
      if (response.success) {
        onClose();
      }
    } catch (error) {
      console.error("Error creating job post:", error);
      showError(
        "Hata",
        getBackendErrorMessage(
          error,
          "İş ilanı oluşturulurken bir hata oluştu.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  if (lookupsLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-600 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Yeni İş İlanı Oluştur
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Temel Bilgiler */}
          <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BriefcaseIcon className="w-5 h-5 text-blue-600" />
              Temel Bilgiler
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  İlan Başlığı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="postTitle"
                  value={formData.postTitle}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.postTitle ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"}`}
                  placeholder="Örn: Senior Software Developer"
                />
                {errors.postTitle && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.postTitle}
                  </p>
                )}
              </div>

              <div>
                <RichTextEditor
                  label="İş Tanımı"
                  name="postDescription"
                  value={formData.postDescription}
                  onChange={handleRichTextChange}
                  error={errors.postDescription}
                  placeholder="İş ilanı hakkında detaylı bilgi verin"
                  required
                  helperText="İş Tanımını zengin metin editörü ile formatlayabilirsiniz"
                />
              </div>

              <div>
                <RichTextEditor
                  label="Nitelikler"
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleRichTextChange}
                  error={errors.qualifications}
                  placeholder="Adaylarda aranan nitelikler"
                  helperText="Adaylarda aranan nitelikleri liste halinde ekleyebilirsiniz"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <ProfessionSearchSelect
                    value={formData.professionId}
                    label={formData.professionLabel}
                    onChange={(id, label) => {
                      setFormData((prev) => ({
                        ...prev,
                        professionId: id,
                        professionLabel: label || "",
                      }));
                      if (errors.professionId) {
                        setErrors((prev) => ({ ...prev, professionId: "" }));
                      }
                    }}
                    error={errors.professionId}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Çalışma Şekli <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="workingMethodId"
                    value={formData.workingMethodId}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.workingMethodId ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"}`}
                  >
                    <option value="">Seçiniz</option>
                    {lookups.workingMethods.map((wm) => (
                      <option key={wm.id} value={wm.id}>
                        {wm.title || wm.name}
                      </option>
                    ))}
                  </select>
                  {errors.workingMethodId && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.workingMethodId}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Pozisyon Sayısı <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="hiringCount"
                    value={formData.hiringCount}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.hiringCount ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"}`}
                    placeholder="2"
                    min="1"
                  />
                  {errors.hiringCount && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.hiringCount}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Minimum Deneyim (Yıl)
                  </label>
                  <input
                    type="number"
                    name="minExperienceYear"
                    value={formData.minExperienceYear}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="5"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Haftalık Çalışma Saati
                  </label>
                  <input
                    type="number"
                    name="weeklyWorkingHours"
                    value={formData.weeklyWorkingHours}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="40"
                    min="1"
                    max="168"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Konum ve Tarih Bilgileri */}
          <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MapPinIcon className="w-5 h-5 text-green-600" />
              Konum ve Tarih
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Şehir
                  </label>
                  <select
                    value={selectedCityId}
                    onChange={(e) => setSelectedCityId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Seçiniz</option>
                    {lookups.cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.title || city.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    İlçeler <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 min-h-[80px] max-h-[200px] overflow-y-auto">
                    {availableDistricts.length > 0 ? (
                      availableDistricts.map((district) => {
                        const isSelected = formData.districts.includes(
                          district.id?.toString(),
                        );
                        return (
                          <button
                            key={district.id}
                            type="button"
                            onClick={() =>
                              handleMultiSelect(
                                "districts",
                                district.id?.toString(),
                              )
                            }
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              isSelected
                                ? "bg-blue-600 dark:bg-orange-500 text-white dark:hover:bg-orange-600"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                            }`}
                          >
                            {district.title || district.name}
                          </button>
                        );
                      })
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Önce bir şehir seçin
                      </span>
                    )}
                  </div>
                  {errors.districts && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.districts}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    İş Başlangıç Saati
                  </label>
                  <input
                    type="time"
                    name="workStartedAt"
                    value={formData.workStartedAt}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.workStartedAt ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"}`}
                    placeholder="08:00"
                  />
                  {errors.workStartedAt && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.workStartedAt}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    İş Bitiş Saati
                  </label>
                  <input
                    type="time"
                    name="workEndAt"
                    value={formData.workEndAt}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.workEndAt ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"}`}
                    placeholder="17:00"
                  />
                  {errors.workEndAt && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.workEndAt}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Son Başvuru Tarihi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="applicationUntilDate"
                    value={formData.applicationUntilDate}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.applicationUntilDate ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"}`}
                    min={new Date().toISOString().split("T")[0]}
                  />
                  {errors.applicationUntilDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.applicationUntilDate}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Yaş ve Cinsiyet */}
          <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <UserGroupIcon className="w-5 h-5 text-purple-600" />
              Aday Kriterleri
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Minimum Yaş
                  </label>
                  <input
                    type="number"
                    name="ageMin"
                    value={formData.ageMin}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.ageMin ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"}`}
                    placeholder="25"
                    min="18"
                  />
                  {errors.ageMin && (
                    <p className="mt-1 text-sm text-red-600">{errors.ageMin}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Maksimum Yaş
                  </label>
                  <input
                    type="number"
                    name="ageMax"
                    value={formData.ageMax}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.ageMax ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"}`}
                    placeholder="45"
                    min="18"
                  />
                  {errors.ageMax && (
                    <p className="mt-1 text-sm text-red-600">{errors.ageMax}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Cinsiyet
                  </label>
                  <select
                    name="genderOption"
                    value={
                      formData.genderOption === null
                        ? ""
                        : formData.genderOption === true
                          ? "male"
                          : "female"
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        genderOption:
                          value === "" ? null : value === "male" ? true : false,
                      }));
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Belirtilmemiş</option>
                    <option value="male">Erkek</option>
                    <option value="female">Kadın</option>
                  </select>
                </div>

                {formData.genderOption === true && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Askerlik Durumu
                    </label>
                    <select
                      name="militaryStatus"
                      value={
                        formData.militaryStatus === null
                          ? ""
                          : formData.militaryStatus === true
                            ? "true"
                            : formData.militaryStatus === false
                              ? "false"
                              : ""
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          militaryStatus:
                            value === ""
                              ? null
                              : value === "true"
                                ? true
                                : value === "false"
                                  ? false
                                  : null,
                        }));
                      }}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Belirtilmemiş</option>
                      <option value="true">Gerekli</option>
                      <option value="false">Gerekli Değil</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Eğitim ve Deneyim */}
          <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <DocumentTextIcon className="w-5 h-5 text-indigo-600" />
              Eğitim ve Deneyim
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                  Eğitim Seviyeleri
                </label>
                <div className="flex flex-wrap gap-2 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 min-h-[80px] max-h-[200px] overflow-y-auto">
                  {lookups.educationTypes &&
                  lookups.educationTypes.length > 0 ? (
                    [...lookups.educationTypes]
                      .sort((a, b) => {
                        const order = [
                          "İlkokul",
                          "Ortaokul",
                          "Lise",
                          "Önlisans",
                          "Lisans",
                          "Yüksek Lisans",
                          "Doktora",
                        ];
                        const aType = a.type || a.title || a.name || "";
                        const bType = b.type || b.title || b.name || "";
                        const aIndex = order.indexOf(aType);
                        const bIndex = order.indexOf(bType);
                        if (aIndex === -1 && bIndex === -1)
                          return aType.localeCompare(bType, "tr");
                        if (aIndex === -1) return 1;
                        if (bIndex === -1) return -1;
                        return aIndex - bIndex;
                      })
                      .map((edu) => {
                        const isSelected = formData.educationLevels.includes(
                          edu.id?.toString(),
                        );
                        return (
                          <button
                            key={edu.id}
                            type="button"
                            onClick={() =>
                              handleMultiSelect(
                                "educationLevels",
                                edu.id?.toString(),
                              )
                            }
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              isSelected
                                ? "bg-indigo-600 text-white"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                            }`}
                          >
                            {edu.type || edu.title || edu.name}
                          </button>
                        );
                      })
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Eğitim seviyeleri yükleniyor...
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                  İş Deneyimi
                </label>
                <div className="flex flex-wrap gap-2 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 min-h-[80px] max-h-[200px] overflow-y-auto">
                  {lookups.workingExperiences &&
                  lookups.workingExperiences.length > 0 ? (
                    lookups.workingExperiences.map((exp) => {
                      const isSelected = formData.workingExperiences.includes(
                        exp.id?.toString(),
                      );
                      return (
                        <button
                          key={exp.id}
                          type="button"
                          onClick={() =>
                            handleMultiSelect(
                              "workingExperiences",
                              exp.id?.toString(),
                            )
                          }
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            isSelected
                              ? "bg-indigo-600 text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                          }`}
                        >
                          {exp.name || exp.title}
                        </button>
                      );
                    })
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      İş deneyimi seçenekleri yükleniyor...
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Çalışma Günleri ve Haklar */}
          <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-orange-600" />
              Çalışma Günleri ve Haklar
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                  Çalışma Günleri <span className="text-red-500">*</span>
                </label>
                {errors.workDays && (
                  <p className="mb-2 text-sm text-red-600">{errors.workDays}</p>
                )}
                <div className="flex flex-wrap gap-2 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 min-h-[80px]">
                  {lookups.workDays && lookups.workDays.length > 0 ? (
                    lookups.workDays.map((day) => {
                      const isSelected = formData.workDays.includes(
                        day.id?.toString(),
                      );
                      return (
                        <button
                          key={day.id}
                          type="button"
                          onClick={() =>
                            handleMultiSelect("workDays", day.id?.toString())
                          }
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            isSelected
                              ? "bg-orange-600 text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                          }`}
                        >
                          {day.name || day.title}
                        </button>
                      );
                    })
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Çalışma günleri yükleniyor...
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                  Aday Hakları
                </label>
                <div className="flex flex-wrap gap-2 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 min-h-[80px] max-h-[200px] overflow-y-auto">
                  {lookups.applicantRights &&
                  lookups.applicantRights.length > 0 ? (
                    lookups.applicantRights.map((right) => {
                      const isSelected = formData.applicantRights.includes(
                        right.id?.toString(),
                      );
                      return (
                        <button
                          key={right.id}
                          type="button"
                          onClick={() =>
                            handleMultiSelect(
                              "applicantRights",
                              right.id?.toString(),
                            )
                          }
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            isSelected
                              ? "bg-orange-600 text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                          }`}
                        >
                          {right.name || right.title}
                        </button>
                      );
                    })
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Aday hakları yükleniyor...
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                  Ehliyet Gereksinimleri
                </label>
                <div className="flex flex-wrap gap-2 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 min-h-[80px] max-h-[200px] overflow-y-auto">
                  {lookups.drivingLicenseTypes &&
                  lookups.drivingLicenseTypes.length > 0 ? (
                    lookups.drivingLicenseTypes.map((license) => {
                      const isSelected =
                        formData.drivingLisenceRequirements.includes(
                          license.id?.toString(),
                        );
                      return (
                        <button
                          key={license.id}
                          type="button"
                          onClick={() =>
                            handleMultiSelect(
                              "drivingLisenceRequirements",
                              license.id?.toString(),
                            )
                          }
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            isSelected
                              ? "bg-orange-600 text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                          }`}
                        >
                          {license.title || license.name}
                        </button>
                      );
                    })
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Ehliyet türleri yükleniyor...
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Diğer Seçenekler */}
          <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <ShieldCheckIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              Diğer Seçenekler
            </h3>
            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="coverLetterRequest"
                  checked={formData.coverLetterRequest}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Ön yazı (Cover Letter) isteniyor mu?
                </span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isPostForDisabledPersons"
                  checked={formData.isPostForDisabledPersons}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Bu ilan engelli bireyler için mi?
                </span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 dark:bg-orange-500 text-white dark:hover:bg-orange-600 rounded-lg hover:bg-blue-700 dark:hover:bg-orange-600 disabled:opacity-50 flex-1"
            >
              {loading ? "Oluşturuluyor..." : "İlanı Oluştur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Change Request Detail Component
const ChangeRequestDetail = ({
  request,
  getSectorName,
  formatDate,
  onBack,
  onApprove,
  onReject,
  actionLoading,
}) => {
  const renderFieldComparison = (label, oldValue, newValue) => {
    const hasChanged = oldValue !== newValue;
    return (
      <div
        className={`p-4 rounded-lg ${hasChanged ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700" : "bg-gray-50 dark:bg-gray-900"}`}
      >
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">{label}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Eski Değer</p>
            <p
              className={`text-sm font-medium ${hasChanged ? "text-red-600" : "text-gray-700 dark:text-gray-200"}`}
            >
              {oldValue || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Yeni Değer</p>
            <p
              className={`text-sm font-medium ${hasChanged ? "text-green-600" : "text-gray-700 dark:text-gray-200"}`}
            >
              {newValue || "-"}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderSectorsComparison = (oldSectorIds, newSectorIds) => {
    const oldSectors =
      oldSectorIds?.map((id) => getSectorName(id)).join(", ") || "-";
    const newSectors =
      newSectorIds?.map((id) => getSectorName(id)).join(", ") || "-";
    // Normalize arrays for comparison and highlight logic in renderFieldComparison
    const normalize = (arr) => {
      const copy = [...(arr || [])];
      copy.sort();
      return copy;
    };
    const _hasChanged =
      JSON.stringify(normalize(oldSectorIds)) !==
      JSON.stringify(normalize(newSectorIds));
    return renderFieldComparison("Sektörler", oldSectors, newSectors);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:text-white transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Geri Dön
        </button>
        <div className="flex items-center gap-2">
          {request.status === "pending" && (
            <>
              <button
                onClick={() => onApprove(request.id)}
                disabled={actionLoading[`approve-cr-${request.id}`]}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-500 text-white dark:hover:bg-green-600 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 transition-colors"
              >
                <CheckCircleIcon className="w-4 h-4" />
                {actionLoading[`approve-cr-${request.id}`]
                  ? "Onaylanıyor..."
                  : "Onayla"}
              </button>
              <button
                onClick={() => onReject(request.id)}
                disabled={actionLoading[`reject-cr-${request.id}`]}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 dark:bg-red-500 text-white dark:hover:bg-red-600 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                <XCircleIcon className="w-4 h-4" />
                {actionLoading[`reject-cr-${request.id}`]
                  ? "Reddediliyor..."
                  : "Reddet"}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Değişim İsteği #{request.id}
          </h2>
          <div>
            {request.status === "pending" && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-xs font-semibold">
                Beklemede
              </span>
            )}
            {request.status === "approved" && (
              <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-semibold">
                Onaylandı
              </span>
            )}
            {request.status === "rejected" && (
              <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-semibold">
                Reddedildi
              </span>
            )}
            {request.status === "cancelled" && (
              <span className="px-3 py-1 bg-gray-100 text-gray-800 dark:text-gray-100 rounded-full text-xs font-semibold">
                İptal Edildi
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">İstek Tarihi</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formatDate(request.createdAt)}
              </p>
            </div>
            {request.requestedByAccount && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">İsteyen</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {request.requestedByAccount.name} (
                  {request.requestedByAccount.role?.role})
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Değişiklikler
          </h3>

          {renderFieldComparison(
            "İşletme Adı",
            request.oldPayload?.businessName,
            request.newPayload?.businessName,
          )}
          {renderFieldComparison(
            "E-posta",
            request.oldPayload?.businessEmail,
            request.newPayload?.businessEmail,
          )}
          {renderFieldComparison(
            "Telefon",
            request.oldPayload?.businessContactPhoneNumber,
            request.newPayload?.businessContactPhoneNumber,
          )}
          {renderFieldComparison(
            "Adres",
            request.oldPayload?.address,
            request.newPayload?.address,
          )}
          {renderFieldComparison(
            "Çalışan Sayısı",
            request.oldPayload?.workerCount,
            request.newPayload?.workerCount,
          )}
          {renderFieldComparison(
            "Vergi No",
            request.oldPayload?.vergiNo,
            request.newPayload?.vergiNo,
          )}
          {renderFieldComparison(
            "Açıklama",
            request.oldPayload?.description,
            request.newPayload?.description,
          )}
          {renderSectorsComparison(
            request.oldPayload?.sectorIds,
            request.newPayload?.sectorIds,
          )}
        </div>

        {request.reason && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Red Nedeni</p>
            <p className="text-sm text-gray-900 dark:text-white">{request.reason}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessDetail;
