import { useState, useEffect } from "react";
import { kresAPI } from "../services/api";
import { getPhotoUrl, isSuperAdmin } from "../services/auth";
import { X, Upload, Image as ImageIcon, Trash2 } from "lucide-react";

const PREDEFINED_AGE_GROUPS = [
  { id: 1, name: "3-3,5", minAge: 3, maxAge: 3.5, order: 1 },
  { id: 2, name: "3,5-4", minAge: 3.5, maxAge: 4, order: 2 },
  { id: 3, name: "4-4,5", minAge: 4, maxAge: 4.5, order: 3 },
  { id: 4, name: "4,5-5", minAge: 4.5, maxAge: 5, order: 4 },
  { id: 5, name: "5-6", minAge: 5, maxAge: 6, order: 5 },
];

function parseDMS(text) {
  const regex =
    /(\d+)[°]\s*(\d+)[′'ʹ]\s*([\d.]+)[″"ʺ]\s*([NSns])\s+(\d+)[°]\s*(\d+)[′'ʹ]\s*([\d.]+)[″"ʺ]\s*([EWew])/;
  const match = text.match(regex);
  if (!match) return null;
  let lat =
    parseFloat(match[1]) +
    parseFloat(match[2]) / 60 +
    parseFloat(match[3]) / 3600;
  if (match[4].toUpperCase() === "S") lat = -lat;
  let lng =
    parseFloat(match[5]) +
    parseFloat(match[6]) / 60 +
    parseFloat(match[7]) / 3600;
  if (match[8].toUpperCase() === "W") lng = -lng;
  return { latitude: lat.toFixed(6), longitude: lng.toFixed(6) };
}

function parseCoordinates(text) {
  const trimmed = text.trim();
  const dms = parseDMS(trimmed);
  if (dms) return dms;
  const parts = trimmed.split(/[,\s]+/).filter(Boolean);
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { latitude: parts[0], longitude: parts[1] };
  }
  return null;
}

export default function KresModal({ kres, onClose, onSuccess }) {
  const isSuper = isSuperAdmin();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    description: "",
    quota: "",
    reservedQuota: "",
    latitude: "",
    longitude: "",
  });
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [selectedAgeGroupIds, setSelectedAgeGroupIds] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (kres) {
      setFormData({
        name: kres.name || "",
        address: kres.address || "",
        phone: kres.phone || "",
        email: kres.email || "",
        description: kres.description || "",
        quota: kres.quota || "",
        reservedQuota: kres.reservedQuota || "",
        latitude: kres.latitude ?? "",
        longitude: kres.longitude ?? "",
      });
      setExistingPhotos(kres.photos || []);

      if (kres.ageGroups) {
        setSelectedAgeGroupIds(kres.ageGroups.map((ag) => ag.id));
      }
    }
  }, [kres]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" && value === "" ? "" : value,
    }));
  };

  const handleCoordinatePaste = (e) => {
    const pastedText = e.clipboardData.getData("text");
    const parsed = parseCoordinates(pastedText);
    if (parsed) {
      e.preventDefault();
      setFormData((prev) => ({
        ...prev,
        latitude: parsed.latitude,
        longitude: parsed.longitude,
      }));
    }
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(files);

    const previews = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        previews.push(event.target.result);
        if (previews.length === files.length) {
          setPhotoPreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhotoPreview = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleAgeGroup = (id) => {
    setSelectedAgeGroupIds((prev) =>
      prev.includes(id) ? prev.filter((gid) => gid !== id) : [...prev, id]
    );
  };

  const handleDeletePhoto = async (photoId) => {
    if (!confirm("Bu fotoğrafı silmek istediğinize emin misiniz?")) return;

    try {
      await kresAPI.deletePhoto(photoId);
      setExistingPhotos((prev) => prev.filter((p) => p.id !== photoId));
    } catch (error) {
      alert("Fotoğraf silinemedi: " + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "reservedQuota" && !isSuper) return;
        const value = formData[key];
        if (value !== null && value !== undefined) {
          formDataToSend.append(key, value);
        }
      });

      formDataToSend.append("ageGroupIds", JSON.stringify(selectedAgeGroupIds));

      photos.forEach((photo) => {
        formDataToSend.append("photos", photo);
      });

      if (kres) {
        await kresAPI.updateKres(kres.id, formDataToSend);
      } else {
        await kresAPI.createKres(formDataToSend);
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="kres-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3
            id="kres-modal-title"
            className="text-lg font-bold text-slate-800"
          >
            {kres ? "Çocuk Gelişim Merkezi Düzenle" : "Yeni Çocuk Gelişim Merkezi Ekle"}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-white transition-colors"
            type="button"
            aria-label="Pencereyi kapat"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Çocuk Gelişim Merkezi Adı *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="Çocuk gelişim merkezi adını giriniz"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Telefon
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="05xxxxxxxxx"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    E-posta
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="ornek@email.com"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Kontenjan
                  </label>
                  <input
                    type="number"
                    name="quota"
                    min="1"
                    value={formData.quota}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Örn: 20"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Yerleştirmeye seçilebilecek kişi sayısı
                  </p>
                </div>
                {isSuper && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Rezerve Kontenjan
                    </label>
                    <input
                      type="number"
                      name="reservedQuota"
                      min="0"
                      value={formData.reservedQuota}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Örn: 2"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Sadece bilgi amaçlı tutulur
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Adres *
              </label>
              <textarea
                name="address"
                rows="3"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="input-field resize-none"
                placeholder="Açık adres giriniz"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Koordinatlar
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    onPaste={handleCoordinatePaste}
                    className="input-field"
                    placeholder="Enlem (ör: 41.329539)"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    onPaste={handleCoordinatePaste}
                    className="input-field"
                    placeholder="Boylam (ör: 36.269902)"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Açıklama
              </label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleInputChange}
                className="input-field resize-none"
                placeholder="Çocuk gelişim merkezi hakkında ek bilgiler..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Kabul Edilen Yaş Grupları
              </label>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_AGE_GROUPS.map((group) => {
                  const isSelected = selectedAgeGroupIds.includes(group.id);
                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => toggleAgeGroup(group.id)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                        isSelected
                          ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                          : "bg-white text-slate-600 border-slate-300 hover:border-blue-300 hover:bg-blue-50"
                      }`}
                    >
                      {group.name} Yaş
                    </button>
                  );
                })}
              </div>

            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fotoğraflar
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="mx-auto text-slate-400 mb-2" size={24} />
                <p className="text-sm text-slate-600 font-medium">
                  Fotoğraf yüklemek için tıklayın veya sürükleyin
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  PNG, JPG, JPEG (Max. 5MB)
                </p>
              </div>

              {/* Previews */}
              {(photoPreviews.length > 0 || existingPhotos.length > 0) && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {photoPreviews.map((preview, index) => (
                    <div
                      key={`new-${index}`}
                      className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200"
                    >
                      <img
                        src={preview}
                        alt="New"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removePhotoPreview(index)}
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {existingPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200"
                    >
                      <img
                        src={getPhotoUrl(photo.photoPath)}
                        alt="Existing"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                {error}
              </div>
            )}

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn btn-secondary"
                disabled={isLoading}
              >
                İptal
              </button>
              <button
                type="submit"
                className="flex-1 btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
