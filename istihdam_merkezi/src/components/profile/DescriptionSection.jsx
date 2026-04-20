import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Textarea,
  Button,
} from "../ui";
import { FileText, Save, Loader2, Edit } from "lucide-react";
import { showToast } from "../ui/Toast";

/**
 * DescriptionSection Component
 *
 * Kullanıcının "Hakkımda" (About Me) bölümünü gösterir ve düzenlemesine izin verir.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.user - Kullanıcı objesi (profil bilgileri)
 * @param {Function} props.onUpdateDescription - Description güncelleme API çağrısı
 * @param {boolean} props.loading - Loading state'i
 *
 * @example
 * ```jsx
 * <DescriptionSection
 *   user={user}
 *   onUpdateDescription={updateDescription}
 *   loading={loading}
 * />
 * ```
 */
const DescriptionSection = ({ user, onUpdateDescription, loading = false }) => {
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // User verisi yüklendiğinde description'ı set et
  useEffect(() => {
    if (user?.description) {
      setDescription(user.description);
    } else {
      setDescription("");
    }
    setIsEditing(false);
  }, [user?.description]);

  const handleSave = async () => {
    setSaving(true);

    try {
      const result = await onUpdateDescription(description);

      if (result.success) {
        showToast({
          type: "success",
          message: "Hakkımda bilgisi başarıyla güncellendi",
          duration: 3000,
        });
        setIsEditing(false);
      } else {
        showToast({
          type: "error",
          message: result.error || "Güncelleme sırasında bir hata oluştu",
          duration: 3000,
        });
      }
    } catch (error) {
      showToast({
        type: "error",
        message: "Güncelleme sırasında bir hata oluştu",
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Orijinal değere geri dön
    setDescription(user?.description || "");
    setIsEditing(false);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Hakkımda
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
          </div>
        ) : (
          <div className="space-y-4">
            {!isEditing ? (
              <>
                {description ? (
                  <div className="prose max-w-none dark:prose-invert">
                    <p className="text-base text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
                      {description}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                    <p className="text-sm">
                      Henüz hakkınızda bir bilgi eklenmemiş.
                    </p>
                    <p className="text-xs mt-1">
                      İşverenlerin sizi daha iyi tanıyabilmesi için hakkınızda
                      bilgi ekleyebilirsiniz.
                    </p>
                  </div>
                )}
                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {description ? "Düzenle" : "Ekle"}
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <Textarea
                  label="Hakkımda"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={8}
                  placeholder="Kendiniz hakkında bilgi verin. Deneyimleriniz, yetenekleriniz, hedefleriniz ve iş arayışınız hakkında detaylı bilgi paylaşabilirsiniz..."
                  helperText="İşverenlerin sizi daha iyi tanıyabilmesi için detaylı bilgi verin"
                  maxLength={2000}
                  showCount
                />
                <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                    disabled={saving}
                  >
                    İptal
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    size="sm"
                    className="min-w-[120px]"
                  >
                    {saving ? (
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
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DescriptionSection;
