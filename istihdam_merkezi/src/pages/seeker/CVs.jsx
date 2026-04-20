import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
} from "../../components/ui";
import { FileText, Eye, Loader2 } from "lucide-react";
import { showToast } from "../../components/ui/Toast";
import { API_BASE_URL, getToken } from "../../lib/api";

const CVs = () => {
  const [loading, setLoading] = useState(false);

  const handleViewCV = async () => {
    setLoading(true);

    try {
      const token = getToken();

      const response = await fetch(`${API_BASE_URL}/users/cv/pdf`, {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        showToast({
          type: "error",
          message: "CV görüntülenirken bir hata oluştu",
          duration: 3000,
        });
        setLoading(false);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Mobilde direkt indir, desktop'ta yeni sekmede aç
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        const link = document.createElement("a");
        link.href = url;
        link.download = "CV.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        showToast({
          type: "success",
          message: "CV indiriliyor...",
          duration: 3000,
        });
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
        showToast({
          type: "success",
          message: "CV PDF olarak açıldı",
          duration: 3000,
        });
      }
    } catch (error) {
      showToast({
        type: "error",
        message: "CV görüntülenirken bir hata oluştu",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              CV Görüntüle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              Sistemde kayıtlı CV'nizi PDF formatında görüntülemek için
              aşağıdaki butona tıklayın. CV'niz yeni bir sekmede açılacaktır.
            </p>
            <div className="flex justify-start">
              <Button onClick={handleViewCV} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Yükleniyor...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    CV'yi Görüntüle
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CVs;
