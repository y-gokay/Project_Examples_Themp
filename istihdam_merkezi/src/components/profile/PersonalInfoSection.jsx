import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Select,
  Button,
  Checkbox,
} from "../ui";
import { showToast } from "../ui/Toast";
import { Phone, Mail, Loader2, User, Save, Edit } from "lucide-react";
import { useVerification } from "../../hooks/profile";
import {
  formatDate,
  formatPhoneNumberDisplay,
  normalizePhoneNumber,
  validatePhoneNumber,
} from "../../utils/helpers";
import { error as logError } from "../../utils/logger";
import AddressSection from "./AddressSection";

/**
 * PersonalInfoSection Component
 *
 * Kullanıcının kişisel bilgilerini gösterir ve düzenlemesine izin verir.
 *
 * Bu component, profil sayfasının kişisel bilgiler bölümünü yönetir:
 * - Ad, Soyad
 * - E-posta (doğrulama ile)
 * - Telefon numaraları
 * - Cinsiyet
 * - Doğum tarihi
 * - Uyruk
 * - Medeni durum
 * - Çalışma durumu
 * - Askerlik durumu
 * - Emeklilik durumu
 * - Sigara durumu
 * - Engelli durumu
 *
 * Component Yapısı:
 * - Form alanları (Input, Select, Checkbox)
 * - E-posta doğrulama butonu
 * - Adres bölümü (AddressSection component'i)
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.user - Kullanıcı objesi (profil bilgileri)
 * @param {Object} props.lookups - Lookup verileri (şehirler, uyruklar, vb.)
 * @param {Object} props.formData - Form state objesi (tüm form alanlarının değerleri)
 * @param {Object} props.formErrors - Form hataları objesi (validation hataları)
 * @param {Function} props.onInputChange - Input değişikliklerini handle eden fonksiyon
 * @param {Function} props.onCheckboxChange - Checkbox değişikliklerini handle eden fonksiyon
 * @param {Function} props.onStatusChange - Status (boolean) değişikliklerini handle eden fonksiyon
 * @param {Function} props.onSubmit - Form submit handler'ı
 * @param {Function} props.sendEmailVerificationCode - E-posta doğrulama kodu gönderme API çağrısı
 * @param {Function} props.verifyEmail - E-posta doğrulama API çağrısı
 * @param {Function} props.requestEmailChange - E-posta değiştirme isteği API çağrısı
 * @param {Function} props.verifyEmailChange - E-posta değiştirme doğrulama API çağrısı
 * @param {Function} props.sendPhoneVerificationCode - Telefon doğrulama kodu gönderme API çağrısı
 * @param {Function} props.verifyPhone - Telefon doğrulama API çağrısı
 * @param {Function} props.requestPhoneChange - Telefon değiştirme isteği API çağrısı
 * @param {Function} props.verifyPhoneChange - Telefon değiştirme doğrulama API çağrısı
 * @param {Function} props.getDistrictsByCity - Şehre göre ilçeleri getiren fonksiyon
 * @param {Function} props.getNeighbourhoodsByDistrict - İlçeye göre mahalleleri getiren fonksiyon
 * @param {Function} props.onAddressChange - Adres değişikliklerini handle eden fonksiyon
 * @param {boolean} props.loading - Loading state'i
 * @param {boolean} props.saving - Saving state'i
 *
 * @example
 * ```jsx
 * <PersonalInfoSection
 *   user={user}
 *   lookups={lookups}
 *   formData={formData}
 *   formErrors={formErrors}
 *   onInputChange={handleInputChange}
 *   onCheckboxChange={handleCheckboxChange}
 *   onSubmit={handleSubmit}
 *   sendEmailVerificationCode={sendEmailVerificationCode}
 *   verifyEmail={verifyEmail}
 * />
 * ```
 */
const PersonalInfoSection = ({
  user,
  lookups,
  formData,
  formErrors,
  missingKeys = [],
  onInputChange,
  onCheckboxChange,
  onStatusChange,
  onSubmit,
  sendEmailVerificationCode,
  verifyEmail,
  requestEmailChange,
  verifyEmailChange,
  sendPhoneVerificationCode,
  verifyPhone,
  requestPhoneChange,
  verifyPhoneChange,
  getDistrictsByCity,
  getNeighbourhoodsByDistrict,
  onAddressChange,
  loading = false,
  saving = false,
}) => {
  const isMissing = (key) => missingKeys.includes(key);

  const contactMissing = ["isPhoneApproved", "isEmailApproved", "phoneNumber", "email"].some(isMissing);
  const statusMissing = [
    "retirementStatus",
    "isMarried",
    "smokingStatus",
    "isDisabledPerson",
    "gender",
  ].some(isMissing);
  const addressMissing = ["addressText", "addressNeighbourhoodId"].some(isMissing);
  const [isEditing, setIsEditing] = useState(false);

  // Reset editing mode when user data changes
  useEffect(() => {
    setIsEditing(false);
  }, [user]);

  const {
    emailVerificationCode,
    setEmailVerificationCode,
    sendingEmailCode,
    verifyingEmail,
    emailChangeMode,
    setEmailChangeMode,
    newEmail,
    setNewEmail,
    emailChangeCode,
    setEmailChangeCode,
    emailChangeCodeSent,
    setEmailChangeCodeSent,
    requestingEmailChange,
    verifyingEmailChange,
    handleSendEmailCode,
    handleVerifyEmail,
    handleRequestEmailChange,
    handleVerifyEmailChange,
    phoneVerificationCode,
    setPhoneVerificationCode,
    sendingPhoneCode,
    verifyingPhone,
    phoneChangeMode,
    setPhoneChangeMode,
    newPhoneNumber,
    setNewPhoneNumber,
    phoneChangeCode,
    setPhoneChangeCode,
    phoneChangeCodeSent,
    setPhoneChangeCodeSent,
    requestingPhoneChange,
    verifyingPhoneChange,
    handleSendPhoneCode,
    handleVerifyPhone,
    handleRequestPhoneChange,
    handleVerifyPhoneChange,
  } = useVerification({
    sendEmailCode: sendEmailVerificationCode,
    verifyEmail,
    requestEmailChange,
    verifyEmailChange,
    sendPhoneCode: sendPhoneVerificationCode,
    verifyPhone,
    requestPhoneChange,
    verifyPhoneChange,
  });

  const genderOptions = [
    { value: "", label: "Seçiniz", disabled: true },
    { value: "male", label: "Erkek" },
    { value: "female", label: "Kadın" },
  ];

  const nationalityOptions = [
    { value: "", label: "Seçiniz", disabled: true },
    ...(lookups?.nationalities || []).map((nat) => ({
      value: nat.id?.toString() || nat.value?.toString(),
      label: nat.title || nat.label || nat.name,
    })),
  ];

  const cityOptions = [
    { value: "", label: "Seçiniz", disabled: true },
    ...(lookups?.cities || []).map((city) => ({
      value: city.id?.toString() || city.value?.toString(),
      label: city.title || city.label || city.name,
    })),
  ];

  // Status options for boolean fields (null, true, false)
  const statusOptions = [
    { value: "null", label: "Belirtmek istemiyorum" },
    { value: "true", label: "Evet" },
    { value: "false", label: "Hayır" },
  ];

  // Helper functions to get display values
  const getGenderLabel = (value) => {
    const option = genderOptions.find((opt) => opt.value === value);
    return option ? option.label : "-";
  };

  const getNationalityLabel = (id) => {
    if (!id) return "-";
    const nat = lookups?.nationalities?.find(
      (n) => n.id?.toString() === id || n.value?.toString() === id,
    );
    return nat?.title || nat?.label || nat?.name || "-";
  };

  const getCityLabel = (id) => {
    if (!id) return "-";
    const city = lookups?.cities?.find(
      (c) => c.id?.toString() === id || c.value?.toString() === id,
    );
    return city?.title || city?.label || city?.name || "-";
  };

  const getStatusLabel = (value) => {
    if (!value || value === "null") return "Belirtmek istemiyorum";
    return value === "true" ? "Evet" : "Hayır";
  };

  const getAddressDisplay = () => {
    const city =
      user?.ikametgahDistrictRef?.city || user?.neighbourhood?.district?.city;
    const district =
      user?.ikametgahDistrictRef || user?.neighbourhood?.district;
    const neighbourhood = user?.neighbourhood;
    const address =
      user?.addressText || user?.address || user?.ikametgahAddress;

    const parts = [];
    if (city) parts.push(city.title || city.name);
    if (district) parts.push(district.title || district.name);
    if (neighbourhood) parts.push(neighbourhood.name);
    if (address) parts.push(address);

    return parts.length > 0 ? parts.join(", ") : "-";
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(e);
      // Editing mode will be closed by useEffect when user data updates
    } catch (error) {
      // onSubmit handles validation/API errors; log unexpected errors
      if (error?.name !== "AbortError") {
        logError("Profil formu gönderim hatası:", error);
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Form data will be reset when user data changes
  };

  return (
    <>
      {/* Personal Information Display Section */}
      <Card className={`mb-6 ${contactMissing ? "border-red-400 dark:border-red-500 border-2" : ""}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Kişisel Bilgiler
            {contactMissing && (
              <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
                Eksik bilgi var
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* TC Kimlik No */}
              {user?.tc && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    TC Kimlik No
                  </label>
                  <div className="text-base text-gray-900 dark:text-gray-100">
                    {user.tc}
                  </div>
                </div>
              )}

              {/* Doğum Tarihi */}
              {user?.birthday && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Doğum Tarihi
                  </label>
                  <div className="text-base text-gray-900 dark:text-gray-100">
                    {formatDate(user.birthday)}
                  </div>
                </div>
              )}

              {/* Telefon */}
              {user?.phoneNumber && (
                <div className={isMissing("isPhoneApproved") ? "p-3 -m-1 rounded-lg border-2 border-red-400 dark:border-red-500 bg-red-50/50 dark:bg-red-900/10" : ""}>
                  <label className={`block text-sm font-medium mb-1 ${isMissing("isPhoneApproved") ? "text-red-700 dark:text-red-300" : "text-gray-700 dark:text-gray-300"}`}>
                    Telefon {isMissing("isPhoneApproved") && <span className="text-red-500">*</span>}
                  </label>
                  <div className="space-y-2">
                    <div className="text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      {formatPhoneNumberDisplay(user.phoneNumber)}
                      {user.isPhoneApproved && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                          Onaylı
                        </span>
                      )}
                    </div>
                    {!user.isPhoneApproved && (
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="Doğrulama kodu"
                            value={phoneVerificationCode}
                            onChange={(e) =>
                              setPhoneVerificationCode(e.target.value)
                            }
                            className="flex-1"
                          />
                          <Button
                            onClick={handleVerifyPhone}
                            disabled={verifyingPhone || !phoneVerificationCode}
                            loading={verifyingPhone}
                            size="sm"
                          >
                            Doğrula
                          </Button>
                        </div>
                        <Button
                          onClick={handleSendPhoneCode}
                          disabled={sendingPhoneCode}
                          loading={sendingPhoneCode}
                          variant="outline"
                          size="sm"
                        >
                          Doğrulama Kodu Gönder
                        </Button>
                      </div>
                    )}
                    {!phoneChangeMode ? (
                      <Button
                        onClick={() => setPhoneChangeMode(true)}
                        variant="outline"
                        size="sm"
                      >
                        Telefon Değiştir
                      </Button>
                    ) : (
                      <div className="space-y-2 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Yeni Telefon Numarası
                          </label>
                          <Input
                            type="tel"
                            placeholder="0(5xx) xxx xx xx"
                            value={formatPhoneNumberDisplay(newPhoneNumber)}
                            onChange={(e) => {
                              // Sadece rakamları al
                              const cleaned = e.target.value.replace(/\D/g, "");
                              // Maksimum 11 haneli olabilir (0 ile başlayabilir)
                              if (cleaned.length <= 11) {
                                setNewPhoneNumber(cleaned);
                              }
                            }}
                            leftIcon={
                              <Phone className="w-5 h-5 text-gray-400" />
                            }
                            className="mb-2"
                          />
                        </div>
                        {phoneChangeCodeSent && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Doğrulama Kodu
                            </label>
                            <div className="flex gap-2">
                              <Input
                                type="text"
                                placeholder="Doğrulama kodu"
                                value={phoneChangeCode}
                                onChange={(e) =>
                                  setPhoneChangeCode(e.target.value)
                                }
                                className="flex-1"
                              />
                              <Button
                                onClick={handleVerifyPhoneChange}
                                disabled={
                                  verifyingPhoneChange || !phoneChangeCode
                                }
                                loading={verifyingPhoneChange}
                                size="sm"
                              >
                                Doğrula
                              </Button>
                            </div>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            onClick={handleRequestPhoneChange}
                            disabled={requestingPhoneChange || !newPhoneNumber}
                            loading={requestingPhoneChange}
                            size="sm"
                            className="flex-1"
                          >
                            Kod Gönder
                          </Button>
                          <Button
                            onClick={() => {
                              setPhoneChangeMode(false);
                              setPhoneChangeCode("");
                              setNewPhoneNumber("");
                              setPhoneChangeCodeSent(false);
                            }}
                            variant="outline"
                            size="sm"
                          >
                            İptal
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Email */}
              {user?.email && (
                <div className={isMissing("isEmailApproved") ? "p-3 -m-1 rounded-lg border-2 border-red-400 dark:border-red-500 bg-red-50/50 dark:bg-red-900/10" : ""}>
                  <label className={`block text-sm font-medium mb-1 ${isMissing("isEmailApproved") ? "text-red-700 dark:text-red-300" : "text-gray-700 dark:text-gray-300"}`}>
                    E-posta {isMissing("isEmailApproved") && <span className="text-red-500">*</span>}
                  </label>
                  <div className="space-y-2">
                    <div className="text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      {user.email}
                      {user.isEmailApproved && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                          Onaylı
                        </span>
                      )}
                    </div>
                    {!user.isEmailApproved && (
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="Doğrulama kodu"
                            value={emailVerificationCode}
                            onChange={(e) =>
                              setEmailVerificationCode(e.target.value)
                            }
                            className="flex-1"
                          />
                          <Button
                            onClick={handleVerifyEmail}
                            disabled={verifyingEmail || !emailVerificationCode}
                            loading={verifyingEmail}
                            size="sm"
                          >
                            Doğrula
                          </Button>
                        </div>
                        <Button
                          onClick={handleSendEmailCode}
                          disabled={sendingEmailCode}
                          loading={sendingEmailCode}
                          variant="outline"
                          size="sm"
                        >
                          Doğrulama Kodu Gönder
                        </Button>
                      </div>
                    )}
                    {!emailChangeMode ? (
                      <Button
                        onClick={() => setEmailChangeMode(true)}
                        variant="outline"
                        size="sm"
                      >
                        E-posta Değiştir
                      </Button>
                    ) : (
                      <div className="space-y-2 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Yeni E-posta Adresi
                          </label>
                          <Input
                            type="email"
                            placeholder="yeni@email.com"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                          />
                        </div>
                        {emailChangeCodeSent && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Doğrulama Kodu
                            </label>
                            <div className="flex gap-2">
                              <Input
                                type="text"
                                placeholder="Doğrulama kodu"
                                value={emailChangeCode}
                                onChange={(e) =>
                                  setEmailChangeCode(e.target.value)
                                }
                                className="flex-1"
                              />
                              <Button
                                onClick={handleVerifyEmailChange}
                                disabled={
                                  verifyingEmailChange || !emailChangeCode
                                }
                                loading={verifyingEmailChange}
                                size="sm"
                              >
                                Doğrula
                              </Button>
                            </div>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            onClick={handleRequestEmailChange}
                            disabled={requestingEmailChange || !newEmail}
                            loading={requestingEmailChange}
                            size="sm"
                            className="flex-1"
                          >
                            Kod Gönder
                          </Button>
                          <Button
                            onClick={() => {
                              setEmailChangeMode(false);
                              setNewEmail("");
                              setEmailChangeCode("");
                              setEmailChangeCodeSent(false);
                            }}
                            variant="outline"
                            size="sm"
                          >
                            İptal
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Hesap Durumu */}
              {user?.isApproved !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hesap Durumu
                  </label>
                  <div className="flex items-center gap-2">
                    {user.isApproved ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                        Onaylı
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-yellow-100 text-yellow-800">
                        Beklemede
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Sabıka Kaydı Durumu */}
              {/*               {user?.isCriminalRecorded !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sabıka Kaydı
                  </label>
                  <div className="text-base text-gray-900 dark:text-gray-100">
                    {user.isCriminalRecorded ? "Var" : "Yok"}
                  </div>
                </div>
              )} */}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personal Information Form */}
      <Card className={`mb-6 ${statusMissing || addressMissing ? "border-red-400 dark:border-red-500 border-2" : ""}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Düzenlenebilir Bilgiler
            {(statusMissing || addressMissing) && (
              <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
                Eksik bilgi var
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
            </div>
          ) : !isEditing ? (
            <>
              {/* Compact Display Mode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Secondary Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-300 mb-1">
                    İkinci Telefon
                  </label>
                  <div className="text-base text-gray-900 dark:text-gray-100">
                    {formData.secondaryPhone
                      ? formatPhoneNumberDisplay(formData.secondaryPhone)
                      : "-"}
                  </div>
                </div>

                {/* Gender */}
                <div className={isMissing("gender") ? "p-3 -m-1 rounded-lg border-2 border-red-400 dark:border-red-500 bg-red-50/50 dark:bg-red-900/10" : ""}>
                  <label className={`block text-sm font-medium mb-1 ${isMissing("gender") ? "text-red-700 dark:text-red-300" : "text-gray-500 dark:text-gray-300"}`}>
                    Cinsiyet {isMissing("gender") && <span className="text-red-500">*</span>}
                  </label>
                  <div className="text-base text-gray-900 dark:text-gray-100">
                    {formData.gender ? getGenderLabel(formData.gender) : "-"}
                  </div>
                </div>

                {/* Nationality */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-300 mb-1">
                    Uyruk
                  </label>
                  <div className="text-base text-gray-900 dark:text-gray-100">
                    {formData.nationalityId
                      ? getNationalityLabel(formData.nationalityId)
                      : "-"}
                  </div>
                </div>

                {/* Address */}
                <div className={`md:col-span-2 ${addressMissing ? "p-3 -m-1 rounded-lg border-2 border-red-400 dark:border-red-500 bg-red-50/50 dark:bg-red-900/10" : ""}`}>
                  <label className={`block text-sm font-medium mb-1 ${addressMissing ? "text-red-700 dark:text-red-300" : "text-gray-500 dark:text-gray-300"}`}>
                    Adres {addressMissing && <span className="text-red-500">*</span>}
                  </label>
                  <div className="text-base text-gray-900 dark:text-gray-100">
                    {getAddressDisplay()}
                  </div>
                </div>

                {/* Status Information */}
                <div className={`md:col-span-2 border-t pt-4 mt-2 ${statusMissing ? "border-red-300 dark:border-red-700" : "border-gray-200 dark:border-gray-700"}`}>
                  <h4 className={`text-xs font-semibold mb-3 ${statusMissing ? "text-red-700 dark:text-red-300" : "text-gray-700 dark:text-gray-300"}`}>
                    Durum Bilgileri {statusMissing && <span className="text-red-500">*</span>}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-300 mb-1">
                        Çalışma Durumu
                      </label>
                      <div className="text-base text-gray-900 dark:text-gray-100">
                        {getStatusLabel(formData.workingStatus)}
                      </div>
                    </div>
                    {formData.gender !== "female" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-300 mb-1">
                          Askerlik Durumu
                        </label>
                        <div className="text-base text-gray-900 dark:text-gray-100">
                          {getStatusLabel(formData.militaryStatus)}
                        </div>
                      </div>
                    )}
                    <div className={isMissing("retirementStatus") ? "p-2 -m-1 rounded-lg border-2 border-red-400 dark:border-red-500 bg-red-50/50 dark:bg-red-900/10" : ""}>
                      <label className={`block text-sm font-medium mb-1 ${isMissing("retirementStatus") ? "text-red-700 dark:text-red-300" : "text-gray-500 dark:text-gray-300"}`}>
                        Emeklilik Durumu {isMissing("retirementStatus") && <span className="text-red-500">*</span>}
                      </label>
                      <div className="text-base text-gray-900 dark:text-gray-100">
                        {getStatusLabel(formData.retirementStatus)}
                      </div>
                    </div>
                    <div className={isMissing("smokingStatus") ? "p-2 -m-1 rounded-lg border-2 border-red-400 dark:border-red-500 bg-red-50/50 dark:bg-red-900/10" : ""}>
                      <label className={`block text-sm font-medium mb-1 ${isMissing("smokingStatus") ? "text-red-700 dark:text-red-300" : "text-gray-500 dark:text-gray-300"}`}>
                        Sigara Kullanımı {isMissing("smokingStatus") && <span className="text-red-500">*</span>}
                      </label>
                      <div className="text-base text-gray-900 dark:text-gray-100">
                        {getStatusLabel(formData.smokingStatus)}
                      </div>
                    </div>
                    <div className={isMissing("isDisabledPerson") ? "p-2 -m-1 rounded-lg border-2 border-red-400 dark:border-red-500 bg-red-50/50 dark:bg-red-900/10" : ""}>
                      <label className={`block text-sm font-medium mb-1 ${isMissing("isDisabledPerson") ? "text-red-700 dark:text-red-300" : "text-gray-500 dark:text-gray-300"}`}>
                        Engelli Birey {isMissing("isDisabledPerson") && <span className="text-red-500">*</span>}
                      </label>
                      <div className="text-base text-gray-900 dark:text-gray-100">
                        {getStatusLabel(formData.isDisabledPerson)}
                      </div>
                    </div>
                    <div className={isMissing("isMarried") ? "p-2 -m-1 rounded-lg border-2 border-red-400 dark:border-red-500 bg-red-50/50 dark:bg-red-900/10" : ""}>
                      <label className={`block text-sm font-medium mb-1 ${isMissing("isMarried") ? "text-red-700 dark:text-red-300" : "text-gray-500 dark:text-gray-300"}`}>
                        Evlilik Durumu {isMissing("isMarried") && <span className="text-red-500">*</span>}
                      </label>
                      <div className="text-base text-gray-900 dark:text-gray-100">
                        {getStatusLabel(formData.isMarried)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Düzenle
                </Button>
              </div>
            </>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Secondary Phone */}
                <Input
                  label="İkinci Telefon Numarası"
                  type="tel"
                  placeholder="0(5xx) xxx xx xx"
                  value={formatPhoneNumberDisplay(formData.secondaryPhone)}
                  onChange={(e) => {
                    // Sadece rakamları al
                    const cleaned = e.target.value.replace(/\D/g, "");
                    // Maksimum 11 haneli olabilir (0 ile başlayabilir)
                    if (cleaned.length <= 11) {
                      onInputChange("secondaryPhone", cleaned);
                    }
                  }}
                  error={formErrors.secondaryPhone}
                  helperText="10 haneli telefon numarası"
                  leftIcon={<Phone className="w-4 h-4" />}
                />

                {/* Gender */}
                <Select
                  label="Cinsiyet"
                  value={formData.gender}
                  onChange={(e) => onInputChange("gender", e.target.value)}
                  options={genderOptions}
                />

                {/* Nationality */}
                <Select
                  label="Uyruk"
                  value={formData.nationalityId}
                  onChange={(e) =>
                    onInputChange("nationalityId", e.target.value)
                  }
                  options={nationalityOptions}
                />
              </div>

              {/* Address Section */}
              <AddressSection
                user={user}
                lookups={lookups}
                getDistrictsByCity={getDistrictsByCity}
                getNeighbourhoodsByDistrict={getNeighbourhoodsByDistrict}
                onAddressChange={onAddressChange}
              />

              {/* Status Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Durum Bilgileri
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Çalışma Durumu"
                    value={formData.workingStatus || "null"}
                    onChange={(e) =>
                      onStatusChange("workingStatus", e.target.value)
                    }
                    options={statusOptions}
                    helperText="Şu anda çalışıyor musunuz?"
                  />

                  {formData.gender !== "female" && (
                    <Select
                      label="Askerlik Durumu"
                      value={formData.militaryStatus || "null"}
                      onChange={(e) =>
                        onStatusChange("militaryStatus", e.target.value)
                      }
                      options={statusOptions}
                      helperText="Askerlik yaptınız mı?"
                    />
                  )}

                  <Select
                    label="Emeklilik Durumu"
                    value={formData.retirementStatus || "null"}
                    onChange={(e) =>
                      onStatusChange("retirementStatus", e.target.value)
                    }
                    options={statusOptions}
                    helperText="Emekli misiniz?"
                  />

                  <Select
                    label="Sigara Kullanımı"
                    value={formData.smokingStatus || "null"}
                    onChange={(e) =>
                      onStatusChange("smokingStatus", e.target.value)
                    }
                    options={statusOptions}
                    helperText="Sigara kullanıyor musunuz?"
                  />

                  <Select
                    label="Engelli Birey"
                    value={formData.isDisabledPerson || "null"}
                    onChange={(e) =>
                      onStatusChange("isDisabledPerson", e.target.value)
                    }
                    options={statusOptions}
                    helperText="Engelli birey misiniz?"
                  />

                  <Select
                    label="Evlilik Durumu"
                    value={formData.isMarried || "null"}
                    onChange={(e) =>
                      onStatusChange("isMarried", e.target.value)
                    }
                    options={statusOptions}
                    helperText="Evli misiniz?"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-2 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  onClick={handleCancel}
                  variant="outline"
                  disabled={saving || loading}
                  size="sm"
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  disabled={saving || loading}
                  className="min-w-[120px]"
                  size="sm"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Kaydet
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default PersonalInfoSection;
