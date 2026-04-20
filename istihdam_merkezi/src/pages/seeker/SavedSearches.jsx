import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppStore } from "../../store";
import {
  Card,
  CardContent,
  Button,
  Badge,
  EmptyState,
  Loading,
} from "../../components/ui";
import {
  Search,
  Trash2,
  Bell,
  MapPin,
  Briefcase,
  Clock,
  X,
} from "lucide-react";
import { showToast } from "../../components/ui/Toast";

const SavedSearches = () => {
  const { getSavedSearches, deleteSavedSearch, loading } = useAppStore();
  const [savedSearches, setSavedSearches] = useState([]);

  useEffect(() => {
    loadSavedSearches();
  }, []);

  const loadSavedSearches = async () => {
    const result = await getSavedSearches();
    if (result.success) {
      setSavedSearches(result.data?.items || result.data || []);
    }
  };

  const handleDelete = async (searchId) => {
    const result = await deleteSavedSearch(searchId);
    if (result.success) {
      setSavedSearches(savedSearches.filter((s) => s.id !== searchId));
      showToast({
        type: "success",
        message: "Arama kaydı silindi",
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

  const buildSearchUrl = (search) => {
    const params = new URLSearchParams();
    if (search.query) params.append("query", search.query);
    if (search.city) params.append("city", search.city);
    if (search.type) params.append("type", search.type);
    if (search.workModel) params.append("workModel", search.workModel);
    if (search.sector) params.append("sector", search.sector);
    return `/ilanlar?${params.toString()}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading && savedSearches.length === 0) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Kayıtlı Aramalar</h1>
          <p className="text-gray-600">
            Kaydettiğiniz arama kriterlerini buradan yönetebilirsiniz
          </p>
        </div>

        {/* Saved Searches List */}
        {savedSearches.length > 0 ? (
          <div className="space-y-4">
            {savedSearches.map((search) => (
              <Card key={search.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-bold text-gray-900">
                          {search.name}
                        </h3>
                        {search.emailNotifications && (
                          <Badge className="bg-blue-100 text-blue-800">
                            <Bell className="w-3 h-3 mr-1" />
                            Bildirim Açık
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {search.query && (
                          <Badge className="bg-gray-100 text-gray-700">
                            <Search className="w-3 h-3 mr-1" />
                            {search.query}
                          </Badge>
                        )}
                        {search.city && (
                          <Badge className="bg-gray-100 text-gray-700">
                            <MapPin className="w-3 h-3 mr-1" />
                            {search.city}
                          </Badge>
                        )}
                        {search.type && (
                          <Badge className="bg-gray-100 text-gray-700">
                            <Briefcase className="w-3 h-3 mr-1" />
                            {search.type === "full-time"
                              ? "Tam Zamanlı"
                              : search.type === "part-time"
                              ? "Yarı Zamanlı"
                              : search.type}
                          </Badge>
                        )}
                        {search.workModel && (
                          <Badge className="bg-gray-100 text-gray-700">
                            {search.workModel === "remote"
                              ? "Uzaktan"
                              : search.workModel === "hybrid"
                              ? "Hibrit"
                              : "Ofiste"}
                          </Badge>
                        )}
                        {search.sector && (
                          <Badge className="bg-gray-100 text-gray-700">
                            {search.sector}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Son arama: {formatDate(search.lastSearchDate)}
                        </div>
                        {search.resultCount > 0 && (
                          <span className="text-blue-600 font-medium">
                            {search.resultCount} sonuç bulundu
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <Link to={buildSearchUrl(search)}>
                      <Button variant="outline" size="sm" leftIcon={<Search className="w-4 h-4" />}>
                        Aramayı Çalıştır
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(search.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Sil
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Search className="w-8 h-8 text-gray-400" />}
            title="Henüz kayıtlı aramanız yok"
            description="İş ilanları sayfasında yaptığınız aramaları kaydederek daha sonra kolayca erişebilirsiniz"
            action={
              <Link to="/ilanlar">
                <Button leftIcon={<Search className="w-4 h-4" />}>
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

export default SavedSearches;

