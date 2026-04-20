import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppStore } from "../../store";
import { error as logError } from "../../utils/logger";
import {
  Card,
  CardContent,
  Button,
  Badge,
  EmptyState,
  Loading,
} from "../../components/ui";
import {
  Heart,
  MapPin,
  Clock,
  Building2,
  Trash2,
  ArrowRight,
  Briefcase,
} from "lucide-react";
import { showToast } from "../../components/ui/Toast";

const Favorites = () => {
  const { getFavorites, removeFromFavorites, loading } = useAppStore();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const result = await getFavorites();
    if (result.success) {
      // API returns data.favorites array
      const favs =
        result.data?.favorites ||
        result.data?.items ||
        (Array.isArray(result.data) ? result.data : []);

      if (!Array.isArray(favs)) {
        logError("Favorites data is not an array:", favs);
        setFavorites([]);
        return;
      }

      // Normalize favorite data structure
      // API response'unda jobPost yok, direkt job bilgileri var
      const normalizedFavorites = favs.map((fav) => {
        return {
          id: fav.id,
          jobId: fav.id, // API'de jobPost yok, direkt job id'si kullanılıyor
          title: fav.postTitle || fav.title,
          profession: fav.professions?.profession || "",
          location:
            fav.districts
              ?.map((d) => d.district?.title || d.title)
              .join(", ") || "",
          type: fav.workingMethod?.title || "",
          workModel: fav.workingMethod?.title || "",
          experience: fav.minExperienceYear || 0,
          hiringCount: fav.hiringCount || 0,
          postedDate: fav.createdAt
            ? new Date(fav.createdAt).toLocaleDateString("tr-TR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "",
          // Keep original data for compatibility
          ...fav,
        };
      });

      setFavorites(normalizedFavorites);
    } else {
      setFavorites([]);
    }
  };

  const handleRemoveFavorite = async (jobId) => {
    const result = await removeFromFavorites(jobId);
    if (result.success) {
      setFavorites(
        favorites.filter((fav) => fav.jobId !== jobId && fav.id !== jobId)
      );
      showToast({
        type: "success",
        message: "Favorilerden kaldırıldı",
        duration: 3000,
      });
    } else {
      showToast({
        type: "error",
        message: result.error || "Bir hata oluştu",
        duration: 3000,
      });
    }
  };

  if (loading && favorites.length === 0) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Favorilerim
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Beğendiğiniz iş ilanlarını buradan takip edebilirsiniz
          </p>
        </div>

        {/* Favorites List */}
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {favorites.map((favorite) => (
              <Card
                key={favorite.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Company Logo */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
                          {favorite.companyLogo ? (
                            <img
                              src={favorite.companyLogo}
                              alt={favorite.company}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                      </div>

                      {/* Job Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <Link
                              to={`/ilanlar/${favorite.jobId || favorite.id}`}
                              state={{ from: "favorites" }}
                              className="text-lg font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              {favorite.title}
                            </Link>
                            {favorite.profession && (
                              <p className="text-gray-600 dark:text-gray-400 mt-1">
                                {favorite.profession}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {favorite.type && (
                            <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-0">
                              {favorite.type}
                            </Badge>
                          )}
                          {favorite.experience > 0 && (
                            <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0">
                              {favorite.experience} Yıl Deneyim
                            </Badge>
                          )}
                          {favorite.hiringCount > 0 && (
                            <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-0">
                              {favorite.hiringCount} Pozisyon
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          {favorite.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {favorite.location}
                            </div>
                          )}
                          {favorite.postedDate && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {favorite.postedDate}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleRemoveFavorite(favorite.jobId || favorite.id)
                        }
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30"
                        leftIcon={<Trash2 className="w-4 h-4" />}
                      >
                        Kaldır
                      </Button>
                      <Link
                        to={`/ilanlar/${favorite.jobId || favorite.id}`}
                        state={{ from: "favorites" }}
                      >
                        <Button
                          size="sm"
                          rightIcon={<ArrowRight className="w-4 h-4" />}
                        >
                          Detay
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Heart className="w-8 h-8 text-gray-400" />}
            title="Henüz favori ilanınız yok"
            description="Beğendiğiniz iş ilanlarını favorilerinize ekleyerek daha sonra kolayca bulabilirsiniz"
            action={
              <Link to="/ilanlar">
                <Button leftIcon={<Briefcase className="w-4 h-4" />}>
                  İş İlanlarına Git
                </Button>
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
};

export default Favorites;
