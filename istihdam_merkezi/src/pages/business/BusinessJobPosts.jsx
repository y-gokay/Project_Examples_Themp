import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppStore } from "../../store";
import { ROLES, ROUTES } from "../../constants";
import { error as logError } from "../../utils/logger";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  EmptyState,
  Pagination,
} from "../../components/ui";
import {
  Briefcase,
  Plus,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  MapPin,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Loader2,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import DisabledJobIcon from "../../components/common/DisabledJobIcon";
import { showToast } from "../../components/ui/Toast";
import { formatDate, sortEducationTypes } from "../../utils/helpers";

const BusinessJobPosts = () => {
  const navigate = useNavigate();
  const {
    user,
    getBusinessJobPosts,
    deleteBusinessJobPost,
    toggleJobPostVisibility,
    cancelJobPostUpdateRequest,
    getLookups,
    lookups,
  } = useAppStore();

  const [jobPosts, setJobPosts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [expandedUpdateRequests, setExpandedUpdateRequests] = useState(
    new Set(),
  );
  const [cancellingRequestId, setCancellingRequestId] = useState(null);
  const dataLoadedRef = useRef(false);

  useEffect(() => {
    // Check if user is not business/employer, redirect to seeker dashboard
    const userRole = user?.role || user?.userType;
    if (
      userRole !== ROLES.EMPLOYER &&
      userRole !== "employer" &&
      userRole !== "business"
    ) {
      navigate(ROUTES.DASHBOARD, { replace: true });
      return;
    }

    // Prevent duplicate API calls in Strict Mode
    if (dataLoadedRef.current && pagination.page === 1) {
      return;
    }

    // Reset ref when page changes
    if (pagination.page !== 1) {
      dataLoadedRef.current = false;
    }

    if (!dataLoadedRef.current) {
      dataLoadedRef.current = true;
      // Load lookups for displaying field values (only once)
      // Note: districts requires cityId, so we don't load it here
      // Districts will be loaded when needed via getDistrictsByCity()
      getLookups("applicantRights");
      getLookups("drivingLicenseTypes");
      getLookups("educationTypes");
      getLookups("languages");
      getLookups("workDays");
      getLookups("workingExperiences");
      getLookups("professions");
      getLookups("workingMethods");
    }

    loadJobPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate, pagination.page]);

  const loadJobPosts = async (skipCache = false) => {
    setLoadingJobs(true);
    try {
      const result = await getBusinessJobPosts(
        pagination.page,
        pagination.limit,
        skipCache,
      );
      if (result.success) {
        const jobPostsData = result.data || [];
        setJobPosts(jobPostsData);
        if (result.pagination) {
          const total = result.pagination.total || jobPostsData.length;
          const limit = result.pagination.limit || pagination.limit;
          // totalPages'ı her zaman hesapla: total / limit, yukarı yuvarla
          // Eğer total 0 ise veya limit 0 ise, totalPages 1 olmalı
          // totalPages'ı her zaman hesapla (API'den gelen değer yanlış olabilir)
          // Math.max(1, ...) ile minimum 1 sayfa garantisi
          const calculatedTotalPages =
            total > 0 && limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1;

          setPagination((prev) => ({
            ...prev,
            page: result.pagination.page || prev.page,
            limit: limit,
            total: total,
            // Her zaman hesaplanan değeri kullan (API'den gelen totalPages'ı görmezden gel)
            totalPages: calculatedTotalPages,
          }));
        } else {
          // Pagination bilgisi yoksa, sadece mevcut veriyi kullan
          // Eğer limit'ten az veri varsa, tek sayfa demektir
          const calculatedTotalPages =
            jobPostsData.length <= pagination.limit
              ? 1
              : Math.ceil(jobPostsData.length / pagination.limit);

          setPagination((prev) => ({
            ...prev,
            total: jobPostsData.length,
            totalPages: calculatedTotalPages,
          }));
        }
      } else {
        showToast({
          type: "error",
          message: result.error || "İlanlar yüklenemedi",
          duration: 3000,
        });
      }
    } catch (err) {
      logError("Error loading job posts:", err);
      showToast({
        type: "error",
        message: "İlanlar yüklenirken bir hata oluştu",
        duration: 3000,
      });
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleDelete = async (jobPostId) => {
    if (!window.confirm("Bu ilanı silmek istediğinizden emin misiniz?")) {
      return;
    }

    setDeletingId(jobPostId);
    const result = await deleteBusinessJobPost(jobPostId);

    if (result.success) {
      showToast({
        type: "success",
        message: result.message || "İlan başarıyla silindi",
        duration: 3000,
      });
      // Silinen ilanı anlık gizlemek için cache'i bypass et
      loadJobPosts(true);
    } else {
      showToast({
        type: "error",
        message: result.error || "İlan silinirken bir hata oluştu",
        duration: 3000,
      });
    }
    setDeletingId(null);
  };

  const handleToggleVisibility = async (jobPostId, currentVisibility) => {
    setTogglingId(jobPostId);
    const result = await toggleJobPostVisibility(jobPostId, !currentVisibility);

    if (result.success) {
      // Backend'den gelen mesajı Türkçe'ye çevir veya isShown değerine göre mesaj göster
      const isShown = result.data?.isShown ?? !currentVisibility;
      const message = isShown
        ? "İlan başarıyla gösterildi"
        : "İlan başarıyla gizlendi";

      // State'i hemen güncelle (optimistic update)
      setJobPosts((prev) =>
        prev.map((job) =>
          job.id === jobPostId ? { ...job, isShown: isShown } : job,
        ),
      );

      showToast({
        type: "success",
        message: message,
        duration: 3000,
      });

      // Cache'i bypass ederek veriyi yeniden yükle
      loadJobPosts(true);
    } else {
      showToast({
        type: "error",
        message: result.error || "İlan görünürlüğü değiştirilemedi",
        duration: 3000,
      });
    }
    setTogglingId(null);
  };

  const handleCancelUpdateRequest = async (jobPostId, requestId) => {
    if (
      !window.confirm(
        "Güncelleme isteğini iptal etmek istediğinizden emin misiniz?",
      )
    ) {
      return;
    }

    setCancellingRequestId(requestId);
    const result = await cancelJobPostUpdateRequest(jobPostId);

    if (result.success) {
      showToast({
        type: "success",
        message: result.message || "Güncelleme isteği iptal edildi",
        duration: 3000,
      });
      loadJobPosts();
    } else {
      showToast({
        type: "error",
        message: result.error || "Güncelleme isteği iptal edilemedi",
        duration: 3000,
      });
    }
    setCancellingRequestId(null);
  };

  const toggleUpdateRequestExpanded = (requestId) => {
    const newExpanded = new Set(expandedUpdateRequests);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedUpdateRequests(newExpanded);
  };

  const getFieldLabel = (field) => {
    const labels = {
      postTitle: "İlan Başlığı",
      postDescription: "İlan Açıklaması",
      qualifications: "Nitelikler",
      professionId: "Meslek",
      workingMethodId: "Çalışma Şekli",
      hiringCount: "Pozisyon Sayısı",
      workStartedAt: "İş Başlangıç Saati",
      workEndAt: "İş Bitiş Saati",
      minExperienceYear: "Minimum Deneyim (Yıl)",
      ageMin: "Minimum Yaş",
      ageMax: "Maksimum Yaş",
      weeklyWorkingHours: "Haftalık Çalışma Saati",
      genderOption: "Cinsiyet",
      militaryStatus: "Askerlik Durumu",
      coverLetterRequest: "Ön Yazı İsteği",
      isPostForDisabledPersons: "Engelli Bireyler İçin",
      applicationUntilDate: "Son Başvuru Tarihi",
      districts: "İlçeler",
      applicantRights: "Aday Hakları",
      drivingLisenceRequirements: "Ehliyet Gereksinimleri",
      educationLevels: "Eğitim Seviyeleri",
      languages: "Dil Gereksinimleri",
      workDays: "Çalışma Günleri",
      workingExperiences: "İş Deneyimi",
    };
    return labels[field] || field;
  };

  const formatFieldValue = (value, field) => {
    if (value === null || value === undefined) return "-";

    if (field === "genderOption") {
      if (value === true) return "Erkek";
      if (value === false) return "Kadın";
      return "Belirtilmemiş";
    }

    if (field === "militaryStatus") {
      if (value === true) return "Gerekli";
      if (value === false) return "Gerekli Değil";
      return "Belirtilmemiş";
    }

    if (
      field === "coverLetterRequest" ||
      field === "isPostForDisabledPersons"
    ) {
      return value ? "Evet" : "Hayır";
    }

    if (Array.isArray(value)) {
      // Lookup değerlerini bul
      if (field === "districts" && lookups.districts) {
        return (
          value
            .map((id) => {
              const district = lookups.districts.find((d) => d.id === id);
              return district?.title || district?.name || id;
            })
            .join(", ") || value.join(", ")
        );
      }
      if (field === "applicantRights" && lookups.applicantRights) {
        return (
          value
            .map((id) => {
              const right = lookups.applicantRights.find((r) => r.id === id);
              return right?.name || right?.title || id;
            })
            .join(", ") || value.join(", ")
        );
      }
      if (
        field === "drivingLisenceRequirements" &&
        lookups.drivingLicenseTypes
      ) {
        return (
          value
            .map((id) => {
              const license = lookups.drivingLicenseTypes.find(
                (l) => l.id === id,
              );
              return license?.title || license?.name || id;
            })
            .join(", ") || value.join(", ")
        );
      }
      if (field === "educationLevels" && lookups.educationTypes) {
        // Eğitim seviyelerini en yüksekten en düşüğe sırala
        const educationLevels = value
          .map((id) => {
            const edu = lookups.educationTypes.find((e) => e.id === id);
            return edu ? { ...edu, id } : null;
          })
          .filter(Boolean);

        const sorted = sortEducationTypes(educationLevels);
        return (
          sorted
            .map((edu) => edu?.type || edu?.title || edu?.name || edu?.id)
            .join(", ") || value.join(", ")
        );
      }
      if (field === "languages") {
        // API response'unda languages array'i içinde language objesi olabilir
        if (value.length > 0 && value[0]?.language) {
          return value
            .map((item) => item.language?.name || item.name || item)
            .join(", ");
        }
        // Veya sadece ID'ler olabilir, lookup'tan bul
        if (lookups.languages) {
          return (
            value
              .map((id) => {
                const lang = lookups.languages.find((l) => l.id === id);
                return lang?.name || lang?.title || id;
              })
              .join(", ") || value.join(", ")
          );
        }
        return value.join(", ");
      }
      if (field === "workDays" && lookups.workDays) {
        return (
          value
            .map((id) => {
              const day = lookups.workDays.find((d) => d.id === id);
              return day?.name || day?.title || id;
            })
            .join(", ") || value.join(", ")
        );
      }
      if (field === "workingExperiences" && lookups.workingExperiences) {
        return (
          value
            .map((id) => {
              const exp = lookups.workingExperiences.find((e) => e.id === id);
              return exp?.name || exp?.title || id;
            })
            .join(", ") || value.join(", ")
        );
      }
      return value.join(", ");
    }

    // Single ID lookups (not arrays)
    if (field === "professionId" && lookups.professions) {
      const prof = lookups.professions.find((p) => p.id === value);
      return prof?.profession || prof?.title || prof?.name || value;
    }
    if (field === "workingMethodId" && lookups.workingMethods) {
      const wm = lookups.workingMethods.find((m) => m.id === value);
      return wm?.title || wm?.name || value;
    }

    if (field === "applicationUntilDate" && typeof value === "string") {
      try {
        return new Date(value).toLocaleDateString("tr-TR");
      } catch {
        return value;
      }
    }

    return value.toString();
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isJobPostExpired = (jobPost) => {
    if (!jobPost?.applicationUntilDate) return false;

    const deadline = new Date(jobPost.applicationUntilDate);
    deadline.setHours(23, 59, 59, 999);

    return deadline < new Date();
  };

  const getStatusBadge = (jobPost) => {
    if (!jobPost.isApproved) {
      return (
        <Badge variant="warning" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Onay Bekliyor
        </Badge>
      );
    }
    if (isJobPostExpired(jobPost)) {
      return (
        <Badge variant="danger" className="flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Süresi Dolmuş
        </Badge>
      );
    }
    if (!jobPost.isShown) {
      return (
        <Badge variant="default" className="flex items-center gap-1">
          <EyeOff className="w-3 h-3" />
          Gizli
        </Badge>
      );
    }
    if (jobPost.isOnUpdateRequest) {
      return (
        <Badge variant="info" className="flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Güncelleme Bekliyor
        </Badge>
      );
    }
    return (
      <Badge variant="success" className="flex items-center gap-1">
        <CheckCircle className="w-3 h-3" />
        Aktif
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              İş İlanlarım
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Oluşturduğunuz iş ilanlarını yönetin
            </p>
          </div>
          <Link to={ROUTES.EMPLOYER_JOB_CREATE}>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Yeni İlan Oluştur
            </Button>
          </Link>
        </div>

        {/* Job Posts List */}
        {loadingJobs ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : jobPosts.length > 0 ? (
          <>
            <div className="space-y-4 mb-8">
              {jobPosts.map((jobPost) => {
                const expired = isJobPostExpired(jobPost);
                return (
                  <Card
                    key={jobPost.id}
                    className={`hover:shadow-lg transition-shadow overflow-hidden ${
                      expired
                        ? "!bg-red-50 dark:!bg-red-950/20 !border-red-200 dark:!border-red-900"
                        : ""
                    } ${
                      !jobPost.isShown
                        ? "!bg-gray-100 dark:!bg-gray-800 !border-gray-300 dark:!border-gray-700 opacity-90"
                        : ""
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                        {/* Job Info */}
                        <div className="flex-1 w-full md:w-auto min-w-0">
                          <div className="flex items-start justify-between mb-4 gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 break-words flex items-center gap-2">
                                {jobPost.isPostForDisabledPersons && (
                                  <DisabledJobIcon className="w-5 h-5 flex-shrink-0 text-indigo-600 dark:text-indigo-300" />
                                )}
                                <span className="truncate">
                                  {jobPost.postTitle}
                                </span>
                              </h3>
                              <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                <span className="flex items-center gap-1 flex-shrink-0">
                                  <Briefcase className="w-4 h-4 flex-shrink-0" />
                                  <span className="truncate">
                                    {jobPost.professions?.profession ||
                                      "Meslek"}
                                  </span>
                                </span>
                                {jobPost.districts &&
                                  jobPost.districts.length > 0 && (
                                    <span className="flex items-center gap-1 flex-shrink-0">
                                      <MapPin className="w-4 h-4 flex-shrink-0" />
                                      <span className="truncate max-w-[200px]">
                                        {jobPost.districts
                                          .map(
                                            (d) => d.district?.title || d.title,
                                          )
                                          .join(", ")}
                                      </span>
                                    </span>
                                  )}
                                <span className="flex items-center gap-1 flex-shrink-0">
                                  <Clock className="w-4 h-4 flex-shrink-0" />
                                  <span className="truncate">
                                    {jobPost.workingMethod?.title ||
                                      "Çalışma Şekli"}
                                  </span>
                                </span>
                                <span className="flex items-center gap-1 flex-shrink-0">
                                  <Users className="w-4 h-4 flex-shrink-0" />
                                  {jobPost.hiringCount} pozisyon
                                </span>
                              </div>
                            </div>
                            <div className="flex-shrink-0 flex flex-col items-end gap-2">
                              {expired && (
                                <Badge
                                  variant="danger"
                                  className="flex items-center gap-1"
                                >
                                  <AlertCircle className="w-3 h-3" />
                                  Son Başvuru Doldu
                                </Badge>
                              )}
                              {getStatusBadge(jobPost)}
                            </div>
                          </div>

                          <div
                            className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2 prose prose-sm max-w-none prose-p:first:mt-0 dark:prose-invert overflow-hidden"
                            dangerouslySetInnerHTML={{
                              __html: jobPost.postDescription || "",
                            }}
                          />

                          <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm text-gray-600 dark:text-gray-400 min-w-0">
                            <span>
                              <strong>Başvuru:</strong>{" "}
                              {jobPost.applicationCount || 0}
                            </span>
                            <span>
                              <strong>Görüntülenme:</strong>{" "}
                              {jobPost.viewCount || 0}
                            </span>
                            {jobPost.applicationUntilDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Son Başvuru:{" "}
                                {new Date(
                                  jobPost.applicationUntilDate,
                                ).toLocaleDateString("tr-TR")}
                              </span>
                            )}
                            <span>
                              Oluşturulma: {formatDate(jobPost.createdAt)}
                            </span>
                          </div>

                          {/* Update Request Alert */}
                          {jobPost.jobPostUpdateRequests &&
                            jobPost.jobPostUpdateRequests.length > 0 && (
                              <div className="mt-4 space-y-3">
                                {jobPost.jobPostUpdateRequests
                                  .filter((req) => req.status === "pending")
                                  .map((request) => {
                                    const isExpanded =
                                      expandedUpdateRequests.has(request.id);
                                    const changedFields = Object.keys(
                                      request.newPayload || {},
                                    ).filter((key) => {
                                      const oldVal = request.oldPayload?.[key];
                                      const newVal = request.newPayload?.[key];
                                      if (
                                        Array.isArray(oldVal) &&
                                        Array.isArray(newVal)
                                      ) {
                                        return (
                                          JSON.stringify(oldVal.sort()) !==
                                          JSON.stringify(newVal.sort())
                                        );
                                      }
                                      return oldVal !== newVal;
                                    });

                                    return (
                                      <div
                                        key={request.id}
                                        className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg"
                                      >
                                        <div className="flex items-center justify-between mb-3">
                                          <div className="flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                            <span className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
                                              Güncelleme İsteği Bekleniyor
                                            </span>
                                            <Badge
                                              variant="warning"
                                              className="text-xs"
                                            >
                                              {formatDate(request.createdAt)}
                                            </Badge>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            {changedFields.length > 0 && (
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                  toggleUpdateRequestExpanded(
                                                    request.id,
                                                  )
                                                }
                                                className="text-xs"
                                                leftIcon={
                                                  isExpanded ? (
                                                    <ChevronUp className="w-3 h-3" />
                                                  ) : (
                                                    <ChevronDown className="w-3 h-3" />
                                                  )
                                                }
                                              >
                                                {isExpanded
                                                  ? "Gizle"
                                                  : `Detaylar (${changedFields.length})`}
                                              </Button>
                                            )}
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() =>
                                                handleCancelUpdateRequest(
                                                  jobPost.id,
                                                  request.id,
                                                )
                                              }
                                              disabled={
                                                cancellingRequestId ===
                                                request.id
                                              }
                                              loading={
                                                cancellingRequestId ===
                                                request.id
                                              }
                                              leftIcon={
                                                cancellingRequestId !==
                                                request.id ? (
                                                  <X className="w-3 h-3" />
                                                ) : null
                                              }
                                              className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:border-red-300 dark:hover:border-red-600"
                                            >
                                              İptal Et
                                            </Button>
                                          </div>
                                        </div>

                                        {isExpanded &&
                                          changedFields.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-yellow-300 dark:border-yellow-700">
                                              <h4 className="text-sm font-semibold text-yellow-900 dark:text-yellow-200 mb-3">
                                                Yapılan Değişiklikler:
                                              </h4>
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {changedFields.map((field) => {
                                                  const oldValue =
                                                    request.oldPayload?.[field];
                                                  const newValue =
                                                    request.newPayload?.[field];
                                                  return (
                                                    <div
                                                      key={field}
                                                      className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-yellow-200 dark:border-yellow-800"
                                                    >
                                                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                        {getFieldLabel(field)}
                                                      </p>
                                                      <div className="space-y-1">
                                                        <div>
                                                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                            Eski Değer:
                                                          </p>
                                                          {field ===
                                                            "postDescription" ||
                                                          field ===
                                                            "qualifications" ? (
                                                            <div
                                                              className="text-sm text-gray-700 dark:text-gray-300 line-through bg-red-50 dark:bg-red-900/30 p-2 rounded prose prose-sm max-w-none prose-p:first:mt-0 dark:prose-invert"
                                                              dangerouslySetInnerHTML={{
                                                                __html:
                                                                  oldValue ||
                                                                  "-",
                                                              }}
                                                            />
                                                          ) : (
                                                            <p className="text-sm text-gray-700 dark:text-gray-300 line-through bg-red-50 dark:bg-red-900/30 p-2 rounded">
                                                              {formatFieldValue(
                                                                oldValue,
                                                                field,
                                                              )}
                                                            </p>
                                                          )}
                                                        </div>
                                                        <div>
                                                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                            Yeni Değer:
                                                          </p>
                                                          {field ===
                                                            "postDescription" ||
                                                          field ===
                                                            "qualifications" ? (
                                                            <div
                                                              className="text-sm text-gray-900 dark:text-gray-100 bg-green-50 dark:bg-green-900/30 p-2 rounded font-medium prose prose-sm max-w-none prose-p:first:mt-0 dark:prose-invert"
                                                              dangerouslySetInnerHTML={{
                                                                __html:
                                                                  newValue ||
                                                                  "-",
                                                              }}
                                                            />
                                                          ) : (
                                                            <p className="text-sm text-gray-900 dark:text-gray-100 bg-green-50 dark:bg-green-900/30 p-2 rounded font-medium">
                                                              {formatFieldValue(
                                                                newValue,
                                                                field,
                                                              )}
                                                            </p>
                                                          )}
                                                        </div>
                                                      </div>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          )}
                                      </div>
                                    );
                                  })}
                              </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(`/ilanlar/${jobPost.id}`, "_blank")
                            }
                            className="w-full flex items-center justify-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Görüntüle
                          </Button>
                          <Link
                            to={`${ROUTES.EMPLOYER_MY_JOBS}/${jobPost.id}/duzenle`}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className={`w-full flex items-center justify-center gap-2 ${
                                expired
                                  ? "border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30"
                                  : ""
                              }`}
                            >
                              <Edit className="w-4 h-4" />
                              {expired ? "Süreyi Güncelle" : "Düzenle"}
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleToggleVisibility(
                                jobPost.id,
                                jobPost.isShown,
                              )
                            }
                            disabled={togglingId === jobPost.id}
                            className="w-full flex items-center justify-center gap-2"
                          >
                            {togglingId === jobPost.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : jobPost.isShown ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                            {jobPost.isShown ? "Gizle" : "Göster"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(jobPost.id)}
                            disabled={deletingId === jobPost.id}
                            className="w-full text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:border-red-300 dark:hover:border-red-600 flex items-center justify-center gap-2"
                          >
                            {deletingId === jobPost.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                            Sil
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={
              <Briefcase className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            }
            title="Henüz ilan oluşturmadınız"
            description="Yeni iş ilanı oluşturarak başlayın"
            action={
              <Link to={ROUTES.EMPLOYER_JOB_CREATE}>
                <Button leftIcon={<Plus className="w-4 h-4" />}>
                  İlan Oluştur
                </Button>
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
};

export default BusinessJobPosts;
