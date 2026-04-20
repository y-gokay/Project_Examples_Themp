import { api } from "../../lib/api";
import { showToast } from "../../components/ui/Toast";

const LOOKUP_TTL_MS = 24 * 60 * 60 * 1000; // 24 saat

/**
 * Lookup Slice - Referans verileri (lookup'lar) ile ilgili state ve action'lar
 */
export const lookupSlice = (set, get) => ({
  // Lookup Verileri (Referans Verileri)
  lookups: {
    languages: [],
    professions: [],
    educationTypes: [],
    cities: [],
    districts: [],
    neighbourhoods: [],
    sectors: [],
    nationalities: [],
    exams: [],
    drivingLicenseTypes: [],
    workingMethods: [],
    workDays: [],
    workingExperiences: [],
    applicantRights: [],
    businessRoles: [],
  },
  lookupsPersistedAt: null,
  lookupsLoading: false,

  // ===== LOOKUP ACTION'LARI =====
  getLookups: async (lookupType, cityId = null) => {
    // Districts için şehir ID'si gereklidir
    if (lookupType === "districts") {
      if (cityId) {
        return get().getDistrictsByCity(cityId);
      }
      // Districts için şehir ID'si yoksa hata döndür
      return {
        success: false,
        error:
          "Districts için şehir ID'si gereklidir. getDistrictsByCity() kullanın.",
      };
    }

    // Neighbourhoods için district ID'si gereklidir (getLookups ile çağrılmamalı)
    if (lookupType === "neighbourhoods") {
      return {
        success: false,
        error:
          "Neighbourhoods için ilçe ID'si gereklidir. getNeighbourhoodsByDistrict() kullanın.",
      };
    }

    // Eğer zaten yüklüyse ve TTL dolmamışsa, cache'den döndür
    const currentLookups = get().lookups;
    const persistedAt = get().lookupsPersistedAt;
    const isFresh = persistedAt && Date.now() - persistedAt < LOOKUP_TTL_MS;
    if (currentLookups[lookupType] && currentLookups[lookupType].length > 0 && isFresh) {
      return { success: true, data: currentLookups[lookupType] };
    }

    set({ lookupsLoading: true, error: null });

    // Lookup type'a göre endpoint'i belirle
    const endpointMap = {
      languages: "/lookups/languages",
      professions: "/lookups/professions",
      educationTypes: "/lookups/education-types",
      cities: "/lookups/cities",
      sectors: "/lookups/sectors",
      nationalities: "/lookups/nationalities",
      exams: "/lookups/exams",
      drivingLicenseTypes: "/lookups/driving-license-types",
      workingMethods: "/lookups/working-methods",
      workDays: "/lookups/days",
      workingExperiences: "/lookups/working-experiences",
      applicantRights: "/lookups/applicant-rights",
      businessRoles: "/lookups/business-roles",
    };

    const endpoint = endpointMap[lookupType];
    if (!endpoint) {
      set({
        lookupsLoading: false,
        error: `Unknown lookup type: ${lookupType}`,
      });
      return {
        success: false,
        error: `Unknown lookup type: ${lookupType}`,
      };
    }

    const result = await api.get(endpoint);

    if (result.success) {
      const lookupData = result.data?.data || result.data || [];
      set((state) => ({
        lookups: {
          ...state.lookups,
          [lookupType]: lookupData,
        },
        lookupsLoading: false,
        lookupsPersistedAt: state.lookupsPersistedAt ?? Date.now(),
      }));
      return { success: true, data: lookupData };
    }

    set({ error: result.error, lookupsLoading: false });

    // Kullanıcıya, seçim yapması için gerekli referans verilerin
    // yüklenemediğini açık bir şekilde bildir
    showToast({
      type: "error",
      message:
        "Bazı seçim listeleri (şehir, ilçe, mahalle, üniversite vb.) yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.",
      duration: 4000,
    });

    return { success: false, error: result.error, errors: result.errors || [] };
  },

  // Şehir ID'sine göre ilçeleri getir
  getDistrictsByCity: async (cityId) => {
    if (!cityId) {
      return { success: false, error: "Şehir ID'si gerekli" };
    }

    set({ lookupsLoading: true, error: null });
    const result = await api.get(`/lookups/districts/${cityId}`);

    if (result.success) {
      const districtsData = result.data?.data || result.data || [];
      // Districts'leri şehir ID'sine göre cache'le
      set((state) => ({
        lookups: {
          ...state.lookups,
          districts: [
            // Mevcut districts'lerden bu şehre ait olmayanları koru
            ...(state.lookups.districts || []).filter(
              (d) => d.cityId?.toString() !== cityId.toString()
            ),
            // Yeni districts'leri ekle
            ...districtsData,
          ],
        },
        lookupsLoading: false,
      }));
      return { success: true, data: districtsData };
    }

    set({ error: result.error, lookupsLoading: false });

    showToast({
      type: "error",
      message:
        "İlçe listesi yüklenemedi. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.",
      duration: 4000,
    });

    return { success: false, error: result.error, errors: result.errors || [] };
  },

  // İlçeye göre mahalleleri getir
  getNeighbourhoodsByDistrict: async (districtId) => {
    if (!districtId) {
      return { success: false, error: "İlçe ID'si gerekli" };
    }

    set({ lookupsLoading: true, error: null });
    const result = await api.get(`/lookups/neighbourhoods/${districtId}`);

    if (result.success) {
      const neighbourhoodsData = result.data?.data || result.data || [];
      // Neighbourhoods'ları ilçe ID'sine göre cache'le
      set((state) => ({
        lookups: {
          ...state.lookups,
          neighbourhoods: [
            // Mevcut neighbourhoods'lardan bu ilçeye ait olmayanları koru
            ...(state.lookups.neighbourhoods || []).filter(
              (n) => n.districtId?.toString() !== districtId.toString()
            ),
            // Yeni neighbourhoods'leri ekle
            ...neighbourhoodsData,
          ],
        },
        lookupsLoading: false,
      }));
      return { success: true, data: neighbourhoodsData };
    }

    set({ error: result.error, lookupsLoading: false });

    showToast({
      type: "error",
      message:
        "Mahalle listesi yüklenemedi. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.",
      duration: 4000,
    });

    return { success: false, error: result.error, errors: result.errors || [] };
  },

  // Üniversiteye göre fakülteleri getir
  getFacultiesByUniversity: async (universityId) => {
    if (!universityId) {
      return { success: false, error: "Üniversite ID'si gerekli" };
    }

    set({ lookupsLoading: true, error: null });
    const result = await api.get(
      `/lookups/faculties/university/${universityId}`
    );

    if (result.success) {
      const facultiesData = result.data?.data || result.data || [];
      set({ lookupsLoading: false });
      return { success: true, data: facultiesData };
    }

    set({ error: result.error, lookupsLoading: false });

    showToast({
      type: "error",
      message:
        "Fakülte listesi yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.",
      duration: 4000,
    });

    return { success: false, error: result.error, errors: result.errors || [] };
  },

  // Fakülteye göre bölümleri getir
  getDepartmentsByFaculty: async (facultyId) => {
    if (!facultyId) {
      return { success: false, error: "Fakülte ID'si gerekli" };
    }

    set({ lookupsLoading: true, error: null });
    const result = await api.get(`/lookups/departments/faculty/${facultyId}`);

    if (result.success) {
      const departmentsData = result.data?.data || result.data || [];
      set({ lookupsLoading: false });
      return { success: true, data: departmentsData };
    }

    set({ error: result.error, lookupsLoading: false });

    showToast({
      type: "error",
      message:
        "Bölüm listesi yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.",
      duration: 4000,
    });

    return { success: false, error: result.error, errors: result.errors || [] };
  },

  // Şehir ve eğitim tipine göre okulları getir
  getSchoolsByCityAndType: async (cityId, educationType) => {
    if (!cityId || !educationType) {
      return {
        success: false,
        error: "Şehir ID'si ve eğitim tipi gerekli",
      };
    }

    set({ lookupsLoading: true, error: null });
    const result = await api.get(
      `/lookups/schools/city/${cityId}?type=${encodeURIComponent(
        educationType
      )}`
    );

    if (result.success) {
      const schoolsData = result.data?.data || result.data || [];
      set({ lookupsLoading: false });
      return { success: true, data: schoolsData };
    }

    set({ error: result.error, lookupsLoading: false });

    showToast({
      type: "error",
      message:
        "Okul listesi yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.",
      duration: 4000,
    });

    return { success: false, error: result.error, errors: result.errors || [] };
  },

  // Üniversiteleri getir (endpoint'in var olduğu varsayılıyor)
  getUniversities: async () => {
    set({ lookupsLoading: true, error: null });
    const result = await api.get("/lookups/universities");

    if (result.success) {
      const universitiesData = result.data?.data || result.data || [];
      set({ lookupsLoading: false });
      return { success: true, data: universitiesData };
    }

    set({ error: result.error, lookupsLoading: false });

    showToast({
      type: "error",
      message:
        "Üniversite listesi yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.",
      duration: 4000,
    });

    return { success: false, error: result.error, errors: result.errors || [] };
  },

  // Meslekleri arama ile getir (search="" ile ilk sayfa döner)
  searchProfessions: async (searchTerm, limit = 100, page = 1) => {
    set({ lookupsLoading: true, error: null });
    const term = searchTerm && searchTerm.trim() ? searchTerm.trim().toLocaleLowerCase("tr-TR") : "";
    const searchQuery = encodeURIComponent(term);
    const result = await api.get(
      `/lookups/professions?search=${searchQuery}&limit=${limit}&page=${page}`
    );

    if (result.success) {
      const professionsData = result.data?.data || result.data || [];
      set({ lookupsLoading: false });
      return { success: true, data: professionsData };
    }

    set({ error: result.error, lookupsLoading: false });

    showToast({
      type: "error",
      message:
        "Meslek listesi yüklenemedi. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.",
      duration: 4000,
    });

    return { success: false, error: result.error, errors: result.errors || [] };
  },
});
