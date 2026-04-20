import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppStore } from "../store";
import { ROLES, ROUTES } from "../constants";
import { useApiCall } from "../hooks/useApiCall";
import { error as logError } from "../utils/logger";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Select,
  Checkbox,
  Avatar,
  Modal,
} from "../components/ui";
import {
  Loader2,
  Save,
  Phone,
  Upload,
  Trash2,
  Camera,
  X,
  Plus,
  Building2,
  Languages,
  FileText,
  Car,
  GraduationCap,
  Briefcase,
  FileCheck,
  Shield,
  User,
  Mail,
  MapPin,
  Calendar,
  Eye,
} from "lucide-react";
import { showToast } from "../components/ui/Toast";
import { FILE_LIMITS } from "../constants";
import { API_BASE_URL, getToken } from "../lib/api";
import { normalizePhoneNumber } from "../utils/helpers";
import {
  ProfileHeader,
  AddressSection,
  DocumentsSection,
  PersonalInfoSection,
  DescriptionSection,
  SectorsSection,
  DrivingLicensesSection,
  ExamsSection,
  LanguagesSection,
  ProfessionsSection,
  EducationSection,
  WorkExperienceSection,
  ChangePasswordSection,
} from "../components/profile";

const Profile = () => {
  const navigate = useNavigate();
  const {
    user,
    getProfile,
    updateProfile,
    updateDescription,
    uploadProfilePicture,
    deleteProfilePicture,
    uploadCriminalRecord,
    updateCriminalRecordStatus,
    addSector,
    removeSector,
    addLanguage,
    deleteLanguage,
    addExam,
    deleteExam,
    addDrivingLicense,
    deleteDrivingLicense,
    addEducation,
    deleteEducation,
    addProfession,
    deleteProfession,
    addWorkExperience,
    deleteWorkExperience,
    loading,
    getLookups,
    lookups,
    getFacultiesByUniversity,
    getDepartmentsByFaculty,
    getSchoolsByCityAndType,
    getUniversities,
    getDistrictsByCity,
    getNeighbourhoodsByDistrict,
    searchProfessions,
    sendEmailVerificationCode,
    verifyEmail,
    sendPhoneVerificationCode,
    verifyPhone,
    requestEmailChange,
    verifyEmailChange,
    requestPhoneChange,
    verifyPhoneChange,
    changePassword,
    getUserStatistics,
  } = useAppStore();
  const profileLoadedRef = useRef(false);
  const statsLoadedRef = useRef(false);
  const [missingKeys, setMissingKeys] = useState([]);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [deletingPicture, setDeletingPicture] = useState(false);
  // uploadingIkametgah ve uploadingCriminalRecord DocumentsSection component'ine taşındı
  const [isCriminalRecorded, setIsCriminalRecorded] = useState("null");
  const [ikametgahForm, setIkametgahForm] = useState({
    cityId: "",
    districtId: "",
    address: "",
    neighbourhoodId: "",
  });
  // ikametgahDistricts ve ikametgahNeighbourhoods AddressSection component'ine taşındı
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "personal";
  const [activeTab, setActiveTab] = useState(initialTab);
  // E-posta ve telefon doğrulama state'leri PersonalInfoSection component'ine taşındı (useVerification hook)
  const [formData, setFormData] = useState({
    secondaryPhone: "",
    gender: "",
    nationalityId: "",
    workingStatus: "null",
    militaryStatus: "null",
    retirementStatus: "null",
    smokingStatus: "null",
    isDisabledPerson: "null",
    isMarried: "null",
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [viewingCV, setViewingCV] = useState(false);
  const [cvModalOpen, setCvModalOpen] = useState(false);
  const [cvPdfUrl, setCvPdfUrl] = useState(null);
  const updateProfileApi = useApiCall();

  useEffect(() => {
    // Store'dan user'ın yüklenmesini bekle
    if (!user) {
      return;
    }

    // Kullanıcının business/employer olup olmadığını kontrol et, önce business profile'a yönlendir
    const userRole = user?.role || user?.userType;
    if (
      userRole === ROLES.EMPLOYER ||
      userRole === "employer" ||
      userRole === "business"
    ) {
      navigate(ROUTES.EMPLOYER_PROFILE, { replace: true });
      return;
    }

    // Strict Mode'da duplicate API çağrılarını önle
    if (profileLoadedRef.current) {
      return;
    }
    profileLoadedRef.current = true;

    // Kullanıcı seeker ise sadece seeker profilini yükle
    // Profil verisini yükle
    getProfile();

    // Lookup verilerini yükle
    // Lookup'ları paralel olarak yükle ve await et
    const loadLookups = async () => {
      try {
        await Promise.all([
          getLookups("nationalities"),
          getLookups("cities"),
          getLookups("sectors"),
          getLookups("languages"),
          getLookups("exams"),
          getLookups("drivingLicenseTypes"),
          getLookups("professions"),
          getLookups("educationTypes"),
          getLookups("workingMethods"),
        ]);
      } catch (error) {
        logError("Lookup yükleme hatası:", error);
      }
    };
    loadLookups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  const refreshMissingKeys = async () => {
    try {
      const result = await getUserStatistics();
      if (result.success && result.data) {
        const missing =
          result.data.statistics?.applicationRequirements?.missing || [];
        setMissingKeys(missing.map((m) => m.key));
      }
    } catch (err) {
      logError("Statistics yükleme hatası:", err);
    }
  };

  // Statistics API'den eksik alanları çek
  useEffect(() => {
    if (!user || statsLoadedRef.current) return;
    const userRole = user?.role || user?.userType;
    if (
      userRole === ROLES.EMPLOYER ||
      userRole === "employer" ||
      userRole === "business"
    )
      return;

    statsLoadedRef.current = true;
    refreshMissingKeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // User verisi güncellendiğinde (profil kaydedildiğinde) eksik alanları yeniden çek
  const prevUserRef = useRef(null);
  useEffect(() => {
    if (!user || !statsLoadedRef.current) return;
    if (prevUserRef.current && prevUserRef.current !== user) {
      refreshMissingKeys();
    }
    prevUserRef.current = user;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const PERSONAL_TAB_KEYS = [
    "name",
    "surname",
    "tc",
    "birthday",
    "gender",
    "email",
    "phoneNumber",
    "profilePicture",
    "retirementStatus",
    "isMarried",
    "smokingStatus",
    "isDisabledPerson",
    "isCriminalRecorded",
    "criminalRecordFile",
    "addressText",
    "addressNeighbourhoodId",
    "isPhoneApproved",
    "isEmailApproved",
  ];
  const WORK_TAB_KEYS = ["sectors", "professions"];

  const personalMissingKeys = missingKeys.filter((k) =>
    PERSONAL_TAB_KEYS.includes(k),
  );
  const workMissingKeys = missingKeys.filter((k) => WORK_TAB_KEYS.includes(k));

  const getMissingCountForTab = (tabId) => {
    switch (tabId) {
      case "personal":
        return personalMissingKeys.length;
      case "work":
        return workMissingKeys.length;
      default:
        return 0;
    }
  };

  // User verisi yüklendiğinde isCriminalRecorded'ı set et
  useEffect(() => {
    if (
      user?.isCriminalRecorded !== undefined &&
      user?.isCriminalRecorded !== null
    ) {
      setIsCriminalRecorded(user.isCriminalRecorded ? "true" : "false");
    } else {
      setIsCriminalRecorded("null");
    }
  }, [user?.isCriminalRecorded]);

  // User verisi yüklendiğinde form data'yı güncelle
  useEffect(() => {
    if (user) {
      // Convert boolean/null values to string for Select dropdowns
      const convertStatusToString = (value) => {
        if (value === null || value === undefined) return "null";
        return value === true ? "true" : "false";
      };

      setFormData({
        secondaryPhone: user.secondaryPhone || "",
        gender: user.gender || "",
        nationalityId: user.nationalityId ? user.nationalityId.toString() : "",
        workingStatus: convertStatusToString(user.workingStatus),
        militaryStatus: convertStatusToString(user.militaryStatus),
        retirementStatus: convertStatusToString(user.retirementStatus),
        smokingStatus: convertStatusToString(user.smokingStatus),
        isDisabledPerson: convertStatusToString(user.isDisabledPerson),
        isMarried: convertStatusToString(user.isMarried),
      });

      // Adres formunu da mevcut kullanıcı verisiyle initialize et
      // Böylece sadece Durum Bilgileri güncellendiğinde adres alanları null'a düşmez
      const cityId =
        user.ikametgahDistrictRef?.city?.id ||
        user.neighbourhood?.district?.city?.id ||
        "";
      const districtId =
        user.ikametgahDistrictRef?.id || user.neighbourhood?.district?.id || "";
      const neighbourhoodId =
        user.addressNeighbourhoodId ||
        user.neighbourhood?.id ||
        user.neighbourhoodId ||
        "";
      const addressText =
        user.addressText || user.address || user.ikametgahAddress || "";

      setIkametgahForm({
        cityId: cityId ? cityId.toString() : "",
        districtId: districtId ? districtId.toString() : "",
        neighbourhoodId: neighbourhoodId ? neighbourhoodId.toString() : "",
        address: addressText,
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Bu field için error'ı temizle
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (field, checked) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked,
    }));
  };

  const handleStatusChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ProfileHeader component artık dosya yüklemeyi handle ediyor
  // handleFileSelect kaldırıldı - artık ProfileHeader component tarafından handle ediliyor

  const handleDeletePicture = async () => {
    if (
      !window.confirm(
        "Profil fotoğrafınızı silmek istediğinizden emin misiniz?",
      )
    ) {
      return;
    }

    setDeletingPicture(true);

    const result = await deleteProfilePicture();

    setDeletingPicture(false);

    if (result.success) {
      showToast({
        type: "success",
        message: "Profil fotoğrafı başarıyla silindi",
        duration: 3000,
      });
    } else {
      showToast({
        type: "error",
        message: result.error || "Fotoğraf silinirken bir hata oluştu",
        duration: 3000,
      });
    }
  };

  // handleIkametgahCityChange ve handleIkametgahDistrictChange AddressSection component'ine taşındı

  // handleIkametgahUpload DocumentsSection component'ine taşındı

  const handleCriminalRecordStatusChange = async (value) => {
    // Kullanıcının mevcut bir dosyası olup olmadığını kontrol et - yoksa önce yüklemesi gerekir
    if (!user?.criminalRecordFile) {
      showToast({
        type: "error",
        message: "Önce sabıka kaydı belgesi yüklemelisiniz",
        duration: 3000,
      });
      return;
    }

    // Convert string to boolean/null for API
    const booleanValue = value === "null" ? null : value === "true";
    setIsCriminalRecorded(value);

    // Sadece isCriminalRecorded status'unu dosya olmadan güncelle (dosya zaten mevcut)
    // handleUpdateCriminalRecordStatus wrapper'ı zaten getProfile() çağırıyor
    const result = await handleUpdateCriminalRecordStatus(booleanValue);

    if (result.success) {
      showToast({
        type: "success",
        message: "Sabıka kaydı durumu başarıyla güncellendi",
        duration: 3000,
      });
    } else {
      // Hata durumunda değişikliği geri al
      const previousValue =
        user?.isCriminalRecorded !== undefined &&
        user?.isCriminalRecorded !== null
          ? user.isCriminalRecorded
            ? "true"
            : "false"
          : "null";
      setIsCriminalRecorded(previousValue);
      showToast({
        type: "error",
        message: result.error || "Durum güncellenirken bir hata oluştu",
        duration: 3000,
      });
    }
  };

  // handleCriminalRecordUpload moved to DocumentsSection component
  // Email and phone verification handlers moved to PersonalInfoSection component (useVerification hook)

  // Wrapper for uploadCriminalRecord to refresh profile after upload
  const handleUploadCriminalRecord = async (
    file,
    isCriminalRecorded = false,
  ) => {
    const result = await uploadCriminalRecord(file, isCriminalRecorded);
    if (result.success) {
      // Profil güncellendi, store'dan tekrar çek (store'da zaten getProfile() çağrılıyor ama emin olmak için)
      const profileResult = await getProfile();
      if (profileResult.success && profileResult.data) {
        // isCriminalRecorded state'ini güncelle
        const updatedUser = profileResult.data;
        if (
          updatedUser.isCriminalRecorded !== undefined &&
          updatedUser.isCriminalRecorded !== null
        ) {
          setIsCriminalRecorded(
            updatedUser.isCriminalRecorded ? "true" : "false",
          );
        } else {
          setIsCriminalRecorded("null");
        }
      }
    }
    return result;
  };

  // Wrapper for updateCriminalRecordStatus to refresh profile after update
  const handleUpdateCriminalRecordStatus = async (isCriminalRecorded) => {
    const result = await updateCriminalRecordStatus(isCriminalRecorded);
    if (result.success) {
      // Profil güncellendi, store'dan tekrar çek
      const profileResult = await getProfile();
      if (profileResult.success && profileResult.data) {
        // isCriminalRecorded state'ini güncelle
        const updatedUser = profileResult.data;
        if (
          updatedUser.isCriminalRecorded !== undefined &&
          updatedUser.isCriminalRecorded !== null
        ) {
          setIsCriminalRecorded(
            updatedUser.isCriminalRecorded ? "true" : "false",
          );
        } else {
          setIsCriminalRecorded("null");
        }
      }
    }
    return result;
  };

  // Sector handlers moved to SectorsSection component

  // Language handlers moved to LanguagesSection component

  // Exam handlers moved to ExamsSection component

  // Driving license handlers moved to DrivingLicensesSection component

  // Helper to determine if education type is university level
  // Education handlers and helpers moved to EducationSection component

  // Profession handlers moved to ProfessionsSection component

  // Work Experience handlers moved to WorkExperienceSection component

  const handleViewCV = async () => {
    setViewingCV(true);

    try {
      const token = getToken();

      const response = await fetch(`${API_BASE_URL}/users/cv/pdf`, {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        // Backend'den gelen hata mesajını parse et
        let errorMessage = "CV görüntülenirken bir hata oluştu";
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            if (errorData.message) {
              errorMessage = errorData.message;
            } else if (errorData.error) {
              errorMessage = errorData.error;
            }
          } else {
            // JSON değilse text olarak oku
            const errorText = await response.text();
            try {
              const errorData = JSON.parse(errorText);
              if (errorData.message) {
                errorMessage = errorData.message;
              } else if (errorData.error) {
                errorMessage = errorData.error;
              }
            } catch {
              // Parse edilemezse text'i direkt kullan
              if (errorText && errorText.trim()) {
                errorMessage = errorText;
              }
            }
          }
        } catch (parseError) {
          // Hata parse edilemezse varsayılan mesajı kullan
          logError("CV hatası parse edilemedi:", parseError);
        }

        showToast({
          type: "error",
          message: errorMessage,
          duration: 5000,
        });
        setViewingCV(false);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Mobilde direkt indir, desktop'ta modal aç
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        // Mobilde direkt indir
        const link = document.createElement("a");
        link.href = url;
        link.download = `CV_${user?.name || "kullanici"}_${user?.surname || ""}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        showToast({
          type: "success",
          message: "CV indiriliyor...",
          duration: 3000,
        });
      } else {
        // Desktop'ta modal aç
        setCvPdfUrl(url);
        setCvModalOpen(true);
      }
    } catch (error) {
      // Ağ / offline durumlarında teknik hata mesajını (Failed to fetch vb.)
      // kullanıcıya göstermeden, anlaşılır sabit bir mesaj göster
      showToast({
        type: "error",
        message:
          "CV görüntülenemedi. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.",
        duration: 5000,
      });
    } finally {
      setViewingCV(false);
    }
  };

  const handleCloseCvModal = () => {
    setCvModalOpen(false);
    if (cvPdfUrl) {
      window.URL.revokeObjectURL(cvPdfUrl);
      setCvPdfUrl(null);
    }
  };

  const validateForm = () => {
    const errors = {};

    // Phone validation (if provided) - normalize edilmiş halini kontrol et
    if (formData.secondaryPhone) {
      const normalized = normalizePhoneNumber(formData.secondaryPhone);
      if (!/^[0-9]{10}$/.test(normalized)) {
        errors.secondaryPhone = "Telefon numarası 10 haneli olmalıdır";
      }
    }

    // Adres validation:
    // Eğer şehir seçildiyse ilçe ve mahalle zorunlu olsun, aksi halde backend'e eksik adres gitmesin
    const hasCity = ikametgahForm.cityId && ikametgahForm.cityId !== "";
    if (hasCity) {
      if (!ikametgahForm.districtId) {
        errors.address =
          "İlçe ve mahalle seçmek zorunludur. Lütfen ilçe ve mahalle seçiniz.";
      } else if (!ikametgahForm.neighbourhoodId) {
        errors.address = "Mahalle seçmek zorunludur. Lütfen mahalle seçiniz.";
      }
    }

    // Hataları state'e yaz (input altında göstermek için)
    setFormErrors(errors);

    // Hata objesini döndür ki submit tarafında anlık olarak kullanılabilsin
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      // Adres özel durumu için daha net mesaj göster
      if (errors.address) {
        showToast({
          type: "error",
          message: errors.address,
          duration: 4000,
        });
      } else {
        showToast({
          type: "error",
          message: "Lütfen form hatalarını kontrol edin.",
          duration: 3000,
        });
      }
      return;
    }

    setSaving(true);

    // Convert string status values to boolean/null for API
    const convertStatusToBoolean = (value) => {
      if (value === "null" || value === null || value === undefined)
        return null;
      return value === "true" || value === true;
    };

    // Prepare data for API (only send fields that are editable)
    const updateData = {
      secondaryPhone: formData.secondaryPhone
        ? normalizePhoneNumber(formData.secondaryPhone)
        : null,
      gender: formData.gender || null,
      address: ikametgahForm.address || null,
      addressNeighbourhoodId: ikametgahForm.neighbourhoodId
        ? parseInt(ikametgahForm.neighbourhoodId)
        : null,
      nationalityId: formData.nationalityId
        ? parseInt(formData.nationalityId)
        : null,
      workingStatus: convertStatusToBoolean(formData.workingStatus),
      militaryStatus: convertStatusToBoolean(formData.militaryStatus),
      retirementStatus: convertStatusToBoolean(formData.retirementStatus),
      smokingStatus: convertStatusToBoolean(formData.smokingStatus),
      isDisabledPerson: convertStatusToBoolean(formData.isDisabledPerson),
      isMarried: convertStatusToBoolean(formData.isMarried),
    };

    await updateProfileApi.execute(() => updateProfile(updateData), {
      successMessage: "Profil bilgileriniz başarıyla güncellendi",
      onSuccess: () => {
        setSaving(false);
      },
      onError: () => {
        setSaving(false);
      },
    });
  };

  // genderOptions, nationalityOptions, cityOptions moved to PersonalInfoSection component

  // userSectorIds moved to SectorsSection component

  // getSectorName moved to SectorsSection component

  // getLanguageName moved to LanguagesSection component

  // Helper function to safely extract exam name as string
  // getExamName moved to ExamsSection component

  // Helper function to format profession level display
  // getProfessionLevelDisplay and getProfessionName moved to ProfessionsSection component

  // getDrivingLicenseTypeName moved to DrivingLicensesSection component

  // Get user's current language IDs
  // userLanguageIds and availableLanguageOptions moved to LanguagesSection component

  // levelOptions moved to LanguagesSection and ProfessionsSection components

  // Exams dropdown options
  // userExamIds and availableExamOptions moved to ExamsSection component

  // availableSectorOptions moved to SectorsSection component

  // userDrivingLicenseTypeIds and availableDrivingLicenseTypeOptions moved to DrivingLicensesSection component

  // userProfessionIds and availableProfessionOptions moved to ProfessionsSection component

  const tabs = [
    { id: "personal", label: "Kişisel Bilgiler", icon: User },
    { id: "work", label: "İş Deneyimi", icon: Briefcase },
    { id: "education", label: "Eğitim Bilgileri", icon: GraduationCap },
    { id: "languages-exams", label: "Yetenekler & Belgeler", icon: FileCheck },
    { id: "change-password", label: "Şifre Değiştir", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 py-4 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* LEFT SIDEBAR */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Card */}
            <ProfileHeader
              user={user}
              lookups={lookups}
              missingKeys={personalMissingKeys}
              onUploadPicture={async (file) => {
                setUploadingPicture(true);
                try {
                  const result = await uploadProfilePicture(file);
                  if (result.success) {
                    showToast({
                      type: "success",
                      message: "Profil fotoğrafı başarıyla yüklendi",
                      duration: 3000,
                    });
                  } else {
                    showToast({
                      type: "error",
                      message:
                        result.error || "Fotoğraf yüklenirken bir hata oluştu",
                      duration: 3000,
                    });
                  }
                } finally {
                  setUploadingPicture(false);
                }
              }}
              onDeletePicture={handleDeletePicture}
              uploadingPicture={uploadingPicture}
              deletingPicture={deletingPicture}
            />

            {/* Navigation Menu */}
            <Card className="shadow-sm">
              <nav className="flex flex-col p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const missingCount = getMissingCountForTab(tab.id);
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        activeTab === tab.id
                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          activeTab === tab.id
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      />
                      <span className="flex-1 text-left">{tab.label}</span>
                      {missingCount > 0 && (
                        <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold bg-red-500 text-white">
                          {missingCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* RIGHT CONTENT */}
          <div className="lg:col-span-9 space-y-6">
            {/* Header for Mobile/Title */}
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 break-words">
                  {tabs.find((t) => t.id === activeTab)?.label}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Bilgilerinizi güncel tutarak daha iyi iş fırsatları yakalayın
                </p>
              </div>
              {activeTab === "personal" && (
                <div className="flex-shrink-0">
                  <Button
                    onClick={handleViewCV}
                    disabled={viewingCV}
                    variant="outline"
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    {viewingCV ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Yükleniyor...
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        CV Görüntüle
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Content Area */}
            {activeTab === "personal" && (
              <>
                <PersonalInfoSection
                  user={user}
                  lookups={lookups}
                  formData={formData}
                  formErrors={formErrors}
                  missingKeys={personalMissingKeys}
                  onInputChange={handleInputChange}
                  onCheckboxChange={handleCheckboxChange}
                  onStatusChange={handleStatusChange}
                  onSubmit={handleSubmit}
                  sendEmailVerificationCode={sendEmailVerificationCode}
                  verifyEmail={verifyEmail}
                  requestEmailChange={requestEmailChange}
                  verifyEmailChange={verifyEmailChange}
                  sendPhoneVerificationCode={sendPhoneVerificationCode}
                  verifyPhone={verifyPhone}
                  requestPhoneChange={requestPhoneChange}
                  verifyPhoneChange={verifyPhoneChange}
                  getDistrictsByCity={getDistrictsByCity}
                  getNeighbourhoodsByDistrict={getNeighbourhoodsByDistrict}
                  onAddressChange={(addressData) => {
                    setIkametgahForm({
                      cityId: addressData.cityId || "",
                      districtId: addressData.districtId || "",
                      neighbourhoodId: addressData.neighbourhoodId || "",
                      address: addressData.address || "",
                    });
                  }}
                  loading={loading}
                  saving={saving}
                />

                {/* Description Section */}
                <DescriptionSection
                  user={user}
                  onUpdateDescription={updateDescription}
                  loading={loading}
                />

                {/* Driving Licenses Section */}
                <DrivingLicensesSection
                  user={user}
                  lookups={lookups}
                  onAddDrivingLicense={async (drivingLicenseTypeId) => {
                    return await addDrivingLicense(drivingLicenseTypeId);
                  }}
                  onRemoveDrivingLicense={async (drivingLicenseTypeId) => {
                    return await deleteDrivingLicense(drivingLicenseTypeId);
                  }}
                  loading={loading}
                />

                {/* Documents Section */}
                <DocumentsSection
                  user={user}
                  missingKeys={personalMissingKeys}
                  onUploadCriminalRecord={handleUploadCriminalRecord}
                  onUpdateCriminalRecordStatus={
                    handleUpdateCriminalRecordStatus
                  }
                  isCriminalRecorded={isCriminalRecorded}
                  onCriminalRecordStatusChange={
                    handleCriminalRecordStatusChange
                  }
                  loading={loading}
                />
              </>
            )}

            {activeTab === "work" && (
              <>
                {/* Sectors Section */}
                <SectorsSection
                  user={user}
                  lookups={lookups}
                  missingKeys={workMissingKeys}
                  onAddSector={async (sectorId) => {
                    return await addSector(parseInt(sectorId));
                  }}
                  onRemoveSector={async (sectorId) => {
                    // sectorId string olarak gelebilir, backend sayı bekliyor olabilir
                    // Ama endpoint'te string olarak kullanılması normal
                    return await removeSector(sectorId);
                  }}
                  loading={loading}
                />

                {/* Professions Section */}
                <ProfessionsSection
                  user={user}
                  lookups={lookups}
                  missingKeys={workMissingKeys}
                  searchProfessions={searchProfessions}
                  onAddProfession={async (payload) => {
                    return await addProfession(payload);
                  }}
                  onRemoveProfession={async (professionId) => {
                    return await deleteProfession(professionId);
                  }}
                  loading={loading}
                />

                {/* Work Experience Section */}
                <WorkExperienceSection
                  user={user}
                  lookups={lookups}
                  searchProfessions={searchProfessions}
                  onAddWorkExperience={async (payload) => {
                    return await addWorkExperience(payload);
                  }}
                  onRemoveWorkExperience={async (workExperienceId) => {
                    return await deleteWorkExperience(workExperienceId);
                  }}
                  loading={loading}
                />
              </>
            )}

            {activeTab === "education" && (
              <>
                {/* Education Section */}
                <EducationSection
                  user={user}
                  lookups={lookups}
                  onAddEducation={async (educationData) => {
                    return await addEducation(educationData);
                  }}
                  onRemoveEducation={async (educationId) => {
                    return await deleteEducation(educationId);
                  }}
                  getUniversities={getUniversities}
                  getFacultiesByUniversity={getFacultiesByUniversity}
                  getDepartmentsByFaculty={getDepartmentsByFaculty}
                  getSchoolsByCityAndType={getSchoolsByCityAndType}
                  loading={loading}
                />
              </>
            )}

            {activeTab === "change-password" && (
              <>
                {/* Change Password Section */}
                <ChangePasswordSection
                  onChangePassword={async (
                    currentPassword,
                    newPassword,
                    confirmPassword,
                  ) => {
                    return await changePassword(
                      currentPassword,
                      newPassword,
                      confirmPassword,
                    );
                  }}
                  loading={loading}
                />
              </>
            )}

            {activeTab === "languages-exams" && (
              <>
                {/* Languages Section */}
                <LanguagesSection
                  user={user}
                  lookups={lookups}
                  onAddLanguage={async (payload) => {
                    return await addLanguage(payload);
                  }}
                  onRemoveLanguage={async (languageId) => {
                    return await deleteLanguage(languageId);
                  }}
                  loading={loading}
                />

                {/* Exams Section */}
                <ExamsSection
                  user={user}
                  lookups={lookups}
                  onAddExam={async (payload) => {
                    return await addExam(payload);
                  }}
                  onRemoveExam={async (examId) => {
                    return await deleteExam(examId);
                  }}
                  loading={loading}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* CV Görüntüleme Modal */}
      <Modal
        isOpen={cvModalOpen}
        onClose={handleCloseCvModal}
        title="CV Görüntüle"
        size="full"
        className="max-w-6xl"
      >
        {cvPdfUrl && (
          <div className="w-full h-[80vh]">
            <iframe
              src={cvPdfUrl}
              className="w-full h-full border-0 rounded-lg"
              title="CV PDF"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Profile;
