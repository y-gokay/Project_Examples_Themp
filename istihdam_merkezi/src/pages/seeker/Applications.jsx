import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppStore } from "../../store";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Select,
  EmptyState,
  Loading,
} from "../../components/ui";
import {
  FileText,
  Clock,
  CheckCircle,
  Calendar,
  AlertCircle,
  TrendingUp,
  XCircle,
  Search,
  Filter,
  ArrowRight,
  MapPin,
  Building2,
} from "lucide-react";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
} from "../../constants";
import { showToast } from "../../components/ui/Toast";

const Applications = () => {
  const { getApplications, withdrawApplication, loading } = useAppStore();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, statusFilter, searchQuery]);

  const loadApplications = async () => {
    const result = await getApplications({ page: 1, limit: 100 });
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
          company: jobPost.business?.name || app.company,
          companyLogo: jobPost.business?.logo || app.companyLogo,
          location:
            jobPost.districts
              ?.map((d) => d.district?.title || d.title)
              .join(", ") || app.location,
          salary: jobPost.salary || app.salary,
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
    }
  };

  const filterApplications = () => {
    let filtered = [...applications];

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          (app.jobTitle || "").toLowerCase().includes(query) ||
          (app.company || "").toLowerCase().includes(query)
      );
    }

    setFilteredApplications(filtered);
  };

  const handleWithdraw = async (applicationId) => {
    if (
      !window.confirm("Başvurunuzu geri çekmek istediğinizden emin misiniz?")
    ) {
      return;
    }

    // Optimistic update: Başvuruyu hemen listeden kaldır
    setApplications((prev) => prev.filter((app) => app.id !== applicationId));
    setFilteredApplications((prev) =>
      prev.filter((app) => app.id !== applicationId)
    );

    const result = await withdrawApplication(applicationId);
    if (result.success) {
      showToast({
        type: "success",
        message: "Başvurunuz başarıyla geri çekildi",
        duration: 3000,
      });
      // Refresh applications list to ensure consistency
      await loadApplications();
    } else {
      // Hata durumunda geri al - başvuruyu tekrar ekle
      await loadApplications();
      // Backend'den gelen hatayı kontrol et ve kullanıcı dostu mesaj göster
      let errorMessage = "Başvuru geri çekilirken bir hata oluştu";
      if (result.error) {
        if (
          result.error.includes("Cannot withdraw") ||
          result.error.includes("processed") ||
          result.error.includes("onaylandı") ||
          result.error.includes("accepted")
        ) {
          errorMessage =
            "Bu başvuru işleme alındığı için geri çekilemez. Başvurunuz kabul edilmiş veya işleme alınmış durumda.";
        } else {
          errorMessage = result.error;
        }
      }
      showToast({
        type: "error",
        message: errorMessage,
        duration: 5000,
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return Clock;
      case "accepted":
        return CheckCircle;
      case "rejected":
        return XCircle;
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
      case "hired":
        return CheckCircle;
      default:
        return FileText;
    }
  };

  if (loading && applications.length === 0) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Başvurularım
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Tüm iş başvurularınızı buradan takip edebilirsiniz
          </p>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="İş ilanı veya şirket ara..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: "all", label: "Tüm Durumlar" },
                  { value: "pending", label: "Beklemede" },
                  { value: "accepted", label: "Onaylandı" },
                  { value: "rejected", label: "Reddedildi" },
                  { value: "employed", label: "İşe Alındı" },
                ]}
                className="min-w-[180px]"
              />
            </div>
          </div>
        </Card>

        {/* Applications List */}
        {filteredApplications.length > 0 ? (
          <div className="space-y-4">
            {filteredApplications.map((application) => {
              const StatusIcon = getStatusIcon(application.status);
              return (
                <Card
                  key={application.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Company Logo */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
                          {application.companyLogo ? (
                            <img
                              src={application.companyLogo}
                              alt={application.company}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                      </div>

                      {/* Application Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <Link
                              to={`/ilanlar/${application.jobId}`}
                              state={{ from: "applications" }}
                              className="text-xl font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              {application.jobTitle}
                            </Link>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                              {application.company}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {application.location}
                              </div>
                              {application.salary && (
                                <span className="text-green-600 dark:text-green-400 font-medium">
                                  {application.salary}
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge
                            className={`${APPLICATION_STATUS_COLORS[application.status] ||
                              "bg-gray-100 text-gray-800"
                              }`}
                          >
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {APPLICATION_STATUS_LABELS[application.status] ||
                              application.status}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Başvuru Tarihi:{" "}
                              {new Date(
                                application.appliedDate
                              ).toLocaleDateString("tr-TR", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Link
                              to={`/ilanlar/${application.jobId}`}
                              state={{ from: "applications" }}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                rightIcon={<ArrowRight className="w-4 h-4" />}
                              >
                                Detayları Gör
                              </Button>
                            </Link>
                            {application.status === "pending" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleWithdraw(application.id)}
                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:border-red-300 dark:hover:border-red-700"
                              >
                                Geri Çek
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<FileText className="w-8 h-8 text-gray-400" />}
            title={
              searchQuery || statusFilter !== "all"
                ? "Filtreye uygun başvuru bulunamadı"
                : "Henüz başvuru yapmadınız"
            }
            description={
              searchQuery || statusFilter !== "all"
                ? "Filtreleri değiştirerek tekrar deneyin"
                : "İş ilanlarına göz atın ve başvuru yapmaya başlayın"
            }
            action={
              !searchQuery && statusFilter === "all" ? (
                <Link to="/ilanlar">
                  <Button leftIcon={<Search className="w-4 h-4" />}>
                    İş İlanlarına Git
                  </Button>
                </Link>
              ) : null
            }
          />
        )}
      </div>
    </div>
  );
};

export default Applications;
