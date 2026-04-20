import { useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Select,
  Button,
} from "../ui";
import { Building2, Plus, X, Loader2 } from "lucide-react";
import { showToast } from "../ui/Toast";

/**
 * SectorsSection Component
 * Manages user's business sectors (add/remove)
 *
 * @param {Object} props
 * @param {Object} props.user - User object with sectors array
 * @param {Object} props.lookups - Lookup data (sectors)
 * @param {Function} props.onAddSector - Handler for adding a sector
 * @param {Function} props.onRemoveSector - Handler for removing a sector
 * @param {boolean} props.loading - Loading state
 */
const SectorsSection = ({
  user,
  lookups,
  missingKeys = [],
  onAddSector,
  onRemoveSector,
  loading = false,
}) => {
  const sectorsMissing = missingKeys.includes("sectors");
  const [selectedSectorId, setSelectedSectorId] = useState("");
  const [addingSector, setAddingSector] = useState(false);
  const [removingSectorId, setRemovingSectorId] = useState(null);

  // Get user's current sector IDs - memoize to prevent stale state issues
  const userSectorIds = useMemo(() => {
    return (user?.sectors || [])
      .map((s) => {
        if (!s || typeof s !== "object") return null;
        const id = s.id?.toString() || s.sectorId?.toString();
        return id && id !== "null" && id !== "undefined" ? id : null;
      })
      .filter((id) => id !== null && id !== "");
  }, [user?.sectors]);

  // Get available sectors (not already added) - memoize to prevent stale state issues
  const availableSectors = useMemo(() => {
    return (lookups?.sectors || []).filter(
      (sector) => !userSectorIds.includes(sector.id?.toString()),
    );
  }, [lookups?.sectors, userSectorIds]);

  const sectorOptions = useMemo(() => {
    return [
      { value: "", label: "Sektör Seçiniz", disabled: true },
      ...availableSectors.map((sector) => ({
        value: sector.id?.toString() || "",
        label:
          sector.sector || sector.title || sector.name || "Bilinmeyen Sektör",
      })),
    ];
  }, [availableSectors]);

  const getSectorName = (sector, sectorId) => {
    // sector.sector bir string olmalı, obje değil
    if (sector && typeof sector === "object") {
      if (typeof sector.sector === "string") {
        return sector.sector;
      }
      if (sector.sectorRef && typeof sector.sectorRef.sector === "string") {
        return sector.sectorRef.sector;
      }
      // Eğer sector.sector bir obje ise, title veya name alanını kontrol et
      if (sector.sector && typeof sector.sector === "object") {
        return (
          sector.sector.title ||
          sector.sector.name ||
          sector.sector.sector ||
          "Bilinmeyen Sektör"
        );
      }
    }
    if (sectorId && lookups?.sectors) {
      const found = lookups.sectors.find(
        (s) => s.id?.toString() === sectorId?.toString(),
      );
      if (found) {
        if (typeof found.sector === "string") {
          return found.sector;
        }
        if (found.sector && typeof found.sector === "object") {
          return (
            found.sector.title ||
            found.sector.name ||
            found.sector.sector ||
            "Bilinmeyen Sektör"
          );
        }
        return found.title || found.name || "Bilinmeyen Sektör";
      }
    }
    return "Bilinmeyen Sektör";
  };

  const handleAddSector = async () => {
    if (!selectedSectorId) {
      showToast({
        type: "error",
        message: "Lütfen bir sektör seçin",
        duration: 3000,
      });
      return;
    }

    // Check if sector is already added (use current user state)
    const currentSectorIds = (user?.sectors || [])
      .map((s) => {
        if (!s || typeof s !== "object") return null;
        const id = s.id?.toString() || s.sectorId?.toString();
        return id && id !== "null" && id !== "undefined" ? id : null;
      })
      .filter((id) => id !== null && id !== "");

    if (currentSectorIds.includes(selectedSectorId)) {
      showToast({
        type: "error",
        message: "Bu sektör zaten eklenmiş",
        duration: 3000,
      });
      return;
    }

    setAddingSector(true);
    // Clear selection immediately to prevent duplicate clicks
    const sectorIdToAdd = selectedSectorId;
    setSelectedSectorId("");

    const result = await onAddSector(sectorIdToAdd);
    setAddingSector(false);

    if (result.success) {
      showToast({
        type: "success",
        message: "Sektör başarıyla eklendi",
        duration: 3000,
      });
    } else {
      // Restore selection on error
      setSelectedSectorId(sectorIdToAdd);
      showToast({
        type: "error",
        message: result.error || "Sektör eklenirken bir hata oluştu",
        duration: 3000,
      });
    }
  };

  const handleRemoveSector = async (sectorId) => {
    setRemovingSectorId(sectorId);
    const result = await onRemoveSector(sectorId);
    setRemovingSectorId(null);

    if (result.success) {
      showToast({
        type: "success",
        message: "Sektör başarıyla kaldırıldı",
        duration: 3000,
      });
    } else {
      showToast({
        type: "error",
        message: result.error || "Sektör kaldırılırken bir hata oluştu",
        duration: 3000,
      });
    }
  };

  return (
    <Card className={`mb-6 shadow-sm ${sectorsMissing ? "border-red-400 dark:border-red-500 border-2" : ""}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          İş Sektörleri
          {sectorsMissing && (
            <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
              En az bir sektör seçilmeli
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Add Sector Form */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Select
                label="Sektör Ekle"
                value={selectedSectorId}
                onChange={(e) => setSelectedSectorId(e.target.value)}
                options={sectorOptions}
                placeholder="Sektör seçiniz"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleAddSector}
                disabled={addingSector || !selectedSectorId || loading}
                className="min-w-[120px]"
              >
                {addingSector ? (
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

          {/* Current Sectors */}
          {user?.sectors && user.sectors.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Eklenen Sektörler
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.sectors
                  .filter((sector) => {
                    if (!sector || typeof sector !== "object") return false;
                    const id =
                      sector.id?.toString() || sector.sectorId?.toString();
                    return (
                      id &&
                      id !== "null" &&
                      id !== "undefined" &&
                      id.trim() !== ""
                    );
                  })
                  .map((sector) => {
                    const sectorId = (
                      sector.id?.toString() ||
                      sector.sectorId?.toString() ||
                      ""
                    ).trim();
                    let sectorName = getSectorName(sector, sectorId);
                    // Güvenlik kontrolü: Her zaman string olduğundan emin ol
                    if (typeof sectorName !== "string") {
                      sectorName = String(sectorName || "Bilinmeyen Sektör");
                    }
                    const isRemoving = removingSectorId === sectorId;

                    if (!sectorId || sectorId === "") return null;

                    return (
                      <div
                        key={sectorId}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg text-sm"
                      >
                        <span className="text-blue-900 dark:text-blue-300 font-medium">
                          {sectorName}
                        </span>
                        <button
                          onClick={() => handleRemoveSector(sectorId)}
                          disabled={isRemoving || loading}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          aria-label={`${sectorName} sektörünü kaldır`}
                        >
                          {isRemoving ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <X className="w-3.5 h-3.5" />
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
                Henüz sektör eklenmemiş. Yukarıdaki menüden sektör
                ekleyebilirsiniz.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SectorsSection;
