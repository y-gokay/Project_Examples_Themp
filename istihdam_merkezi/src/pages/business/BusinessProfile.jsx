import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store";
import { ROLES, ROUTES } from "../../constants";
import { error as logError } from "../../utils/logger";
import { useApiCall } from "../../hooks/useApiCall";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Select,
  Textarea,
  Badge,
} from "../../components/ui";
import {
  Loader2,
  Save,
  Building2,
  Mail,
  Phone,
  MapPin,
  Users,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Globe,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { showToast } from "../../components/ui/Toast";
import { Skeleton } from "../../components/ui";
import {
  formatPhoneNumberDisplay,
  normalizePhoneNumber,
} from "../../utils/helpers";

const BusinessProfile = () => {
  const navigate = useNavigate();
  const {
    user,
    getBusinessProfile,
    submitBusinessChangeRequest,
    getPendingBusinessChangeRequest,
    getBusinessChangeRequests,
    cancelBusinessChangeRequest,
    addBusinessSector,
    removeBusinessSector,
    getLookups,
    getBusinessAccounts,
    lookups,
    loading,
  } = useAppStore();

  const [profile, setProfile] = useState(null);
  const [pendingRequest, setPendingRequest] = useState(null);
  const [changeRequests, setChangeRequests] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isOperator, setIsOperator] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    address: "",
    businessEmail: "",
    businessContactPhoneNumber: "",
    workerCount: "",
    description: "",
    vergiNo: "",
    sectorIds: [],
  });
  const [errors, setErrors] = useState({});
  const [isAddingSector, setIsAddingSector] = useState(false);
  const [selectedSectorId, setSelectedSectorId] = useState("");
  const [removingSectorId, setRemovingSectorId] = useState(null);
  const [expandedRequests, setExpandedRequests] = useState(new Set());
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const profileLoadedRef = useRef(false);

  // API call hooks
  const addSectorApi = useApiCall();
  const removeSectorApi = useApiCall();

  const workerCountOptions = [
    { value: "", label: "Seçiniz" },
    { value: "1-10", label: "1-10" },
    { value: "11-50", label: "11-50" },
    { value: "51-100", label: "51-100" },
    { value: "100+", label: "100+" },
  ];

  useEffect(() => {
    // Wait for user to be loaded
    if (!user) {
      return;
    }

    // Check if user is not business/employer, redirect to seeker profile
    const userRole = user?.role || user?.userType;
    if (
      userRole !== ROLES.EMPLOYER &&
      userRole !== "employer" &&
      userRole !== "business"
    ) {
      navigate(ROUTES.PROFILE, { replace: true });
      return;
    }

    // Prevent duplicate API calls in Strict Mode
    if (profileLoadedRef.current) {
      return;
    }
    profileLoadedRef.current = true;

    // Profil ve diğer verileri sıralı olarak yükle
    // Önce profil yüklensin, sonra bekleyen istek kontrol edilsin
    const loadData = async () => {
      try {
        // Sektör lookup'ını paralel yükle
        getLookups("sectors");

        // Önce profili yükle
        await loadProfile();

        // Operatör kontrolü için accounts'u yükle
        await loadOperatorStatus();

        // Sonra bekleyen istek ve change request'leri paralel yükle
        await Promise.all([loadPendingRequest(), loadChangeRequests()]);
      } catch (error) {
        logError("Error loading business profile data:", error);
      }
    };

    loadData();

    // Cleanup: Component unmount olduğunda ref'i resetle
    return () => {
      profileLoadedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  const loadProfile = async (skipCache = false) => {
    try {
      setLoadingProfile(true);
      // Cache'i bypass etmek için skipCache parametresi kullanılabilir
      const result = await getBusinessProfile(skipCache);
      if (result.success && result.data) {
        setProfile(result.data);
        // Form data'yı mevcut profil ile doldur
        // loadPendingRequest henüz çalışmadığı için direkt güncelle
        setFormData({
          businessName: result.data.businessName || "",
          address: result.data.address || "",
          businessEmail: result.data.businessEmail || "",
          businessContactPhoneNumber:
            result.data.businessContactPhoneNumber || "",
          workerCount: result.data.workerCount || "",
          description: result.data.description || "",
          vergiNo: result.data.vergiNo || "",
          sectorIds: (result.data.sectors || []).map(
            (s) => s.sectorId || s.sector?.id || s.id,
          ),
        });
      } else {
        logError("Business profile load error:", result.error);
        showToast({
          type: "error",
          message: result.error || "Profil bilgileri yüklenemedi",
          duration: 3000,
        });
      }
    } catch (error) {
      logError("Error loading business profile:", error);
      showToast({
        type: "error",
        message: "Profil bilgileri yüklenirken bir hata oluştu",
        duration: 3000,
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const loadPendingRequest = async (skipCache = false) => {
    const result = await getPendingBusinessChangeRequest(skipCache);
    if (result.success && result.data) {
      setPendingRequest(result.data);
      // Eğer bekleyen istek varsa, formu newPayload ile doldur
      const newPayload = result.data.newPayload || {};
      setFormData((prev) => ({
        ...prev,
        businessName: newPayload.businessName || prev.businessName || "",
        address: newPayload.address || prev.address || "",
        businessEmail: newPayload.businessEmail || prev.businessEmail || "",
        businessContactPhoneNumber:
          newPayload.businessContactPhoneNumber ||
          prev.businessContactPhoneNumber ||
          "",
        workerCount: newPayload.workerCount || prev.workerCount || "",
        description: newPayload.description || prev.description || "",
        vergiNo: newPayload.vergiNo || prev.vergiNo || "",
        sectorIds:
          newPayload.sectorIds && newPayload.sectorIds.length > 0
            ? newPayload.sectorIds
            : prev.sectorIds || [],
      }));
    } else {
      // Bekleyen istek yoksa null yap
      setPendingRequest(null);
      // Eğer profil yüklendiyse, formData'yı profil verisi ile güncelle
      if (profile) {
        setFormData({
          businessName: profile.businessName || "",
          address: profile.address || "",
          businessEmail: profile.businessEmail || "",
          businessContactPhoneNumber: profile.businessContactPhoneNumber || "",
          workerCount: profile.workerCount || "",
          description: profile.description || "",
          vergiNo: profile.vergiNo || "",
          sectorIds: (profile.sectors || []).map(
            (s) => s.sectorId || s.sector?.id || s.id,
          ),
        });
      }
    }
  };

  const loadChangeRequests = async () => {
    const result = await getBusinessChangeRequests();
    if (result.success) {
      setChangeRequests(result.data || []);
    }
  };

  const handleNonOperatorEditClick = () => {
    showToast({
      type: "info",
      message:
        'Bu hesapla şirket profilinde değişiklik yapma yetkiniz bulunmuyor. Sadece "Operatör" yetkisine sahip kullanıcılar değişiklik isteği gönderebilir.',
      duration: 5000,
    });
  };

  const loadOperatorStatus = async () => {
    const result = await getBusinessAccounts();
    if (result.success && result.data) {
      const accounts = result.data || [];
      const currentAccount = accounts.find((acc) => acc.email === user?.email);
      setIsOperator(currentAccount?.isOperator === true);
    }
  };

  const handleAddSector = async () => {
    if (!selectedSectorId) {
      showToast({
        type: "error",
        message: "Lütfen bir sektör seçin",
        duration: 3000,
      });
      return;
    }

    await addSectorApi.execute(() => addBusinessSector(parseInt(selectedSectorId)), {
      successMessage: "Sektör başarıyla eklendi",
      onSuccess: () => {
        setSelectedSectorId("");
        // Cache'i bypass ederek profili yeniden yükle
        loadProfile(true);
      },
    });
  };

  const handleRemoveSector = async (sectorId) => {
    if (!window.confirm("Bu sektörü kaldırmak istediğinizden emin misiniz?")) {
      return;
    }

    setRemovingSectorId(sectorId);
    await removeSectorApi.execute(() => removeBusinessSector(sectorId), {
      successMessage: "Sektör başarıyla kaldırıldı",
      onSuccess: () => {
        setRemovingSectorId(null);
        // Cache'i bypass ederek profili yeniden yükle
        loadProfile(true);
      },
      onError: () => {
        setRemovingSectorId(null);
      },
    });
  };

  // FormData ile mevcut profil arasında değişiklik olup olmadığını kontrol et
  const hasChanges = () => {
    if (!profile) return false;

    // Telefon numarasını normalize et ve karşılaştır
    const currentPhone = profile.businessContactPhoneNumber || "";
    const formPhone = formData.businessContactPhoneNumber || "";
    const normalizedCurrentPhone = normalizePhoneNumber(currentPhone);
    const normalizedFormPhone = normalizePhoneNumber(formPhone);

    // Sektör ID'lerini karşılaştır
    const currentSectorIds = (profile.sectors || [])
      .map((s) => s.sectorId || s.sector?.id || s.id)
      .sort();
    const formSectorIds = (formData.sectorIds || [])
      .map((id) => Number(id))
      .sort();

    // String karşılaştırması için normalize et
    const sectorIdsEqual =
      JSON.stringify(currentSectorIds) === JSON.stringify(formSectorIds);

    // Tüm alanları karşılaştır
    const changes = {
      businessName:
        (profile.businessName || "").trim() !==
        (formData.businessName || "").trim(),
      address:
        (profile.address || "").trim() !== (formData.address || "").trim(),
      businessEmail:
        (profile.businessEmail || "").trim() !==
        (formData.businessEmail || "").trim(),
      businessContactPhoneNumber:
        normalizedCurrentPhone !== normalizedFormPhone,
      workerCount: (profile.workerCount || "") !== (formData.workerCount || ""),
      description:
        (profile.description || "").trim() !==
        (formData.description || "").trim(),
      vergiNo:
        (profile.vergiNo || "").trim() !== (formData.vergiNo || "").trim(),
      sectorIds: !sectorIdsEqual,
    };

    // Herhangi bir değişiklik var mı?
    return Object.values(changes).some((changed) => changed === true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Telefon ve vergi no için sadece rakam kabul et
    let processedValue = value;
    if (name === "businessContactPhoneNumber" || name === "vergiNo") {
      // Sadece rakamları al
      processedValue = value.replace(/\D/g, "");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    // Hata varsa temizle
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Telefon numarası için özel handler - formatlanmış göster ama sadece rakamları sakla
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Sadece rakamları al
    const digitsOnly = value.replace(/\D/g, "");

    setFormData((prev) => ({
      ...prev,
      businessContactPhoneNumber: digitsOnly,
    }));

    // Hata varsa temizle
    if (errors.businessContactPhoneNumber) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.businessContactPhoneNumber;
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Şirket adı validasyonu
    if (!formData.businessName || formData.businessName.trim() === "") {
      newErrors.businessName = "Şirket adı zorunludur";
    } else if (formData.businessName.trim().length < 2) {
      newErrors.businessName = "Şirket adı en az 2 karakter olmalıdır";
    }

    // Adres validasyonu
    if (!formData.address || formData.address.trim() === "") {
      newErrors.address = "Adres zorunludur";
    } else if (formData.address.trim().length < 10) {
      newErrors.address = "Adres en az 10 karakter olmalıdır";
    }

    // E-posta validasyonu
    if (!formData.businessEmail || formData.businessEmail.trim() === "") {
      newErrors.businessEmail = "E-posta adresi zorunludur";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.businessEmail.trim())) {
        newErrors.businessEmail = "Geçerli bir e-posta adresi giriniz";
      }
    }

    // Telefon numarası validasyonu
    if (
      !formData.businessContactPhoneNumber ||
      formData.businessContactPhoneNumber.trim() === ""
    ) {
      newErrors.businessContactPhoneNumber = "Telefon numarası zorunludur";
    } else {
      // Sadece rakamları al
      const phoneDigits = formData.businessContactPhoneNumber.replace(
        /\D/g,
        "",
      );
      if (phoneDigits.length < 10 || phoneDigits.length > 11) {
        newErrors.businessContactPhoneNumber =
          "Telefon numarası 10 veya 11 haneli olmalıdır";
      }
    }

    // Çalışan sayısı validasyonu
    if (!formData.workerCount || formData.workerCount === "") {
      newErrors.workerCount = "Çalışan sayısı zorunludur";
    }

    // Vergi numarası validasyonu
    if (!formData.vergiNo || formData.vergiNo.trim() === "") {
      newErrors.vergiNo = "Vergi numarası zorunludur";
    } else {
      // Sadece rakamları al
      const vergiDigits = formData.vergiNo.replace(/\D/g, "");
      if (vergiDigits.length !== 10) {
        newErrors.vergiNo = "Vergi numarası 10 haneli olmalıdır";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // İlk hatayı bul ve göster
      const firstErrorKey = Object.keys(errors)[0];
      const firstError = errors[firstErrorKey];

      showToast({
        type: "error",
        message: firstError || "Lütfen form hatalarını düzeltin",
        duration: 4000,
      });

      // Scroll to first error
      if (firstErrorKey) {
        const element = document.querySelector(`[name="${firstErrorKey}"]`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          // Focus the element
          setTimeout(() => {
            element.focus();
          }, 300);
        }
      }
      return;
    }

    setIsSubmitting(true);
    try {
      // Telefon numarasını normalize et (başındaki 0'ı kaldır)
      const normalizedPhone = formData.businessContactPhoneNumber
        ? normalizePhoneNumber(formData.businessContactPhoneNumber)
        : "";

      // sectorIds'i array olarak gönder
      const submitData = {
        ...formData,
        businessContactPhoneNumber: normalizedPhone,
        sectorIds: Array.isArray(formData.sectorIds) ? formData.sectorIds : [],
      };

      const result = await submitBusinessChangeRequest(submitData);

      if (result.success) {
        showToast({
          type: "success",
          message:
            result.message ||
            "Değişiklik isteği başarıyla gönderildi. Onay bekleniyor.",
          duration: 5000,
        });
        setIsEditing(false);
        setErrors({});
        // Cache'i bypass ederek pending request'i ve geçmişi tazeleyelim
        loadPendingRequest(true);
        loadChangeRequests();
      } else {
        // Backend'den gelen errors array'ini kullan
        const backendErrors = {};
        if (result.errors && Array.isArray(result.errors)) {
          result.errors.forEach((error) => {
            const field = error.field;
            const message = error.message || error.msg;
            if (field && message) {
              // Aynı field için birden fazla hata varsa birleştir
              if (backendErrors[field]) {
                backendErrors[field] += `, ${message}`;
              } else {
                backendErrors[field] = message;
              }
            }
          });
        }

        // Backend errors varsa kullan, yoksa genel hata mesajı
        if (Object.keys(backendErrors).length > 0) {
          setErrors(backendErrors);

          // İlk hatayı toast olarak göster
          const firstErrorKey = Object.keys(backendErrors)[0];
          const firstError = backendErrors[firstErrorKey];

          showToast({
            type: "error",
            message: firstError || "Lütfen form hatalarını düzeltin",
            duration: 4000,
          });

          // Scroll to first error
          const element = document.querySelector(`[name="${firstErrorKey}"]`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            setTimeout(() => {
              element.focus();
            }, 300);
          }
        } else {
          showToast({
            type: "error",
            message: result.error || "Değişiklik isteği gönderilemedi",
            duration: 3000,
          });
        }
      }
    } catch (err) {
      logError("Error submitting change request:", err);
      showToast({
        type: "error",
        message: "Bağlantı hatası. Lütfen tekrar deneyin.",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelChangeRequest = async () => {
    if (
      !window.confirm(
        "Bekleyen değişiklik isteğini iptal etmek istediğinize emin misiniz?",
      )
    ) {
      return;
    }

    try {
      const result = await cancelBusinessChangeRequest();
      if (result.success) {
        showToast({
          type: "success",
          message: result.message || "Değişiklik isteği başarıyla iptal edildi",
          duration: 3000,
        });

        // State'leri sıfırla
        setPendingRequest(null);
        setIsEditing(false);

        // Profili yeniden yükle ve formData'yı güncelle
        await loadProfile(true);

        // Bekleyen isteği kontrol et (null olmalı)
        await loadPendingRequest();

        // Change requests'i güncelle
        await loadChangeRequests();

        // FormData'yı mevcut profil ile sıfırla
        if (profile) {
          setFormData({
            businessName: profile.businessName || "",
            address: profile.address || "",
            businessEmail: profile.businessEmail || "",
            businessContactPhoneNumber:
              profile.businessContactPhoneNumber || "",
            workerCount: profile.workerCount || "",
            description: profile.description || "",
            vergiNo: profile.vergiNo || "",
            sectorIds: (profile.sectors || []).map(
              (s) => s.sectorId || s.sector?.id || s.id,
            ),
          });
        }

        // Hataları temizle
        setErrors({});
      } else {
        showToast({
          type: "error",
          message: result.error || "Değişiklik isteği iptal edilemedi",
          duration: 3000,
        });
      }
    } catch (error) {
      showToast({
        type: "error",
        message: error.message || "Bağlantı hatası. Lütfen tekrar deneyin.",
        duration: 3000,
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        label: "Beklemede",
        icon: Clock,
        className:
          "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
      },
      approved: {
        label: "Onaylandı",
        icon: CheckCircle,
        className:
          "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800",
      },
      rejected: {
        label: "Reddedildi",
        icon: XCircle,
        className:
          "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800",
      },
      cancelled: {
        label: "İptal Edildi",
        icon: XCircle,
        className:
          "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.className} flex items-center gap-1 border`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "-";
      }
      return date.toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (err) {
      logError("Date formatting error:", err);
      return "-";
    }
  };

  const getFieldLabel = (field) => {
    const labels = {
      businessName: "Şirket Adı",
      address: "Adres",
      businessEmail: "E-posta",
      businessContactPhoneNumber: "Telefon",
      workerCount: "Çalışan Sayısı",
      description: "Açıklama",
      vergiNo: "Vergi No",
      sectorIds: "Sektörler",
    };
    return labels[field] || field;
  };

  const getSectorNames = (sectorIds, allSectors) => {
    if (!Array.isArray(sectorIds) || sectorIds.length === 0) return "-";
    if (!Array.isArray(allSectors)) return sectorIds.join(", ");
    return sectorIds
      .map((id) => {
        const sector = allSectors.find((s) => s.id === id);
        return sector?.sector || sector?.title || sector?.name || id;
      })
      .join(", ");
  };

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">
          Profil bilgileri yüklenemedi
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Şirket Profili
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Şirket bilgilerinizi görüntüleyin ve güncelleyin
          </p>
        </div>
        {!isEditing &&
          !pendingRequest &&
          (isOperator ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Değişiklik İste</span>
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={handleNonOperatorEditClick}
              className="flex items-center gap-2 cursor-pointer"
            >
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>Değişiklik Yetkiniz Yok</span>
            </Button>
          ))}
      </div>

      {/* Pending Request Alert */}
      {pendingRequest && pendingRequest.id && (
        <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
                      Bekleyen Değişiklik İsteği
                    </h3>
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      {formatDate(pendingRequest.createdAt)} tarihinde
                      gönderilen değişiklik isteğiniz onay bekliyor.
                    </p>
                  </div>
                  {getStatusBadge(pendingRequest.status || "pending")}
                </div>
                {isOperator && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelChangeRequest}
                    disabled={loading}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:border-red-500 dark:hover:border-red-600 flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    <span>İsteği İptal Et</span>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Info */}
      <div className="grid grid-cols-1 gap-6">
        {/* Main Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Şirket Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {(isEditing && isOperator) || (pendingRequest && isOperator) ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Şirket Adı"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    error={errors.businessName}
                    leftIcon={
                      <Building2 className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    }
                    required
                  />
                  <Input
                    label="Vergi No"
                    name="vergiNo"
                    value={formData.vergiNo}
                    onChange={handleChange}
                    error={errors.vergiNo}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Şirket E-posta"
                    type="email"
                    name="businessEmail"
                    value={formData.businessEmail}
                    onChange={handleChange}
                    error={errors.businessEmail}
                    leftIcon={
                      <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    }
                    required
                  />
                  <Input
                    label="Şirket Telefon"
                    type="tel"
                    name="businessContactPhoneNumber"
                    value={
                      formData.businessContactPhoneNumber
                        ? formatPhoneNumberDisplay(
                            formData.businessContactPhoneNumber,
                          )
                        : ""
                    }
                    onChange={handlePhoneChange}
                    error={errors.businessContactPhoneNumber}
                    leftIcon={
                      <Phone className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    }
                    placeholder="0(5xx) xxx xx xx"
                    required
                  />
                </div>

                <Textarea
                  label="Adres"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  error={errors.address}
                  rows={3}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select
                    label="Çalışan Sayısı"
                    name="workerCount"
                    value={formData.workerCount}
                    onChange={handleChange}
                    error={errors.workerCount}
                    options={workerCountOptions}
                    required
                  />
                </div>

                <Textarea
                  label="Şirket Açıklaması"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  error={errors.description}
                  rows={4}
                />

                {/* Sektörler Bölümü */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-base font-medium text-gray-700 dark:text-gray-300">
                      Sektörler
                    </label>
                    {isOperator && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setIsAddingSector(!isAddingSector)}
                        className="flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{isAddingSector ? "İptal" : "Sektör Ekle"}</span>
                      </Button>
                    )}
                  </div>

                  {isAddingSector && profile && isOperator && (
                    <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      {(() => {
                        const availableSectors = Array.isArray(lookups.sectors)
                          ? lookups.sectors.filter(
                              (sector) =>
                                sector &&
                                sector.id &&
                                !(profile?.sectors || []).some(
                                  (ps) =>
                                    ps &&
                                    (ps.sectorId === sector.id ||
                                      ps.sector?.id === sector.id ||
                                      (typeof ps === "number" &&
                                        ps === sector.id)),
                                ),
                            )
                          : [];

                        const sectorOptions = [
                          { value: "", label: "Sektör Seçiniz" },
                          ...availableSectors.map((sector) => ({
                            value: String(sector.id || ""),
                            label:
                              sector.sector ||
                              sector.title ||
                              sector.name ||
                              "Bilinmeyen",
                          })),
                        ];

                        return (
                          <Select
                            label="Sektör Seçin"
                            value={selectedSectorId}
                            onChange={(e) =>
                              setSelectedSectorId(e.target.value)
                            }
                            options={sectorOptions}
                            className="mb-3"
                          />
                        );
                      })()}
                      <Button
                        type="button"
                        onClick={handleAddSector}
                        disabled={!selectedSectorId || addSectorApi.loading}
                        size="sm"
                        className="w-full flex items-center justify-center gap-2"
                      >
                        {addSectorApi.loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Ekleniyor...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            <span>Sektör Ekle</span>
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {profile.sectors && profile.sectors.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.sectors.map((item) => {
                        const sectorId = item.sectorId || item.sector?.id;
                        const isRemoving = removingSectorId === sectorId;
                        return (
                          <Badge
                            key={item.id}
                            variant="default"
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                          >
                            <span className="font-medium">
                              {item.sector?.sector ||
                                item.sector?.title ||
                                item.sector?.name}
                            </span>
                            {isOperator && (
                              <button
                                onClick={() => handleRemoveSector(sectorId)}
                                disabled={isRemoving || removeSectorApi.loading}
                                className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors disabled:opacity-50"
                                title="Sektörü Kaldır"
                              >
                                {isRemoving ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <X className="w-3 h-3" />
                                )}
                              </button>
                            )}
                          </Badge>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Henüz sektör eklenmemiş
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={isSubmitting || loading || !hasChanges()}
                    className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting || loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Gönderiliyor...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Değişiklik İsteği Gönder</span>
                      </>
                    )}
                  </Button>
                  {isEditing && !pendingRequest && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        // Form'u mevcut profil ile sıfırla
                        setFormData({
                          businessName: profile.businessName || "",
                          address: profile.address || "",
                          businessEmail: profile.businessEmail || "",
                          businessContactPhoneNumber:
                            profile.businessContactPhoneNumber || "",
                          workerCount: profile.workerCount || "",
                          description: profile.description || "",
                          vergiNo: profile.vergiNo || "",
                          sectorIds: (profile.sectors || []).map(
                            (s) => s.sectorId || s.sector?.id || s.id,
                          ),
                        });
                        setErrors({});
                      }}
                    >
                      İptal
                    </Button>
                  )}
                </div>
              </form>
            ) : loadingProfile || !profile ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <Skeleton className="h-3 w-24 mb-2" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <Skeleton className="h-3 w-24 mb-2" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <Skeleton className="h-3 w-24 mb-2" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <Skeleton className="h-3 w-24 mb-2" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                  <div className="md:col-span-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <Skeleton className="h-3 w-24 mb-2" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <Skeleton className="h-3 w-24 mb-2" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Skeleton className="h-3 w-24 mb-2" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Şirket Adı
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-base text-gray-900 dark:text-gray-100">
                      {profile.businessName || "-"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Vergi No
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-base text-gray-900 dark:text-gray-100">
                      {profile.vergiNo || "-"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Şirket E-posta
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-base text-gray-900 dark:text-gray-100">
                      {profile.businessEmail || "-"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Şirket Telefon
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-base text-gray-900 dark:text-gray-100">
                      {profile.businessContactPhoneNumber
                        ? formatPhoneNumberDisplay(
                            profile.businessContactPhoneNumber,
                          )
                        : "-"}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Adres
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-base text-gray-900 dark:text-gray-100">
                      {profile.address || "-"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Çalışan Sayısı
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-base text-gray-900 dark:text-gray-100">
                      {profile?.workerCount ? profile.workerCount : "-"}
                    </div>
                  </div>
                  {profile.websiteUrl ? (
                    <div>
                      <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Web Sitesi
                      </label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <a
                          href={profile.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-base text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
                        >
                          {profile.websiteUrl}
                        </a>
                      </div>
                    </div>
                  ) : null}
                </div>

                {profile.description && (
                  <div>
                    <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Şirket Açıklaması
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-base text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                      {profile.description}
                    </div>
                  </div>
                )}

                {/* Sektörler Bölümü - Görüntüleme Modu */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-base font-medium text-gray-700 dark:text-gray-300">
                      Sektörler
                    </label>
                    {isOperator && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsAddingSector(!isAddingSector)}
                        className="flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{isAddingSector ? "İptal" : "Sektör Ekle"}</span>
                      </Button>
                    )}
                  </div>

                  {isAddingSector && profile && isOperator && (
                    <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      {(() => {
                        const availableSectors = Array.isArray(lookups.sectors)
                          ? lookups.sectors.filter(
                              (sector) =>
                                sector &&
                                sector.id &&
                                !(profile?.sectors || []).some(
                                  (ps) =>
                                    ps &&
                                    (ps.sectorId === sector.id ||
                                      ps.sector?.id === sector.id ||
                                      (typeof ps === "number" &&
                                        ps === sector.id)),
                                ),
                            )
                          : [];

                        const sectorOptions = [
                          { value: "", label: "Sektör Seçiniz" },
                          ...availableSectors.map((sector) => ({
                            value: String(sector.id || ""),
                            label:
                              sector.sector ||
                              sector.title ||
                              sector.name ||
                              "Bilinmeyen",
                          })),
                        ];

                        return (
                          <Select
                            label="Sektör Seçin"
                            value={selectedSectorId}
                            onChange={(e) =>
                              setSelectedSectorId(e.target.value)
                            }
                            options={sectorOptions}
                            className="mb-3"
                          />
                        );
                      })()}
                      <Button
                        onClick={handleAddSector}
                        disabled={!selectedSectorId || addSectorApi.loading}
                        size="sm"
                        className="w-full flex items-center justify-center gap-2"
                      >
                        {addSectorApi.loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Ekleniyor...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            <span>Sektör Ekle</span>
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {profile.sectors && profile.sectors.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.sectors.map((item) => {
                        const sectorId = item.sectorId || item.sector?.id;
                        const isRemoving = removingSectorId === sectorId;
                        return (
                          <Badge
                            key={item.id}
                            variant="default"
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                          >
                            <span className="font-medium">
                              {item.sector?.sector ||
                                item.sector?.title ||
                                item.sector?.name}
                            </span>
                            {isOperator && (
                              <button
                                onClick={() => handleRemoveSector(sectorId)}
                                disabled={isRemoving || removeSectorApi.loading}
                                className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors disabled:opacity-50"
                                title="Sektörü Kaldır"
                              >
                                {isRemoving ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <X className="w-3 h-3" />
                                )}
                              </button>
                            )}
                          </Badge>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">
                        Henüz sektör eklenmemiş
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 rounded-lg border border-blue-200 dark:border-gray-700">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                    Onay Durumu
                  </label>
                  <div className="flex items-center gap-3 flex-wrap">
                    {profile.isApproved ? (
                      <Badge className="bg-green-600 dark:bg-green-700 text-white border-0 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Onaylandı
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-500 dark:bg-yellow-600 text-white border-0 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Onay Bekliyor
                      </Badge>
                    )}
                    {profile.reviewedByAdmin && (
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {profile.reviewedByAdmin.name}{" "}
                        {profile.reviewedByAdmin.surname} tarafından
                        {profile.reviewDate &&
                          ` ${formatDate(profile.reviewDate)} tarihinde`}{" "}
                        incelendi
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Change Requests History - Sadece operatörler için */}
      {changeRequests.length > 0 && isOperator && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Değişiklik İstekleri Geçmişi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {changeRequests.map((request) => {
                const oldPayload = request.oldPayload || {};
                const newPayload = request.newPayload || {};
                const changedFields = Object.keys(newPayload).filter(
                  (key) =>
                    oldPayload[key] !== newPayload[key] && key !== "sectorIds",
                );
                const sectorChanged =
                  JSON.stringify(oldPayload.sectorIds || []) !==
                  JSON.stringify(newPayload.sectorIds || []);

                return (
                  <div
                    key={request.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                          {formatDate(request.createdAt)}
                        </p>
                        {request.reviewedByAdmin && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            İnceleyen: {request.reviewedByAdmin.name}{" "}
                            {request.reviewedByAdmin.surname}
                          </p>
                        )}
                        {request.approvedAt && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Onaylandı: {formatDate(request.approvedAt)}
                          </p>
                        )}
                        {request.rejectedAt && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Reddedildi: {formatDate(request.rejectedAt)}
                          </p>
                        )}
                      </div>
                      {getStatusBadge(request.status || "pending")}
                    </div>

                    {/* Rejection Reason */}
                    {request.status === "rejected" && request.reason && (
                      <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm font-medium text-red-900 dark:text-red-200 mb-1">
                          Red Nedeni:
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          {request.reason}
                        </p>
                      </div>
                    )}

                    {/* Changes Comparison */}
                    {(changedFields.length > 0 || sectorChanged) && (
                      <div className="space-y-4">
                        <button
                          onClick={() => {
                            const newExpanded = new Set(expandedRequests);
                            if (newExpanded.has(request.id)) {
                              newExpanded.delete(request.id);
                            } else {
                              newExpanded.add(request.id);
                            }
                            setExpandedRequests(newExpanded);
                          }}
                          className="flex items-center justify-between w-full text-left font-medium text-gray-900 dark:text-gray-100 text-sm mb-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <span>Yapılan Değişiklikler</span>
                          {expandedRequests.has(request.id) ? (
                            <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          )}
                        </button>
                        {expandedRequests.has(request.id) && (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {changedFields.map((field) => (
                              <div
                                key={field}
                                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                              >
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase">
                                  {getFieldLabel(field)}
                                </p>
                                <div className="space-y-2">
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                      Eski Değer:
                                    </p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 line-through bg-red-50 dark:bg-red-900/30 p-2 rounded">
                                      {oldPayload[field] || "-"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                      Yeni Değer:
                                    </p>
                                    <p className="text-sm text-gray-900 dark:text-gray-100 bg-green-50 dark:bg-green-900/30 p-2 rounded font-medium">
                                      {newPayload[field] || "-"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}

                            {sectorChanged && (
                              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase">
                                  {getFieldLabel("sectorIds")}
                                </p>
                                <div className="space-y-2">
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                      Eski Sektörler:
                                    </p>
                                    <div className="text-sm text-gray-700 dark:text-gray-300 line-through bg-red-50 dark:bg-red-900/30 p-2 rounded">
                                      {getSectorNames(
                                        oldPayload.sectorIds,
                                        lookups.sectors,
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                      Yeni Sektörler:
                                    </p>
                                    <div className="text-sm text-gray-900 dark:text-gray-100 bg-green-50 dark:bg-green-900/30 p-2 rounded font-medium">
                                      {getSectorNames(
                                        newPayload.sectorIds,
                                        lookups.sectors,
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* No Changes Message */}
                    {changedFields.length === 0 && !sectorChanged && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                        Bu istekte değişiklik yapılmamış.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BusinessProfile;
