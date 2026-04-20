import { useEffect, useState, useCallback } from "react";
import {
  getAllUsers,
  getUserStats,
  createUser,
  updateUser,
  updateUserPermissions,
  assignSalonToUser,
  getSalons,
  deleteUser,
} from "../../api/axios";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";
import { useSelector } from "react-redux";
import { translateBackendError } from "../../utils/errorTranslations";
import {
  validateEmail,
  validatePhone,
  validateName,
  validatePassword,
} from "../../utils/validation";

export default function UserList() {
  const { user: currentUser } = useSelector((state) => state.auth);
  const isAdmin = currentUser?.role === "admin";

  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSalonModal, setShowSalonModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserForPermissions, setSelectedUserForPermissions] =
    useState(null);
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
  });

  // Body scroll'unu engelle
  useBodyScrollLock(showModal || showSalonModal || showPermissionsModal);

  // ESC tuşu ile modalları kapat
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        if (showModal) {
          setShowModal(false);
          setShowPassword(false);
        } else if (showSalonModal) {
          setShowSalonModal(false);
          setSelectedUser(null);
        } else if (showPermissionsModal) {
          setShowPermissionsModal(false);
          setSelectedUserForPermissions(null);
        }
      }
    };
    if (showModal || showSalonModal || showPermissionsModal) {
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [showModal, showSalonModal, showPermissionsModal]);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
    isActive: true,
  });

  const [formSalons, setFormSalons] = useState([]); // Kullanıcı oluşturma/düzenleme formu için salonlar
  const [validationErrors, setValidationErrors] = useState({});
  const [permissionsForm, setPermissionsForm] = useState({
    allowSozlesme: false,
    allowAddReservation: false,
    allowEditReservation: false,
    allowGetPayment: false,
    allowChangeDate: false,
    allowChangeSalon: false,
    allowCancelReservation: false,
    allowSearch: false,
    allowKasa: false,
    allowStatistics: false,
    allowExport: false,
    allowTodayActivities: false,
    allowSavedCustomers: false,
  });


  const loadUsers = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        // Backend'den tüm kullanıcıları çek (aktif ve pasif)
        const response = await getAllUsers({ page, limit: 10 });
        const usersData = response.data?.users || response.data || [];
        const paginationData = response.data?.pagination || {};

        // Tüm kullanıcıları göster (aktif ve pasif)
        setUsers(usersData);

        // Pagination bilgilerini backend'den gelen verilerle güncelle
        setPagination({
          currentPage: paginationData.currentPage || page,
          totalPages: paginationData.totalPages || 1,
          totalUsers: paginationData.totalUsers || usersData.length,
        });
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const loadStats = useCallback(async () => {
    try {
      const response = await getUserStats();
      setStats(response.data?.stats || null);
    } catch {
      setStats(null);
    }
  }, []);

  const loadSalons = useCallback(async () => {
    try {
      const response = await getSalons();
      const salonsData = response.data?.salons || response.data || [];
      setSalons(Array.isArray(salonsData) ? salonsData : []);
    } catch {
      setSalons([]);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
      loadStats();
      loadSalons();
    }
  }, [isAdmin, loadUsers, loadStats, loadSalons]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Real-time validation
    let validationResult = { isValid: true, error: null };

    if (name === "firstName" || name === "lastName") {
      validationResult = validateName(value);
    } else if (name === "email") {
      validationResult = validateEmail(value);
    } else if (name === "phone") {
      validationResult = validatePhone(value);
    } else if (name === "password") {
      validationResult = validatePassword(value, !editingUser);
    }

    // Update validation errors
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      if (!validationResult.isValid) {
        newErrors[name] = validationResult.error;
      } else {
        delete newErrors[name];
      }
      return newErrors;
    });

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSalonToggle = async (salonId) => {
    // Gerçek zamanlı toggle işlemi
    const wasAssigned = isAlreadyAssigned(salonId);

    try {
      setLoading(true);
      await assignSalonToUser({
        userId: selectedUser.id,
        salonId: salonId,
      });

      // Kullanıcı listesini güncelle
      const response = await getAllUsers({
        page: pagination.currentPage,
        limit: 10,
      });
      const usersData = response.data?.users || response.data || [];
      // Tüm kullanıcıları göster (aktif ve pasif)
      setUsers(usersData);

      // selectedUser'ı güncelle
      const updatedUser = usersData.find((u) => u.id === selectedUser.id);
      if (updatedUser) {
        setSelectedUser(updatedUser);
      }

      if (wasAssigned) {
        window.toast?.success?.("Salon başarıyla kaldırıldı");
      } else {
        window.toast?.success?.("Salon başarıyla atandı");
      }
    } catch (error) {
      window.toast?.error?.(
        translateBackendError(error) || "İşlem başarısız oldu"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFormSalonToggle = (salonId) => {
    setFormSalons((prev) => {
      if (prev.includes(salonId)) {
        return prev.filter((id) => id !== salonId);
      } else {
        return [...prev, salonId];
      }
    });
  };

  const isAlreadyAssigned = (salonId) => {
    if (!selectedUser || !selectedUser.userSalon) return false;
    return selectedUser.userSalon.some((us) => us.salonId === salonId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation kontrolü - Hata varsa submit etme
    if (Object.keys(validationErrors).length > 0) {
      window.toast?.error?.("Lütfen formdaki hataları düzeltin");
      return;
    }

    // Zorunlu alanları kontrol et
    const errors = {};
    if (!form.firstName || !form.firstName.trim())
      errors.firstName = "Ad zorunludur";
    if (!form.lastName || !form.lastName.trim())
      errors.lastName = "Soyad zorunludur";
    if (!form.email || !form.email.trim()) errors.email = "E-posta zorunludur";
    if (!form.phone || !form.phone.trim()) errors.phone = "Telefon zorunludur";
    if (!editingUser && (!form.password || !form.password.trim()))
      errors.password = "Şifre zorunludur";

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      window.toast?.error?.("Lütfen zorunlu alanları doldurun");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role: form.role,
        isActive: form.isActive,
      };

      if (form.password) {
        payload.password = form.password;
      }

      if (editingUser) {
        await updateUser(editingUser.id, payload);
        window.toast?.success?.("Kullanıcı başarıyla güncellendi");
      } else {
        // Yeni kullanıcı oluştur
        const response = await createUser(payload);
        const newUserId = response.data?.user?.id || response.data?.id;

        window.toast?.success?.("Kullanıcı başarıyla oluşturuldu");

        // Yeni kullanıcıya salonları ata
        if (newUserId && formSalons.length > 0) {
          let successCount = 0;
          for (const salonId of formSalons) {
            try {
              await assignSalonToUser({
                userId: newUserId,
                salonId: salonId,
              });
              successCount++;
            } catch {
              /*  console.error(`Salon ${salonId} atanamadı:`, error) */
            }
          }
          if (successCount > 0) {
            window.toast?.success?.(`${successCount} salon atandı`);
          }
        }
      }

      // Kullanıcı listesini yeniden yükle
      await loadUsers();
      await loadStats();
      setShowModal(false);
      setEditingUser(null);
      setShowPassword(false);
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        role: "user",
        isActive: true,
      });
      setFormSalons([]);
      setValidationErrors({});
    } catch (error) {
      window.toast?.error?.(
        translateBackendError(error) || "Kullanıcı kaydedilemedi"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    // Pasif kullanıcılar düzenlenemez
    if (!user.isActive) {
      window.toast?.error?.("Pasif kullanıcılar düzenlenemez");
      return;
    }
    setEditingUser(user);
    setShowPassword(false);
    setForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "",
      role: user.role || "user",
      isActive: user.isActive !== false,
    });
    // Mevcut salonları formSalons'a yükle (opsiyonel - düzenlemede yeni salon eklemek için)
    setFormSalons([]);
    setValidationErrors({});
    setShowModal(true);
  };

  const handleDelete = async (user) => {
    // Pasif kullanıcılar silinemez
    if (!user.isActive) {
      window.toast?.error?.("Pasif kullanıcılar silinemez");
      return;
    }
    const confirmMessage = `Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`;

    if (!confirm(confirmMessage)) return;

    try {
      setLoading(true);
      await deleteUser(user.id);
      window.toast?.success?.("Kullanıcı başarıyla silindi");
      // Kullanıcı listesini yeniden yükle
      await loadUsers();
      await loadStats();
    } catch (error) {
      window.toast?.error?.(
        translateBackendError(error) || "Kullanıcı silinemedi"
      );
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setShowPassword(false);
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      role: "user",
      isActive: true,
    });
    setFormSalons([]);
    setShowModal(true);
  };

  const openSalonModal = (user) => {
    // Pasif kullanıcılara salon atanamaz
    if (!user.isActive) {
      window.toast?.error?.("Pasif kullanıcılara salon atanamaz");
      return;
    }
    setSelectedUser(user);
    setShowSalonModal(true);
  };

  const openPermissionsModal = (user) => {
    // Pasif kullanıcıların yetkileri değiştirilemez
    if (!user.isActive) {
      window.toast?.error?.("Pasif kullanıcıların yetkileri değiştirilemez");
      return;
    }
    setSelectedUserForPermissions(user);
    // Admin rolündeki kullanıcılar için tüm yetkileri otomatik olarak true yap
    if (user.role === "admin") {
      setPermissionsForm({
        allowSozlesme: true,
        allowAddReservation: true,
        allowEditReservation: true,
        allowGetPayment: true,
        allowChangeDate: true,
        allowChangeSalon: true,
        allowCancelReservation: true,
        allowSearch: true,
        allowKasa: true,
        allowStatistics: true,
        allowExport: true,
        allowTodayActivities: true,
        allowSavedCustomers: true,
      });
    } else {
      // Kullanıcının mevcut yetkilerini yükle
      // user.permissions varsa onu kullan, eksik yetkileri user.allowXxx property'lerinden doldur
      const basePermissions = user.permissions || {};
      const userPermissions = {
        allowSozlesme:
          basePermissions.allowSozlesme ?? user.allowSozlesme ?? false,
        allowAddReservation:
          basePermissions.allowAddReservation ??
          user.allowAddReservation ??
          false,
        allowEditReservation:
          basePermissions.allowEditReservation ??
          user.allowEditReservation ??
          false,
        allowGetPayment:
          basePermissions.allowGetPayment ?? user.allowGetPayment ?? false,
        allowChangeDate:
          basePermissions.allowChangeDate ?? user.allowChangeDate ?? false,
        allowChangeSalon:
          basePermissions.allowChangeSalon ?? user.allowChangeSalon ?? false,
        allowCancelReservation:
          basePermissions.allowCancelReservation ??
          user.allowCancelReservation ??
          false,
        allowSearch: basePermissions.allowSearch ?? user.allowSearch ?? false,
        allowKasa: basePermissions.allowKasa ?? user.allowKasa ?? false,
        allowStatistics:
          basePermissions.allowStatistics ?? user.allowStatistics ?? false,
        allowExport: basePermissions.allowExport ?? user.allowExport ?? false,
        allowTodayActivities:
          basePermissions.allowTodayActivities ??
          user.allowTodayActivities ??
          false,
        allowSavedCustomers:
          basePermissions.allowSavedCustomers ??
          user.allowSavedCustomers ??
          false,
      };
      setPermissionsForm(userPermissions);
    }
    setShowPermissionsModal(true);
  };

  const handlePermissionsChange = (e) => {
    // Admin rolündeki kullanıcıların yetkileri değiştirilemez
    if (selectedUserForPermissions?.role === "admin") {
      return;
    }
    const { name, checked } = e.target;
    setPermissionsForm((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handlePermissionsSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserForPermissions) return;

    // Admin rolündeki kullanıcıların yetkileri değiştirilemez
    if (selectedUserForPermissions.role === "admin") {
      window.toast?.info?.("Admin kullanıcıların yetkileri değiştirilemez");
      return;
    }

    try {
      setLoading(true);
      await updateUserPermissions(
        selectedUserForPermissions.id,
        permissionsForm
      );
      window.toast?.success?.("Yetkiler başarıyla güncellendi");
      await loadUsers();
      setShowPermissionsModal(false);
      setSelectedUserForPermissions(null);
    } catch (error) {
      window.toast?.error?.(
        translateBackendError(error) || "Yetkiler güncellenemedi"
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleUserDetails = (userId) => {
    setExpandedUserId(expandedUserId === userId ? null : userId);
  };

  if (!isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-slate-100">
            Erişim Reddedildi
          </h1>
          <p className="text-gray-600 dark:text-slate-300">
            Bu sayfaya erişim için admin yetkisi gereklidir.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
              Kullanıcı Yönetimi
            </h2>
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
              Sistem kullanıcılarını yönetin
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + Yeni Kullanıcı Ekle
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
              <div className="text-sm text-gray-600 dark:text-slate-400">
                Toplam Kullanıcı
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                {stats.totalUsers || 0}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
              <div className="text-sm text-gray-600 dark:text-slate-400">
                Aktif Hesap Sayısı
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.activeUsers || 0}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
              <div className="text-sm text-gray-600 dark:text-slate-400">
                Silinen Hesap Sayısı
              </div>
              <div className="text-2xl font-bold text-gray-600 dark:text-slate-400">
                {stats.inactiveUsers || 0}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
              <div className="text-sm text-gray-600 dark:text-slate-400">
                Admin
              </div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.adminUsers || 0}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
              <div className="text-sm text-gray-600 dark:text-slate-400">
                Kullanıcı
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.regularUsers || 0}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
              <div className="text-sm text-gray-600 dark:text-slate-400">
                Yeni Kayıtlar
              </div>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {stats.recentRegistrations || 0}
              </div>
            </div>
          </div>
        )}

        {/* Users List */}
        {loading && users.length === 0 ? (
          <div className="text-center py-8">
            <div className="loading-spinner h-8 w-8 mx-auto mb-2"></div>
            <span className="text-gray-600 dark:text-slate-300">
              Kullanıcılar yükleniyor...
            </span>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
            <p className="text-gray-500 dark:text-slate-400">
              Kullanıcı bulunamadı.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop: Tablo Görünümü */}
            <div className="hidden lg:block bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                  <thead className="bg-gray-50 dark:bg-slate-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        Kullanıcı
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        İletişim
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        Son Giriş
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                    {users.map((user) => (
                      <>
                        <tr
                          key={user.id}
                          className={`hover:bg-gray-50 dark:hover:bg-slate-700/50 ${!user.isActive
                            ? "bg-gray-100 dark:bg-slate-800/50 opacity-60"
                            : ""
                            }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                                  {user.firstName?.[0]}
                                  {user.lastName?.[0]}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="flex items-center gap-2">
                                  <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                                    {user.firstName} {user.lastName}
                                  </div>
                                  {!user.isActive && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                      Silinmiş
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-slate-400">
                                  ID: {user.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-slate-100">
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="text-sm text-gray-500 dark:text-slate-400">
                                {user.phone}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === "admin"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                }`}
                            >
                              {user.role === "admin" ? "Admin" : "Kullanıcı"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                            {user.lastLogin
                              ? new Date(user.lastLogin).toLocaleDateString(
                                "tr-TR",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                              : "Hiç giriş yapmadı"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleUserDetails(user.id)}
                                className="px-2 py-1 text-xs rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                title="Detayları Göster"
                              >
                                {expandedUserId === user.id
                                  ? "▼ Detaylar"
                                  : "▶ Detaylar"}
                              </button>
                              <button
                                onClick={() => !user.isActive ? null : handleEdit(user)}
                                disabled={!user.isActive}
                                className={`px-3 py-1 text-xs rounded border transition-colors ${!user.isActive
                                  ? "border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-600 cursor-not-allowed opacity-50"
                                  : "border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
                                  }`}
                                title={!user.isActive ? "Pasif kullanıcılar düzenlenemez" : "Düzenle"}
                              >
                                Düzenle
                              </button>
                              <button
                                onClick={() => !user.isActive ? null : openSalonModal(user)}
                                disabled={!user.isActive}
                                className={`px-3 py-1 text-xs rounded border transition-colors ${!user.isActive
                                  ? "border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-600 cursor-not-allowed opacity-50"
                                  : "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40"
                                  }`}
                                title={!user.isActive ? "Pasif kullanıcılara salon atanamaz" : "Salon"}
                              >
                                Salon
                              </button>
                              <button
                                onClick={() => !user.isActive ? null : openPermissionsModal(user)}
                                disabled={!user.isActive}
                                className={`px-3 py-1 text-xs rounded border transition-colors ${!user.isActive
                                  ? "border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-600 cursor-not-allowed opacity-50"
                                  : "border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40"
                                  }`}
                                title={!user.isActive ? "Pasif kullanıcıların yetkileri değiştirilemez" : "Yetkiler"}
                              >
                                Yetkiler
                              </button>
                              <button
                                onClick={() => !user.isActive ? null : handleDelete(user)}
                                disabled={!user.isActive}
                                className={`px-3 py-1 text-xs rounded border transition-colors ${!user.isActive
                                  ? "border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-600 cursor-not-allowed opacity-50"
                                  : "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40"
                                  }`}
                                title={!user.isActive ? "Pasif kullanıcılar silinemez" : "Sil"}
                              >
                                Sil
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedUserId === user.id && (
                          <tr className="bg-gray-50 dark:bg-slate-900/50">
                            <td colSpan="5" className="px-6 py-4">
                              <div className="space-y-4">
                                {/* Kullanıcı Bilgileri */}
                                <div>
                                  <div className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                                    Kullanıcı Bilgileri:
                                  </div>
                                  <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                      <span className="text-gray-500 dark:text-slate-400">
                                        Ad Soyad:
                                      </span>
                                      <span className="ml-2 text-gray-900 dark:text-slate-100 font-medium">
                                        {user.firstName} {user.lastName}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 dark:text-slate-400">
                                        E-posta:
                                      </span>
                                      <span className="ml-2 text-gray-900 dark:text-slate-100">
                                        {user.email || "-"}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 dark:text-slate-400">
                                        Telefon:
                                      </span>
                                      <span className="ml-2 text-gray-900 dark:text-slate-100">
                                        {user.phone || "-"}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 dark:text-slate-400">
                                        Rol:
                                      </span>
                                      <span className="ml-2 text-gray-900 dark:text-slate-100 font-medium">
                                        {user.role === "admin"
                                          ? "Admin"
                                          : "Kullanıcı"}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 dark:text-slate-400">
                                        Durum:
                                      </span>
                                      <span className="ml-2 text-gray-900 dark:text-slate-100 font-medium">
                                        {user.isActive ? "Aktif" : "Pasif"}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 dark:text-slate-400">
                                        Son Giriş:
                                      </span>
                                      <span className="ml-2 text-gray-900 dark:text-slate-100">
                                        {user.lastLogin
                                          ? new Date(
                                            user.lastLogin
                                          ).toLocaleDateString("tr-TR", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })
                                          : "Hiç giriş yapmadı"}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Yetkiler */}
                                <div className="border-t border-gray-200 dark:border-slate-700 pt-3">
                                  <div className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                                    Yetkiler:
                                  </div>
                                  {user.role === "admin" ? (
                                    <div className="text-sm text-gray-600 dark:text-slate-400 italic">
                                      Admin kullanıcıların tüm yetkileri aktif
                                      durumdadır.
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                                      {(() => {
                                        // user.permissions varsa onu kullan, eksik yetkileri user.allowXxx property'lerinden doldur
                                        const basePermissions =
                                          user.permissions || {};
                                        const permissions = {
                                          allowSozlesme:
                                            basePermissions.allowSozlesme ??
                                            user.allowSozlesme ??
                                            false,
                                          allowAddReservation:
                                            basePermissions.allowAddReservation ??
                                            user.allowAddReservation ??
                                            false,
                                          allowEditReservation:
                                            basePermissions.allowEditReservation ??
                                            user.allowEditReservation ??
                                            false,
                                          allowGetPayment:
                                            basePermissions.allowGetPayment ??
                                            user.allowGetPayment ??
                                            false,
                                          allowChangeDate:
                                            basePermissions.allowChangeDate ??
                                            user.allowChangeDate ??
                                            false,
                                          allowChangeSalon:
                                            basePermissions.allowChangeSalon ??
                                            user.allowChangeSalon ??
                                            false,
                                          allowCancelReservation:
                                            basePermissions.allowCancelReservation ??
                                            user.allowCancelReservation ??
                                            false,
                                          allowSearch:
                                            basePermissions.allowSearch ??
                                            user.allowSearch ??
                                            false,
                                          allowKasa:
                                            basePermissions.allowKasa ??
                                            user.allowKasa ??
                                            false,
                                          allowStatistics:
                                            basePermissions.allowStatistics ??
                                            user.allowStatistics ??
                                            false,
                                          allowExport:
                                            basePermissions.allowExport ??
                                            user.allowExport ??
                                            false,
                                          allowTodayActivities:
                                            basePermissions.allowTodayActivities ??
                                            user.allowTodayActivities ??
                                            false,
                                          allowSavedCustomers:
                                            basePermissions.allowSavedCustomers ??
                                            user.allowSavedCustomers ??
                                            false,
                                        };

                                        const permissionLabels = {
                                          allowSozlesme: "Sözleşme İndirme",
                                          allowAddReservation:
                                            "Rezervasyon Oluşturma",
                                          allowEditReservation:
                                            "Rezervasyon Düzenleme",
                                          allowGetPayment: "Ödeme Yapma",
                                          allowChangeDate: "Tarih Değiştirme",
                                          allowChangeSalon: "Salon Değiştirme",
                                          allowCancelReservation:
                                            "Rezervasyon İptal Etme",
                                          allowSearch: "Rezervasyon Arama",
                                          allowKasa: "Kasa Sekmesi",
                                          allowStatistics: "İstatistik Sekmesi",
                                          allowExport: "Dışarı Aktarma Sekmesi",
                                          allowTodayActivities:
                                            "Hareketler Sekmesi",
                                          allowSavedCustomers:
                                            "Kayıtlı Müşteriler Sekmesi",
                                        };

                                        return Object.entries(
                                          permissionLabels
                                        ).map(([key, label]) => (
                                          <div
                                            key={key}
                                            className="flex items-center gap-2"
                                          >
                                            <span
                                              className={`w-2 h-2 rounded-full ${permissions[key]
                                                ? "bg-green-500"
                                                : "bg-gray-300 dark:bg-gray-600"
                                                }`}
                                            />
                                            <span className="text-gray-700 dark:text-slate-300">
                                              {label}
                                            </span>
                                          </div>
                                        ));
                                      })()}
                                    </div>
                                  )}
                                </div>

                                {/* Atanmış Salonlar */}
                                <div className="border-t border-gray-200 dark:border-slate-700 pt-3">
                                  <div className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                                    Atanmış Salonlar:
                                  </div>
                                  {user.userSalon &&
                                    user.userSalon.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                      {[...user.userSalon]
                                        .sort((a, b) => a.salonId - b.salonId)
                                        .map((us) => (
                                          <div
                                            key={us.id}
                                            className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded px-3 py-2"
                                          >
                                            <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                                              {us.Salon?.name ||
                                                "Bilinmeyen Salon"}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-slate-400">
                                              Salon ID: {us.salonId}
                                            </div>
                                          </div>
                                        ))}
                                    </div>
                                  ) : (
                                    <div className="text-sm text-gray-500 dark:text-slate-400 italic">
                                      Bu kullanıcıya henüz salon atanmamış.
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile: Kart Görünümü */}
            <div className="lg:hidden space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden ${!user.isActive ? "opacity-60" : ""
                    }`}
                >
                  <div className="p-4 space-y-3">
                    {/* Başlık: Avatar ve İsim */}
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-lg">
                          {user.firstName?.[0]}
                          {user.lastName?.[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">
                            {user.firstName} {user.lastName}
                          </h3>
                          <span
                            className={`px-2 py-0.5 text-xs font-semibold rounded-full ${user.role === "admin"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                              }`}
                          >
                            {user.role === "admin" ? "Admin" : "Kullanıcı"}
                          </span>
                          {!user.isActive && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                              Silinmiş
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                          ID: {user.id}
                        </div>
                      </div>
                    </div>

                    {/* İletişim Bilgileri */}
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300">
                        <svg
                          className="w-4 h-4 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="truncate">{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300">
                          <svg
                            className="w-4 h-4 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Son Giriş */}
                    <div className="text-xs text-gray-500 dark:text-slate-400">
                      <span className="font-medium">Son Giriş:</span>{" "}
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString("tr-TR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                        : "Hiç giriş yapmadı"}
                    </div>

                    {/* İşlem Butonları */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-slate-700">
                      <button
                        onClick={() => toggleUserDetails(user.id)}
                        className="flex-1 px-3 py-2 text-xs rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        {expandedUserId === user.id ? "▼ Gizle" : "▶ Detaylar"}
                      </button>
                      <button
                        onClick={() => !user.isActive ? null : handleEdit(user)}
                        disabled={!user.isActive}
                        className={`flex-1 px-3 py-2 text-xs rounded border transition-colors ${!user.isActive
                          ? "border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-600 cursor-not-allowed opacity-50"
                          : "border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
                          }`}
                        title={!user.isActive ? "Pasif kullanıcılar düzenlenemez" : "Düzenle"}
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => !user.isActive ? null : openSalonModal(user)}
                        disabled={!user.isActive}
                        className={`flex-1 px-3 py-2 text-xs rounded border transition-colors ${!user.isActive
                          ? "border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-600 cursor-not-allowed opacity-50"
                          : "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40"
                          }`}
                        title={!user.isActive ? "Pasif kullanıcılara salon atanamaz" : "Salon"}
                      >
                        Salon
                      </button>
                      <button
                        onClick={() => !user.isActive ? null : openPermissionsModal(user)}
                        disabled={!user.isActive}
                        className={`flex-1 px-3 py-2 text-xs rounded border transition-colors ${!user.isActive
                          ? "border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-600 cursor-not-allowed opacity-50"
                          : "border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40"
                          }`}
                        title={!user.isActive ? "Pasif kullanıcıların yetkileri değiştirilemez" : "Yetkiler"}
                      >
                        Yetkiler
                      </button>
                      <button
                        onClick={() => !user.isActive ? null : handleDelete(user)}
                        disabled={!user.isActive}
                        className={`flex-1 px-3 py-2 text-xs rounded border transition-colors ${!user.isActive
                          ? "border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-600 cursor-not-allowed opacity-50"
                          : "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40"
                          }`}
                        title={!user.isActive ? "Pasif kullanıcılar silinemez" : "Sil"}
                      >
                        Sil
                      </button>
                    </div>

                    {/* Genişletilmiş Detaylar */}
                    {expandedUserId === user.id && (
                      <div className="pt-3 mt-3 border-t border-gray-200 dark:border-slate-700 space-y-4">
                        {/* Kullanıcı Bilgileri */}
                        <div>
                          <div className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                            Kullanıcı Bilgileri:
                          </div>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-slate-400">
                                Ad Soyad:
                              </span>
                              <span className="ml-2 text-gray-900 dark:text-slate-100 font-medium">
                                {user.firstName} {user.lastName}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-slate-400">
                                E-posta:
                              </span>
                              <span className="ml-2 text-gray-900 dark:text-slate-100">
                                {user.email || "-"}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-slate-400">
                                Telefon:
                              </span>
                              <span className="ml-2 text-gray-900 dark:text-slate-100">
                                {user.phone || "-"}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-slate-400">
                                Rol:
                              </span>
                              <span className="ml-2 text-gray-900 dark:text-slate-100 font-medium">
                                {user.role === "admin" ? "Admin" : "Kullanıcı"}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-slate-400">
                                Durum:
                              </span>
                              <span className="ml-2 text-gray-900 dark:text-slate-100 font-medium">
                                {user.isActive ? "Aktif" : "Pasif"}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-slate-400">
                                Son Giriş:
                              </span>
                              <span className="ml-2 text-gray-900 dark:text-slate-100">
                                {user.lastLogin
                                  ? new Date(user.lastLogin).toLocaleDateString(
                                    "tr-TR",
                                    {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )
                                  : "Hiç giriş yapmadı"}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-slate-400">
                                Kayıt Tarihi:
                              </span>
                              <span className="ml-2 text-gray-900 dark:text-slate-100">
                                {user.createdAt
                                  ? new Date(user.createdAt).toLocaleDateString(
                                    "tr-TR"
                                  )
                                  : "-"}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-slate-400">
                                Güncelleme Tarihi:
                              </span>
                              <span className="ml-2 text-gray-900 dark:text-slate-100">
                                {user.updatedAt
                                  ? new Date(user.updatedAt).toLocaleDateString(
                                    "tr-TR"
                                  )
                                  : "-"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Yetkiler */}
                        <div className="border-t border-gray-200 dark:border-slate-700 pt-3">
                          <div className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                            Yetkiler:
                          </div>
                          {user.role === "admin" ? (
                            <div className="text-sm text-gray-600 dark:text-slate-400 italic">
                              Admin kullanıcıların tüm yetkileri aktif
                              durumdadır.
                            </div>
                          ) : (
                            <div className="space-y-2 text-sm">
                              {(() => {
                                // user.permissions varsa onu kullan, eksik yetkileri user.allowXxx property'lerinden doldur
                                const basePermissions = user.permissions || {};
                                const permissions = {
                                  allowSozlesme:
                                    basePermissions.allowSozlesme ??
                                    user.allowSozlesme ??
                                    false,
                                  allowAddReservation:
                                    basePermissions.allowAddReservation ??
                                    user.allowAddReservation ??
                                    false,
                                  allowEditReservation:
                                    basePermissions.allowEditReservation ??
                                    user.allowEditReservation ??
                                    false,
                                  allowGetPayment:
                                    basePermissions.allowGetPayment ??
                                    user.allowGetPayment ??
                                    false,
                                  allowChangeDate:
                                    basePermissions.allowChangeDate ??
                                    user.allowChangeDate ??
                                    false,
                                  allowChangeSalon:
                                    basePermissions.allowChangeSalon ??
                                    user.allowChangeSalon ??
                                    false,
                                  allowCancelReservation:
                                    basePermissions.allowCancelReservation ??
                                    user.allowCancelReservation ??
                                    false,
                                  allowSearch:
                                    basePermissions.allowSearch ??
                                    user.allowSearch ??
                                    false,
                                  allowKasa:
                                    basePermissions.allowKasa ??
                                    user.allowKasa ??
                                    false,
                                  allowStatistics:
                                    basePermissions.allowStatistics ??
                                    user.allowStatistics ??
                                    false,
                                  allowExport:
                                    basePermissions.allowExport ??
                                    user.allowExport ??
                                    false,
                                  allowTodayActivities:
                                    basePermissions.allowTodayActivities ??
                                    user.allowTodayActivities ??
                                    false,
                                  allowSavedCustomers:
                                    basePermissions.allowSavedCustomers ??
                                    user.allowSavedCustomers ??
                                    false,
                                };

                                const permissionLabels = {
                                  allowSozlesme: "Sözleşme İndirme",
                                  allowAddReservation: "Rezervasyon Oluşturma",
                                  allowEditReservation: "Rezervasyon Düzenleme",
                                  allowGetPayment: "Ödeme Yapma",
                                  allowChangeDate: "Tarih Değiştirme",
                                  allowChangeSalon: "Salon Değiştirme",
                                  allowCancelReservation:
                                    "Rezervasyon İptal Etme",
                                  allowSearch: "Rezervasyon Arama",
                                  allowKasa: "Kasa Sekmesi",
                                  allowStatistics: "İstatistik Sekmesi",
                                  allowExport: "Dışarı Aktarma Sekmesi",
                                  allowTodayActivities: "Hareketlerim Sekmesi",
                                  allowSavedCustomers:
                                    "Kayıtlı Müşteriler Sekmesi",
                                };

                                return Object.entries(permissionLabels).map(
                                  ([key, label]) => (
                                    <div
                                      key={key}
                                      className="flex items-center gap-2"
                                    >
                                      <span
                                        className={`w-2 h-2 rounded-full ${permissions[key]
                                          ? "bg-green-500"
                                          : "bg-gray-300 dark:bg-gray-600"
                                          }`}
                                      />
                                      <span className="text-gray-700 dark:text-slate-300">
                                        {label}
                                      </span>
                                    </div>
                                  )
                                );
                              })()}
                            </div>
                          )}
                        </div>

                        {/* Atanmış Salonlar */}
                        <div className="border-t border-gray-200 dark:border-slate-700 pt-3">
                          <div className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                            Atanmış Salonlar:
                          </div>
                          {user.userSalon && user.userSalon.length > 0 ? (
                            <div className="space-y-2">
                              {[...user.userSalon]
                                .sort((a, b) => a.salonId - b.salonId)
                                .map((us) => (
                                  <div
                                    key={us.id}
                                    className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded px-3 py-2"
                                  >
                                    <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                                      {us.Salon?.name || "Bilinmeyen Salon"}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-slate-400">
                                      Salon ID: {us.salonId}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 dark:text-slate-400 italic">
                              Henüz salon atanmamış.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between bg-white dark:bg-slate-800 px-6 py-3 border border-gray-200 dark:border-slate-700 rounded-lg">
                <div className="text-sm text-gray-700 dark:text-slate-300">
                  Toplam{" "}
                  <span className="font-medium">{pagination.totalUsers}</span>{" "}
                  kullanıcıdan{" "}
                  <span className="font-medium">
                    {(pagination.currentPage - 1) * 10 + 1}
                  </span>{" "}
                  -{" "}
                  <span className="font-medium">
                    {Math.min(
                      pagination.currentPage * 10,
                      pagination.totalUsers
                    )}
                  </span>{" "}
                  arası gösteriliyor
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadUsers(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="px-3 py-1 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-slate-600"
                  >
                    Önceki
                  </button>
                  <div className="flex items-center px-3 py-1 text-sm text-gray-700 dark:text-slate-300">
                    Sayfa {pagination.currentPage} / {pagination.totalPages}
                  </div>
                  <button
                    onClick={() => loadUsers(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-3 py-1 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-slate-600"
                  >
                    Sonraki
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 p-4">
          <div className="w-[600px] max-w-[95vw] rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-xl border dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold dark:text-slate-100">
                {editingUser ? "Kullanıcı Düzenle" : "Yeni Kullanıcı Ekle"}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setShowPassword(false);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-slate-300">
                    Ad *
                  </label>
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                    className={`w-full rounded-lg border dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${validationErrors.firstName ? "border-red-500" : ""
                      }`}
                  />
                  {validationErrors.firstName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {validationErrors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-slate-300">
                    Soyad *
                  </label>
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                    className={`w-full rounded-lg border dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${validationErrors.lastName ? "border-red-500" : ""
                      }`}
                  />
                  {validationErrors.lastName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {validationErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium dark:text-slate-300">
                  E-posta *
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className={`w-full rounded-lg border dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${validationErrors.email ? "border-red-500" : ""
                    }`}
                />
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {validationErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium dark:text-slate-300">
                  Telefon *
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  placeholder="05xxxxxxxxx"
                  className={`w-full rounded-lg border dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${validationErrors.phone ? "border-red-500" : ""
                    }`}
                />
                {validationErrors.phone && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {validationErrors.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium dark:text-slate-300">
                  Şifre {!editingUser && "*"}
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    required={!editingUser}
                    placeholder={
                      editingUser ? "Değiştirmek için yeni şifre girin" : ""
                    }
                    className={`w-full rounded-lg border dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${validationErrors.password ? "border-red-500" : ""
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {editingUser && (
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    Boş bırakırsanız mevcut şifre korunur
                  </p>
                )}
                {validationErrors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {validationErrors.password}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium dark:text-slate-300">
                  Rol *
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="user">Kullanıcı</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {!editingUser && (
                <div className="flex items-center">
                  <input
                    name="isActive"
                    type="checkbox"
                    checked={form.isActive}
                    onChange={handleChange}
                    className="mr-2 h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <label className="text-sm font-medium dark:text-slate-300">
                    Aktif
                  </label>
                </div>
              )}

              {/* Salon Seçimi - Sadece yeni kullanıcı oluştururken göster */}
              {!editingUser && (
                <div className="border-t dark:border-slate-700 pt-4">
                  <label className="mb-3 block text-sm font-medium dark:text-slate-300">
                    Salonlar (Opsiyonel)
                  </label>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto border border-gray-200 dark:border-slate-600 rounded-lg p-3">
                    {salons.length === 0 ? (
                      <div className="text-center py-4 text-sm text-gray-500 dark:text-slate-400">
                        Salon bulunamadı
                      </div>
                    ) : (
                      [...salons]
                        .sort((a, b) => a.id - b.id)
                        .map((salon) => {
                          const isSelected = formSalons.includes(salon.id);

                          return (
                            <div
                              key={salon.id}
                              className={`flex items-center p-2 rounded border transition-colors ${isSelected
                                ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700"
                                : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-700"
                                }`}
                            >
                              <input
                                type="checkbox"
                                id={`form-salon-${salon.id}`}
                                checked={isSelected}
                                onChange={() => handleFormSalonToggle(salon.id)}
                                className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500 focus:ring-2"
                              />
                              <label
                                htmlFor={`form-salon-${salon.id}`}
                                className="ml-2 flex-1 text-sm cursor-pointer text-gray-900 dark:text-slate-100"
                              >
                                {salon.name}
                              </label>
                            </div>
                          );
                        })
                    )}
                  </div>
                  {formSalons.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-slate-400">
                      {formSalons.length} salon seçildi
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4 border-t dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setShowPassword(false);
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 border border-gray-300 dark:border-slate-600 rounded-lg"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Kaydediliyor..."
                    : editingUser
                      ? "Güncelle"
                      : "Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Salon Yönetimi Modal */}
      {showSalonModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 p-4">
          <div className="w-[600px] max-w-[95vw] rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-xl border dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold dark:text-slate-100">
                Salon Yönetimi - {selectedUser.firstName}{" "}
                {selectedUser.lastName}
              </h3>
              <button
                onClick={() => {
                  setShowSalonModal(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-3 block text-sm font-medium dark:text-slate-300">
                  Salonları Seç/Kaldır (Tıklayarak ekle veya çıkar)
                </label>

                <div className="space-y-2 max-h-[450px] overflow-y-auto border border-gray-200 dark:border-slate-600 rounded-lg p-3">
                  {salons.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 dark:text-slate-400">
                      Salon bulunamadı
                    </div>
                  ) : (
                    [...salons]
                      .sort((a, b) => a.id - b.id)
                      .map((salon) => {
                        const isAssigned = isAlreadyAssigned(salon.id);

                        return (
                          <div
                            key={salon.id}
                            className={`flex items-center p-3 rounded-lg border transition-all cursor-pointer ${isAssigned
                              ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700"
                              : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-700"
                              }`}
                            onClick={() => handleSalonToggle(salon.id)}
                          >
                            <input
                              type="checkbox"
                              checked={isAssigned}
                              readOnly
                              className="h-5 w-5 text-green-600 rounded focus:ring-green-500 focus:ring-2 pointer-events-none"
                            />
                            <div className="ml-3 flex-1 text-sm font-medium text-gray-900 dark:text-slate-100">
                              {salon.name}
                              {isAssigned && (
                                <span className="ml-2 text-xs text-green-600 dark:text-green-400 font-semibold">
                                  ✓ Atanmış
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>

                {selectedUser.userSalon && (
                  <div className="mt-3 text-sm text-gray-600 dark:text-slate-400">
                    <span className="font-medium">
                      {selectedUser.userSalon.length}
                    </span>{" "}
                    salon atanmış
                  </div>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Not:</strong> Salon üzerine tıklayarak ekle veya
                  kaldır. Yeşil renkteki salonlar kullanıcıya atanmış
                  durumdadır.
                </p>
              </div>

              <div className="flex justify-end pt-4 border-t dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowSalonModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 bg-gray-600 dark:bg-slate-600 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-slate-700"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Yetkilendirme Modal */}
      {showPermissionsModal && selectedUserForPermissions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 p-4">
          <div className="w-[700px] max-w-[95vw] rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-xl border dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold dark:text-slate-100">
                Yetkilendirme - {selectedUserForPermissions.firstName}{" "}
                {selectedUserForPermissions.lastName}
              </h3>
              <button
                onClick={() => {
                  setShowPermissionsModal(false);
                  setSelectedUserForPermissions(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handlePermissionsSubmit} className="space-y-4">
              {selectedUserForPermissions?.role === "admin" ? (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    <strong>Not:</strong> Admin rolündeki kullanıcıların tüm
                    yetkileri otomatik olarak aktif durumdadır ve
                    değiştirilemez.
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>Not:</strong> Kullanıcıya verdiğiniz yetkilere göre
                    sistem özelliklerini görebilir ve kullanabilir. Yetki
                    vermediğiniz özellikler kullanıcıya görünmeyecektir.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Rezervasyon Yetkileri */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-slate-100 border-b dark:border-slate-700 pb-2">
                    Rezervasyon Yetkileri
                  </h4>
                  <label
                    className={`flex items-center p-3 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700/50 ${selectedUserForPermissions?.role === "admin"
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer"
                      }`}
                  >
                    <input
                      type="checkbox"
                      name="allowAddReservation"
                      checked={permissionsForm.allowAddReservation}
                      onChange={handlePermissionsChange}
                      disabled={selectedUserForPermissions?.role === "admin"}
                      className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500 focus:ring-2 disabled:cursor-not-allowed"
                    />
                    <span className="ml-3 text-sm text-gray-900 dark:text-slate-100">
                      Rezervasyon Oluşturma
                    </span>
                  </label>
                  <label
                    className={`flex items-center p-3 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700/50 ${selectedUserForPermissions?.role === "admin"
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer"
                      }`}
                  >
                    <input
                      type="checkbox"
                      name="allowEditReservation"
                      checked={permissionsForm.allowEditReservation}
                      onChange={handlePermissionsChange}
                      disabled={selectedUserForPermissions?.role === "admin"}
                      className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500 focus:ring-2 disabled:cursor-not-allowed"
                    />
                    <span className="ml-3 text-sm text-gray-900 dark:text-slate-100">
                      Rezervasyon Düzenleme
                    </span>
                  </label>
                  <label
                    className={`flex items-center p-3 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700/50 ${selectedUserForPermissions?.role === "admin"
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer"
                      }`}
                  >
                    <input
                      type="checkbox"
                      name="allowCancelReservation"
                      checked={permissionsForm.allowCancelReservation}
                      onChange={handlePermissionsChange}
                      disabled={selectedUserForPermissions?.role === "admin"}
                      className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500 focus:ring-2 disabled:cursor-not-allowed"
                    />
                    <span className="ml-3 text-sm text-gray-900 dark:text-slate-100">
                      Rezervasyon İptal Etme
                    </span>
                  </label>

                  <label
                    className={`flex items-center p-3 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700/50 ${selectedUserForPermissions?.role === "admin"
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer"
                      }`}
                  >
                    <input
                      type="checkbox"
                      name="allowGetPayment"
                      checked={permissionsForm.allowGetPayment}
                      onChange={handlePermissionsChange}
                      disabled={selectedUserForPermissions?.role === "admin"}
                      className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500 focus:ring-2 disabled:cursor-not-allowed"
                    />
                    <span className="ml-3 text-sm text-gray-900 dark:text-slate-100">
                      Ödeme Yapma
                    </span>
                  </label>
                  <label
                    className={`flex items-center p-3 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700/50 ${selectedUserForPermissions?.role === "admin"
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer"
                      }`}
                  >
                    <input
                      type="checkbox"
                      name="allowChangeDate"
                      checked={permissionsForm.allowChangeDate}
                      onChange={handlePermissionsChange}
                      disabled={selectedUserForPermissions?.role === "admin"}
                      className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500 focus:ring-2 disabled:cursor-not-allowed"
                    />
                    <span className="ml-3 text-sm text-gray-900 dark:text-slate-100">
                      Tarih Değiştirme
                    </span>
                  </label>
                  <label
                    className={`flex items-center p-3 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700/50 ${selectedUserForPermissions?.role === "admin"
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer"
                      }`}
                  >
                    <input
                      type="checkbox"
                      name="allowChangeSalon"
                      checked={permissionsForm.allowChangeSalon}
                      onChange={handlePermissionsChange}
                      disabled={selectedUserForPermissions?.role === "admin"}
                      className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500 focus:ring-2 disabled:cursor-not-allowed"
                    />
                    <span className="ml-3 text-sm text-gray-900 dark:text-slate-100">
                      Salon Değiştirme
                    </span>
                  </label>
                  <label
                    className={`flex items-center p-3 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700/50 ${selectedUserForPermissions?.role === "admin"
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer"
                      }`}
                  >
                    <input
                      type="checkbox"
                      name="allowSozlesme"
                      checked={permissionsForm.allowSozlesme}
                      onChange={handlePermissionsChange}
                      disabled={selectedUserForPermissions?.role === "admin"}
                      className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500 focus:ring-2 disabled:cursor-not-allowed"
                    />
                    <span className="ml-3 text-sm text-gray-900 dark:text-slate-100">
                      Sözleşme İndirme
                    </span>
                  </label>
                </div>

                {/* Diğer Yetkiler */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-slate-100 border-b dark:border-slate-700 pb-2">
                    Diğer Yetkiler
                  </h4>
                  <label
                    className={`flex items-center p-3 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700/50 ${selectedUserForPermissions?.role === "admin"
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer"
                      }`}
                  >
                    <input
                      type="checkbox"
                      name="allowTodayActivities"
                      checked={permissionsForm.allowTodayActivities}
                      onChange={handlePermissionsChange}
                      disabled={selectedUserForPermissions?.role === "admin"}
                      className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500 focus:ring-2 disabled:cursor-not-allowed"
                    />
                    <span className="ml-3 text-sm text-gray-900 dark:text-slate-100">
                      Bugünün Aktiviteleri Sekmesi
                    </span>
                  </label>
                  <label
                    className={`flex items-center p-3 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700/50 ${selectedUserForPermissions?.role === "admin"
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer"
                      }`}
                  >
                    <input
                      type="checkbox"
                      name="allowSearch"
                      checked={permissionsForm.allowSearch}
                      onChange={handlePermissionsChange}
                      disabled={selectedUserForPermissions?.role === "admin"}
                      className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500 focus:ring-2 disabled:cursor-not-allowed"
                    />
                    <span className="ml-3 text-sm text-gray-900 dark:text-slate-100">
                      Rezervasyon Arama
                    </span>
                  </label>
                  <label
                    className={`flex items-center p-3 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700/50 ${selectedUserForPermissions?.role === "admin"
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer"
                      }`}
                  >
                    <input
                      type="checkbox"
                      name="allowKasa"
                      checked={permissionsForm.allowKasa}
                      onChange={handlePermissionsChange}
                      disabled={selectedUserForPermissions?.role === "admin"}
                      className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500 focus:ring-2 disabled:cursor-not-allowed"
                    />
                    <span className="ml-3 text-sm text-gray-900 dark:text-slate-100">
                      Kasa Sekmesi
                    </span>
                  </label>
                  <label
                    className={`flex items-center p-3 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700/50 ${selectedUserForPermissions?.role === "admin"
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer"
                      }`}
                  >
                    <input
                      type="checkbox"
                      name="allowStatistics"
                      checked={permissionsForm.allowStatistics}
                      onChange={handlePermissionsChange}
                      disabled={selectedUserForPermissions?.role === "admin"}
                      className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500 focus:ring-2 disabled:cursor-not-allowed"
                    />
                    <span className="ml-3 text-sm text-gray-900 dark:text-slate-100">
                      İstatistik Sekmesi
                    </span>
                  </label>
                  <label
                    className={`flex items-center p-3 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700/50 ${selectedUserForPermissions?.role === "admin"
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer"
                      }`}
                  >
                    <input
                      type="checkbox"
                      name="allowExport"
                      checked={permissionsForm.allowExport}
                      onChange={handlePermissionsChange}
                      disabled={selectedUserForPermissions?.role === "admin"}
                      className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500 focus:ring-2 disabled:cursor-not-allowed"
                    />
                    <span className="ml-3 text-sm text-gray-900 dark:text-slate-100">
                      Dışarı Aktarma Sekmesi
                    </span>
                  </label>
                </div>

                {/* Kültür Yetkileri */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-slate-100 border-b dark:border-slate-700 pb-2">
                    Kültür Yetkileri
                  </h4>
                  <label
                    className={`flex items-center p-3 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700/50 ${selectedUserForPermissions?.role === "admin"
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer"
                      }`}
                  >
                    <input
                      type="checkbox"
                      name="allowSavedCustomers"
                      checked={permissionsForm.allowSavedCustomers}
                      onChange={handlePermissionsChange}
                      disabled={selectedUserForPermissions?.role === "admin"}
                      className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500 focus:ring-2 disabled:cursor-not-allowed"
                    />
                    <span className="ml-3 text-sm text-gray-900 dark:text-slate-100">
                      Kayıtlı Müşteriler Sekmesi
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowPermissionsModal(false);
                    setSelectedUserForPermissions(null);
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 border border-gray-300 dark:border-slate-600 rounded-lg"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={
                    loading || selectedUserForPermissions?.role === "admin"
                  }
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Kaydediliyor..." : "Yetkileri Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
