import { useState, useMemo, useEffect, useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Select,
  Button,
  Input,
} from "../ui";
import { Briefcase, Plus, X, Loader2, Search } from "lucide-react";
import { showToast } from "../ui/Toast";
import { getProfessionDisplayName } from "../../utils/helpers";
import { useProfessionSearch } from "../../hooks/profile";

/**
 * ProfessionsSection Component
 * Manages user's professions (add/remove with levels)
 *
 * @param {Object} props
 * @param {Object} props.user - User object with professions array
 * @param {Object} props.lookups - Lookup data (professions)
 * @param {Function} props.searchProfessions - Handler for searching professions
 * @param {Function} props.onAddProfession - Handler for adding a profession
 * @param {Function} props.onRemoveProfession - Handler for removing a profession
 * @param {boolean} props.loading - Loading state
 */
const ProfessionsSection = ({
  user,
  lookups,
  missingKeys = [],
  searchProfessions,
  onAddProfession,
  onRemoveProfession,
  loading = false,
}) => {
  const professionsMissing = missingKeys.includes("professions");
  const [professionSearch, setProfessionSearch] = useState("");
  const [selectedProfessionId, setSelectedProfessionId] = useState("");
  const [selectedProfessionName, setSelectedProfessionName] = useState("");
  const [professionLevel, setProfessionLevel] = useState("");
  const [addingProfession, setAddingProfession] = useState(false);
  const [removingProfessionId, setRemovingProfessionId] = useState(null);
  const dropdownRef = useRef(null);

  // Kullanıcının mevcut meslek ID'leri (filtreleme için)
  const userProfessionIds = useMemo(() => {
    return (user?.professions || [])
      .map((p) => {
        if (!p || typeof p !== "object") return null;
        const id = (p.professionId || p.id)?.toString();
        return id && id !== "null" && id !== "undefined" ? id : null;
      })
      .filter((id) => id !== null && id !== "");
  }, [user?.professions]);

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
  } = useProfessionSearch(searchProfessions, professionSearch, {
    excludeIds: userProfessionIds,
  });

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

  // Language level options (1-5) - also used for profession levels
  const levelOptions = [
    { value: "", label: "Seviye", disabled: true },
    { value: "1", label: "1 - Başlangıç" },
    { value: "2", label: "2 - Temel" },
    { value: "3", label: "3 - Orta" },
    { value: "4", label: "4 - İleri" },
    { value: "5", label: "5 - Uzman" },
  ];

  const getProfessionName = (profession, professionId) =>
    getProfessionDisplayName(profession, professionId, lookups?.professions);

  // Helper function to format profession level display
  const getProfessionLevelDisplay = (level) => {
    if (!level && level !== 0) return "-";
    const levelNum = parseInt(level, 10);
    if (Number.isNaN(levelNum)) return level?.toString() || "-";

    const levelMap = {
      1: "1 - Başlangıç",
      2: "2 - Temel",
      3: "3 - Orta",
      4: "4 - İleri",
      5: "5 - Uzman",
    };

    return levelMap[levelNum] || levelNum.toString();
  };

  // Helper to render level as stars (1-5)
  const renderLevelStars = (level) => {
    const levelNumRaw = parseInt(level, 10);
    const levelNum =
      Number.isNaN(levelNumRaw) || levelNumRaw < 0
        ? 0
        : levelNumRaw > 5
          ? 5
          : levelNumRaw;

    return (
      <div className="flex items-center gap-2">
        <div className="flex">
          {Array.from({ length: 5 }).map((_, index) => (
            <span
              key={index}
              className={
                index < levelNum
                  ? "text-orange-400 text-xl leading-none"
                  : "text-gray-300 text-xl leading-none"
              }
            >
              ★
            </span>
          ))}
        </div>
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {getProfessionLevelDisplay(level)}
        </span>
      </div>
    );
  };

  const getProfessionNameFromResult = (profession) =>
    getProfessionDisplayName(profession);

  // Handle profession selection from dropdown (seçim yapılır, dropdown kapanır)
  const handleProfessionSelect = (profession) => {
    const professionId = profession.id?.toString() || "";
    const professionName = getProfessionNameFromResult(profession);

    clearResults();
    setSelectedProfessionId(professionId);
    setSelectedProfessionName(professionName);
    setProfessionSearch(professionName);
  };

  // X ile seçim kaldırılır
  const handleClearSelection = () => {
    setSelectedProfessionId("");
    setSelectedProfessionName("");
    setProfessionSearch("");
    clearResults();
  };

  // Dropdown açıldığında ilk sayfa yükle (search="", page=1)
  const handleInputFocus = () => {
    if (!professionSearch?.trim() && !selectedProfessionId) {
      loadFirstPage();
    }
  };

  const handleAddProfession = async () => {
    if (!selectedProfessionId) {
      showToast({
        type: "error",
        message: "Lütfen bir meslek seçin",
        duration: 3000,
      });
      return;
    }

    if (!professionLevel) {
      showToast({
        type: "error",
        message: "Lütfen bir seviye seçin",
        duration: 3000,
      });
      return;
    }

    // Check if profession is already added
    if (userProfessionIds.includes(selectedProfessionId)) {
      showToast({
        type: "error",
        message: "Bu meslek zaten eklenmiş",
        duration: 3000,
      });
      return;
    }

    setAddingProfession(true);
    const payload = {
      professionId: parseInt(selectedProfessionId, 10),
      level: parseInt(professionLevel, 10),
    };

    const result = await onAddProfession(payload);
    setAddingProfession(false);

    if (result.success) {
      // Reset form completely
      setSelectedProfessionId("");
      setSelectedProfessionName("");
      setProfessionSearch("");
      setProfessionLevel("");
      clearResults();

      showToast({
        type: "success",
        message: "Meslek başarıyla eklendi",
        duration: 3000,
      });
    } else {
      showToast({
        type: "error",
        message: result.error || "Meslek eklenirken bir hata oluştu",
        duration: 3000,
      });
    }
  };

  const handleRemoveProfession = async (professionId) => {
    setRemovingProfessionId(professionId);
    const result = await onRemoveProfession(professionId);
    setRemovingProfessionId(null);

    if (result.success) {
      showToast({
        type: "success",
        message: "Meslek başarıyla kaldırıldı",
        duration: 3000,
      });
    } else {
      showToast({
        type: "error",
        message: result.error || "Meslek kaldırılırken bir hata oluştu",
        duration: 3000,
      });
    }
  };

  return (
    <Card className={`mb-6 ${professionsMissing ? "border-red-400 dark:border-red-500 border-2" : ""}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Meslekler
          {professionsMissing && (
            <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
              En az bir meslek seçilmeli
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Add Profession */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative" ref={dropdownRef}>
              <Input
                label="Meslek Seçiniz"
                type="text"
                value={professionSearch}
                onChange={(e) => {
                  const value = e.target.value;
                  setProfessionSearch(value);

                  if (
                    selectedProfessionId &&
                    value !== selectedProfessionName
                  ) {
                    setSelectedProfessionId("");
                    setSelectedProfessionName("");
                  }

                  if (!value || value.trim() === "") {
                    setSelectedProfessionId("");
                    setSelectedProfessionName("");
                  }
                }}
                placeholder="Meslek ara... (örn: Yazılım)"
                disabled={loading || addingProfession}
                leftIcon={<Search className="w-4 h-4" />}
                rightIcon={
                  selectedProfessionId ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearSelection();
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
                onFocus={handleInputFocus}
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
                          getProfessionNameFromResult(profession);

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
            <div className="flex-1">
              <Select
                label="Seviye"
                value={professionLevel}
                onChange={(e) => setProfessionLevel(e.target.value)}
                options={levelOptions}
                placeholder="Seviye seçiniz"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleAddProfession}
                disabled={
                  addingProfession ||
                  !selectedProfessionId ||
                  !professionLevel ||
                  loading
                }
                className="min-w-[120px]"
              >
                {addingProfession ? (
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

          {/* Current Professions */}
          {user?.professions && user.professions.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Eklenen Meslekler
              </h3>
              <div className="space-y-3">
                {user.professions
                  .filter((profession) => {
                    if (!profession || typeof profession !== "object")
                      return false;
                    // Use the user profession record id for filtering
                    const id = profession.id?.toString();
                    return (
                      id &&
                      id !== "null" &&
                      id !== "undefined" &&
                      id.trim() !== ""
                    );
                  })
                  .map((profession) => {
                    // Use the user profession record id for the key and removal
                    const id = (profession.id?.toString() || "").trim();
                    // Use professionId (the actual profession ID) for name lookup
                    const professionId =
                      profession.professionId?.toString() ||
                      profession.id?.toString();
                    const name = getProfessionName(profession, professionId);
                    const level = profession.level || "-";
                    const levelDisplay = getProfessionLevelDisplay(level);
                    const isRemoving = removingProfessionId === id;

                    if (!id) return null;

                    // Ensure name is always a string
                    const displayName =
                      typeof name === "string" ? name : "Bilinmeyen Meslek";

                    return (
                      <div
                        key={id}
                        className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg"
                      >
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="text-base font-semibold text-blue-900 dark:text-blue-300">
                              {displayName}
                            </h4>
                          </div>
                          <div className="text-sm text-gray-700 dark:text-gray-300">
                            <span className="mr-1">Seviye:</span>
                            {renderLevelStars(level)}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveProfession(id)}
                          disabled={isRemoving || loading}
                          className="ml-4 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors p-2"
                          aria-label={`${displayName} mesleğini kaldır`}
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
                Henüz meslek eklenmemiş. Yukarıdaki formdan meslek
                ekleyebilirsiniz.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfessionsSection;
