import { useState, useEffect } from "react";
import { getAllFAQs, createFAQ, deleteFAQ } from "../api/faqService";
import {
  showError,
  showConfirm,
  showSuccess,
  showWarning,
} from "../utils/swal";
import MainLayout from "../components/layout/MainLayout";
import ModalBase from "../components/ui/ModalBase";
import FieldError from "../components/ui/FieldError";
import EmptyState from "../components/ui/EmptyState";
import { SkeletonListItem } from "../components/ui/Skeleton";
import Breadcrumb from "../components/ui/Breadcrumb";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

const FAQs = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await getAllFAQs();
      if (response.success) {
        setFaqs(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await showConfirm(
      "SSS'yi Sil",
      "Bu SSS'yi silmek istediğinize emin misiniz?",
      "Evet, Sil",
      "İptal",
    );

    if (!result.isConfirmed) {
      return;
    }

    try {
      setActionLoading({ ...actionLoading, [`delete-${id}`]: true });
      await deleteFAQ(id);
      await fetchFAQs();
      showSuccess("Başarılı", "SSS başarıyla silindi.");
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      showError("Hata", "SSS silinirken bir hata oluştu.");
    } finally {
      setActionLoading({ ...actionLoading, [`delete-${id}`]: false });
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-full overflow-x-hidden">
        <Breadcrumb />

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="p-5 border-b border-gray-200 dark:border-gray-600 flex justify-end">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Yeni SSS Ekle
            </button>
          </div>
          {loading ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonListItem key={i} />
              ))}
            </div>
          ) : faqs.length === 0 ? (
            <EmptyState
              title="Henüz SSS eklenmemiş"
              description="Sıkça sorulan soruları ekleyerek kullanıcılarınıza yardımcı olun."
              actionLabel="Yeni SSS Ekle"
              onAction={() => setShowCreateModal(true)}
            />
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="p-6 hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {faq.question}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-200">{faq.answer}</p>
                      {faq.createdAt && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                          Oluşturulma:{" "}
                          {new Date(faq.createdAt).toLocaleDateString("tr-TR")}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleDelete(faq.id)}
                        disabled={actionLoading[`delete-${faq.id}`]}
                        className="px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <TrashIcon className="w-4 h-4" />
                        {actionLoading[`delete-${faq.id}`]
                          ? "Siliniyor..."
                          : "Sil"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateFAQModal
          onClose={() => {
            setShowCreateModal(false);
            fetchFAQs();
          }}
        />
      )}
    </MainLayout>
  );
};

const CreateFAQModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.question || formData.question.trim().length < 10) {
      newErrors.question = "Soru en az 10 karakter olmalıdır";
    }

    if (!formData.answer || formData.answer.trim().length < 10) {
      newErrors.answer = "Cevap en az 10 karakter olmalıdır";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showWarning("Uyarı", "Lütfen form hatalarını düzeltin");
      return;
    }

    try {
      setLoading(true);
      const response = await createFAQ(formData);
      if (response.success) {
        showSuccess("Başarılı", "SSS başarıyla oluşturuldu.");
        onClose();
      }
    } catch (error) {
      console.error("Error creating FAQ:", error);
      showError("Hata", "SSS oluşturulurken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  return (
    <ModalBase
      isOpen={true}
      onClose={onClose}
      title="Yeni SSS Ekle"
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
            form="create-faq-form"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Oluşturuluyor..." : "Oluştur"}
          </button>
        </div>
      }
    >
      <form id="create-faq-form" onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Soru *{" "}
            <span className="text-gray-500 dark:text-gray-400 text-xs">(En az 10 karakter)</span>
          </label>
          <input
            type="text"
            name="question"
            value={formData.question}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
              errors.question ? "border-red-500" : "border-gray-300 dark:border-gray-600"
            }`}
            placeholder="Örn: Nasıl başvuru yapabilirim?"
          />
          <FieldError error={errors.question} />
          {formData.question &&
            formData.question.trim().length > 0 &&
            formData.question.trim().length < 10 && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {formData.question.trim().length}/10 karakter
              </p>
            )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Cevap *{" "}
            <span className="text-gray-500 dark:text-gray-400 text-xs">(En az 10 karakter)</span>
          </label>
          <textarea
            name="answer"
            value={formData.answer}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
              errors.answer ? "border-red-500" : "border-gray-300 dark:border-gray-600"
            }`}
            rows="6"
            placeholder="SSS cevabını buraya yazın..."
          />
          <FieldError error={errors.answer} />
          {formData.answer &&
            formData.answer.trim().length > 0 &&
            formData.answer.trim().length < 10 && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {formData.answer.trim().length}/10 karakter
              </p>
            )}
        </div>
      </form>
    </ModalBase>
  );
};

export default FAQs;
