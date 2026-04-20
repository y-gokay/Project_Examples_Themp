import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAppStore } from "../store";
import { error as logError } from "../utils/logger";
import {
  Briefcase,
  FileText,
  Heart,
  TrendingUp,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  Search,
  Star,
  MapPin,
  Calendar,
  Sparkles,
  Building2,
  Users,
  Eye,
} from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  EmptyState,
} from "../components/ui";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
  ROLES,
} from "../constants";

const Dashboard = () => {
  const {
    user,
    getProfile,
    getApplications,
    getFavorites,
    getUserStatistics,
    getBusinessJobPosts,
  } = useAppStore();
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [applications, setApplications] = useState([]);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [jobApplicationCount, setJobApplicationCount] = useState(0);
  const [canApplicateAJob, setCanApplicateAJob] = useState(false);
  const [missingRequirements, setMissingRequirements] = useState([]);
  const [latestJobPost, setLatestJobPost] = useState(null);
  const [loadingLatestJob, setLoadingLatestJob] = useState(false);

  const dashboardLoadedRef = useRef(false);

  // Kullanıcı rolünü kontrol et
  const userRole = user?.role || user?.userType;
  const isEmployer =
    userRole === ROLES.EMPLOYER ||
    userRole === "employer" ||
    userRole === "business";

  useEffect(() => {
    // Prevent duplicate API calls in Strict Mode
    if (dashboardLoadedRef.current) {
      return;
    }

    if (user) {
      dashboardLoadedRef.current = true;
      if (isEmployer) {
        loadLatestJobPost();
      } else {
        loadStatistics();
        loadApplications();
        loadFavoritesCount();
      }
    } else {
      dashboardLoadedRef.current = true;
      getProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isEmployer]);

  // İşveren için son yayınlanan iş ilanını yükle
  const loadLatestJobPost = async () => {
    setLoadingLatestJob(true);
    try {
      const result = await getBusinessJobPosts({ page: 1, limit: 1 });
      if (result.success && result.data) {
        const jobPosts =
          result.data?.jobPosts || result.data?.items || result.data || [];
        if (jobPosts.length > 0) {
          setLatestJobPost(jobPosts[0]);
        }
      }
    } catch (err) {
      logError("Error loading latest job post:", err);
    } finally {
      setLoadingLatestJob(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const result = await getUserStatistics();
      if (result.success && result.data) {
        const stats = result.data;
        // Profil tamamlanma yüzdesi
        setProfileCompletion(stats.statistics?.profileCompletion || 0);
        // Favori ilan sayısı
        setFavoritesCount(stats.favoritedJobPostCount || 0);
        // Başvuru sayısı
        setJobApplicationCount(stats.jobApplicationCount || 0);
        // İş başvurusu yapabilir mi?
        setCanApplicateAJob(stats.statistics?.canApplicateAJob || false);
        // Eksik gereksinimler
        setMissingRequirements(
          stats.statistics?.applicationRequirements?.missing || [],
        );
      } else {
        // API başarısız olursa eski yöntemi kullan
        calculateProfileCompletion();
      }
    } catch (err) {
      logError("Error loading statistics:", err);
      // Hata durumunda eski yöntemi kullan
      calculateProfileCompletion();
    }
  };

  const calculateProfileCompletion = () => {
    if (!user) return;

    // Profil tamamlanma kontrolü - API yapısına göre güncellendi
    const fields = [
      // Temel Bilgiler (5 alan)
      user.name,
      user.surname,
      user.email,
      user.phoneNumber || user.phone,
      user.profilePicture || user.avatar,

      // Kişisel Bilgiler (7 alan)
      user.gender,
      user.birthday,
      user.nationalityId || user.nationality,
      user.secondaryPhone,
      user.tc,
      user.isPhoneApproved && user.isEmailApproved, // Doğrulama

      // Adres Bilgileri (3 alan)
      user.addressText || user.address || user.ikametgahAddress,
      user.addressNeighbourhoodId || user.neighbourhoodId || user.neighbourhood,
      user.city ||
      user.district ||
      user.neighbourhood?.district?.city ||
      user.ikametgahDistrictRef?.city,

      // İş Durumu Bilgileri (5 alan)
      user.workingStatus !== undefined && user.workingStatus !== null,
      user.militaryStatus !== undefined && user.militaryStatus !== null,
      user.retirementStatus !== undefined && user.retirementStatus !== null,
      user.smokingStatus !== undefined && user.smokingStatus !== null,
      user.isDisabledPerson !== undefined && user.isDisabledPerson !== null,
      user.isMarried !== undefined && user.isMarried !== null,

      // Belgeler (1 alan)
      user.criminalRecordFile,

      // İlişkili Veriler (5 alan)
      user.sectors?.length > 0,
      user.professions?.length > 0 || user.skills?.length > 0,
      user.workExperiences?.length > 0 || user.experience?.length > 0,
      user.educations?.length > 0 || user.education?.length > 0,
      user.languages?.length > 0,
      user.exams?.length > 0,
      user.drivingLisences?.length > 0 || user.drivingLicenses?.length > 0,
    ];

    const completedFields = fields.filter(Boolean).length;
    const totalFields = fields.length;
    const percentage = Math.round((completedFields / totalFields) * 100);
    setProfileCompletion(percentage);
  };

  const loadApplications = async () => {
    // API'den başvuruları çek
    try {
      const result = await getApplications();
      if (result.success) {
        // API returns data.applications
        const apps =
          result.data?.applications || result.data?.items || result.data || [];

        // Normalize application data structure
        const normalizedApps = apps.map((app) => {
          const jobPost = app.jobPost || {};

          // Determine status from boolean flags
          let status = "pending";
          if (app.isEmployed) {
            status = "employed";
          } else if (app.isAccepted) {
            status = "accepted";
          } else if (app.isRejected) {
            status = "rejected";
          }

          return {
            id: app.id,
            jobId: app.jobPostId || jobPost.id,
            jobTitle: jobPost.postTitle || app.jobTitle,
            location:
              jobPost.districts
                ?.map((d) => d.district?.title || d.title)
                .join(", ") || app.location,
            status: status,
            coverLetter: app.coverLetter,
            appliedDate: app.createdAt || app.appliedDate,
            isEmployed: app.isEmployed,
            isAccepted: app.isAccepted,
            isRejected: app.isRejected,
            rejectReason: app.rejectReason,
            // Keep original data for compatibility
            ...app,
          };
        });

        setApplications(normalizedApps);
      } else {
        setApplications([]);
      }
    } catch (err) {
      logError("Error loading applications:", err);
      setApplications([]);
    }
  };

  const loadFavoritesCount = async () => {
    try {
      const result = await getFavorites();
      if (result.success) {
        const favs =
          result.data?.favorites ||
          result.data?.items ||
          (Array.isArray(result.data) ? result.data : []);
        setFavoritesCount(Array.isArray(favs) ? favs.length : 0);
      } else {
        setFavoritesCount(0);
      }
    } catch (err) {
      logError("Error loading favorites count:", err);
      setFavoritesCount(0);
    }
  };

  const stats = [
    {
      label: "Başvurularım",
      value:
        jobApplicationCount > 0
          ? jobApplicationCount.toString()
          : (applications?.length || 0).toString(),
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      link: "/panel/basvurularim",
    },
    {
      label: "Favorilerim",
      value: favoritesCount.toString(),
      icon: Heart,
      color: "text-red-600",
      bgColor: "bg-red-50",
      link: "/panel/favorilerim",
    },
    {
      label: "Profil Tamamlama",
      value: `${profileCompletion}%`,
      icon: User,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/30",
      link: "/profil",
    },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return Clock;
      case "accepted":
        return CheckCircle;
      case "rejected":
        return AlertCircle;
      case "employed":
        return CheckCircle;
      case "received":
        return Clock;
      case "shortlisted":
        return CheckCircle;
      case "interview":
        return Calendar;
      case "offer":
        return TrendingUp;
      default:
        return FileText;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2">
            Hoş Geldiniz,{" "}
            {isEmployer
              ? user?.businessName || user?.name || "İşveren"
              : user?.name && user?.surname
                ? `${user.name} ${user.surname}`
                : user?.name || "Kullanıcı"}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {isEmployer
              ? "Gösterge paneline hoş geldiniz. İş ilanlarınızı yönetin ve aday başvurularını takip edin."
              : "Gösterge paneline hoş geldiniz. İş arama yolculuğunuzda size yardımcı olmak için buradayız."}
          </p>
        </div>

        {/* İş Arayan için Profile Completion Alert */}
        {!isEmployer && profileCompletion < 80 && (
          <Card className="mb-4 sm:mb-6 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/30">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                  <div>
                    <p className="font-medium text-sm sm:text-base text-yellow-900 dark:text-yellow-200">
                      Profilinizi tamamlayın
                    </p>
                    <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300">
                      Profil tamamlama oranınız %{profileCompletion}. Daha fazla
                      iş fırsatı için profilinizi %100 tamamlayın.
                    </p>
                    {missingRequirements.length > 0 && (
                      <p className="text-[10px] sm:text-xs text-yellow-600 dark:text-yellow-400 mt-1 line-clamp-2 sm:line-clamp-none">
                        Eksik alanlar:{" "}
                        {missingRequirements.map((r) => r.label).join(", ")}
                      </p>
                    )}
                  </div>
                </div>
                <Link to="/profil" className="w-full sm:w-auto flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    <span className="sm:hidden">Tamamla</span>
                    <span className="hidden sm:inline">Profili Tamamla</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* İş Arayan için Can't Apply Job Alert */}
        {!isEmployer && !canApplicateAJob && missingRequirements.length > 0 && (
          <Card className="mb-4 sm:mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                  <div>
                    <p className="font-medium text-sm sm:text-base text-red-900 dark:text-red-200">
                      İş başvurusu yapabilmek için eksik bilgileriniz var
                    </p>
                    <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 mt-1">
                      Aşağıdaki bilgileri tamamlamanız gerekiyor:
                    </p>
                    <ul className="text-[10px] sm:text-xs text-red-600 dark:text-red-400 mt-1 list-disc list-inside">
                      {missingRequirements.slice(0, 3).map((req, idx) => (
                        <li key={idx}>{req.label}</li>
                      ))}
                      {missingRequirements.length > 3 && (
                        <li className="sm:hidden">
                          ve {missingRequirements.length - 3} alan daha...
                        </li>
                      )}
                      {missingRequirements.slice(3, 5).map((req, idx) => (
                        <li key={idx + 3} className="hidden sm:list-item">
                          {req.label}
                        </li>
                      ))}
                      {missingRequirements.length > 5 && (
                        <li className="hidden sm:list-item">
                          ve {missingRequirements.length - 5} alan daha...
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
                <Link to="/profil" className="w-full sm:w-auto flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50"
                  >
                    <span className="sm:hidden">Tamamla</span>
                    <span className="hidden sm:inline">Eksikleri Tamamla</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* İş Arayan için Stats */}
        {!isEmployer && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Link key={index} to={stat.link || "#"}>
                  <Card
                    className={`p-4 sm:p-5 lg:p-6 hover:shadow-lg transition-shadow cursor-pointer ${stat.bgColor}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 truncate">
                          {stat.label}
                        </p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {stat.value}
                        </p>
                      </div>
                      <Icon
                        className={`w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 ${stat.color} flex-shrink-0 ml-2`}
                      />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        {/* İşveren için Son Yayınlanan İş İlanı veya İş Arayan için Önerilen İlanlar */}
        {isEmployer ? (
          // İşveren için Son Yayınlanan İş İlanı
          <Card className="mb-6 sm:mb-8">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Son Yayınlanan İş İlanınız
              </CardTitle>
              <Link to="/isveren/ilanlarim">
                <Button
                  variant="outline"
                  size="sm"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="w-full sm:w-auto"
                >
                  Tüm İlanlarım
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {loadingLatestJob ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : latestJobPost ? (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-gray-100 mb-2">
                        {latestJobPost.postTitle || latestJobPost.title}
                      </h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {latestJobPost.districts &&
                          latestJobPost.districts.length > 0 && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {latestJobPost.districts
                                .map((d) => d.district?.title || d.title)
                                .join(", ")}
                            </span>
                          )}
                        {latestJobPost.workingMethod && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {latestJobPost.workingMethod?.title ||
                              latestJobPost.workingMethod}
                          </span>
                        )}
                        {latestJobPost.createdAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(
                              latestJobPost.createdAt,
                            ).toLocaleDateString("tr-TR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {latestJobPost.applicationCount !== undefined && (
                          <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                            <Users className="w-3 h-3 mr-1" />
                            {latestJobPost.applicationCount} Başvuru
                          </Badge>
                        )}
                        {latestJobPost.isActive !== undefined && (
                          <Badge
                            className={
                              latestJobPost.isActive
                                ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300"
                            }
                          >
                            {latestJobPost.isActive ? "Aktif" : "Pasif"}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col gap-2">
                      <Link
                        to={`/isveren/ilanlarim/${latestJobPost.id}`}
                        className="flex-1 sm:flex-none"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="w-4 h-4 mr-1" />
                          Detay
                        </Button>
                      </Link>
                      <Link
                        to="/isveren/ilanlarim"
                        className="flex-1 sm:flex-none"
                      >
                        <Button size="sm" className="w-full">
                          İlanlarım
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={<Briefcase className="w-8 h-8 text-gray-400" />}
                  title="Henüz iş ilanı yayınlamadınız"
                  description="Yeni bir iş ilanı oluşturarak aday aramaya başlayın"
                  action={
                    <Link to="/isveren/ilan-olustur">
                      <Button leftIcon={<Briefcase className="w-4 h-4" />}>
                        İlan Oluştur
                      </Button>
                    </Link>
                  }
                />
              )}
            </CardContent>
          </Card>
        ) : (
          // İş Arayan için Profilinize Göre Önerilen İş İlanları
          <Link
            to="/ilanlar"
            state={{ activeTab: "recommendations" }}
            className="block mb-6 sm:mb-8"
          >
            <Card className="p-4 sm:p-5 lg:p-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-gray-100 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                      Profilinize Göre Önerilen İş İlanları
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                      Yeteneklerinize ve deneyimlerinize uygun iş fırsatlarını
                      keşfedin
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-purple-500 dark:text-purple-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </div>
            </Card>
          </Link>
        )}

        {/* İş Arayan için Son Başvurular */}
        {!isEmployer && (
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-lg sm:text-xl">
                Son Başvurularım
              </CardTitle>
              <Link to="/panel/basvurularim">
                <Button
                  variant="outline"
                  size="sm"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="w-full sm:w-auto"
                >
                  <span className="hidden sm:inline">Tümünü Gör</span>
                  <span className="sm:hidden">Tümü</span>
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {applications && applications.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {applications.map((application) => {
                    const StatusIcon = getStatusIcon(application.status);
                    return (
                      <div
                        key={application.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors gap-3"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                          <div
                            className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0`}
                          >
                            <StatusIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 truncate">
                              {application.jobTitle}
                            </h4>
                            {application.location && (
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="truncate">
                                  {application.location}
                                </span>
                              </p>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              Başvuru Tarihi:{" "}
                              {new Date(
                                application.appliedDate,
                              ).toLocaleDateString("tr-TR", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            className={
                              APPLICATION_STATUS_COLORS[application.status] ||
                              "bg-gray-100 text-gray-800"
                            }
                          >
                            {APPLICATION_STATUS_LABELS[application.status] ||
                              application.status}
                          </Badge>
                          <Link to={`/ilanlar/${application.jobId}`}>
                            <Button variant="outline" size="sm">
                              Detay
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  icon={<FileText className="w-8 h-8 text-gray-400" />}
                  title="Henüz başvuru yapmadınız"
                  description="İş ilanlarına göz atın"
                  action={
                    <Link to="/ilanlar">
                      <Button leftIcon={<Search className="w-4 h-4" />}>
                        İş İlanlarına Git
                      </Button>
                    </Link>
                  }
                />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
