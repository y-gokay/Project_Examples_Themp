import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Select,
  Input,
  Button,
  Checkbox,
} from "../ui";
import { GraduationCap, Plus, X, Loader2 } from "lucide-react";
import { showToast } from "../ui/Toast";
import { sortEducationTypes, sortEducationLevels } from "../../utils/helpers";

/**
 * EducationSection Component
 * Manages user's education information (university and school level)
 *
 * @param {Object} props
 * @param {Object} props.user - User object with educations array
 * @param {Object} props.lookups - Lookup data (educationTypes, cities)
 * @param {Function} props.onAddEducation - Handler for adding education
 * @param {Function} props.onRemoveEducation - Handler for removing education
 * @param {Function} props.getUniversities - API call to get universities
 * @param {Function} props.getFacultiesByUniversity - API call to get faculties
 * @param {Function} props.getDepartmentsByFaculty - API call to get departments
 * @param {Function} props.getSchoolsByCityAndType - API call to get schools
 * @param {boolean} props.loading - Loading state
 */
const EducationSection = ({
  user,
  lookups,
  onAddEducation,
  onRemoveEducation,
  getUniversities,
  getFacultiesByUniversity,
  getDepartmentsByFaculty,
  getSchoolsByCityAndType,
  loading = false,
}) => {
  const [educationForm, setEducationForm] = useState({
    educationTypeId: "",
    startYear: "",
    endYear: "",
    continueStatus: false,
    universityId: "",
    facultyId: "",
    departmentId: "",
    cityId: "",
    schoolId: "",
  });
  const [universities, setUniversities] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [schools, setSchools] = useState([]);
  const [addingEducation, setAddingEducation] = useState(false);
  const [removingEducationId, setRemovingEducationId] = useState(null);

  // Eğitim tipinin üniversite seviyesi olup olmadığını belirlemek için helper
  const isUniversityLevel = (educationTypeId) => {
    if (!educationTypeId || !lookups.educationTypes) return false;
    const educationType = lookups.educationTypes.find(
      (et) => et.id?.toString() === educationTypeId.toString(),
    );
    if (!educationType) return false;
    const typeName = educationType.type || "";
    return ["Lisans", "Ön Lisans", "Yüksek Lisans", "Doktora"].includes(
      typeName,
    );
  };

  // Eğitim tipi adını almak için helper
  const getEducationTypeName = (educationTypeId) => {
    if (!educationTypeId || !lookups.educationTypes) return "Bilinmeyen";
    const educationType = lookups.educationTypes.find(
      (et) => et.id?.toString() === educationTypeId.toString(),
    );
    return educationType?.type || "Bilinmeyen";
  };

  // Eğitim tipi değişikliğini handle et - bağımlı field'ları sıfırla
  const handleEducationTypeChange = async (educationTypeId) => {
    const prevCityId = educationForm.cityId;
    setEducationForm((prev) => ({
      ...prev,
      educationTypeId,
      universityId: "",
      facultyId: "",
      departmentId: "",
      schoolId: "",
    }));
    setFaculties([]);
    setDepartments([]);
    setSchools([]);

    // Üniversite seviyesi ise, üniversiteleri yükle
    if (educationTypeId) {
      // Lookup'ların hazır olması için biraz bekle
      await new Promise((resolve) => setTimeout(resolve, 100));

      const isUniLevel = isUniversityLevel(educationTypeId);
      if (isUniLevel) {
        const result = await getUniversities();
        if (result.success) {
          setUniversities(result.data || []);
        } else {
          setUniversities([]);
        }
      } else if (prevCityId) {
        // Okul seviyesi ise ve şehir seçildiyse, yeni tip ile okulları yeniden yükle
        const educationType = lookups.educationTypes?.find(
          (et) => et.id?.toString() === educationTypeId.toString(),
        );
        if (educationType) {
          const result = await getSchoolsByCityAndType(
            parseInt(prevCityId),
            educationType.type,
          );
          if (result.success) {
            setSchools(result.data || []);
          } else {
            setSchools([]);
          }
        } else {
          setSchools([]);
        }
      }
    }
  };

  // Üniversite değişikliğini handle et - fakülteleri getir
  const handleUniversityChange = async (universityId) => {
    setEducationForm((prev) => ({
      ...prev,
      universityId,
      facultyId: "",
      departmentId: "",
    }));
    setDepartments([]);

    if (!universityId) {
      setFaculties([]);
      return;
    }

    const result = await getFacultiesByUniversity(parseInt(universityId));
    if (result.success) {
      const facultiesData = result.data || [];
      setFaculties(facultiesData);
    } else {
      setFaculties([]);
    }
  };

  // Fakülte değişikliğini handle et - bölümleri getir
  const handleFacultyChange = async (facultyId) => {
    setEducationForm((prev) => ({
      ...prev,
      facultyId,
      departmentId: "",
    }));

    if (!facultyId) {
      setDepartments([]);
      return;
    }

    const result = await getDepartmentsByFaculty(parseInt(facultyId));
    if (result.success) {
      setDepartments(result.data || []);
    } else {
      setDepartments([]);
    }
  };

  // Şehir değişikliğini handle et - eğitim tipine göre okulları getir
  const handleCityChange = async (cityId) => {
    setEducationForm((prev) => ({
      ...prev,
      cityId,
      schoolId: "",
    }));
  };

  // cityId ve educationTypeId her ikisi de set edildiğinde okulları yükle (okul seviyesi eğitim için)
  useEffect(() => {
    const loadSchools = async () => {
      const { cityId, educationTypeId } = educationForm;

      // Sadece cityId ve educationTypeId her ikisi de set edildiyse okulları yükle
      if (!cityId || !educationTypeId) {
        // cityId temizlendiyse, okulları temizle
        if (!cityId) {
          setSchools([]);
        }
        return;
      }

      // Lookup'ların yüklenmesini bekle
      if (!lookups.educationTypes || lookups.educationTypes.length === 0) {
        // Lookup'lar henüz yüklenmediyse kısa bir gecikmeden sonra tekrar dene
        await new Promise((resolve) => setTimeout(resolve, 200));
        if (!lookups.educationTypes || lookups.educationTypes.length === 0) {
          return;
        }
      }

      // Üniversite seviyesi olup olmadığını kontrol et - öyleyse okulları yükleme
      if (isUniversityLevel(educationTypeId)) {
        setSchools([]);
        return;
      }

      const educationType = lookups.educationTypes.find(
        (et) => et.id?.toString() === educationTypeId.toString(),
      );

      if (!educationType) {
        setSchools([]);
        return;
      }

      const result = await getSchoolsByCityAndType(
        parseInt(cityId),
        educationType.type,
      );

      if (result.success) {
        setSchools(result.data || []);
      } else {
        setSchools([]);
      }
    };

    loadSchools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    educationForm.cityId,
    educationForm.educationTypeId,
    lookups.educationTypes,
  ]);

  const handleAddEducation = async () => {
    if (!educationForm.educationTypeId) {
      showToast({
        type: "error",
        message: "Lütfen eğitim seviyesi seçin",
        duration: 3000,
      });
      return;
    }

    if (!educationForm.startYear) {
      showToast({
        type: "error",
        message: "Lütfen başlangıç yılı girin",
        duration: 3000,
      });
      return;
    }

    if (!educationForm.continueStatus && !educationForm.endYear) {
      showToast({
        type: "error",
        message:
          "Lütfen bitiş yılı girin veya devam ediyor seçeneğini işaretleyin",
        duration: 3000,
      });
      return;
    }

    // Yıl format ve tutarlılık kontrolü
    const startYearNum = parseInt(educationForm.startYear, 10);
    const endYearNum = educationForm.continueStatus
      ? null
      : parseInt(educationForm.endYear, 10);

    // Yıl 4 haneli olmalı
    if (educationForm.startYear.length !== 4) {
      showToast({
        type: "error",
        message: "Başlangıç yılı 4 haneli olmalıdır",
        duration: 3000,
      });
      return;
    }

    if (Number.isNaN(startYearNum)) {
      showToast({
        type: "error",
        message: "Başlangıç yılı geçerli bir sayı olmalıdır",
        duration: 3000,
      });
      return;
    }

    if (!educationForm.continueStatus) {
      if (educationForm.endYear.length !== 4) {
        showToast({
          type: "error",
          message: "Bitiş yılı 4 haneli olmalıdır",
          duration: 3000,
        });
        return;
      }

      if (Number.isNaN(endYearNum)) {
        showToast({
          type: "error",
          message: "Bitiş yılı geçerli bir sayı olmalıdır",
          duration: 3000,
        });
        return;
      }
    }

    if (
      !educationForm.continueStatus &&
      startYearNum &&
      endYearNum &&
      startYearNum > endYearNum
    ) {
      showToast({
        type: "error",
        message: "Başlangıç yılı, bitiş yılından büyük olamaz",
        duration: 3000,
      });
      return;
    }

    const isUniLevel = isUniversityLevel(educationForm.educationTypeId);

    if (isUniLevel) {
      if (!educationForm.departmentId) {
        showToast({
          type: "error",
          message: "Lütfen bölüm seçin",
          duration: 3000,
        });
        return;
      }
    } else {
      if (!educationForm.schoolId) {
        showToast({
          type: "error",
          message: "Lütfen okul seçin",
          duration: 3000,
        });
        return;
      }
    }

    setAddingEducation(true);

    const educationData = {
      startYear: educationForm.startYear.toString(),
      endYear: educationForm.continueStatus
        ? null
        : educationForm.endYear.toString(),
      continueStatus: educationForm.continueStatus,
      educationTypeId: parseInt(educationForm.educationTypeId),
      departmentId: isUniLevel ? parseInt(educationForm.departmentId) : null,
      schoolId: isUniLevel ? null : parseInt(educationForm.schoolId),
    };

    const result = await onAddEducation(educationData);
    setAddingEducation(false);

    if (result.success) {
      showToast({
        type: "success",
        message: "Eğitim başarıyla eklendi",
        duration: 3000,
      });
      // Formu sıfırla
      setEducationForm({
        educationTypeId: "",
        startYear: "",
        endYear: "",
        continueStatus: false,
        universityId: "",
        facultyId: "",
        departmentId: "",
        cityId: "",
        schoolId: "",
      });
      setFaculties([]);
      setDepartments([]);
      setSchools([]);
    } else {
      showToast({
        type: "error",
        message: result.error || "Eğitim eklenirken bir hata oluştu",
        duration: 3000,
      });
    }
  };

  const handleRemoveEducation = async (educationId) => {
    setRemovingEducationId(educationId);
    const result = await onRemoveEducation(educationId);
    setRemovingEducationId(null);

    if (result.success) {
      showToast({
        type: "success",
        message: "Eğitim başarıyla kaldırıldı",
        duration: 3000,
      });
    } else {
      showToast({
        type: "error",
        message: result.error || "Eğitim kaldırılırken bir hata oluştu",
        duration: 3000,
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5" />
          Eğitim Bilgileri
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Add Education Form */}
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Eğitim Seviyesi"
                value={educationForm.educationTypeId}
                onChange={(e) => handleEducationTypeChange(e.target.value)}
                options={[
                  {
                    value: "",
                    label: "Eğitim Seviyesi Seçiniz",
                    disabled: true,
                  },
                  ...sortEducationTypes(lookups.educationTypes || []).map(
                    (et) => ({
                      value: et.id?.toString() || "",
                      label: et.type || "Bilinmeyen",
                    }),
                  ),
                ]}
                placeholder="Eğitim seviyesi seçiniz"
              />

              <Input
                label="Başlangıç Yılı"
                type="text"
                value={educationForm.startYear}
                onChange={(e) => {
                  const value = e.target.value;
                  // Sadece sayıları kabul et ve maksimum 4 haneli
                  if (value === "" || /^\d{1,4}$/.test(value)) {
                    setEducationForm((prev) => ({
                      ...prev,
                      startYear: value,
                    }));
                  }
                }}
                placeholder="Örn: 2020"
                maxLength={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Bitiş Yılı"
                type="text"
                value={educationForm.endYear}
                onChange={(e) => {
                  const value = e.target.value;
                  // Sadece sayıları kabul et ve maksimum 4 haneli
                  if (value === "" || /^\d{1,4}$/.test(value)) {
                    setEducationForm((prev) => ({
                      ...prev,
                      endYear: value,
                    }));
                  }
                }}
                placeholder="Örn: 2025"
                maxLength={4}
                disabled={educationForm.continueStatus}
              />

              <div className="flex items-end">
                <Checkbox
                  label="Devam Ediyor"
                  checked={educationForm.continueStatus}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setEducationForm((prev) => ({
                      ...prev,
                      continueStatus: checked,
                      endYear: checked ? "" : prev.endYear,
                    }));
                  }}
                />
              </div>
            </div>

            {/* Conditional fields based on education type */}
            {educationForm.educationTypeId &&
              (isUniversityLevel(educationForm.educationTypeId) ? (
                // Üniversite seviyesi: Üniversite → Fakülte → Bölüm
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    label="Üniversite"
                    value={educationForm.universityId}
                    onChange={(e) => handleUniversityChange(e.target.value)}
                    options={[
                      {
                        value: "",
                        label: "Üniversite Seçiniz",
                        disabled: true,
                      },
                      ...universities.map((university) => ({
                        value: university.id?.toString() || "",
                        label: university.name || "Bilinmeyen Üniversite",
                      })),
                    ]}
                    placeholder="Üniversite seçiniz"
                  />

                  <Select
                    label="Fakülte"
                    value={educationForm.facultyId}
                    onChange={(e) => handleFacultyChange(e.target.value)}
                    options={[
                      { value: "", label: "Fakülte Seçiniz", disabled: true },
                      ...faculties.map((faculty) => ({
                        value: faculty.id?.toString() || "",
                        label: faculty.name || "Bilinmeyen Fakülte",
                      })),
                    ]}
                    placeholder="Fakülte seçiniz"
                    disabled={!educationForm.universityId}
                  />

                  <Select
                    label="Bölüm"
                    value={educationForm.departmentId}
                    onChange={(e) =>
                      setEducationForm((prev) => ({
                        ...prev,
                        departmentId: e.target.value,
                      }))
                    }
                    options={[
                      { value: "", label: "Bölüm Seçiniz", disabled: true },
                      ...departments.map((dept) => ({
                        value: dept.id?.toString() || "",
                        label: dept.name || "Bilinmeyen Bölüm",
                      })),
                    ]}
                    placeholder="Bölüm seçiniz"
                    disabled={!educationForm.facultyId}
                  />
                </div>
              ) : (
                // Okul seviyesi: Şehir → Okul
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Şehir"
                    value={educationForm.cityId}
                    onChange={(e) => handleCityChange(e.target.value)}
                    options={[
                      { value: "", label: "Şehir Seçiniz", disabled: true },
                      ...(lookups.cities || []).map((city) => ({
                        value: city.id?.toString() || "",
                        label: city.title || city.name || "Bilinmeyen Şehir",
                      })),
                    ]}
                    placeholder="Şehir seçiniz"
                  />

                  <Select
                    label="Okul"
                    value={educationForm.schoolId}
                    onChange={(e) =>
                      setEducationForm((prev) => ({
                        ...prev,
                        schoolId: e.target.value,
                      }))
                    }
                    options={[
                      { value: "", label: "Okul Seçiniz", disabled: true },
                      ...schools.map((school) => ({
                        value: school.id?.toString() || "",
                        label: school.name || "Bilinmeyen Okul",
                      })),
                    ]}
                    placeholder="Okul seçiniz"
                    disabled={!educationForm.cityId}
                  />
                </div>
              ))}
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleAddEducation}
              disabled={addingEducation || loading}
              className="min-w-[120px]"
            >
              {addingEducation ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Ekleniyor...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Ekle
                </>
              )}
            </Button>
          </div>

          {/* Current Educations */}
          {user?.educations && user.educations.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Eklenen Eğitimler
              </h3>
              <div className="space-y-3">
                {sortEducationLevels(
                  user.educations.filter((edu) => {
                    if (!edu || typeof edu !== "object") return false;
                    const id = edu.id?.toString();
                    return (
                      id &&
                      id !== "null" &&
                      id !== "undefined" &&
                      id.trim() !== ""
                    );
                  }),
                ).map((edu) => {
                  const id = (edu.id?.toString() || "").trim();
                  const educationTypeName = getEducationTypeName(
                    edu.educationTypeId,
                  );
                  const startYear = edu.startYear
                    ? new Date(edu.startYear).getFullYear()
                    : "-";
                  const endYear = edu.continueStatus
                    ? "Devam Ediyor"
                    : edu.endYear
                      ? new Date(edu.endYear).getFullYear()
                      : "-";
                  const departmentName =
                    edu.department?.name || "Bilinmeyen Bölüm";
                  const schoolName = edu.school?.name || null;
                  // Üniversite ve fakülte bilgileri
                  const universityName =
                    edu.department?.faculity?.university?.name || null;
                  const facultyName = edu.department?.faculity?.name || null;
                  const isRemoving = removingEducationId === id;

                  if (!id) return null;

                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-base font-semibold text-blue-900 dark:text-blue-300">
                            {educationTypeName}
                          </h4>
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                          {schoolName ? (
                            <>
                              <p>
                                <span className="font-medium">Okul:</span>{" "}
                                {schoolName}
                              </p>
                            </>
                          ) : (
                            <>
                              {universityName && (
                                <p>
                                  <span className="font-medium">
                                    Üniversite:
                                  </span>{" "}
                                  {universityName}
                                </p>
                              )}
                              {facultyName && (
                                <p>
                                  <span className="font-medium">Fakülte:</span>{" "}
                                  {facultyName}
                                </p>
                              )}
                              <p>
                                <span className="font-medium">Bölüm:</span>{" "}
                                {departmentName}
                              </p>
                            </>
                          )}
                          <p>
                            <span className="font-medium">Yıl:</span>{" "}
                            {startYear} -{" "}
                            <span
                              className={
                                edu.continueStatus
                                  ? "text-gray-700 dark:text-gray-300"
                                  : ""
                              }
                            >
                              {endYear}
                            </span>
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveEducation(id)}
                        disabled={isRemoving || loading}
                        className="ml-4 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors p-2"
                        aria-label="Eğitimi kaldır"
                      >
                        {isRemoving ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <X className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Henüz eğitim bilgisi eklenmemiş. Yukarıdaki formdan eğitim
                bilgisi ekleyebilirsiniz.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EducationSection;
