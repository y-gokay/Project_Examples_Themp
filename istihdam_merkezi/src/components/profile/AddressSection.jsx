import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, Input, Select } from "../ui";
import { MapPin } from "lucide-react";

/**
 * AddressSection Component
 * Handles address information (city, district, neighbourhood, address text)
 *
 * @param {Object} props
 * @param {Object} props.user - User object
 * @param {Object} props.lookups - Lookup data (cities, etc.)
 * @param {Function} props.getDistrictsByCity - Function to get districts by city
 * @param {Function} props.getNeighbourhoodsByDistrict - Function to get neighbourhoods by district
 * @param {Function} props.onAddressChange - Callback when address changes
 */
const AddressSection = ({
  user,
  lookups,
  getDistrictsByCity,
  getNeighbourhoodsByDistrict,
  onAddressChange,
}) => {
  const [formData, setFormData] = useState({
    cityId: "",
    districtId: "",
    neighbourhoodId: "",
    address: "",
  });
  const [districts, setDistricts] = useState([]);
  const [neighbourhoods, setNeighbourhoods] = useState([]);

  // Initialize form data from user
  useEffect(() => {
    if (user) {
      const cityId =
        user.ikametgahDistrictRef?.city?.id ||
        user.neighbourhood?.district?.city?.id ||
        null;
      const districtId =
        user.ikametgahDistrictRef?.id ||
        user.neighbourhood?.district?.id ||
        null;
      const neighbourhoodId =
        user.addressNeighbourhoodId ||
        user.neighbourhood?.id ||
        user.neighbourhoodId ||
        null;
      const address =
        user.addressText || user.address || user.ikametgahAddress || "";

      if (cityId) {
        setFormData({
          cityId: cityId.toString(),
          districtId: districtId ? districtId.toString() : "",
          neighbourhoodId: neighbourhoodId ? neighbourhoodId.toString() : "",
          address: address,
        });

        // Load districts
        getDistrictsByCity(cityId).then((result) => {
          if (result.success) {
            setDistricts(result.data || []);
            // Load neighbourhoods if district is set
            if (districtId) {
              getNeighbourhoodsByDistrict(districtId).then(
                (neighbourhoodResult) => {
                  if (neighbourhoodResult.success) {
                    setNeighbourhoods(neighbourhoodResult.data || []);
                  }
                }
              );
            }
          }
        });
      } else {
        setFormData({
          cityId: "",
          districtId: "",
          neighbourhoodId: "",
          address: address,
        });
      }
    }
  }, [user, getDistrictsByCity, getNeighbourhoodsByDistrict]);

  const handleCityChange = async (cityId) => {
    setFormData((prev) => ({
      ...prev,
      cityId,
      districtId: "",
      neighbourhoodId: "",
    }));

    if (!cityId) {
      setDistricts([]);
      setNeighbourhoods([]);
      if (onAddressChange) {
        onAddressChange({
          ...formData,
          cityId: "",
          districtId: "",
          neighbourhoodId: "",
        });
      }
      return;
    }

    const result = await getDistrictsByCity(parseInt(cityId));
    if (result.success) {
      setDistricts(result.data || []);
    } else {
      setDistricts([]);
    }

    if (onAddressChange) {
      onAddressChange({
        ...formData,
        cityId,
        districtId: "",
        neighbourhoodId: "",
      });
    }
  };

  const handleDistrictChange = async (districtId) => {
    setFormData((prev) => ({
      ...prev,
      districtId,
      neighbourhoodId: "",
    }));

    if (!districtId) {
      setNeighbourhoods([]);
      if (onAddressChange) {
        onAddressChange({
          ...formData,
          districtId: "",
          neighbourhoodId: "",
        });
      }
      return;
    }

    const result = await getNeighbourhoodsByDistrict(districtId);
    if (result.success) {
      setNeighbourhoods(result.data || []);
    } else {
      setNeighbourhoods([]);
    }

    if (onAddressChange) {
      onAddressChange({
        ...formData,
        districtId,
        neighbourhoodId: "",
      });
    }
  };

  const handleNeighbourhoodChange = (neighbourhoodId) => {
    setFormData((prev) => ({
      ...prev,
      neighbourhoodId,
    }));

    if (onAddressChange) {
      onAddressChange({
        ...formData,
        neighbourhoodId,
      });
    }
  };

  const handleAddressChange = (address) => {
    setFormData((prev) => ({
      ...prev,
      address,
    }));

    if (onAddressChange) {
      onAddressChange({
        ...formData,
        address,
      });
    }
  };

  const cityOptions = [
    { value: "", label: "Şehir Seçiniz", disabled: true },
    ...(lookups?.cities || []).map((city) => ({
      value: city.id?.toString() || "",
      label: city.title || city.name || "Bilinmeyen Şehir",
    })),
  ];

  const districtOptions = [
    { value: "", label: "İlçe Seçiniz", disabled: true },
    ...districts.map((district) => ({
      value: district.id?.toString() || "",
      label: district.title || district.name || "Bilinmeyen İlçe",
    })),
  ];

  const neighbourhoodOptions = [
    { value: "", label: "Mahalle Seçiniz", disabled: true },
    ...neighbourhoods.map((neighbourhood) => ({
      value: neighbourhood.id?.toString() || "",
      label: neighbourhood.name || "Bilinmeyen Mahalle",
    })),
  ];

  return (
    <div className="space-y-4 pt-4 border-t border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-blue-600" />
        Adres Bilgileri
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Şehir"
          value={formData.cityId}
          onChange={(e) => handleCityChange(e.target.value)}
          options={cityOptions}
          placeholder="Şehir seçiniz"
        />
        <Select
          label="İlçe"
          value={formData.districtId}
          onChange={(e) => handleDistrictChange(e.target.value)}
          options={districtOptions}
          placeholder="İlçe seçiniz"
          disabled={!formData.cityId}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Mahalle"
          value={formData.neighbourhoodId}
          onChange={(e) => handleNeighbourhoodChange(e.target.value)}
          options={neighbourhoodOptions}
          placeholder="Mahalle seçiniz"
          disabled={!formData.districtId}
        />
        <Input
          label="Adres"
          type="text"
          placeholder="Mahalle, sokak, bina no vb."
          value={formData.address}
          onChange={(e) => handleAddressChange(e.target.value)}
          leftIcon={<MapPin className="w-4 h-4" />}
        />
      </div>
    </div>
  );
};

export default AddressSection;
