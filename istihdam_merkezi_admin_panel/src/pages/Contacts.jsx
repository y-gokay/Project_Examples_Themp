import { useState, useEffect } from "react";
import useUrlPagination from "../hooks/useUrlPagination";
import useScrollRestoration from "../hooks/useScrollRestoration";
import {
  getAllContacts,
  getContactById,
  answerContact,
  deleteContact,
} from "../api/contactService";
import MainLayout from "../components/layout/MainLayout";
import ModalBase from "../components/ui/ModalBase";
import EmptyState from "../components/ui/EmptyState";
import { SkeletonListItem } from "../components/ui/Skeleton";
import Breadcrumb from "../components/ui/Breadcrumb";
import {
  showError,
  showConfirm,
  showSuccess,
  showWarning,
} from "../utils/swal";
import {
  CheckCircleIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

const Contacts = () => {
  useScrollRestoration();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useUrlPagination(20);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [actionLoading, setActionLoading] = useState({});
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    fetchContacts();
  }, [pagination.page, statusFilter]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await getAllContacts({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter,
      });

      if (response.success) {
        setContacts(response.data.contacts || []);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (contactId, answer) => {
    try {
      setActionLoading({ ...actionLoading, [`answer-${contactId}`]: true });
      await answerContact(contactId, answer);
      await fetchContacts();
      setShowAnswerModal(false);
      setSelectedContact(null);
    } catch (error) {
      console.error("Error answering contact:", error);
      showError("Hata", "Cevap gönderilirken bir hata oluştu.");
    } finally {
      setActionLoading({ ...actionLoading, [`answer-${contactId}`]: false });
    }
  };

  const handleDelete = async (id) => {
    const result = await showConfirm(
      "Mesajı Sil",
      "Bu iletişim mesajını silmek istediğinize emin misiniz?",
      "Evet, Sil",
      "İptal",
    );

    if (!result.isConfirmed) {
      return;
    }

    try {
      setActionLoading({ ...actionLoading, [`delete-${id}`]: true });
      await deleteContact(id);
      await fetchContacts();
      showSuccess("Başarılı", "Mesaj başarıyla silindi.");
    } catch (error) {
      console.error("Error deleting contact:", error);
      showError("Hata", "Mesaj silinirken bir hata oluştu.");
    } finally {
      setActionLoading({ ...actionLoading, [`delete-${id}`]: false });
    }
  };

  const handleViewDetail = async (contactId) => {
    try {
      const response = await getContactById(contactId);
      if (response.success) {
        setSelectedContact(response.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error("Error fetching contact detail:", error);
      showError("Hata", "İletişim mesajı detayları yüklenemedi.");
    }
  };

  const handleOpenAnswer = async (contactId) => {
    try {
      const response = await getContactById(contactId);
      if (response.success) {
        setSelectedContact(response.data);
        setShowAnswerModal(true);
      }
    } catch (error) {
      console.error("Error fetching contact for answer:", error);
      showError("Hata", "İletişim mesajı yüklenemedi.");
    }
  };

  const getStatusBadge = (isAnswered) => {
    if (isAnswered) {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-semibold">
          Cevaplandı
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-xs font-semibold">
        Beklemede
      </span>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-full overflow-x-hidden">
        <Breadcrumb />

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setStatusFilter("pending");
                setPagination({ ...pagination, page: 1 });
              }}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                statusFilter === "pending"
                  ? "bg-gradient-to-r from-yellow-600 to-yellow-700 text-white shadow-lg transform scale-105"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105"
              }`}
            >
              Bekleyen
            </button>
            <button
              onClick={() => {
                setStatusFilter("answered");
                setPagination({ ...pagination, page: 1 });
              }}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                statusFilter === "answered"
                  ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg transform scale-105"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105"
              }`}
            >
              Cevaplananlar
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
          {loading ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonListItem key={i} />
              ))}
            </div>
          ) : contacts.length === 0 ? (
            <EmptyState
              preset="noResults"
              title="İletişim mesajı bulunamadı"
              description={
                statusFilter === "pending"
                  ? "Şu an bekleyen iletişim mesajı yok."
                  : "Bu filtreye uygun mesaj bulunamadı."
              }
            />
          ) : (
            <>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-4 sm:p-6 hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                            {contact.title}
                          </h3>
                          {getStatusBadge(contact.isAnswered)}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              Gönderen
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {contact.name}
                            </p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              E-posta
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {contact.email}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              Gönderilme Tarihi
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {new Date(contact.createdAt).toLocaleDateString(
                                "tr-TR",
                              )}
                            </p>
                          </div>
                          {contact.isAnswered && contact.answerDate && (
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Cevaplanma Tarihi
                              </p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {new Date(
                                  contact.answerDate,
                                ).toLocaleDateString("tr-TR")}
                              </p>
                            </div>
                          )}
                          {contact.answeredByAdmin && (
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Cevaplayan
                              </p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {contact.answeredByAdmin.name}{" "}
                                {contact.answeredByAdmin.surname}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="mb-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Mesaj</p>
                          <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                            {contact.content}
                          </p>
                        </div>
                        {contact.isAnswered && contact.answer && (
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Cevap</p>
                            <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap line-clamp-2">
                              {contact.answer}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleViewDetail(contact.id)}
                          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 font-medium transition-colors text-sm flex items-center justify-center gap-2"
                        >
                          <EyeIcon className="w-4 h-4" />
                          <span>Detay</span>
                        </button>
                        {!contact.isAnswered && (
                          <button
                            onClick={() => handleOpenAnswer(contact.id)}
                            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 font-medium transition-colors text-sm flex items-center justify-center gap-2"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                            <span>Cevapla</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(contact.id)}
                          disabled={actionLoading[`delete-${contact.id}`]}
                          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <TrashIcon className="w-4 h-4" />
                          <span>
                            {actionLoading[`delete-${contact.id}`]
                              ? "Siliniyor..."
                              : "Sil"}
                          </span>
                        </button>
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
                    mesaj
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

      {showDetailModal && selectedContact && (
        <ContactDetailModal
          contact={selectedContact}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedContact(null);
          }}
          onAnswer={() => {
            setShowDetailModal(false);
            handleOpenAnswer(selectedContact.id);
          }}
        />
      )}

      {showAnswerModal && selectedContact && (
        <AnswerContactModal
          contact={selectedContact}
          onClose={() => {
            setShowAnswerModal(false);
            setSelectedContact(null);
          }}
          onAnswer={handleAnswer}
          actionLoading={actionLoading}
        />
      )}
    </MainLayout>
  );
};

const ContactDetailModal = ({ contact, onClose, onAnswer }) => {
  return (
    <ModalBase
      isOpen={true}
      onClose={onClose}
      title={contact.title}
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Kapat
          </button>
          {!contact.isAnswered && (
            <button
              onClick={onAnswer}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Cevapla
            </button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Gönderen</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {contact.name}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">E-posta</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {contact.email}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Gönderilme Tarihi</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {new Date(contact.createdAt).toLocaleDateString("tr-TR")}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Durum</p>
            {contact.isAnswered ? (
              <span className="px-4 py-1.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-semibold">
                Cevaplandı
              </span>
            ) : (
              <span className="px-4 py-1.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-sm font-semibold">
                Beklemede
              </span>
            )}
          </div>
          {contact.isAnswered && contact.answerDate && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Cevaplanma Tarihi</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {new Date(contact.answerDate).toLocaleDateString("tr-TR")}
              </p>
            </div>
          )}
          {contact.answeredByAdmin && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Cevaplayan</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {contact.answeredByAdmin.name}{" "}
                {contact.answeredByAdmin.surname}
              </p>
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Mesaj İçeriği</p>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
              {contact.content}
            </p>
          </div>
        </div>
        {contact.isAnswered && contact.answer && (
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Verilen Cevap</p>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/40 p-4 rounded-lg">
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                {contact.answer}
              </p>
            </div>
          </div>
        )}
      </div>
    </ModalBase>
  );
};

const AnswerContactModal = ({ contact, onClose, onAnswer, actionLoading }) => {
  const [answer, setAnswer] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answer.trim()) {
      showWarning("Uyarı", "Lütfen cevap metnini girin.");
      return;
    }
    onAnswer(contact.id, answer);
  };

  return (
    <ModalBase
      isOpen={true}
      onClose={onClose}
      title="Mesajı Cevapla"
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
            form="answer-contact-form"
            disabled={actionLoading[`answer-${contact.id}`]}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {actionLoading[`answer-${contact.id}`]
              ? "Gönderiliyor..."
              : "Gönder"}
          </button>
        </div>
      }
    >
      <form
        id="answer-contact-form"
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Gönderen</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {contact.name} ({contact.email})
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Konu</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {contact.title}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Mesaj</p>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
              {contact.content}
            </p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Cevap *
          </label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            rows="6"
            required
            placeholder="Cevabınızı buraya yazın..."
          />
        </div>
      </form>
    </ModalBase>
  );
};

export default Contacts;
