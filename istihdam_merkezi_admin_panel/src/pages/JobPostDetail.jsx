import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  getJobPostById,
  approveJobPost,
  rejectJobPost,
  getJobPostRecommends,
  getJobPostApplications,
  getJobPostUpdateRequests,
  getUpdateRequestById,
  approveUpdateRequest,
  rejectUpdateRequest,
  updateJobPost,
  deleteJobPost,
  toggleJobPostVisibility,
  toggleJobPostActive,
} from "../api/jobPostService";
import {
  acceptApplication,
  employUser,
  rejectApplication,
  createApplicationForUser,
  sendAcceptSmsForApplication,
  deleteApplication,
} from "../api/applicationService";
import { getAllUsers, getUserById } from "../api/userService";
import {
  showError,
  showConfirm,
  showSuccess,
  showWarning,
} from "../utils/swal";
import MainLayout from "../components/layout/MainLayout";
import RichTextEditor from "../components/RichTextEditor";
import {
  BriefcaseIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingOfficeIcon,
  ClockIcon,
  MapPinIcon,
  AcademicCapIcon,
  StarIcon,
  PencilIcon,
  CalendarIcon,
  ShieldCheckIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  PowerIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import {
  getProfessions,
  getWorkingMethods,
  getDistrictsByCity,
  getEducationTypes,
  getApplicantRights,
  getDrivingLicenseTypes,
  getWorkDays,
  getWorkingExperiences,
  getCities,
  getLanguages,
} from "../api/lookupService";
import Swal from "sweetalert2";

const JobPostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const includeDeleted =
    new URLSearchParams(location.search).get("includeDeleted") === "true";
  const [jobPost, setJobPost] = useState(null);
  const [applications, setApplications] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("info"); // info, applications, recommendations, manualApply, stats, updateRequests
  const [actionLoading, setActionLoading] = useState({});
  const [updateRequests, setUpdateRequests] = useState([]);
  const [updateRequestsLoading, setUpdateRequestsLoading] = useState(false);
  const [selectedUpdateRequest, setSelectedUpdateRequest] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [lookups, setLookups] = useState({
    professions: [],
    workingMethods: [],
    districts: {},
    educationTypes: [],
    applicantRights: [],
    drivingLicenseTypes: [],
    workDays: [],
    workingExperiences: [],
    languages: [],
  });
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsPagination, setApplicationsPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [manualApplySearch, setManualApplySearch] = useState("");
  const [manualApplyUsers, setManualApplyUsers] = useState([]);
  const [manualApplyUsersLoading, setManualApplyUsersLoading] = useState(false);
  const [manualApplyHasSearched, setManualApplyHasSearched] = useState(false);
  const [manualApplySelectedUser, setManualApplySelectedUser] = useState(null);
  const [manualApplySelectedUserLoading, setManualApplySelectedUserLoading] =
    useState(false);
  const [manualApplyCoverLetter, setManualApplyCoverLetter] = useState("");
  const [manualApplyWarnings, setManualApplyWarnings] = useState([]);
  const [manualApplyMissing, setManualApplyMissing] = useState([]);

  const formatDateTime = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString("tr-TR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    if (id) {
      fetchJobPostDetail();
    }
  }, [id, includeDeleted]);

  useEffect(() => {
    // If job post is not approved, only show info tab
    if (jobPost && jobPost.isApproved === null && activeTab !== "info") {
      setActiveTab("info");
    }
  }, [jobPost, activeTab]);

  useEffect(() => {
    if (activeTab === "updateRequests" && id) {
      fetchUpdateRequests();
      fetchLookups();
    }
  }, [activeTab, id]);

  const fetchApplications = async (page = applicationsPagination.page) => {
    try {
      setApplicationsLoading(true);
      const response = await getJobPostApplications(id, {
        includeDeleted,
        page,
        limit: applicationsPagination.limit,
      });
      if (response.success) {
        setApplications(response.data.applications || []);
        if (response.data.pagination) {
          setApplicationsPagination((prev) => ({
            ...prev,
            ...response.data.pagination,
          }));
        }
      } else {
        setApplications([]);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setApplicationsLoading(false);
    }
  };

  const fetchJobPostDetail = async (keepCurrentPage = false) => {
    try {
      setLoading(true);
      const page = keepCurrentPage ? applicationsPagination.page : 1;
      const [jobPostResponse, applicationsResponse] = await Promise.all([
        getJobPostById(id, { includeDeleted }),
        getJobPostApplications(id, {
          includeDeleted,
          page,
          limit: applicationsPagination.limit,
        }).catch(() => ({
          success: false,
          data: { applications: [] },
        })),
      ]);

      if (jobPostResponse.success) {
        setJobPost(jobPostResponse.data.jobPost);
        setStats(jobPostResponse.data.stats || null);
      }

      if (applicationsResponse.success) {
        setApplications(applicationsResponse.data.applications || []);
        if (applicationsResponse.data.pagination) {
          setApplicationsPagination((prev) => ({
            ...prev,
            ...applicationsResponse.data.pagination,
          }));
        }
      } else {
        setApplications([]);
      }

      setRecommendations([]);
    } catch (error) {
      console.error("Error fetching job post detail:", error);
      showError("Hata", "İş ilanı detayları yüklenemedi.");
      navigate("/dashboard/job-posts");
    } finally {
      setLoading(false);
    }
  };

  const handleManualApplySearch = async () => {
    if (!manualApplySearch.trim()) return;
    try {
      setManualApplyUsersLoading(true);
      setManualApplyHasSearched(false);
      const response = await getAllUsers({
        page: 1,
        limit: 20,
        filters: { search: manualApplySearch.trim() },
      });
      if (response.success) {
        setManualApplyUsers(response.data.users || []);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setManualApplyUsersLoading(false);
      setManualApplyHasSearched(true);
    }
  };

  const computeMissingFields = (user) => {
    const isFilled = (v) =>
      v !== null && v !== undefined && String(v).trim() !== "";
    const isBooleanFilled = (v) => v === true || v === false;
    const hasArray = (arr) => Array.isArray(arr) && arr.length > 0;

    const requirements = [
      { key: "name", label: "Ad", ok: isFilled(user.name) },
      { key: "surname", label: "Soyad", ok: isFilled(user.surname) },
      { key: "tc", label: "T.C. Kimlik Numarası", ok: isFilled(user.tc) },
      { key: "birthday", label: "Doğum Tarihi", ok: !!user.birthday },
      { key: "gender", label: "Cinsiyet", ok: isFilled(user.gender) },
      { key: "email", label: "E-posta Adresi", ok: isFilled(user.email) },
      {
        key: "phoneNumber",
        label: "Telefon Numarası",
        ok: isFilled(user.phoneNumber),
      },
      {
        key: "profilePicture",
        label: "Profil Fotoğrafı",
        ok: isFilled(user.profilePicture),
      },
      {
        key: "retirementStatus",
        label: "Emeklilik Durumu",
        ok: isBooleanFilled(user.retirementStatus),
      },
      {
        key: "isMarried",
        label: "Medeni Hâl",
        ok: isBooleanFilled(user.isMarried),
      },
      {
        key: "smokingStatus",
        label: "Sigara Kullanımı",
        ok: isBooleanFilled(user.smokingStatus),
      },
      {
        key: "isDisabledPerson",
        label: "Engellilik Durumu",
        ok: isBooleanFilled(user.isDisabledPerson),
      },
      {
        key: "addressText",
        label: "Açık Adres",
        ok: isFilled(user.addressText),
      },
      {
        key: "addressNeighbourhoodId",
        label: "Mahalle Bilgisi",
        ok: !!user.addressNeighbourhoodId,
      },
      {
        key: "isPhoneApproved",
        label: "Telefon Onayı",
        ok: user.isPhoneApproved === true,
      },
      {
        key: "isEmailApproved",
        label: "E-posta Onayı",
        ok: user.isEmailApproved === true,
      },
      {
        key: "sectors",
        label: "En az bir sektör seçilmeli",
        ok: hasArray(user.sectors),
      },
      {
        key: "professions",
        label: "En az bir meslek seçilmeli",
        ok: hasArray(user.professions),
      },
    ];

    return requirements.filter((r) => !r.ok);
  };

  const checkJobPostWarnings = (user) => {
    if (!jobPost || !user) return [];
    const warnings = [];

    if (user.birthday && (jobPost.ageMin || jobPost.ageMax)) {
      const birth = new Date(user.birthday);
      const age = Math.floor(
        (Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
      );
      if (jobPost.ageMin && age < jobPost.ageMin) {
        warnings.push({
          type: "warning",
          text: `Kullanıcı yaşı (${age}) ilanın minimum yaşından (${jobPost.ageMin}) küçük.`,
        });
      }
      if (jobPost.ageMax && age > jobPost.ageMax) {
        warnings.push({
          type: "warning",
          text: `Kullanıcı yaşı (${age}) ilanın maksimum yaşından (${jobPost.ageMax}) büyük.`,
        });
      }
    }

    if (jobPost.genderOption !== null && jobPost.genderOption !== undefined) {
      const requiredGender = jobPost.genderOption === true ? "male" : "female";
      if (user.gender && user.gender !== requiredGender) {
        warnings.push({
          type: "warning",
          text: `İlan ${requiredGender === "male" ? "erkek" : "kadın"} personel arıyor, kullanıcı ${user.gender === "male" ? "erkek" : "kadın"}.`,
        });
      }
    }

    if (
      jobPost.militaryStatus &&
      user.gender === "male" &&
      user.militaryStatus !== true
    ) {
      warnings.push({
        type: "warning",
        text: "İlan askerlik yapılmış olmasını istiyor, kullanıcı askerliğini yapmamış.",
      });
    }

    if (jobPost.coverLetterRequest) {
      warnings.push({ type: "info", text: "Bu ilan için ön yazı gereklidir." });
    }

    return warnings;
  };

  const handleDeleteApplication = async (applicationId) => {
    const confirm = await showConfirm(
      "Başvuruyu Sil",
      "Bu başvuruyu silmek istediğinize emin misiniz? (Kayıt soft delete olarak işaretlenecek, kullanıcı tekrar başvurabilir.)",
      "Evet, Sil",
      "Vazgeç",
    );

    if (!confirm.isConfirmed) return;

    try {
      setActionLoading((prev) => ({
        ...prev,
        [`delete-${applicationId}`]: true,
      }));
      const response = await deleteApplication(applicationId);
      if (response.success) {
        showSuccess("Başarılı", "Başvuru başarıyla silindi.");
        await fetchApplications();
      } else {
        showError("Hata", response.message || "Başvuru silinemedi.");
      }
    } catch (error) {
      console.error("Delete application error:", error);
      showError("Hata", "Başvuru silinemedi.");
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [`delete-${applicationId}`]: false,
      }));
    }
  };

  const handleSelectUser = async (user) => {
    try {
      setManualApplySelectedUserLoading(true);
      setManualApplySelectedUser(user);
      setManualApplyWarnings([]);
      setManualApplyMissing([]);

      const response = await getUserById(user.id);
      if (!response.success) {
        showError("Hata", "Kullanıcı detayları yüklenemedi.");
        return;
      }
      const fullUser = response.data;
      setManualApplySelectedUser(fullUser);

      const missing = computeMissingFields(fullUser);
      setManualApplyMissing(missing);

      const warnings = [];

      const alreadyApplied = applications.some(
        (app) => app.userId === fullUser.id,
      );
      if (alreadyApplied) {
        warnings.push({
          type: "error",
          text: "Bu kullanıcı bu ilana zaten başvurmuş.",
        });
      }

      if (fullUser.isApproved !== true) {
        warnings.push({
          type: "error",
          text: "Kullanıcının hesabı henüz onaylanmamış.",
        });
      }

      if (missing.length > 0) {
        warnings.push({
          type: "error",
          text: `Kullanıcının profili eksik (${missing.length} alan). Başvuru yapılamaz.`,
        });
      }

      warnings.push(...checkJobPostWarnings(fullUser));

      setManualApplyWarnings(warnings);
    } catch (error) {
      console.error("Error fetching user details:", error);
      showError("Hata", "Kullanıcı detayları yüklenemedi.");
    } finally {
      setManualApplySelectedUserLoading(false);
    }
  };

  const handleManualApply = async () => {
    if (!manualApplySelectedUser) {
      showWarning("Uyarı", "Lütfen başvurtmak istediğiniz kullanıcıyı seçin.");
      return;
    }

    const hasError = manualApplyWarnings.some((w) => w.type === "error");
    if (hasError) {
      showError(
        "Hata",
        "Hata içeren uyarılar mevcut. Lütfen seçili kullanıcıyı kontrol edin.",
      );
      return;
    }

    if (jobPost.coverLetterRequest && !manualApplyCoverLetter.trim()) {
      showWarning(
        "Uyarı",
        "Bu ilan için ön yazı gereklidir. Lütfen ön yazı girin.",
      );
      return;
    }

    const hasWarning = manualApplyWarnings.some((w) => w.type === "warning");
    if (hasWarning) {
      const result = await showConfirm(
        "Uyarı",
        "Kullanıcı bazı gereksinimleri karşılamıyor. Yine de başvurmak istiyor musunuz?",
        "Evet, Başvurt",
        "İptal",
      );
      if (!result.isConfirmed) return;
    }

    try {
      setActionLoading({ ...actionLoading, manualApply: true });
      await createApplicationForUser(id, {
        userId: manualApplySelectedUser.id,
        coverLetter: manualApplyCoverLetter.trim() || undefined,
      });
      showSuccess(
        "Başarılı",
        `${manualApplySelectedUser.name} ${manualApplySelectedUser.surname} bu iş ilanına başarıyla başvuruldu.`,
      );
      setManualApplySelectedUser(null);
      setManualApplyCoverLetter("");
      setManualApplyWarnings([]);
      setManualApplySearch("");
      setManualApplyUsers([]);
      await fetchJobPostDetail(true);
    } catch (error) {
      console.error("Error creating application for user:", error);
      const msg = error?.message || "Başvuru oluşturulamadı.";
      showError("Hata", msg);
    } finally {
      setActionLoading({ ...actionLoading, manualApply: false });
    }
  };

  const handleSendAcceptSms = async (applicationId) => {
    const result = await showConfirm(
      "Kabul SMS'i Gönder",
      "Bu kullanıcıya başvurusunun kabul edildiğine dair SMS göndermek istediğinize emin misiniz? Bu SMS yalnızca bir kez gönderilebilir.",
      "Evet, Gönder",
      "İptal",
    );

    if (!result.isConfirmed) {
      return;
    }

    try {
      setActionLoading((prev) => ({ ...prev, [`sms-${applicationId}`]: true }));
      const response = await sendAcceptSmsForApplication(applicationId);
      if (response?.success) {
        showSuccess(
          "Başarılı",
          response.message || "Kabul SMS'i başarıyla gönderildi.",
        );
        await fetchJobPostDetail(true);
      }
    } catch (error) {
      console.error("Error sending accept SMS:", error);
      const msg = error?.message || error?.response?.data?.message;
      showError("Hata", msg || "Kabul SMS'i gönderilirken bir hata oluştu.");
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [`sms-${applicationId}`]: false,
      }));
    }
  };

  const handleApprove = async () => {
    try {
      setActionLoading({ ...actionLoading, approve: true });
      await approveJobPost(id);
      await fetchJobPostDetail();
    } catch (error) {
      console.error("Error approving job post:", error);
      showError("Hata", "Onaylama işlemi başarısız oldu.");
    } finally {
      setActionLoading({ ...actionLoading, approve: false });
    }
  };

  const handleReject = async () => {
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
      setActionLoading({ ...actionLoading, reject: true });
      await rejectJobPost(id);
      await fetchJobPostDetail();
      showSuccess("Başarılı", "İş ilanı başarıyla reddedildi.");
    } catch (error) {
      console.error("Error rejecting job post:", error);
      showError("Hata", "Reddetme işlemi başarısız oldu.");
    } finally {
      setActionLoading({ ...actionLoading, reject: false });
    }
  };

  const fetchRecommendations = async () => {
    try {
      setRecommendationsLoading(true);
      const response = await getJobPostRecommends(id);
      if (response.success) {
        setRecommendations(response.data.recommendations || []);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      showError("Hata", "Öneriler yüklenemedi.");
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const handleAcceptApplication = async (applicationId) => {
    try {
      setActionLoading({ ...actionLoading, [`accept-${applicationId}`]: true });
      await acceptApplication(applicationId);
      await fetchJobPostDetail(true);
      showSuccess("Başarılı", "Başvuru onaylandı.");
    } catch (error) {
      console.error("Error accepting application:", error);
      showError("Hata", "Başvuru onaylanırken bir hata oluştu.");
    } finally {
      setActionLoading({
        ...actionLoading,
        [`accept-${applicationId}`]: false,
      });
    }
  };

  const handleEmployUser = async (applicationId) => {
    try {
      setActionLoading({ ...actionLoading, [`employ-${applicationId}`]: true });
      await employUser(applicationId);
      await fetchJobPostDetail(true);
      showSuccess("Başarılı", "Kullanıcı işe alındı.");
    } catch (error) {
      console.error("Error employing user:", error);
      showError("Hata", "Kullanıcı işe alınırken bir hata oluştu.");
    } finally {
      setActionLoading({
        ...actionLoading,
        [`employ-${applicationId}`]: false,
      });
    }
  };

  const handleRejectApplication = async (applicationId) => {
    const result = await showConfirm(
      "Başvuruyu Reddet",
      "Bu başvuruyu reddetmek istediğinize emin misiniz?",
      "Evet, Reddet",
      "İptal",
    );

    if (!result.isConfirmed) {
      return;
    }

    const { value: rejectReason, isConfirmed: isNoteConfirmed } =
      await Swal.fire({
        title: "Reddetme Notu",
        input: "textarea",
        inputLabel: "Başvuruyu neden reddediyorsunuz?",
        inputPlaceholder:
          "Örn: İlan kriterlerini karşılamıyor, deneyim süresi yetersiz vb.",
        inputAttributes: {
          "aria-label": "Reddetme Notu",
        },
        showCancelButton: true,
        confirmButtonColor: "#9333ea",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Kaydet ve Reddet",
        cancelButtonText: "İptal",
        reverseButtons: true,
      });

    if (!isNoteConfirmed) {
      return;
    }

    try {
      setActionLoading({ ...actionLoading, [`reject-${applicationId}`]: true });
      await rejectApplication(applicationId, rejectReason || "");
      await fetchJobPostDetail(true);
      showSuccess("Başarılı", "Başvuru reddedildi.");
    } catch (error) {
      console.error("Error rejecting application:", error);
      showError("Hata", "Başvuru reddedilirken bir hata oluştu.");
    } finally {
      setActionLoading({
        ...actionLoading,
        [`reject-${applicationId}`]: false,
      });
    }
  };

  const getStatusBadge = (isApproved) => {
    if (isApproved === true) {
      return (
        <span className="px-4 py-1.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-semibold">
          Onaylandı
        </span>
      );
    } else if (isApproved === false) {
      return (
        <span className="px-4 py-1.5 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full text-sm font-semibold">
          Reddedildi
        </span>
      );
    } else {
      return (
        <span className="px-4 py-1.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-sm font-semibold">
          Beklemede
        </span>
      );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    return timeString;
  };

  const fetchUpdateRequests = async () => {
    try {
      setUpdateRequestsLoading(true);
      const response = await getJobPostUpdateRequests(id, {
        page: 1,
        limit: 100,
      });
      if (response.success) {
        setUpdateRequests(response.data.updateRequests || []);
      }
    } catch (error) {
      console.error("Error fetching update requests:", error);
      setUpdateRequests([]);
    } finally {
      setUpdateRequestsLoading(false);
    }
  };

  const fetchLookups = async () => {
    try {
      const [
        professionsRes,
        workingMethodsRes,
        districtsRes,
        educationTypesRes,
        applicantRightsRes,
        drivingLicenseTypesRes,
        workDaysRes,
        workingExperiencesRes,
        languagesRes,
      ] = await Promise.all([
        getProfessions().catch(() => ({ success: false, data: [] })),
        getWorkingMethods().catch(() => ({ success: false, data: [] })),
        getDistrictsByCity(67).catch(() => ({ success: false, data: [] })),
        getEducationTypes().catch(() => ({ success: false, data: [] })),
        getApplicantRights().catch(() => ({ success: false, data: [] })),
        getDrivingLicenseTypes().catch(() => ({ success: false, data: [] })),
        getWorkDays().catch(() => ({ success: false, data: [] })),
        getWorkingExperiences().catch(() => ({ success: false, data: [] })),
        getLanguages().catch(() => ({ success: false, data: [] })),
      ]);

      // Create districts map
      const districtsMap = {};
      if (districtsRes.success && districtsRes.data) {
        districtsRes.data.forEach((district) => {
          districtsMap[district.id] = district;
        });
      }

      setLookups({
        professions: professionsRes.success ? professionsRes.data : [],
        workingMethods: workingMethodsRes.success ? workingMethodsRes.data : [],
        districts: districtsMap,
        educationTypes: educationTypesRes.success ? educationTypesRes.data : [],
        applicantRights: applicantRightsRes.success
          ? applicantRightsRes.data
          : [],
        drivingLicenseTypes: drivingLicenseTypesRes.success
          ? drivingLicenseTypesRes.data
          : [],
        workDays: workDaysRes.success ? workDaysRes.data : [],
        workingExperiences: workingExperiencesRes.success
          ? workingExperiencesRes.data
          : [],
        languages: languagesRes.success ? languagesRes.data : [],
      });
    } catch (error) {
      console.error("Error fetching lookups:", error);
    }
  };

  const handleViewUpdateRequest = async (requestId) => {
    try {
      const response = await getUpdateRequestById(requestId);
      if (response.success) {
        setSelectedUpdateRequest(response.data);
      }
    } catch (error) {
      console.error("Error fetching update request:", error);
      showError("Hata", "Güncelleme isteği yüklenemedi.");
    }
  };

  const handleApproveUpdateRequest = async (requestId) => {
    const result = await showConfirm(
      "Güncelleme İsteğini Onayla",
      "Bu güncelleme isteğini onaylamak istediğinize emin misiniz?",
      "Evet, Onayla",
      "İptal",
    );

    if (!result.isConfirmed) {
      return;
    }

    try {
      setActionLoading({ ...actionLoading, [`approve-ur-${requestId}`]: true });
      await approveUpdateRequest(requestId);
      showSuccess("Başarılı", "Güncelleme isteği onaylandı.");
      await fetchUpdateRequests();
      await fetchJobPostDetail();
      setSelectedUpdateRequest(null);
    } catch (error) {
      console.error("Error approving update request:", error);
      showError("Hata", "Güncelleme isteği onaylanırken bir hata oluştu.");
    } finally {
      setActionLoading({
        ...actionLoading,
        [`approve-ur-${requestId}`]: false,
      });
    }
  };

  const handleRejectUpdateRequest = async (requestId) => {
    const result = await showConfirm(
      "Güncelleme İsteğini Reddet",
      "Bu güncelleme isteğini reddetmek istediğinize emin misiniz?",
      "Evet, Reddet",
      "İptal",
    );

    if (!result.isConfirmed) {
      return;
    }

    try {
      setActionLoading({ ...actionLoading, [`reject-ur-${requestId}`]: true });
      await rejectUpdateRequest(requestId);
      showSuccess("Başarılı", "Güncelleme isteği reddedildi.");
      await fetchUpdateRequests();
      setSelectedUpdateRequest(null);
    } catch (error) {
      console.error("Error rejecting update request:", error);
      showError("Hata", "Güncelleme isteği reddedilirken bir hata oluştu.");
    } finally {
      setActionLoading({ ...actionLoading, [`reject-ur-${requestId}`]: false });
    }
  };

  const handleDelete = async () => {
    const result = await showConfirm(
      "İş İlanını Sil",
      "Bu iş ilanını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.",
      "Evet, Sil",
      "İptal",
    );

    if (!result.isConfirmed) {
      return;
    }

    try {
      setActionLoading({ ...actionLoading, delete: true });
      await deleteJobPost(id);
      showSuccess("Başarılı", "İş ilanı başarıyla silindi.");
      navigate("/dashboard/job-posts");
    } catch (error) {
      console.error("Error deleting job post:", error);
      showError("Hata", "Silme işlemi başarısız oldu.");
    } finally {
      setActionLoading({ ...actionLoading, delete: false });
    }
  };

  const handleToggleVisibility = async () => {
    try {
      setActionLoading({ ...actionLoading, toggleVisibility: true });
      await toggleJobPostVisibility(id);
      await fetchJobPostDetail();
      showSuccess(
        "Başarılı",
        `İş ilanı ${jobPost.isShown ? "gizlendi" : "görünür yapıldı"}.`,
      );
    } catch (error) {
      console.error("Error toggling visibility:", error);
      showError("Hata", "Görünürlük değiştirilemedi.");
    } finally {
      setActionLoading({ ...actionLoading, toggleVisibility: false });
    }
  };

  const handleToggleActive = async () => {
    try {
      setActionLoading({ ...actionLoading, toggleActive: true });
      await toggleJobPostActive(id);
      await fetchJobPostDetail();
      showSuccess(
        "Başarılı",
        `İş ilanı ${jobPost.isActive ? "pasif yapıldı" : "aktif yapıldı"}.`,
      );
    } catch (error) {
      console.error("Error toggling active:", error);
      showError("Hata", "Aktiflik durumu değiştirilemedi.");
    } finally {
      setActionLoading({ ...actionLoading, toggleActive: false });
    }
  };

  const getLookupName = (type, id) => {
    if (type === "district") {
      const district = lookups.districts[id];
      return district ? district.title : `İlçe #${id}`;
    }
    const lookupMap = {
      profession: lookups.professions.find((p) => p.id === id),
      workingMethod: lookups.workingMethods.find((w) => w.id === id),
      educationType: lookups.educationTypes.find((e) => e.id === id),
      applicantRight: lookups.applicantRights.find((a) => a.id === id),
      drivingLicense: lookups.drivingLicenseTypes.find((d) => d.id === id),
      workDay: lookups.workDays.find((w) => w.id === id),
      workingExperience: lookups.workingExperiences.find((w) => w.id === id),
      language: lookups.languages.find((l) => l.id === id),
    };
    const item = lookupMap[type];
    if (!item) return `#${id}`;
    return item.profession || item.title || item.name || item.type || `#${id}`;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Yükleniyor...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!jobPost) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">İş ilanı bulunamadı.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 max-w-full overflow-x-hidden">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
              >
                <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  {jobPost.postTitle}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                  {jobPost.professions?.profession} •{" "}
                  {jobPost.workingMethod?.title}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {getStatusBadge(jobPost.isApproved)}
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-orange-500 dark:to-orange-600 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 dark:hover:from-orange-600 dark:hover:to-orange-700 font-semibold transition-all shadow-lg hover:shadow-xl text-sm"
              >
                <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Düzenle</span>
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading.delete}
                className="flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-500 dark:to-red-600 text-white rounded-xl hover:from-red-700 hover:to-red-800 dark:hover:from-red-600 dark:hover:to-red-700 disabled:opacity-50 font-semibold transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed text-sm"
              >
                <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">
                  {actionLoading.delete ? "Siliniyor..." : "Sil"}
                </span>
              </button>
              {jobPost.isApproved === null && (
                <>
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading.approve}
                    className="flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-green-600 to-green-700 dark:from-green-500 dark:to-green-600 text-white rounded-xl hover:from-green-700 hover:to-green-800 dark:hover:from-green-600 dark:hover:to-green-700 disabled:opacity-50 font-semibold transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed text-sm"
                  >
                    <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>
                      {actionLoading.approve ? "Onaylanıyor..." : "Onayla"}
                    </span>
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={actionLoading.reject}
                    className="flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-500 dark:to-red-600 text-white rounded-xl hover:from-red-700 hover:to-red-800 dark:hover:from-red-600 dark:hover:to-red-700 disabled:opacity-50 font-semibold transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed text-sm"
                  >
                    <XCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>
                      {actionLoading.reject ? "Reddediliyor..." : "Reddet"}
                    </span>
                  </button>
                </>
              )}
              {jobPost.isApproved !== null && (
                <>
                  <button
                    onClick={handleToggleVisibility}
                    disabled={actionLoading.toggleVisibility}
                    className={`flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm ${jobPost.isShown
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 dark:from-orange-500 dark:to-orange-600 text-white hover:from-blue-700 hover:to-blue-800 dark:hover:from-orange-600 dark:hover:to-orange-700"
                      : "bg-gradient-to-r from-gray-600 to-gray-700 dark:from-gray-500 dark:to-gray-600 text-white hover:from-gray-700 hover:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700"
                      }`}
                  >
                    {jobPost.isShown ? (
                      <>
                        <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">
                          {actionLoading.toggleVisibility
                            ? "Gizleniyor..."
                            : "Gizle"}
                        </span>
                      </>
                    ) : (
                      <>
                        <EyeSlashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">
                          {actionLoading.toggleVisibility
                            ? "Gösteriliyor..."
                            : "Göster"}
                        </span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleToggleActive}
                    disabled={actionLoading.toggleActive}
                    className={`flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm ${jobPost.isActive
                      ? "bg-gradient-to-r from-green-600 to-green-700 dark:from-green-500 dark:to-green-600 text-white hover:from-green-700 hover:to-green-800 dark:hover:from-green-600 dark:hover:to-green-700"
                      : "bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-500 dark:to-orange-600 text-white hover:from-orange-700 hover:to-orange-800 dark:hover:from-orange-600 dark:hover:to-orange-700"
                      }`}
                  >
                    <PowerIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">
                      {actionLoading.toggleActive
                        ? jobPost.isActive
                          ? "Pasif yapılıyor..."
                          : "Aktif yapılıyor..."
                        : jobPost.isActive
                          ? "Pasif Yap"
                          : "Aktif Yap"}
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tabs */}
          <nav className="flex -mb-px overflow-x-auto scrollbar-hide border-b border-gray-200 dark:border-gray-600">
            <button
              onClick={() => setActiveTab("info")}
              className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === "info"
                ? "border-blue-600 dark:border-orange-400 text-blue-600 dark:text-orange-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-200"
                }`}
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <BriefcaseIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                Genel Bilgiler
              </div>
            </button>
            {jobPost.isApproved !== null && (
              <>
                <button
                  onClick={() => setActiveTab("applications")}
                  className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === "applications"
                    ? "border-blue-600 dark:border-orange-400 text-blue-600 dark:text-orange-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-200"
                    }`}
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <DocumentTextIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    Başvurular ({applicationsPagination.total || applications.length})
                  </div>
                </button>
                <button
                  onClick={async () => {
                    setActiveTab("recommendations");
                    if (
                      recommendations.length === 0 &&
                      !recommendationsLoading
                    ) {
                      await fetchRecommendations();
                    }
                  }}
                  className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === "recommendations"
                    ? "border-blue-600 dark:border-orange-400 text-blue-600 dark:text-orange-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-200"
                    }`}
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <StarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    Öneriler
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("manualApply")}
                  className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === "manualApply"
                    ? "border-blue-600 dark:border-orange-400 text-blue-600 dark:text-orange-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-200"
                    }`}
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Kullanıcı Başvurt</span>
                    <span className="sm:hidden">Başvurt</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("stats")}
                  className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === "stats"
                    ? "border-blue-600 dark:border-orange-400 text-blue-600 dark:text-orange-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-200"
                    }`}
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    İstatistikler
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("updateRequests")}
                  className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === "updateRequests"
                    ? "border-blue-600 dark:border-orange-400 text-blue-600 dark:text-orange-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-200"
                    }`}
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <DocumentTextIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">
                      Güncelleme İstekleri
                    </span>
                    <span className="sm:hidden">Güncelleme</span>
                  </div>
                </button>
              </>
            )}
          </nav>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          {/* Info Tab */}
          {activeTab === "info" && (
            <div className="space-y-6">
              {/* İş İlanı Bilgileri */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  İş İlanı Bilgileri
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">İş Başlığı</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {jobPost.postTitle}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Meslek</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {jobPost.professions?.profession || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Çalışma Şekli</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {jobPost.workingMethod?.title || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Alınacak Kişi Sayısı
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {jobPost.hiringCount} kişi
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Çalışma Saatleri
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {jobPost.workStartedAt == null &&
                        jobPost.workEndAt == null
                        ? "Kriter yok"
                        : `${formatTime(jobPost.workStartedAt)} - ${formatTime(jobPost.workEndAt)}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Haftalık Çalışma Saati
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {jobPost.weeklyWorkingHours != null
                        ? `${jobPost.weeklyWorkingHours} saat`
                        : "Kriter yok"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Minimum Deneyim Yılı
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {jobPost.minExperienceYear != null
                        ? `${jobPost.minExperienceYear} yıl`
                        : "Kriter yok"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Yaş Aralığı</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {jobPost.ageMin == null && jobPost.ageMax == null
                        ? "Kriter yok"
                        : `${jobPost.ageMin ?? "-"} - ${jobPost.ageMax ?? "-"} yaş`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Son Başvuru Tarihi
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatDate(jobPost.applicationUntilDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Ön Yazı İsteniyor mu?
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {jobPost.coverLetterRequest ? "Evet" : "Hayır"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Engelli Personel İlanı mı?
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {jobPost.isPostForDisabledPersons ? "Evet" : "Hayır"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Cinsiyet Tercihi
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {jobPost.genderOption
                        ? "Erkek"
                        : jobPost.genderOption === false
                          ? "Kadın"
                          : "Belirtilmemiş"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Askerlik Durumu
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {jobPost.militaryStatus ? "İsteniyor" : "İstenmiyor"}
                    </p>
                  </div>
                </div>
              </div>

              {/* İş Açıklaması */}
              {jobPost.postDescription && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    İş Açıklaması
                  </h3>
                  <div
                    className="prose prose-sm max-w-none text-gray-700 dark:text-gray-200 rich-html-content"
                    dangerouslySetInnerHTML={{
                      __html: jobPost.postDescription,
                    }}
                  />
                </div>
              )}

              {/* Nitelikler */}
              {jobPost.qualifications && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Nitelikler
                  </h3>
                  <div
                    className="prose prose-sm max-w-none text-gray-700 dark:text-gray-200 rich-html-content"
                    dangerouslySetInnerHTML={{ __html: jobPost.qualifications }}
                  />
                </div>
              )}

              {/* Eğitim Seviyeleri */}
              {jobPost.educationLevels &&
                jobPost.educationLevels.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Eğitim Seviyeleri
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {jobPost.educationLevels.map((edu) => (
                        <span
                          key={edu.id}
                          className="px-4 py-2 bg-blue-50 dark:bg-orange-900/20 text-blue-700 dark:text-orange-300 rounded-lg text-sm font-semibold"
                        >
                          {edu.educationType.type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Çalışma Günleri */}
              {jobPost.workDays && jobPost.workDays.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Çalışma Günleri
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {jobPost.workDays.map((workDay) => (
                      <span
                        key={workDay.id}
                        className="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-sm font-semibold"
                      >
                        {workDay.day.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* İlçeler */}
              {jobPost.districts && jobPost.districts.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    İlçeler
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {jobPost.districts.map((district) => (
                      <span
                        key={district.id}
                        className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-semibold"
                      >
                        {district.district.title} /{" "}
                        {district.district.city.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Çalışma Deneyimleri */}
              {jobPost.workingExperiences &&
                jobPost.workingExperiences.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Çalışma Deneyimleri
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {jobPost.workingExperiences.map((exp) => (
                        <span
                          key={exp.id}
                          className="px-4 py-2 bg-orange-50 text-orange-700 rounded-lg text-sm font-semibold"
                        >
                          {exp.workingExperience.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Başvuran Hakları */}
              {jobPost.applicantRights &&
                jobPost.applicantRights.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Başvuran Hakları
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {jobPost.applicantRights.map((right) => (
                        <span
                          key={right.id}
                          className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg text-sm font-semibold"
                        >
                          {right.applicantRight.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Diller */}
              {jobPost.languages && jobPost.languages.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Diller
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {jobPost.languages.map((lang) => (
                      <span
                        key={lang.id}
                        className="px-4 py-2 bg-teal-50 text-teal-700 rounded-lg text-sm font-semibold"
                      >
                        {lang.language.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Ehliyet Gereksinimleri */}
              {jobPost.drivingLisenceRequirements &&
                jobPost.drivingLisenceRequirements.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Ehliyet Gereksinimleri
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {jobPost.drivingLisenceRequirements.map((req) => (
                        <span
                          key={req.id}
                          className="px-4 py-2 bg-pink-50 text-pink-700 rounded-lg text-sm font-semibold"
                        >
                          {req.drivingLisenceType?.title || "-"}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* İşletme Bilgileri */}
              {jobPost.business && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    İşletme Bilgileri
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">İşletme Adı</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {jobPost.business.businessName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">E-posta</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {jobPost.business.businessEmail}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Telefon</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {jobPost.business.businessContactPhoneNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Çalışan Sayısı
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {jobPost.business.workerCount}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Adres</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {jobPost.business.address}
                      </p>
                    </div>
                    {jobPost.business.sectors &&
                      jobPost.business.sectors.length > 0 && (
                        <div className="col-span-2">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                            Sektörler
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {jobPost.business.sectors.map((sectorItem) => (
                              <span
                                key={sectorItem.id}
                                className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold"
                              >
                                {sectorItem.sector.sector}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() =>
                        navigate(`/dashboard/businesses/${jobPost.business.id}`)
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-orange-500 text-white dark:hover:bg-orange-600 rounded-lg hover:bg-blue-700 dark:hover:bg-orange-600 transition-colors"
                    >
                      <BuildingOfficeIcon className="w-5 h-5" />
                      İşletme Detayına Git
                    </button>
                  </div>
                </div>
              )}

              {/* Onay Bilgileri */}
              {jobPost.reviewedByAdmin && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Onay Bilgileri
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Onaylayan Admin
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {jobPost.reviewedByAdmin.name}{" "}
                        {jobPost.reviewedByAdmin.surname}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Oluşturulma Tarihi
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatDate(jobPost.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Güncellenme Tarihi
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatDate(jobPost.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Manual Apply Tab */}
          {activeTab === "manualApply" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Kullanıcıyı Bu İlana Başvurt
              </h2>

              {/* Step 1: Search Users */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-600 min-w-0 overflow-hidden">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                  1. Kullanıcı Ara
                </h3>
                <div className="flex flex-col sm:flex-row gap-3 sm:items-stretch">
                  <input
                    type="text"
                    value={manualApplySearch}
                    onChange={(e) => setManualApplySearch(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleManualApplySearch()
                    }
                    className="w-full min-w-0 flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="İsim, soyisim, TC, telefon veya e-posta ile ara..."
                  />
                  <button
                    onClick={handleManualApplySearch}
                    disabled={
                      manualApplyUsersLoading || !manualApplySearch.trim()
                    }
                    className="w-full sm:w-auto shrink-0 px-6 py-2.5 bg-blue-600 dark:bg-orange-500 text-white dark:hover:bg-orange-600 rounded-lg hover:bg-blue-700 dark:hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold whitespace-nowrap"
                  >
                    {manualApplyUsersLoading ? "Aranıyor..." : "Ara"}
                  </button>
                </div>

                {/* Search Results */}
                {manualApplyUsers.length > 0 && (
                  <div className="mt-4 max-h-80 overflow-y-auto overflow-x-hidden space-y-2 min-w-0">
                    {manualApplyUsers.map((user) => {
                      const isAlreadyApplied = applications.some(
                        (app) => app.userId === user.id,
                      );
                      const isSelected =
                        manualApplySelectedUser?.id === user.id;
                      return (
                        <div
                          key={user.id}
                          onClick={() =>
                            !isAlreadyApplied && handleSelectUser(user)
                          }
                          className={`p-3 sm:p-4 rounded-lg border-2 transition-all min-w-0 ${isAlreadyApplied
                            ? "border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 opacity-60 cursor-not-allowed"
                            : isSelected
                              ? "border-blue-500 dark:border-orange-400 bg-blue-50 dark:bg-orange-900/20 cursor-pointer"
                              : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-orange-500 hover:bg-blue-50/50 dark:hover:bg-orange-900/20 cursor-pointer"
                            }`}
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between min-w-0">
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                              <div
                                className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${isSelected ? "bg-blue-600 dark:bg-orange-500 text-white" : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300"}`}
                              >
                                <UserIcon className="w-5 h-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-gray-900 dark:text-white break-words">
                                  {user.name} {user.surname}
                                </p>
                                <div className="flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-1">
                                  {user.tc && (
                                    <span className="break-words">
                                      TC: {user.tc}
                                    </span>
                                  )}
                                  {user.phoneNumber && (
                                    <span className="break-words">
                                      Tel: {user.phoneNumber}
                                    </span>
                                  )}
                                  {user.email && (
                                    <span className="break-all">{user.email}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 shrink-0 sm:justify-end sm:pt-0.5">
                              {user.isApproved === true ? (
                                <span className="px-2.5 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-semibold whitespace-nowrap">
                                  Onaylı
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-xs font-semibold whitespace-nowrap">
                                  Beklemede
                                </span>
                              )}
                              {isAlreadyApplied && (
                                <span className="px-2.5 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-semibold whitespace-nowrap">
                                  Zaten Başvurmuş
                                </span>
                              )}
                              {isSelected && (
                                <CheckCircleIcon className="w-6 h-6 text-blue-600 shrink-0" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {manualApplyUsers.length === 0 &&
                  manualApplyHasSearched &&
                  !manualApplyUsersLoading && (
                    <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      Arama sonucu bulunamadı.
                    </p>
                  )}
              </div>

              {/* Step 2: Selected User + Warnings */}
              {manualApplySelectedUser && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-blue-200 dark:border-orange-700 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      2. Seçilen Kullanıcı
                    </h3>
                    <button
                      onClick={() => {
                        setManualApplySelectedUser(null);
                        setManualApplyWarnings([]);
                        setManualApplyMissing([]);
                        setManualApplyCoverLetter("");
                      }}
                      className="text-xs text-red-600 hover:text-red-700 font-semibold"
                    >
                      Seçimi Kaldır
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-blue-50 dark:bg-orange-900/20 p-4 rounded-lg min-w-0">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-blue-600 dark:bg-orange-500 text-white flex items-center justify-center text-lg font-bold">
                      {manualApplySelectedUser.name?.charAt(0)}
                      {manualApplySelectedUser.surname?.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3 min-w-0">
                        <p className="text-lg font-bold text-gray-900 dark:text-white break-words">
                          {manualApplySelectedUser.name}{" "}
                          {manualApplySelectedUser.surname}
                        </p>
                        <button
                          onClick={() =>
                            navigate(
                              `/dashboard/users/${manualApplySelectedUser.id}`,
                            )
                          }
                          className="text-xs text-blue-600 hover:text-blue-700 font-semibold underline shrink-0 self-start sm:self-auto"
                        >
                          Profili Gör
                        </button>
                      </div>
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4 text-sm text-gray-600 dark:text-gray-300 mt-1 sm:flex-wrap min-w-0">
                        {manualApplySelectedUser.email && (
                          <span className="break-all">
                            {manualApplySelectedUser.email}
                          </span>
                        )}
                        {manualApplySelectedUser.phoneNumber && (
                          <span className="break-words">
                            {manualApplySelectedUser.phoneNumber}
                          </span>
                        )}
                        {manualApplySelectedUser.gender && (
                          <span>
                            {manualApplySelectedUser.gender === "male"
                              ? "Erkek"
                              : "Kadın"}
                          </span>
                        )}
                        {manualApplySelectedUser.birthday && (
                          <span>
                            {Math.floor(
                              (Date.now() -
                                new Date(
                                  manualApplySelectedUser.birthday,
                                ).getTime()) /
                              (365.25 * 24 * 60 * 60 * 1000),
                            )}{" "}
                            yaş
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {manualApplySelectedUserLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-sm text-gray-600 dark:text-gray-300">
                        Kullanıcı bilgileri kontrol ediliyor...
                      </span>
                    </div>
                  ) : (
                    <>
                      {/* Missing Profile Fields */}
                      {manualApplyMissing.length > 0 && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <XCircleIcon className="w-5 h-5 text-red-500" />
                            <h4 className="text-sm font-semibold text-red-800">
                              Eksik Profil Bilgileri (
                              {manualApplyMissing.length})
                            </h4>
                          </div>
                          <p className="text-xs text-red-700 mb-3">
                            Bu kullanıcının profilinde aşağıdaki zorunlu alanlar
                            eksik. Başvuru yapılabilmesi için bu alanların
                            doldurulması gerekiyor.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {manualApplyMissing.map((field) => (
                              <span
                                key={field.key}
                                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-semibold"
                              >
                                {field.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Warnings and Info */}
                      {manualApplyWarnings.length > 0 && (
                        <div className="space-y-2">
                          {manualApplyWarnings.map((warning, idx) => (
                            <div
                              key={idx}
                              className={`flex items-start gap-2 p-3 rounded-lg text-sm ${warning.type === "error"
                                ? "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700"
                                : warning.type === "warning"
                                  ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700"
                                  : "bg-blue-50 dark:bg-orange-900/20 text-blue-800 dark:text-orange-300 border border-blue-200 dark:border-orange-700"
                                }`}
                            >
                              {warning.type === "error" && (
                                <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                              )}
                              {warning.type === "warning" && (
                                <svg
                                  className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                                  />
                                </svg>
                              )}
                              {warning.type === "info" && (
                                <svg
                                  className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              )}
                              <span>{warning.text}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {manualApplyWarnings.length === 0 &&
                        manualApplyMissing.length === 0 && (
                          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700 rounded-lg text-sm">
                            <CheckCircleIcon className="w-5 h-5 text-green-500" />
                            <span>
                              Kullanıcı tüm gereksinimleri karşılıyor. Başvuru
                              oluşturulabilir.
                            </span>
                          </div>
                        )}

                      {/* Step 3: Cover Letter */}
                      {!manualApplyWarnings.some((w) => w.type === "error") && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                            3. Ön Yazı{" "}
                            {jobPost.coverLetterRequest ? (
                              <span className="text-red-500">*</span>
                            ) : (
                              "(Opsiyonel)"
                            )}
                          </h3>
                          <textarea
                            value={manualApplyCoverLetter}
                            onChange={(e) =>
                              setManualApplyCoverLetter(e.target.value)
                            }
                            rows={4}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            placeholder={
                              jobPost.coverLetterRequest
                                ? "Bu ilan için ön yazı zorunludur..."
                                : "Opsiyonel ön yazı..."
                            }
                          />
                        </div>
                      )}

                      {/* Submit */}
                      {!manualApplyWarnings.some((w) => w.type === "error") && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 min-w-0">
                          <button
                            onClick={handleManualApply}
                            disabled={actionLoading.manualApply}
                            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-orange-500 dark:to-orange-600 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 dark:hover:from-orange-600 dark:hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all text-center whitespace-normal"
                          >
                            {actionLoading.manualApply
                              ? "Başvuru oluşturuluyor..."
                              : `${manualApplySelectedUser.name} ${manualApplySelectedUser.surname} için Başvuru Oluştur`}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === "applications" && (
            <div className={`flex flex-col gap-4 ${applicationsPagination.totalPages > 1 ? "pb-16" : ""}`}>
              {applicationsLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">Yükleniyor...</p>
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <DocumentTextIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Henüz başvuru bulunmamaktadır.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Sort applications: pending first, then accepted, then others */}
                  {[...applications]
                    .sort((a, b) => {
                      // Pending first
                      if (!a.isAccepted && !a.isRejected && !a.isEmployed)
                        return -1;
                      if (!b.isAccepted && !b.isRejected && !b.isEmployed)
                        return 1;
                      // Accepted second
                      if (a.isAccepted && !a.isEmployed) return -1;
                      if (b.isAccepted && !b.isEmployed) return 1;
                      // Employed third
                      if (a.isEmployed) return -1;
                      if (b.isEmployed) return 1;
                      return 0;
                    })
                    .map((application) => (
                      <div
                        key={application.id}
                        className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 sm:p-6 hover:shadow-md transition-shadow"
                      >
                        {/* Başvuru Kartı Üst Kısım */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                          {/* Sol: Kullanıcı Bilgisi */}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (application.user?.id) {
                                    navigate(
                                      `/dashboard/users/${application.user.id}`,
                                    );
                                  }
                                }}
                                className="text-base sm:text-lg font-bold text-gray-900 dark:text-white hover:text-blue-600 cursor-pointer transition-colors"
                              >
                                {application.user ? (
                                  <>
                                    {application.user.name ?? "-"}{" "}
                                    {application.user.surname ?? ""}
                                  </>
                                ) : (
                                  "Kullanıcı silinmiş"
                                )}
                              </h3>
                              {application.score !== undefined &&
                                application.score !== null && (
                                  <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-orange-900/20 dark:to-orange-900/20 border border-blue-200 dark:border-orange-700 rounded-full">
                                    <StarIcon className="w-3 h-3 text-blue-600" />
                                    <span className="text-xs font-bold text-blue-700 ">
                                      {application.score.toFixed(1)}
                                    </span>
                                    <span className="text-xs text-blue-600">
                                      / 100
                                    </span>
                                  </div>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {application.user?.email ?? "-"}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {application.user?.phoneNumber ?? "-"}
                            </p>
                          </div>

                          {/* Sağ: Durum Badge */}
                          <div className="flex-shrink-0">
                            {application.isDeleted ? (
                              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full text-xs font-semibold">
                                Silinmiş
                              </span>
                            ) : application.isEmployed ? (
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-orange-900/30 dark:text-orange-400 rounded-full text-xs font-semibold">
                                İşe Alındı
                              </span>
                            ) : application.isAccepted ? (
                              <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-semibold">
                                Kabul Edildi
                              </span>
                            ) : application.isRejected ? (
                              <div>
                                <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-semibold">
                                  Reddedildi
                                </span>
                                {application.rejectReason && (
                                  <p className="mt-1 text-[11px] text-red-600 max-w-xs">
                                    Red sebebi: {application.rejectReason}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-xs font-semibold">
                                Beklemede
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Eylem Butonları - Ayrı Satır */}
                        {!application.isRejected && !application.isDeleted && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {!application.isAccepted &&
                              !application.isRejected &&
                              !application.isEmployed && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleAcceptApplication(application.id)
                                    }
                                    disabled={
                                      actionLoading[`accept-${application.id}`] ||
                                      !application.user?.id
                                    }
                                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 dark:bg-green-500 text-white dark:hover:bg-green-600 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 text-xs font-semibold transition-colors"
                                  >
                                    <CheckCircleIcon className="w-4 h-4" />
                                    {actionLoading[`accept-${application.id}`]
                                      ? "Onaylanıyor..."
                                      : "Onayla"}
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleRejectApplication(application.id)
                                    }
                                    disabled={
                                      actionLoading[`reject-${application.id}`]
                                    }
                                    className="flex items-center gap-1 px-3 py-1.5 bg-red-600 dark:bg-red-500 text-white dark:hover:bg-red-600 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50 text-xs font-semibold transition-colors"
                                  >
                                    <XCircleIcon className="w-4 h-4" />
                                    {actionLoading[`reject-${application.id}`]
                                      ? "Reddediliyor..."
                                      : "Reddet"}
                                  </button>
                                </>
                              )}
                            {application.isAccepted &&
                              !application.isEmployed && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleEmployUser(application.id)
                                    }
                                    disabled={
                                      actionLoading[`employ-${application.id}`] ||
                                      !application.user?.id
                                    }
                                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 dark:bg-orange-500 text-white dark:hover:bg-orange-600 rounded-lg hover:bg-blue-700 dark:hover:bg-orange-600 disabled:opacity-50 text-xs font-semibold transition-colors"
                                  >
                                    <CheckCircleIcon className="w-4 h-4" />
                                    {actionLoading[`employ-${application.id}`]
                                      ? "İşe Alınıyor..."
                                      : "İşe Al"}
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleRejectApplication(application.id)
                                    }
                                    disabled={
                                      actionLoading[`reject-${application.id}`]
                                    }
                                    className="flex items-center gap-1 px-3 py-1.5 bg-red-600 dark:bg-red-500 text-white dark:hover:bg-red-600 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50 text-xs font-semibold transition-colors"
                                  >
                                    <XCircleIcon className="w-4 h-4" />
                                    {actionLoading[`reject-${application.id}`]
                                      ? "Reddediliyor..."
                                      : "Reddet"}
                                  </button>
                                </>
                              )}
                            {application.isAccepted && (
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() =>
                                    handleSendAcceptSms(application.id)
                                  }
                                  disabled={
                                    application.acceptSmsSent ||
                                    actionLoading[`sms-${application.id}`] ||
                                    !application.user?.phoneNumber
                                  }
                                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${application.acceptSmsSent
                                    ? "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                                    }`}
                                >
                                  <CheckCircleIcon className="w-4 h-4" />
                                  {application.acceptSmsSent
                                    ? "Kabul SMS'i Gönderildi"
                                    : actionLoading[`sms-${application.id}`]
                                      ? "SMS Gönderiliyor..."
                                      : "Kabul SMS'i Gönder"}
                                </button>
                                {application.acceptSmsSent &&
                                  application.acceptSmsSentAt && (
                                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                      Gönderim tarihi:{" "}
                                      {formatDateTime(
                                        application.acceptSmsSentAt,
                                      )}
                                    </span>
                                  )}
                              </div>
                            )}
                          </div>
                        )}

                        {application.coverLetter && (
                          <div className="mb-4">
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                              Ön Yazı
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {application.coverLetter}
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 dark:text-white">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              TC Kimlik No
                            </p>
                            <p className="text-sm font-semibold">
                              {application.user?.tc ?? "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              Doğum Tarihi
                            </p>
                            <p className="text-sm font-semibold">
                              {formatDate(application.user?.birthday)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              Cinsiyet
                            </p>
                            <p className="text-sm font-semibold">
                              {application.user?.gender === "male"
                                ? "Erkek"
                                : application.user?.gender === "female"
                                  ? "Kadın"
                                  : "-"}
                            </p>
                          </div>
                        </div>

                        {application.user?.professions &&
                          application.user.professions.length > 0 && (
                            <div className="mb-4">
                              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                Meslekler
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {application.user.professions.map((prof) => (
                                  <span
                                    key={prof.id}
                                    className="px-3 py-1 bg-blue-50 dark:bg-orange-900/20 text-blue-700 dark:text-orange-300 rounded-lg text-xs font-semibold"
                                  >
                                    {prof.profession.profession}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Score Breakdown */}
                        {application.scoreBreakdown && (
                          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-600">
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                              Uyum Detayları
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-sm ${application.scoreBreakdown.ageMatched ===
                                    null
                                    ? "text-gray-500 dark:text-gray-400"
                                    : application.scoreBreakdown.ageMatched
                                      ? "text-green-600"
                                      : "text-red-600"
                                    }`}
                                >
                                  {application.scoreBreakdown.ageMatched === null
                                    ? "-"
                                    : application.scoreBreakdown.ageMatched
                                      ? "✓"
                                      : "✗"}
                                </span>
                                <span className="text-xs text-gray-600 dark:text-gray-300">
                                  Yaş Uyumu
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-sm ${application.scoreBreakdown.educationMatched ? "text-green-600" : "text-red-600"}`}
                                >
                                  {application.scoreBreakdown.educationMatched
                                    ? "✓"
                                    : "✗"}
                                </span>
                                <span className="text-xs text-gray-600 dark:text-gray-300">
                                  Eğitim Uyumu
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-sm ${application.scoreBreakdown.professionMatched ? "text-green-600" : "text-red-600"}`}
                                >
                                  {application.scoreBreakdown.professionMatched
                                    ? "✓"
                                    : "✗"}
                                </span>
                                <span className="text-xs text-gray-600 dark:text-gray-300">
                                  Meslek Uyumu
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-sm ${application.scoreBreakdown.locationMatched ? "text-green-600" : "text-red-600"}`}
                                >
                                  {application.scoreBreakdown.locationMatched
                                    ? "✓"
                                    : "✗"}
                                </span>
                                <span className="text-xs text-gray-600 dark:text-gray-300">
                                  Konum Uyumu
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {jobPost.isPostForDisabledPersons ? (
                                  <>
                                    <span
                                      className={`text-sm ${application.scoreBreakdown
                                        .disabilityMatched
                                        ? "text-green-600"
                                        : "text-red-600"
                                        }`}
                                    >
                                      {application.scoreBreakdown
                                        .disabilityMatched
                                        ? "✓"
                                        : "✗"}
                                    </span>
                                    <span className="text-xs text-gray-600 dark:text-gray-300">
                                      Engelli Uyumu
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                      -
                                    </span>
                                    <span className="text-xs text-gray-600 dark:text-gray-300">
                                      Engellilik kriteri yok
                                    </span>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-600 dark:text-gray-300">
                                  Deneyim:{" "}
                                  {application.scoreBreakdown.experienceYears?.toFixed(
                                    1,
                                  ) || 0}{" "}
                                  yıl
                                </span>
                              </div>
                              {application.scoreBreakdown
                                .drivingMatchedCount !== undefined && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-600 dark:text-gray-300">
                                      Ehliyet:{" "}
                                      {
                                        application.scoreBreakdown
                                          .drivingMatchedCount
                                      }
                                      /
                                      {
                                        application.scoreBreakdown
                                          .requiredDrivingCount
                                      }
                                    </span>
                                  </div>
                                )}
                              {application.scoreBreakdown
                                .languageMatchedCount !== undefined && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-600 dark:text-gray-300">
                                      Dil:{" "}
                                      {
                                        application.scoreBreakdown
                                          .languageMatchedCount
                                      }
                                      /
                                      {
                                        application.scoreBreakdown
                                          .requiredLanguageCount
                                      }
                                    </span>
                                  </div>
                                )}
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                            <span className="whitespace-nowrap">
                              Başvuru Tarihi:{" "}
                              {formatDate(application.createdAt)}
                            </span>
                            {!application.isDeleted ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteApplication(application.id)
                                }
                                disabled={
                                  actionLoading[`delete-${application.id}`]
                                }
                                className="inline-flex items-center text-xs text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                              >
                                <TrashIcon className="w-4 h-4 mr-1" />
                                Başvuruyu Sil
                              </button>
                            ) : (
                              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                Silinmiş başvuru
                              </span>
                            )}
                          </div>
                          {application.user?.id && (
                            <button
                              onClick={() =>
                                navigate(
                                  `/dashboard/users/${application.user.id}`,
                                )
                              }
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
                            >
                              Kullanıcı Detayına Git →
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}

            </div>
          )}

          {/* Recommendations Tab */}
          {activeTab === "recommendations" && (
            <div className="space-y-4">
              {recommendationsLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">Yükleniyor...</p>
                </div>
              ) : recommendations.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <StarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Henüz öneri bulunmamaktadır.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations
                    .sort((a, b) => b.score - a.score)
                    .map((recommendation, index) => (
                      <div
                        key={recommendation.userId}
                        onClick={() =>
                          navigate(`/dashboard/users/${recommendation.userId}`)
                        }
                        className="border border-gray-200 dark:border-gray-600 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-orange-900/30 dark:text-orange-400 rounded-full text-xs font-semibold">
                                #{index + 1}
                              </span>
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {recommendation.name} {recommendation.surname}
                              </h3>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {recommendation.email}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Yaş: {recommendation.age}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600 dark:text-white">
                              {recommendation.score.toFixed(1)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Puan</div>
                          </div>
                        </div>

                        {recommendation.breakdown && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Yaş Uyumu
                              </p>
                              <p className="text-sm font-semibold dark:text-white">
                                {recommendation.breakdown.ageMatched === null
                                  ? "Bu ilan için yaş kriteri yok"
                                  : recommendation.breakdown.ageMatched
                                    ? "✓ Uygun"
                                    : "✗ Uygun Değil"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Eğitim Uyumu
                              </p>
                              <p className="text-sm font-semibold dark:text-white">
                                {recommendation.breakdown.educationMatched
                                  ? "✓ Uygun"
                                  : "✗ Uygun Değil"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Meslek Uyumu
                              </p>
                              <p className="text-sm font-semibold dark:text-white">
                                {recommendation.breakdown.professionMatched
                                  ? "✓ Uygun"
                                  : "✗ Uygun Değil"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Konum Uyumu
                              </p>
                              <p className="text-sm font-semibold dark:text-white">
                                {recommendation.breakdown.locationMatched
                                  ? "✓ Uygun"
                                  : "✗ Uygun Değil"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Deneyim Yılı
                              </p>
                              <p className="text-sm font-semibold dark:text-white">
                                {recommendation.breakdown.experienceYears.toFixed(
                                  1,
                                )}{" "}
                                yıl
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Engelli Uyumu
                              </p>
                              <p className="text-sm font-semibold dark:text-white">
                                {jobPost.isPostForDisabledPersons
                                  ? recommendation.breakdown.disabilityMatched
                                    ? "✓ Uygun"
                                    : "✗ Uygun Değil"
                                  : "Bu ilan için engellilik kriteri yok"}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === "stats" && stats && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                İstatistikler
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-blue-50 dark:bg-orange-900/30 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-orange-400 mb-2">
                    {stats.totalApplications}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Toplam Başvuru</div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                    {stats.pendingApplications}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Bekleyen</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {stats.acceptedApplications}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Kabul Edilen</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/30 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
                    {stats.rejectedApplications}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Reddedilen</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/30 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                    {stats.employedApplications}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">İşe Alınan</div>
                </div>
              </div>
              {/* <div className="bg-indigo-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">
                  {stats.recommendationsCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Öneri Sayısı</div>
              </div> */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {jobPost.viewCount || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Görüntülenme</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {jobPost.applicationCount || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Başvuru Sayısı</div>
                </div>
              </div>
            </div>
          )}

          {/* Update Requests Tab */}
          {activeTab === "updateRequests" && jobPost.isApproved !== null && (
            <div className="space-y-4">
              {updateRequestsLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">Yükleniyor...</p>
                </div>
              ) : updateRequests.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <DocumentTextIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Henüz güncelleme isteği bulunmamaktadır.</p>
                </div>
              ) : (
                <>
                  {selectedUpdateRequest ? (
                    <UpdateRequestDetail
                      request={selectedUpdateRequest}
                      lookups={lookups}
                      getLookupName={getLookupName}
                      formatDate={formatDate}
                      onBack={() => setSelectedUpdateRequest(null)}
                      onApprove={handleApproveUpdateRequest}
                      onReject={handleRejectUpdateRequest}
                      actionLoading={actionLoading}
                    />
                  ) : (
                    <div className="space-y-4">
                      {updateRequests.map((request) => (
                        <div
                          key={request.id}
                          className="border border-gray-200 dark:border-gray-600 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => handleViewUpdateRequest(request.id)}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                Güncelleme İsteği #{request.id}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                                <span>
                                  İstek Tarihi: {formatDate(request.createdAt)}
                                </span>
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
                                Eski Başlık
                              </p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {request.oldPayload?.postTitle || "-"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Yeni Başlık
                              </p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {request.newPayload?.postTitle || "-"}
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
        </div>
      </div>

      {/* Fixed Bottom Pagination for Applications */}
      {activeTab === "applications" && applicationsPagination.totalPages > 1 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-600 shadow-[0_-2px_8px_rgba(0,0,0,0.08)] px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-full">
            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
              Toplam {applicationsPagination.total} başvuru · Sayfa{" "}
              {applicationsPagination.page} / {applicationsPagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const newPage = applicationsPagination.page - 1;
                  setApplicationsPagination((prev) => ({ ...prev, page: newPage }));
                  fetchApplications(newPage);
                }}
                disabled={applicationsPagination.page <= 1 || applicationsLoading}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Önceki
              </button>
              {Array.from({ length: applicationsPagination.totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  const current = applicationsPagination.page;
                  return p === 1 || p === applicationsPagination.totalPages || Math.abs(p - current) <= 1;
                })
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "..." ? (
                    <span key={`dots-${idx}`} className="px-1 text-gray-400 dark:text-gray-400 text-sm">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => {
                        setApplicationsPagination((prev) => ({ ...prev, page: item }));
                        fetchApplications(item);
                      }}
                      disabled={applicationsLoading}
                      className={`w-9 h-9 text-sm font-medium rounded-lg transition-colors ${applicationsPagination.page === item
                        ? "bg-blue-600 dark:bg-orange-500 text-white dark:hover:bg-orange-600"
                        : "text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {item}
                    </button>
                  ),
                )}
              <button
                onClick={() => {
                  const newPage = applicationsPagination.page + 1;
                  setApplicationsPagination((prev) => ({ ...prev, page: newPage }));
                  fetchApplications(newPage);
                }}
                disabled={applicationsPagination.page >= applicationsPagination.totalPages || applicationsLoading}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Sonraki →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Job Post Modal */}
      {showEditModal && jobPost && (
        <EditJobPostModal
          jobPost={jobPost}
          onClose={() => {
            setShowEditModal(false);
            fetchJobPostDetail();
          }}
        />
      )}
    </MainLayout>
  );
};

// Edit Job Post Modal
const EditJobPostModal = ({ jobPost, onClose }) => {
  const [formData, setFormData] = useState({
    postTitle: jobPost.postTitle || "",
    postDescription: jobPost.postDescription || "",
    qualifications: jobPost.qualifications || "",
    professionId: jobPost.professionId || "",
    workingMethodId: jobPost.workingMethodId || "",
    hiringCount: jobPost.hiringCount || 1,
    minExperienceYear: jobPost.minExperienceYear || "",
    ageMin: jobPost.ageMin || "",
    ageMax: jobPost.ageMax || "",
    weeklyWorkingHours: jobPost.weeklyWorkingHours || "",
    genderOption: jobPost.genderOption,
    militaryStatus: jobPost.militaryStatus,
    coverLetterRequest: jobPost.coverLetterRequest || false,
    isPostForDisabledPersons: jobPost.isPostForDisabledPersons || false,
    // Saat alanları varsayılan boş gelsin, zorunlu olmasın
    workStartedAt: jobPost.workStartedAt || "",
    workEndAt: jobPost.workEndAt || "",
    applicationUntilDate: jobPost.applicationUntilDate
      ? new Date(jobPost.applicationUntilDate).toISOString().split("T")[0]
      : "",
    districts: jobPost.districts?.map((d) => d.districtId?.toString()) || [],
    applicantRights:
      jobPost.applicantRights?.map((r) => r.applicantRightId?.toString()) || [],
    drivingLisenceRequirements:
      jobPost.drivingLisenceRequirements?.map((d) =>
        d.drivingLisenceId?.toString(),
      ) || [],
    educationLevels:
      jobPost.educationLevels?.map((e) => e.educationTypeId?.toString()) || [],
    workDays: jobPost.workDays?.map((w) => w.dayId?.toString()) || [],
    workingExperiences:
      jobPost.workingExperiences?.map((w) =>
        w.workingExperienceId?.toString(),
      ) || [],
    languages:
      jobPost.languages?.map(
        (l) => l.language?.id?.toString() || l.languageId?.toString(),
      ) || [],
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
    languages: [],
  });
  const [lookupsLoading, setLookupsLoading] = useState(true);

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        setLookupsLoading(true);
        const [
          professions,
          workingMethods,
          cities,
          educationTypes,
          applicantRights,
          drivingLicenseTypes,
          workDays,
          workingExperiences,
          languages,
        ] = await Promise.all([
          getProfessions().catch(() => ({ data: [] })),
          getWorkingMethods().catch(() => ({ data: [] })),
          getCities().catch(() => ({ data: [] })),
          getEducationTypes().catch(() => ({ data: [] })),
          getApplicantRights().catch(() => ({ data: [] })),
          getDrivingLicenseTypes().catch(() => ({ data: [] })),
          getWorkDays().catch(() => ({ data: [] })),
          getWorkingExperiences().catch(() => ({ data: [] })),
          getLanguages().catch(() => ({ data: [] })),
        ]);

        setLookups({
          professions: professions.data || professions || [],
          workingMethods: workingMethods.data || workingMethods || [],
          cities: cities.data || cities || [],
          educationTypes: educationTypes.data || educationTypes || [],
          applicantRights: applicantRights.data || applicantRights || [],
          drivingLicenseTypes:
            drivingLicenseTypes.data || drivingLicenseTypes || [],
          workDays: workDays.data || workDays || [],
          workingExperiences:
            workingExperiences.data || workingExperiences || [],
          languages: languages.data || languages || [],
        });

        // Set initial city if jobPost has districts
        if (jobPost.districts && jobPost.districts.length > 0) {
          const firstDistrict = jobPost.districts[0];
          if (firstDistrict.district?.cityId) {
            setSelectedCityId(firstDistrict.district.cityId.toString());
          }
        }
      } catch (error) {
        console.error("Error fetching lookups:", error);
      } finally {
        setLookupsLoading(false);
      }
    };

    fetchLookups();
  }, [jobPost]);

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
    if (formData.postDescription) {
      const cleanDescription = formData.postDescription
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&[a-z]+;/gi, "")
        .replace(/\s+/g, " ")
        .trim();
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

    if (formData.workStartedAt && formData.workEndAt) {
      if (formData.workStartedAt >= formData.workEndAt) {
        newErrors.workEndAt =
          "İş bitiş saati, başlangıç saatinden sonra olmalıdır";
      }
    }

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
        languages: formData.languages.map((id) => parseInt(id)),
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

      const response = await updateJobPost(jobPost.id, submitData);
      if (response.success) {
        showSuccess("Başarılı", "İş ilanı başarıyla güncellendi.");
        onClose();
      }
    } catch (error) {
      console.error("Error updating job post:", error);
      showError("Hata", "İş ilanı güncellenirken bir hata oluştu.");
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
            İş İlanını Düzenle
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Meslek <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="professionId"
                    value={formData.professionId}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.professionId ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"}`}
                  >
                    <option value="">Seçiniz</option>
                    {lookups.professions.map((prof) => (
                      <option key={prof.id} value={prof.id}>
                        {prof.profession || prof.title || prof.name}
                      </option>
                    ))}
                  </select>
                  {errors.professionId && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.professionId}
                    </p>
                  )}
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
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isSelected
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
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isSelected
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
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isSelected
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Diller
                </label>
                <div className="flex flex-wrap gap-2 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 min-h-[80px] max-h-[200px] overflow-y-auto">
                  {lookups.languages && lookups.languages.length > 0 ? (
                    lookups.languages.map((lang) => {
                      const isSelected = formData.languages.includes(
                        lang.id?.toString(),
                      );
                      return (
                        <button
                          key={lang.id}
                          type="button"
                          onClick={() =>
                            handleMultiSelect("languages", lang.id?.toString())
                          }
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isSelected
                            ? "bg-teal-600 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                            }`}
                        >
                          {lang.name}
                        </button>
                      );
                    })
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Dil seçenekleri yükleniyor...
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
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isSelected
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
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isSelected
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
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isSelected
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
              {loading ? "Güncelleniyor..." : "İlanı Güncelle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Update Request Detail Component
const UpdateRequestDetail = ({
  request,
  lookups,
  getLookupName,
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

  const renderArrayComparison = (label, oldArray, newArray, lookupType) => {
    const oldValues =
      oldArray?.map((id) => getLookupName(lookupType, id)).join(", ") || "-";
    const newValues =
      newArray?.map((id) => getLookupName(lookupType, id)).join(", ") || "-";
    const hasChanged =
      JSON.stringify(oldArray?.sort()) !== JSON.stringify(newArray?.sort());
    return renderFieldComparison(label, oldValues, newValues);
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
                disabled={actionLoading[`approve-ur-${request.id}`]}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-500 text-white dark:hover:bg-green-600 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 transition-colors"
              >
                <CheckCircleIcon className="w-4 h-4" />
                {actionLoading[`approve-ur-${request.id}`]
                  ? "Onaylanıyor..."
                  : "Onayla"}
              </button>
              <button
                onClick={() => onReject(request.id)}
                disabled={actionLoading[`reject-ur-${request.id}`]}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 dark:bg-red-500 text-white dark:hover:bg-red-600 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                <XCircleIcon className="w-4 h-4" />
                {actionLoading[`reject-ur-${request.id}`]
                  ? "Reddediliyor..."
                  : "Reddet"}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Güncelleme İsteği #{request.id}
            </h2>
          </div>
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
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Değişiklikler
          </h3>

          {renderFieldComparison(
            "İlan Başlığı",
            request.oldPayload?.postTitle,
            request.newPayload?.postTitle,
          )}
          {renderFieldComparison(
            "İşe Alınacak Kişi Sayısı",
            request.oldPayload?.hiringCount,
            request.newPayload?.hiringCount,
          )}
          {renderFieldComparison(
            "Çalışma Başlangıç Saati",
            request.oldPayload?.workStartedAt,
            request.newPayload?.workStartedAt,
          )}
          {renderFieldComparison(
            "Çalışma Bitiş Saati",
            request.oldPayload?.workEndAt,
            request.newPayload?.workEndAt,
          )}
          {renderFieldComparison(
            "Minimum Deneyim Yılı",
            request.oldPayload?.minExperienceYear,
            request.newPayload?.minExperienceYear,
          )}
          {renderFieldComparison(
            "Minimum Yaş",
            request.oldPayload?.ageMin,
            request.newPayload?.ageMin,
          )}
          {renderFieldComparison(
            "Maksimum Yaş",
            request.oldPayload?.ageMax,
            request.newPayload?.ageMax,
          )}
          {renderFieldComparison(
            "Haftalık Çalışma Saati",
            request.oldPayload?.weeklyWorkingHours,
            request.newPayload?.weeklyWorkingHours,
          )}
          {renderFieldComparison(
            "Cinsiyet Seçeneği",
            request.oldPayload?.genderOption ? "Var" : "Yok",
            request.newPayload?.genderOption ? "Var" : "Yok",
          )}
          {renderFieldComparison(
            "Askerlik Durumu",
            request.oldPayload?.militaryStatus ? "Gerekli" : "Gerekli Değil",
            request.newPayload?.militaryStatus ? "Gerekli" : "Gerekli Değil",
          )}
          {renderFieldComparison(
            "Ön Yazı İsteği",
            request.oldPayload?.coverLetterRequest ? "Var" : "Yok",
            request.newPayload?.coverLetterRequest ? "Var" : "Yok",
          )}
          {renderFieldComparison(
            "Engelli Bireyler İçin",
            request.oldPayload?.isPostForDisabledPersons ? "Evet" : "Hayır",
            request.newPayload?.isPostForDisabledPersons ? "Evet" : "Hayır",
          )}
          {renderFieldComparison(
            "Başvuru Tarihi",
            request.oldPayload?.applicationUntilDate
              ? formatDate(request.oldPayload.applicationUntilDate)
              : "-",
            request.newPayload?.applicationUntilDate
              ? formatDate(request.newPayload.applicationUntilDate)
              : "-",
          )}

          {renderFieldComparison(
            "Meslek",
            getLookupName("profession", request.oldPayload?.professionId),
            getLookupName("profession", request.newPayload?.professionId),
          )}
          {renderFieldComparison(
            "Çalışma Şekli",
            getLookupName("workingMethod", request.oldPayload?.workingMethodId),
            getLookupName("workingMethod", request.newPayload?.workingMethodId),
          )}

          {renderArrayComparison(
            "İlçeler",
            request.oldPayload?.districts,
            request.newPayload?.districts,
            "district",
          )}
          {renderArrayComparison(
            "Aday Hakları",
            request.oldPayload?.applicantRights,
            request.newPayload?.applicantRights,
            "applicantRight",
          )}
          {renderArrayComparison(
            "Ehliyet Gereksinimleri",
            request.oldPayload?.drivingLisenceRequirements,
            request.newPayload?.drivingLisenceRequirements,
            "drivingLicense",
          )}
          {renderArrayComparison(
            "Eğitim Seviyeleri",
            request.oldPayload?.educationLevels,
            request.newPayload?.educationLevels,
            "educationType",
          )}
          {renderArrayComparison(
            "Çalışma Günleri",
            request.oldPayload?.workDays,
            request.newPayload?.workDays,
            "workDay",
          )}
          {renderArrayComparison(
            "Deneyim Seviyeleri",
            request.oldPayload?.workingExperiences,
            request.newPayload?.workingExperiences,
            "workingExperience",
          )}
          {renderArrayComparison(
            "Diller",
            request.oldPayload?.languages,
            request.newPayload?.languages,
            "language",
          )}

          {/* Rich Text Fields */}
          {(() => {
            const oldDescription = request.oldPayload?.postDescription || "";
            const newDescription = request.newPayload?.postDescription || "";
            const hasChanged = oldDescription !== newDescription;
            return (
              <div
                className={`p-4 rounded-lg ${hasChanged ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700" : "bg-gray-50 dark:bg-gray-900"}`}
              >
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  İş Tanımı
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Eski Değer</p>
                    <div
                      className={`text-sm prose prose-sm max-w-none rich-html-content ${hasChanged ? "rich-html-content--diff-red text-red-600 dark:text-red-300" : "text-gray-700 dark:text-gray-200"}`}
                      dangerouslySetInnerHTML={{
                        __html: oldDescription || "-",
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Yeni Değer</p>
                    <div
                      className={`text-sm prose prose-sm max-w-none rich-html-content ${hasChanged ? "rich-html-content--diff-green text-green-600 dark:text-green-300" : "text-gray-700 dark:text-gray-200"}`}
                      dangerouslySetInnerHTML={{
                        __html: newDescription || "-",
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })()}

          {(() => {
            const oldQualifications = request.oldPayload?.qualifications || "";
            const newQualifications = request.newPayload?.qualifications || "";
            const hasChanged = oldQualifications !== newQualifications;
            return (
              <div
                className={`p-4 rounded-lg ${hasChanged ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700" : "bg-gray-50 dark:bg-gray-900"}`}
              >
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Nitelikler
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Eski Değer</p>
                    <div
                      className={`text-sm prose prose-sm max-w-none rich-html-content ${hasChanged ? "rich-html-content--diff-red text-red-600 dark:text-red-300" : "text-gray-700 dark:text-gray-200"}`}
                      dangerouslySetInnerHTML={{
                        __html: oldQualifications || "-",
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Yeni Değer</p>
                    <div
                      className={`text-sm prose prose-sm max-w-none rich-html-content ${hasChanged ? "rich-html-content--diff-green text-green-600 dark:text-green-300" : "text-gray-700 dark:text-gray-200"}`}
                      dangerouslySetInnerHTML={{
                        __html: newQualifications || "-",
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })()}
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

export default JobPostDetail;
