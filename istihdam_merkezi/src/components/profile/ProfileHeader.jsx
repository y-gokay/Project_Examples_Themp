import { Avatar, Card, CardContent } from "../ui";
import { Loader2, Camera, X, Phone } from "lucide-react";
import { useRef } from "react";
import { showToast } from "../ui/Toast";
import { formatPhoneNumberDisplay } from "../../utils/helpers";

/**
 * ProfileHeader Component
 * Displays user profile picture, name, email, and basic info
 *
 * @param {Object} props
 * @param {Object} props.user - User object
 * @param {Object} props.lookups - Lookup data (cities, etc.)
 * @param {Function} props.onUploadPicture - Handler for picture upload
 * @param {Function} props.onDeletePicture - Handler for picture deletion
 * @param {boolean} props.uploadingPicture - Upload loading state
 * @param {boolean} props.deletingPicture - Delete loading state
 */
const ProfileHeader = ({
  user,
  lookups,
  missingKeys = [],
  onUploadPicture,
  onDeletePicture,
  uploadingPicture = false,
  deletingPicture = false,
}) => {
  const isProfilePictureMissing = missingKeys.includes("profilePicture");
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (onUploadPicture) {
      await onUploadPicture(file);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeletePicture = () => {
    if (
      window.confirm("Profil fotoğrafınızı silmek istediğinizden emin misiniz?")
    ) {
      onDeletePicture?.();
    }
  };

  return (
    <Card className="border-t-4 border-t-blue-600 dark:border-t-blue-500 shadow-sm w-full">
      <CardContent className="pt-8 pb-6 text-center">
        <div className="relative inline-block mb-4">
          <Avatar
            src={user?.profilePicture || user?.avatar}
            name={user?.name || "Kullanıcı"}
            className={`w-24 h-24 text-2xl border-4 shadow-md ${
              isProfilePictureMissing
                ? "border-red-500 ring-2 ring-red-400 ring-offset-2"
                : "border-white dark:border-gray-800"
            }`}
          />
          {isProfilePictureMissing && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500" />
            </span>
          )}
          {uploadingPicture && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
          {/* Delete button - top left */}
          {user?.profilePicture && !uploadingPicture && (
            <button
              onClick={handleDeletePicture}
              disabled={deletingPicture}
              className="absolute top-0 left-0 w-5 h-5 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-full flex items-center justify-center transition-all shadow-sm hover:shadow-md z-10 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Fotoğrafı Sil"
            >
              {deletingPicture ? (
                <Loader2 className="w-3 h-3 animate-spin text-red-600 dark:text-red-400" />
              ) : (
                <X className="w-3 h-3" />
              )}
            </button>
          )}
          {/* Upload button - bottom right */}
          <div className="absolute bottom-0 right-0">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleFileSelect}
              className="hidden"
              id="profile-picture-input-sidebar"
              disabled={uploadingPicture}
            />
            <label
              htmlFor="profile-picture-input-sidebar"
              className={`flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-sm ${
                uploadingPicture ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title="Fotoğraf Değiştir"
            >
              {uploadingPicture ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </label>
          </div>
        </div>

        {isProfilePictureMissing && (
          <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-2">
            Profil fotoğrafı yükleyin
          </p>
        )}
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 break-words">
          {user?.name} {user?.surname}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 break-all">
          {user?.email}
        </p>

        <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400 text-left px-2 break-words">
          {user?.phoneNumber && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <span>{formatPhoneNumberDisplay(user.phoneNumber)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
