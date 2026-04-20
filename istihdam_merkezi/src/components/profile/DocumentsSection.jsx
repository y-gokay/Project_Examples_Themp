import { useRef, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Select,
  Modal,
} from "../ui";
import { FileCheck, Shield, Upload, Loader2, Save, Trash2 } from "lucide-react";
import { FILE_LIMITS } from "../../constants";
import { showToast } from "../ui/Toast";
import { validateFileUpload } from "../../utils/helpers";

/**
 * DocumentsSection Component
 * Handles document uploads (Sabıka Kaydı)
 * 
 * @param {Object} props
 * @param {Object} props.user - User object
 * @param {Function} props.onUploadCriminalRecord - Handler for criminal record upload
 * @param {Function} props.onUpdateCriminalRecordStatus - Handler for criminal record status update
 * @param {boolean} props.isCriminalRecorded - Criminal record status
 * @param {Function} props.onCriminalRecordStatusChange - Handler for status change
 * @param {boolean} props.loading - General loading state
 */
const DocumentsSection = ({
  user,
  missingKeys = [],
  onUploadCriminalRecord,
  isCriminalRecorded = false,
  onCriminalRecordStatusChange,
  loading = false,
}) => {
  const criminalMissing = ["isCriminalRecorded", "criminalRecordFile"].some((k) => missingKeys.includes(k));
  const criminalRecordFileInputRef = useRef(null);
  const [criminalRecordModalOpen, setCriminalRecordModalOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState(null); // Yüklenen ama kaydedilmemiş dosya
  const [pendingCriminalRecordStatus, setPendingCriminalRecordStatus] =
    useState(null); // Pending dosya için seçilen durum
  const [uploadingCriminalRecord, setUploadingCriminalRecord] = useState(false);

  // Dosya seçildiğinde sadece state'e kaydet, API çağrısı yapma
  const handleCriminalRecordFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    // Dosyayı validate et
    const validation = validateFileUpload(file, FILE_LIMITS.DOCUMENT);
    if (!validation.isValid) {
      showToast({
        type: "error",
        message: validation.error || "Geçersiz dosya",
        duration: 3000,
      });
      if (criminalRecordFileInputRef.current) {
        criminalRecordFileInputRef.current.value = "";
      }
      return;
    }

    // Dosyayı state'e kaydet
    setPendingFile(file);

    // Mevcut isCriminalRecorded değerini pending state'e aktar (varsayılan: false)
    const currentStatus =
      isCriminalRecorded === "true" || isCriminalRecorded === true
        ? "true"
        : "false";
    setPendingCriminalRecordStatus(currentStatus);

    // Input'u temizle
    if (criminalRecordFileInputRef.current) {
      criminalRecordFileInputRef.current.value = "";
    }
  };

  // Kaydet butonuna tıklandığında API çağrısı yap
  const handleSaveCriminalRecord = async () => {
    if (!pendingFile) {
      return;
    }

    if (!onUploadCriminalRecord) {
      showToast({
        type: "error",
        message: "Upload function not provided",
        duration: 3000,
      });
      return;
    }

    setUploadingCriminalRecord(true);

    try {
      // Pending durum varsa onu kullan, yoksa mevcut isCriminalRecorded değerini kullan
      const statusToUse =
        pendingCriminalRecordStatus !== null
          ? pendingCriminalRecordStatus
          : isCriminalRecorded;

      const isCriminalRecordedValue =
        statusToUse === "true" ? true : statusToUse === "false" ? false : false;

      const result = await onUploadCriminalRecord(
        pendingFile,
        isCriminalRecordedValue
      );

      if (result.success) {
        showToast({
          type: "success",
          message: "Sabıka kaydı belgesi başarıyla yüklendi",
          duration: 3000,
        });
        // Pending dosya ve durumu temizle
        setPendingFile(null);
        setPendingCriminalRecordStatus(null);
      } else {
        showToast({
          type: "error",
          message: result.error || "Belge yüklenirken bir hata oluştu",
          duration: 3000,
        });
      }
    } catch {
      showToast({
        type: "error",
        message: "Belge yüklenirken bir hata oluştu",
        duration: 3000,
      });
    } finally {
      setUploadingCriminalRecord(false);
    }
  };

  // Kaldır butonuna tıklandığında pending dosyayı temizle
  const handleRemovePendingFile = () => {
    setPendingFile(null);
    setPendingCriminalRecordStatus(null);
    if (criminalRecordFileInputRef.current) {
      criminalRecordFileInputRef.current.value = "";
    }
  };

  const handleCriminalRecordStatusChange = (value) => {
    // Belge yüklü olmalı (kaydedilmiş veya pending)
    if (!user?.criminalRecordFile && !pendingFile) {
      showToast({
        type: "warning",
        message: "Önce sabıka kaydı belgesi yüklemeniz gerekmektedir",
        duration: 4000,
      });
      return;
    }

    // Pending dosya varsa sadece local state'i güncelle (kaydet butonuna basıldığında gönderilecek)
    if (pendingFile) {
      setPendingCriminalRecordStatus(value);
      return;
    }

    // Kaydedilmiş dosya varsa direkt API çağrısı yap
    if (onCriminalRecordStatusChange) {
      onCriminalRecordStatusChange(value);
    }
  };

  return (
    <Card className={`mb-6 ${criminalMissing ? "border-red-400 dark:border-red-500 border-2" : ""}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="w-5 h-5" />
          Belgeler
          {criminalMissing && (
            <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
              Eksik bilgi var
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Criminal Record Document */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Sabıka Kaydı Belgesi
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sabıka kaydı belgenizi PDF formatında yükleyebilirsiniz
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Select
                  label="Sabıka Kaydı"
                  value={
                    pendingFile && pendingCriminalRecordStatus !== null
                      ? pendingCriminalRecordStatus
                      : isCriminalRecorded === "true" ||
                        isCriminalRecorded === true
                      ? "true"
                      : "false"
                  }
                  onChange={(e) =>
                    handleCriminalRecordStatusChange(e.target.value)
                  }
                  options={[
                    { value: "true", label: "Evet" },
                    { value: "false", label: "Hayır" },
                  ]}
                  disabled={!user?.criminalRecordFile && !pendingFile}
                  helperText={
                    !user?.criminalRecordFile && !pendingFile
                      ? "Önce sabıka kaydı belgesi yüklemelisiniz. Belge yüklendikten sonra durumunuzu seçebilirsiniz."
                      : pendingFile
                      ? "Belge yüklendi. Durumunuzu seçtikten sonra 'Kaydet' butonuna tıklayın."
                      : "Sabıka kaydınız var mı? Bu seçenek bağımsız olarak değiştirilebilir. Evrak yükleme, sabıka kaydı olmadığını belgelemek için de kullanılabilir."
                  }
                />
              </div>
              <div className="flex items-center gap-4">
                {user?.criminalRecordFile ? (
                  <div className="flex items-center gap-3 flex-1">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <button
                      onClick={() => setCriminalRecordModalOpen(true)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
                    >
                      Mevcut belgeyi görüntüle
                    </button>
                  </div>
                ) : pendingFile ? (
                  <div className="flex items-center gap-3 flex-1">
                    <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {pendingFile.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({(pendingFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex-1">
                    Henüz belge yüklenmemiş
                  </p>
                )}
                <div className="flex items-center gap-2">
                  {pendingFile ? (
                    <>
                      <Button
                        onClick={handleRemovePendingFile}
                        disabled={uploadingCriminalRecord || loading}
                        variant="outline"
                        className="min-w-[100px]"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Kaldır
                      </Button>
                      <Button
                        onClick={handleSaveCriminalRecord}
                        disabled={uploadingCriminalRecord || loading}
                        className="min-w-[120px]"
                      >
                        {uploadingCriminalRecord ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Kaydediliyor...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Kaydet
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <>
                  <input
                    ref={criminalRecordFileInputRef}
                    type="file"
                    accept="application/pdf"
                        onChange={handleCriminalRecordFileSelect}
                    className="hidden"
                    disabled={uploadingCriminalRecord || loading}
                  />
                  <Button
                    onClick={() =>
                      criminalRecordFileInputRef.current?.click()
                    }
                    disabled={uploadingCriminalRecord || loading}
                    variant="outline"
                    className="min-w-[120px]"
                  >
                        <Upload className="w-4 h-4 mr-2" />
                        {user?.criminalRecordFile ? "Yeniden Yükle" : "Yükle"}
                      </Button>
                      </>
                    )}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              PDF formatında, maksimum 10MB boyutunda belge yükleyebilirsiniz.
              Sabıka kaydı olsun ya da olmasın, evrak yükleyebilirsiniz.
            </p>
          </div>
        </div>
      </CardContent>

      {/* Sabıka Kaydı Görüntüleme Modal */}
      <Modal
        isOpen={criminalRecordModalOpen}
        onClose={() => setCriminalRecordModalOpen(false)}
        title="Sabıka Kaydı Belgesi"
        size="full"
        className="max-w-6xl"
      >
        {user?.criminalRecordFile && (
          <div className="w-full h-[80vh]">
            <iframe
              src={user.criminalRecordFile}
              className="w-full h-full border-0 rounded-lg"
              title="Sabıka Kaydı PDF"
            />
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default DocumentsSection;
