import { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { LuX, LuUserPlus } from "react-icons/lu";
import toast from "react-hot-toast";
import {
  getSavedCustomers,
  createSavedCustomer,
  updateSavedCustomer,
  deleteSavedCustomer,
} from "../../api/axios";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";
import { translateBackendError } from "../../utils/errorTranslations";
import {
  validateTCOrTaxNumber,
  validatePhone,
  validateIBAN,
  validateBankName,
  validateAccountName,
  validateAddress,
} from "../../utils/validation";

const ErrorMessage = ({ fieldName, validationErrors }) => {
  if (!validationErrors[fieldName]) return null;
  return (
    <p className="text-red-600 text-sm mt-1 dark:text-red-400">
      {validationErrors[fieldName]}
    </p>
  );
};

export default function SavedCustomersModal({
  open,
  onClose,
  onSelectCustomer,
  initialFormData = null,
}) {
  const [savedCustomers, setSavedCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  useBodyScrollLock(open);

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    secondaryPhone: "",
    customerEmail: "",
    customerTc: "",
    orgOwnerName: "",
    orgName: "",
    address: "",
    accountName: "",
    bank: "",
    iban: "",
    vergiDairesi: "",
  });

  const loadSavedCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getSavedCustomers();
      const customers = response.data?.customers || [];
      setSavedCustomers(customers);
    } catch (error) {
      console.error("Kayıtlı müşteriler yüklenirken hata:", error);
      toast.error("Kayıtlı müşteriler yüklenirken bir hata oluştu");
      setSavedCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleClose = useCallback(() => {
    setIsCreating(false);
    setEditingCustomer(null);
    setValidationErrors({});
    setForm({
      customerName: "",
      customerPhone: "",
      secondaryPhone: "",
      customerEmail: "",
      customerTc: "",
      orgOwnerName: "",
      orgName: "",
      address: "",
      accountName: "",
      bank: "",
      iban: "",
      vergiDairesi: "",
    });
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      loadSavedCustomers();
      setSearchTerm("");
      setIsCreating(false);
      setEditingCustomer(null);
      setValidationErrors({});
      if (initialFormData) {
        setForm(initialFormData);
      } else {
        setForm({
          customerName: "",
          customerPhone: "",
          secondaryPhone: "",
          customerEmail: "",
          customerTc: "",
          orgOwnerName: "",
          orgName: "",
          address: "",
          accountName: "",
          bank: "",
          iban: "",
          vergiDairesi: "",
        });
      }
    }
  }, [open, loadSavedCustomers, initialFormData]);

  // ESC tuşu ile modalı kapat
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && open) {
        handleClose();
      }
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [open, handleClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Validation
    let validationResult = { isValid: true, error: null };

    if (name === "customerTc" && value.trim()) {
      validationResult = validateTCOrTaxNumber(value);
    } else if (
      (name === "customerPhone" || name === "secondaryPhone") &&
      value.trim()
    ) {
      validationResult = validatePhone(value);
    } else if (name === "iban" && value.trim()) {
      validationResult = validateIBAN(value);
    } else if (name === "bank" && value.trim()) {
      validationResult = validateBankName(value);
    } else if (name === "accountName" && value.trim()) {
      validationResult = validateAccountName(value);
    } else if (name === "address" && value.trim()) {
      validationResult = validateAddress(value);
    }

    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      if (!validationResult.isValid) {
        newErrors[name] = validationResult.error;
      } else {
        delete newErrors[name];
      }
      return newErrors;
    });
  };

  const validateForm = () => {
    const errors = {};

    if (!form.customerName || !form.customerName.trim()) {
      errors.customerName = "Müşteri adı zorunludur";
    }

    if (!form.customerPhone || !form.customerPhone.trim()) {
      errors.customerPhone = "Telefon numarası zorunludur";
    } else {
      const phoneValidation = validatePhone(form.customerPhone);
      if (!phoneValidation.isValid) {
        errors.customerPhone = phoneValidation.error;
      }
    }

    if (!form.customerTc || !form.customerTc.trim()) {
      errors.customerTc = "TC No / Vergi No zorunludur";
    } else {
      const tcValidation = validateTCOrTaxNumber(form.customerTc);
      if (!tcValidation.isValid) {
        errors.customerTc = tcValidation.error;
      }
    }

    if (form.iban && form.iban.trim()) {
      const ibanValidation = validateIBAN(form.iban);
      if (!ibanValidation.isValid) {
        errors.iban = ibanValidation.error;
      }
    }

    if (form.bank && form.bank.trim()) {
      const bankValidation = validateBankName(form.bank);
      if (!bankValidation.isValid) {
        errors.bank = bankValidation.error;
      }
    }

    if (form.accountName && form.accountName.trim()) {
      const accountValidation = validateAccountName(form.accountName);
      if (!accountValidation.isValid) {
        errors.accountName = accountValidation.error;
      }
    }

    if (form.address && form.address.trim()) {
      const addressValidation = validateAddress(form.address);
      if (!addressValidation.isValid) {
        errors.address = addressValidation.error;
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Lütfen formdaki hataları düzeltin");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.trim(),
        customerTc: form.customerTc.trim(),
        secondaryPhone: form.secondaryPhone?.trim() || "",
        orgOwnerName: form.orgOwnerName?.trim() || "",
        orgName: form.orgName?.trim() || "",
        address: form.address?.trim() || "",
        accountName: form.accountName?.trim() || "",
        bank: form.bank?.trim() || "",
        iban: form.iban?.trim() || "",
        vergiDairesi: form.vergiDairesi?.trim() || "",
      };

      if (
        form.customerEmail &&
        form.customerEmail.trim() &&
        form.customerEmail.includes("@")
      ) {
        payload.customerEmail = form.customerEmail.trim();
      }

      if (editingCustomer) {
        await updateSavedCustomer(editingCustomer.id, payload);
        toast.success("Müşteri bilgileri güncellendi");
      } else {
        await createSavedCustomer(payload);
        toast.success("Müşteri kaydedildi");
      }

      await loadSavedCustomers();
      setIsCreating(false);
      setEditingCustomer(null);
      setForm({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        customerTc: "",
        orgOwnerName: "",
        orgName: "",
        address: "",
        accountName: "",
        bank: "",
        iban: "",
        vergiDairesi: "",
      });
      setValidationErrors({});
    } catch (error) {
      console.error("Müşteri kaydedilirken hata:", error);
      const errorMessage = translateBackendError(error);
      toast.error(errorMessage || "Müşteri kaydedilirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setIsCreating(true);
    setForm({
      customerName: customer.customerName || "",
      customerPhone: customer.customerPhone || "",
      secondaryPhone: customer.secondaryPhone || "",
      customerEmail: customer.customerEmail || "",
      customerTc: customer.customerTc || "",
      orgOwnerName: customer.orgOwnerName || "",
      orgName: customer.orgName || "",
      address: customer.address || "",
      accountName: customer.accountName || "",
      bank: customer.bank || "",
      iban: customer.iban || "",
      vergiDairesi: customer.vergiDairesi || "",
    });
    setValidationErrors({});
  };

  const handleDelete = async (customerId) => {
    if (!window.confirm("Bu müşteriyi silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      setLoading(true);
      await deleteSavedCustomer(customerId);
      toast.success("Müşteri silindi");
      await loadSavedCustomers();
    } catch (error) {
      console.error("Müşteri silinirken hata:", error);
      const errorMessage = translateBackendError(error);
      toast.error(errorMessage || "Müşteri silinirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCustomer = (customer) => {
    onSelectCustomer?.(customer);
    handleClose();
  };

  const handleStartCreate = () => {
    setIsCreating(true);
    setEditingCustomer(null);
    setForm({
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      customerTc: "",
      orgOwnerName: "",
      orgName: "",
      address: "",
      accountName: "",
      bank: "",
      iban: "",
      vergiDairesi: "",
    });
    setValidationErrors({});
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setEditingCustomer(null);
    setForm({
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      customerTc: "",
      orgOwnerName: "",
      orgName: "",
      address: "",
      accountName: "",
      bank: "",
      iban: "",
      vergiDairesi: "",
    });
    setValidationErrors({});
  };

  const filteredCustomers = savedCustomers.filter((customer) => {
    const searchLower = searchTerm.toLocaleLowerCase("tr-TR");
    return (
      customer.customerName?.toLocaleLowerCase("tr-TR").includes(searchLower) ||
      customer.customerPhone?.includes(searchTerm) ||
      customer.orgName?.toLocaleLowerCase("tr-TR").includes(searchLower) ||
      customer.customerTc?.includes(searchTerm)
    );
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {isCreating
              ? editingCustomer
                ? "Müşteri Düzenle"
                : "Yeni Müşteri Ekle"
              : "Kayıtlı Müşteriler"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <LuX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isCreating ? (
            /* Create/Edit Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Organizasyon İsmi
                  </label>
                  <input
                    name="orgName"
                    value={form.orgName}
                    onChange={handleChange}
                    className={`input ${
                      validationErrors.orgName ? "input-error" : ""
                    }`}
                    placeholder="Organizasyon İsmi"
                  />
                  <ErrorMessage
                    fieldName="orgName"
                    validationErrors={validationErrors}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Müşteri / Firma Adı *
                  </label>
                  <input
                    name="customerName"
                    value={form.customerName}
                    onChange={handleChange}
                    required
                    className={`input ${
                      validationErrors.customerName ? "input-error" : ""
                    }`}
                    placeholder="Müşteri / Firma Adı"
                  />
                  <ErrorMessage
                    fieldName="customerName"
                    validationErrors={validationErrors}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Telefon *
                  </label>
                  <input
                    name="customerPhone"
                    value={form.customerPhone}
                    onChange={handleChange}
                    required
                    className={`input ${
                      validationErrors.customerPhone ? "input-error" : ""
                    }`}
                    placeholder="05xxxxxxxxx"
                  />
                  <ErrorMessage
                    fieldName="customerPhone"
                    validationErrors={validationErrors}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Organizasyon Sahibi Tel No
                  </label>
                  <input
                    name="secondaryPhone"
                    value={form.secondaryPhone}
                    onChange={handleChange}
                    className={`input ${
                      validationErrors.secondaryPhone ? "input-error" : ""
                    }`}
                    placeholder="05xxxxxxxxx"
                  />
                  <ErrorMessage
                    fieldName="secondaryPhone"
                    validationErrors={validationErrors}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    TC No / Vergi No *
                  </label>
                  <input
                    name="customerTc"
                    value={form.customerTc}
                    onChange={handleChange}
                    required
                    className={`input ${
                      validationErrors.customerTc ? "input-error" : ""
                    }`}
                    placeholder="TC No (11 haneli) veya Vergi No (10 haneli)"
                  />
                  <ErrorMessage
                    fieldName="customerTc"
                    validationErrors={validationErrors}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    E-posta Adresi
                  </label>
                  <input
                    name="customerEmail"
                    type="email"
                    value={form.customerEmail}
                    onChange={handleChange}
                    className={`input ${
                      validationErrors.customerEmail ? "input-error" : ""
                    }`}
                    placeholder="email@example.com"
                  />
                  <ErrorMessage
                    fieldName="customerEmail"
                    validationErrors={validationErrors}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Organizasyon Yekilisi Adı
                  </label>
                  <input
                    name="orgOwnerName"
                    value={form.orgOwnerName}
                    onChange={handleChange}
                    className={`input ${
                      validationErrors.orgOwnerName ? "input-error" : ""
                    }`}
                    placeholder="Organizasyon Yekilisi Adı"
                  />
                  <ErrorMessage
                    fieldName="orgOwnerName"
                    validationErrors={validationErrors}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Vergi Dairesi
                  </label>
                  <input
                    name="vergiDairesi"
                    value={form.vergiDairesi}
                    onChange={handleChange}
                    className={`input ${
                      validationErrors.vergiDairesi ? "input-error" : ""
                    }`}
                    placeholder="Vergi Dairesi"
                  />
                  <ErrorMessage
                    fieldName="vergiDairesi"
                    validationErrors={validationErrors}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Adres
                  </label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className={`input ${
                      validationErrors.address ? "input-error" : ""
                    }`}
                    placeholder="Adres"
                    rows={2}
                  />
                  <ErrorMessage
                    fieldName="address"
                    validationErrors={validationErrors}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Banka Adı
                  </label>
                  <input
                    name="bank"
                    value={form.bank}
                    onChange={handleChange}
                    className={`input ${
                      validationErrors.bank ? "input-error" : ""
                    }`}
                    placeholder="Banka Adı"
                  />
                  <ErrorMessage
                    fieldName="bank"
                    validationErrors={validationErrors}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Hesap Adı
                  </label>
                  <input
                    name="accountName"
                    value={form.accountName}
                    onChange={handleChange}
                    className={`input ${
                      validationErrors.accountName ? "input-error" : ""
                    }`}
                    placeholder="Hesap Adı"
                  />
                  <ErrorMessage
                    fieldName="accountName"
                    validationErrors={validationErrors}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    IBAN
                  </label>
                  <input
                    name="iban"
                    value={form.iban}
                    onChange={handleChange}
                    className={`input ${
                      validationErrors.iban ? "input-error" : ""
                    }`}
                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                  />
                  <ErrorMessage
                    fieldName="iban"
                    validationErrors={validationErrors}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCancelCreate}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading
                    ? "Kaydediliyor..."
                    : editingCustomer
                    ? "Güncelle"
                    : "Kaydet"}
                </button>
              </div>
            </form>
          ) : (
            /* Customer List */
            <>
              <div className="mb-4 flex gap-3">
                <input
                  type="text"
                  placeholder="Müşteri ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 input"
                />
                <button
                  onClick={handleStartCreate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <LuUserPlus className="w-5 h-5" />
                  Yeni Müşteri
                </button>
              </div>

              {loading && savedCustomers.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Yükleniyor...
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {searchTerm
                    ? "Arama sonucu bulunamadı"
                    : "Kayıtlı müşteri bulunamadı"}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                              {customer.customerName}
                            </h3>
                            {customer.orgName && (
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                ({customer.orgName})
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <div>
                              <span className="font-medium">Telefon:</span>{" "}
                              {customer.customerPhone}
                            </div>
                            {customer.secondaryPhone && (
                              <div>
                                <span className="font-medium">
                                  Organizasyon Sahibi Tel No:
                                </span>{" "}
                                {customer.secondaryPhone}
                              </div>
                            )}
                            <div>
                              <span className="font-medium">TC/Vergi No:</span>{" "}
                              {customer.customerTc}
                            </div>
                            {customer.customerEmail && (
                              <div>
                                <span className="font-medium">E-posta:</span>{" "}
                                {customer.customerEmail}
                              </div>
                            )}
                            {customer.orgOwnerName && (
                              <div>
                                <span className="font-medium">Yekili:</span>{" "}
                                {customer.orgOwnerName}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleSelectCustomer(customer)}
                            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Seç
                          </button>
                          <button
                            onClick={() => handleEdit(customer)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="Düzenle"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(customer.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Sil"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

SavedCustomersModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelectCustomer: PropTypes.func,
  initialFormData: PropTypes.object,
};
