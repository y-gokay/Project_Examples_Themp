import {
  useState,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Button,
  Input,
  Select,
  Checkbox,
  Badge,
  Loading,
  EmptyState,
  Pagination,
} from "../../components/ui";
import { useAppStore } from "../../store";
import {
  ROLES,
  ROUTES,
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
} from "../../constants";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Search,
  Filter,
  Building2,
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Star,
  Calendar,
} from "lucide-react";
import DisabledJobIcon from "../../components/common/DisabledJobIcon";
import { SEOHead } from "../../components/common";
import {
  formatDate,
  formatSalaryRange,
  sortEducationLevels,
} from "../../utils/helpers";

const JobList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    jobs,
    jobFilters,
    jobPagination,
    jobsLoading,
    searchJobs,
    updateJobFilters,
    user,
    lookups,
    getLookups,
    getDistrictsByCity,
    searchProfessions,
    getApplications,
    isAuthenticated,
    getJobRecommendations,
  } = useAppStore();

  // Başvuru durumlarını tutmak için state
  const [applicationsMap, setApplicationsMap] = useState({});

  // Sekme state'i - location.state'den gelen activeTab varsa onu kullan
  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || "all",
  );

  // Önerilen işler state'i
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendedPage, setRecommendedPage] = useState(1);
  const RECS_PER_PAGE = 10;

  // İşveren ise kendi ilanlarına yönlendir (render'dan önce kontrol et)
  useLayoutEffect(() => {
    const userRole = user?.role || user?.userType;
    if (
      userRole === ROLES.EMPLOYER ||
      userRole === "employer" ||
      userRole === "business"
    ) {
      navigate(ROUTES.EMPLOYER_MY_JOBS, { replace: true });
    }
  }, [user, navigate]);

  // Lookup verilerini al
  useEffect(() => {
    getLookups("sectors");
    getLookups("workingMethods");
    getLookups("cities");
    getLookups("professions");
    getDistrictsByCity(67);
  }, [getLookups, getDistrictsByCity]);

  // Başvuru durumlarını yükle (sadece iş arayanlar için)
  useEffect(() => {
    const loadApplications = async () => {
      if (
        isAuthenticated &&
        user?.role !== ROLES.EMPLOYER &&
        user?.role !== "employer" &&
        user?.role !== "business"
      ) {
        const result = await getApplications({ page: 1, limit: 100 });
        if (result.success) {
          const apps =
            result.data?.applications ||
            result.data?.items ||
            result.data ||
            [];

          // Başvuruları jobId'ye göre map'le
          const appsMap = {};
          apps.forEach((app) => {
            const jobId = (app.jobPostId || app.jobPost?.id)?.toString();
            if (jobId) {
              let status = "pending";
              if (app.isEmployed) {
                status = "employed";
              } else if (app.isAccepted) {
                status = "accepted";
              } else if (app.isRejected) {
                status = "rejected";
              }
              appsMap[jobId] = status;
            }
          });
          setApplicationsMap(appsMap);
        }
      }
    };

    loadApplications();
  }, [isAuthenticated, user, getApplications]);

  // Çalışma yöntemi seçenekleri (lookup'tan)
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

  // Sektör seçenekleri (lookup'tan)
  const sectorOptions = useMemo(() => {
    const sectors = lookups.sectors || [];
    return [
      { value: "", label: "Tüm Sektörler", disabled: true },
      ...sectors
        .filter((sector) => sector.id)
        .map((sector) => ({
          value: sector.id?.toString() || "",
          label: sector.title || sector.name || sector.sector || "",
        })),
    ];
  }, [lookups.sectors]);

  // İlçe seçenekleri (lookup'tan - Samsun)
  const districtOptions = useMemo(() => {
    const districts = lookups.districts || [];
    const samsunDistricts = districts.filter(
      (d) => d.cityId === 67 || d.city?.id === 67,
    );
    return [
      { value: "", label: "Tüm İlçeler", disabled: true },
      ...samsunDistricts.map((district) => ({
        value: district.id?.toString() || "",
        label: district.title || district.name || "",
      })),
    ];
  }, [lookups.districts]);

  // Meslek arama state
  const [professionSearch, setProfessionSearch] = useState("");
  const [professionOptions, setProfessionOptions] = useState([]);
  const [searchingProfessions, setSearchingProfessions] = useState(false);
  const [showProfessionDropdown, setShowProfessionDropdown] = useState(false);
  const [professionHasMore, setProfessionHasMore] = useState(true);
  const [professionLoadingMore, setProfessionLoadingMore] = useState(false);
  const professionPageRef = useRef(1);
  const professionSearchRef = useRef("");
  const professionDropdownRefMobile = useRef(null);
  const professionDropdownRefDesktop = useRef(null);

  const [searchTerm, setSearchTerm] = useState(jobFilters.search || "");
  const [selectedDistricts, setSelectedDistricts] = useState(
    Array.isArray(jobFilters.districtIds)
      ? jobFilters.districtIds
      : jobFilters.districtIds
        ? [jobFilters.districtIds]
        : [],
  );
  const [selectedWorkingMethods, setSelectedWorkingMethods] = useState(
    Array.isArray(jobFilters.workingMethodIds)
      ? jobFilters.workingMethodIds
      : jobFilters.workingMethodIds
        ? [jobFilters.workingMethodIds]
        : [],
  );
  const [selectedSectors, setSelectedSectors] = useState(
    Array.isArray(jobFilters.sectorIds)
      ? jobFilters.sectorIds
      : jobFilters.sectorIds
        ? [jobFilters.sectorIds]
        : [],
  );
  const [selectedProfessionIds, setSelectedProfessionIds] = useState(
    Array.isArray(jobFilters.professionIds)
      ? jobFilters.professionIds
      : jobFilters.professionIds
        ? [jobFilters.professionIds]
        : jobFilters.professionId
          ? [jobFilters.professionId]
          : [],
  );
  const [selectedProfessionLabels, setSelectedProfessionLabels] = useState({});
  const [loadingProfessionLabels, setLoadingProfessionLabels] = useState(false);
  const [onlySearchInTitle, setOnlySearchInTitle] = useState(
    jobFilters.onlySearchInTitle || false,
  );
  const [isForDisabled, setIsForDisabled] = useState(
    jobFilters.isForDisabled || false,
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDistrictsOpen, setIsDistrictsOpen] = useState(false);
  const [isWorkingMethodsOpen, setIsWorkingMethodsOpen] = useState(false);
  const [isSectorsOpen, setIsSectorsOpen] = useState(false);
  const initialLoadRef = useRef(false);
  const professionSearchTimeoutRef = useRef(null);
  const filtersInitializedRef = useRef(false);
  const filterSearchTimeoutRef = useRef(null);

  useEffect(() => {
    if (initialLoadRef.current) return;
    initialLoadRef.current = true;
    searchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const PROFESSION_PAGE_SIZE = 20;

  // Meslek: Dropdown açıldığında ilk sayfa (search="", page=1)
  const loadProfessionFirstPage = useCallback(() => {
    setShowProfessionDropdown(true);
    setSearchingProfessions(true);
    setProfessionHasMore(true);
    professionPageRef.current = 1;
    professionSearchRef.current = "";
    searchProfessions("", PROFESSION_PAGE_SIZE, 1).then((result) => {
      if (result.success) {
        const options = (result.data || []).map((prof) => ({
          value: prof.id?.toString() || "",
          label: prof.profession || prof.name || prof.title || "",
        }));
        setProfessionOptions(options);
        setProfessionHasMore(
          (result.data || []).length >= PROFESSION_PAGE_SIZE,
        );
      }
      setSearchingProfessions(false);
    });
  }, [searchProfessions]);

  // Meslek: Sonraki sayfa (scroll veya "Daha fazla yükle")
  const loadProfessionMore = useCallback(() => {
    if (professionLoadingMore || !professionHasMore) return;
    setProfessionLoadingMore(true);
    const nextPage = professionPageRef.current + 1;
    const term = professionSearchRef.current;
    searchProfessions(term, PROFESSION_PAGE_SIZE, nextPage).then((result) => {
      if (result.success) {
        const newOptions = (result.data || []).map((prof) => ({
          value: prof.id?.toString() || "",
          label: prof.profession || prof.name || prof.title || "",
        }));
        setProfessionOptions((prev) => [...prev, ...newOptions]);
        setProfessionHasMore(
          (result.data || []).length >= PROFESSION_PAGE_SIZE,
        );
        professionPageRef.current = nextPage;
      }
      setProfessionLoadingMore(false);
    });
  }, [searchProfessions, professionHasMore, professionLoadingMore]);

  // Meslek arama debounce (300ms)
  useEffect(() => {
    if (professionSearchTimeoutRef.current) {
      clearTimeout(professionSearchTimeoutRef.current);
    }

    const term = professionSearch?.trim() ?? "";
    if (term === "") {
      // Kullanıcı sildiyse temizle; açılışta loadFirstPage ile çakışmasın
      if (professionSearchRef.current !== "") {
        setProfessionOptions([]);
        setSearchingProfessions(false);
      }
      professionSearchRef.current = "";
      return;
    }

    setSearchingProfessions(true);
    setShowProfessionDropdown(true);
    professionSearchTimeoutRef.current = setTimeout(async () => {
      professionSearchRef.current = term;
      professionPageRef.current = 1;
      const result = await searchProfessions(term, PROFESSION_PAGE_SIZE, 1);
      if (result.success) {
        const options = (result.data || []).map((prof) => ({
          value: prof.id?.toString() || "",
          label: prof.profession || prof.name || prof.title || "",
        }));
        setProfessionOptions(options);
        setProfessionHasMore(
          (result.data || []).length >= PROFESSION_PAGE_SIZE,
        );
      }
      setSearchingProfessions(false);
    }, 300);

    return () => {
      if (professionSearchTimeoutRef.current) {
        clearTimeout(professionSearchTimeoutRef.current);
      }
    };
  }, [professionSearch, searchProfessions]);

  // Meslek dropdown: dışarı tıklanınca kapat (mobil + desktop)
  useEffect(() => {
    const handleClickOutside = (e) => {
      const inMobile = professionDropdownRefMobile.current?.contains(e.target);
      const inDesktop = professionDropdownRefDesktop.current?.contains(
        e.target,
      );
      if (!inMobile && !inDesktop) {
        setShowProfessionDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Seçili mesleklerin label'larını güncelle
  useEffect(() => {
    if (selectedProfessionIds.length > 0 && professionOptions.length > 0) {
      setSelectedProfessionLabels((prev) => {
        const updated = { ...prev };
        selectedProfessionIds.forEach((id) => {
          if (!updated[id]) {
            const option = professionOptions.find((o) => o.value === id);
            if (option) {
              updated[id] = option.label;
            }
          }
        });
        return updated;
      });
    }
  }, [professionOptions, selectedProfessionIds]);

  // Sayfa yüklendiğinde seçili mesleklerin label'larını kontrol et (sadece eksik olanlar için)
  // localStorage'dan yüklendiği için çoğu zaman bu useEffect çalışmayacak
  useEffect(() => {
    if (selectedProfessionIds.length > 0) {
      // Hangi mesleklerin label'ı eksik kontrol et
      const missingLabels = selectedProfessionIds.filter(
        (id) => !selectedProfessionLabels[id],
      );

      if (missingLabels.length > 0) {
        // Eğer lookup'ta professions yoksa, loading göster
        if (!lookups.professions || lookups.professions.length === 0) {
          setLoadingProfessionLabels(true);
        }

        setSelectedProfessionLabels((prev) => {
          const updated = { ...prev };
          let hasChanges = false;

          selectedProfessionIds.forEach((id) => {
            // Eğer label yoksa, lookup'tan veya professionOptions'tan bul
            if (!updated[id]) {
              // Önce professionOptions'tan kontrol et
              const option = professionOptions.find((o) => o.value === id);
              if (option) {
                updated[id] = option.label;
                hasChanges = true;
              } else if (
                lookups.professions &&
                lookups.professions.length > 0
              ) {
                // Lookup'tan kontrol et
                const profession = lookups.professions.find(
                  (p) => p.id?.toString() === id?.toString(),
                );
                if (profession) {
                  // Meslek adını çıkar
                  let professionName = "Bilinmeyen Meslek";
                  if (profession.profession) {
                    professionName =
                      typeof profession.profession === "string"
                        ? profession.profession
                        : profession.profession.name || "Bilinmeyen Meslek";
                  } else if (profession.name) {
                    professionName = profession.name;
                  } else if (profession.title) {
                    professionName = profession.title;
                  }
                  updated[id] = professionName;
                  hasChanges = true;
                }
              }
            }
          });

          // Eğer tüm label'lar yüklendiyse loading'i kapat
          const allLabelsLoaded = selectedProfessionIds.every(
            (id) => updated[id],
          );
          if (allLabelsLoaded) {
            setLoadingProfessionLabels(false);
          }

          // localStorage'a kaydet
          if (hasChanges) {
            try {
              localStorage.setItem(
                "jobList_professionLabels",
                JSON.stringify(updated),
              );
            } catch (error) {
              console.error("Meslek label'ları kaydetme hatası:", error);
            }
          }

          return hasChanges ? updated : prev;
        });
      } else {
        // Tüm label'lar yüklü, loading'i kapat
        setLoadingProfessionLabels(false);
      }
    } else {
      // Seçili meslek yok, loading'i kapat
      setLoadingProfessionLabels(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProfessionIds, lookups.professions, professionOptions]);

  useEffect(() => {
    setSearchTerm(jobFilters.search || "");
    setSelectedDistricts(
      Array.isArray(jobFilters.districtIds)
        ? jobFilters.districtIds
        : jobFilters.districtIds
          ? [jobFilters.districtIds]
          : [],
    );
    setSelectedWorkingMethods(
      Array.isArray(jobFilters.workingMethodIds)
        ? jobFilters.workingMethodIds
        : jobFilters.workingMethodIds
          ? [jobFilters.workingMethodIds]
          : [],
    );
    setSelectedSectors(
      Array.isArray(jobFilters.sectorIds)
        ? jobFilters.sectorIds
        : jobFilters.sectorIds
          ? [jobFilters.sectorIds]
          : [],
    );
    const professionIds = Array.isArray(jobFilters.professionIds)
      ? jobFilters.professionIds
      : jobFilters.professionIds
        ? [jobFilters.professionIds]
        : jobFilters.professionId
          ? [jobFilters.professionId]
          : [];
    setSelectedProfessionIds(professionIds);

    // localStorage'dan meslek label'larını yükle
    if (professionIds.length > 0) {
      try {
        const savedLabels = localStorage.getItem("jobList_professionLabels");
        if (savedLabels) {
          const parsedLabels = JSON.parse(savedLabels);
          // Sadece seçili mesleklerin label'larını yükle
          const filteredLabels = {};
          professionIds.forEach((id) => {
            if (parsedLabels[id]) {
              filteredLabels[id] = parsedLabels[id];
            }
          });
          if (Object.keys(filteredLabels).length > 0) {
            setSelectedProfessionLabels(filteredLabels);
          }
        }
      } catch (error) {
        console.error("Meslek label'ları yükleme hatası:", error);
      }
    } else {
      setSelectedProfessionLabels({});
    }

    setOnlySearchInTitle(jobFilters.onlySearchInTitle || false);
    setIsForDisabled(jobFilters.isForDisabled || false);
    // İlk yüklemede filtrelerin otomatik arama yapmasını engelle
    filtersInitializedRef.current = true;
  }, [jobFilters]);

  // Filtreler değiştiğinde otomatik olarak arama yap (debounced)
  // Not: searchTerm dependency'de yok çünkü kullanıcı yazarken her karakterde arama yapılmamalı
  // searchTerm sadece Enter'a basıldığında veya "Ara" butonuna basıldığında kullanılmalı
  useEffect(() => {
    // İlk yüklemede çalışmasın
    if (!filtersInitializedRef.current) {
      return;
    }

    // Önceki timeout'u temizle
    if (filterSearchTimeoutRef.current) {
      clearTimeout(filterSearchTimeoutRef.current);
    }

    // Debounce: 500ms bekle, sonra arama yap
    filterSearchTimeoutRef.current = setTimeout(() => {
      const payload = {
        ...jobFilters,
        search: searchTerm.trim(),
        districtIds: selectedDistricts,
        workingMethodIds: selectedWorkingMethods,
        sectorIds: selectedSectors,
        professionIds: selectedProfessionIds,
        onlySearchInTitle,
        isForDisabled,
        page: 1,
      };
      updateJobFilters(payload);
      searchJobs(payload);
    }, 500);

    return () => {
      if (filterSearchTimeoutRef.current) {
        clearTimeout(filterSearchTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedDistricts,
    selectedWorkingMethods,
    selectedSectors,
    selectedProfessionIds,
    onlySearchInTitle,
    isForDisabled,
  ]);

  const handleApplyFilters = () => {
    const payload = {
      ...jobFilters,
      search: searchTerm.trim(),
      districtIds: selectedDistricts,
      workingMethodIds: selectedWorkingMethods,
      sectorIds: selectedSectors,
      professionIds: selectedProfessionIds,
      onlySearchInTitle,
      isForDisabled,
      page: 1,
    };
    updateJobFilters(payload);
    searchJobs(payload);
  };

  const handleResetFilters = () => {
    const payload = {
      ...jobFilters,
      search: "",
      districtIds: [],
      workingMethodIds: [],
      sectorIds: [],
      professionIds: [],
      onlySearchInTitle: false,
      isForDisabled: false,
      page: 1,
    };
    setSearchTerm("");
    setSelectedDistricts([]);
    setSelectedWorkingMethods([]);
    setSelectedSectors([]);
    setSelectedProfessionIds([]);
    setSelectedProfessionLabels({});
    // localStorage'dan da temizle
    try {
      localStorage.removeItem("jobList_professionLabels");
    } catch (error) {
      console.error("Meslek label'ları temizleme hatası:", error);
    }
    setProfessionSearch("");
    setOnlySearchInTitle(false);
    setIsForDisabled(false);
    updateJobFilters(payload);
    searchJobs(payload);
  };

  const handlePageChange = (page) => {
    const payload = { ...jobFilters, page };
    updateJobFilters(payload);
    searchJobs(payload);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Önerilen işleri yükle
  const loadRecommendedJobs = async () => {
    if (!isAuthenticated || !user) {
      setRecommendedJobs([]);
      return;
    }

    setLoadingRecommendations(true);
    try {
      const result = await getJobRecommendations();
      if (result.success && result.data) {
        const recommendations = result.data?.recommendations || [];

        // API response'unu frontend formatına dönüştür (Tüm İlanlar formatıyla uyumlu)
        const normalizedJobs = recommendations.map((rec) => {
          // workingMethod bir obje olabilir, title'ı al
          let workingMethodTitle = "";
          if (rec.workingMethod) {
            if (typeof rec.workingMethod === "string") {
              workingMethodTitle = rec.workingMethod;
            } else if (rec.workingMethod.title) {
              workingMethodTitle = rec.workingMethod.title;
            }
          }

          // Districts'i location string'ine çevir
          const location =
            rec.districts
              ?.map((d) => d.district?.title || d.title)
              .join(", ") || "";

          return {
            id: rec.id,
            title: rec.postTitle || "",
            description: rec.postDescription || "",
            qualifications: rec.qualifications || "",
            company: {
              name: rec.business?.businessName || "",
              logo: rec.business?.businessPicture || null,
            },
            location: location,
            type: workingMethodTitle,
            workModel: workingMethodTitle,
            profession: rec.professions?.profession || "",
            matchScore: rec.score || 0,
            breakdown: rec.breakdown,
            isPostForDisabledPersons: rec.isPostForDisabledPersons || false,
            educationLevels: rec.educationLevels || [],
            languages: rec.languages || [],
            createdAt: rec.createdAt,
            // Uyumluluk için ek alanlar
            salary_min: null,
            salary_max: null,
            sector: null,
            is_featured: false,
            is_urgent: false,
            hasApplied: false,
          };
        });

        setRecommendedJobs(normalizedJobs);
      } else {
        setRecommendedJobs([]);
      }
    } catch (err) {
      console.error("Error loading recommended jobs:", err);
      setRecommendedJobs([]);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  // Sekme değiştiğinde önerileri yükle
  useEffect(() => {
    if (activeTab === "recommendations" && isAuthenticated && user) {
      loadRecommendedJobs();
    }
  }, [activeTab, isAuthenticated, user]);

  return (
    <div className="flex flex-col">
      <SEOHead
        title="İş İlanları"
        description="Samsun Atakum'daki güncel iş ilanlarını keşfedin. Tam zamanlı, yarı zamanlı ve uzaktan çalışma fırsatları ATİM'de sizi bekliyor."
        path="/ilanlar"
      />
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-16 pb-32 sm:pt-16 sm:pb-40 lg:pt-16 lg:pb-48">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                İş İlanları
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl">
                Atakum ve Samsun genelindeki güncel iş fırsatlarını filtreleyin,
                size en uygun ilanları hemen keşfedin.
              </p>
            </div>
            {/* Mobile Filter Button - Sadece "Tüm İlanlar" sekmesinde göster */}
            {activeTab === "all" && (
              <button
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filtreler</span>
              </button>
            )}
          </div>

          {/* Sekmeler */}
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 mb-6">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === "all"
                ? "border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
            >
              <Briefcase className="w-4 h-4 inline-block mr-2" />
              Tüm İlanlar
            </button>
            {isAuthenticated && user && (
              <button
                onClick={() => setActiveTab("recommendations")}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === "recommendations"
                  ? "border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
              >
                <Star className="w-4 h-4 inline-block mr-2" />
                Size Özel Öneriler
              </button>
            )}
          </div>
        </div>

        <div
          className={`grid gap-6 lg:gap-8 ${activeTab === "all" ? "lg:grid-cols-[300px,1fr]" : ""}`}
        >
          {/* Filters - Mobile Overlay - Sadece "Tüm İlanlar" sekmesinde göster */}
          {activeTab === "all" && isFilterOpen && (
            <div
              className="lg:hidden fixed inset-0 z-50 bg-black/50 dark:bg-black/70"
              onClick={() => setIsFilterOpen(false)}
            >
              <aside
                className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-800 shadow-xl overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between z-10">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Filtreler
                  </h2>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
                <div className="p-4 space-y-5">
                  {/* Aktif Filtreler - Mobil */}
                  {(selectedDistricts.length > 0 ||
                    selectedWorkingMethods.length > 0 ||
                    selectedSectors.length > 0 ||
                    selectedProfessionIds.length > 0 ||
                    onlySearchInTitle ||
                    isForDisabled ||
                    searchTerm.trim()) && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                            Aktif Filtreler
                          </span>
                          <button
                            onClick={handleResetFilters}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline"
                          >
                            Tümünü Temizle
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {/* Arama Terimi */}
                          {searchTerm.trim() && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-full border border-gray-200 dark:border-gray-600">
                              <Search className="w-3 h-3" />
                              {searchTerm.length > 15
                                ? searchTerm.slice(0, 15) + "..."
                                : searchTerm}
                              <button
                                onClick={() => {
                                  setSearchTerm("");
                                  const payload = {
                                    ...jobFilters,
                                    search: "",
                                    page: 1,
                                  };
                                  updateJobFilters(payload);
                                  searchJobs(payload);
                                }}
                                className="ml-0.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          )}
                          {/* Meslekler */}
                          {selectedProfessionIds.map((professionId) => (
                            <span
                              key={`mob-prof-${professionId}`}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-full border border-gray-200 dark:border-gray-600"
                            >
                              <Briefcase className="w-3 h-3" />
                              {(
                                selectedProfessionLabels[professionId] || "Meslek"
                              ).length > 12
                                ? (
                                  selectedProfessionLabels[professionId] ||
                                  "Meslek"
                                ).slice(0, 12) + "..."
                                : selectedProfessionLabels[professionId] ||
                                "Meslek"}
                              <button
                                onClick={() => {
                                  setSelectedProfessionIds(
                                    selectedProfessionIds.filter(
                                      (id) => id !== professionId,
                                    ),
                                  );
                                  setSelectedProfessionLabels((prev) => {
                                    const newLabels = { ...prev };
                                    delete newLabels[professionId];
                                    try {
                                      localStorage.setItem(
                                        "jobList_professionLabels",
                                        JSON.stringify(newLabels),
                                      );
                                    } catch (error) {
                                      console.error(
                                        "Meslek label'ları kaydetme hatası:",
                                        error,
                                      );
                                    }
                                    return newLabels;
                                  });
                                }}
                                className="ml-0.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                          {/* İlçeler */}
                          {selectedDistricts.map((districtId) => {
                            const district = districtOptions.find(
                              (d) => d.value === districtId,
                            );
                            return (
                              <span
                                key={`mob-dist-${districtId}`}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-full border border-gray-200 dark:border-gray-600"
                              >
                                <MapPin className="w-3 h-3" />
                                {district?.label || "İlçe"}
                                <button
                                  onClick={() => {
                                    setSelectedDistricts(
                                      selectedDistricts.filter(
                                        (id) => id !== districtId,
                                      ),
                                    );
                                  }}
                                  className="ml-0.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            );
                          })}
                          {/* Çalışma Yöntemleri */}
                          {selectedWorkingMethods.map((methodId) => {
                            const method = workingMethodOptions.find(
                              (m) => m.value === methodId,
                            );
                            return (
                              <span
                                key={`mob-method-${methodId}`}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-full border border-gray-200 dark:border-gray-600"
                              >
                                <Clock className="w-3 h-3" />
                                {method?.label || "Çalışma Yöntemi"}
                                <button
                                  onClick={() => {
                                    setSelectedWorkingMethods(
                                      selectedWorkingMethods.filter(
                                        (id) => id !== methodId,
                                      ),
                                    );
                                  }}
                                  className="ml-0.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            );
                          })}
                          {/* Sektörler */}
                          {selectedSectors.map((sectorId) => {
                            const sector = sectorOptions.find(
                              (s) => s.value === sectorId,
                            );
                            return (
                              <span
                                key={`mob-sector-${sectorId}`}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-full border border-gray-200 dark:border-gray-600"
                              >
                                <Building2 className="w-3 h-3" />
                                {(sector?.label || "Sektör").length > 12
                                  ? (sector?.label || "Sektör").slice(0, 12) +
                                  "..."
                                  : sector?.label || "Sektör"}
                                <button
                                  onClick={() => {
                                    setSelectedSectors(
                                      selectedSectors.filter(
                                        (id) => id !== sectorId,
                                      ),
                                    );
                                  }}
                                  className="ml-0.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            );
                          })}
                          {/* Sadece Başlıkta Ara */}
                          {onlySearchInTitle && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-full border border-gray-200 dark:border-gray-600">
                              Sadece başlıkta
                              <button
                                onClick={() => setOnlySearchInTitle(false)}
                                className="ml-0.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          )}
                          {/* Engelli Personel İçin */}
                          {isForDisabled && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-full border border-gray-200 dark:border-gray-600">
                              Engelli için
                              <button
                                onClick={() => setIsForDisabled(false)}
                                className="ml-0.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                  <Input
                    size="md"
                    label="Pozisyon veya Anahtar Kelime"
                    placeholder="Örn: Kasiyer, Şoför, Temizlik"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleApplyFilters();
                        setIsFilterOpen(false);
                      }
                    }}
                    leftIcon={<Briefcase className="w-4 h-4" />}
                  />

                  <div ref={professionDropdownRefMobile}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meslek
                    </label>
                    <Input
                      size="md"
                      placeholder="Meslek ara..."
                      value={professionSearch}
                      onChange={(e) => setProfessionSearch(e.target.value)}
                      onFocus={() => {
                        if (!professionSearch?.trim())
                          loadProfessionFirstPage();
                      }}
                      leftIcon={<Briefcase className="w-4 h-4" />}
                    />
                    {showProfessionDropdown && (
                      <div
                        className="mt-2 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
                        onScroll={(e) => {
                          const el = e.target;
                          if (
                            professionHasMore &&
                            !professionLoadingMore &&
                            !searchingProfessions &&
                            el.scrollTop + el.clientHeight >=
                            el.scrollHeight - 20
                          ) {
                            loadProfessionMore();
                          }
                        }}
                      >
                        {searchingProfessions ? (
                          <div className="p-2 text-sm text-gray-500 dark:text-gray-400">
                            Aranıyor...
                          </div>
                        ) : professionOptions.length > 0 ? (
                          <>
                            {professionOptions.map((option) => {
                              const isSelected = selectedProfessionIds.includes(
                                option.value,
                              );
                              return (
                                <div
                                  key={option.value}
                                  className={`p-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex items-center justify-between ${isSelected
                                    ? "bg-blue-50 dark:bg-blue-900/30"
                                    : ""
                                    }`}
                                  onClick={() => {
                                    if (isSelected) {
                                      // Mesleği kaldır
                                      setSelectedProfessionIds(
                                        selectedProfessionIds.filter(
                                          (id) => id !== option.value,
                                        ),
                                      );
                                      setSelectedProfessionLabels((prev) => {
                                        const newLabels = { ...prev };
                                        delete newLabels[option.value];
                                        // localStorage'a kaydet
                                        try {
                                          localStorage.setItem(
                                            "jobList_professionLabels",
                                            JSON.stringify(newLabels),
                                          );
                                        } catch (error) {
                                          console.error(
                                            "Meslek label'ları kaydetme hatası:",
                                            error,
                                          );
                                        }
                                        return newLabels;
                                      });
                                    } else {
                                      // Mesleği ekle
                                      setSelectedProfessionIds([
                                        ...selectedProfessionIds,
                                        option.value,
                                      ]);
                                      setSelectedProfessionLabels((prev) => {
                                        const newLabels = {
                                          ...prev,
                                          [option.value]: option.label,
                                        };
                                        // localStorage'a kaydet
                                        try {
                                          localStorage.setItem(
                                            "jobList_professionLabels",
                                            JSON.stringify(newLabels),
                                          );
                                        } catch (error) {
                                          console.error(
                                            "Meslek label'ları kaydetme hatası:",
                                            error,
                                          );
                                        }
                                        return newLabels;
                                      });
                                    }
                                    setProfessionSearch("");
                                    setProfessionOptions([]);
                                    setShowProfessionDropdown(false);
                                  }}
                                >
                                  <span>{option.label}</span>
                                  {isSelected && (
                                    <span className="text-blue-600 text-sm">
                                      ✓
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                            {professionHasMore && (
                              <div className="border-t border-gray-200 dark:border-gray-600 p-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  onClick={loadProfessionMore}
                                  disabled={professionLoadingMore}
                                >
                                  {professionLoadingMore
                                    ? "Yükleniyor..."
                                    : "Daha fazla yükle"}
                                </Button>
                              </div>
                            )}
                          </>
                        ) : !searchingProfessions ? (
                          <div className="p-2 text-sm text-gray-500 dark:text-gray-400">
                            {professionSearch?.trim()
                              ? "Sonuç bulunamadı"
                              : "Meslek ara veya listeden seçin"}
                          </div>
                        ) : null}
                      </div>
                    )}
                    {selectedProfessionIds.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedProfessionIds.map((professionId) => (
                          <span
                            key={professionId}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                          >
                            {loadingProfessionLabels &&
                              !selectedProfessionLabels[professionId] &&
                              !professionOptions.find(
                                (o) => o.value === professionId,
                              )?.label ? (
                              <span className="inline-flex items-center gap-1">
                                <Loading size="xs" />
                                <span className="text-xs">Yükleniyor...</span>
                              </span>
                            ) : (
                              selectedProfessionLabels[professionId] ||
                              professionOptions.find(
                                (o) => o.value === professionId,
                              )?.label ||
                              "Seçili meslek"
                            )}
                            <button
                              onClick={() => {
                                setSelectedProfessionIds(
                                  selectedProfessionIds.filter(
                                    (id) => id !== professionId,
                                  ),
                                );
                                setSelectedProfessionLabels((prev) => {
                                  const newLabels = { ...prev };
                                  delete newLabels[professionId];
                                  // localStorage'a kaydet
                                  try {
                                    localStorage.setItem(
                                      "jobList_professionLabels",
                                      JSON.stringify(newLabels),
                                    );
                                  } catch (error) {
                                    console.error(
                                      "Meslek label'ları kaydetme hatası:",
                                      error,
                                    );
                                  }
                                  return newLabels;
                                });
                              }}
                              className="text-blue-600 hover:text-blue-800 ml-1"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* İlçe Accordion */}
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <button
                      type="button"
                      onClick={() => setIsDistrictsOpen(!isDistrictsOpen)}
                      className="w-full flex items-center justify-between text-left mb-2"
                    >
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        İlçe
                        {selectedDistricts.length > 0 && (
                          <span className="ml-2 text-xs font-normal text-blue-600 dark:text-blue-400">
                            ({selectedDistricts.length})
                          </span>
                        )}
                      </label>
                      {isDistrictsOpen ? (
                        <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      )}
                    </button>
                    {isDistrictsOpen && (
                      <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2 space-y-2 bg-white dark:bg-gray-900">
                        {districtOptions.slice(1).map((option) => (
                          <Checkbox
                            key={option.value}
                            label={option.label}
                            checked={selectedDistricts.includes(option.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDistricts([
                                  ...selectedDistricts,
                                  option.value,
                                ]);
                              } else {
                                setSelectedDistricts(
                                  selectedDistricts.filter(
                                    (id) => id !== option.value,
                                  ),
                                );
                              }
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Çalışma Yöntemi Accordion */}
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <button
                      type="button"
                      onClick={() =>
                        setIsWorkingMethodsOpen(!isWorkingMethodsOpen)
                      }
                      className="w-full flex items-center justify-between text-left mb-2"
                    >
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Çalışma Yöntemi
                        {selectedWorkingMethods.length > 0 && (
                          <span className="ml-2 text-xs font-normal text-blue-600 dark:text-blue-400">
                            ({selectedWorkingMethods.length})
                          </span>
                        )}
                      </label>
                      {isWorkingMethodsOpen ? (
                        <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      )}
                    </button>
                    {isWorkingMethodsOpen && (
                      <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2 space-y-2 bg-white dark:bg-gray-900">
                        {workingMethodOptions.slice(1).map((option) => (
                          <Checkbox
                            key={option.value}
                            label={option.label}
                            checked={selectedWorkingMethods.includes(
                              option.value,
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedWorkingMethods([
                                  ...selectedWorkingMethods,
                                  option.value,
                                ]);
                              } else {
                                setSelectedWorkingMethods(
                                  selectedWorkingMethods.filter(
                                    (id) => id !== option.value,
                                  ),
                                );
                              }
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Sektör Accordion */}
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <button
                      type="button"
                      onClick={() => setIsSectorsOpen(!isSectorsOpen)}
                      className="w-full flex items-center justify-between text-left mb-2"
                    >
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Sektör
                        {selectedSectors.length > 0 && (
                          <span className="ml-2 text-xs font-normal text-blue-600 dark:text-blue-400">
                            ({selectedSectors.length})
                          </span>
                        )}
                      </label>
                      {isSectorsOpen ? (
                        <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      )}
                    </button>
                    {isSectorsOpen && (
                      <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2 space-y-2 bg-white dark:bg-gray-900">
                        {sectorOptions.slice(1).map((option) => (
                          <Checkbox
                            key={option.value}
                            label={option.label}
                            checked={selectedSectors.includes(option.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSectors([
                                  ...selectedSectors,
                                  option.value,
                                ]);
                              } else {
                                setSelectedSectors(
                                  selectedSectors.filter(
                                    (id) => id !== option.value,
                                  ),
                                );
                              }
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 pt-1">
                    <Checkbox
                      label="Sadece başlıkta ara"
                      checked={onlySearchInTitle}
                      onChange={(e) => setOnlySearchInTitle(e.target.checked)}
                    />
                    <Checkbox
                      label="Engelli personel için"
                      checked={isForDisabled}
                      onChange={(e) => setIsForDisabled(e.target.checked)}
                    />
                  </div>

                  <div className="flex flex-col gap-3 pt-4">
                    <Button
                      onClick={() => {
                        handleApplyFilters();
                        setIsFilterOpen(false);
                      }}
                      className="gap-2"
                    >
                      Filtreleri Uygula
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleResetFilters();
                        setIsFilterOpen(false);
                      }}
                    >
                      Filtreleri Temizle
                    </Button>
                  </div>
                </div>
              </aside>
            </div>
          )}

          {/* Filters - Desktop Sidebar - Sadece "Tüm İlanlar" sekmesinde göster */}
          {activeTab === "all" && (
            <aside className="hidden lg:block space-y-6 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-2">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Filtreler
                  </h2>
                </div>

                {/* Aktif Filtreler - Hızlı Kaldırma */}
                {(selectedDistricts.length > 0 ||
                  selectedWorkingMethods.length > 0 ||
                  selectedSectors.length > 0 ||
                  selectedProfessionIds.length > 0 ||
                  onlySearchInTitle ||
                  isForDisabled ||
                  searchTerm.trim()) && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                          Aktif Filtreler
                        </span>
                        <button
                          onClick={handleResetFilters}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline"
                        >
                          Tümünü Temizle
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {/* Arama Terimi */}
                        {searchTerm.trim() && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-full border border-gray-200 dark:border-gray-600">
                            <Search className="w-3 h-3" />
                            {searchTerm.length > 15
                              ? searchTerm.slice(0, 15) + "..."
                              : searchTerm}
                            <button
                              onClick={() => {
                                setSearchTerm("");
                                const payload = {
                                  ...jobFilters,
                                  search: "",
                                  page: 1,
                                };
                                updateJobFilters(payload);
                                searchJobs(payload);
                              }}
                              className="ml-0.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        )}
                        {/* Meslekler */}
                        {selectedProfessionIds.map((professionId) => (
                          <span
                            key={`prof-${professionId}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-full border border-gray-200 dark:border-gray-600"
                          >
                            <Briefcase className="w-3 h-3" />
                            {(selectedProfessionLabels[professionId] || "Meslek")
                              .length > 12
                              ? (
                                selectedProfessionLabels[professionId] ||
                                "Meslek"
                              ).slice(0, 12) + "..."
                              : selectedProfessionLabels[professionId] ||
                              "Meslek"}
                            <button
                              onClick={() => {
                                setSelectedProfessionIds(
                                  selectedProfessionIds.filter(
                                    (id) => id !== professionId,
                                  ),
                                );
                                setSelectedProfessionLabels((prev) => {
                                  const newLabels = { ...prev };
                                  delete newLabels[professionId];
                                  try {
                                    localStorage.setItem(
                                      "jobList_professionLabels",
                                      JSON.stringify(newLabels),
                                    );
                                  } catch (error) {
                                    console.error(
                                      "Meslek label'ları kaydetme hatası:",
                                      error,
                                    );
                                  }
                                  return newLabels;
                                });
                              }}
                              className="ml-0.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                        {/* İlçeler */}
                        {selectedDistricts.map((districtId) => {
                          const district = districtOptions.find(
                            (d) => d.value === districtId,
                          );
                          return (
                            <span
                              key={`dist-${districtId}`}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-full border border-gray-200 dark:border-gray-600"
                            >
                              <MapPin className="w-3 h-3" />
                              {district?.label || "İlçe"}
                              <button
                                onClick={() => {
                                  setSelectedDistricts(
                                    selectedDistricts.filter(
                                      (id) => id !== districtId,
                                    ),
                                  );
                                }}
                                className="ml-0.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          );
                        })}
                        {/* Çalışma Yöntemleri */}
                        {selectedWorkingMethods.map((methodId) => {
                          const method = workingMethodOptions.find(
                            (m) => m.value === methodId,
                          );
                          return (
                            <span
                              key={`method-${methodId}`}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-full border border-gray-200 dark:border-gray-600"
                            >
                              <Clock className="w-3 h-3" />
                              {method?.label || "Çalışma Yöntemi"}
                              <button
                                onClick={() => {
                                  setSelectedWorkingMethods(
                                    selectedWorkingMethods.filter(
                                      (id) => id !== methodId,
                                    ),
                                  );
                                }}
                                className="ml-0.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          );
                        })}
                        {/* Sektörler */}
                        {selectedSectors.map((sectorId) => {
                          const sector = sectorOptions.find(
                            (s) => s.value === sectorId,
                          );
                          return (
                            <span
                              key={`sector-${sectorId}`}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-full border border-gray-200 dark:border-gray-600"
                            >
                              <Building2 className="w-3 h-3" />
                              {(sector?.label || "Sektör").length > 12
                                ? (sector?.label || "Sektör").slice(0, 12) + "..."
                                : sector?.label || "Sektör"}
                              <button
                                onClick={() => {
                                  setSelectedSectors(
                                    selectedSectors.filter(
                                      (id) => id !== sectorId,
                                    ),
                                  );
                                }}
                                className="ml-0.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          );
                        })}
                        {/* Sadece Başlıkta Ara */}
                        {onlySearchInTitle && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-full border border-gray-200 dark:border-gray-600">
                            Sadece başlıkta
                            <button
                              onClick={() => setOnlySearchInTitle(false)}
                              className="ml-0.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        )}
                        {/* Engelli Personel İçin */}
                        {isForDisabled && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-full border border-gray-200 dark:border-gray-600">
                            Engelli için
                            <button
                              onClick={() => setIsForDisabled(false)}
                              className="ml-0.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                <div className="space-y-5">
                  <Input
                    size="md"
                    label="Pozisyon veya Anahtar Kelime"
                    placeholder="Örn: Kasiyer, Şoför, Temizlik"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleApplyFilters();
                      }
                    }}
                    leftIcon={<Briefcase className="w-4 h-4" />}
                  />

                  <div ref={professionDropdownRefDesktop}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Meslek
                    </label>
                    <Input
                      size="md"
                      placeholder="Meslek ara..."
                      value={professionSearch}
                      onChange={(e) => setProfessionSearch(e.target.value)}
                      onFocus={() => {
                        if (!professionSearch?.trim())
                          loadProfessionFirstPage();
                      }}
                      leftIcon={<Briefcase className="w-4 h-4" />}
                    />
                    {showProfessionDropdown && (
                      <div
                        className="mt-2 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
                        onScroll={(e) => {
                          const el = e.target;
                          if (
                            professionHasMore &&
                            !professionLoadingMore &&
                            !searchingProfessions &&
                            el.scrollTop + el.clientHeight >=
                            el.scrollHeight - 20
                          ) {
                            loadProfessionMore();
                          }
                        }}
                      >
                        {searchingProfessions ? (
                          <div className="p-2 text-sm text-gray-500 dark:text-gray-400">
                            Aranıyor...
                          </div>
                        ) : professionOptions.length > 0 ? (
                          <>
                            {professionOptions.map((option) => {
                              const isSelected = selectedProfessionIds.includes(
                                option.value,
                              );
                              return (
                                <div
                                  key={option.value}
                                  className={`p-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex items-center justify-between ${isSelected
                                    ? "bg-blue-50 dark:bg-blue-900/30"
                                    : ""
                                    }`}
                                  onClick={() => {
                                    if (isSelected) {
                                      // Mesleği kaldır
                                      setSelectedProfessionIds(
                                        selectedProfessionIds.filter(
                                          (id) => id !== option.value,
                                        ),
                                      );
                                      setSelectedProfessionLabels((prev) => {
                                        const newLabels = { ...prev };
                                        delete newLabels[option.value];
                                        // localStorage'a kaydet
                                        try {
                                          localStorage.setItem(
                                            "jobList_professionLabels",
                                            JSON.stringify(newLabels),
                                          );
                                        } catch (error) {
                                          console.error(
                                            "Meslek label'ları kaydetme hatası:",
                                            error,
                                          );
                                        }
                                        return newLabels;
                                      });
                                    } else {
                                      // Mesleği ekle
                                      setSelectedProfessionIds([
                                        ...selectedProfessionIds,
                                        option.value,
                                      ]);
                                      setSelectedProfessionLabels((prev) => {
                                        const newLabels = {
                                          ...prev,
                                          [option.value]: option.label,
                                        };
                                        // localStorage'a kaydet
                                        try {
                                          localStorage.setItem(
                                            "jobList_professionLabels",
                                            JSON.stringify(newLabels),
                                          );
                                        } catch (error) {
                                          console.error(
                                            "Meslek label'ları kaydetme hatası:",
                                            error,
                                          );
                                        }
                                        return newLabels;
                                      });
                                    }
                                    setProfessionSearch("");
                                    setProfessionOptions([]);
                                    setShowProfessionDropdown(false);
                                  }}
                                >
                                  <span className="text-gray-900 dark:text-gray-100">
                                    {option.label}
                                  </span>
                                  {isSelected && (
                                    <span className="text-blue-600 dark:text-blue-400 text-sm">
                                      ✓
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                            {professionHasMore && (
                              <div className="border-t border-gray-200 dark:border-gray-600 p-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  onClick={loadProfessionMore}
                                  disabled={professionLoadingMore}
                                >
                                  {professionLoadingMore
                                    ? "Yükleniyor..."
                                    : "Daha fazla yükle"}
                                </Button>
                              </div>
                            )}
                          </>
                        ) : !searchingProfessions ? (
                          <div className="p-2 text-sm text-gray-500 dark:text-gray-400">
                            {professionSearch?.trim()
                              ? "Sonuç bulunamadı"
                              : "Meslek ara veya listeden seçin"}
                          </div>
                        ) : null}
                      </div>
                    )}
                    {selectedProfessionIds.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedProfessionIds.map((professionId) => (
                          <span
                            key={professionId}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded-full"
                          >
                            {loadingProfessionLabels &&
                              !selectedProfessionLabels[professionId] &&
                              !professionOptions.find(
                                (o) => o.value === professionId,
                              )?.label ? (
                              <span className="inline-flex items-center gap-1">
                                <Loading size="xs" />
                                <span className="text-xs">Yükleniyor...</span>
                              </span>
                            ) : (
                              selectedProfessionLabels[professionId] ||
                              professionOptions.find(
                                (o) => o.value === professionId,
                              )?.label ||
                              "Seçili meslek"
                            )}
                            <button
                              onClick={() => {
                                setSelectedProfessionIds(
                                  selectedProfessionIds.filter(
                                    (id) => id !== professionId,
                                  ),
                                );
                                setSelectedProfessionLabels((prev) => {
                                  const newLabels = { ...prev };
                                  delete newLabels[professionId];
                                  // localStorage'a kaydet
                                  try {
                                    localStorage.setItem(
                                      "jobList_professionLabels",
                                      JSON.stringify(newLabels),
                                    );
                                  } catch (error) {
                                    console.error(
                                      "Meslek label'ları kaydetme hatası:",
                                      error,
                                    );
                                  }
                                  return newLabels;
                                });
                              }}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 ml-1"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* İlçe Accordion */}
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <button
                      type="button"
                      onClick={() => setIsDistrictsOpen(!isDistrictsOpen)}
                      className="w-full flex items-center justify-between text-left mb-2"
                    >
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        İlçe
                        {selectedDistricts.length > 0 && (
                          <span className="ml-2 text-xs font-normal text-blue-600 dark:text-blue-400">
                            ({selectedDistricts.length})
                          </span>
                        )}
                      </label>
                      {isDistrictsOpen ? (
                        <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      )}
                    </button>
                    {isDistrictsOpen && (
                      <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2 space-y-2 bg-white dark:bg-gray-900">
                        {districtOptions.slice(1).map((option) => (
                          <Checkbox
                            key={option.value}
                            label={option.label}
                            checked={selectedDistricts.includes(option.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDistricts([
                                  ...selectedDistricts,
                                  option.value,
                                ]);
                              } else {
                                setSelectedDistricts(
                                  selectedDistricts.filter(
                                    (id) => id !== option.value,
                                  ),
                                );
                              }
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Çalışma Yöntemi Accordion */}
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <button
                      type="button"
                      onClick={() =>
                        setIsWorkingMethodsOpen(!isWorkingMethodsOpen)
                      }
                      className="w-full flex items-center justify-between text-left mb-2"
                    >
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Çalışma Yöntemi
                        {selectedWorkingMethods.length > 0 && (
                          <span className="ml-2 text-xs font-normal text-blue-600 dark:text-blue-400">
                            ({selectedWorkingMethods.length})
                          </span>
                        )}
                      </label>
                      {isWorkingMethodsOpen ? (
                        <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      )}
                    </button>
                    {isWorkingMethodsOpen && (
                      <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2 space-y-2 bg-white dark:bg-gray-900">
                        {workingMethodOptions.slice(1).map((option) => (
                          <Checkbox
                            key={option.value}
                            label={option.label}
                            checked={selectedWorkingMethods.includes(
                              option.value,
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedWorkingMethods([
                                  ...selectedWorkingMethods,
                                  option.value,
                                ]);
                              } else {
                                setSelectedWorkingMethods(
                                  selectedWorkingMethods.filter(
                                    (id) => id !== option.value,
                                  ),
                                );
                              }
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Sektör Accordion */}
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <button
                      type="button"
                      onClick={() => setIsSectorsOpen(!isSectorsOpen)}
                      className="w-full flex items-center justify-between text-left mb-2"
                    >
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Sektör
                        {selectedSectors.length > 0 && (
                          <span className="ml-2 text-xs font-normal text-blue-600 dark:text-blue-400">
                            ({selectedSectors.length})
                          </span>
                        )}
                      </label>
                      {isSectorsOpen ? (
                        <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      )}
                    </button>
                    {isSectorsOpen && (
                      <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2 space-y-2 bg-white dark:bg-gray-900">
                        {sectorOptions.slice(1).map((option) => (
                          <Checkbox
                            key={option.value}
                            label={option.label}
                            checked={selectedSectors.includes(option.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSectors([
                                  ...selectedSectors,
                                  option.value,
                                ]);
                              } else {
                                setSelectedSectors(
                                  selectedSectors.filter(
                                    (id) => id !== option.value,
                                  ),
                                );
                              }
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 pt-1">
                    <Checkbox
                      label="Sadece başlıkta ara"
                      checked={onlySearchInTitle}
                      onChange={(e) => setOnlySearchInTitle(e.target.checked)}
                    />
                    <Checkbox
                      label="Engelli personel için"
                      checked={isForDisabled}
                      onChange={(e) => setIsForDisabled(e.target.checked)}
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <Button onClick={handleApplyFilters} className="gap-2">
                    <span className="hidden md:block">
                      Filtreleri Uygula
                    </span>{" "}
                  </Button>
                  <Button variant="outline" onClick={handleResetFilters}>
                    Filtreleri Temizle
                  </Button>
                </div>
              </div>
            </aside>
          )}

          {/* Job Results */}
          <section className="min-h-0">
            {activeTab === "recommendations" ? (
              // Önerilen İşler
              <>
                {loadingRecommendations ? (
                  <EmptyState
                    icon={<Briefcase className="w-12 h-12" />}
                    title="Öneriler yükleniyor..."
                    description="Lütfen bekleyin, size özel iş önerileri hazırlanıyor."
                  />
                ) : recommendedJobs.length === 0 ? (
                  <EmptyState
                    icon={<Star className="w-12 h-12" />}
                    title="Önerilen iş bulunamadı"
                    description="Profilinizi tamamlayarak size özel iş önerileri alabilirsiniz"
                    action={
                      <Link to="/profil">
                        <Button>Profili Tamamla</Button>
                      </Link>
                    }
                  />
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {recommendedJobs.length}
                        </span>{" "}
                        önerilen iş ilanı bulundu
                      </p>
                    </div>
                    <div className="grid gap-3 sm:gap-4 mb-8">
                      {recommendedJobs
                        .slice((recommendedPage - 1) * RECS_PER_PAGE, recommendedPage * RECS_PER_PAGE)
                        .map((job) => (
                          <Link
                            key={job.id}
                            to={`/ilanlar/${job.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-200 group"
                          >
                            <div className="p-4 sm:p-5 lg:p-6">
                              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6">
                                {/* Company Logo + Mobile Title */}
                                <div className="flex-shrink-0 flex items-start gap-3 sm:block">
                                  {job.company?.logo ? (
                                    <img
                                      src={job.company.logo}
                                      alt={job.company.name}
                                      className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-lg object-cover border border-gray-200"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700">
                                      <Building2 className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600 dark:text-blue-400" />
                                    </div>
                                  )}
                                  {/* Mobile: Title and match score */}
                                  <div className="sm:hidden flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                                          {job.isPostForDisabledPersons && (
                                            <DisabledJobIcon className="w-4 h-4 flex-shrink-0 text-indigo-600 dark:text-indigo-300" />
                                          )}
                                          <span className="line-clamp-2">
                                            {job.title}
                                          </span>
                                        </h3>
                                        {job.company?.name && (
                                          <p className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate mt-0.5">
                                            {job.company.name}
                                          </p>
                                        )}
                                      </div>
                                      <div
                                        className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap flex-shrink-0 ${job.matchScore >= 80
                                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                                          : job.matchScore >= 60
                                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                                            : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                                          }`}
                                      >
                                        %{job.matchScore}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Job Info */}
                                <div className="flex-1 min-w-0">
                                  {/* Title & Company - Desktop */}
                                  <div className="hidden sm:flex items-start justify-between gap-4 mb-3">
                                    <div className="flex-1">
                                      <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1 flex items-center gap-2">
                                        {job.isPostForDisabledPersons && (
                                          <DisabledJobIcon className="w-5 h-5 flex-shrink-0 text-indigo-600 dark:text-indigo-300" />
                                        )}
                                        <span className="truncate">
                                          {job.title}
                                        </span>
                                      </h3>
                                      {job.company?.name && (
                                        <p className="text-gray-700 dark:text-gray-300 font-medium">
                                          {job.company.name}
                                        </p>
                                      )}
                                    </div>

                                    {/* Badges - Desktop */}
                                    <div className="flex flex-col gap-2">
                                      <div
                                        className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap ${job.matchScore >= 80
                                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                                          : job.matchScore >= 60
                                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                                            : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                                          }`}
                                      >
                                        %{job.matchScore} Eşleşme
                                      </div>
                                    </div>
                                  </div>

                                  {/* Meta Info */}
                                  <div className="flex flex-wrap gap-x-3 sm:gap-x-6 gap-y-1.5 sm:gap-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
                                    {job.location && (
                                      <span className="flex items-center gap-1 sm:gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 dark:text-gray-500" />
                                        <span className="truncate max-w-[120px] sm:max-w-none">
                                          {job.location}
                                        </span>
                                      </span>
                                    )}
                                    {job.profession && (
                                      <span className="flex items-center gap-1 sm:gap-1.5">
                                        <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 dark:text-gray-500" />
                                        <span className="truncate max-w-[100px] sm:max-w-none">
                                          {job.profession}
                                        </span>
                                      </span>
                                    )}
                                    {job.type && (
                                      <span className="flex items-center gap-1 sm:gap-1.5">
                                        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 dark:text-gray-500" />
                                        {job.type}
                                      </span>
                                    )}
                                    {job.createdAt && (
                                      <span className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                                        İlan: {formatDate(job.createdAt)}
                                      </span>
                                    )}
                                    {job.applicationUntilDate && (
                                      <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-medium">
                                        <Calendar className="w-4 h-4 flex-shrink-0" />
                                        Son: {formatDate(job.applicationUntilDate)}
                                      </span>
                                    )}
                                  </div>

                                  {/* Additional Info */}
                                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                    {job.educationLevels &&
                                      job.educationLevels.length > 0 && (
                                        <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs sm:text-sm rounded-full">
                                          {sortEducationLevels(
                                            job.educationLevels,
                                          )
                                            .map(
                                              (edu) =>
                                                edu.educationType?.type ||
                                                edu.type,
                                            )
                                            .slice(0, 2)
                                            .join(", ")}
                                          {job.educationLevels.length > 2 && " +"}
                                        </span>
                                      )}
                                    {job.languages &&
                                      job.languages.length > 0 && (
                                        <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs sm:text-sm rounded-full">
                                          {job.languages
                                            .map(
                                              (lang) =>
                                                lang.language?.name || lang.name,
                                            )
                                            .slice(0, 2)
                                            .join(", ")}
                                          {job.languages.length > 2 && " +"}
                                        </span>
                                      )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                    </div>

                    {/* Pagination - Recommended Jobs */}
                    {Math.ceil(recommendedJobs.length / RECS_PER_PAGE) > 1 && (
                      <div className="flex justify-center mt-6">
                        <Pagination
                          currentPage={recommendedPage}
                          totalPages={Math.ceil(recommendedJobs.length / RECS_PER_PAGE)}
                          onPageChange={(p) => {
                            setRecommendedPage(p);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                        />
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              // Tüm İlanlar
              <>
                {jobsLoading ? (
                  <EmptyState
                    icon={<Loading size="lg" className="text-blue-600 dark:text-blue-400" />}
                    title="İlanlar yükleniyor..."
                    description="Lütfen bekleyin, iş ilanları yükleniyor."
                  />
                ) : jobs.length === 0 ? (
                  <EmptyState
                    icon={<Briefcase className="w-12 h-12" />}
                    title="Uygun ilan bulunamadı"
                    description="Filtrelerinizi genişleterek farklı sonuçlar deneyebilirsiniz."
                    action={
                      <Button onClick={handleResetFilters}>
                        Filtreleri Temizle
                      </Button>
                    }
                  />
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {jobPagination?.total || jobs.length}
                        </span>{" "}
                        iş ilanı bulundu
                      </p>
                      {jobsLoading && (
                        <span className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-full px-3 py-1">
                          <Loading size="sm" />
                          İlanlar yükleniyor...
                        </span>
                      )}
                    </div>
                    <div className="grid gap-3 sm:gap-4 mb-8">
                      {jobs.map((job) => (
                        <Link
                          key={job.id}
                          to={`/ilanlar/${job.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-200 group"
                        >
                          <div className="p-4 sm:p-5 lg:p-6">
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6">
                              {/* Company Logo + Mobile Title */}
                              <div className="flex-shrink-0 flex items-start gap-3 sm:block">
                                {job.company?.logo ? (
                                  <img
                                    src={job.company.logo}
                                    alt={job.company.name}
                                    className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-lg object-cover border border-gray-200"
                                  />
                                ) : (
                                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700">
                                    <Building2 className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600 dark:text-blue-400" />
                                  </div>
                                )}
                                {/* Mobile: Title next to logo */}
                                <div className="sm:hidden flex-1 min-w-0">
                                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                                    {job.isPostForDisabledPersons && (
                                      <DisabledJobIcon className="w-4 h-4 flex-shrink-0 text-indigo-600 dark:text-indigo-300" />
                                    )}
                                    <span className="line-clamp-2">
                                      {job.title}
                                    </span>
                                  </h3>
                                  {job.company?.name && (
                                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate mt-0.5">
                                      {job.company.name}
                                    </p>
                                  )}
                                  {/* Mobile Badges */}
                                  <div className="flex flex-wrap gap-1.5 mt-2">
                                    {job.hasApplied &&
                                      user?.role !== ROLES.EMPLOYER &&
                                      user?.role !== "employer" &&
                                      user?.role !== "business" && (
                                        <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800 px-1.5 py-0 text-[10px]">
                                          ✓ Başvuruldu
                                        </Badge>
                                      )}
                                    {job.sector && (
                                      <Badge variant="info" className="px-1.5 py-0 text-[10px]">
                                        {job.sector}
                                      </Badge>
                                    )}
                                    {job.is_featured && (
                                      <Badge variant="warning" className="px-1.5 py-0 text-[10px]">
                                        ⭐ Öne Çıkan
                                      </Badge>
                                    )}
                                    {job.is_urgent && (
                                      <Badge variant="danger" className="px-1.5 py-0 text-[10px]">
                                        🔥 Acil
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Job Info */}
                              <div className="flex-1 min-w-0">
                                {/* Title & Company - Desktop */}
                                <div className="hidden sm:flex items-start justify-between gap-4 mb-3">
                                  <div className="flex-1">
                                    <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1 flex items-center gap-2">
                                      {job.isPostForDisabledPersons && (
                                        <DisabledJobIcon className="w-5 h-5 flex-shrink-0 text-indigo-600 dark:text-indigo-300" />
                                      )}
                                      <span className="truncate">
                                        {job.title}
                                      </span>
                                    </h3>
                                    {job.company?.name && (
                                      <p className="text-gray-700 dark:text-gray-300 font-medium">
                                        {job.company.name}
                                      </p>
                                    )}
                                  </div>

                                  {/* Badges */}
                                  <div className="flex flex-col gap-2">
                                    {/* Başvuru durumu badge'i sadece iş arayanlar için göster */}
                                    {job.hasApplied &&
                                      user?.role !== ROLES.EMPLOYER &&
                                      user?.role !== "employer" &&
                                      user?.role !== "business" &&
                                      (() => {
                                        const appStatus =
                                          applicationsMap[job.id?.toString()];
                                        if (appStatus === "accepted") {
                                          return (
                                            <Badge className="whitespace-nowrap bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800">
                                              <CheckCircle2 className="w-3 h-3 mr-1" />
                                              {APPLICATION_STATUS_LABELS[
                                                appStatus
                                              ] || "Onaylandı"}
                                            </Badge>
                                          );
                                        } else if (appStatus === "rejected") {
                                          return (
                                            <Badge className="whitespace-nowrap bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800">
                                              {APPLICATION_STATUS_LABELS[
                                                appStatus
                                              ] || "Reddedildi"}
                                            </Badge>
                                          );
                                        } else if (appStatus === "employed") {
                                          return (
                                            <Badge className="whitespace-nowrap bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                                              {APPLICATION_STATUS_LABELS[
                                                appStatus
                                              ] || "İşe Alındı"}
                                            </Badge>
                                          );
                                        } else {
                                          return (
                                            <Badge
                                              variant="success"
                                              className="whitespace-nowrap bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800"
                                            >
                                              ✓ Başvuruldu
                                            </Badge>
                                          );
                                        }
                                      })()}
                                    {job.sector && (
                                      <Badge
                                        variant="info"
                                        className="whitespace-nowrap"
                                      >
                                        {job.sector}
                                      </Badge>
                                    )}
                                    {job.is_featured && (
                                      <Badge
                                        variant="warning"
                                        className="whitespace-nowrap"
                                      >
                                        ⭐ Öne Çıkan
                                      </Badge>
                                    )}
                                    {job.is_urgent && (
                                      <Badge
                                        variant="danger"
                                        className="whitespace-nowrap"
                                      >
                                        🔥 Acil
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                {/* Meta Info */}
                                <div className="flex flex-wrap gap-x-3 sm:gap-x-6 gap-y-1.5 sm:gap-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
                                  <span className="flex items-center gap-1 sm:gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 dark:text-gray-500" />
                                    <span className="truncate max-w-[120px] sm:max-w-none">
                                      {job.location}
                                    </span>
                                  </span>
                                  {job.profession && (
                                    <span className="flex items-center gap-1 sm:gap-1.5">
                                      <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 dark:text-gray-500" />
                                      <span className="truncate max-w-[100px] sm:max-w-none">
                                        {job.profession}
                                      </span>
                                    </span>
                                  )}
                                  {job.type && (
                                    <span className="flex items-center gap-1 sm:gap-1.5">
                                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 dark:text-gray-500" />
                                      {job.type}
                                    </span>
                                  )}
                                  {job.workModel && (
                                    <span className="flex items-center gap-1.5">
                                      <Clock className="w-4 h-4 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                                      {job.workModel}
                                    </span>
                                  )}
                                  {job.salary_min && job.salary_max ? (
                                    <span className="flex items-center gap-1 sm:gap-1.5 font-semibold text-green-600 dark:text-green-400">
                                      <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                      {formatSalaryRange(
                                        job.salary_min,
                                        job.salary_max,
                                      )}
                                    </span>
                                  ) : job.salary_min || job.salary_max ? (
                                    <span className="flex items-center gap-1 sm:gap-1.5 font-semibold text-green-600 dark:text-green-400">
                                      <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                      {formatSalaryRange(
                                        job.salary_min,
                                        job.salary_max,
                                      )}
                                    </span>
                                  ) : null}
                                  {(job.createdAt || job.created_at) && (
                                    <span className="flex items-center gap-1.5">
                                      <Clock className="w-4 h-4 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                                      İlan: {formatDate(
                                        job.createdAt || job.created_at,
                                      )}
                                    </span>
                                  )}
                                  {job.applicationUntilDate && (
                                    <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-medium">
                                      <Calendar className="w-4 h-4 flex-shrink-0" />
                                      Son: {formatDate(job.applicationUntilDate)}
                                    </span>
                                  )}
                                </div>

                                {/* Additional Info */}
                                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                  {/* Eğitim Seviyeleri */}
                                  {job.educationLevels &&
                                    job.educationLevels.length > 0 && (
                                      <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs sm:text-sm rounded-full">
                                        {sortEducationLevels(
                                          job.educationLevels,
                                        )
                                          .map(
                                            (edu) =>
                                              edu.educationType?.type ||
                                              edu.type,
                                          )
                                          .slice(0, 2)
                                          .join(", ")}
                                        {job.educationLevels.length > 2 && " +"}
                                      </span>
                                    )}
                                  {/* Dil Gereksinimleri */}
                                  {job.languages &&
                                    job.languages.length > 0 && (
                                      <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs sm:text-sm rounded-full">
                                        {job.languages
                                          .map(
                                            (lang) =>
                                              lang.language?.name || lang.name,
                                          )
                                          .slice(0, 2)
                                          .join(", ")}
                                        {job.languages.length > 2 && " +"}
                                      </span>
                                    )}
                                  {/* Çalışma Günleri */}
                                  {job.workDays &&
                                    job.workDays.length > 0 &&
                                    (() => {
                                      const dayNames = [...job.workDays]
                                        .sort((a, b) => (a.day?.id || a.dayId) - (b.day?.id || b.dayId))
                                        .map((wd) => wd.day?.name || wd.name);
                                      const weekdays = [
                                        "Pazartesi",
                                        "Salı",
                                        "Çarşamba",
                                        "Perşembe",
                                        "Cuma",
                                      ];
                                      // Tüm hafta içi günler var mı ve sadece bunlar mı kontrol et
                                      const hasAllWeekdays = weekdays.every(
                                        (day) => dayNames.includes(day),
                                      );
                                      const onlyWeekdays =
                                        dayNames.length === 5 && hasAllWeekdays;

                                      return (
                                        <span className="inline-flex px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs sm:text-sm rounded-full">
                                          {onlyWeekdays
                                            ? "Hafta içi her gün"
                                            : dayNames.slice(0, 3).join(", ") +
                                            (dayNames.length > 3 ? " +" : "")}
                                        </span>
                                      );
                                    })()}
                                  {/* Yaş Aralığı */}
                                  {(job.ageMin || job.ageMax) && (
                                    <span className="inline-flex px-2 sm:px-3 py-0.5 sm:py-1 bg-green-100 text-green-700 text-xs sm:text-sm rounded-full">
                                      {job.ageMin && job.ageMax
                                        ? `${job.ageMin}-${job.ageMax} yaş`
                                        : job.ageMin
                                          ? `Min. ${job.ageMin} yaş`
                                          : `Max. ${job.ageMax} yaş`}
                                    </span>
                                  )}
                                  {/* Engelli Personel */}
                                  {job.isPostForDisabledPersons && (
                                    <span className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm rounded-full">
                                      <span className="hidden sm:inline">
                                        Engelli Bireyler İçin Uygun
                                      </span>
                                      <span className="sm:hidden">
                                        Engelli Uygun
                                      </span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* Pagination */}
                    {jobPagination?.totalPages > 1 && (
                      <div className="flex justify-center">
                        <Pagination
                          currentPage={jobPagination.currentPage}
                          totalPages={jobPagination.totalPages}
                          onPageChange={handlePageChange}
                        />
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default JobList;
