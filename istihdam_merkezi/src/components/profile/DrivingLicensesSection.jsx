import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Select,
  Button,
} from "../ui";
import { Car, Plus, X, Loader2 } from "lucide-react";
import { showToast } from "../ui/Toast";

/**
 * DrivingLicensesSection Component
 * Manages user's driving license types (add/remove)
 *
 * @param {Object} props
 * @param {Object} props.user - User object with drivingLisences array
 * @param {Object} props.lookups - Lookup data (drivingLicenseTypes)
 * @param {Function} props.onAddDrivingLicense - Handler for adding a driving license
 * @param {Function} props.onRemoveDrivingLicense - Handler for removing a driving license
 * @param {boolean} props.loading - Loading state
 */
const DrivingLicensesSection = ({
  user,
  lookups,
  onAddDrivingLicense,
  onRemoveDrivingLicense,
  loading = false,
}) => {
  const [selectedDrivingLicenseTypeId, setSelectedDrivingLicenseTypeId] =
    useState("");
  const [addingDrivingLicense, setAddingDrivingLicense] = useState(false);
  const [removingDrivingLicenseTypeId, setRemovingDrivingLicenseTypeId] =
    useState(null);

  // Get user's current driving license type IDs
  const userLicenseTypeIds = (user?.drivingLisences || []).map(
    (l) =>
      l.drivingListenceTypeId?.toString() ||
      l.drivingLicenseTypeId?.toString() ||
      l.id?.toString()
  );

  // Get available driving license types (not already added)
  const availableDrivingLicenseTypes = (
    lookups?.drivingLicenseTypes || []
  ).filter(
    (licenseType) => !userLicenseTypeIds.includes(licenseType.id?.toString())
  );

  const availableDrivingLicenseTypeOptions = [
    { value: "", label: "Ehliyet Sınıfı Seçiniz", disabled: true },
    ...availableDrivingLicenseTypes.map((licenseType) => {
      const licenseTypeId = licenseType.id?.toString() || "";
      const licenseTypeTitle =
        licenseType.title || licenseType.name || "Bilinmeyen Ehliyet";

      return {
        value: licenseTypeId,
        label: licenseTypeTitle,
      };
    }),
  ].filter((option) => option.value !== "" && option.label !== "");

  const getDrivingLicenseTypeName = (license, licenseTypeId) => {
    if (license && typeof license === "object" && license.drivingLicenseType) {
      return (
        license.drivingLicenseType.title || license.drivingLicenseType.name
      );
    }
    if (license && typeof license === "object" && license.drivingLisenceType) {
      return (
        license.drivingLisenceType.title || license.drivingLisenceType.name
      );
    }
    if (licenseTypeId && lookups?.drivingLicenseTypes) {
      const found = lookups.drivingLicenseTypes.find(
        (lt) => lt.id?.toString() === licenseTypeId?.toString()
      );
      if (found && found.title) {
        return found.title;
      }
    }
    return "Bilinmeyen Ehliyet";
  };

  const handleAddDrivingLicense = async () => {
    if (!selectedDrivingLicenseTypeId) {
      showToast({
        type: "error",
        message: "Lütfen bir ehliyet sınıfı seçin",
        duration: 3000,
      });
      return;
    }

    // Check if license is already added
    if (userLicenseTypeIds.includes(selectedDrivingLicenseTypeId)) {
      showToast({
        type: "error",
        message: "Bu ehliyet sınıfı zaten eklenmiş",
        duration: 3000,
      });
      return;
    }

    setAddingDrivingLicense(true);
    const result = await onAddDrivingLicense(
      parseInt(selectedDrivingLicenseTypeId)
    );
    setAddingDrivingLicense(false);
    setSelectedDrivingLicenseTypeId("");

    if (result.success) {
      showToast({
        type: "success",
        message: "Ehliyet sınıfı başarıyla eklendi",
        duration: 3000,
      });
    } else {
      showToast({
        type: "error",
        message: result.error || "Ehliyet sınıfı eklenirken bir hata oluştu",
        duration: 3000,
      });
    }
  };

  const handleRemoveDrivingLicense = async (licenseTypeId) => {
    setRemovingDrivingLicenseTypeId(licenseTypeId);
    const result = await onRemoveDrivingLicense(licenseTypeId);
    setRemovingDrivingLicenseTypeId(null);

    if (result.success) {
      showToast({
        type: "success",
        message: "Ehliyet sınıfı başarıyla kaldırıldı",
        duration: 3000,
      });
    } else {
      showToast({
        type: "error",
        message: result.error || "Ehliyet sınıfı kaldırılırken bir hata oluştu",
        duration: 3000,
      });
    }
  };

  return (
    <Card className="mb-6 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Ehliyet Sınıfları
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Add Driving License */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Select
                label="Ehliyet Sınıfı Ekle"
                value={selectedDrivingLicenseTypeId}
                onChange={(e) =>
                  setSelectedDrivingLicenseTypeId(e.target.value)
                }
                options={availableDrivingLicenseTypeOptions}
                placeholder="Ehliyet sınıfı seçiniz"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleAddDrivingLicense}
                disabled={
                  addingDrivingLicense ||
                  !selectedDrivingLicenseTypeId ||
                  loading
                }
                className="min-w-[120px]"
              >
                {addingDrivingLicense ? (
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

          {/* Current Driving Licenses */}
          {user?.drivingLisences && user.drivingLisences.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Eklenen Ehliyet Sınıfları
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.drivingLisences
                  .filter((license) => {
                    if (!license || typeof license !== "object") return false;
                    const id =
                      license.drivingListenceTypeId?.toString() ||
                      license.drivingLicenseTypeId?.toString() ||
                      license.id?.toString();
                    return (
                      id &&
                      id !== "null" &&
                      id !== "undefined" &&
                      id.trim() !== ""
                    );
                  })
                  .map((license) => {
                    const relationId = license.id?.toString();
                    const licenseTypeId = (
                      license.drivingListenceTypeId?.toString() ||
                      license.drivingLicenseTypeId?.toString() ||
                      relationId ||
                      ""
                    ).trim();
                    const licenseTypeName = getDrivingLicenseTypeName(
                      license,
                      licenseTypeId
                    );
                    const idToRemove = relationId || licenseTypeId;
                    const isRemoving =
                      removingDrivingLicenseTypeId === idToRemove;

                    if (!licenseTypeId || licenseTypeId === "") return null;

                    return (
                      <div
                        key={licenseTypeId}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg text-sm"
                      >
                        <span className="text-blue-900 dark:text-blue-300 font-medium">
                          {licenseTypeName}
                        </span>
                        <button
                          onClick={() =>
                            handleRemoveDrivingLicense(idToRemove)
                          }
                          disabled={isRemoving || loading}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          aria-label={`${licenseTypeName} ehliyet sınıfını kaldır`}
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
                Henüz ehliyet sınıfı eklenmemiş. Yukarıdaki menüden ehliyet
                sınıfı ekleyebilirsiniz.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DrivingLicensesSection;
