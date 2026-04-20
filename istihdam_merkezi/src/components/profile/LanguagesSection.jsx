import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Select,
  Button,
} from "../ui";
import { Languages, Plus, X, Loader2 } from "lucide-react";
import { showToast } from "../ui/Toast";

/**
 * LanguagesSection Component
 * Manages user's language skills (add/remove with levels)
 *
 * @param {Object} props
 * @param {Object} props.user - User object with languages array
 * @param {Object} props.lookups - Lookup data (languages)
 * @param {Function} props.onAddLanguage - Handler for adding a language
 * @param {Function} props.onRemoveLanguage - Handler for removing a language
 * @param {boolean} props.loading - Loading state
 */
const LanguagesSection = ({
  user,
  lookups,
  onAddLanguage,
  onRemoveLanguage,
  loading = false,
}) => {
  const [selectedLanguageId, setSelectedLanguageId] = useState("");
  const [languageLevels, setLanguageLevels] = useState({
    readingLevel: "",
    writingLevel: "",
    listeningLevel: "",
    speakingLevel: "",
  });
  const [addingLanguage, setAddingLanguage] = useState(false);
  const [removingLanguageId, setRemovingLanguageId] = useState(null);

  // Get user's current language IDs
  const userLanguageIds = (user?.languages || [])
    .map((l) => {
      if (!l || typeof l !== "object") return null;
      const id = l.languageId?.toString() || l.id?.toString();
      return id && id !== "null" && id !== "undefined" ? id : null;
    })
    .filter((id) => id !== null && id !== "");

  // Get available languages (not already added)
  const availableLanguages = (lookups?.languages || []).filter(
    (language) => !userLanguageIds.includes(language.id?.toString())
  );

  const availableLanguageOptions = [
    { value: "", label: "Dil Seçiniz", disabled: true },
    ...availableLanguages.map((language) => ({
      value: language.id?.toString() || "",
      label: language.name || "Bilinmeyen Dil",
    })),
  ].filter((option) => option.value !== "" && option.label !== "");

  // Language level options (1-5)
  const levelOptions = [
    { value: "", label: "Seviye", disabled: true },
    { value: "1", label: "1 - Başlangıç" },
    { value: "2", label: "2 - Temel" },
    { value: "3", label: "3 - Orta" },
    { value: "4", label: "4 - İleri" },
    { value: "5", label: "5 - Uzman" },
  ];

  const getLanguageName = (language, languageId) => {
    // If language is an object with name property
    if (language && typeof language === "object" && language.name) {
      return language.name;
    }

    // If we have languageId, try to find it in lookups
    if (languageId && lookups?.languages) {
      const found = lookups.languages.find(
        (l) => l.id?.toString() === languageId?.toString()
      );
      if (found && found.name) {
        return found.name;
      }
    }

    return "Bilinmeyen Dil";
  };

  const handleAddLanguage = async () => {
    if (!selectedLanguageId) {
      showToast({
        type: "error",
        message: "Lütfen bir dil seçin",
        duration: 3000,
      });
      return;
    }

    if (
      !languageLevels.readingLevel ||
      !languageLevels.writingLevel ||
      !languageLevels.listeningLevel ||
      !languageLevels.speakingLevel
    ) {
      showToast({
        type: "error",
        message: "Lütfen tüm seviyeleri seçin",
        duration: 3000,
      });
      return;
    }

    // Check if language is already added
    if (userLanguageIds.includes(selectedLanguageId)) {
      showToast({
        type: "error",
        message: "Bu dil zaten eklenmiş",
        duration: 3000,
      });
      return;
    }

    setAddingLanguage(true);
    const payload = {
      languageId: parseInt(selectedLanguageId, 10),
      readingLevel: parseInt(languageLevels.readingLevel, 10),
      writingLevel: parseInt(languageLevels.writingLevel, 10),
      listeningLevel: parseInt(languageLevels.listeningLevel, 10),
      speakingLevel: parseInt(languageLevels.speakingLevel, 10),
    };

    const result = await onAddLanguage(payload);
    setAddingLanguage(false);
    setSelectedLanguageId("");
    setLanguageLevels({
      readingLevel: "",
      writingLevel: "",
      listeningLevel: "",
      speakingLevel: "",
    });

    if (result.success) {
      showToast({
        type: "success",
        message: "Dil başarıyla eklendi",
        duration: 3000,
      });
    } else {
      showToast({
        type: "error",
        message: result.error || "Dil eklenirken bir hata oluştu",
        duration: 3000,
      });
    }
  };

  const handleRemoveLanguage = async (languageId) => {
    setRemovingLanguageId(languageId);
    const result = await onRemoveLanguage(languageId);
    setRemovingLanguageId(null);

    if (result.success) {
      showToast({
        type: "success",
        message: "Dil başarıyla kaldırıldı",
        duration: 3000,
      });
    } else {
      showToast({
        type: "error",
        message: result.error || "Dil kaldırılırken bir hata oluştu",
        duration: 3000,
      });
    }
  };

  return (
    <Card className="mb-6 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Languages className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Yabancı Diller
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Add Language Form */}
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <Select
              label="Dil Seçiniz"
              value={selectedLanguageId}
              onChange={(e) => setSelectedLanguageId(e.target.value)}
              options={availableLanguageOptions}
              placeholder="Dil seçiniz"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Select
                label="Okuma"
                value={languageLevels.readingLevel}
                onChange={(e) =>
                  setLanguageLevels((prev) => ({
                    ...prev,
                    readingLevel: e.target.value,
                  }))
                }
                options={levelOptions}
              />
              <Select
                label="Yazma"
                value={languageLevels.writingLevel}
                onChange={(e) =>
                  setLanguageLevels((prev) => ({
                    ...prev,
                    writingLevel: e.target.value,
                  }))
                }
                options={levelOptions}
              />
              <Select
                label="Dinleme"
                value={languageLevels.listeningLevel}
                onChange={(e) =>
                  setLanguageLevels((prev) => ({
                    ...prev,
                    listeningLevel: e.target.value,
                  }))
                }
                options={levelOptions}
              />
              <Select
                label="Konuşma"
                value={languageLevels.speakingLevel}
                onChange={(e) =>
                  setLanguageLevels((prev) => ({
                    ...prev,
                    speakingLevel: e.target.value,
                  }))
                }
                options={levelOptions}
              />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleAddLanguage}
                disabled={
                  addingLanguage ||
                  !selectedLanguageId ||
                  !languageLevels.readingLevel ||
                  !languageLevels.writingLevel ||
                  !languageLevels.listeningLevel ||
                  !languageLevels.speakingLevel ||
                  loading
                }
                className="min-w-[120px]"
              >
                {addingLanguage ? (
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

          {/* Current Languages */}
          {user?.languages && user.languages.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Eklenen Diller
              </h3>
              <div className="space-y-3">
                {user.languages
                  .filter((language) => {
                    if (!language || typeof language !== "object") return false;
                    const id =
                      language.languageId?.toString() ||
                      language.id?.toString();
                    return (
                      id &&
                      id !== "null" &&
                      id !== "undefined" &&
                      id.trim() !== ""
                    );
                  })
                  .map((language) => {
                    const languageId = (
                      language.languageId?.toString() ||
                      language.id?.toString() ||
                      ""
                    ).trim();
                    const languageName = getLanguageName(language, languageId);
                    const isRemoving = removingLanguageId === languageId;

                    if (!languageId || languageId === "") return null;

                    const levels = {
                      reading: language.readingLevel || 0,
                      writing: language.writingLevel || 0,
                      listening: language.listeningLevel || 0,
                      speaking: language.speakingLevel || 0,
                    };

                    return (
                      <div
                        key={languageId}
                        className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-base font-semibold text-blue-900 dark:text-blue-300">
                              {languageName}
                            </h4>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Okuma: </span>
                              <span className="font-medium text-blue-700 dark:text-blue-400">
                                {levels.reading}/5
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Yazma: </span>
                              <span className="font-medium text-blue-700 dark:text-blue-400">
                                {levels.writing}/5
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Dinleme: </span>
                              <span className="font-medium text-blue-700 dark:text-blue-400">
                                {levels.listening}/5
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Konuşma: </span>
                              <span className="font-medium text-blue-700 dark:text-blue-400">
                                {levels.speaking}/5
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveLanguage(languageId)}
                          disabled={isRemoving || loading}
                          className="ml-4 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors p-2"
                          aria-label={`${languageName} dilini kaldır`}
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
                Henüz dil eklenmemiş. Yukarıdaki formdan dil ekleyebilirsiniz.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LanguagesSection;
