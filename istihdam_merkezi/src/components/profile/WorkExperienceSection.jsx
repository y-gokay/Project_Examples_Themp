import { useState, useEffect, useRef } from "react";
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
import { Briefcase, Plus, X, Loader2, Search } from "lucide-react";
import { showToast } from "../ui/Toast";
import { getProfessionDisplayName } from "../../utils/helpers";
import { useProfessionSearch } from "../../hooks/profile";

/**
 * WorkExperienceSection Component
 * Manages user's work experience information
 *
 * @param {Object} props
 * @param {Object} props.user - User object with workExperiences array
 * @param {Object} props.lookups - Lookup data (professions, workingMethods)
 * @param {Function} props.searchProfessions - Handler for searching professions
 * @param {Function} props.onAddWorkExperience - Handler for adding work experience
 * @param {Function} props.onRemoveWorkExperience - Handler for removing work experience
 * @param {boolean} props.loading - Loading state
 */
const WorkExperienceSection = ({
  user,
  lookups,
  searchProfessions,
  onAddWorkExperience,
  onRemoveWorkExperience,
  loading = false,
}) => {
  const [workExperienceForm, setWorkExperienceForm] = useState({
    companyName: "",
    professionId: "",
    workingMethodId: "",
    startDate: "",
    endDate: "",
    description: "",
    isContinuing: false,
  });
  const [professionSearch, setProfessionSearch] = useState("");
  const [selectedProfessionName, setSelectedProfessionName] = useState("");
  const [addingWorkExperience, setAddingWorkExperience] = useState(false);
  const [removingWorkExperienceId, setRemovingWorkExperienceId] =
    useState(null);
  const dropdownRef = useRef(null);

  const {
    searchResults,
    searchingProfessions,
    loadingMore,
    hasMore,
    showDropdown,
    setShowDropdown,
    clearResults,
    loadFirstPage,
    loadMore,
  } = useProfessionSearch(searchProfessions, professionSearch);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowDropdown]);

  // Handle profession selection from dropdown (seçim yapılır, dropdown kapanır)
  const handleProfessionSelect = (profession) => {
    const professionId = profession.id?.toString() || "";
    const professionName = getProfessionDisplayName(profession);

    clearResults();
    setWorkExperienceForm((prev) => ({
      ...prev,
      professionId: professionId,
    }));
    setSelectedProfessionName(professionName);
    setProfessionSearch(professionName);
  };

  // X ile seçim kaldırılır
  const handleClearProfessionSelection = () => {
    setWorkExperienceForm((prev) => ({ ...prev, professionId: "" }));
    setSelectedProfessionName("");
    setProfessionSearch("");
    clearResults();
  };

  // Dropdown açıldığında ilk sayfa yükle (search="", page=1)
  const handleProfessionInputFocus = () => {
    if (!professionSearch?.trim() && !workExperienceForm.professionId) {
      loadFirstPage();
    }
  };

  const getProfessionName = (exp) =>
    getProfessionDisplayName(exp, exp?.professionId, lookups?.professions);

  const handleAddWorkExperience = async () => {
    if (!workExperienceForm.companyName) {
      showToast({
        type: "error",
        message: "Lütfen şirket adı girin",
        duration: 3000,
      });
      return;
    }

    if (!workExperienceForm.professionId) {
      showToast({
        type: "error",
        message: "Lütfen meslek seçin",
        duration: 3000,
      });
      return;
    }

    if (!workExperienceForm.workingMethodId) {
      showToast({
        type: "error",
        message: "Lütfen çalışma yöntemi seçin",
        duration: 3000,
      });
      return;
    }

    if (!workExperienceForm.startDate) {
      showToast({
        type: "error",
        message: "Lütfen başlangıç tarihi girin",
        duration: 3000,
      });
      return;
    }

    if (!workExperienceForm.isContinuing && !workExperienceForm.endDate) {
      showToast({
        type: "error",
        message:
          "Lütfen bitiş tarihi girin veya devam ediyor seçeneğini işaretleyin",
        duration: 3000,
      });
      return;
    }

    // Tarih tutarlılığı kontrolü: başlangıç tarihi bitiş tarihinden sonra olamaz
    if (
      workExperienceForm.startDate &&
      !workExperienceForm.isContinuing &&
      workExperienceForm.endDate
    ) {
      const start = new Date(workExperienceForm.startDate);
      const end = new Date(workExperienceForm.endDate);

      if (start > end) {
        showToast({
          type: "error",
          message: "Başlangıç tarihi, bitiş tarihinden sonra olamaz",
          duration: 3000,
        });
        return;
      }
    }

    setAddingWorkExperience(true);

    const payload = {
      companyName: workExperienceForm.companyName,
      professionId: parseInt(workExperienceForm.professionId, 10),
      workingMethodId: parseInt(workExperienceForm.workingMethodId, 10),
      startDate: workExperienceForm.startDate,
      endDate: workExperienceForm.isContinuing
        ? null
        : workExperienceForm.endDate,
      description: workExperienceForm.description || "",
      isContinuing: workExperienceForm.isContinuing,
    };

    const result = await onAddWorkExperience(payload);
    setAddingWorkExperience(false);

    if (result.success) {
      showToast({
        type: "success",
        message: "İş deneyimi başarıyla eklendi",
        duration: 3000,
      });
      // Reset form
      setWorkExperienceForm({
        companyName: "",
        professionId: "",
        workingMethodId: "",
        startDate: "",
        endDate: "",
        description: "",
        isContinuing: false,
      });
      setProfessionSearch("");
      setSelectedProfessionName("");
      setSearchResults([]);
      setShowDropdown(false);
    } else {
      showToast({
        type: "error",
        message: result.error || "İş deneyimi eklenirken bir hata oluştu",
        duration: 3000,
      });
    }
  };

  const handleRemoveWorkExperience = async (workExperienceId) => {
    setRemovingWorkExperienceId(workExperienceId);
    const result = await onRemoveWorkExperience(workExperienceId);
    setRemovingWorkExperienceId(null);

    if (result.success) {
      showToast({
        type: "success",
        message: "İş deneyimi başarıyla kaldırıldı",
        duration: 3000,
      });
    } else {
      showToast({
        type: "error",
        message: result.error || "İş deneyimi kaldırılırken bir hata oluştu",
        duration: 3000,
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          İş Deneyimi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Add Work Experience Form */}
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Şirket Adı"
                value={workExperienceForm.companyName}
                onChange={(e) =>
                  setWorkExperienceForm((prev) => ({
                    ...prev,
                    companyName: e.target.value,
                  }))
                }
                placeholder="Şirket adını girin"
              />
              <div className="relative" ref={dropdownRef}>
                <Input
                  label="Meslek"
                  type="text"
                  value={professionSearch}
                  onChange={(e) => {
                    const value = e.target.value;
                    setProfessionSearch(value);

                    if (
                      workExperienceForm.professionId &&
                      value !== selectedProfessionName
                    ) {
                      setWorkExperienceForm((prev) => ({
                        ...prev,
                        professionId: "",
                      }));
                      setSelectedProfessionName("");
                    }

                    if (!value || value.trim() === "") {
                      setWorkExperienceForm((prev) => ({
                        ...prev,
                        professionId: "",
                      }));
                      setSelectedProfessionName("");
                    }
                  }}
                  placeholder="Meslek ara... (örn: Yazılım)"
                  disabled={loading || addingWorkExperience}
                  leftIcon={<Search className="w-4 h-4" />}
                  rightIcon={
                    workExperienceForm.professionId ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearProfessionSelection();
                        }}
                        className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                        aria-label="Seçimi temizle"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    ) : searchingProfessions ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : undefined
                  }
                  onFocus={handleProfessionInputFocus}
                />

                {/* Dropdown */}
                {showDropdown && (
                  <div
                    className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto"
                    onScroll={(e) => {
                      const el = e.target;
                      if (
                        hasMore &&
                        !loadingMore &&
                        !searchingProfessions &&
                        el.scrollTop + el.clientHeight >= el.scrollHeight - 20
                      ) {
                        loadMore();
                      }
                    }}
                  >
                    {searchingProfessions ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                        <p className="text-sm">Aranıyor...</p>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="py-1">
                        {searchResults.map((profession) => {
                          const professionId = profession.id?.toString() || "";
                          const professionName =
                            getProfessionDisplayName(profession);

                          return (
                            <button
                              key={professionId}
                              type="button"
                              onClick={() => handleProfessionSelect(profession)}
                              className="w-full text-left px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 focus:bg-blue-50 dark:focus:bg-blue-900/30 focus:outline-none transition-colors"
                            >
                              <span className="text-sm text-gray-900 dark:text-gray-100">
                                {professionName}
                              </span>
                            </button>
                          );
                        })}
                        {hasMore && (
                          <div className="border-t border-gray-200 dark:border-gray-600 p-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={loadMore}
                              disabled={loadingMore}
                            >
                              {loadingMore ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                  Yükleniyor...
                                </>
                              ) : (
                                "Daha fazla yükle"
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : !searchingProfessions ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        <p className="text-sm">
                          {professionSearch?.trim()
                            ? "Sonuç bulunamadı"
                            : "Meslek ara veya listeden seçin"}
                        </p>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Çalışma Yöntemi"
                value={workExperienceForm.workingMethodId}
                onChange={(e) =>
                  setWorkExperienceForm((prev) => ({
                    ...prev,
                    workingMethodId: e.target.value,
                  }))
                }
                options={[
                  {
                    value: "",
                    label: "Çalışma Yöntemi Seçiniz",
                    disabled: true,
                  },
                  ...(lookups.workingMethods || [])
                    .filter((method) => method && method.id)
                    .map((method) => ({
                      value: method.id?.toString() || "",
                      label: method.title || "Bilinmeyen Yöntem",
                    })),
                ]}
                placeholder="Çalışma yöntemi seçiniz"
              />
              <Input
                label="Açıklama"
                value={workExperienceForm.description}
                onChange={(e) =>
                  setWorkExperienceForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="İş açıklaması (opsiyonel)"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Başlangıç Tarihi"
                type="date"
                value={workExperienceForm.startDate}
                onChange={(e) =>
                  setWorkExperienceForm((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                max={new Date().toISOString().split("T")[0]}
              />
              <Input
                label="Bitiş Tarihi"
                type="date"
                value={workExperienceForm.endDate}
                onChange={(e) =>
                  setWorkExperienceForm((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
                disabled={workExperienceForm.isContinuing}
                max={new Date().toISOString().split("T")[0]}
                min={workExperienceForm.startDate || undefined}
              />
              <div className="flex items-end">
                <Checkbox
                  label="Devam Ediyor"
                  checked={workExperienceForm.isContinuing}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setWorkExperienceForm((prev) => ({
                      ...prev,
                      isContinuing: checked,
                      endDate: checked ? "" : prev.endDate,
                    }));
                  }}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleAddWorkExperience}
                disabled={
                  addingWorkExperience ||
                  !workExperienceForm.companyName ||
                  !workExperienceForm.professionId ||
                  !workExperienceForm.workingMethodId ||
                  !workExperienceForm.startDate ||
                  (!workExperienceForm.isContinuing &&
                    !workExperienceForm.endDate) ||
                  loading
                }
                className="min-w-[120px]"
              >
                {addingWorkExperience ? (
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
          </div>

          {/* Current Work Experiences */}
          {user?.workExperiences && user.workExperiences.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Eklenen İş Deneyimleri
              </h3>
              <div className="space-y-3">
                {user.workExperiences
                  .filter((exp) => exp && exp.id)
                  .map((exp) => {
                    const id = exp.id?.toString() || "";
                    const professionName = getProfessionName(exp);
                    const workingMethodName =
                      exp.workingMethod?.title || "Bilinmeyen";
                    const isRemoving = removingWorkExperienceId === id;

                    const startDate = exp.startDate
                      ? new Date(exp.startDate).toLocaleDateString("tr-TR")
                      : "-";
                    const endDate = exp.isContinuing
                      ? "Devam Ediyor"
                      : exp.endDate
                        ? new Date(exp.endDate).toLocaleDateString("tr-TR")
                        : "-";

                    return (
                      <div
                        key={id}
                        className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {exp.companyName || "Bilinmeyen Şirket"}
                          </div>
                          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1 mt-1">
                            <p>
                              <span className="font-medium">Meslek:</span>{" "}
                              {professionName}
                            </p>
                            <p>
                              <span className="font-medium">
                                Çalışma Yöntemi:
                              </span>{" "}
                              {workingMethodName}
                            </p>
                            <p>
                              <span className="font-medium">Tarih:</span>{" "}
                              {startDate} -{" "}
                              <span
                                className={
                                  exp.isContinuing
                                    ? "text-gray-700 dark:text-gray-300"
                                    : ""
                                }
                              >
                                {endDate}
                              </span>
                            </p>
                            {exp.description && (
                              <p>
                                <span className="font-medium">Açıklama:</span>{" "}
                                {exp.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveWorkExperience(id)}
                          disabled={isRemoving || loading}
                          className="ml-4 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors p-2"
                          aria-label="İş deneyimini kaldır"
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
                Henüz iş deneyimi eklenmemiş. Yukarıdaki formdan iş deneyimi
                ekleyebilirsiniz.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkExperienceSection;
