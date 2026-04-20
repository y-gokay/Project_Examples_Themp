import React, { useState, useCallback, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { LuX } from "react-icons/lu";
import LoadingSpinner from "./LoadingSpinner";
import { getReservations } from "../api/axios";
import { formatCurrency } from "../utils/currency";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import { APP_CONSTANTS } from "../utils/constants";
import { isAdmin } from "../utils/auth";

const SearchModal = ({
  open,
  onClose,
  selectedSalon,
  setSelectedSalon,
  salons,
  onReservationClick,
}) => {
  const { user } = useSelector((state) => state.auth);
  const isUserAdmin = isAdmin(user);
  
  // Permissions objesi
  const permissions = useMemo(() => {
    return isUserAdmin
      ? {
          allowAddReservation: true,
          allowEditReservation: true,
          allowGetPayment: true,
          allowKasa: true,
        }
      : {
          allowAddReservation: user?.permissions?.allowAddReservation || user?.allowAddReservation || false,
          allowEditReservation: user?.permissions?.allowEditReservation || user?.allowEditReservation || false,
          allowGetPayment: user?.permissions?.allowGetPayment || user?.allowGetPayment || false,
          allowKasa: user?.permissions?.allowKasa || user?.allowKasa || false,
        };
  }, [isUserAdmin, user]);

  // Fiyat bilgilerini görme yetkisi kontrolü
  const canViewPriceInfo = useMemo(() => {
    return (
      (permissions.allowAddReservation && permissions.allowEditReservation) ||
      permissions.allowGetPayment ||
      permissions.allowKasa
    );
  }, [permissions]);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchSalon, setSearchSalon] = useState(selectedSalon || "");

  // Body scroll'unu engelle
  useBodyScrollLock(open);

  // ESC tuşu ile modalı kapat
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && open) {
        onClose?.();
      }
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [open, onClose]);

  // Tüm etkinlik türlerini (normal + kültür) bir obje olarak oluştur
  const EVENT_TYPE_LABELS = useMemo(() => {
    const labels = {};
    // Normal salonlar için etkinlik türleri
    const normalEventTypes = APP_CONSTANTS.EVENT_TYPES || [];
    normalEventTypes.forEach((type) => {
      labels[type.value] = type.label;
    });
    // Kültür salonları için etkinlik türleri
    const cultureEventTypes = APP_CONSTANTS.CULTURE_EVENT_TYPES || [];
    cultureEventTypes.forEach((type) => {
      labels[type.value] = type.label;
    });
    return labels;
  }, []);

  // CamelCase veya birleşik yazılmış kelimeleri düzgün formata çevir
  const formatEventType = useCallback((eventType) => {
    if (!eventType) return "";
    
    // CamelCase'i kelimelere ayır (büyük harflerden önce boşluk ekle)
    const formatted = eventType
      .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase split
      .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2") // consecutive capitals
      .split(" ")
      .map((word) => {
        // Her kelimenin ilk harfini büyük yap
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(" ");
    
    return formatted;
  }, []);

  // Etkinlik türü label'ını al
  const getEventTypeLabel = useCallback((reservation) => {
    // "other" etkinlik türü için özel kontrol
    if (
      (reservation.eventType === "other" || reservation.eventType === "otherEvent") &&
      (reservation.otherEvent || reservation.otherEventTitle)
    ) {
      return reservation.otherEvent || reservation.otherEventTitle;
    }
    // EVENT_TYPE_LABELS'de varsa onu kullan
    if (EVENT_TYPE_LABELS[reservation.eventType]) {
      return EVENT_TYPE_LABELS[reservation.eventType];
    }
    // Yoksa eventType'ı formatla (camelCase'i kelimelere ayır)
    if (reservation.eventType) {
      return formatEventType(reservation.eventType);
    }
    return reservation.eventType || "";
  }, [EVENT_TYPE_LABELS, formatEventType]);

  // selectedSalon değiştiğinde searchSalon'u güncelle
  useEffect(() => {
    setSearchSalon(selectedSalon || "");
  }, [selectedSalon]);

  // Arama yapılacak salon adını bul
  const searchSalonName = useMemo(() => {
    if (!searchSalon || !salons || salons.length === 0) return "Salon Seçin";
    const salon = salons.find((s) => s.id === searchSalon);
    return salon ? salon.name : "Salon";
  }, [searchSalon, salons]);

  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim() || !searchSalon) return;

    try {
      setLoading(true);
      setHasSearched(true);
      const res = await getReservations({ salonID: searchSalon });
      const allReservations = res.data?.reservations || res.data || [];

      const searchLower = searchTerm.toLocaleLowerCase("tr-TR");
      const filtered = allReservations.filter(
        (reservation) =>
          reservation.customerName
            ?.toLocaleLowerCase("tr-TR")
            .includes(searchLower) ||
          reservation.customerPhone
            ?.toLocaleLowerCase("tr-TR")
            .includes(searchLower) ||
          reservation.customerEmail
            ?.toLocaleLowerCase("tr-TR")
            .includes(searchLower) ||
          reservation.reservationNumber
            ?.toLocaleLowerCase("tr-TR")
            .includes(searchLower) ||
          reservation.secondaryPhone
            ?.toLocaleLowerCase("tr-TR")
            .includes(searchLower) ||
          reservation.orgName
            ?.toLocaleLowerCase("tr-TR")
            .includes(searchLower) ||
          reservation.orgOwnerName
            ?.toLocaleLowerCase("tr-TR")
            .includes(searchLower) ||
          reservation.groomName
            ?.toLocaleLowerCase("tr-TR")
            .includes(searchLower) ||
          reservation.brideName
            ?.toLocaleLowerCase("tr-TR")
            .includes(searchLower) ||
          reservation.groomFatherName
            ?.toLocaleLowerCase("tr-TR")
            .includes(searchLower) ||
          reservation.groomMotherName
            ?.toLocaleLowerCase("tr-TR")
            .includes(searchLower) ||
          reservation.brideFatherName
            ?.toLocaleLowerCase("tr-TR")
            .includes(searchLower) ||
          reservation.brideMotherName
            ?.toLocaleLowerCase("tr-TR")
            .includes(searchLower)
      );

      setSearchResults(filtered);
    } catch {
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, searchSalon]);

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setHasSearched(false);
  };

  const handleReservationClick = (reservation) => {
    setSelectedSalon(reservation.salon.id);
    onReservationClick(reservation, searchSalon);
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="card w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
              Rezervasyon Arama
            </h2>
            <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">
              Arama yapılacak salonu seçin
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
            aria-label="Modalı kapat"
          >
            <LuX className="w-6 h-6" />
          </button>
        </div>

        {/* Arama Kutusu */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="input pl-12 text-lg"
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="h-6 w-6 text-gray-400 dark:text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  <svg
                    className="h-6 w-6 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              disabled={!searchTerm.trim() || !searchSalon || loading}
              className="px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors font-medium min-w-[140px]"
            >
              {loading ? "Aranıyor..." : searchSalon ? `Ara` : "Ara"}
            </button>
          </div>

          {!searchSalon && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              Lütfen arama yapmak için bir salon seçin.
            </p>
          )}
        </div>

        {/* Sonuçlar */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <LoadingSpinner message="Aranıyor..." size={28} />
          ) : hasSearched ? (
            searchResults.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100">
                    Arama Sonuçları
                  </h3>
                  <span className="text-sm text-gray-600 dark:text-slate-300">
                    {searchResults.length} sonuç bulundu
                  </span>
                </div>

                <div className="grid gap-4">
                  {searchResults.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                      onClick={() => handleReservationClick(reservation)}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                            <h4 className="font-semibold text-gray-900 dark:text-slate-100 text-lg break-words">
                              {reservation.customerName}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              <span
                                className={`px-3 py-1 text-sm rounded-full font-medium whitespace-nowrap ${
                                  reservation.status === "preliminary"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200"
                                    : reservation.status === "completed"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200"
                                    : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"
                                }`}
                              >
                                {reservation.status === "preliminary"
                                  ? "Ön Rezervasyon"
                                  : reservation.status === "completed"
                                  ? "Tamamlandı"
                                  : "İptal Edildi"}
                              </span>

                              <span className="px-3 py-1 text-sm rounded-full font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 whitespace-nowrap">
                                {reservation.salon.name}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-slate-300">
                            <div className="break-words">
                              <span className="font-medium">Telefon:</span>{" "}
                              <span className="text-blue-600 dark:text-blue-400">
                                {reservation.customerPhone}
                              </span>
                            </div>
                            <div className="break-words">
                              {reservation.salon?.type === "kultur" ? (
                                <>
                                  <span className="font-medium">
                                    Organizasyon Sahibi Telefon Numarası:
                                  </span>{" "}
                                  <span className="text-blue-600 dark:text-blue-400">
                                    {reservation.secondaryPhone || "Yok"}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="font-medium">
                                    İkinci Telefon:
                                  </span>{" "}
                                  <span className="text-blue-600 dark:text-blue-400">
                                    {reservation.secondaryPhone || "Yok"}
                                  </span>
                                </>
                              )}
                            </div>
                            {reservation.salon?.type === "kultur" && (
                              <>
                                {reservation.orgName && (
                                  <div className="break-words">
                                    <span className="font-medium">
                                      Organizasyon İsmi:
                                    </span>{" "}
                                    {reservation.orgName}
                                  </div>
                                )}
                                {reservation.orgOwnerName && (
                                  <div className="break-words">
                                    <span className="font-medium">
                                      Organizasyon Sahibi:
                                    </span>{" "}
                                    {reservation.orgOwnerName}
                                  </div>
                                )}
                              </>
                            )}
                            {reservation.salon?.type === "kultur" && (
                              <div className="break-words">
                                <span className="font-medium">Sözleşme:</span>{" "}
                                <span
                                  className={`px-2 py-1 text-xs rounded-full font-medium ${
                                    reservation.isContractSigned
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200"
                                      : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"
                                  }`}
                                >
                                  {reservation.isContractSigned
                                    ? "İmzalandı"
                                    : "İmzalanmadı"}
                                </span>
                              </div>
                            )}
                            <div className="break-words">
                              <span className="font-medium">
                                Rezervasyon No:
                              </span>{" "}
                              <span className="font-mono text-purple-600 dark:text-purple-400">
                                {reservation.reservationNumber}
                              </span>
                            </div>
                            <div className="break-words">
                              <span className="font-medium">Email:</span>{" "}
                              <span className="text-green-600 dark:text-green-400">
                                {reservation.customerEmail || "Belirtilmemiş"}
                              </span>
                            </div>
                            <div className="break-words">
                              <span className="font-medium">Etkinlik:</span>{" "}
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 rounded text-xs">
                                {getEventTypeLabel(reservation)}
                              </span>
                            </div>
                            <div className="break-words">
                              <span className="font-medium">Salon:</span>{" "}
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-xs">
                                {reservation.salon?.name || "Belirtilmemiş"}
                              </span>
                            </div>
                            <div className="break-words sm:col-span-2">
                              <span className="font-medium">Tarih:</span>{" "}
                              <span className="text-orange-600 dark:text-orange-400">
                                {new Date(
                                  reservation.startDate
                                ).toLocaleDateString("tr-TR")}
                              </span>
                            </div>
                          </div>

                          {reservation.notes && (
                            <div className="mt-2">
                              <span className="font-medium text-sm text-gray-600 dark:text-slate-300">
                                Notlar:
                              </span>
                              <p className="text-sm text-gray-500 dark:text-slate-300 mt-1">
                                {reservation.notes}
                              </p>
                            </div>
                          )}
                        </div>

                        {canViewPriceInfo && (
                          <div className="lg:text-right lg:ml-4">
                            <div className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
                              {formatCurrency(reservation.totalPrice)}
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 text-sm">
                              <div className="text-green-600 dark:text-green-400">
                                <span className="font-medium">Ödenen:</span>{" "}
                                {formatCurrency(reservation.paidAmount)}
                              </div>
                              <div className="text-orange-600 dark:text-orange-400">
                                <span className="font-medium">Kalan:</span>{" "}
                                {formatCurrency(reservation.remainingAmount)}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-slate-100">
                  Sonuç bulunamadı
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-300">
                  "{searchTerm}" için herhangi bir rezervasyon bulunamadı.
                </p>
              </div>
            )
          ) : (
            <div className="text-center py-8">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-slate-100">
                Rezervasyon Arama
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-300">
                Müşteri bilgileri, telefon, email, rezervasyon numarası ile
                arama yapabilirsiniz.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

SearchModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedSalon: PropTypes.string,
  salons: PropTypes.array,
  onReservationClick: PropTypes.func.isRequired,
};

export default SearchModal;
