import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getUserById,
  sendEmailToUser,
  getUserApplications,
  getUserJobRecommendations,
  adminUpdateUser,
  adminAddWorkExperience,
  adminDeleteWorkExperience,
  adminAddEducation,
  adminDeleteEducation,
  adminAddLanguage,
  adminDeleteLanguage,
  adminAddDrivingLicense,
  adminDeleteDrivingLicense,
  adminAddProfession,
  adminDeleteProfession,
  adminAddSector,
  adminDeleteSector,
  adminUploadProfilePicture,
  adminDeleteProfilePicture,
  adminDownloadCvPdf,
} from "../api/userService";
import {
  getNationalities,
  getCities,
  getDistrictsByCity,
  getNeighbourhoodsByDistrict,
  getWorkingMethods,
  getSectors,
  getLanguages,
  getDrivingLicenseTypes,
  getEducationTypes,
  searchProfessions,
  getUniversities,
  getFacultiesByUniversity,
  getDepartmentsByFaculty,
  getSchoolsByCity,
} from "../api/lookupService";
import MainLayout from "../components/layout/MainLayout";
import { showError, showSuccess, showWarning } from "../utils/swal";
import Swal from "sweetalert2";
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  UserIcon,
  BriefcaseIcon,
  MapPinIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  StarIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  PhotoIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsPagination, setApplicationsPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [applicationStatusFilter, setApplicationStatusFilter] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [cvLoading, setCvLoading] = useState(false);
  const [showCriminalRecordModal, setShowCriminalRecordModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchUserDetail();
      fetchUserApplications();
    }
  }, [id, applicationsPagination.page, applicationStatusFilter]);

  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      const response = await getUserById(id);
      if (response.success) {
        setUser(response.data);
      }
    } catch (error) {
      console.error("Error fetching user detail:", error);
      showError("Hata", "Kullanıcı detayları yüklenemedi.");
      navigate("/dashboard/users");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserApplications = async () => {
    try {
      setApplicationsLoading(true);
      const response = await getUserApplications(id, {
        page: applicationsPagination.page,
        limit: applicationsPagination.limit,
        status: applicationStatusFilter,
      });
      if (response.success) {
        setApplications(response.data.applications);
        setApplicationsPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching user applications:", error);
    } finally {
      setApplicationsLoading(false);
    }
  };

  const fetchJobRecommendations = async () => {
    try {
      setRecommendationsLoading(true);
      const response = await getUserJobRecommendations(id, {
        limit: 10,
        minScore: 1,
      });
      if (response.success) {
        setRecommendations(response.data.recommendations || []);
      }
    } catch (error) {
      console.error("Error fetching job recommendations:", error);
      showError("Hata", "Önerilen işler yüklenemedi.");
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const handleViewCv = async () => {
    setCvLoading(true);
    try {
      const blob = await adminDownloadCvPdf(id);
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("CV indirme hatası:", error);
      showError("Hata", "CV oluşturulamadı.");
    } finally {
      setCvLoading(false);
    }
  };

  const handleSendEmail = async (emailData) => {
    try {
      setActionLoading(true);
      await sendEmailToUser(id, emailData);
      showSuccess("Başarılı", "E-posta başarıyla gönderildi.");
      setShowEmailModal(false);
    } catch (error) {
      console.error("Error sending email:", error);
      showError("Hata", "E-posta gönderilirken bir hata oluştu.");
    } finally {
      setActionLoading(false);
    }
  };

  const getApplicationStatusBadge = (application) => {
    if (application.isEmployed) {
      return (
        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-400 rounded-full text-xs font-semibold">
          İşe Alındı
        </span>
      );
    } else if (application.isAccepted) {
      return (
        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-400 rounded-full text-xs font-semibold">
          Kabul Edildi
        </span>
      );
    } else if (application.isRejected) {
      return (
        <span className="px-3 py-1 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-400 rounded-full text-xs font-semibold">
          Reddedildi
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-400 rounded-full text-xs font-semibold">
          Beklemede
        </span>
      );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Yükleniyor...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Kullanıcı bulunamadı.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 max-w-full overflow-x-hidden">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg transition-colors flex-shrink-0 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={`${user.name} ${user.surname}`}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                )}
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                    {user.name} {user.surname}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-row flex-wrap gap-2 flex-shrink-0">
              <button
                onClick={() => setShowEditModal(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <PencilSquareIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                Düzenle
              </button>
              <button
                onClick={() => setShowEmailModal(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm"
              >
                <EnvelopeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                E-posta
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === "profile"
                  ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
              >
                Profil Bilgileri
              </button>
              <button
                onClick={() => setActiveTab("applications")}
                className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === "applications"
                  ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
              >
                Başvurulan İlanlar
              </button>
              <button
                onClick={async () => {
                  setActiveTab("recommendations");
                  if (recommendations.length === 0 && !recommendationsLoading) {
                    await fetchJobRecommendations();
                  }
                }}
                className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === "recommendations"
                  ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <StarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  Önerilen İşler
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6 min-w-0 overflow-x-hidden">
            {activeTab === "profile" && (
              <div className="min-w-0">
                {/* User Details */}
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-6 break-words">
                  Kullanıcı Bilgileri
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">TC Kimlik No</p>
                    <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white break-words">
                      {user.tc || "-"}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">E-posta</p>
                    <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white break-all">
                      {user.email || "-"}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Telefon</p>
                    <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white break-words">
                      {user.phoneNumber || "-"}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">İkinci Telefon</p>
                    <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white break-words">
                      {user.secondaryPhone || "-"}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Cinsiyet</p>
                    <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white break-words">
                      {user.gender === "male"
                        ? "Erkek"
                        : user.gender === "female"
                          ? "Kadın"
                          : "-"}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Doğum Tarihi</p>
                    <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white break-words">
                      {formatDate(user.birthday)}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Uyruk</p>
                    <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white break-words">
                      {user.nationality?.name || "-"}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Onay Durumu</p>
                    {user.isApproved === true ? (
                      <span className="px-4 py-1.5 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-400 rounded-full text-sm font-semibold">
                        Onaylandı
                      </span>
                    ) : user.isApproved === false ? (
                      <span className="px-4 py-1.5 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-400 rounded-full text-sm font-semibold">
                        Beklemede
                      </span>
                    ) : (
                      <span className="px-4 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-full text-sm font-semibold">
                        Bilinmiyor
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Çalışma Durumu</p>
                    <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white break-words">
                      {user.workingStatus === true
                        ? "Çalışıyor"
                        : user.workingStatus === false
                          ? "Çalışmıyor"
                          : "-"}
                    </p>
                  </div>
                  {user.gender !== "female" && (
                    <div className="min-w-0">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Askerlik Durumu
                      </p>
                      <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white break-words">
                        {user.militaryStatus === true
                          ? "Yapıldı"
                          : user.militaryStatus === false
                            ? "Yapılmadı"
                            : "-"}
                      </p>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Emeklilik Durumu
                    </p>
                    <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white break-words">
                      {user.retirementStatus === true
                        ? "Emekli"
                        : user.retirementStatus === false
                          ? "Emekli Değil"
                          : "-"}
                    </p>
                  </div>
                  <div className="min-w-0 md:col-span-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Adres</p>
                    <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white break-words">
                      {user.addressText || "-"}
                      {user.neighbourhood && (
                        <span className="text-sm text-gray-500 dark:text-gray-400 break-words">
                          {" "}
                          {user.neighbourhood.name},{" "}
                          {user.neighbourhood.district?.title},{" "}
                          {user.neighbourhood.district?.city?.title}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Kayıt Tarihi</p>
                    <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white break-words">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                  {user.description && (
                    <div className="min-w-0 md:col-span-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Açıklama</p>
                      <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white break-words whitespace-pre-wrap">
                        {user.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Professions */}
                {user.professions && user.professions.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Meslekler
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {user.professions.map((prof) => (
                        <span
                          key={prof.id}
                          className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-semibold"
                        >
                          {prof.profession.profession} (Seviye: {prof.level})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Work Experiences */}
                {user.workExperiences && user.workExperiences.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      İş Deneyimleri
                    </h3>
                    <div className="space-y-3">
                      {user.workExperiences.map((exp) => (
                        <div
                          key={exp.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {exp.companyName}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {exp.profession?.profession}
                              </p>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap flex-shrink-0">
                              {formatDate(exp.startDate)} -{" "}
                              {exp.isContinuing
                                ? "Devam Ediyor"
                                : formatDate(exp.endDate)}
                            </span>
                          </div>
                          {exp.description && (
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Educations */}
                {user.educations && user.educations.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Eğitim
                    </h3>
                    <div className="space-y-3">
                      {user.educations.map((edu) => (
                        <div
                          key={edu.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {edu.department?.name || edu.school?.name || "-"}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {edu.department?.faculity?.university?.name ||
                                  edu.school?.city?.title ||
                                  ""}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {edu.educationType?.type}
                              </p>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap flex-shrink-0">
                              {formatDate(edu.startYear)} -{" "}
                              {edu.continueStatus
                                ? "Devam Ediyor"
                                : formatDate(edu.endYear)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Languages */}
                {user.languages && user.languages.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Diller
                    </h3>
                    <div className="space-y-2">
                      {user.languages.map((lang) => (
                        <div
                          key={lang.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                        >
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {lang.language.name}
                          </span>
                          <div className="flex flex-wrap gap-2 sm:gap-4 text-xs text-gray-600 dark:text-gray-400">
                            <span>Okuma: {lang.readingLevel}</span>
                            <span>Yazma: {lang.writingLevel}</span>
                            <span>Dinleme: {lang.listeningLevel}</span>
                            <span>Konuşma: {lang.speakingLevel}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Driving Licenses */}
                {user.drivingLisences && user.drivingLisences.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Ehliyetler
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {user.drivingLisences.map((license) => (
                        <span
                          key={license.id}
                          className="px-4 py-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-semibold"
                        >
                          {license.drivingLisenceType.title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sectors */}
                {user.sectors && user.sectors.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Sektörler
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {user.sectors.map((sector) => (
                        <span
                          key={sector.id}
                          className="px-4 py-2 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg text-sm font-semibold"
                        >
                          {sector.sector.sector}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Belgeler */}
                <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Belgeler
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleViewCv}
                      disabled={cvLoading}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                      <DocumentArrowDownIcon className="w-5 h-5" />
                      {cvLoading
                        ? "CV Oluşturuluyor..."
                        : "CV Görüntüle / İndir"}
                    </button>

                    {user.criminalRecordFile && (
                      <button
                        onClick={() => setShowCriminalRecordModal(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold transition-colors"
                      >
                        <DocumentTextIcon className="w-5 h-5" />
                        Sabıka Kaydı Belgesini Görüntüle
                      </button>
                    )}

                    <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Sabıka Kaydı:</span>
                      {user.isCriminalRecorded === true ? (
                        <span className="font-semibold text-red-600 dark:text-red-400">Var</span>
                      ) : user.isCriminalRecorded === false ? (
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          Yok
                        </span>
                      ) : (
                        <span className="font-semibold text-gray-500 dark:text-gray-400">
                          Belirtilmemiş
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sabıka Kaydı Modal */}
                {showCriminalRecordModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-5xl flex flex-col"
                      style={{ maxHeight: "90vh" }}
                    >
                      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                          Sabıka Kaydı Belgesi
                        </h2>
                        <button
                          onClick={() => setShowCriminalRecordModal(false)}
                          className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex-1 overflow-hidden p-4">
                        <iframe
                          src={user.criminalRecordFile}
                          className="w-full h-full border-0 rounded-lg"
                          style={{ minHeight: "70vh" }}
                          title="Sabıka Kaydı PDF"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "applications" && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Başvurduğu İlanlar
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setApplicationStatusFilter(null);
                        setApplicationsPagination({
                          ...applicationsPagination,
                          page: 1,
                        });
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${applicationStatusFilter === null
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                    >
                      Tümü
                    </button>
                    <button
                      onClick={() => {
                        setApplicationStatusFilter("pending");
                        setApplicationsPagination({
                          ...applicationsPagination,
                          page: 1,
                        });
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${applicationStatusFilter === "pending"
                        ? "bg-yellow-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                    >
                      Bekleyenler
                    </button>
                    <button
                      onClick={() => {
                        setApplicationStatusFilter("accepted");
                        setApplicationsPagination({
                          ...applicationsPagination,
                          page: 1,
                        });
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${applicationStatusFilter === "accepted"
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                    >
                      Kabul Edilenler
                    </button>
                    <button
                      onClick={() => {
                        setApplicationStatusFilter("rejected");
                        setApplicationsPagination({
                          ...applicationsPagination,
                          page: 1,
                        });
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${applicationStatusFilter === "rejected"
                        ? "bg-red-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                    >
                      Reddedilenler
                    </button>
                    <button
                      onClick={() => {
                        setApplicationStatusFilter("employed");
                        setApplicationsPagination({
                          ...applicationsPagination,
                          page: 1,
                        });
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${applicationStatusFilter === "employed"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                    >
                      İşe Alınanlar
                    </button>
                  </div>
                </div>

                {applicationsLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Yükleniyor...</p>
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Başvuru bulunamadı.
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {applications.map((application) => (
                        <div
                          key={application.id}
                          onClick={() =>
                            navigate(
                              `/dashboard/job-posts/${application.jobPostId}`,
                            )
                          }
                          className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all cursor-pointer"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <BriefcaseIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                  {application.jobPost.postTitle}
                                </h3>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                                {application.jobPost.business && (
                                  <div className="flex items-center gap-1 sm:gap-2">
                                    <BuildingOfficeIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                      {
                                        application.jobPost.business
                                          .businessName
                                      }
                                    </span>
                                  </div>
                                )}
                                {application.jobPost.professions && (
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {application.jobPost.professions.profession}
                                  </span>
                                )}
                                {application.jobPost.workingMethod && (
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {application.jobPost.workingMethod.title}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-row sm:flex-col sm:items-end gap-2 flex-shrink-0">
                              {getApplicationStatusBadge(application)}
                              <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                {formatDate(application.createdAt)}
                              </span>
                            </div>
                          </div>

                          {application.jobPost.districts &&
                            application.jobPost.districts.length > 0 && (
                              <div className="flex items-center gap-2 mb-3">
                                <MapPinIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {application.jobPost.districts
                                    .map((d) => d.district.title)
                                    .join(", ")}
                                  {application.jobPost.districts[0]?.district
                                    .city && (
                                      <span className="text-gray-500 dark:text-gray-400">
                                        {" "}
                                        •{" "}
                                        {
                                          application.jobPost.districts[0]
                                            .district.city.title
                                        }
                                      </span>
                                    )}
                                </span>
                              </div>
                            )}

                          {application.coverLetter && (
                            <div className="mb-3">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Ön Yazı
                              </p>
                              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                                {application.coverLetter}
                              </p>
                            </div>
                          )}

                          {application.jobPost.applicationUntilDate && (
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Başvuru Tarihi:{" "}
                                {formatDate(
                                  application.jobPost.applicationUntilDate,
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {applicationsPagination.totalPages > 1 && (
                      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          Toplam{" "}
                          <span className="font-medium">
                            {applicationsPagination.total}
                          </span>{" "}
                          başvuru
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              setApplicationsPagination({
                                ...applicationsPagination,
                                page: applicationsPagination.page - 1,
                              })
                            }
                            disabled={applicationsPagination.page === 1}
                            className="px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900/50 dark:hover:bg-gray-700 dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Önceki
                          </button>
                          <span className="px-3 sm:px-4 py-2 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            {applicationsPagination.page} /{" "}
                            {applicationsPagination.totalPages}
                          </span>
                          <button
                            onClick={() =>
                              setApplicationsPagination({
                                ...applicationsPagination,
                                page: applicationsPagination.page + 1,
                              })
                            }
                            disabled={
                              applicationsPagination.page >=
                              applicationsPagination.totalPages
                            }
                            className="px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900/50 dark:hover:bg-gray-700 dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Sonraki
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === "recommendations" && (
              <div>
                {recommendationsLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Yükleniyor...</p>
                  </div>
                ) : recommendations.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <StarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p>Henüz önerilen iş bulunmamaktadır.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recommendations
                      .sort((a, b) => b.score - a.score)
                      .map((recommendation, index) => (
                        <div
                          key={recommendation.jobPostId}
                          onClick={() =>
                            navigate(
                              `/dashboard/job-posts/${recommendation.jobPostId}`,
                            )
                          }
                          className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-400 rounded-full text-xs font-semibold">
                                  #{index + 1}
                                </span>
                                <BriefcaseIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                  {recommendation.title}
                                </h3>
                              </div>
                              <div className="flex items-center gap-4 flex-wrap">
                                {recommendation.businessName && (
                                  <div className="flex items-center gap-2">
                                    <BuildingOfficeIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                      {recommendation.businessName}
                                    </span>
                                  </div>
                                )}
                                {recommendation.workingMethod && (
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {recommendation.workingMethod}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {recommendation.score.toFixed(1)}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Puan</div>
                            </div>
                          </div>

                          {recommendation.description && (
                            <div className="mb-4">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Açıklama
                              </p>
                              <div
                                className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 rich-html-content"
                                dangerouslySetInnerHTML={{
                                  __html: recommendation.description,
                                }}
                              />
                            </div>
                          )}

                          {recommendation.breakdown && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  Yaş Uyumu
                                </p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {recommendation.breakdown.ageMatched
                                    ? "✓ Uygun"
                                    : "✗ Uygun Değil"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  Eğitim Uyumu
                                </p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {recommendation.breakdown.educationMatched
                                    ? "✓ Uygun"
                                    : "✗ Uygun Değil"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  Meslek Uyumu
                                </p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {recommendation.breakdown.professionMatched
                                    ? "✓ Uygun"
                                    : "✗ Uygun Değil"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  Konum Uyumu
                                </p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {recommendation.breakdown.locationMatched
                                    ? "✓ Uygun"
                                    : "✗ Uygun Değil"}
                                </p>
                                {recommendation.breakdown.locationMatchType && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    (
                                    {recommendation.breakdown
                                      .locationMatchType === "city"
                                      ? "Şehir"
                                      : "İlçe"}
                                    )
                                  </p>
                                )}
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  Deneyim
                                </p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {recommendation.breakdown.experienceYears?.toFixed(
                                    1,
                                  ) || 0}{" "}
                                  yıl
                                </p>
                              </div>
                              {recommendation.breakdown.disabilityMatched !==
                                undefined && (
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                      Engellilik Uyumu
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                      {recommendation.breakdown.disabilityMatched
                                        ? "✓ Uygun"
                                        : "✗ Uygun Değil"}
                                    </p>
                                  </div>
                                )}
                              {recommendation.breakdown.drivingMatchedCount !==
                                undefined && (
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                      Ehliyet Uyumu
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                      {
                                        recommendation.breakdown
                                          .drivingMatchedCount
                                      }
                                      /
                                      {
                                        recommendation.breakdown
                                          .requiredDrivingCount
                                      }
                                    </p>
                                  </div>
                                )}
                              {recommendation.breakdown.languageMatchedCount !==
                                undefined && (
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                      Dil Uyumu
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                      {
                                        recommendation.breakdown
                                          .languageMatchedCount
                                      }
                                      /
                                      {
                                        recommendation.breakdown
                                          .requiredLanguageCount
                                      }
                                    </p>
                                  </div>
                                )}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <SendEmailModal
          user={user}
          onClose={() => setShowEmailModal(false)}
          onSend={handleSendEmail}
          actionLoading={actionLoading}
        />
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <EditUserModal
          user={user}
          userId={id}
          onClose={() => setShowEditModal(false)}
          onRefresh={fetchUserDetail}
        />
      )}
    </MainLayout>
  );
};

// Send Email Modal
const SendEmailModal = ({ user, onClose, onSend, actionLoading }) => {
  const [formData, setFormData] = useState({
    subject: "",
    body: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.body.trim()) {
      showWarning("Uyarı", "Lütfen konu ve mesaj alanlarını doldurun.");
      return;
    }
    onSend(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">E-posta Gönder</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <svg
                className="w-6 h-6"
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
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Alıcı</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {user.name} {user.surname} ({user.email})
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Konu *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400"
              required
              placeholder="E-posta konusu"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mesaj *
            </label>
            <textarea
              value={formData.body}
              onChange={(e) =>
                setFormData({ ...formData, body: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400"
              rows="8"
              required
              placeholder="E-posta mesajı"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-white hover:bg-gray-50 dark:bg-gray-900/50 dark:hover:bg-gray-700 dark:bg-gray-700"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
            >
              {actionLoading ? "Gönderiliyor..." : "Gönder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit User Modal
const EditUserModal = ({ user, userId, onClose, onRefresh }) => {
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");

  // Basic profile form
  const [formData, setFormData] = useState({
    name: user.name || "",
    surname: user.surname || "",
    tc: user.tc || "",
    phoneNumber: user.phoneNumber || "",
    email: user.email || "",
    gender: user.gender || "",
    birthday: user.birthday ? user.birthday.split("T")[0] : "",
    secondaryPhone: user.secondaryPhone || "",
    description: user.description || "",
    nationalityId: user.nationalityId || "",
    workingStatus: user.workingStatus ?? "",
    militaryStatus: user.militaryStatus ?? "",
    retirementStatus: user.retirementStatus ?? "",
    smokingStatus: user.smokingStatus ?? "",
    isDisabledPerson: user.isDisabledPerson ?? "",
    isMarried: user.isMarried ?? "",
    isCriminalRecorded: user.isCriminalRecorded ?? "",
    addressText: user.addressText || "",
    addressNeighbourhoodId: user.addressNeighbourhoodId || "",
    isApproved: user.isApproved ?? "",
    isPhoneApproved: user.isPhoneApproved ?? "",
    isEmailApproved: user.isEmailApproved ?? "",
    isBanned: user.isBanned ?? "",
  });
  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: "",
  });

  // Lookups
  const [nationalities, setNationalities] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [neighbourhoods, setNeighbourhoods] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [workingMethodsList, setWorkingMethodsList] = useState([]);
  const [sectorsList, setSectorsList] = useState([]);
  const [languagesList, setLanguagesList] = useState([]);
  const [drivingLicenseTypesList, setDrivingLicenseTypesList] = useState([]);
  const [educationTypesList, setEducationTypesList] = useState([]);

  // Sub-entity local lists (mirrors user data, updated after add/delete)
  const [workExperiences, setWorkExperiences] = useState(
    user.workExperiences || [],
  );
  const [educations, setEducations] = useState(user.educations || []);
  const [languages, setLanguages] = useState(user.languages || []);
  const [drivingLicenses, setDrivingLicenses] = useState(
    user.drivingLisences || [],
  );
  const [professions, setProfessions] = useState(user.professions || []);
  const [sectors, setSectors] = useState(user.sectors || []);

  // Add-form toggles
  const [showAddWorkExp, setShowAddWorkExp] = useState(false);
  const [showAddEducation, setShowAddEducation] = useState(false);
  const [showAddLanguage, setShowAddLanguage] = useState(false);
  const [showAddDrivingLicense, setShowAddDrivingLicense] = useState(false);
  const [showAddProfession, setShowAddProfession] = useState(false);
  const [showAddSector, setShowAddSector] = useState(false);

  const [profilePicture, setProfilePicture] = useState(
    user.profilePicture || null,
  );
  const [uploadingPicture, setUploadingPicture] = useState(false);

  // Add-form data
  const [newWorkExp, setNewWorkExp] = useState({
    companyName: "",
    professionId: "",
    workingMethodId: "",
    startDate: "",
    endDate: "",
    isContinuing: false,
    description: "",
  });
  const [newEducation, setNewEducation] = useState({
    educationTypeId: "",
    schoolId: "",
    departmentId: "",
    startYear: "",
    endYear: "",
    continueStatus: false,
  });
  const [eduUniversities, setEduUniversities] = useState([]);
  const [eduFaculties, setEduFaculties] = useState([]);
  const [eduDepartments, setEduDepartments] = useState([]);
  const [eduSchools, setEduSchools] = useState([]);
  const [eduSelectedUniversityId, setEduSelectedUniversityId] = useState("");
  const [eduSelectedFacultyId, setEduSelectedFacultyId] = useState("");
  const [eduSelectedCityId, setEduSelectedCityId] = useState("");
  const [newLanguage, setNewLanguage] = useState({
    languageId: "",
    readingLevel: 1,
    writingLevel: 1,
    listeningLevel: 1,
    speakingLevel: 1,
  });
  const [newDrivingLicense, setNewDrivingLicense] = useState({
    drivingListenceTypeId: "",
  });
  const [newProfession, setNewProfession] = useState({
    professionId: "",
    level: 1,
  });
  const [newSector, setNewSector] = useState({ sectorId: "" });

  useEffect(() => {
    const loadLookups = async () => {
      try {
        const results = await Promise.all([
          getNationalities(),
          getCities(),
          getWorkingMethods(),
          getSectors(),
          getLanguages(),
          getDrivingLicenseTypes(),
          getEducationTypes(),
        ]);
        if (results[0].success) setNationalities(results[0].data || []);
        if (results[1].success) setCities(results[1].data || []);
        if (results[2].success) setWorkingMethodsList(results[2].data || []);
        if (results[3].success) setSectorsList(results[3].data || []);
        if (results[4].success) setLanguagesList(results[4].data || []);
        if (results[5].success)
          setDrivingLicenseTypesList(results[5].data || []);
        if (results[6].success) setEducationTypesList(results[6].data || []);
      } catch (e) {
        console.error("Error loading lookups:", e);
      }
    };
    loadLookups();
  }, []);

  // Initialize address cascading dropdowns from existing user data
  useEffect(() => {
    const initAddress = async () => {
      if (user.neighbourhood?.district) {
        const cityId =
          user.neighbourhood.district.cityId ||
          user.neighbourhood.district.city?.id;
        if (cityId) {
          setSelectedCityId(String(cityId));
          try {
            const dRes = await getDistrictsByCity(cityId);
            if (dRes.success) {
              setDistricts(dRes.data || []);
              const districtId =
                user.neighbourhood.districtId || user.neighbourhood.district.id;
              if (districtId) {
                setSelectedDistrictId(String(districtId));
                const nRes = await getNeighbourhoodsByDistrict(districtId);
                if (nRes.success) setNeighbourhoods(nRes.data || []);
              }
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
    };
    initAddress();
  }, [user]);

  const handleCityChange = async (cityId) => {
    setSelectedCityId(cityId);
    setSelectedDistrictId("");
    setNeighbourhoods([]);
    handleChange("addressNeighbourhoodId", "");
    if (!cityId) {
      setDistricts([]);
      return;
    }
    try {
      const res = await getDistrictsByCity(cityId);
      if (res.success) setDistricts(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDistrictChange = async (districtId) => {
    setSelectedDistrictId(districtId);
    handleChange("addressNeighbourhoodId", "");
    if (!districtId) {
      setNeighbourhoods([]);
      return;
    }
    try {
      const res = await getNeighbourhoodsByDistrict(districtId);
      if (res.success) setNeighbourhoods(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleChange = (field, value) =>
    setFormData((prev) => {
      if (field === "gender" && value === "female") {
        return { ...prev, gender: value, militaryStatus: "" };
      }
      return { ...prev, [field]: value };
    });

  const handleBooleanChange = (field, value) => {
    handleChange(field, value === "" ? "" : value === "true");
  };

  const handleProfileSave = async () => {
    const updateData = {};
    const booleanFields = [
      "workingStatus",
      "militaryStatus",
      "retirementStatus",
      "smokingStatus",
      "isDisabledPerson",
      "isMarried",
      "isCriminalRecorded",
      "isApproved",
      "isPhoneApproved",
      "isEmailApproved",
      "isBanned",
    ];
    const intFields = ["nationalityId", "addressNeighbourhoodId"];

    for (const [key, value] of Object.entries(formData)) {
      if (value === "" || value === null || value === undefined) continue;
      if (booleanFields.includes(key)) updateData[key] = value;
      else if (intFields.includes(key)) updateData[key] = parseInt(value, 10);
      else updateData[key] = value;
    }

    if (passwordData.password || passwordData.confirmPassword) {
      if (!passwordData.password || !passwordData.confirmPassword) {
        showWarning("Uyarı", "Yeni şifre ve şifre tekrarı zorunludur.");
        return;
      }

      if (passwordData.password !== passwordData.confirmPassword) {
        showWarning("Uyarı", "Şifre ve şifre tekrarı eşleşmiyor.");
        return;
      }

      if (passwordData.password.length < 6) {
        showWarning("Uyarı", "Şifre en az 6 karakter olmalıdır.");
        return;
      }

      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.password)) {
        showWarning(
          "Uyarı",
          "Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir.",
        );
        return;
      }

      updateData.password = passwordData.password;
    }

    if (Object.keys(updateData).length === 0) {
      showWarning("Uyarı", "En az bir alan doldurulmalıdır.");
      return;
    }

    try {
      setSaving(true);
      const response = await adminUpdateUser(userId, updateData);
      if (response.success) {
        showSuccess("Başarılı", "Profil bilgileri güncellendi.");
        setPasswordData({ password: "", confirmPassword: "" });
        onRefresh();
      }
    } catch (error) {
      console.error("Error updating user:", error);
      showError("Hata", "Profil güncellenirken bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  // Sub-entity helpers
  const confirmDelete = async (name, deleteFn) => {
    const result = await Swal.fire({
      title: "Emin misiniz?",
      text: `${name} silinecek.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Sil",
      cancelButtonText: "İptal",
    });
    if (!result.isConfirmed) return;
    try {
      setSaving(true);
      await deleteFn();
      onRefresh();
    } catch {
      showError("Hata", "Silme işlemi başarısız oldu.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddEntity = async (addFn, onSuccess, errorMsg) => {
    try {
      setSaving(true);
      const res = await addFn();
      if (res.success) {
        showSuccess("Başarılı", "Kayıt eklendi.");
        onSuccess(res.data);
        onRefresh();
      }
    } catch {
      showError("Hata", errorMsg || "Ekleme başarısız oldu.");
    } finally {
      setSaving(false);
    }
  };

  const handlePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingPicture(true);
      const res = await adminUploadProfilePicture(userId, file);
      if (res.success) {
        setProfilePicture(res.data.profilePicture);
        showSuccess("Başarılı", "Profil fotoğrafı yüklendi.");
        onRefresh();
      }
    } catch (error) {
      showError("Hata", error.message || "Profil fotoğrafı yüklenemedi.");
    } finally {
      setUploadingPicture(false);
      e.target.value = "";
    }
  };

  const handlePictureDelete = async () => {
    const result = await Swal.fire({
      title: "Emin misiniz?",
      text: "Profil fotoğrafı silinecek.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Sil",
      cancelButtonText: "İptal",
    });
    if (!result.isConfirmed) return;
    try {
      setUploadingPicture(true);
      await adminDeleteProfilePicture(userId);
      setProfilePicture(null);
      showSuccess("Başarılı", "Profil fotoğrafı silindi.");
      onRefresh();
    } catch {
      showError("Hata", "Profil fotoğrafı silinemedi.");
    } finally {
      setUploadingPicture(false);
    }
  };

  // Education cascading dropdown handlers
  const loadUniversities = async () => {
    if (eduUniversities.length > 0) return;
    try {
      const res = await getUniversities();
      if (res.success) setEduUniversities(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleEduUniversityChange = async (uniId) => {
    setEduSelectedUniversityId(uniId);
    setEduSelectedFacultyId("");
    setEduDepartments([]);
    setNewEducation((prev) => ({ ...prev, departmentId: "" }));
    if (!uniId) {
      setEduFaculties([]);
      return;
    }
    try {
      const res = await getFacultiesByUniversity(uniId);
      if (res.success) setEduFaculties(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleEduFacultyChange = async (facId) => {
    setEduSelectedFacultyId(facId);
    setNewEducation((prev) => ({ ...prev, departmentId: "" }));
    if (!facId) {
      setEduDepartments([]);
      return;
    }
    try {
      const res = await getDepartmentsByFaculty(facId);
      if (res.success) setEduDepartments(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleEduCityChange = async (cityId) => {
    setEduSelectedCityId(cityId);
    setNewEducation((prev) => ({ ...prev, schoolId: "" }));
    if (!cityId) {
      setEduSchools([]);
      return;
    }
    try {
      const res = await getSchoolsByCity(cityId);
      if (res.success) setEduSchools(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  // Searchable profession picker with fixed-position dropdown (avoids overflow clipping)
  const ProfessionSearchSelect = ({ value, onChange, label = "Meslek" }) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [open, setOpen] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState("");
    const [dropdownPos, setDropdownPos] = useState({
      top: 0,
      left: 0,
      width: 0,
    });
    const timerRef = useRef(null);
    const wrapperRef = useRef(null);
    const triggerRef = useRef(null);

    const doSearch = async (q) => {
      try {
        setSearching(true);
        const res = await searchProfessions(q);
        if (res.success) setResults(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setSearching(false);
      }
    };

    useEffect(() => {
      if (!open) return;
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => doSearch(query), 300);
      return () => clearTimeout(timerRef.current);
    }, [query, open]);

    useEffect(() => {
      if (open && results.length === 0 && !query) doSearch("");
    }, [open]);

    // Close on outside click
    useEffect(() => {
      const handleClick = (e) => {
        if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
          const dropdown = document.getElementById("profession-dropdown");
          if (dropdown && dropdown.contains(e.target)) return;
          setOpen(false);
        }
      };
      if (open) document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    const openDropdown = () => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setDropdownPos({
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width,
        });
      }
      setOpen(!open);
    };

    return (
      <div ref={wrapperRef}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
        <div
          ref={triggerRef}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 cursor-pointer flex items-center justify-between min-h-[38px]"
          onClick={openDropdown}
        >
          <span className={value ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}>
            {selectedLabel || (value ? `ID: ${value}` : "Meslek arayın...")}
          </span>
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
                setSelectedLabel("");
                setOpen(false);
              }}
              className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 ml-2"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
        {open && (
          <div
            id="profession-dropdown"
            className="fixed z-[9999] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl"
            style={{
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
              maxHeight: 320,
            }}
          >
            <div className="p-2 border-b border-gray-100 dark:border-gray-700">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Meslek ara..."
                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500"
                autoFocus
              />
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 270 }}>
              {searching ? (
                <div className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  Aranıyor...
                </div>
              ) : results.length === 0 ? (
                <div className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  Sonuç bulunamadı
                </div>
              ) : (
                results.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      onChange(String(p.id));
                      setSelectedLabel(p.profession);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/40 text-gray-900 dark:text-gray-100 ${String(p.id) === String(value) ? "bg-blue-100 dark:bg-blue-900/50 font-medium" : ""}`}
                  >
                    {p.profession}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
  const selectClass =
    "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white";

  const BooleanSelect = ({ label, field }) => (
    <div>
      <label className={labelClass}>{label}</label>
      <select
        value={String(formData[field])}
        onChange={(e) => handleBooleanChange(field, e.target.value)}
        className={selectClass}
      >
        <option value="">Belirtilmemiş</option>
        <option value="true">Evet</option>
        <option value="false">Hayır</option>
      </select>
    </div>
  );

  const SectionButton = ({ id, label }) => (
    <button
      type="button"
      onClick={() => setActiveSection(id)}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${activeSection === id
        ? "bg-blue-600 text-white"
        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
        }`}
    >
      {label}
    </button>
  );

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString("tr-TR") : "-");

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-5xl w-full max-h-[96vh] flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Kullanıcı Profilini Düzenle
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
            <SectionButton id="profile" label="Profil" />
            <SectionButton id="address" label="Adres" />
            <SectionButton id="admin" label="Admin" />
            <SectionButton id="professions" label="Meslekler" />
            <SectionButton id="sectors" label="Sektörler" />
            <SectionButton id="workExperiences" label="İş Deneyimleri" />
            <SectionButton id="educations" label="Eğitim" />
            <SectionButton id="languages" label="Diller" />
            <SectionButton id="drivingLicenses" label="Ehliyetler" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* ── Profile Section ── */}
          {activeSection === "profile" && (
            <div className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center gap-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt="Profil"
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                      <UserIcon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                  {uploadingPicture && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Profil Fotoğrafı
                  </p>
                  <div className="flex gap-2">
                    <label className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 cursor-pointer disabled:opacity-50">
                      <PhotoIcon className="w-4 h-4" />
                      {profilePicture ? "Değiştir" : "Yükle"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handlePictureUpload}
                        className="hidden dark:bg-gray-800 dark:text-white"
                        disabled={uploadingPicture}
                      />
                    </label>
                    {profilePicture && (
                      <button
                        type="button"
                        onClick={handlePictureDelete}
                        disabled={uploadingPicture}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg text-sm hover:bg-red-50 dark:hover:bg-red-900/40 disabled:opacity-50"
                      >
                        <TrashIcon className="w-4 h-4" />
                        Sil
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    JPEG, PNG, GIF, WebP - Maks. 5MB
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Kişisel Bilgiler
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Ad</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Soyad</label>
                    <input
                      type="text"
                      value={formData.surname}
                      onChange={(e) => handleChange("surname", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>TC Kimlik No</label>
                    <input
                      type="text"
                      value={formData.tc}
                      onChange={(e) => handleChange("tc", e.target.value)}
                      maxLength={11}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Telefon</label>
                    <input
                      type="text"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        handleChange("phoneNumber", e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>E-posta</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Cinsiyet</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleChange("gender", e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Belirtilmemiş</option>
                      <option value="male">Erkek</option>
                      <option value="female">Kadın</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Doğum Tarihi</label>
                    <input
                      type="date"
                      value={formData.birthday}
                      onChange={(e) => handleChange("birthday", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>İkinci Telefon</label>
                    <input
                      type="text"
                      value={formData.secondaryPhone}
                      onChange={(e) =>
                        handleChange("secondaryPhone", e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Açıklama</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        handleChange("description", e.target.value)
                      }
                      className={inputClass}
                      rows="3"
                    />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Durum Bilgileri
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Uyruk</label>
                    <select
                      value={formData.nationalityId}
                      onChange={(e) =>
                        handleChange("nationalityId", e.target.value)
                      }
                      className={selectClass}
                    >
                      <option value="">Seçiniz</option>
                      {nationalities.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <BooleanSelect label="Çalışma Durumu" field="workingStatus" />
                  {formData.gender !== "female" && (
                    <BooleanSelect
                      label="Askerlik Durumu"
                      field="militaryStatus"
                    />
                  )}
                  <BooleanSelect
                    label="Emeklilik Durumu"
                    field="retirementStatus"
                  />
                  <BooleanSelect
                    label="Sigara Kullanımı"
                    field="smokingStatus"
                  />
                  <BooleanSelect label="Engelli" field="isDisabledPerson" />
                  <BooleanSelect label="Evli" field="isMarried" />
                  <BooleanSelect
                    label="Adli Sicil Kaydı"
                    field="isCriminalRecorded"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={handleProfileSave}
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Kaydediliyor..." : "Profili Kaydet"}
                </button>
              </div>
            </div>
          )}

          {/* ── Address Section ── */}
          {activeSection === "address" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Adres Bilgileri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>İl</label>
                  <select
                    value={selectedCityId}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">İl Seçiniz</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>İlçe</label>
                  <select
                    value={selectedDistrictId}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className={selectClass}
                    disabled={!selectedCityId}
                  >
                    <option value="">İlçe Seçiniz</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Mahalle</label>
                  <select
                    value={formData.addressNeighbourhoodId}
                    onChange={(e) =>
                      handleChange("addressNeighbourhoodId", e.target.value)
                    }
                    className={selectClass}
                    disabled={!selectedDistrictId}
                  >
                    <option value="">Mahalle Seçiniz</option>
                    {neighbourhoods.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Açık Adres</label>
                <textarea
                  value={formData.addressText}
                  onChange={(e) => handleChange("addressText", e.target.value)}
                  className={inputClass}
                  rows="3"
                />
              </div>
              {user.neighbourhood && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-sm text-gray-600 dark:text-gray-400">
                  Mevcut: {user.neighbourhood.name},{" "}
                  {user.neighbourhood.district?.title},{" "}
                  {user.neighbourhood.district?.city?.title}
                </div>
              )}
              <div className="flex justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={handleProfileSave}
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Kaydediliyor..." : "Adresi Kaydet"}
                </button>
              </div>
            </div>
          )}

          {/* ── Admin Controls ── */}
          {activeSection === "admin" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Admin Kontrolleri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <BooleanSelect label="Hesap Onayı" field="isApproved" />
                <BooleanSelect label="Telefon Onayı" field="isPhoneApproved" />
                <BooleanSelect label="E-posta Onayı" field="isEmailApproved" />
                <BooleanSelect label="Yasaklı" field="isBanned" />
              </div>
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                  Şifre Değiştir
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Yeni Şifre</label>
                    <input
                      type="password"
                      value={passwordData.password}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      className={inputClass}
                      placeholder="Yeni şifre"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Yeni Şifre (Tekrar)</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      className={inputClass}
                      placeholder="Yeni şifre tekrarı"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={handleProfileSave}
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </div>
          )}

          {/* ── Professions Section ── */}
          {activeSection === "professions" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Meslekler
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddProfession(!showAddProfession)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  <PlusIcon className="w-4 h-4" />
                  Ekle
                </button>
              </div>
              {showAddProfession && (
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 space-y-3 border border-blue-200 dark:border-blue-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <ProfessionSearchSelect
                      value={newProfession.professionId}
                      onChange={(val) =>
                        setNewProfession({
                          ...newProfession,
                          professionId: val,
                        })
                      }
                    />
                    <div>
                      <label className={labelClass}>Seviye (1-5)</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={newProfession.level}
                        onChange={(e) =>
                          setNewProfession({
                            ...newProfession,
                            level: parseInt(e.target.value) || 1,
                          })
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddProfession(false)}
                      className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-white hover:bg-gray-50 dark:bg-gray-900/50 dark:hover:bg-gray-700 dark:bg-gray-700"
                    >
                      İptal
                    </button>
                    <button
                      type="button"
                      disabled={saving || !newProfession.professionId}
                      onClick={() =>
                        handleAddEntity(
                          () =>
                            adminAddProfession(userId, {
                              professionId: parseInt(
                                newProfession.professionId,
                              ),
                              level: newProfession.level,
                            }),
                          (data) => {
                            setProfessions([...professions, data]);
                            setNewProfession({ professionId: "", level: 1 });
                            setShowAddProfession(false);
                          },
                          "Meslek eklenemedi.",
                        )
                      }
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Kaydet
                    </button>
                  </div>
                </div>
              )}
              {professions.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm py-4 text-center">
                  Henüz meslek eklenmemiş.
                </p>
              ) : (
                <div className="space-y-2">
                  {professions.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3"
                    >
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {p.profession?.profession || "-"}
                        </span>
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                          Seviye: {p.level}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          confirmDelete("Bu meslek", () =>
                            adminDeleteProfession(userId, p.id).then(() =>
                              setProfessions(
                                professions.filter((x) => x.id !== p.id),
                              ),
                            ),
                          )
                        }
                        className="p-1 text-red-500 hover:bg-red-50 dark:bg-red-900/30 rounded"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Sectors Section ── */}
          {activeSection === "sectors" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Sektörler
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddSector(!showAddSector)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  <PlusIcon className="w-4 h-4" />
                  Ekle
                </button>
              </div>
              {showAddSector && (
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 space-y-3 border border-blue-200 dark:border-blue-700">
                  <div>
                    <label className={labelClass}>Sektör</label>
                    <select
                      value={newSector.sectorId}
                      onChange={(e) =>
                        setNewSector({ sectorId: e.target.value })
                      }
                      className={selectClass}
                    >
                      <option value="">Seçiniz</option>
                      {sectorsList.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.sector}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddSector(false)}
                      className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-white hover:bg-gray-50 dark:bg-gray-900/50 dark:hover:bg-gray-700 dark:bg-gray-700"
                    >
                      İptal
                    </button>
                    <button
                      type="button"
                      disabled={saving || !newSector.sectorId}
                      onClick={() =>
                        handleAddEntity(
                          () =>
                            adminAddSector(userId, {
                              sectorId: parseInt(newSector.sectorId),
                            }),
                          (data) => {
                            setSectors([...sectors, data]);
                            setNewSector({ sectorId: "" });
                            setShowAddSector(false);
                          },
                          "Sektör eklenemedi.",
                        )
                      }
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Kaydet
                    </button>
                  </div>
                </div>
              )}
              {sectors.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm py-4 text-center">
                  Henüz sektör eklenmemiş.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {sectors.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg px-4 py-2 text-sm font-semibold"
                    >
                      <span>{s.sector?.sector || "-"}</span>
                      <button
                        type="button"
                        onClick={() =>
                          confirmDelete("Bu sektör", () =>
                            adminDeleteSector(userId, s.id).then(() =>
                              setSectors(sectors.filter((x) => x.id !== s.id)),
                            ),
                          )
                        }
                        className="p-0.5 text-purple-500 hover:text-red-500"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Work Experiences Section ── */}
          {activeSection === "workExperiences" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  İş Deneyimleri
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddWorkExp(!showAddWorkExp)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  <PlusIcon className="w-4 h-4" />
                  Ekle
                </button>
              </div>
              {showAddWorkExp && (
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 space-y-3 border border-blue-200 dark:border-blue-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Şirket Adı *</label>
                      <input
                        type="text"
                        value={newWorkExp.companyName}
                        onChange={(e) =>
                          setNewWorkExp({
                            ...newWorkExp,
                            companyName: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </div>
                    <ProfessionSearchSelect
                      value={newWorkExp.professionId}
                      onChange={(val) =>
                        setNewWorkExp({ ...newWorkExp, professionId: val })
                      }
                    />
                    <div>
                      <label className={labelClass}>Çalışma Yöntemi</label>
                      <select
                        value={newWorkExp.workingMethodId}
                        onChange={(e) =>
                          setNewWorkExp({
                            ...newWorkExp,
                            workingMethodId: e.target.value,
                          })
                        }
                        className={selectClass}
                      >
                        <option value="">Seçiniz</option>
                        {workingMethodsList.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Başlangıç Tarihi *</label>
                      <input
                        type="date"
                        value={newWorkExp.startDate}
                        onChange={(e) =>
                          setNewWorkExp({
                            ...newWorkExp,
                            startDate: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Bitiş Tarihi</label>
                      <input
                        type="date"
                        value={newWorkExp.endDate}
                        onChange={(e) =>
                          setNewWorkExp({
                            ...newWorkExp,
                            endDate: e.target.value,
                          })
                        }
                        className={inputClass}
                        disabled={newWorkExp.isContinuing}
                      />
                    </div>
                    <div className="flex items-end pb-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newWorkExp.isContinuing}
                          onChange={(e) =>
                            setNewWorkExp({
                              ...newWorkExp,
                              isContinuing: e.target.checked,
                              endDate: "",
                            })
                          }
                          className="rounded"
                        />
                        <span className="text-sm">Devam Ediyor</span>
                      </label>
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>Açıklama</label>
                      <textarea
                        value={newWorkExp.description}
                        onChange={(e) =>
                          setNewWorkExp({
                            ...newWorkExp,
                            description: e.target.value,
                          })
                        }
                        className={inputClass}
                        rows="2"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddWorkExp(false)}
                      className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-white hover:bg-gray-50 dark:bg-gray-900/50 dark:hover:bg-gray-700 dark:bg-gray-700"
                    >
                      İptal
                    </button>
                    <button
                      type="button"
                      disabled={
                        saving ||
                        !newWorkExp.companyName ||
                        !newWorkExp.startDate
                      }
                      onClick={() => {
                        const data = {
                          companyName: newWorkExp.companyName,
                          startDate: newWorkExp.startDate,
                          isContinuing: newWorkExp.isContinuing,
                        };
                        if (newWorkExp.professionId)
                          data.professionId = parseInt(newWorkExp.professionId);
                        if (newWorkExp.workingMethodId)
                          data.workingMethodId = parseInt(
                            newWorkExp.workingMethodId,
                          );
                        if (newWorkExp.endDate)
                          data.endDate = newWorkExp.endDate;
                        if (newWorkExp.description)
                          data.description = newWorkExp.description;
                        handleAddEntity(
                          () => adminAddWorkExperience(userId, data),
                          (resData) => {
                            setWorkExperiences([...workExperiences, resData]);
                            setNewWorkExp({
                              companyName: "",
                              professionId: "",
                              workingMethodId: "",
                              startDate: "",
                              endDate: "",
                              isContinuing: false,
                              description: "",
                            });
                            setShowAddWorkExp(false);
                          },
                          "İş deneyimi eklenemedi.",
                        );
                      }}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Kaydet
                    </button>
                  </div>
                </div>
              )}
              {workExperiences.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm py-4 text-center">
                  Henüz iş deneyimi eklenmemiş.
                </p>
              ) : (
                <div className="space-y-3">
                  {workExperiences.map((exp) => (
                    <div
                      key={exp.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {exp.companyName}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {exp.profession?.profession || "-"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(exp.startDate)} -{" "}
                            {exp.isContinuing
                              ? "Devam Ediyor"
                              : formatDate(exp.endDate)}
                          </p>
                          {exp.description && (
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                              {exp.description}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            confirmDelete("Bu iş deneyimi", () =>
                              adminDeleteWorkExperience(userId, exp.id).then(
                                () =>
                                  setWorkExperiences(
                                    workExperiences.filter(
                                      (x) => x.id !== exp.id,
                                    ),
                                  ),
                              ),
                            )
                          }
                          className="p-1 text-red-500 hover:bg-red-50 dark:bg-red-900/30 rounded"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Educations Section ── */}
          {activeSection === "educations" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Eğitim</h3>
                <button
                  type="button"
                  onClick={() => setShowAddEducation(!showAddEducation)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  <PlusIcon className="w-4 h-4" />
                  Ekle
                </button>
              </div>
              {showAddEducation &&
                (() => {
                  const selectedEduType = educationTypesList.find(
                    (t) =>
                      String(t.id) === String(newEducation.educationTypeId),
                  );
                  const isUniversityLevel =
                    selectedEduType &&
                    /lisans|doktora/i.test(selectedEduType.type);
                  return (
                    <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 space-y-3 border border-blue-200 dark:border-blue-700">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>Eğitim Tipi *</label>
                          <select
                            value={newEducation.educationTypeId}
                            onChange={(e) => {
                              const val = e.target.value;
                              setNewEducation({
                                ...newEducation,
                                educationTypeId: val,
                                schoolId: "",
                                departmentId: "",
                              });
                              setEduSelectedUniversityId("");
                              setEduSelectedFacultyId("");
                              setEduSelectedCityId("");
                              setEduFaculties([]);
                              setEduDepartments([]);
                              setEduSchools([]);
                              const t = educationTypesList.find(
                                (x) => String(x.id) === val,
                              );
                              if (t && /lisans|doktora/i.test(t.type))
                                loadUniversities();
                            }}
                            className={selectClass}
                          >
                            <option value="">Seçiniz</option>
                            {educationTypesList.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.type}
                              </option>
                            ))}
                          </select>
                        </div>

                        {newEducation.educationTypeId && isUniversityLevel && (
                          <>
                            <div>
                              <label className={labelClass}>Üniversite</label>
                              <select
                                value={eduSelectedUniversityId}
                                onChange={(e) =>
                                  handleEduUniversityChange(e.target.value)
                                }
                                className={selectClass}
                              >
                                <option value="">Seçiniz</option>
                                {eduUniversities.map((u) => (
                                  <option key={u.id} value={u.id}>
                                    {u.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            {eduSelectedUniversityId && (
                              <div>
                                <label className={labelClass}>Fakülte</label>
                                <select
                                  value={eduSelectedFacultyId}
                                  onChange={(e) =>
                                    handleEduFacultyChange(e.target.value)
                                  }
                                  className={selectClass}
                                >
                                  <option value="">Seçiniz</option>
                                  {eduFaculties.map((f) => (
                                    <option key={f.id} value={f.id}>
                                      {f.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                            {eduSelectedFacultyId && (
                              <div>
                                <label className={labelClass}>Bölüm</label>
                                <select
                                  value={newEducation.departmentId}
                                  onChange={(e) =>
                                    setNewEducation({
                                      ...newEducation,
                                      departmentId: e.target.value,
                                    })
                                  }
                                  className={selectClass}
                                >
                                  <option value="">Seçiniz</option>
                                  {eduDepartments.map((d) => (
                                    <option key={d.id} value={d.id}>
                                      {d.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </>
                        )}

                        {newEducation.educationTypeId && !isUniversityLevel && (
                          <>
                            <div>
                              <label className={labelClass}>İl</label>
                              <select
                                value={eduSelectedCityId}
                                onChange={(e) =>
                                  handleEduCityChange(e.target.value)
                                }
                                className={selectClass}
                              >
                                <option value="">Seçiniz</option>
                                {cities.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.title}
                                  </option>
                                ))}
                              </select>
                            </div>
                            {eduSelectedCityId && (
                              <div>
                                <label className={labelClass}>Okul</label>
                                <select
                                  value={newEducation.schoolId}
                                  onChange={(e) =>
                                    setNewEducation({
                                      ...newEducation,
                                      schoolId: e.target.value,
                                    })
                                  }
                                  className={selectClass}
                                >
                                  <option value="">Seçiniz</option>
                                  {eduSchools.map((s) => (
                                    <option key={s.id} value={s.id}>
                                      {s.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </>
                        )}

                        <div>
                          <label className={labelClass}>Başlangıç</label>
                          <input
                            type="date"
                            value={newEducation.startYear}
                            onChange={(e) =>
                              setNewEducation({
                                ...newEducation,
                                startYear: e.target.value,
                              })
                            }
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Bitiş</label>
                          <input
                            type="date"
                            value={newEducation.endYear}
                            onChange={(e) =>
                              setNewEducation({
                                ...newEducation,
                                endYear: e.target.value,
                              })
                            }
                            className={inputClass}
                            disabled={newEducation.continueStatus}
                          />
                        </div>
                        <div className="flex items-end pb-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newEducation.continueStatus}
                              onChange={(e) =>
                                setNewEducation({
                                  ...newEducation,
                                  continueStatus: e.target.checked,
                                  endYear: "",
                                })
                              }
                              className="rounded"
                            />
                            <span className="text-sm">Devam Ediyor</span>
                          </label>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddEducation(false);
                            setEduSelectedUniversityId("");
                            setEduSelectedFacultyId("");
                            setEduSelectedCityId("");
                            setEduFaculties([]);
                            setEduDepartments([]);
                            setEduSchools([]);
                          }}
                          className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-white hover:bg-gray-50 dark:bg-gray-900/50 dark:hover:bg-gray-700 dark:bg-gray-700"
                        >
                          İptal
                        </button>
                        <button
                          type="button"
                          disabled={saving || !newEducation.educationTypeId}
                          onClick={() => {
                            const data = {
                              educationTypeId: parseInt(
                                newEducation.educationTypeId,
                              ),
                              continueStatus: newEducation.continueStatus,
                            };
                            if (newEducation.schoolId)
                              data.schoolId = parseInt(newEducation.schoolId);
                            if (newEducation.departmentId)
                              data.departmentId = parseInt(
                                newEducation.departmentId,
                              );
                            if (newEducation.startYear)
                              data.startYear = newEducation.startYear;
                            if (newEducation.endYear)
                              data.endYear = newEducation.endYear;
                            handleAddEntity(
                              () => adminAddEducation(userId, data),
                              (resData) => {
                                setEducations([...educations, resData]);
                                setNewEducation({
                                  educationTypeId: "",
                                  schoolId: "",
                                  departmentId: "",
                                  startYear: "",
                                  endYear: "",
                                  continueStatus: false,
                                });
                                setEduSelectedUniversityId("");
                                setEduSelectedFacultyId("");
                                setEduSelectedCityId("");
                                setEduFaculties([]);
                                setEduDepartments([]);
                                setEduSchools([]);
                                setShowAddEducation(false);
                              },
                              "Eğitim eklenemedi.",
                            );
                          }}
                          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          Kaydet
                        </button>
                      </div>
                    </div>
                  );
                })()}
              {educations.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm py-4 text-center">
                  Henüz eğitim eklenmemiş.
                </p>
              ) : (
                <div className="space-y-3">
                  {educations.map((edu) => (
                    <div
                      key={edu.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {edu.department?.name || edu.school?.name || "-"}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {edu.department?.faculity?.university?.name ||
                              edu.school?.city?.title ||
                              ""}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {edu.educationType?.type} |{" "}
                            {formatDate(edu.startYear)} -{" "}
                            {edu.continueStatus
                              ? "Devam Ediyor"
                              : formatDate(edu.endYear)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            confirmDelete("Bu eğitim", () =>
                              adminDeleteEducation(userId, edu.id).then(() =>
                                setEducations(
                                  educations.filter((x) => x.id !== edu.id),
                                ),
                              ),
                            )
                          }
                          className="p-1 text-red-500 hover:bg-red-50 dark:bg-red-900/30 rounded"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Languages Section ── */}
          {activeSection === "languages" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Diller</h3>
                <button
                  type="button"
                  onClick={() => setShowAddLanguage(!showAddLanguage)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  <PlusIcon className="w-4 h-4" />
                  Ekle
                </button>
              </div>
              {showAddLanguage && (
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 space-y-3 border border-blue-200 dark:border-blue-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <label className={labelClass}>Dil *</label>
                      <select
                        value={newLanguage.languageId}
                        onChange={(e) =>
                          setNewLanguage({
                            ...newLanguage,
                            languageId: e.target.value,
                          })
                        }
                        className={selectClass}
                      >
                        <option value="">Seçiniz</option>
                        {languagesList.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Okuma (1-5)</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={newLanguage.readingLevel}
                        onChange={(e) =>
                          setNewLanguage({
                            ...newLanguage,
                            readingLevel: parseInt(e.target.value) || 1,
                          })
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Yazma (1-5)</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={newLanguage.writingLevel}
                        onChange={(e) =>
                          setNewLanguage({
                            ...newLanguage,
                            writingLevel: parseInt(e.target.value) || 1,
                          })
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Dinleme (1-5)</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={newLanguage.listeningLevel}
                        onChange={(e) =>
                          setNewLanguage({
                            ...newLanguage,
                            listeningLevel: parseInt(e.target.value) || 1,
                          })
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Konuşma (1-5)</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={newLanguage.speakingLevel}
                        onChange={(e) =>
                          setNewLanguage({
                            ...newLanguage,
                            speakingLevel: parseInt(e.target.value) || 1,
                          })
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddLanguage(false)}
                      className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-white hover:bg-gray-50 dark:bg-gray-900/50 dark:hover:bg-gray-700 dark:bg-gray-700"
                    >
                      İptal
                    </button>
                    <button
                      type="button"
                      disabled={saving || !newLanguage.languageId}
                      onClick={() =>
                        handleAddEntity(
                          () =>
                            adminAddLanguage(userId, {
                              languageId: parseInt(newLanguage.languageId),
                              readingLevel: newLanguage.readingLevel,
                              writingLevel: newLanguage.writingLevel,
                              listeningLevel: newLanguage.listeningLevel,
                              speakingLevel: newLanguage.speakingLevel,
                            }),
                          (resData) => {
                            setLanguages([...languages, resData]);
                            setNewLanguage({
                              languageId: "",
                              readingLevel: 1,
                              writingLevel: 1,
                              listeningLevel: 1,
                              speakingLevel: 1,
                            });
                            setShowAddLanguage(false);
                          },
                          "Dil eklenemedi.",
                        )
                      }
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Kaydet
                    </button>
                  </div>
                </div>
              )}
              {languages.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm py-4 text-center">
                  Henüz dil eklenmemiş.
                </p>
              ) : (
                <div className="space-y-2">
                  {languages.map((lang) => (
                    <div
                      key={lang.id}
                      className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3"
                    >
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {lang.language?.name || "-"}
                        </span>
                        <span className="ml-3 text-xs text-gray-500 dark:text-gray-400">
                          O:{lang.readingLevel} Y:{lang.writingLevel} D:
                          {lang.listeningLevel} K:{lang.speakingLevel}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          confirmDelete("Bu dil", () =>
                            adminDeleteLanguage(userId, lang.id).then(() =>
                              setLanguages(
                                languages.filter((x) => x.id !== lang.id),
                              ),
                            ),
                          )
                        }
                        className="p-1 text-red-500 hover:bg-red-50 dark:bg-red-900/30 rounded"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Driving Licenses Section ── */}
          {activeSection === "drivingLicenses" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Ehliyetler
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setShowAddDrivingLicense(!showAddDrivingLicense)
                  }
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  <PlusIcon className="w-4 h-4" />
                  Ekle
                </button>
              </div>
              {showAddDrivingLicense && (
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 space-y-3 border border-blue-200 dark:border-blue-700">
                  <div>
                    <label className={labelClass}>Ehliyet Tipi *</label>
                    <select
                      value={newDrivingLicense.drivingListenceTypeId}
                      onChange={(e) =>
                        setNewDrivingLicense({
                          drivingListenceTypeId: e.target.value,
                        })
                      }
                      className={selectClass}
                    >
                      <option value="">Seçiniz</option>
                      {drivingLicenseTypesList.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddDrivingLicense(false)}
                      className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-white hover:bg-gray-50 dark:bg-gray-900/50 dark:hover:bg-gray-700 dark:bg-gray-700"
                    >
                      İptal
                    </button>
                    <button
                      type="button"
                      disabled={
                        saving || !newDrivingLicense.drivingListenceTypeId
                      }
                      onClick={() =>
                        handleAddEntity(
                          () =>
                            adminAddDrivingLicense(userId, {
                              drivingListenceTypeId: parseInt(
                                newDrivingLicense.drivingListenceTypeId,
                              ),
                            }),
                          (resData) => {
                            setDrivingLicenses([...drivingLicenses, resData]);
                            setNewDrivingLicense({ drivingListenceTypeId: "" });
                            setShowAddDrivingLicense(false);
                          },
                          "Ehliyet eklenemedi.",
                        )
                      }
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Kaydet
                    </button>
                  </div>
                </div>
              )}
              {drivingLicenses.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm py-4 text-center">
                  Henüz ehliyet eklenmemiş.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {drivingLicenses.map((lic) => (
                    <div
                      key={lic.id}
                      className="flex items-center gap-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg px-4 py-2 text-sm font-semibold"
                    >
                      <span>{lic.drivingLisenceType?.title || "-"}</span>
                      <button
                        type="button"
                        onClick={() =>
                          confirmDelete("Bu ehliyet", () =>
                            adminDeleteDrivingLicense(userId, lic.id).then(() =>
                              setDrivingLicenses(
                                drivingLicenses.filter((x) => x.id !== lic.id),
                              ),
                            ),
                          )
                        }
                        className="p-0.5 text-green-500 hover:text-red-500"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
