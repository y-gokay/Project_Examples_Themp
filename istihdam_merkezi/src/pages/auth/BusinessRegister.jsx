import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Input, Select, Checkbox, Textarea } from "../../components/ui";
import { useAppStore } from "../../store";
import { ROUTES } from "../../constants";
import { SEOHead } from "../../components/common";
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  Building2,
  MapPin,
  FileText,
  Users,
  Briefcase,
  Shield,
  Star,
  Check,
  CheckCircle2,
  XCircle,
  Home,
} from "lucide-react";
import { showToast } from "../../components/ui/Toast";
import {
  formatPhoneNumberDisplay,
  normalizePhoneNumber,
  validatePhoneNumber,
  validatePassword,
  validateTcKimlikNumber,
} from "../../utils/helpers";
import atimLogo from "../../assets/atim.webp";
import atimLogoDark from "../../assets/atim_darkmode.webp";
import atakumunEssizSahili from "../../assets/atakumun-essiz-sahili.webp";
import atakumunEssizSahiliGece from "../../assets/atakumun-essiz-sahili-gece.webp";
import { Moon, Sun } from "lucide-react";

const BusinessRegister = () => {
  const navigate = useNavigate();
  const { register, loading, getLookups, lookups, theme, toggleTheme } =
    useAppStore();

  const [formData, setFormData] = useState({
    // Business Info
    businessName: "",
    address: "",
    businessEmail: "",
    businessContactPhoneNumber: "",
    workerCount: "",
    description: "",
    vergiNo: "",
    businessSectors: [],

    // Personal Info
    tc: "",
    name: "",
    surname: "",
    email: "",
    password: "",
    passwordConfirm: "",
    phoneNumber: "",
    roleId: "",

    // Terms
    acceptTerms: false,
    acceptKvkk: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getLookups("sectors");
    getLookups("businessRoles");
  }, [getLookups]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    const isNameField =
      name === "name" || name === "surname" || name === "businessName";

    let nextValue;
    if (type === "checkbox") {
      nextValue = checked;
    } else if (isNameField && typeof value === "string") {
      const lower = value.toLocaleLowerCase("tr-TR");
      nextValue = lower
        .split(" ")
        .map((part) => 
          part ? part.charAt(0).toLocaleUpperCase("tr-TR") + part.slice(1) : ""
        )
        .join(" ");
    } else {
      nextValue = value;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSectorChange = (sectorId) => {
    setFormData((prev) => {
      const sectors = prev.businessSectors || [];
      if (sectors.includes(sectorId)) {
        return {
          ...prev,
          businessSectors: sectors.filter((id) => id !== sectorId),
        };
      } else {
        return {
          ...prev,
          businessSectors: [...sectors, sectorId],
        };
      }
    });
  };

  const workerCountOptions = [
    { value: "", label: "Seçiniz", disabled: true },
    { value: "1-10", label: "1-10" },
    { value: "11-50", label: "11-50" },
    { value: "51-100", label: "51-100" },
    { value: "100+", label: "100+" },
  ];

  const validateForm = () => {
    const newErrors = {};

    // Business Info
    if (!formData.businessName) {
      newErrors.businessName = "Şirket adı zorunludur";
    }
    if (!formData.address) {
      newErrors.address = "Adres zorunludur";
    } else if (formData.address.trim().length < 10) {
      newErrors.address = "Adres en az 10 karakter olmalıdır";
    }
    if (!formData.businessEmail) {
      newErrors.businessEmail = "Şirket e-posta adresi zorunludur";
    } else if (!/\S+@\S+\.\S+/.test(formData.businessEmail)) {
      newErrors.businessEmail = "Geçerli bir e-posta adresi giriniz";
    }
    if (!formData.businessContactPhoneNumber) {
      newErrors.businessContactPhoneNumber =
        "Şirket telefon numarası zorunludur";
    } else {
      const validation = validatePhoneNumber(
        formData.businessContactPhoneNumber,
      );
      if (!validation.isValid) {
        newErrors.businessContactPhoneNumber =
          validation.error || "Geçerli bir telefon numarası giriniz";
      }
    }
    if (!formData.workerCount) {
      newErrors.workerCount = "Çalışan sayısı zorunludur";
    }
    if (!formData.roleId) {
      newErrors.roleId = "Rol seçimi zorunludur";
    }
    if (!formData.vergiNo) {
      newErrors.vergiNo = "Vergi numarası zorunludur";
    } else if (formData.vergiNo.length !== 10) {
      newErrors.vergiNo = "Vergi numarası 10 haneli olmalıdır";
    }
    if (formData.businessSectors.length === 0) {
      newErrors.businessSectors = "En az bir sektör seçmelisiniz";
    }

    // Personal Info
    if (!formData.tc) {
      newErrors.tc = "TC Kimlik No zorunludur";
    } else {
      const tcValidation = validateTcKimlikNumber(formData.tc);
      if (!tcValidation.isValid) {
        newErrors.tc = tcValidation.error || "Geçersiz TC Kimlik No";
      }
    }
    if (!formData.name) {
      newErrors.name = "Ad zorunludur";
    } else {
      const trimmedName = formData.name.trim();
      if (/^\d+$/.test(trimmedName)) {
        newErrors.name = "Ad alanına sadece rakam giremezsiniz";
      }
    }
    if (!formData.surname) {
      newErrors.surname = "Soyad zorunludur";
    } else {
      const trimmedSurname = formData.surname.trim();
      if (/^\d+$/.test(trimmedSurname)) {
        newErrors.surname = "Soyad alanına sadece rakam giremezsiniz";
      }
    }
    if (!formData.email) {
      newErrors.email = "E-posta adresi zorunludur";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Geçerli bir e-posta adresi giriniz";
    }
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Telefon numarası zorunludur";
    } else {
      const validation = validatePhoneNumber(formData.phoneNumber);
      if (!validation.isValid) {
        newErrors.phoneNumber =
          validation.error || "Geçerli bir telefon numarası giriniz";
      }
    }
    if (!formData.password) {
      newErrors.password = "Şifre zorunludur";
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.error;
      }
    }
    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = "Şifre tekrarı zorunludur";
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = "Şifreler eşleşmiyor";
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "Kullanım koşullarını kabul etmelisiniz";
    }
    if (!formData.acceptKvkk) {
      newErrors.acceptKvkk =
        "KVKK aydınlatma metnini bilgilendirildim olarak işaretleyiniz";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // İlk hatayı bul ve göster
      const firstErrorKey = Object.keys(errors)[0];
      const firstErrorMessage = errors[firstErrorKey];
      if (firstErrorMessage) {
        showToast({
          type: "error",
          message: firstErrorMessage,
          duration: 3000,
        });
      } else {
        showToast({
          type: "error",
          message: "Lütfen tüm zorunlu alanları doldurun",
          duration: 3000,
        });
      }
      // İlk hataya scroll yap
      if (firstErrorKey) {
        const element = document.querySelector(`[name="${firstErrorKey}"]`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      return;
    }

    const registerData = {
      businessName: formData.businessName,
      address: formData.address,
      businessEmail: formData.businessEmail,
      businessContactPhoneNumber: normalizePhoneNumber(
        formData.businessContactPhoneNumber,
      ),
      workerCount: formData.workerCount,
      description: formData.description || "",
      vergiNo: formData.vergiNo,
      businessSectors: formData.businessSectors.map((id) => parseInt(id)),
      tc: formData.tc.replace(/\D/g, ""),
      name: formData.name.toLocaleUpperCase("tr-TR"),
      surname: formData.surname.toLocaleUpperCase("tr-TR"),
      email: formData.email,
      password: formData.password,
      phoneNumber: normalizePhoneNumber(formData.phoneNumber),
      roleId: parseInt(formData.roleId),
    };

    const result = await register(registerData, "business");

    if (result.success) {
      showToast({
        type: "success",
        message: "Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...",
        duration: 3000,
      });
      setTimeout(() => {
        navigate(ROUTES.EMPLOYER_LOGIN);
      }, 1500);
    } else {
      const toastMessage =
        result.error && result.error !== "Hatalı istek"
          ? result.error
          : "Lütfen formdaki hataları düzeltin.";

      showToast({
        type: "error",
        message: toastMessage,
        duration: 3000,
      });
      if (result.errors) {
        const fieldErrors = {};
        result.errors.forEach((err) => {
          if (err.field) {
            fieldErrors[err.field] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    }
  };

  return (
    <div className="min-h-screen flex relative bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <SEOHead title="İşveren Kaydı" path="/isveren/kayit" noindex />
      {/* Sol üst anasayfa butonu */}
      <Link
        to={ROUTES.HOME}
        className="fixed top-4 left-4 z-[100] flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-md hover:bg-white dark:hover:bg-gray-800 transition-all hover:scale-105 group"
      >
        <Home className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          Anasayfa
        </span>
      </Link>

      {/* Tema Toggle Butonu */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-[100] p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-md hover:bg-white dark:hover:bg-gray-800 transition-all hover:scale-105"
        aria-label="Tema Değiştir"
      >
        {theme === "dark" ? (
          <Sun className="w-5 h-5 text-yellow-500" />
        ) : (
          <Moon className="w-5 h-5 text-gray-700" />
        )}
      </button>

      <div className="hidden lg:flex lg:w-1/2 lg:fixed lg:left-0 lg:top-0 lg:h-screen relative overflow-hidden">
        <img
          src={theme === "dark" ? atakumunEssizSahiliGece : atakumunEssizSahili}
          alt="Atakum'un Eşsiz Sahili"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 flex items-start justify-center pt-20 px-12">
          <div className="text-white text-center max-w-2xl">
            <div className="mb-8">
              <h1 className="text-6xl md:text-7xl font-extrabold mb-6 tracking-tight drop-shadow-2xl">
                Atakum Belediyesi
              </h1>
              <div className="h-1 w-32 bg-white/80 mx-auto mb-6 rounded-full"></div>
              <p className="text-3xl md:text-4xl font-semibold text-blue-100 tracking-wide">
                İstihdam Merkezi
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 lg:ml-auto flex items-center justify-center bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-8 overflow-y-auto min-h-screen">
        <div className="w-full max-w-2xl py-8">
          <div className="flex justify-center mb-8">
            <Link to={ROUTES.HOME} className="relative group">
              <img
                src={theme === "dark" ? atimLogoDark : atimLogo}
                alt="Atakum Belediyesi Logo"
                className="h-32 object-contain group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute -inset-2 bg-orange-600 rounded-full opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 text-center">
              İşveren Kayıt
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
              Şirketinizi kaydedin ve iş ilanları yayınlayın
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Şirket Bilgileri */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-900 rounded-xl p-6 border border-purple-100 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  Şirket Bilgileri
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Şirket Adı"
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    error={errors.businessName}
                    placeholder="Şirket adınız"
                    leftIcon={<Building2 className="w-5 h-5 text-gray-400" />}
                    required
                    className="transition-all duration-300 focus:scale-[1.02]"
                  />

                  <Input
                    label="Vergi No"
                    type="text"
                    name="vergiNo"
                    value={formData.vergiNo}
                    onChange={handleChange}
                    error={errors.vergiNo}
                    placeholder="10 haneli vergi numarası"
                    leftIcon={<FileText className="w-5 h-5 text-gray-400" />}
                    maxLength={10}
                    required
                    className="transition-all duration-300 focus:scale-[1.02]"
                  />
                </div>

                <div className="md:col-span-2 mt-4">
                  <Textarea
                    label="Adres"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    error={errors.address}
                    placeholder="Şirket adresiniz"
                    rows={4}
                    required
                    className="transition-all duration-300"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label="Şirket E-posta"
                    type="email"
                    name="businessEmail"
                    value={formData.businessEmail}
                    onChange={handleChange}
                    error={errors.businessEmail}
                    placeholder="info@firma.com"
                    leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
                    required
                    className="transition-all duration-300 focus:scale-[1.02]"
                  />

                  <Input
                    label="Şirket Telefon"
                    type="tel"
                    name="businessContactPhoneNumber"
                    value={formatPhoneNumberDisplay(
                      formData.businessContactPhoneNumber,
                    )}
                    onChange={(e) => {
                      // Sadece rakamları al
                      const cleaned = e.target.value.replace(/\D/g, "");
                      // Maksimum 11 haneli olabilir (0 ile başlayabilir)
                      if (cleaned.length <= 11) {
                        setFormData((prev) => ({
                          ...prev,
                          businessContactPhoneNumber: cleaned,
                        }));
                        if (errors.businessContactPhoneNumber) {
                          setErrors((prev) => ({
                            ...prev,
                            businessContactPhoneNumber: "",
                          }));
                        }
                      }
                    }}
                    error={errors.businessContactPhoneNumber}
                    placeholder="0(5xx) xxx xx xx"
                    leftIcon={<Phone className="w-5 h-5 text-gray-400" />}
                    required
                    className="transition-all duration-300 focus:scale-[1.02]"
                  />
                </div>

                <div className="md:col-span-2 mt-4">
                  <Select
                    label="Çalışan Sayısı"
                    name="workerCount"
                    value={formData.workerCount}
                    onChange={handleChange}
                    error={errors.workerCount}
                    options={workerCountOptions}
                    required
                    className="transition-all duration-300"
                  />
                </div>

                <div className="md:col-span-2 mt-4">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4">
                    <span className="w-1.5 h-1.5 bg-purple-600 dark:bg-purple-400 rounded-full"></span>
                    Sektörler <span className="text-red-500">*</span>
                  </label>
                  <div className="relative p-3 sm:p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-900 hover:border-purple-400/60 dark:hover:border-purple-500/60 transition-all duration-300 shadow-sm hover:shadow-md max-h-[280px] sm:max-h-[220px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-300 dark:scrollbar-thumb-purple-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
                    {/* Decorative corner accent */}
                    <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-purple-100/30 dark:from-purple-900/30 to-transparent rounded-bl-2xl pointer-events-none"></div>
                    {lookups.sectors && lookups.sectors.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                        {lookups.sectors.map((sector) => {
                          const isSelected = formData.businessSectors.includes(
                            sector.id?.toString(),
                          );
                          return (
                            <button
                              key={sector.id}
                              type="button"
                              onClick={() =>
                                handleSectorChange(sector.id?.toString())
                              }
                              className={`group relative px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 text-center overflow-hidden flex items-center justify-center gap-2 ${
                                isSelected
                                  ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 scale-[1.02] sm:scale-105 ring-2 ring-purple-400/50"
                                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-400 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-500 hover:bg-gradient-to-br hover:from-purple-50 dark:hover:from-purple-900/30 hover:to-indigo-50 dark:hover:to-indigo-900/30 hover:shadow-md hover:scale-[1.02] sm:hover:scale-105"
                              }`}
                            >
                              {/* Selected check icon */}
                              {isSelected && (
                                <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-4 h-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                  <Check
                                    className="w-3 h-3 text-white"
                                    strokeWidth={3}
                                  />
                                </div>
                              )}
                              {/* Hover effect overlay */}
                              <div
                                className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${
                                  isSelected ? "bg-white" : "bg-purple-600"
                                }`}
                              ></div>
                              <span className="relative z-10">
                                {sector.title || sector.name || sector.sector}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center min-h-[100px]">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 border-4 border-purple-200 dark:border-purple-800 border-t-purple-600 dark:border-t-purple-400 rounded-full animate-spin"></div>
                          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            Sektörler yükleniyor...
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.businessSectors && (
                    <div className="mt-2 sm:mt-3 flex items-center gap-2 text-xs sm:text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg px-3 sm:px-4 py-2">
                      <span className="w-1.5 h-1.5 bg-red-500 dark:bg-red-400 rounded-full"></span>
                      {errors.businessSectors}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 mt-4">
                  <Textarea
                    label="Şirket Açıklaması (Opsiyonel)"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    error={errors.description}
                    placeholder="Şirketiniz hakkında kısa bir açıklama"
                    rows={4}
                    className="transition-all duration-300"
                  />
                </div>
              </div>

              {/* Yetkili Kişi Bilgileri */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-900 rounded-xl p-6 border border-blue-100 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  Yetkili Kişi Bilgileri
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="TC Kimlik No"
                    type="text"
                    name="tc"
                    value={formData.tc}
                    onChange={(e) => {
                      // Sadece rakam kabul et ve maksimum 11 karakter
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 11);
                      setFormData((prev) => ({
                        ...prev,
                        tc: value,
                      }));
                      if (errors.tc) {
                        setErrors((prev) => ({ ...prev, tc: "" }));
                      }
                    }}
                    error={errors.tc}
                    placeholder="11 haneli TC Kimlik No"
                    leftIcon={<Shield className="w-5 h-5 text-gray-400" />}
                    maxLength={11}
                    required
                    className="transition-all duration-300 focus:scale-[1.02]"
                  />

                  <Select
                    label="Rol"
                    name="roleId"
                    value={formData.roleId}
                    onChange={handleChange}
                    error={errors.roleId}
                    options={[
                      { value: "", label: "Rol Seçiniz", disabled: true },
                      ...(lookups.businessRoles || []).map((role) => ({
                        value: role.id?.toString(),
                        label: role.role || role.name || `Role ID: ${role.id}`,
                      })),
                    ]}
                    required
                    className="transition-all duration-300"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label="Ad"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    placeholder="Adınız"
                    leftIcon={<User className="w-5 h-5 text-gray-400" />}
                    required
                    className="transition-all duration-300"
                  />

                  <Input
                    label="Soyad"
                    type="text"
                    name="surname"
                    value={formData.surname}
                    onChange={handleChange}
                    error={errors.surname}
                    placeholder="Soyadınız"
                    required
                    className="transition-all duration-300"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label="E-posta"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    placeholder="ornek@email.com"
                    leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
                    required
                    className="transition-all duration-300"
                  />

                  <Input
                    label="Telefon"
                    type="tel"
                    name="phoneNumber"
                    value={formatPhoneNumberDisplay(formData.phoneNumber)}
                    onChange={(e) => {
                      // Sadece rakamları al
                      const cleaned = e.target.value.replace(/\D/g, "");
                      // Maksimum 11 haneli olabilir (0 ile başlayabilir)
                      if (cleaned.length <= 11) {
                        setFormData((prev) => ({
                          ...prev,
                          phoneNumber: cleaned,
                        }));
                        if (errors.phoneNumber) {
                          setErrors((prev) => ({ ...prev, phoneNumber: "" }));
                        }
                      }
                    }}
                    error={errors.phoneNumber}
                    placeholder="0(5xx) xxx xx xx"
                    leftIcon={<Phone className="w-5 h-5 text-gray-400" />}
                    required
                    className="transition-all duration-300"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Input
                      label="Şifre"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      error={errors.password}
                      placeholder="Şifrenizi girin"
                      leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      }
                      required
                      className="transition-all duration-300 focus:scale-[1.02]"
                    />
                    {formData.password && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Şifre Kuralları:
                        </p>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs">
                            {formData.password.length >= 8 ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            )}
                            <span
                              className={
                                formData.password.length >= 8
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-gray-500 dark:text-gray-400"
                              }
                            >
                              En az 8 karakter
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            {/[a-z]/.test(formData.password) ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            )}
                            <span
                              className={
                                /[a-z]/.test(formData.password)
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-gray-500 dark:text-gray-400"
                              }
                            >
                              En az bir küçük harf
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            {/[A-Z]/.test(formData.password) ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            )}
                            <span
                              className={
                                /[A-Z]/.test(formData.password)
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-gray-500 dark:text-gray-400"
                              }
                            >
                              En az bir büyük harf
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <Input
                    label="Şifre Tekrar"
                    type={showPasswordConfirm ? "text" : "password"}
                    name="passwordConfirm"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    error={errors.passwordConfirm}
                    placeholder="Şifrenizi tekrar girin"
                    leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswordConfirm(!showPasswordConfirm)
                        }
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPasswordConfirm ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    }
                    required
                    className="transition-all duration-300 focus:scale-[1.02]"
                  />
                </div>
              </div>

              {/* Sözleşmeler */}
              <div className="space-y-4 bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <Checkbox
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  error={errors.acceptTerms}
                  label={
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      <Link
                        to="/kullanim-sartlari"
                        target="_blank"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium hover:underline"
                      >
                        Kullanım Koşulları
                      </Link>
                      'nı okudum ve kabul ediyorum
                    </span>
                  }
                  required
                />
                <Checkbox
                  name="acceptKvkk"
                  checked={formData.acceptKvkk}
                  onChange={handleChange}
                  error={errors.acceptKvkk}
                  label={
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      <Link
                        to="/kvkk"
                        target="_blank"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium hover:underline"
                      >
                        KVKK Aydınlatma Metni
                      </Link>
                      'ni okudum ve bilgilendirildim
                    </span>
                  }
                  required
                />
              </div>

              {/* Form Error Message */}
              {errors.form && (
                <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-300 font-medium">
                    {errors.form}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Kayıt yapılıyor...
                  </span>
                ) : (
                  "Kayıt Ol"
                )}
              </button>
            </form>

            <div className="mt-6">
              {/* Öneri Kısmı */}
              <div className="space-y-2">
                <Link
                  to={ROUTES.EMPLOYER_LOGIN}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors group"
                >
                  <Building2 className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-blue-700">
                    İşveren Giriş
                  </span>
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors group"
                >
                  <User className="w-4 h-4 text-green-600 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-green-700">
                    Üye Kayıt
                  </span>
                </Link>
                <Link
                  to={ROUTES.LOGIN}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors group"
                >
                  <User className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-emerald-700">
                    Üye Giriş
                  </span>
                </Link>
              </div>
            </div>
          </div>

          <p className="text-center text-gray-500 text-sm mt-6">
            © {new Date().getFullYear()} Atakum Belediyesi. Tüm hakları
            saklıdır.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BusinessRegister;
