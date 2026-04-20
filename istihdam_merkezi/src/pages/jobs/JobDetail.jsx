import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  Briefcase,
  MapPin,
  Clock,
  Users,
  Calendar,
  Building2,
  CheckCircle2,
  Heart,
  Share2,
  ArrowLeft,
  ChevronRight,
  GraduationCap,
  Car,
  FileText,
  Award,
  XCircle,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  X,
  Globe,
  AlertTriangle,
  User,
  Phone,
  Camera,
  Shield,
} from "lucide-react";
import DisabledJobIcon from "../../components/common/DisabledJobIcon";
import { Button, Badge, Modal, Select, Textarea } from "../../components/ui";
import { PageLoading, SEOHead } from "../../components/common";
import { useAppStore } from "../../store";
import { ROUTES, ROLES } from "../../constants";
import { showToast } from "../../components/ui/Toast";
import { sortEducationLevels } from "../../utils/helpers";
import { error as logError } from "../../utils/logger";
import { getToken, isTokenExpired, setToken } from "../../lib/api";

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    applyToJob,
    addToFavorites,
    removeFromFavorites,
    getJobDetail,
    currentJob,
    loading,
    user,
    isAuthenticated,
    withdrawApplication,
    getApplications,
    getUserStatistics,
  } = useAppStore();

  // İşveren kontrolü - başvuru yapmasını engelle ama görüntüleyebilsin
  const userRole = user?.role || user?.userType;
  const isEmployer =
    userRole === ROLES.EMPLOYER ||
    userRole === "employer" ||
    userRole === "business";

  // Başvuru tarihi geçmiş mi kontrolü (son gün 23:59:59'a kadar geçerli)
  const isDeadlinePassed = currentJob?.applicationUntilDate
    ? (() => {
        const deadline = new Date(currentJob.applicationUntilDate);
        deadline.setHours(23, 59, 59, 999);
        return deadline < new Date();
      })()
    : false;
  const [isFavorited, setIsFavorited] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [actionCooldown, setActionCooldown] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isMissingInfoModalOpen, setIsMissingInfoModalOpen] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [canApplicateAJob, setCanApplicateAJob] = useState(true);
  const [missingRequirements, setMissingRequirements] = useState([]);
  const [statsLoaded, setStatsLoaded] = useState(false);
  const jobDetailLoadedRef = useRef(false);

  // Cooldown süresi: 10 saniye (10000 ms)
  const COOLDOWN_DURATION = 10 * 1000; // 10 saniye

  useEffect(() => {
    // Prevent duplicate API calls in Strict Mode
    if (jobDetailLoadedRef.current || !id) {
      return;
    }
    jobDetailLoadedRef.current = true;
    getJobDetail(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (isAuthenticated && !isEmployer && !statsLoaded) {
      const loadStats = async () => {
        const result = await getUserStatistics();
        if (result.success && result.data) {
          const stats = result.data;
          setProfileCompletion(stats.statistics?.profileCompletion || 0);
          setCanApplicateAJob(stats.statistics?.canApplicateAJob ?? true);
          setMissingRequirements(
            stats.statistics?.applicationRequirements?.missing || [],
          );
        }
        setStatsLoaded(true);
      };
      loadStats();
    }
  }, [isAuthenticated, isEmployer, statsLoaded, getUserStatistics]);

  const job = currentJob;
  const isMaleBlockedForFemaleJob =
    user?.gender === "male" && job?.genderOption === false;

  // Update isFavorited when job data changes
  useEffect(() => {
    if (currentJob) {
      setIsFavorited(currentJob.isFavorited || false);
    }
  }, [currentJob]);

  // Load application ID and status if user has applied
  useEffect(() => {
    const loadApplicationId = async () => {
      if (job?.hasApplied && id && isAuthenticated) {
        const result = await getApplications({ page: 1, });
        if (result.success) {
          const apps =
            result.data?.applications ||
            result.data?.items ||
            result.data ||
            [];
          const application = apps.find(
            (app) =>
              (app.jobPostId || app.jobPost?.id)?.toString() === id?.toString(),
          );
          if (application) {
            setApplicationId(application.id);
            // Determine status from boolean flags
            let status = "pending";
            if (application.isEmployed) {
              status = "employed";
            } else if (application.isAccepted) {
              status = "accepted";
            } else if (application.isRejected) {
              status = "rejected";
            }
            setApplicationStatus(status);
          }
        }
      } else {
        setApplicationId(null);
        setApplicationStatus(null);
      }
    };

    if (job?.hasApplied && id && isAuthenticated) {
      loadApplicationId();
    }
  }, [job?.hasApplied, id, isAuthenticated, getApplications]);

  // Check cooldown timer
  useEffect(() => {
    if (!id) return;

    const checkCooldown = () => {
      const lastActionTime = localStorage.getItem(`lastJobAction_${id}`);
      if (lastActionTime) {
        const timeSinceLastAction = Date.now() - parseInt(lastActionTime, 10);
        const remainingTime = COOLDOWN_DURATION - timeSinceLastAction;

        if (remainingTime > 0) {
          setActionCooldown(remainingTime);
          // Update cooldown every second
          const interval = setInterval(() => {
            const newRemainingTime =
              COOLDOWN_DURATION - (Date.now() - parseInt(lastActionTime, 10));
            if (newRemainingTime > 0) {
              setActionCooldown(newRemainingTime);
            } else {
              setActionCooldown(null);
              localStorage.removeItem(`lastJobAction_${id}`);
              clearInterval(interval);
            }
          }, 1000);

          return () => clearInterval(interval);
        } else {
          setActionCooldown(null);
          localStorage.removeItem(`lastJobAction_${id}`);
        }
      } else {
        setActionCooldown(null);
      }
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, [id, COOLDOWN_DURATION]);

  const formatCooldownTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getMissingRequirementGroups = () => {
    const groups = {
      personal: {
        label: "Kişisel Bilgiler",
        tab: "personal",
        icon: User,
        items: [],
      },
      contact: {
        label: "İletişim & Doğrulama",
        tab: "personal",
        icon: Phone,
        items: [],
      },
      photo: {
        label: "Profil Fotoğrafı",
        tab: "personal",
        icon: Camera,
        items: [],
      },
      status: {
        label: "Kişisel Durum Bilgileri",
        tab: "personal",
        icon: Shield,
        items: [],
      },
      criminal: {
        label: "Adli Sicil",
        tab: "personal",
        icon: FileText,
        items: [],
      },
      address: {
        label: "Adres Bilgileri",
        tab: "personal",
        icon: MapPin,
        items: [],
      },
      work: {
        label: "Sektör & Meslek",
        tab: "work",
        icon: Briefcase,
        items: [],
      },
    };

    const keyToGroup = {
      name: "personal",
      surname: "personal",
      tc: "personal",
      birthday: "personal",
      gender: "personal",
      email: "contact",
      phoneNumber: "contact",
      isPhoneApproved: "contact",
      isEmailApproved: "contact",
      profilePicture: "photo",
      retirementStatus: "status",
      isMarried: "status",
      smokingStatus: "status",
      isDisabledPerson: "status",
      isCriminalRecorded: "criminal",
      criminalRecordFile: "criminal",
      addressText: "address",
      addressNeighbourhoodId: "address",
      sectors: "work",
      professions: "work",
    };

    missingRequirements.forEach((req) => {
      const groupKey = keyToGroup[req.key] || "personal";
      if (groups[groupKey]) {
        groups[groupKey].items.push(req);
      }
    });

    return Object.values(groups).filter((g) => g.items.length > 0);
  };

  const handleApply = () => {
    const token = getToken();
    if (isAuthenticated && (!token || isTokenExpired(token))) {
      setToken(null);
      useAppStore.setState({ user: null, isAuthenticated: false });
      showToast({
        type: "error",
        message: "Oturumunuz sona erdi. Lütfen tekrar giriş yapın.",
        duration: 4000,
      });
      navigate(ROUTES.LOGIN + "?sessionExpired=1");
      return;
    }

    if (!isAuthenticated) {
      showToast({
        type: "error",
        message: "Başvuru yapmak için lütfen giriş yapın.",
        duration: 3000,
      });
      navigate(ROUTES.LOGIN + "?sessionExpired=1");
      return;
    }

    // Engelli bireyler için özel ilan kontrolü
    if (job?.isPostForDisabledPersons && user?.isDisabledPerson !== true) {
      showToast({
        type: "error",
        message:
          "Bu ilan sadece engelli bireyler için yayınlanmıştır. Profilinizde engelli birey olarak işaretli değilsiniz.",
        duration: 5000,
      });
      return;
    }

    if (isMaleBlockedForFemaleJob) {
      showToast({
        type: "error",
        message: "Bu ilan kadın adaylar için. Erkek kullanıcılar başvuramaz.",
        duration: 5000,
      });
      return;
    }

    // Check cooldown
    if (actionCooldown && actionCooldown > 0) {
      showToast({
        type: "error",
        message: `Lütfen ${formatCooldownTime(
          actionCooldown,
        )} bekleyin. Çok sık başvuru yapamazsınız.`,
        duration: 5000,
      });
      return;
    }

    if (job && job.hasApplied === true) {
      showToast({
        type: "error",
        message: "Bu ilana zaten başvurdunuz",
        duration: 3000,
      });
      return;
    }

    if (job && job.isShown === false) {
      showToast({
        type: "error",
        message: "Bu ilan için başvuru şu anda kapalı",
        duration: 3000,
      });
      return;
    }

    if (!canApplicateAJob && missingRequirements.length > 0) {
      setIsMissingInfoModalOpen(true);
      return;
    }

    // Eğer ilan için ön yazı istenmiyorsa, modal açmadan doğrudan başvuruyu gönder
    if (!job?.coverLetterRequest) {
      handleSubmitApplication();
      return;
    }

    // Ön yazı isteniyorsa modal üzerinden devam et
    setIsApplyModalOpen(true);
  };

  const handleSubmitApplication = async () => {
    if (!coverLetter && job?.coverLetterRequest) {
      showToast({
        type: "error",
        message: "Ön yazı zorunludur",
        duration: 3000,
      });
      return;
    }

    if (job && job.hasApplied === true) {
      showToast({
        type: "error",
        message: "Bu ilana zaten başvurdunuz",
        duration: 3000,
      });
      setIsApplyModalOpen(false);
      return;
    }

    // Engelli bireyler için özel ilan kontrolü (ek güvenlik)
    if (job?.isPostForDisabledPersons && user?.isDisabledPerson !== true) {
      showToast({
        type: "error",
        message:
          "Bu ilan sadece engelli bireyler için yayınlanmıştır. Profilinizde engelli birey olarak işaretli değilsiniz.",
        duration: 5000,
      });
      setIsApplyModalOpen(false);
      return;
    }

    if (isMaleBlockedForFemaleJob) {
      showToast({
        type: "error",
        message: "Bu ilan kadın adaylar için. Erkek kullanıcılar başvuramaz.",
        duration: 5000,
      });
      setIsApplyModalOpen(false);
      return;
    }

    // Check cooldown
    if (actionCooldown && actionCooldown > 0) {
      showToast({
        type: "error",
        message: `Lütfen ${formatCooldownTime(
          actionCooldown,
        )} dakika bekleyin. Çok sık başvuru yapamazsınız.`,
        duration: 5000,
      });
      setIsApplyModalOpen(false);
      return;
    }

    if (!canApplicateAJob && missingRequirements.length > 0) {
      setIsApplyModalOpen(false);
      setIsMissingInfoModalOpen(true);
      return;
    }

    setApplying(true);
    const result = await applyToJob(id, coverLetter);
    setApplying(false);

    if (result.success) {
      // Set cooldown timer
      if (id) {
        localStorage.setItem(`lastJobAction_${id}`, Date.now().toString());
        setActionCooldown(COOLDOWN_DURATION);
      }

      showToast({
        type: "success",
        message: "Başvurunuz başarıyla gönderildi",
        duration: 3000,
      });
      setIsApplyModalOpen(false);
      setCoverLetter("");
      // Refresh job data to update hasApplied status
      if (id) {
        getJobDetail(id);
      }
      navigate(ROUTES.MY_APPLICATIONS_PANEL);
    } else {
      showToast({
        type: "error",
        message: result.error || "Başvuru yapılırken bir hata oluştu",
        duration: 3000,
      });
    }
  };

  const handleWithdrawApplication = async () => {
    if (!applicationId) {
      showToast({
        type: "error",
        message: "Başvuru bilgisi bulunamadı",
        duration: 3000,
      });
      return;
    }

    // Check cooldown
    if (actionCooldown && actionCooldown > 0) {
      showToast({
        type: "error",
        message: `Lütfen ${formatCooldownTime(
          actionCooldown,
        )} bekleyin. Çok sık işlem yapamazsınız.`,
        duration: 5000,
      });
      return;
    }

    if (
      !window.confirm("Başvurunuzu geri çekmek istediğinizden emin misiniz?")
    ) {
      return;
    }

    setWithdrawing(true);
    const result = await withdrawApplication(applicationId);
    setWithdrawing(false);

    if (result.success) {
      // Set cooldown timer
      if (id) {
        localStorage.setItem(`lastJobAction_${id}`, Date.now().toString());
        setActionCooldown(COOLDOWN_DURATION);
      }

      showToast({
        type: "success",
        message: "Başvurunuz başarıyla geri çekildi",
        duration: 3000,
      });
      // Clear application ID first
      setApplicationId(null);
      // Refresh job data to update hasApplied status - this will show the apply button again
      if (id) {
        // Force refresh by clearing cache and reloading
        setTimeout(() => {
          getJobDetail(id);
        }, 500);
      }
    } else {
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

  const toggleFavorite = async () => {
    const favToken = getToken();
    if (isAuthenticated && (!favToken || isTokenExpired(favToken))) {
      setToken(null);
      useAppStore.setState({ user: null, isAuthenticated: false });
      showToast({
        type: "error",
        message: "Oturumunuz sona erdi. Lütfen tekrar giriş yapın.",
        duration: 4000,
      });
      navigate(ROUTES.LOGIN + "?sessionExpired=1");
      return;
    }

    if (!isAuthenticated) {
      showToast({
        type: "error",
        message: "Favorilere eklemek için lütfen giriş yapın.",
        duration: 3000,
      });
      navigate(ROUTES.LOGIN + "?sessionExpired=1");
      return;
    }

    if (isFavorited) {
      const result = await removeFromFavorites(id);
      if (result.success) {
        setIsFavorited(false);
        showToast({
          type: "success",
          message: "Favorilerden kaldırıldı",
          duration: 3000,
        });
      }
    } else {
      const result = await addToFavorites(id);
      if (result.success) {
        setIsFavorited(true);
        showToast({
          type: "success",
          message: "Favorilere eklendi",
          duration: 3000,
        });
      }
    }
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      showToast({
        type: "success",
        message: "Link kopyalandı!",
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareUrl = window.location.href;
  const shareTitle = job?.title || "";
  const shareText = `${job?.profession || ""} - ${job?.title || ""}`;

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      shareUrl,
    )}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      shareUrl,
    )}&text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      shareUrl,
    )}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(
      `${shareText} ${shareUrl}`,
    )}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  if (loading && !currentJob) {
    return <PageLoading text="İlan detayları yükleniyor..." />;
  }

  if (!job || !job.id) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            İlan bulunamadı
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Aradığınız iş ilanı bulunamadı veya kaldırılmış olabilir.
          </p>
          <Link to={ROUTES.JOBS}>
            <Button>İş İlanlarına Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Türkçe/slug → Google schema.org employmentType mapping
  const employmentTypeMap = {
    "Tam Zamanlı": "FULL_TIME",
    "full-time": "FULL_TIME",
    "Yarı Zamanlı": "PART_TIME",
    "part-time": "PART_TIME",
    "Uzaktan": "FULL_TIME",
    "remote": "FULL_TIME",
    "Staj": "INTERN",
    "internship": "INTERN",
    "Serbest": "CONTRACTOR",
    "freelance": "CONTRACTOR",
  };

  const getEmploymentType = (method) => {
    if (!method) return null;
    const value = typeof method === "object" ? method.title : method;
    return employmentTypeMap[value] || null;
  };

  // JobPosting JSON-LD schema
  const mappedEmploymentType = getEmploymentType(job?.workingMethod);
  const jobJsonLd = job
    ? {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        title: job.title,
        description: job.description || job.title,
        datePosted: job.createdAt || job.publishedAt,
        ...(job.applicationUntilDate && {
          validThrough: job.applicationUntilDate,
        }),
        hiringOrganization: {
          "@type": "Organization",
          name: job.company?.name || job.companyName || "ATİM İşveren",
          sameAs: "https://atim.atakum.bel.tr",
        },
        jobLocation: {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: job.district || "Atakum",
            addressRegion: "Samsun",
            addressCountry: "TR",
          },
        },
        ...(mappedEmploymentType && {
          employmentType: mappedEmploymentType,
        }),
      }
    : null;

  return (
    <>
      {job && (
        <SEOHead
          title={job.title}
          description={`${job.title} - ${job.company?.name || job.companyName || "ATİM"} | Samsun Atakum'da iş ilanı. Hemen başvurun!`}
          path={`/ilanlar/${id}`}
          type="article"
          jsonLd={jobJsonLd}
        />
      )}
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 overflow-x-auto">
              <Link
                to={ROUTES.HOME}
                className="hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap"
              >
                Ana Sayfa
              </Link>
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <Link
                to={ROUTES.JOBS}
                className="hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap"
              >
                İş İlanları
              </Link>
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="text-gray-900 dark:text-gray-100 font-medium truncate">
                {job.title}
              </span>
            </div>

            {/* Back Button - Sadece Applications veya Favorites sayfalarından gelindiğinde "Geri Dön" göster */}
            {location.state?.from === "applications" ||
              location.state?.from === "favorites" ? (
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 sm:mb-6"
              >
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Geri Dön</span>
              </button>
            ) : (
              <Link
                to="/ilanlar"
                className="inline-flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 sm:mb-6"
              >
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Tüm İlanlar</span>
              </Link>
            )}

            {/* Job Title & Actions */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6">
              <div className="flex gap-3 sm:gap-4">
                {/* Company Logo */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
                    <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>

                {/* Title & Info */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2 break-words flex items-center gap-2">
                    {job.isPostForDisabledPersons && (
                      <DisabledJobIcon className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 text-indigo-600 dark:text-indigo-300" />
                    )}
                    <span>{job.title}</span>
                  </h1>
                  {job.profession && (
                    <p className="text-sm sm:text-base lg:text-lg text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                      {job.profession}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {/* Başvuruldu badge'i sadece iş arayanlar için göster */}
                    {job.hasApplied &&
                      user?.role !== ROLES.EMPLOYER &&
                      user?.role !== "employer" &&
                      user?.role !== "business" && (
                        <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700">
                          ✓ Başvuruldu
                        </Badge>
                      )}
                    {job.type && (
                      <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-0">
                        {job.type}
                      </Badge>
                    )}
                    {job.experience > 0 && (
                      <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0">
                        {job.experience} Yıl Deneyim
                      </Badge>
                    )}
                    {job.hiringCount > 0 && (
                      <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-0">
                        {job.hiringCount} Kişi İşe Alınacak
                      </Badge>
                    )}
                    {job.isPostForDisabledPersons && (
                      <Badge className="inline-flex items-center bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-0 px-3 py-1 text-sm rounded-full">
                        Engelli Bireyler İçin Uygun
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons - Sadece iş arayanlar için göster */}
              {!isEmployer && (
                <div className="flex flex-col gap-3">
                  {/* Başvuru Durumu Badge - Sadece onaylandığında göster */}
                  {applicationStatus === "accepted" && (
                    <Badge className="w-fit bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800 whitespace-nowrap">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Başvuru Onaylandı
                    </Badge>
                  )}
                  <div className="flex flex-row gap-2 sm:gap-3 items-center w-full">
                    {job?.hasApplied === true ? (
                      // Başvuruyu geri çek butonu sadece pending durumunda göster
                      applicationStatus !== "accepted" &&
                      applicationStatus !== "employed" && (
                        <Button
                          onClick={handleWithdrawApplication}
                          size="lg"
                          leftIcon={<XCircle className="w-5 h-5" />}
                          variant="outline"
                          className="flex-1 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-400 dark:hover:border-red-600 px-2 sm:px-4 text-xs sm:text-base whitespace-nowrap overflow-hidden"
                          disabled={
                            withdrawing ||
                            !applicationId ||
                            (actionCooldown && actionCooldown > 0)
                          }
                          loading={withdrawing}
                        >
                          <span className="truncate">
                            {withdrawing
                              ? "Geri Çekiliyor..."
                              : actionCooldown && actionCooldown > 0
                                ? `Bekleyin (${formatCooldownTime(actionCooldown)})`
                                : "Başvuruyu Geri Çek"}
                          </span>
                        </Button>
                      )
                    ) : (
                      <></>
                      // <Button
                      //   onClick={handleApply}
                      //   size="lg"
                      //   leftIcon={isDeadlinePassed ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                      //   className={`flex-1 px-2 sm:px-4 text-xs sm:text-base whitespace-nowrap overflow-hidden ${isDeadlinePassed ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"}`}
                      //   disabled={
                      //     isDeadlinePassed ||
                      //     job?.isShown === false ||
                      //     (actionCooldown && actionCooldown > 0) ||
                      //     (job?.isPostForDisabledPersons &&
                      //       user?.isDisabledPerson !== true)
                      //   }
                      // >
                      //   <span className="truncate">
                      //     {isDeadlinePassed
                      //       ? "Başvuru Tarihi Geçti"
                      //       : actionCooldown && actionCooldown > 0
                      //         ? `Bekleyin (${formatCooldownTime(actionCooldown)})`
                      //         : job?.isShown === false
                      //           ? "Başvuru Kapalı"
                      //           : job?.isPostForDisabledPersons &&
                      //             user?.isDisabledPerson !== true
                      //             ? "Sadece Engelli Bireyler Başvurabilir"
                      //             : "Başvur"}
                      //   </span>
                      // </Button>
                    )}
                    <div className="flex gap-2 sm:gap-3 items-center flex-shrink-0">
                      <Button
                        onClick={toggleFavorite}
                        variant="outline"
                        size="lg"
                        className="px-3 sm:px-4"
                        leftIcon={
                          <Heart
                            className={`w-5 h-5 ${isFavorited ? "fill-current text-red-500" : ""
                              }`}
                          />
                        }
                      />
                      <Button
                        onClick={handleShare}
                        variant="outline"
                        size="lg"
                        className="px-3 sm:px-4"
                        leftIcon={<Share2 className="w-5 h-5" />}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="space-y-4 sm:space-y-6">
            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Konum
                  </div>
                  <div className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {job.location || "Belirtilmemiş"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Başvuru
                  </div>
                  <div className="font-bold text-gray-900 dark:text-gray-100">
                    {job.applicationCount || 0} kişi
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Görüntülenme
                  </div>
                  <div className="font-bold text-gray-900 dark:text-gray-100">
                    {job.viewCount || 0}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Son Başvuru Tarihi
                  </div>
                  <div className="font-bold text-gray-900 dark:text-gray-100">
                    {job.applicationUntilDate
                      ? new Date(job.applicationUntilDate).toLocaleDateString(
                        "tr-TR",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )
                      : "Belirtilmemiş"}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                İş Tanımı
              </h2>
              {job.postDescription || job.description ? (
                <div
                  className="text-gray-700 dark:text-gray-300 leading-relaxed prose prose-sm max-w-none prose-p:first:mt-0 dark:prose-invert"
                  dangerouslySetInnerHTML={{
                    __html: job.postDescription || job.description || "",
                  }}
                />
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  İş tanımı bulunmamaktadır.
                </p>
              )}
            </div>

            {/* Requirements / Qualifications */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Aranan Nitelikler
              </h2>
              {job.qualifications ? (
                <div
                  className="text-gray-700 dark:text-gray-300 leading-relaxed prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{
                    __html: job.qualifications || "",
                  }}
                />
              ) : job.requirements && job.requirements.length > 0 ? (
                <ul className="space-y-3 mb-6">
                  {job.requirements.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  Gereksinim bilgisi bulunmamaktadır.
                </p>
              )}

              {job.niceToHave && job.niceToHave.length > 0 && (
                <>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
                    Artı Olan Nitelikler
                  </h3>
                  <ul className="space-y-3">
                    {job.niceToHave && job.niceToHave.length > 0 ? (
                      job.niceToHave.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5">
                            •
                          </div>
                          <span className="text-gray-600 dark:text-gray-400">
                            {item}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500 dark:text-gray-400">
                        Tercih edilen özellik bilgisi bulunmamaktadır.
                      </li>
                    )}
                  </ul>
                </>
              )}

              {/* Gender and Military Status */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Diğer Gereksinimler
                </h3>
                <div className="space-y-2">
                  {job.genderOption !== null &&
                    job.genderOption !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Cinsiyet:
                        </span>
                        <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0">
                          {job.genderOption === true ? "Erkek" : "Kadın"}
                        </Badge>
                      </div>
                    )}
                  {job.genderOption === null && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Cinsiyet:
                      </span>
                      <Badge className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-0">
                        Farketmiyor
                      </Badge>
                    </div>
                  )}
                  {job.militaryStatus !== null &&
                    job.militaryStatus !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Askerlik Durumu:
                        </span>
                        <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-0">
                          {job.militaryStatus === true
                            ? "Askerliği Yapılmış Olmalı"
                            : "Askerlik Şart Değil"}
                        </Badge>
                      </div>
                    )}
                  {job.militaryStatus === null && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Askerlik Durumu:
                      </span>
                      <Badge className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-0">
                        Belirtilmemiş
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Job Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
                İş Detayları
              </h2>
              <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Çalışma Saatleri */}
                {job.workStartedAt && job.workEndAt && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Çalışma Saatleri
                      </div>
                      <div className="text-gray-900 dark:text-gray-100">
                        {job.workStartedAt} - {job.workEndAt}
                      </div>
                    </div>
                  </div>
                )}

                {/* Haftalık Çalışma Saatleri */}
                {job.weeklyWorkingHours && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Haftalık Çalışma Saatleri
                      </div>
                      <div className="text-gray-900 dark:text-gray-100">
                        {job.weeklyWorkingHours} saat/hafta
                      </div>
                    </div>
                  </div>
                )}

                {/* Yaş Aralığı */}
                {(job.ageMin || job.ageMax) && (
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Yaş Aralığı
                      </div>
                      <div className="text-gray-900 dark:text-gray-100">
                        {job.ageMin && job.ageMax
                          ? `${job.ageMin} - ${job.ageMax} yaş`
                          : job.ageMin
                            ? `Min. ${job.ageMin} yaş`
                            : job.ageMax
                              ? `Max. ${job.ageMax} yaş`
                              : "Belirtilmemiş"}
                      </div>
                    </div>
                  </div>
                )}

                {/* Çalışma Günleri */}
                {job.workDays && job.workDays.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Çalışma Günleri
                      </div>
                      <div className="text-gray-900 dark:text-gray-100">
                        {[...job.workDays]
                          .sort((a, b) => (a.day?.id || a.dayId) - (b.day?.id || b.dayId))
                          .map((wd) => wd.day?.name || wd.name)
                          .join(", ")}
                      </div>
                    </div>
                  </div>
                )}

                {/* Eğitim Seviyeleri */}
                {job.educationLevels && job.educationLevels.length > 0 && (
                  <div className="flex items-start gap-3">
                    <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Eğitim Seviyesi
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {sortEducationLevels(job.educationLevels).map(
                          (edu, idx) => (
                            <Badge
                              key={idx}
                              className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0"
                            >
                              {edu.educationType?.type || edu.type}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Dil Gereksinimleri */}
                {job.languages && job.languages.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Dil Gereksinimleri
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {job.languages.map((lang, idx) => (
                          <Badge
                            key={idx}
                            className="bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-0"
                          >
                            {lang.language?.name || lang.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Ehliyet Gereksinimleri */}
                {job.drivingLisenceRequirements &&
                  job.drivingLisenceRequirements.length > 0 && (
                    <div className="flex items-start gap-3">
                      <Car className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Ehliyet Gereksinimi
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {job.drivingLisenceRequirements.map((dl, idx) => (
                            <Badge
                              key={idx}
                              className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-0"
                            >
                              {dl.drivingLisenceType?.title || dl.title}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                {/* Çalışma Deneyimleri */}
                {job.workingExperiences &&
                  job.workingExperiences.length > 0 && (
                    <div className="flex items-start gap-3">
                      <Award className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Deneyim Seviyesi
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {job.workingExperiences.map((we, idx) => (
                            <Badge
                              key={idx}
                              className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-0"
                            >
                              {we.workingExperience?.name || we.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                {/* Engelli Personel İçin */}
                {job.isPostForDisabledPersons !== undefined && (
                  <div className="flex items-start gap-3">
                    <DisabledJobIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Engelli Bireyler İçin Uygun
                      </div>
                      <div className="text-gray-900 dark:text-gray-100">
                        {job.isPostForDisabledPersons ? "Evet" : "Hayır"}
                      </div>
                    </div>
                  </div>
                )}

                {/* Ön Yazı İsteniyor */}
                {job.coverLetterRequest !== undefined && (
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Ön Yazı
                      </div>
                      <div className="text-gray-900 dark:text-gray-100">
                        {job.coverLetterRequest ? "İsteniyor" : "İstenmiyor"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-blue-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Yan Haklar & Avantajlar
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {job.benefits && job.benefits.length > 0 ? (
                  job.benefits.map((benefit, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800/50 rounded-lg border border-transparent dark:border-gray-700"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                    </div>
                  ))
                ) : job.applicantRights && job.applicantRights.length > 0 ? (
                  job.applicantRights.map((ar, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800/50 rounded-lg border border-transparent dark:border-gray-700"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {ar.applicantRight?.name || ar.name}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 dark:text-gray-400">
                    Yan hak bilgisi bulunmamaktadır.
                  </div>
                )}
              </div>
            </div>

            {/* Apply CTA - Sadece iş arayanlar için göster */}
            {!isEmployer && (
              <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-8 text-center text-white">
                {job?.hasApplied === true ? (
                  <>
                    <h3 className="text-2xl font-bold mb-2">
                      {applicationStatus === "accepted" ||
                        applicationStatus === "employed"
                        ? "Başvurunuz Onaylandı"
                        : "Başvurunuz Yapıldı"}
                    </h3>
                    <p className="text-orange-100 mb-6">
                      {applicationStatus === "accepted" ||
                        applicationStatus === "employed"
                        ? "Tebrikler! Başvurunuz onaylandı. Sizinle iletişime geçilecektir."
                        : "Başvurunuz başarıyla gönderildi. İstediğiniz zaman geri çekebilirsiniz."}
                    </p>
                    {/* Başvuruyu geri çek butonu sadece pending durumunda göster */}
                    {applicationStatus !== "accepted" &&
                      applicationStatus !== "employed" && (
                        <Button
                          onClick={handleWithdrawApplication}
                          size="lg"
                          leftIcon={<XCircle className="w-5 h-5" />}
                          className="bg-white text-red-600 hover:bg-gray-100"
                          disabled={withdrawing || !applicationId}
                          loading={withdrawing}
                        >
                          {withdrawing
                            ? "Geri Çekiliyor..."
                            : "Başvuruyu Geri Çek"}
                        </Button>
                      )}
                  </>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold mb-2">Atim ofisi sizi bilgilendirecektir.</h3>
                    {/* <p className="text-orange-100 mb-6">
                      Bu pozisyon tam size göre olabilir. Fırsatı kaçırmayın!
                    </p>
                    <Button
                      onClick={handleApply}
                      size="lg"
                      leftIcon={<CheckCircle2 className="w-5 h-5" />}
                      className="bg-white text-orange-600 hover:bg-gray-100"
                      disabled={
                        job?.isShown === false ||
                        (job?.isPostForDisabledPersons &&
                          user?.isDisabledPerson !== true) ||
                        isMaleBlockedForFemaleJob
                      }
                    >
                      {job?.isShown === false
                        ? "Başvuru Kapalı"
                        : job?.isPostForDisabledPersons &&
                          user?.isDisabledPerson !== true
                          ? "Sadece Engelli Bireyler Başvurabilir"
                          : isMaleBlockedForFemaleJob
                            ? "Bu İlan Kadın Adaylar İçin"
                          : "Başvuruyu Tamamla"}
                    </Button> */}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <Modal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="Paylaş"
        size="md"
      >
        <div className="space-y-6">
          {/* URL Copy Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İlan Linki
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm"
              />
              <Button
                onClick={handleCopyLink}
                variant={copied ? "success" : "outline"}
                size="md"
                leftIcon={<Copy className="w-4 h-4" />}
              >
                {copied ? "Kopyalandı!" : "Kopyala"}
              </Button>
            </div>
          </div>

          {/* Social Media Share Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Sosyal Medyada Paylaş
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={shareToFacebook}
                variant="outline"
                className="flex items-center justify-center gap-2 h-12"
                leftIcon={<Facebook className="w-5 h-5 text-blue-600" />}
              >
                Facebook
              </Button>
              <Button
                onClick={shareToTwitter}
                variant="outline"
                className="flex items-center justify-center gap-2 h-12"
                leftIcon={<Twitter className="w-5 h-5 text-blue-400" />}
              >
                Twitter
              </Button>
              <Button
                onClick={shareToLinkedIn}
                variant="outline"
                className="flex items-center justify-center gap-2 h-12"
                leftIcon={<Linkedin className="w-5 h-5 text-blue-700" />}
              >
                LinkedIn
              </Button>
              <Button
                onClick={shareToWhatsApp}
                variant="outline"
                className="flex items-center justify-center gap-2 h-12"
                leftIcon={<MessageCircle className="w-5 h-5 text-green-600" />}
              >
                WhatsApp
              </Button>
            </div>
          </div>

          {/* Native Share (if available) */}
          {navigator.share && (
            <div>
              <Button
                onClick={async () => {
                  try {
                    await navigator.share({
                      title: shareTitle,
                      text: shareText,
                      url: shareUrl,
                    });
                    setIsShareModalOpen(false);
                  } catch (err) {
                    if (err?.name !== "AbortError") {
                      console.warn("Paylaşım hatası:", err);
                    }
                  }
                }}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                leftIcon={<Share2 className="w-5 h-5" />}
              >
                Cihaz Paylaşım Menüsünü Aç
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {/* Apply Modal */}
      {/* <Modal
        isOpen={isApplyModalOpen}
        onClose={() => {
          setIsApplyModalOpen(false);
          setCoverLetter("");
        }}
        title="İş Başvurusu"
      >
        <div className="space-y-4">
          {job?.coverLetterRequest && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ön Yazı
              </label>
              <Textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitApplication();
                  }
                }}
                placeholder="Kendiniz hakkında kısa bir ön yazı yazın..."
                rows={6}
                maxLength={1000}
                showCount
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsApplyModalOpen(false);
                setCoverLetter("");
              }}
              disabled={applying}
            >
              İptal
            </Button>
            <Button
              onClick={handleSubmitApplication}
              disabled={applying}
              loading={applying}
              leftIcon={!applying ? <CheckCircle2 className="w-4 h-4" /> : null}
            >
              {applying ? "Gönderiliyor..." : "Başvuruyu Gönder"}
            </Button>
          </div>
        </div>
      </Modal> */}

      {/* Missing Profile Info Modal */}
      <Modal
        isOpen={isMissingInfoModalOpen}
        onClose={() => setIsMissingInfoModalOpen(false)}
        title="Profil Bilgileriniz Eksik"
        size="lg"
      >
        <div className="space-y-5">
          {/* Profile Completion Bar */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Profil Tamamlanma Oranı
              </span>
              <span
                className={`text-lg font-bold ${profileCompletion >= 80
                  ? "text-green-600 dark:text-green-400"
                  : profileCompletion >= 50
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-red-600 dark:text-red-400"
                  }`}
              >
                %{profileCompletion}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${profileCompletion >= 80
                  ? "bg-green-500"
                  : profileCompletion >= 50
                    ? "bg-yellow-500"
                    : "bg-red-500"
                  }`}
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>

          {/* Warning Message */}
          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-300">
              İş başvurusu yapabilmek için aşağıdaki eksik bilgilerinizi
              tamamlamanız gerekmektedir. Eksik bilgileri tamamladıktan sonra
              tekrar başvurabilirsiniz.
            </p>
          </div>

          {/* Missing Requirements by Group */}
          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {getMissingRequirementGroups().map((group) => {
              const GroupIcon = group.icon;
              return (
                <div
                  key={group.label}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-2">
                      <GroupIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {group.label}
                      </span>
                      <Badge className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs border-0">
                        {group.items.length} eksik
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs px-2 py-1 h-auto border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                      onClick={() => {
                        setIsMissingInfoModalOpen(false);
                        navigate(`${ROUTES.PROFILE}?tab=${group.tab}`);
                      }}
                    >
                      Tamamla
                    </Button>
                  </div>
                  <div className="px-4 py-2">
                    <div className="flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <span
                          key={item.key}
                          className="inline-flex items-center gap-1 text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-2 py-1 rounded-md border border-red-100 dark:border-red-800"
                        >
                          <XCircle className="w-3 h-3" />
                          {item.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={() => setIsMissingInfoModalOpen(false)}
              className="flex-1"
            >
              Kapat
            </Button>
            <Button
              onClick={() => {
                setIsMissingInfoModalOpen(false);
                navigate(ROUTES.PROFILE);
              }}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              leftIcon={<User className="w-4 h-4" />}
            >
              Profilimi Tamamla
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default JobDetail;
