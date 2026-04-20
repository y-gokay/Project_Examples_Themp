import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppStore } from "../../store";
import { ROLES, ROUTES } from "../../constants";
import { error as logError } from "../../utils/logger";
import {
  Briefcase,
  FileText,
  Building2,
  AlertCircle,
  ArrowRight,
  Plus,
  MapPin,
  Loader2,
} from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  EmptyState,
} from "../../components/ui";
import { formatPhoneNumberDisplay } from "../../utils/helpers";

const BusinessDashboard = () => {
  const navigate = useNavigate();
  const { user, getBusinessProfile, getBusinessJobPosts, loading } =
    useAppStore();
  const [businessProfile, setBusinessProfile] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalJobs: 0,
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const dashboardLoadedRef = useRef(false);

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
    if (dashboardLoadedRef.current) {
      return;
    }
    dashboardLoadedRef.current = true;

    loadBusinessProfile();
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  const loadBusinessProfile = async () => {
    const result = await getBusinessProfile();
    if (result.success) {
      setBusinessProfile(result.data);
    }
  };

  const loadAllJobPosts = async () => {
    const allJobs = [];
    let page = 1;
    const limit = 100; // Backend limit: 1-100
    let hasMore = true;

    while (hasMore) {
      const result = await getBusinessJobPosts(page, limit);
      if (result.success && result.data) {
        allJobs.push(...result.data);
        // Check if there are more pages
        if (result.pagination) {
          hasMore = page < result.pagination.totalPages;
        } else {
          // If no pagination info, stop if we got less than limit
          hasMore = result.data.length === limit;
        }
        page++;
      } else {
        hasMore = false;
      }
    }

    return allJobs;
  };

  const loadDashboardData = async () => {
    setLoadingDashboard(true);
    try {
      // Load all job posts for accurate statistics
      const allJobs = await loadAllJobPosts();
      const activeJobs = allJobs.filter(
        (job) => job.isActive && job.isApproved
      );
        // Sort by creation date (newest first) and take last 5
      const sortedJobs = [...allJobs].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setRecentJobs(sortedJobs.slice(0, 5));
        setStats((prev) => ({
          ...prev,
          activeJobs: activeJobs.length,
          totalJobs: allJobs.length,
        }));
    } catch (err) {
      logError("Error loading dashboard data:", err);
    } finally {
      setLoadingDashboard(false);
    }
  };

  const dashboardStats = [
    {
      label: "Aktif İlanlar",
      value: stats.activeJobs.toString(),
      icon: Briefcase,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/30",
      link: ROUTES.EMPLOYER_MY_JOBS,
    },
    {
      label: "Toplam İlan",
      value: stats.totalJobs.toString(),
      icon: FileText,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/30",
      link: ROUTES.EMPLOYER_MY_JOBS,
    },
  ];

  const quickActions = [
    {
      label: "Yeni İlan Oluştur",
      link: ROUTES.EMPLOYER_JOB_CREATE,
      icon: Plus,
      description: "Yeni iş ilanı yayınla",
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      label: "Tüm İlanlarım",
      link: ROUTES.EMPLOYER_MY_JOBS,
      icon: Briefcase,
      description: "İlanlarınızı yönetin",
      color: "bg-purple-600 hover:bg-purple-700",
    },
    {
      label: "Şirket Profili",
      link: ROUTES.EMPLOYER_PROFILE,
      icon: Building2,
      description: "Profil bilgilerini düzenle",
      color: "bg-green-600 hover:bg-green-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2">
            Hoş Geldiniz,{" "}
            {businessProfile?.businessName || user?.businessName || "İşveren"}!
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            İş ilanlarınızı yönetin ve şirketinizi büyütün.
          </p>
        </div>

        {/* Approval Status Alert */}
        {businessProfile && !businessProfile.isApproved && (
          <Card className="mb-6 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <div>
                    <p className="font-medium text-yellow-900 dark:text-yellow-200">
                      Onay Bekleniyor
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Şirket profiliniz admin onayı bekliyor. Onaylandıktan
                      sonra iş ilanı yayınlayabileceksiniz.
                    </p>
                  </div>
                </div>
                <Link to={ROUTES.EMPLOYER_PROFILE}>
                  <Button variant="outline" size="sm">
                    Profili Görüntüle
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Üst Satır: İlan Sayıları ve Hızlı İşlemler */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* İlan Sayıları */}
          <div className="lg:col-span-1">
            {loadingDashboard ? (
              <Card className="p-6 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {dashboardStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <Link key={index} to={stat.link || "#"}>
                      <Card
                        className={`p-5 hover:shadow-lg transition-shadow cursor-pointer ${
                          stat.bgColor
                        } ${index > 0 ? "mt-4" : ""}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                              {stat.label}
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                              {stat.value}
                            </p>
                          </div>
                          <Icon className={`w-8 h-8 ${stat.color}`} />
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Hızlı İşlemler */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  Hızlı İşlemler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <Link key={index} to={action.link}>
                        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all cursor-pointer group">
                          <div
                            className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                          >
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-sm">
                            {action.label}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {action.description}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Alt Satır: Şirket Bilgileri ve Son İlanlar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Şirket Bilgileri */}
          {businessProfile && (
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Şirket Bilgileri
                </CardTitle>
                <Link to={ROUTES.EMPLOYER_PROFILE}>
                  <Button
                    variant="outline"
                    size="sm"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Düzenle
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Şirket Adı
                    </label>
                    <div className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      {businessProfile.businessName || "-"}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Vergi No
                      </label>
                      <div className="text-base text-gray-900 dark:text-gray-100">
                        {businessProfile.vergiNo || "-"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Çalışan Sayısı
                      </label>
                      <div className="text-base text-gray-900 dark:text-gray-100">
                        {businessProfile.workerCount || "-"}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      E-posta
                    </label>
                    <div className="text-base text-gray-900 dark:text-gray-100">
                      {businessProfile.businessEmail || "-"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Telefon
                    </label>
                    <div className="text-base text-gray-900 dark:text-gray-100">
                      {businessProfile.businessContactPhoneNumber
                        ? formatPhoneNumberDisplay(
                            businessProfile.businessContactPhoneNumber
                          )
                        : "-"}
                    </div>
                  </div>
                  {businessProfile.address && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Adres
                      </label>
                      <div className="text-base text-gray-900 dark:text-gray-100">
                        {businessProfile.address}
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Onay Durumu
                    </label>
                    <Badge
                      className={
                        businessProfile.isApproved
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                          : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                      }
                    >
                      {businessProfile.isApproved
                        ? "Onaylandı"
                        : "Onay Bekliyor"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Son İlanlar */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Son İlanlarım</CardTitle>
              <Link to={ROUTES.EMPLOYER_MY_JOBS}>
                <Button
                  variant="outline"
                  size="sm"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Tümünü Gör
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {loadingDashboard ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg animate-pulse"
                    >
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : recentJobs.length > 0 ? (
                <div className="space-y-3">
                  {recentJobs.map((job) => (
                    <Link
                      key={job.id}
                      to={`${ROUTES.EMPLOYER_MY_JOBS}/${job.id}/duzenle`}
                    >
                      <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1 truncate">
                              {job.postTitle || job.title}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 flex-wrap">
                              {job.districts && job.districts.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span className="truncate">
                                    {job.districts
                                      .map((d) => d.district?.title || d.title)
                                      .join(", ")}
                                  </span>
                                </div>
                              )}
                              {job.workingMethod && (
                                <span className="truncate">
                                  {job.workingMethod.title || job.workingMethod}
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge
                            className={`ml-2 flex-shrink-0 ${
                              job.isActive
                                ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                            }`}
                          >
                            {job.isActive ? "Aktif" : "Pasif"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>{job.hiringCount || 0} pozisyon</span>
                          <span>
                            {new Date(job.createdAt).toLocaleDateString(
                              "tr-TR",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Briefcase className="w-8 h-8 text-gray-400 dark:text-gray-500" />}
                  title="Henüz ilan yok"
                  description="İlk iş ilanınızı oluşturun"
                  action={
                    <Link to={ROUTES.EMPLOYER_JOB_CREATE}>
                      <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                        İlan Oluştur
                      </Button>
                    </Link>
                  }
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;
