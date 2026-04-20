import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  getSalons,
  createSalon,
  updateSalon,
  deleteSalon,
} from "../../api/axios";
import { translateBackendError } from "../../utils/errorTranslations";
import { validateNumber } from "../../utils/validation";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";

export default function SalonList() {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === "admin";

  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingSalon, setEditingSalon] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    phoneNumber: "",
    defaultCapacity: "",
    defaultPrice: "",
    type: "dugun",
    // Düğün salonları için özel fiyatlar
    weekDayMorningPrice: "",
    weekdayMorningNight: "",
    weekendMorningPrice: "",
    weekendNightprice: "",
    nikahPrice: "",
  });
  const [validationErrors, setValidationErrors] = useState({});

  const loadSalons = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getSalons();
      const salonsData = res.data?.salons || res.data || [];
      const sortedSalons = Array.isArray(salonsData)
        ? [...salonsData].sort((a, b) => Number(a.id) - Number(b.id))
        : [];
      setSalons(sortedSalons);
    } catch (error) {
      setSalons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadSalons();
    }
  }, [isAdmin, loadSalons]);

  // Modal açıkken body scroll'unu engelle
  useBodyScrollLock(editingSalon !== null || isCreating);

  // ESC tuşu ile modalı kapat
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && (editingSalon || isCreating)) {
        setEditingSalon(null);
        setIsCreating(false);
        setForm({
          name: "",
          address: "",
          phoneNumber: "",
          defaultCapacity: "",
          defaultPrice: "",
          type: "dugun",
          weekDayMorningPrice: "",
          weekdayMorningNight: "",
          weekendMorningPrice: "",
          weekendNightprice: "",
          nikahPrice: "",
        });
        setValidationErrors({});
      }
    };
    if (editingSalon || isCreating) {
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [editingSalon, isCreating]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Real-time validation
    let validationResult = { isValid: true, error: null };

    if (name === "name") {
      if (!value || value.trim().length < 3) {
        validationResult = {
          isValid: false,
          error: "Salon adı en az 3 karakter olmalıdır",
        };
      } else if (value.length > 100) {
        validationResult = {
          isValid: false,
          error: "Salon adı en fazla 100 karakter olabilir",
        };
      }
    } else if (name === "phoneNumber") {
      if (value && !/^[0-9]*$/.test(value)) {
        validationResult = {
          isValid: false,
          error: "Telefon numarası sadece rakam içermelidir",
        };
      } else if (value && value.length > 11) {
        validationResult = {
          isValid: false,
          error: "Telefon numarası en fazla 11 haneli olabilir",
        };
      }
    } else if (name === "defaultCapacity") {
      validationResult = validateNumber(value, 1, 10000);
    } else if (name === "defaultPrice") {
      validationResult = validateNumber(value, 0);
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

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = () => {
    setIsCreating(true);
    setValidationErrors({});
    setForm({
      name: "",
      address: "",
      phoneNumber: "",
      defaultCapacity: "",
      defaultPrice: "",
      type: "dugun",
    });
  };

  const handleEdit = (salon) => {
    setEditingSalon(salon);
    setValidationErrors({});
    setForm({
      name: salon.name || "",
      address: salon.address || "",
      phoneNumber: salon.phoneNumber || "",
      defaultCapacity: salon.defaultCapacity || "",
      defaultPrice: salon.defaultPrice || "",
      type: salon.type || "dugun",
      // Düğün salonları için özel fiyatlar
      weekDayMorningPrice: salon.weekDayMorningPrice || "",
      weekdayMorningNight: salon.weekdayMorningNight || "",
      weekendMorningPrice: salon.weekendMorningPrice || "",
      weekendNightprice: salon.weekendNightprice || "",
      nikahPrice: salon.nikahPrice || "",
    });
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
    if (!form.name || !form.name.trim()) {
      errors.name = "Salon adı zorunludur";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      window.toast?.error?.("Lütfen zorunlu alanları doldurun");
      return;
    }

    try {
      setLoading(true);
      
      // Kültür salonlarında defaultPrice 0 ise backend'e 1 gönder
      let finalDefaultPrice = form.defaultPrice ? Number(form.defaultPrice) : null;
      if (form.type === "kultur" && finalDefaultPrice === 0) {
        finalDefaultPrice = 1;
      }
      
      const payload = {
        name: form.name.trim(),
        address: form.address.trim() || null,
        phoneNumber: form.phoneNumber.trim() || null,
        defaultCapacity: form.defaultCapacity
          ? Number(form.defaultCapacity)
          : null,
        defaultPrice: finalDefaultPrice,
        type: form.type,
      };

      // Sadece düğün salonları için özel fiyatları ekle
      if (form.type === "dugun") {
        payload.weekDayMorningPrice = form.weekDayMorningPrice
          ? Number(form.weekDayMorningPrice)
          : null;
        payload.weekdayMorningNight = form.weekdayMorningNight
          ? Number(form.weekdayMorningNight)
          : null;
        payload.weekendMorningPrice = form.weekendMorningPrice
          ? Number(form.weekendMorningPrice)
          : null;
        payload.weekendNightprice = form.weekendNightprice
          ? Number(form.weekendNightprice)
          : null;
        payload.nikahPrice = form.nikahPrice ? Number(form.nikahPrice) : null;
      }

      if (isCreating) {
        await createSalon(payload);
        window.toast?.success?.("Salon başarıyla oluşturuldu");
      } else if (editingSalon) {
        await updateSalon(editingSalon.id, payload);
        window.toast?.success?.("Salon başarıyla güncellendi");
      }

      await loadSalons();
      setEditingSalon(null);
      setIsCreating(false);
      setValidationErrors({});
      setForm({
        name: "",
        address: "",
        phoneNumber: "",
        defaultCapacity: "",
        defaultPrice: "",
        type: "dugun",
        weekDayMorningPrice: "",
        weekdayMorningNight: "",
        weekendMorningPrice: "",
        weekendNightprice: "",
        nikahPrice: "",
      });
    } catch (error) {
      const errorMessage =
        translateBackendError(error) ||
        (isCreating
          ? "Salon oluşturulurken hata oluştu"
          : "Salon güncellenirken hata oluştu");
      window.toast?.error?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (salon) => {
    if (!confirm(`${salon.name} salonunu silmek istediğinizden emin misiniz?`))
      return;
    try {
      setLoading(true);
      await deleteSalon(salon.id);
      await loadSalons();
      window.toast?.success?.("Salon başarıyla silindi");
    } catch (error) {
      const errorMessage =
        translateBackendError(error) || "Salon silinirken hata oluştu";
      window.toast?.error?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingSalon(null);
    setIsCreating(false);
    setValidationErrors({});
    setForm({
      name: "",
      address: "",
      phoneNumber: "",
      defaultCapacity: "",
      defaultPrice: "",
      type: "dugun",
      weekDayMorningPrice: "",
      weekdayMorningNight: "",
      weekendMorningPrice: "",
      weekendNightprice: "",
      nikahPrice: "",
    });
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

  if (loading && salons.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="loading-spinner h-8 w-8"></div>
        <span className="ml-2 text-gray-600 dark:text-slate-300">
          Salonlar yükleniyor...
        </span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
          Salon Yönetimi
        </h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600 dark:text-slate-300">
            Toplam {salons.length} salon
          </div>
          <button
            onClick={handleCreate}
            className="rounded-lg bg-blue-600 dark:bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            + Yeni Salon Ekle
          </button>
        </div>
      </div>

      {salons.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-500 dark:text-slate-300">
            Henüz salon bulunmuyor.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {salons.map((salon) => (
            <div
              key={salon.id}
              className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                  {salon.name}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(salon)}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    Düzenle
                  </button>
                  {/* <button
                    onClick={() => handleDelete(salon)}
                    className="text-sm font-medium text-red-600 hover:text-red-800"
                  >
                    Sil
                  </button> */}
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 dark:text-slate-300">
                {salon.type && (
                  <div className="flex items-start">
                    <span className="w-20 font-medium">Tip:</span>
                    <span className="capitalize">
                      {salon.type === "dugun" ? "Düğün" : "Kültür"}
                    </span>
                  </div>
                )}
                {salon.address && (
                  <div className="flex items-start">
                    <span className="w-20 font-medium">Adres:</span>
                    <span>{salon.address}</span>
                  </div>
                )}
                {salon.phoneNumber && (
                  <div className="flex items-start">
                    <span className="w-20 font-medium">Telefon:</span>
                    <span>{salon.phoneNumber}</span>
                  </div>
                )}
                {salon.defaultCapacity && (
                  <div className="flex items-start">
                    <span className="w-20 font-medium">Kapasite:</span>
                    <span>{salon.defaultCapacity} kişi</span>
                  </div>
                )}
                {salon.defaultPrice && (
                  <div className="flex items-start">
                    <span className="w-20 font-medium">Fiyat:</span>
                    <span>
                      ₺
                      {Number(salon.defaultPrice || 0).toLocaleString("tr-TR", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 border-t border-gray-100 dark:border-slate-700 pt-4 text-xs text-gray-500 dark:text-slate-500">
                Oluşturulma:{" "}
                {salon.createdAt
                  ? new Date(salon.createdAt).toLocaleDateString("tr-TR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : "-"}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create Modal */}
      {(editingSalon || isCreating) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 dark:bg-black/60">
          <div className="w-[500px] max-w-[95vw] rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-xl border dark:border-slate-700">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold dark:text-slate-100">
                {isCreating
                  ? "Yeni Salon Oluştur"
                  : `Salon Düzenle - ${editingSalon.name}`}
              </h3>
              <button
                onClick={handleCancel}
                className="rounded-lg p-2 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-slate-600 dark:text-slate-100"
                aria-label="Modalı kapat"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-slate-300">
                  Salon Adı *
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  readOnly={!isCreating}
                  required
                  className={`w-full rounded-lg border dark:border-slate-600 px-3 py-2 ${
                    isCreating
                      ? "input"
                      : "cursor-not-allowed bg-gray-50 dark:bg-slate-900 dark:text-slate-300"
                  } ${validationErrors.name ? "border-red-500" : ""}`}
                  placeholder="Salon adı"
                />
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {validationErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium dark:text-slate-300">
                  Salon Tipi
                </label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className={`input ${
                    editingSalon
                      ? "cursor-not-allowed bg-gray-50 dark:bg-slate-900 dark:text-slate-300"
                      : ""
                  }`}
                  disabled={!!editingSalon}
                >
                  <option value="dugun">Düğün</option>
                  <option value="kultur">Kültür</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium dark:text-slate-300">
                  Adres
                </label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  className="input"
                  placeholder="Salon adresi"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-slate-300">
                    Telefon
                  </label>
                  <input
                    name="phoneNumber"
                    type="tel"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    className={`input ${
                      validationErrors.phoneNumber ? "border-red-500" : ""
                    }`}
                    placeholder="05xxxxxxxxx"
                  />
                  {validationErrors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {validationErrors.phoneNumber}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-slate-300">
                    Varsayılan Kapasite
                  </label>
                  <input
                    name="defaultCapacity"
                    type="number"
                    min="1"
                    value={form.defaultCapacity}
                    onChange={handleChange}
                    className={`input ${
                      validationErrors.defaultCapacity ? "border-red-500" : ""
                    }`}
                    placeholder="200"
                  />
                  {validationErrors.defaultCapacity && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {validationErrors.defaultCapacity}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium dark:text-slate-300">
                  Varsayılan Fiyat (₺)
                </label>
                <input
                  name="defaultPrice"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  value={form.defaultPrice}
                  onChange={handleChange}
                  className={`input ${
                    validationErrors.defaultPrice ? "border-red-500" : ""
                  }`}
                  placeholder="50000"
                />
                {validationErrors.defaultPrice && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {validationErrors.defaultPrice}
                  </p>
                )}
              </div>

              {/* Düğün salonları için özel fiyat alanları */}
              {form.type === "dugun" && (
                <div className="space-y-4 rounded-lg border border-gray-200 dark:border-slate-700 p-4 bg-gray-50 dark:bg-slate-900">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-3">
                    Özel Fiyatlandırma
                  </h4>
                  
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium dark:text-slate-300">
                        Hafta İçi Gündüz (₺)
                      </label>
                      <input
                        name="weekDayMorningPrice"
                        type="number"
                        inputMode="numeric"
                        min="0"
                        step="1"
                        value={form.weekDayMorningPrice}
                        onChange={handleChange}
                        className="input"
                        placeholder="Varsayılan fiyat"
                      />
                    </div>
                    
                    <div>
                      <label className="mb-1 block text-sm font-medium dark:text-slate-300">
                        Hafta İçi Akşam (₺)
                      </label>
                      <input
                        name="weekdayMorningNight"
                        type="number"
                        inputMode="numeric"
                        min="0"
                        step="1"
                        value={form.weekdayMorningNight}
                        onChange={handleChange}
                        className="input"
                        placeholder="Varsayılan fiyat"
                      />
                    </div>
                    
                    <div>
                      <label className="mb-1 block text-sm font-medium dark:text-slate-300">
                        Hafta Sonu Gündüz (₺)
                      </label>
                      <input
                        name="weekendMorningPrice"
                        type="number"
                        inputMode="numeric"
                        min="0"
                        step="1"
                        value={form.weekendMorningPrice}
                        onChange={handleChange}
                        className="input"
                        placeholder="Varsayılan fiyat"
                      />
                    </div>
                    
                    <div>
                      <label className="mb-1 block text-sm font-medium dark:text-slate-300">
                        Hafta Sonu Akşam (₺)
                      </label>
                      <input
                        name="weekendNightprice"
                        type="number"
                        inputMode="numeric"
                        min="0"
                        step="1"
                        value={form.weekendNightprice}
                        onChange={handleChange}
                        className="input"
                        placeholder="Varsayılan fiyat"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-sm font-medium dark:text-slate-300">
                        Nikah Fiyatı (₺) - Tüm Durumlar İçin
                      </label>
                      <input
                        name="nikahPrice"
                        type="number"
                        inputMode="numeric"
                        min="0"
                        step="1"
                        value={form.nikahPrice}
                        onChange={handleChange}
                        className="input"
                        placeholder="Nikah için özel fiyat"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                        Nikah etkinlikleri için tüm zaman ve gün durumlarında bu fiyat kullanılır
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-lg border dark:border-slate-600 px-4 py-2 font-medium hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-slate-100"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-blue-600 dark:bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? isCreating
                      ? "Oluşturuluyor..."
                      : "Güncelleniyor..."
                    : isCreating
                    ? "Oluştur"
                    : "Güncelle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
