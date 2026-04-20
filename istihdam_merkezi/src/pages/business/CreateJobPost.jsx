import {
  useState,
  useEffect,
  useRef,
  useCallback,
  lazy,
  Suspense,
} from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store";
import { ROLES, ROUTES } from "../../constants";
import { useApiCall } from "../../hooks/useApiCall";
import { sortEducationTypes } from "../../utils/helpers";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Select,
  Textarea,
  Checkbox,
} from "../../components/ui";
import {
  Loader2,
  Save,
  ArrowLeft,
  Building2,
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  Users,
  GraduationCap,
  Shield,
  Car,
  FileText,
  X,
} from "lucide-react";
import { showToast } from "../../components/ui/Toast";

const RichTextEditor = lazy(() => import("../../components/ui/RichTextEditor"));

const CreateJobPost = () => {
  const navigate = useNavigate();
  const {
    user,
    createBusinessJobPost,
    getLookups,
    getDistrictsByCity,
    lookups,
    loading,
    searchProfessions,
  } = useAppStore();

  const [formData, setFormData] = useState({
    postTitle: "",
    postDescription: "",
    qualifications: "",
    professionId: "",
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
    languages: [],
  });

  const [errors, setErrors] = useState({});
  const [selectedCityId, setSelectedCityId] = useState("");
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lookupsLoadedRef = useRef(false);

  // Meslek arama state
  const [professionSearch, setProfessionSearch] = useState("");
  const [professionOptions, setProfessionOptions] = useState([]);
  const [searchingProfessions, setSearchingProfessions] = useState(false);
  const [selectedProfessionName, setSelectedProfessionName] = useState("");
  const [showProfessionDropdown, setShowProfessionDropdown] = useState(false);
  const [professionHasMore, setProfessionHasMore] = useState(false);
  const [professionLoadingMore, setProfessionLoadingMore] = useState(false);
  const professionSearchTimeoutRef = useRef(null);
  const professionPageRef = useRef(1);
  const professionSearchRef = useRef("");
  const professionDropdownRef = useRef(null);

  const createJobApi = useApiCall();

  useEffect(() => {
    // Check if user is not business/employer, redirect
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
    if (lookupsLoadedRef.current) {
      return;
    }
    lookupsLoadedRef.current = true;

    // Load lookup data
    getLookups("professions");
    getLookups("workingMethods");
    getLookups("cities");
    getLookups("educationTypes");
    getLookups("applicantRights");
    getLookups("drivingLicenseTypes");
    getLookups("workDays");
    getLookups("workingExperiences");
    getLookups("languages");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  useEffect(() => {
    if (selectedCityId) {
      loadDistricts(selectedCityId);
    } else {
      setAvailableDistricts([]);
      setFormData((prev) => ({ ...prev, districts: [] }));
    }
  }, [selectedCityId]); // eslint-disable-line react-hooks/exhaustive-deps

  const PROFESSION_LIMIT = 20;

  const loadProfessionFirstPage = useCallback(() => {
    setShowProfessionDropdown(true);
    setSearchingProfessions(true);
    setProfessionHasMore(true);
    professionPageRef.current = 1;
    professionSearchRef.current = "";
    searchProfessions("", PROFESSION_LIMIT, 1).then((result) => {
      if (result.success) {
        const options = (result.data || []).map((prof) => ({
          value: prof.id?.toString() || "",
          label: prof.profession || prof.name || "",
        }));
        setProfessionOptions(options);
        setProfessionHasMore((result.data || []).length >= PROFESSION_LIMIT);
      }
      setSearchingProfessions(false);
    });
  }, [searchProfessions]);

  const loadProfessionMore = useCallback(() => {
    if (professionLoadingMore || !professionHasMore) return;
    setProfessionLoadingMore(true);
    const nextPage = professionPageRef.current + 1;
    const term = professionSearchRef.current;
    searchProfessions(term, PROFESSION_LIMIT, nextPage).then((result) => {
      if (result.success) {
        const newOptions = (result.data || []).map((prof) => ({
          value: prof.id?.toString() || "",
          label: prof.profession || prof.name || "",
        }));
        setProfessionOptions((prev) => [...prev, ...newOptions]);
        setProfessionHasMore(newOptions.length >= PROFESSION_LIMIT);
        professionPageRef.current = nextPage;
      }
      setProfessionLoadingMore(false);
    });
  }, [searchProfessions, professionHasMore, professionLoadingMore]);

  // Meslek arama debounce + açılışta ilk sayfa
  useEffect(() => {
    if (professionSearchTimeoutRef.current) {
      clearTimeout(professionSearchTimeoutRef.current);
    }

    // Eğer meslek seçiliyse ve arama input'u seçili meslek adıyla eşleşiyorsa arama yapma
    if (formData.professionId && professionSearch === selectedProfessionName) {
      return;
    }

    if (professionSearch.trim() === "") {
      const hadContent = professionSearchRef.current?.trim() !== "";
      professionSearchRef.current = "";
      if (hadContent) {
        setProfessionOptions([]);
        setShowProfessionDropdown(false);
      }
      return;
    }

    professionSearchRef.current = professionSearch;
    setShowProfessionDropdown(true);
    setSearchingProfessions(true);
    professionPageRef.current = 1;

    professionSearchTimeoutRef.current = setTimeout(async () => {
      const term = professionSearch.trim();
      professionSearchRef.current = term;
      const result = await searchProfessions(term, PROFESSION_LIMIT, 1);
      if (result.success) {
        const options = (result.data || []).map((prof) => ({
          value: prof.id?.toString() || "",
          label: prof.profession || prof.name || "",
        }));
        setProfessionOptions(options);
        setProfessionHasMore((result.data || []).length >= PROFESSION_LIMIT);
      }
      setSearchingProfessions(false);
    }, 300);

    return () => {
      if (professionSearchTimeoutRef.current) {
        clearTimeout(professionSearchTimeoutRef.current);
      }
    };
  }, [
    professionSearch,
    searchProfessions,
    formData.professionId,
    selectedProfessionName,
  ]);

  // Click outside - dropdown kapat
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        professionDropdownRef.current &&
        !professionDropdownRef.current.contains(e.target)
      ) {
        setShowProfessionDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadDistricts = async (cityId) => {
    const result = await getDistrictsByCity(cityId);
    if (result.success) {
      setAvailableDistricts(result.data || []);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Yıl alanları için maksimum 4 hane kontrolü
    if (name === "minExperienceYear" && type === "number") {
      // Sadece rakamları al ve maksimum 4 hane
      const numericValue = value.replace(/[^0-9]/g, "");
      if (numericValue.length > 4) {
        return; // 4 haneden fazla giriş yapılamaz
      }
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    } else {
      const nextValue =
        type === "checkbox"
          ? checked
          : typeof value === "string"
            ? value.toLocaleUpperCase("tr-TR")
            : value;

      setFormData((prev) => ({
        ...prev,
        [name]: nextValue,
      }));
    }

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

    if (formData.weeklyWorkingHours) {
      if (formData.weeklyWorkingHours <= 0) {
        newErrors.weeklyWorkingHours =
          "Haftalık çalışma saati 0'dan küçük olamaz";
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
      showToast({
        type: "error",
        message: "Lütfen form hatalarını düzeltin",
        duration: 3000,
      });
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      return;
    }

    setIsSubmitting(true);
    const submitData = {
      postTitle: formData.postTitle
        ? formData.postTitle.toLocaleUpperCase("tr-TR")
        : "",
      postDescription: formData.postDescription,
      qualifications: formData.qualifications || "",
      professionId: parseInt(formData.professionId),
      workingMethodId: parseInt(formData.workingMethodId),
      hiringCount: parseInt(formData.hiringCount),
      minExperienceYear: formData.minExperienceYear
        ? parseInt(formData.minExperienceYear)
        : 0,
      ageMin: formData.ageMin ? parseInt(formData.ageMin) : null,
      ageMax: formData.ageMax ? parseInt(formData.ageMax) : null,
      weeklyWorkingHours: formData.weeklyWorkingHours
        ? parseInt(formData.weeklyWorkingHours)
        : null,
      genderOption:
        formData.genderOption !== null && formData.genderOption !== undefined
          ? formData.genderOption
          : null,
      militaryStatus:
        formData.militaryStatus !== null ? formData.militaryStatus : null,
      coverLetterRequest: formData.coverLetterRequest || false,
      isPostForDisabledPersons: formData.isPostForDisabledPersons || false,
      workStartedAt: formData.workStartedAt || null,
      workEndAt: formData.workEndAt || null,
      applicationUntilDate: formData.applicationUntilDate || null,
      districts: formData.districts.map((id) => parseInt(id)),
      applicantRights: formData.applicantRights.map((id) => parseInt(id)),
      drivingLisenceRequirements: formData.drivingLisenceRequirements.map(
        (id) => parseInt(id),
      ),
      educationLevels: formData.educationLevels.map((id) => parseInt(id)),
      workDays: formData.workDays.map((id) => parseInt(id)),
      workingExperiences: formData.workingExperiences.map((id) => parseInt(id)),
      languages: formData.languages.map((id) => parseInt(id)),
    };

    await createJobApi.execute(() => createBusinessJobPost(submitData), {
      successMessage: "İlan başarıyla oluşturuldu",
      onSuccess: () => {
        setIsSubmitting(false);
        navigate(ROUTES.EMPLOYER_MY_JOBS);
      },
      onError: () => {
        setIsSubmitting(false);
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/isveren/ilanlarim")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri Dön
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Yeni İş İlanı Oluştur
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Yeni bir iş ilanı oluşturun ve yetenekli adaylarla buluşun
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Temel Bilgiler */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Temel Bilgiler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Input
                label="İlan Başlığı"
                name="postTitle"
                value={formData.postTitle}
                onChange={handleChange}
                error={errors.postTitle}
                placeholder="Örn: Senior Software Developer"
                required
              />

              <Suspense
                fallback={
                  <Textarea
                    label="İş Tanımı"
                    name="postDescription"
                    value={formData.postDescription}
                    onChange={handleRichTextChange}
                    error={errors.postDescription}
                    placeholder="İş ilanı hakkında detaylı bilgi verin"
                    required
                    helperText="Editör yükleniyor..."
                  />
                }
              >
                <RichTextEditor
                  label="İş Tanımı"
                  name="postDescription"
                  value={formData.postDescription}
                  onChange={handleRichTextChange}
                  error={errors.postDescription}
                  placeholder="İş ilanı hakkında detaylı bilgi verin"
                  required
                  helperText="İş ilanı hakkında detaylı açıklama yapabilirsiz"
                />
              </Suspense>

              <Suspense
                fallback={
                  <Textarea
                    label="Nitelikler"
                    name="qualifications"
                    value={formData.qualifications}
                    onChange={handleRichTextChange}
                    error={errors.qualifications}
                    placeholder="Adaylarda aranan nitelikler"
                    helperText="Editör yükleniyor..."
                  />
                }
              >
                <RichTextEditor
                  label="Nitelikler"
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleRichTextChange}
                  error={errors.qualifications}
                  placeholder="Adaylarda aranan nitelikler"
                  helperText="Adaylarda aranan nitelikleri ekleyebilirsiniz"
                />
              </Suspense>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div ref={professionDropdownRef}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meslek <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      size="md"
                      placeholder="Meslek ara..."
                      value={
                        formData.professionId
                          ? selectedProfessionName
                          : professionSearch
                      }
                      onChange={(e) => {
                        const newValue = e.target.value;
                        if (
                          formData.professionId &&
                          newValue !== selectedProfessionName
                        ) {
                          setFormData((prev) => ({
                            ...prev,
                            professionId: "",
                          }));
                          setSelectedProfessionName("");
                          setProfessionSearch(newValue);
                        } else {
                          setProfessionSearch(newValue);
                        }
                      }}
                      onFocus={() => {
                        if (!professionSearch?.trim())
                          loadProfessionFirstPage();
                      }}
                      leftIcon={<Briefcase className="w-4 h-4" />}
                      error={errors.professionId}
                      className={formData.professionId ? "pr-10" : ""}
                    />
                    {formData.professionId && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            professionId: "",
                          }));
                          setProfessionSearch("");
                          setSelectedProfessionName("");
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        title="Meslek seçimini kaldır"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    {showProfessionDropdown && !formData.professionId && (
                      <div
                        className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-lg"
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
                          <div className="p-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                            Aranıyor...
                          </div>
                        ) : professionOptions.length > 0 ? (
                          <>
                            {professionOptions.map((option) => (
                              <div
                                key={option.value}
                                className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    professionId: option.value,
                                  }));
                                  setSelectedProfessionName(option.label);
                                  setProfessionSearch(option.label);
                                  setProfessionOptions([]);
                                  setShowProfessionDropdown(false);
                                  if (errors.professionId) {
                                    setErrors((prev) => ({
                                      ...prev,
                                      professionId: undefined,
                                    }));
                                  }
                                }}
                              >
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {option.label}
                                </div>
                              </div>
                            ))}
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
                          <div className="p-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                            {professionSearch?.trim()
                              ? "Sonuç bulunamadı"
                              : "Meslek ara veya listeden seçin"}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                  {errors.professionId && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.professionId}
                    </p>
                  )}
                </div>

                <Select
                  label="Çalışma Şekli"
                  name="workingMethodId"
                  value={formData.workingMethodId}
                  onChange={handleChange}
                  error={errors.workingMethodId}
                  options={[
                    ...(lookups.workingMethods || []).map((wm) => ({
                      value: wm.id?.toString(),
                      label: wm.title || wm.name,
                    })),
                  ]}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                  label="Pozisyon Sayısı"
                  type="number"
                  name="hiringCount"
                  value={formData.hiringCount}
                  onChange={handleChange}
                  error={errors.hiringCount}
                  placeholder="2"
                  min="1"
                  required
                />

                <Input
                  label="Minimum Deneyim (Yıl)"
                  type="number"
                  name="minExperienceYear"
                  value={formData.minExperienceYear}
                  onChange={handleChange}
                  error={errors.minExperienceYear}
                  placeholder="5"
                  min="0"
                  max="9999"
                  maxLength={4}
                />

                <Input
                  label="Haftalık Çalışma Saati"
                  type="number"
                  name="weeklyWorkingHours"
                  value={formData.weeklyWorkingHours}
                  onChange={handleChange}
                  error={errors.weeklyWorkingHours}
                  placeholder="40"
                  min="1"
                  max="168"
                />
              </div>
            </CardContent>
          </Card>

          {/* Konum ve Tarih Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                Konum ve Tarih
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Şehir"
                  value={selectedCityId}
                  onChange={(e) => setSelectedCityId(e.target.value)}
                  options={[
                    ...(lookups.cities || []).map((city) => ({
                      value: city.id?.toString(),
                      label: city.title || city.name,
                    })),
                  ]}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    İlçeler <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 min-h-[80px] max-h-[200px] overflow-y-auto">
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
                                ? "bg-blue-600 dark:bg-blue-700 text-white"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
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
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.districts}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                  label="İş Başlangıç Saati"
                  type="time"
                  name="workStartedAt"
                  value={formData.workStartedAt}
                  onChange={handleChange}
                  error={errors.workStartedAt}
                  placeholder="08:00"
                />

                <Input
                  label="İş Bitiş Saati"
                  type="time"
                  name="workEndAt"
                  value={formData.workEndAt}
                  onChange={handleChange}
                  error={errors.workEndAt}
                  placeholder="17:00"
                />

                <Input
                  label="Son Başvuru Tarihi"
                  type="date"
                  name="applicationUntilDate"
                  value={formData.applicationUntilDate}
                  onChange={handleChange}
                  error={errors.applicationUntilDate}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Yaş ve Cinsiyet */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Aday Kriterleri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Minimum Yaş"
                  type="number"
                  name="ageMin"
                  value={formData.ageMin}
                  onChange={handleChange}
                  error={errors.ageMin}
                  placeholder="25"
                  min="18"
                />

                <Input
                  label="Maksimum Yaş"
                  type="number"
                  name="ageMax"
                  value={formData.ageMax}
                  onChange={handleChange}
                  error={errors.ageMax}
                  placeholder="45"
                  min="18"
                />
              </div>

              <div className="space-y-3">
                <Select
                  label="Cinsiyet"
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
                  error={errors.genderOption}
                  placeholder={null}
                  options={[
                    { value: "", label: "Belirtilmemiş" },
                    { value: "male", label: "Erkek" },
                    { value: "female", label: "Kadın" },
                  ]}
                />

                <Select
                  label="Askerlik Durumu"
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
                    if (errors.militaryStatus) {
                      setErrors((prev) => ({ ...prev, militaryStatus: "" }));
                    }
                  }}
                  error={errors.militaryStatus}
                  placeholder={null}
                  options={[
                    { value: "", label: "Belirtilmemiş" },
                    { value: "true", label: "Gerekli" },
                    { value: "false", label: "Gerekli Değil" },
                  ]}
                />
              </div>
            </CardContent>
          </Card>

          {/* Eğitim ve Deneyim */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Eğitim ve Deneyim
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Eğitim Seviyeleri
                </label>
                <div className="flex flex-wrap gap-2 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 min-h-[80px] max-h-[200px] overflow-y-auto">
                  {lookups.educationTypes &&
                  lookups.educationTypes.length > 0 ? (
                    // Eğitim seviyelerini en yüksekten en düşüğe sırala
                    sortEducationTypes(lookups.educationTypes || []).map(
                      (edu) => {
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
                                ? "bg-indigo-600 dark:bg-indigo-700 text-white"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                            }`}
                          >
                            {edu.type || edu.title || edu.name}
                          </button>
                        );
                      },
                    )
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Eğitim seviyeleri yükleniyor...
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  İş Deneyimi
                </label>
                <div className="flex flex-wrap gap-2 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 min-h-[80px] max-h-[200px] overflow-y-auto">
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
                              ? "bg-indigo-600 dark:bg-indigo-700 text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Dil Gereksinimleri
                </label>
                <div className="flex flex-wrap gap-2 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 min-h-[80px] max-h-[200px] overflow-y-auto">
                  {lookups.languages && lookups.languages.length > 0 ? (
                    lookups.languages.map((language) => {
                      const isSelected = formData.languages.includes(
                        language.id?.toString(),
                      );
                      return (
                        <button
                          key={language.id}
                          type="button"
                          onClick={() =>
                            handleMultiSelect(
                              "languages",
                              language.id?.toString(),
                            )
                          }
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            isSelected
                              ? "bg-indigo-600 dark:bg-indigo-700 text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                          }`}
                        >
                          {language.name}
                        </button>
                      );
                    })
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Diller yükleniyor...
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Çalışma Günleri ve Haklar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                Çalışma Günleri ve Haklar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Çalışma Günleri <span className="text-red-500">*</span>
                </label>
                {errors.workDays && (
                  <p className="mb-2 text-sm text-red-600 dark:text-red-400">
                    {errors.workDays}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 min-h-[80px]">
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
                              ? "bg-orange-600 dark:bg-orange-700 text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Aday Hakları
                </label>
                <div className="flex flex-wrap gap-2 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 min-h-[80px] max-h-[200px] overflow-y-auto">
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
                              ? "bg-orange-600 dark:bg-orange-700 text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Ehliyet Gereksinimleri
                </label>
                <div className="flex flex-wrap gap-2 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 min-h-[80px] max-h-[200px] overflow-y-auto">
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
                              ? "bg-orange-600 dark:bg-orange-700 text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
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
            </CardContent>
          </Card>

          {/* Diğer Seçenekler */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                Diğer Seçenekler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Checkbox
                name="coverLetterRequest"
                checked={formData.coverLetterRequest}
                onChange={handleChange}
                label="Ön yazı (Cover Letter) isteniyor mu?"
              />

              <Checkbox
                name="isPostForDisabledPersons"
                checked={formData.isPostForDisabledPersons}
                onChange={handleChange}
                label="Bu ilan engelli bireyler için mi?"
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSubmitting || loading || createJobApi.loading}
              className="bg-blue-600 hover:bg-blue-700 flex-1"
              size="lg"
            >
              {isSubmitting || loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  İlanı Oluştur
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/isveren/ilanlarim")}
              size="lg"
              disabled={isSubmitting || loading || createJobApi.loading}
            >
              İptal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJobPost;
