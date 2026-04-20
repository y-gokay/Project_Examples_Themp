import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Briefcase,
  Users,
  ArrowRight,
  CheckCircle2,
  Building2,
  Star,
  Shield,
  Clock,
  MapPin,
  Megaphone,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button, Input, Select } from "../components/ui";
import { SEOHead } from "../components/common";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { ROUTES } from "../constants";
import { useAppStore } from "../store";
import heroBackgroundImage from "../assets/atakumun-essiz-sahili.webp";
import heroBackgroundImageNight from "../assets/atakumun-essiz-sahili-gece.webp";
import baskan from "../assets/serhatturkel.webp";
import atim from "../assets/atim1.webp";

const heroBackgroundAlt = "Atakum sahilinde gün doğumunda uzanan şehir silüeti";

const bannerAnnouncements = [
  {
    id: 1,
    tag: "Yeni",
    title: "Lorem ipsum dolor sit amet",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
    link: "",
    cta: "Video'yu izle",
    image: "atakumun-essiz-sahili-gece.webp",
    imageAlt: "Lorem ipsum dolor sit amet",
    /*     video: {
      href: "",
      allowFullscreen: true,
      autoplay: false,
      lazy: true,
      width: 500,
      showText: false,
      showCaptions: false,
    }, */
  },
  {
    id: 2,
    tag: "Yeni",
    title: "Lorem ipsum dolor sit amet",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
    link: "",
    cta: "Video'yu izle",
    image: "atakumun-essiz-sahili.webp",
    imageAlt: "Lorem ipsum dolor sit amet",
    /*     video: {
      href: "",
      allowFullscreen: true,
      autoplay: false,
      lazy: true,
      width: 500,
      showText: false,
      showCaptions: false,
    }, */
  },
];

const HomeBanner = () => {
  const navigate = useNavigate();
  const { updateJobFilters, lookups, getLookups, theme, user } = useAppStore();

  // İşveren mi kontrol et
  const isEmployer =
    user?.role === "employer" ||
    user?.role === "business" ||
    user?.userType === "employer" ||
    user?.userType === "business";
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedWorkingMethod, setSelectedWorkingMethod] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const iframeRef = useRef(null);

  const handleWindowBlur = useCallback(() => {
    if (iframeRef.current && document.activeElement === iframeRef.current) {
      setIsVideoActive(true);
    }
  }, []);

  const handleWindowFocus = useCallback(() => {
    setIsVideoActive(false);
  }, []);

  useEffect(() => {
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    return () => {
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [handleWindowBlur, handleWindowFocus]);

  // Lookup verilerini al
  useEffect(() => {
    getLookups("sectors");
    getLookups("workingMethods");
  }, [getLookups]);

  // Sektör seçenekleri
  const sectorOptions = useMemo(() => {
    const sectors = lookups.sectors || [];
    return [
      { value: "", label: "Tüm Sektörler", disabled: true },
      ...sectors
        .filter((sector) => sector.id) // ID'si olan sektörleri filtrele
        .map((sector) => ({
          value: sector.id?.toString() || "",
          label: sector.title || sector.name || sector.sector || "",
        })),
    ];
  }, [lookups.sectors]);

  // Çalışma yöntemi seçenekleri
  const workingMethodOptions = useMemo(() => {
    const methods = lookups.workingMethods || [];
    return [
      { value: "", label: "Tüm Çalışma Yöntemleri", disabled: true },
      ...methods.map((method) => ({
        value: method.id?.toString() || "",
        label: method.title || method.name || "",
      })),
    ];
  }, [lookups.workingMethods]);

  useEffect(() => {
    if (isHovered || isVideoActive) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bannerAnnouncements.length);
    }, 7000);

    return () => clearInterval(timer);
  }, [isHovered, isVideoActive]);

  useEffect(() => {
    setIsExpanded(false);
  }, [currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? bannerAnnouncements.length - 1 : prev - 1,
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % bannerAnnouncements.length);
  };

  const announcement = bannerAnnouncements[currentIndex];
  const hasLink = Boolean(announcement?.link);

  const MAX_DESC_LENGTH = 100;
  const needsExpansion = announcement?.description?.length > MAX_DESC_LENGTH;
  const displayDescription = isExpanded
    ? announcement?.description
    : announcement?.description?.slice(0, MAX_DESC_LENGTH) +
      (needsExpansion ? "..." : "");

  const handleAnnouncementClick = () => {
    if (hasLink && announcement?.link) {
      window.open(announcement.link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <section className="relative overflow-hidden">
      {/* Hero Background Image */}
      <div className="absolute inset-0">
        <img
          src={
            theme === "dark" ? heroBackgroundImageNight : heroBackgroundImage
          }
          alt={heroBackgroundAlt}
          className="h-full w-full object-cover object-center"
        />
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-indigo-900/80 to-blue-900/70 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-slate-900/85"></div>
        {/* Radial Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,133,0,0.25),transparent_65%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.25),transparent_55%)]"></div>
      </div>
      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-24 pb-20 sm:pb-28 lg:pb-40">
        <div className="grid gap-8 lg:gap-10 lg:grid-cols-[1.25fr,1.1fr] items-stretch">
          {/* Left Column */}
          <div className="text-white space-y-4 sm:space-y-6">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Announcement Badges */}
              <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] uppercase font-semibold">
                <span className="hidden sm:inline">
                  Yeni Nesil İstihdam Platformu
                </span>
                <span className="sm:hidden">Yeni Platform</span>
              </span>
              <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/5 border border-white/10 text-[10px] sm:text-xs uppercase tracking-wide text-blue-100/80">
                <span className="hidden sm:inline">
                  Atakum Belediyesi Destekli
                </span>
                <span className="sm:hidden">Belediye Destekli</span>
              </span>
            </div>

            {/* Hero Title and Description */}
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Atakum'da kariyer yolculuğunu{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r dark:from-blue-300 dark:to-blue-500 from-blue-300 to-blue-500">
                  kolaylaştırıyoruz
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-blue-100/90 max-w-2xl">
                Şehrimizin iş arayanları ile güvenilir işverenlerini tek
                platformda buluşturuyor, belediye destekli programlarla
                kariyerinize hız kazandırıyoruz.
              </p>
            </div>

            {/* Features */}
            <div className="grid gap-4 sm:gap-5 text-blue-100/85">
              {/* Feature 1 */}
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="mt-0.5 sm:mt-1 rounded-xl bg-white/10 p-1.5 sm:p-2 flex-shrink-0">
                  <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white">
                    İş arayanlar için net süreç
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed">
                    Atakum'daki belediye destekli işverenlerden güncel ilanlar;
                    filtreleme ve başvuru adımlarında kolaylık.
                  </p>
                </div>
              </div>
              {/* Feature 2 */}
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="mt-0.5 sm:mt-1 rounded-xl bg-white/10 p-1.5 sm:p-2 flex-shrink-0">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white">
                    Yerel odaklı bağlantılar
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed">
                    Şehirdeki sektör temsilcileriyle aynı platformda buluş,
                    mahalle ve ilçe bazlı filtrelerle sana uygun pozisyonu seç.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-full">
            {/* Announcements Container */}
            <div
              className="relative h-full overflow-hidden rounded-2xl sm:rounded-3xl border border-white/15 bg-white/10 backdrop-blur-2xl p-4 sm:p-5 lg:p-6 shadow-[0px_30px_80px_-30px_rgba(0,0,0,0.6)] flex flex-col transition-all duration-500"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className="absolute -top-24 -right-16 w-56 h-56 bg-gradient-to-br from-blue-500/20 to-purple-600/30 blur-3xl"></div>
              <div className="relative flex h-full flex-col gap-4 sm:gap-6 min-h-[260px] sm:min-h-[300px]">
                {/* Announcements Header */}
                <div className="flex items-center justify-between gap-3 sm:gap-4 text-white">
                  <div>
                    <p className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] text-blue-100/80 mb-1 sm:mb-2">
                      Duyurular
                    </p>
                  </div>
                  {/* Announcements Navigation */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border border-white/20 bg-white/10 hover:bg-white/20 transition"
                      aria-label="Önceki duyuru"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border border-white/20 bg-white/10 hover:bg-white/20 transition"
                      aria-label="Sonraki duyuru"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>

                {/* Announcement Content */}
                <div
                  className={`flex flex-col gap-3 sm:gap-4 text-white ${
                    hasLink ? "cursor-pointer" : ""
                  }`}
                  onClick={hasLink ? handleAnnouncementClick : undefined}
                >
                  {announcement.video ? (
                    <div
                      className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 bg-black/20 w-full"
                      style={{ aspectRatio: "16 / 9" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/60 z-0">
                        <div className="w-10 h-10 border-3 border-white/30 border-t-white/80 rounded-full animate-spin" />
                        <span className="text-xs sm:text-sm">
                          Video yükleniyor...
                        </span>
                      </div>
                      <iframe
                        ref={iframeRef}
                        src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(announcement.video.href)}&width=${announcement.video.width || 500}&height=280&show_text=${announcement.video.showText || false}&show_captions=${announcement.video.showCaptions || false}&autoplay=${announcement.video.autoplay || false}&allowfullscreen=${announcement.video.allowFullscreen || false}&t=0`}
                        className="absolute inset-0 w-full h-full z-10"
                        style={{ border: "none", overflow: "hidden" }}
                        scrolling="no"
                        frameBorder="0"
                        allowFullScreen={announcement.video.allowFullscreen}
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                        loading={announcement.video.lazy ? "lazy" : "eager"}
                        title={announcement.title}
                      />
                    </div>
                  ) : announcement.image ? (
                    <div
                      className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 w-full"
                      style={{ aspectRatio: "16 / 9" }}
                    >
                      <img
                        src={announcement.image}
                        alt={announcement.imageAlt}
                        className="absolute inset-0 w-full h-full object-cover object-center"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 via-slate-900/15 to-transparent"></div>
                    </div>
                  ) : null}

                  <div
                    className="flex flex-col gap-3 sm:gap-4"
                    onClick={hasLink ? (e) => e.stopPropagation() : undefined}
                  >
                    {/* Announcement Title and Description */}
                    <div>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold leading-snug">
                        {announcement.title}
                      </h3>
                      <p className="mt-1 sm:mt-2 text-sm sm:text-base text-blue-100/90 leading-relaxed transition-all duration-300">
                        {displayDescription}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {needsExpansion && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsExpanded(!isExpanded);
                          }}
                          className="inline-flex items-center gap-1.5 sm:gap-2 self-start text-xs sm:text-sm font-semibold text-orange-200 hover:text-orange-100 transition"
                        >
                          {isExpanded ? "Daha az göster" : "Devamını gör"}
                          <ArrowRight
                            className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 ${isExpanded ? "rotate-90" : ""}`}
                          />
                        </button>
                      )}
                      {hasLink && announcement.cta && (
                        <a
                          href={announcement.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 sm:gap-2 self-start text-xs sm:text-sm font-semibold text-orange-200 hover:text-orange-100 transition"
                        >
                          {announcement.cta}
                          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Announcement Indicators */}
                <div className="flex gap-1.5 sm:gap-2 text-white">
                  {bannerAnnouncements.map((item, index) => (
                    <span
                      key={item.id}
                      className={`h-1.5 sm:h-2 w-full rounded-full transition-all duration-300 ${
                        index === currentIndex
                          ? "bg-white"
                          : "bg-white/30 hover:bg-white/60"
                      }`}
                    ></span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Form - İşveren hesabı ile giriş yapıldığında gösterme */}
        {!isEmployer && (
          <div className="relative mt-8 sm:mt-10 lg:mt-12">
            <div className="absolute inset-x-4 -inset-y-3 bg-gradient-to-r from-orange-500/15 via-pink-500/10 to-blue-500/15 blur-3xl opacity-60"></div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // Filtreleri güncelle ve iş ilanları sayfasına yönlendir
                updateJobFilters({
                  search: searchTerm.trim(),
                  districtIds: [],
                  workingMethodIds: selectedWorkingMethod
                    ? [selectedWorkingMethod]
                    : [],
                  sectorIds: selectedSector ? [selectedSector] : [],
                  professionId: "",
                  onlySearchInTitle: false,
                  isForDisabled: false,
                  page: 1,
                  limit: 100,
                });
                navigate(ROUTES.JOBS);
              }}
              className="relative rounded-2xl sm:rounded-3xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
              <div className="grid gap-4 sm:gap-5 px-4 sm:px-6 py-4 sm:py-5 md:py-6 md:grid-cols-[1.4fr,1fr,1fr,auto]">
                <div>
                  <label className="text-[10px] sm:text-xs uppercase font-semibold tracking-[0.15em] sm:tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-2 block">
                    İş Ara
                  </label>
                  <Input
                    size="lg"
                    placeholder="Pozisyon, departman veya anahtar kelime"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    leftIcon={
                      <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500" />
                    }
                    className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-orange-500 focus:ring-orange-500 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="text-[10px] sm:text-xs uppercase font-semibold tracking-[0.15em] sm:tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-2 block">
                    Sektör
                  </label>
                  <Select
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                    options={sectorOptions}
                    className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base py-2.5 sm:py-3"
                  />
                </div>
                <div>
                  <label className="text-[10px] sm:text-xs uppercase font-semibold tracking-[0.15em] sm:tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-2 block">
                    Çalışma Yöntemi
                  </label>
                  <Select
                    value={selectedWorkingMethod}
                    onChange={(e) => setSelectedWorkingMethod(e.target.value)}
                    options={workingMethodOptions}
                    className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500 text-sm sm:text-base py-2.5 sm:py-3"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] sm:text-xs uppercase font-semibold tracking-[0.15em] sm:tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-2 block opacity-0 select-none">
                    Hemen Ara
                  </span>
                  <Button
                    type="submit"
                    size="md"
                    leftIcon={<Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    className="w-full md:w-auto inline-flex items-center justify-center gap-2 sm:gap-3 rounded-lg px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold bg-gradient-to-r md:min-w-[190px] md:h-[52px]"
                  >
                    <span className="hidden sm:inline">Hemen Ara</span>
                    <span className="sm:hidden">Ara</span>
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppStore();

  const benefits = [
    {
      text: "7/24 platform erişimi",
      icon: Clock,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      text: "Ücretsiz CV oluşturma",
      icon: Star,
      color: "text-amber-600 dark:text-amber-400",
    },
    {
      text: "Hızlı ve kolay başvuru",
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      text: "Güvenilir işveren ve çalışan ağı",
      icon: Shield,
      color: "text-purple-600 dark:text-purple-400",
    },
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <SEOHead
        title="Ana Sayfa"
        description="Atakum Belediyesi İstihdam Merkezi (ATİM) ile Samsun Atakum'da iş arayanlar ve işverenler buluşuyor. Ücretsiz iş ilanları, kariyer danışmanlığı ve istihdam desteği."
        path="/"
      />
      <HomeBanner />

      {/* Portal Nasıl İşliyor - 3 Adım */}
      <section className="relative z-10 -mt-6 sm:-mt-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 lg:p-8">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2 text-center">
              İstihdam Merkezi Nasıl İşliyor?
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-4 sm:mb-6 lg:mb-8 text-xs sm:text-sm">
              Atakum Belediyesi İstihdam Merkezi: İş arayan ile işverenin
              buluşma noktası
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-2 sm:mb-3 lg:mb-4 bg-orange-50 dark:bg-orange-900/30 rounded-full flex items-center justify-center group-hover:bg-orange-100 dark:group-hover:bg-orange-900/50 transition-colors duration-300">
                  <Users className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-orange-500 dark:text-orange-400" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2 lg:mb-3">
                  Ücretsiz Üye Olun
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Ücretsiz üye olun ve özgeçmişinizi/ilanınızı kolayca
                  oluşturun. Onaylandıktan sonra hesabınıza erişin.
                </p>
              </div>

              <div className="text-center group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-2 sm:mb-3 lg:mb-4 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors duration-300">
                  <Search className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-500 dark:text-blue-400" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2 lg:mb-3">
                  İş Ara / İlan Ver
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Arama filtrelerini kullanarak size uygun işleri bulun veya
                  işveren olarak kalifiye personel arayın.
                </p>
              </div>

              <div className="text-center group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-2 sm:mb-3 lg:mb-4 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center group-hover:bg-green-100 dark:group-hover:bg-green-900/50 transition-colors duration-300">
                  <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-green-500 dark:text-green-400" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2 lg:mb-3">
                  Başarıya Ulaşın
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Doğru eşleştirme ile hayalinizdeki işe kavuşun veya aradığınız
                  personeli bulun.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative py-12 sm:py-16 lg:py-20 bg-gray-50 dark:bg-gray-800 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full mb-4 sm:mb-6">
                <span className="text-xs sm:text-sm font-semibold">
                  Neden Biz?
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
                İşe Yerleşmenin En Kolay ve Güvenilir Yolu
              </h2>

              <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 mb-6 sm:mb-8">
                Atakum Belediyesi güvencesiyle, iş arama sürecinizi
                kolaylaştırıyoruz.
              </p>

              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      if (benefit.text === "Ücretsiz CV oluşturma") {
                        if (isAuthenticated) {
                          navigate(ROUTES.PROFILE);
                        } else {
                          navigate(ROUTES.REGISTER);
                        }
                      }
                    }}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 lg:p-5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-700 rounded-lg sm:rounded-xl transition-all duration-300 group shadow-sm hover:shadow-md border border-gray-100/50 dark:border-gray-700/50 hover:border-blue-200/50 dark:hover:border-blue-500/50 cursor-pointer"
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-white dark:bg-gray-700 shadow-sm group-hover:scale-110 transition-transform duration-300 ${benefit.color}`}
                    >
                      <benefit.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-sm sm:text-base text-gray-900 dark:text-gray-100 font-semibold group-hover:text-gray-800 dark:group-hover:text-gray-200">
                      {benefit.text}
                    </span>
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 dark:text-green-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block" />
                  </div>
                ))}
              </div>

              <Link to={isAuthenticated ? ROUTES.PROFILE : ROUTES.REGISTER}>
                <Button
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Hemen Başlayın
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>

            {/* Right Image/Stats Card - Mobilde gizli */}
            <div className="relative hidden sm:block">
              {/* Decorative background blur */}
              <div className="absolute -inset-4 bg-gradient-to-br from-blue-600 to-blue-600 rounded-3xl blur-2xl opacity-20"></div>

              <div className="relative bg-gradient-to-br from-blue-700 to-blue-700 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl overflow-hidden">
                <div className="relative space-y-3 sm:space-y-4">
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 border border-white/20 hover:bg-white/20 hover:border-white/40 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 group">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm sm:text-base lg:text-lg font-semibold text-white mb-0.5 sm:mb-1">
                          Güncel ilan bildirimi
                        </div>
                        <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
                          Belediyeye kayıtlı işverenlerin yeni ilanlarından
                          anında haberdar olun.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 hover:border-white/40 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 group">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                        <Building2 className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-white mb-1">
                          Yerel işveren ağı
                        </div>
                        <p className="text-sm text-blue-100 leading-relaxed">
                          Atakum’daki güvenilir şirketlerle doğrudan iletişim
                          kurup başvurularınızı yönetin.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 hover:border-white/40 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 group">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                        <Users className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-white mb-1">
                          İş Verenler için Destek
                        </div>
                        <p className="text-sm text-blue-100 leading-relaxed">
                          İşverenler için destek ekipleri ile iş ilanlarınızı
                          yayınlayın ve mülakatlarınız için destek alın.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Orange Background */}
      {!isAuthenticated && (
        <section className="relative py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white overflow-hidden">
          {/* Enhanced Animated Pattern */}
          {/*           <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzR2LTRoLTJ2NGgtNHYyaDR2NGgydi00aDR2LTJoLTR6bTAtMzBWMGgtMnY0aC00djJoNHY0aDJWNmg0VjRoLTR6TTYgMzR2LTRINHY0SDB2Mmg0djRoMnYtNGg0di0ySDZ6TTYgNFYwSDR2NEgwdjJoNHY0aDJWNmg0VjRINnoiLz48L2c+PC9nPjwvc3ZnPg==')] animate-bg-scroll-medium"></div>
          </div> */}

          {/* Floating Gradient Orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-20 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-10 right-20 w-80 h-80 bg-red-400/20 rounded-full blur-3xl animate-bounce-slow"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-300/10 rounded-full blur-3xl animate-pulse-slow"></div>
          </div>

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
              Özel Sektörde Binlerce İş Fırsatı
            </h2>

            <p className="text-sm sm:text-base lg:text-lg text-orange-100 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Atakum'daki en güncel iş fırsatlarını keşfedin, ücretsiz kariyer
              danışmanlığı alın ve hayalinizdeki işe kavuşun.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link to="/kayit">
                <Button
                  size="lg"
                  className="bg-white text-orange-600 hover:bg-gray-100 border-2 border-white w-full sm:w-auto text-sm sm:text-base"
                >
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  Ücretsiz Kayıt Ol
                </Button>
              </Link>
              <Link to="/isveren/kayit">
                <Button
                  size="lg"
                  className="bg-white text-orange-600 hover:bg-gray-100 border-2 border-white w-full sm:w-auto text-sm sm:text-base"
                >
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  İşveren Kaydı
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer MainLayout'ta zaten var */}
    </div>
  );
};

export default Home;
