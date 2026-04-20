import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Input, Checkbox, Select } from "../../components/ui";
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
  UserPlus,
  Star,
  Shield,
  Briefcase,
  Calendar,
  CreditCard,
  Users,
  CheckCircle2,
  XCircle,
  Home,
  Building2,
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

const RegisterSeeker = () => {
  const navigate = useNavigate();
  const { register, loading, theme, toggleTheme } = useAppStore();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    tc: "",
    birthday: "",
    gender: "",
    password: "",
    passwordConfirm: "",
    acceptTerms: false,
    acceptKvkk: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    const isNameField = name === "firstName" || name === "lastName";

    let nextValue;
    if (type === "checkbox") {
      nextValue = checked;
    } else if (isNameField && typeof value === "string") {
      // Sadece baş harfleri büyük yap (Türkçe uyumlu)
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName) {
      newErrors.firstName = "Ad zorunludur";
    } else {
      const trimmedFirstName = formData.firstName.trim();
      if (/^\d+$/.test(trimmedFirstName)) {
        newErrors.firstName = "Ad alanına sadece rakam giremezsiniz";
      }
    }

    if (!formData.lastName) {
      newErrors.lastName = "Soyad zorunludur";
    } else {
      const trimmedLastName = formData.lastName.trim();
      if (/^\d+$/.test(trimmedLastName)) {
        newErrors.lastName = "Soyad alanına sadece rakam giremezsiniz";
      }
    }

    if (!formData.email) {
      newErrors.email = "E-posta adresi zorunludur";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Geçerli bir e-posta adresi giriniz";
    }

    if (!formData.phone) {
      newErrors.phone = "Telefon numarası zorunludur";
    } else {
      const validation = validatePhoneNumber(formData.phone);
      if (!validation.isValid) {
        newErrors.phone =
          validation.error || "Geçerli bir telefon numarası giriniz";
      }
    }

    if (!formData.tc) {
      newErrors.tc = "TC kimlik numarası zorunludur";
    } else {
      const tcValidation = validateTcKimlikNumber(formData.tc);
      if (!tcValidation.isValid) {
        newErrors.tc = tcValidation.error || "Geçersiz TC kimlik numarası";
      }
    }

    if (!formData.birthday) {
      newErrors.birthday = "Doğum tarihi zorunludur";
    } else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.birthday)) {
        newErrors.birthday = "Geçerli bir tarih formatı giriniz (YYYY-MM-DD)";
      }
    }

    if (!formData.gender) {
      newErrors.gender = "Cinsiyet zorunludur";
    } else if (!["male", "female"].includes(formData.gender)) {
      newErrors.gender = "Cinsiyet seçimi geçersiz";
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

    // Telefon numarasını backend formatına normalize et (10 haneli, 5 ile başlayan)
    const phoneNumber = normalizePhoneNumber(formData.phone);

    const result = await register(
      {
        name: formData.firstName.toLocaleUpperCase("tr-TR"),
        surname: formData.lastName.toLocaleUpperCase("tr-TR"),
        email: formData.email,
        phoneNumber: phoneNumber,
        tc: formData.tc.replace(/\s/g, ""),
        birthday: formData.birthday,
        gender: formData.gender,
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
        kvkkConsent: formData.acceptKvkk,
      },
      "user",
    );

    if (result.success) {
      showToast({
        type: "success",
        message: "Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...",
        duration: 5000,
      });
      navigate(ROUTES.LOGIN);
    } else {
      // API'den gelen hataları form alanlarına map et
      const fieldErrors = {};
      if (result.errors && Array.isArray(result.errors)) {
        result.errors.forEach((error) => {
          // Field mapping: phoneNumber -> phone, birthday -> birthday, etc.
          const fieldMap = {
            phoneNumber: "phone",
            tc: "tc",
            birthday: "birthday",
            gender: "gender",
          };
          const fieldName = fieldMap[error.field] || error.field;
          if (!fieldErrors[fieldName]) {
            fieldErrors[fieldName] = error.message;
          } else {
            fieldErrors[fieldName] += `, ${error.message}`;
          }
        });
      }

      setErrors({
        ...fieldErrors,
        form: result.error || "Kayıt işlemi başarısız oldu.",
      });

      const toastMessage =
        result.error && result.error !== "Hatalı istek"
          ? result.error
          : "Lütfen formdaki hataları düzeltin.";

      showToast({
        type: "error",
        message: toastMessage,
        duration: 5000,
      });
    }
  };

  return (
    <div className="min-h-screen flex relative bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <SEOHead title="Üye Ol" path="/kayit" noindex />
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
              Üye Kayıt
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
              Ücretsiz hesap oluşturun ve iş aramaya başlayın
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Kişisel Bilgiler */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-900 rounded-xl p-6 border border-green-100 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  Kişisel Bilgiler
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Ad"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    error={errors.firstName}
                    placeholder="Adınız"
                    leftIcon={<User className="w-5 h-5 text-gray-400" />}
                    required
                  />
                  <Input
                    label="Soyad"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    error={errors.lastName}
                    placeholder="Soyadınız"
                    required
                  />
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
                  />
                  <Input
                    label="Telefon"
                    type="tel"
                    name="phone"
                    value={formatPhoneNumberDisplay(formData.phone)}
                    onChange={(e) => {
                      // Sadece rakamları al
                      const cleaned = e.target.value.replace(/\D/g, "");
                      // Maksimum 11 haneli olabilir (0 ile başlayabilir)
                      if (cleaned.length <= 11) {
                        setFormData((prev) => ({
                          ...prev,
                          phone: cleaned,
                        }));
                        if (errors.phone) {
                          setErrors((prev) => ({ ...prev, phone: "" }));
                        }
                      }
                    }}
                    error={errors.phone}
                    placeholder="0(5xx) xxx xx xx"
                    leftIcon={<Phone className="w-5 h-5 text-gray-400" />}
                    required
                  />
                  <Input
                    label="TC Kimlik Numarası"
                    type="text"
                    name="tc"
                    value={formData.tc}
                    onChange={(e) => {
                      // Sadece rakam kabul et
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 11) {
                        setFormData((prev) => ({
                          ...prev,
                          tc: value,
                        }));
                        if (errors.tc) {
                          setErrors((prev) => ({ ...prev, tc: "" }));
                        }
                      }
                    }}
                    error={errors.tc}
                    placeholder="11 haneli TC kimlik numarası"
                    leftIcon={<CreditCard className="w-5 h-5 text-gray-400" />}
                    required
                    maxLength={11}
                  />
                  <div className="w-full overflow-hidden">
                    <Input
                      label="Doğum Tarihi"
                      type="date"
                      name="birthday"
                      value={formData.birthday}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Date input'tan gelen değeri kontrol et
                        if (value) {
                          const dateParts = value.split("-");
                          const year = dateParts[0];
                          // Yıl 4 haneden fazla ise engelle
                          if (year && year.length > 4) {
                            return; // Değişikliği uygulama
                          }
                          // Geçerli bir tarih formatı kontrolü
                          if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                            handleChange(e);
                          }
                        } else {
                          handleChange(e);
                        }
                      }}
                      error={errors.birthday}
                      leftIcon={<Calendar className="w-5 h-5 text-gray-400" />}
                      required
                      max={new Date().toISOString().split("T")[0]}
                      min="1900-01-01"
                      className="w-full min-w-0"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Select
                      label="Cinsiyet"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      error={errors.gender}
                      options={[
                        {
                          value: "",
                          label: "Cinsiyet Seçiniz",
                          disabled: true,
                        },
                        { value: "male", label: "Erkek" },
                        { value: "female", label: "Kadın" },
                      ]}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Şifre Bilgileri */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-900 rounded-xl p-6 border border-blue-100 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Lock className="w-4 h-4 text-white" />
                  </div>
                  Güvenlik Bilgileri
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          className="text-gray-400 hover:text-gray-600 transition-colors"
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
                        <p className="text-xs font-medium text-gray-700 mb-2">
                          Şifre Kuralları:
                        </p>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs">
                            {formData.password.length >= 8 ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-gray-400" />
                            )}
                            <span
                              className={
                                formData.password.length >= 8
                                  ? "text-green-600"
                                  : "text-gray-500"
                              }
                            >
                              En az 8 karakter
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            {/[a-z]/.test(formData.password) ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-gray-400" />
                            )}
                            <span
                              className={
                                /[a-z]/.test(formData.password)
                                  ? "text-green-600"
                                  : "text-gray-500"
                              }
                            >
                              En az bir küçük harf
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            {/[A-Z]/.test(formData.password) ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-gray-400" />
                            )}
                            <span
                              className={
                                /[A-Z]/.test(formData.password)
                                  ? "text-green-600"
                                  : "text-gray-500"
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
                  />
                </div>
              </div>

              {/* Sözleşmeler */}
              <div className="space-y-4 bg-gray-50 rounded-xl p-6 border border-gray-200">
                <Checkbox
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  error={errors.acceptTerms}
                  label={
                    <span className="text-sm text-gray-700">
                      <Link
                        to="/kullanim-sartlari"
                        target="_blank"
                        className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
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
                    <span className="text-sm text-gray-700">
                      <Link
                        to="/kvkk"
                        target="_blank"
                        className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                      >
                        KVKK Aydınlatma Metni
                      </Link>
                      'ni okudum ve bilgilendirildim
                    </span>
                  }
                  required
                />
              </div>

              {errors.form && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600">{errors.form}</p>
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
                  to={ROUTES.LOGIN}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors group"
                >
                  <User className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-blue-700">
                    Üye Giriş
                  </span>
                </Link>
                <Link
                  to={ROUTES.EMPLOYER_REGISTER}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors group"
                >
                  <Building2 className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-purple-700">
                    İşveren Kayıt
                  </span>
                </Link>
                <Link
                  to={ROUTES.EMPLOYER_LOGIN}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors group"
                >
                  <Building2 className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-indigo-700">
                    İşveren Giriş
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

export default RegisterSeeker;
