import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useUrlPagination from "../hooks/useUrlPagination";
import useScrollRestoration from "../hooks/useScrollRestoration";
import useDebounce from "../hooks/useDebounce";
import {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  resetAdminPassword,
  getAdminActivity,
} from "../api/adminService";
import MainLayout from "../components/layout/MainLayout";
import { useAuth } from "../context/AuthContext";
import {
  showError,
  showConfirm,
  showSuccess,
  showWarning,
} from "../utils/swal";
import {
  ShieldCheckIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  KeyIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import ModalBase from "../components/ui/ModalBase";
import { SkeletonListItem } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import Breadcrumb from "../components/ui/Breadcrumb";
import FieldError from "../components/ui/FieldError";

const Admins = () => {
  useScrollRestoration();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useUrlPagination(10);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [actionLoading, setActionLoading] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  useEffect(() => {
    if (user && !user.isSuperAdmin) {
      showError(
        "Yetkisiz Erişim",
        "Bu sayfaya erişim yetkiniz bulunmamaktadır.",
      );
      navigate("/dashboard");
      return;
    }
    if (user && user.isSuperAdmin) {
      fetchAdmins();
    }
  }, [pagination.page, debouncedSearch, user]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await getAllAdmins({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch,
      });

      if (response.success) {
        setAdmins(response.data.admins || []);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await showConfirm(
      "Admini Sil",
      "Bu admini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.",
      "Evet, Sil",
      "İptal",
    );

    if (!result.isConfirmed) {
      return;
    }

    try {
      setActionLoading({ ...actionLoading, [`delete-${id}`]: true });
      await deleteAdmin(id);
      await fetchAdmins();
      showSuccess("Başarılı", "Admin başarıyla silindi.");
    } catch (error) {
      console.error("Error deleting admin:", error);
      showError("Hata", "Admin silinirken bir hata oluştu.");
    } finally {
      setActionLoading({ ...actionLoading, [`delete-${id}`]: false });
    }
  };

  const handleViewDetail = async (adminId) => {
    try {
      const response = await getAdminById(adminId);
      if (response.success) {
        setSelectedAdmin(response.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error("Error fetching admin detail:", error);
      showError("Hata", "Admin detayları yüklenemedi.");
    }
  };

  const handleEdit = async (adminId) => {
    try {
      const response = await getAdminById(adminId);
      if (response.success) {
        setSelectedAdmin(response.data);
        setShowEditModal(true);
      }
    } catch (error) {
      console.error("Error fetching admin for edit:", error);
      showError("Hata", "Admin bilgileri yüklenemedi.");
    }
  };

  const handleOpenResetPassword = async (adminId) => {
    try {
      const response = await getAdminById(adminId);
      if (response.success) {
        setSelectedAdmin(response.data);
        setShowResetPasswordModal(true);
      }
    } catch (error) {
      console.error("Error fetching admin for reset password:", error);
      showError("Hata", "Admin bilgileri yüklenemedi.");
    }
  };

  const handleViewActivity = async (adminId) => {
    try {
      const adminResponse = await getAdminById(adminId);
      if (adminResponse.success) {
        setSelectedAdmin(adminResponse.data);
        setShowActivityModal(true);
      }
    } catch (error) {
      console.error("Error fetching admin activity:", error);
      showError("Hata", "Admin aktivite bilgileri yüklenemedi.");
    }
  };

  if (!user || !user.isSuperAdmin) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <ShieldCheckIcon className="w-16 h-16 text-gray-400 dark:text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300 text-lg font-semibold">
              Yetkisiz Erişim
            </p>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Bu sayfaya erişim yetkiniz bulunmamaktadır.
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 max-w-full overflow-x-hidden">
        <Breadcrumb />

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2 flex-shrink-0"
            >
              <PlusIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Yeni Admin Ekle</span>
              <span className="sm:hidden">Ekle</span>
            </button>
            <div className="flex flex-1 min-w-0 gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 min-w-0 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Admin ara..."
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                    setPagination({ ...pagination, page: 1 });
                  }}
                  className="px-4 sm:px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold flex-shrink-0"
                >
                  Temizle
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
          {loading ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonListItem key={i} />
              ))}
            </div>
          ) : admins.length === 0 ? (
            <EmptyState
              preset="noResults"
              title="Admin bulunamadı"
              description="Arama kriterlerinizi değiştirerek tekrar deneyebilirsiniz."
            />
          ) : (
            <>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {admins.map((admin) => (
                  <div
                    key={admin.id}
                    className="p-4 sm:p-6 hover:bg-blue-50/30 dark:hover:bg-orange-900/20 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                            {admin.name} {admin.surname}
                          </h3>
                          {admin.isSuperAdmin && (
                            <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded-full text-xs font-semibold">
                              Süper Admin
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              Kullanıcı Adı
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {admin.username}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              Oluşturulma Tarihi
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {new Date(admin.createdAt).toLocaleDateString(
                                "tr-TR",
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              Son Güncelleme
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {new Date(admin.updatedAt).toLocaleDateString(
                                "tr-TR",
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row flex-wrap sm:flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleViewDetail(admin.id)}
                          className="px-3 sm:px-4 py-2 bg-blue-100 text-blue-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-lg hover:bg-blue-200 font-medium transition-colors text-sm flex items-center gap-2"
                        >
                          <EyeIcon className="w-4 h-4" />
                          <span>Detay</span>
                        </button>
                        <button
                          onClick={() => handleViewActivity(admin.id)}
                          className="px-3 sm:px-4 py-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg hover:bg-green-200 font-medium transition-colors text-sm flex items-center gap-2"
                        >
                          <ChartBarIcon className="w-4 h-4" />
                          <span>Aktivite</span>
                        </button>
                        <button
                          onClick={() => handleEdit(admin.id)}
                          className="px-3 sm:px-4 py-2 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-lg hover:bg-purple-200 font-medium transition-colors text-sm flex items-center gap-2"
                        >
                          <PencilIcon className="w-4 h-4" />
                          <span>Düzenle</span>
                        </button>
                        <button
                          onClick={() => handleOpenResetPassword(admin.id)}
                          className="px-3 sm:px-4 py-2 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-lg hover:bg-yellow-200 font-medium transition-colors text-sm flex items-center gap-2"
                        >
                          <KeyIcon className="w-4 h-4" />
                          <span className="hidden sm:inline">
                            Şifre Sıfırla
                          </span>
                          <span className="sm:hidden">Şifre</span>
                        </button>
                        {!admin.isSuperAdmin && (
                          <button
                            onClick={() => handleDelete(admin.id)}
                            disabled={actionLoading[`delete-${admin.id}`]}
                            className="px-3 sm:px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            <TrashIcon className="w-4 h-4" />
                            <span>
                              {actionLoading[`delete-${admin.id}`]
                                ? "Siliniyor..."
                                : "Sil"}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <div className="bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="text-sm text-gray-700 dark:text-gray-200">
                    Toplam{" "}
                    <span className="font-medium">{pagination.total}</span>{" "}
                    admin
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setPagination({
                          ...pagination,
                          page: pagination.page - 1,
                        })
                      }
                      disabled={pagination.page === 1}
                      className="px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Önceki
                    </button>
                    <span className="px-3 sm:px-4 py-2 text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap">
                      {pagination.page} / {pagination.totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setPagination({
                          ...pagination,
                          page: pagination.page + 1,
                        })
                      }
                      disabled={pagination.page >= pagination.totalPages}
                      className="px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sonraki
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateAdminModal
          onClose={() => {
            setShowCreateModal(false);
            fetchAdmins();
          }}
        />
      )}

      {showEditModal && selectedAdmin && (
        <EditAdminModal
          admin={selectedAdmin}
          onClose={() => {
            setShowEditModal(false);
            setSelectedAdmin(null);
            fetchAdmins();
          }}
        />
      )}

      {showDetailModal && selectedAdmin && (
        <AdminDetailModal
          admin={selectedAdmin}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedAdmin(null);
          }}
        />
      )}

      {showResetPasswordModal && selectedAdmin && (
        <ResetPasswordModal
          admin={selectedAdmin}
          onClose={() => {
            setShowResetPasswordModal(false);
            setSelectedAdmin(null);
          }}
          onReset={async (id, newPassword) => {
            try {
              await resetAdminPassword(id, newPassword);
              showSuccess("Başarılı", "Şifre başarıyla sıfırlandı.");
              setShowResetPasswordModal(false);
              setSelectedAdmin(null);
            } catch (error) {
              console.error("Error resetting password:", error);
              showError("Hata", "Şifre sıfırlanırken bir hata oluştu.");
            }
          }}
        />
      )}

      {showActivityModal && selectedAdmin && (
        <AdminActivityModal
          admin={selectedAdmin}
          onClose={() => {
            setShowActivityModal(false);
            setSelectedAdmin(null);
          }}
        />
      )}
    </MainLayout>
  );
};

const CreateAdminModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    surname: "",
    email: "",
    phoneNumber: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.username.trim())
      newErrors.username = "Kullanıcı adı zorunludur";
    if (!formData.password) newErrors.password = "Şifre zorunludur";
    else if (formData.password.length < 6)
      newErrors.password = "Şifre en az 6 karakter olmalıdır";
    if (!formData.name.trim()) newErrors.name = "İsim zorunludur";
    if (!formData.surname.trim()) newErrors.surname = "Soyisim zorunludur";
    if (!formData.email.trim()) newErrors.email = "E-posta zorunludur";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Geçerli bir e-posta giriniz";
    if (!formData.phoneNumber.trim())
      newErrors.phoneNumber = "Telefon zorunludur";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    try {
      setLoading(true);
      const response = await createAdmin(formData);
      if (response.success) {
        onClose();
      }
    } catch (error) {
      console.error("Error creating admin:", error);
      showError("Hata", "Admin oluşturulurken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalBase
      isOpen={true}
      onClose={onClose}
      title="Yeni Admin Ekle"
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            İptal
          </button>
          <button
            type="submit"
            form="create-admin-form"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Oluşturuluyor..." : "Oluştur"}
          </button>
        </div>
      }
    >
      <form
        id="create-admin-form"
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Kullanıcı Adı *
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <FieldError error={errors.username} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Şifre *
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <FieldError error={errors.password} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              İsim *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <FieldError error={errors.name} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Soyisim *
            </label>
            <input
              type="text"
              value={formData.surname}
              onChange={(e) =>
                setFormData({ ...formData, surname: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <FieldError error={errors.surname} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              E-posta *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <FieldError error={errors.email} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Telefon *
            </label>
            <input
              type="text"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <FieldError error={errors.phoneNumber} />
          </div>
        </div>
      </form>
    </ModalBase>
  );
};

const EditAdminModal = ({ admin, onClose }) => {
  const [formData, setFormData] = useState({
    name: admin.name || "",
    surname: admin.surname || "",
    email: admin.email || "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await updateAdmin(admin.id, formData);
      if (response.success) {
        onClose();
      }
    } catch (error) {
      console.error("Error updating admin:", error);
      showError("Hata", "Admin güncellenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalBase
      isOpen={true}
      onClose={onClose}
      title="Admin Düzenle"
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            İptal
          </button>
          <button
            type="submit"
            form="edit-admin-form"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Güncelleniyor..." : "Güncelle"}
          </button>
        </div>
      }
    >
      <form id="edit-admin-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              İsim *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Soyisim *
            </label>
            <input
              type="text"
              value={formData.surname}
              onChange={(e) =>
                setFormData({ ...formData, surname: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              E-posta *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
        </div>
      </form>
    </ModalBase>
  );
};

const AdminDetailModal = ({ admin, onClose }) => {
  return (
    <ModalBase
      isOpen={true}
      onClose={onClose}
      title={`${admin.name} ${admin.surname}`}
      size="md"
      footer={
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Kapat
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Kullanıcı Adı</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {admin.username}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Durum</p>
          {admin.isSuperAdmin ? (
            <span className="px-4 py-1.5 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded-full text-sm font-semibold">
              Süper Admin
            </span>
          ) : (
            <span className="px-4 py-1.5 bg-blue-100 text-blue-800 dark:bg-orange-900/30 dark:text-orange-400 rounded-full text-sm font-semibold">
              Admin
            </span>
          )}
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Oluşturulma Tarihi</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {new Date(admin.createdAt).toLocaleDateString("tr-TR")}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Son Güncelleme</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {new Date(admin.updatedAt).toLocaleDateString("tr-TR")}
          </p>
        </div>
      </div>
    </ModalBase>
  );
};

const ResetPasswordModal = ({ admin, onClose, onReset }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showWarning("Uyarı", "Şifreler eşleşmiyor.");
      return;
    }
    if (newPassword.length < 6) {
      showWarning("Uyarı", "Şifre en az 6 karakter olmalıdır.");
      return;
    }
    try {
      setLoading(true);
      await onReset(admin.id, newPassword);
    } catch (error) {
      console.error("Error resetting password:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalBase
      isOpen={true}
      onClose={onClose}
      title="Şifre Sıfırla"
      subtitle={`${admin.name} ${admin.surname} (${admin.username})`}
      size="sm"
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            İptal
          </button>
          <button
            type="submit"
            form="reset-password-form"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Sıfırlanıyor..." : "Sıfırla"}
          </button>
        </div>
      }
    >
      <form
        id="reset-password-form"
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Yeni Şifre *
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            required
            minLength={6}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Şifre Tekrar *
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            required
            minLength={6}
          />
        </div>
      </form>
    </ModalBase>
  );
};

const AdminActivityModal = ({ admin, onClose }) => {
  const [logsData, setLogsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [activityPagination, setActivityPagination] = useState({
    page: 1,
    limit: 20,
  });

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        const response = await getAdminActivity(admin.id, {
          page: activityPagination.page,
          limit: activityPagination.limit,
        });
        if (response.success) {
          setLogsData(response.data);
        }
      } catch (error) {
        console.error("Error fetching activity:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, [admin.id, activityPagination.page, activityPagination.limit]);

  useEffect(() => {
    setActivityPagination((prev) => ({ ...prev, page: 1 }));
    setExpandedLogId(null);
  }, [admin.id]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("tr-TR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionBadgeColor = (action) => {
    if (!action)
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    if (action.includes("APPROVE"))
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    if (action.includes("REJECT"))
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    if (action.includes("DELETE"))
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    if (action.includes("CREATE"))
      return "bg-blue-100 text-blue-800 dark:bg-orange-900/30 dark:text-orange-400";
    if (action.includes("UPDATE"))
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    if (action.includes("TOGGLE"))
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
    return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  };

  const getMethodBadgeColor = (method) => {
    switch (method) {
      case "GET":
        return "bg-blue-100 text-blue-800 dark:bg-orange-900/30 dark:text-orange-400";
      case "POST":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "PUT":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "PATCH":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      case "DELETE":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getStatusCodeColor = (statusCode) => {
    if (statusCode >= 200 && statusCode < 300)
      return "text-green-600 dark:text-green-400";
    if (statusCode >= 300 && statusCode < 400)
      return "text-yellow-600 dark:text-yellow-400";
    if (statusCode >= 400) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-300";
  };

  const activityFooter = (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      {logsData?.pagination && logsData.pagination.total > 0 ? (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
          <span>Toplam {logsData.pagination.total} log</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setActivityPagination((prev) => ({
                  ...prev,
                  page: Math.max(1, prev.page - 1),
                }))
              }
              disabled={logsData.pagination.page <= 1 || loading}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Önceki
            </button>
            <span>
              Sayfa {logsData.pagination.page} /{" "}
              {logsData.pagination.totalPages}
            </span>
            <button
              onClick={() =>
                setActivityPagination((prev) => ({
                  ...prev,
                  page: Math.min(
                    logsData.pagination.totalPages || 1,
                    prev.page + 1,
                  ),
                }))
              }
              disabled={
                logsData.pagination.page >= logsData.pagination.totalPages ||
                loading
              }
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sonraki
            </button>
          </div>
        </div>
      ) : (
        <div />
      )}
      <button
        onClick={onClose}
        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        Kapat
      </button>
    </div>
  );

  return (
    <ModalBase
      isOpen={true}
      onClose={onClose}
      title="Admin Aktivite Logları"
      subtitle={`${admin.name} ${admin.surname} (${admin.username})`}
      size="xl"
      footer={activityFooter}
    >
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Yükleniyor...</p>
        </div>
      ) : logsData?.logs && logsData.logs.length > 0 ? (
        <div className="space-y-4">
          {logsData.logs.map((log) => (
            <div
              key={log.id}
              className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${getMethodBadgeColor(log.method)}`}
                    >
                      {log.method}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${getActionBadgeColor(log.action)}`}
                    >
                      {log.action || "N/A"}
                    </span>
                    <span
                      className={`text-sm font-semibold ${getStatusCodeColor(log.statusCode)}`}
                    >
                      {log.statusCode}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {log.description || log.route}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{log.route}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatDate(log.createdAt)}</span>
                    {log.ip && <span>IP: {log.ip}</span>}
                    {log.entityType && (
                      <span>
                        {log.entityType}
                        {log.entityId && ` #${log.entityId}`}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() =>
                    setExpandedLogId(
                      expandedLogId === log.id ? null : log.id,
                    )
                  }
                  className="ml-4 px-3 py-1 text-sm text-blue-600 dark:text-orange-400 hover:bg-blue-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                >
                  {expandedLogId === log.id ? "Gizle" : "Detay"}
                </button>
              </div>

              {expandedLogId === log.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 space-y-4">
                  {log.errorMessage && (
                    <div className="bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800 rounded-lg p-3">
                      <p className="text-xs font-semibold text-red-800 dark:text-red-400 mb-1">
                        Hata Mesajı
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-400">
                        {log.errorMessage}
                      </p>
                    </div>
                  )}
                  {log.userAgent && (
                    <div>
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
                        User Agent
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 break-all">
                        {log.userAgent}
                      </p>
                    </div>
                  )}
                  {log.requestBody &&
                    Object.keys(log.requestBody).length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
                          Request Body
                        </p>
                        <pre className="text-xs bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto">
                          {JSON.stringify(log.requestBody, null, 2)}
                        </pre>
                      </div>
                    )}
                  {log.requestQuery &&
                    Object.keys(log.requestQuery).length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
                          Request Query
                        </p>
                        <pre className="text-xs bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto">
                          {JSON.stringify(log.requestQuery, null, 2)}
                        </pre>
                      </div>
                    )}
                  {log.beforeData && (
                    <div>
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
                        Önceki Veri
                      </p>
                      <pre className="text-xs bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border border-yellow-200 dark:border-yellow-800 overflow-x-auto max-h-40">
                        {JSON.stringify(log.beforeData, null, 2)}
                      </pre>
                    </div>
                  )}
                  {log.afterData && (
                    <div>
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
                        Sonraki Veri
                      </p>
                      <pre className="text-xs bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-800 overflow-x-auto max-h-40">
                        {JSON.stringify(log.afterData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          Aktivite logu bulunamadı.
        </div>
      )}
    </ModalBase>
  );
};

export default Admins;
