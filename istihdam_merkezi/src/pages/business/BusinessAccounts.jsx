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
  Badge,
  Select,
} from "../../components/ui";
import {
  Loader2,
  Users,
  Plus,
  Mail,
  Phone,
  Trash2,
  UserCheck,
} from "lucide-react";
import { showToast } from "../../components/ui/Toast";
import {
  formatPhoneNumberDisplay,
  normalizePhoneNumber,
  validatePhoneNumber,
  validateTcKimlikNumber,
} from "../../utils/helpers";

const BusinessAccounts = () => {
  const navigate = useNavigate();
  const {
    user,
    getBusinessAccounts,
    createBusinessAccount,
    deleteBusinessAccount,
    transferOperatorRole,
    getLookups,
    lookups,
  } = useAppStore();

  const [accounts, setAccounts] = useState([]);
  const [showAddAccountForm, setShowAddAccountForm] = useState(false);
  const [accountForm, setAccountForm] = useState({
    name: "",
    surname: "",
    email: "",
    phoneNumber: "",
    tc: "",
    password: "",
    roleId: "", // Rol seçimi için boş başlat
  });
  const [accountErrors, setAccountErrors] = useState({});
  const [deletingAccountId, setDeletingAccountId] = useState(null);
  const [transferringAccountId, setTransferringAccountId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOperator, setIsOperator] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const profileLoadedRef = useRef(false);

  // API call hooks
  const createAccountApi = useApiCall();
  const deleteAccountApi = useApiCall();
  const transferOperatorApi = useApiCall();

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
    if (profileLoadedRef.current) {
      return;
    }
    profileLoadedRef.current = true;

    loadAccounts();
    getLookups("businessRoles");

    // Cleanup: Component unmount olduğunda ref'i resetle
    return () => {
      profileLoadedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  const loadAccounts = async (skipCache = false) => {
    setLoading(true);
    const result = await getBusinessAccounts(skipCache);
    if (result.success) {
      const accounts = result.data || [];
      setAccounts(accounts);

      // Operatör kontrolü
      const currentAccount = accounts.find((acc) => acc.email === user?.email);
      const operatorStatus = currentAccount?.isOperator === true;
      setIsOperator(operatorStatus);

      // Operatör değilse sayfaya erişimi engelle
      if (!operatorStatus) {
        showToast({
          type: "error",
          message: "Bu sayfaya erişim yetkiniz bulunmamaktadır",
          duration: 3000,
        });
        navigate(ROUTES.EMPLOYER_PANEL, { replace: true });
        setLoading(false);
        return;
      }
    }
    setLoading(false);
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!accountForm.name) newErrors.name = "Ad zorunludur";
    if (!accountForm.surname) newErrors.surname = "Soyad zorunludur";
    if (!accountForm.email) {
      newErrors.email = "E-posta zorunludur";
    } else if (!/\S+@\S+\.\S+/.test(accountForm.email)) {
      newErrors.email = "Geçerli bir e-posta adresi giriniz";
    }
    if (!accountForm.phoneNumber) {
      newErrors.phoneNumber = "Telefon numarası zorunludur";
    } else {
      const phoneValidation = validatePhoneNumber(accountForm.phoneNumber);
      if (!phoneValidation.isValid) {
        newErrors.phoneNumber = phoneValidation.error;
      }
    }
    if (!accountForm.tc) {
      newErrors.tc = "TC Kimlik No zorunludur";
    } else {
      const tcValidation = validateTcKimlikNumber(accountForm.tc);
      if (!tcValidation.isValid) {
        newErrors.tc = tcValidation.error || "Geçersiz TC Kimlik No";
      }
    }
    if (!accountForm.password) {
      newErrors.password = "Şifre zorunludur";
    } else if (accountForm.password.length < 6) {
      newErrors.password = "Şifre en az 6 karakter olmalıdır";
    }
    if (!accountForm.roleId) {
      newErrors.roleId = "Rol seçimi zorunludur";
    }

    setAccountErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // Hesap oluştururken roleId'yi seçilen rol olarak gönder
    // Telefon numarasını normalize et (10 haneli, 0'sız)
    const accountDataToSend = {
      ...accountForm,
      roleId: parseInt(accountForm.roleId), // Integer olarak gönder
      phoneNumber: normalizePhoneNumber(accountForm.phoneNumber), // 10 haneli formata çevir
      tc: accountForm.tc.replace(/\D/g, ""),
    };

    setCreatingAccount(true);
    const result = await createBusinessAccount(accountDataToSend);
    setCreatingAccount(false);

    if (result.success) {
      showToast({
        type: "success",
        message: "Hesap başarıyla oluşturuldu",
        duration: 3000,
      });
      setAccountForm({
        name: "",
        surname: "",
        email: "",
        phoneNumber: "",
        tc: "",
        password: "",
        roleId: "", // Rol seçimi için boş
      });
      setShowAddAccountForm(false);
      setAccountErrors({});
      loadAccounts();
    } else {
      // Backend'den gelen field-specific hataları göster
      const fieldErrors = {};
      if (result.errors && Array.isArray(result.errors)) {
        result.errors.forEach((err) => {
          if (err.field) {
            // Field adını frontend form field adına map et
            const fieldName = err.field;
            fieldErrors[fieldName] = err.message || err.msg;
          }
        });
        setAccountErrors(fieldErrors);
      }

      // Genel hata mesajı varsa göster (field hataları yoksa)
      if (result.error && Object.keys(fieldErrors).length === 0) {
        showToast({
          type: "error",
          message: result.error,
          duration: 3000,
        });
      } else if (Object.keys(fieldErrors).length > 0) {
        // İlk field hatasını toast olarak göster
        const firstErrorField = Object.keys(fieldErrors)[0];
        showToast({
          type: "error",
          message: fieldErrors[firstErrorField],
          duration: 3000,
        });
        // İlk hataya scroll yap
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (!window.confirm("Bu hesabı silmek istediğinize emin misiniz?")) {
      return;
    }

    setDeletingAccountId(accountId);
    await deleteAccountApi.execute(() => deleteBusinessAccount(accountId), {
      successMessage: "Hesap başarıyla silindi",
      errorMessage: "Hesap silinirken bir hata oluştu",
      onSuccess: () => {
        setDeletingAccountId(null);
        loadAccounts();
      },
      onError: () => {
        setDeletingAccountId(null);
      },
    });
  };

  const handleTransferOperatorRole = async (accountId) => {
    if (
      !window.confirm(
        "Operator yetkisini bu hesaba devretmek istediğinize emin misiniz?",
      )
    ) {
      return;
    }

    await transferOperatorApi.execute(() => transferOperatorRole(accountId), {
      successMessage: "Operator yetkisi başarıyla devredildi",
      errorMessage: "Operator yetkisi devredilirken bir hata oluştu",
      onSuccess: () => {
        // Cache'i bypass ederek hesapları yeniden yükle
        loadAccounts(true);
        // Gösterge paneline yönlendir
        navigate(ROUTES.EMPLOYER_PANEL, { replace: true });
      },
    });
  };

  const currentAccount = accounts.find((acc) => acc.email === user?.email);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Hesaplar
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Şirket hesaplarınızı yönetin ve yeni hesaplar oluşturun.
          </p>
        </div>

        {/* Accounts Card */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              Hesaplar
            </CardTitle>
            {isOperator && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddAccountForm(!showAddAccountForm)}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Hesap</span>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {showAddAccountForm && isOperator && (
              <form
                onSubmit={handleAddAccount}
                className="mb-4 sm:mb-6 p-4 sm:p-6 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4"
              >
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Yeni Hesap Ekle
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <Input
                    label="Ad"
                    name="name"
                    value={accountForm.name}
                    onChange={(e) => {
                      setAccountForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }));
                      if (accountErrors.name) {
                        setAccountErrors((prev) => ({
                          ...prev,
                          name: "",
                        }));
                      }
                    }}
                    error={accountErrors.name}
                    required
                  />
                  <Input
                    label="Soyad"
                    name="surname"
                    value={accountForm.surname}
                    onChange={(e) => {
                      setAccountForm((prev) => ({
                        ...prev,
                        surname: e.target.value,
                      }));
                      if (accountErrors.surname) {
                        setAccountErrors((prev) => ({
                          ...prev,
                          surname: "",
                        }));
                      }
                    }}
                    error={accountErrors.surname}
                    required
                  />
                  <Input
                    label="E-posta"
                    name="email"
                    type="email"
                    value={accountForm.email}
                    onChange={(e) => {
                      setAccountForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }));
                      if (accountErrors.email) {
                        setAccountErrors((prev) => ({
                          ...prev,
                          email: "",
                        }));
                      }
                    }}
                    error={accountErrors.email}
                    required
                  />
                  <Input
                    label="Telefon"
                    name="phoneNumber"
                    type="tel"
                    value={formatPhoneNumberDisplay(accountForm.phoneNumber)}
                    onChange={(e) => {
                      // Sadece rakamları al
                      const cleaned = e.target.value.replace(/\D/g, "");
                      // Maksimum 11 haneli olabilir (0 ile başlayabilir)
                      if (cleaned.length <= 11) {
                        setAccountForm((prev) => ({
                          ...prev,
                          phoneNumber: cleaned,
                        }));
                        if (accountErrors.phoneNumber) {
                          setAccountErrors((prev) => ({
                            ...prev,
                            phoneNumber: "",
                          }));
                        }
                      }
                    }}
                    error={accountErrors.phoneNumber}
                    placeholder="0(5xx) xxx xx xx"
                    required
                  />
                  <Input
                    label="TC Kimlik No"
                    name="tc"
                    type="text"
                    value={accountForm.tc}
                    onChange={(e) => {
                      // Sadece rakam kabul et ve maksimum 11 karakter
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 11);
                      setAccountForm((prev) => ({
                        ...prev,
                        tc: value,
                      }));
                      if (accountErrors.tc) {
                        setAccountErrors((prev) => ({ ...prev, tc: "" }));
                      }
                    }}
                    error={accountErrors.tc}
                    placeholder="11 haneli TC Kimlik No"
                    maxLength={11}
                    required
                  />
                  <Input
                    label="Şifre"
                    name="password"
                    type="password"
                    value={accountForm.password}
                    onChange={(e) => {
                      setAccountForm((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }));
                      if (accountErrors.password) {
                        setAccountErrors((prev) => ({
                          ...prev,
                          password: "",
                        }));
                      }
                    }}
                    error={accountErrors.password}
                    required
                  />
                  <Select
                    label="Rol"
                    name="roleId"
                    value={accountForm.roleId}
                    onChange={(e) => {
                      setAccountForm((prev) => ({
                        ...prev,
                        roleId: e.target.value,
                      }));
                      if (accountErrors.roleId) {
                        setAccountErrors((prev) => ({
                          ...prev,
                          roleId: "",
                        }));
                      }
                    }}
                    error={accountErrors.roleId}
                    options={[
                      { value: "", label: "Rol Seçiniz", disabled: true },
                      ...(lookups.businessRoles || []).map((role) => ({
                        value: role.id?.toString(),
                        label: role.role || role.name || `Role ID: ${role.id}`,
                      })),
                    ]}
                    required
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={creatingAccount}
                    className="w-full sm:w-auto"
                  >
                    {creatingAccount ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Ekleniyor...
                      </>
                    ) : (
                      "Hesap Ekle"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddAccountForm(false);
                      setAccountForm({
                        name: "",
                        surname: "",
                        email: "",
                        phoneNumber: "",
                        tc: "",
                        password: "",
                        roleId: "",
                      });
                      setAccountErrors({});
                    }}
                    className="w-full sm:w-auto"
                  >
                    İptal
                  </Button>
                </div>
              </form>
            )}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse bg-gray-100 dark:bg-gray-800"
                  >
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : accounts.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {accounts.map((account) => {
                  const isCurrentUser = account.email === user?.email;
                  return (
                    <div
                      key={account.id}
                      className={`border rounded-lg p-3 sm:p-4 transition-all ${isCurrentUser
                        ? "border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/30"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-sm"
                        }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <p className="font-semibold text-gray-900 dark:text-gray-100 break-words">
                              {account.name} {account.surname}
                            </p>
                            {account.isOperator && (
                              <Badge className="bg-purple-600 dark:bg-purple-700 text-white border-0 font-semibold flex-shrink-0">
                                Yetkili
                              </Badge>
                            )}
                            {isCurrentUser && (
                              <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 flex-shrink-0">
                                Siz
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                              <span className="text-gray-600 dark:text-gray-400 break-all">
                                {account.email}
                              </span>
                            </div>
                            {account.phoneNumber && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                <span className="text-gray-600 dark:text-gray-400">
                                  {account.phoneNumber}
                                </span>
                              </div>
                            )}
                            {account.role && (
                              <div className="mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {account.role.role ||
                                    `Role ID: ${account.roleId}`}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                        {isOperator && !isCurrentUser && (
                          <div className="flex flex-row sm:flex-col gap-2 sm:ml-4 flex-shrink-0">
                            {!account.isOperator && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleTransferOperatorRole(account.id)
                                }
                                disabled={
                                  transferringAccountId === account.id ||
                                  transferOperatorApi.loading
                                }
                                className="text-xs whitespace-nowrap flex items-center gap-2 flex-1 sm:flex-none"
                              >
                                {transferringAccountId === account.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <>
                                    <UserCheck className="w-3 h-3" />
                                    <span className="hidden sm:inline">
                                      Operator Yap
                                    </span>
                                    <span className="sm:hidden">Operator</span>
                                  </>
                                )}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteAccount(account.id)}
                              disabled={
                                deletingAccountId === account.id ||
                                deleteAccountApi.loading
                              }
                              className="text-xs whitespace-nowrap text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:border-red-500 dark:hover:border-red-600 flex items-center gap-2 flex-1 sm:flex-none"
                            >
                              {deletingAccountId === account.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <>
                                  <Trash2 className="w-3 h-3" />
                                  <span>Sil</span>
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Henüz hesap eklenmemiş
                </p>
                {isOperator && (
                  <Button
                    onClick={() => setShowAddAccountForm(true)}
                    variant="outline"
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    İlk Hesabı Ekle
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessAccounts;
