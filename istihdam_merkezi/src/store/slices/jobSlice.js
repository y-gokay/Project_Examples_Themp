import { api } from "../../lib/api";

/**
 * Job Slice - İş ilanları ile ilgili state ve action'lar
 */
export const jobSlice = (set, get) => ({
  // İş ilanları State'i
  jobs: [],
  jobsLoading: true,
  currentJob: null,
  jobFilters: {
    search: "",
    districtIds: [],
    workingMethodIds: [],
    sectorIds: [],
    professionIds: [],
    onlySearchInTitle: false,
    isForDisabled: false,
    page: 1,
    limit: 10,
  },
  jobPagination: {
    currentPage: 1,
    totalPages: 0,
    total: 0,
  },

  // ===== İŞ İLANI ACTION'LARI =====
  searchJobs: async (filters = {}) => {
    set({ jobsLoading: true, error: null });
    const currentFilters = get().jobFilters;
    const params = { ...currentFilters, ...filters };

    // API parametrelerini oluştur
    const queryParams = new URLSearchParams();

    queryParams.append("page", (params.page || 1).toString());
    queryParams.append("limit", "10");

    // search (string) - case-insensitive için normalize et
    if (params.search && params.search.trim() !== "") {
      queryParams.append(
        "search",
        params.search.trim().toLocaleLowerCase("tr-TR"),
      );
    }

    // onlySearchInTitle (boolean)
    if (params.onlySearchInTitle === true) {
      queryParams.append("onlySearchInTitle", "true");
    }

    // professionIds (array veya virgülle ayrılmış string)
    if (params.professionIds) {
      if (
        Array.isArray(params.professionIds) &&
        params.professionIds.length > 0
      ) {
        queryParams.append("professionIds", params.professionIds.join(","));
      } else if (
        typeof params.professionIds === "string" &&
        params.professionIds.trim() !== ""
      ) {
        queryParams.append("professionIds", params.professionIds.trim());
      }
    }
    // Backward compatibility: professionId (string/number) - tek meslek seçimi için
    if (params.professionId && params.professionId !== "") {
      queryParams.append("professionId", params.professionId.toString());
    }

    // workingMethodIds (array veya virgülle ayrılmış string)
    if (params.workingMethodIds) {
      if (
        Array.isArray(params.workingMethodIds) &&
        params.workingMethodIds.length > 0
      ) {
        queryParams.append(
          "workingMethodIds",
          params.workingMethodIds.join(","),
        );
      } else if (
        typeof params.workingMethodIds === "string" &&
        params.workingMethodIds.trim() !== ""
      ) {
        queryParams.append("workingMethodIds", params.workingMethodIds.trim());
      }
    }

    // sectorIds (array veya virgülle ayrılmış string)
    if (params.sectorIds) {
      if (Array.isArray(params.sectorIds) && params.sectorIds.length > 0) {
        queryParams.append("sectorIds", params.sectorIds.join(","));
      } else if (
        typeof params.sectorIds === "string" &&
        params.sectorIds.trim() !== ""
      ) {
        queryParams.append("sectorIds", params.sectorIds.trim());
      }
    }

    // districtIds (array veya virgülle ayrılmış string)
    if (params.districtIds) {
      if (Array.isArray(params.districtIds) && params.districtIds.length > 0) {
        queryParams.append("districtIds", params.districtIds.join(","));
      } else if (
        typeof params.districtIds === "string" &&
        params.districtIds.trim() !== ""
      ) {
        queryParams.append("districtIds", params.districtIds.trim());
      }
    }

    // isForDisabled (boolean)
    if (params.isForDisabled === true) {
      queryParams.append("isForDisabled", "true");
    }

    const result = await api.get(`/jobs?${queryParams.toString()}`);

    if (result.success) {
      // API data.jobs döndürüyor, beklenen yapıya uygun hale getir
      const jobsData = result.data?.jobs || result.data?.items || [];

      // İş ilanı veri yapısını normalize et
      const normalizedJobs = jobsData
        .map((job) => ({
          id: job.id,
          title: job.postTitle || job.title,
          description: job.postDescription || job.description,
          company: job.business || job.company,
          location:
            job.districts
              ?.map((d) => d.district?.title || d.title)
              .join(", ") || job.location,
          city: job.districts?.[0]?.district?.cityId || job.city,
          type: job.workingMethod?.title || job.type,
          workingMethod: job.workingMethod,
          profession: job.professions?.profession || job.profession,
          sector: job.sector,
          salary: job.salary,
          experience: job.minExperienceYear || job.experience,
          qualifications: job.qualifications,
          hiringCount: job.hiringCount,
          workStartedAt: job.workStartedAt,
          workEndAt: job.workEndAt,
          ageMin: job.ageMin,
          ageMax: job.ageMax,
          weeklyWorkingHours: job.weeklyWorkingHours,
          genderOption: job.genderOption,
          militaryStatus: job.militaryStatus,
          coverLetterRequest: job.coverLetterRequest,
          isPostForDisabledPersons: job.isPostForDisabledPersons,
          educationLevels: job.educationLevels,
          applicantRights: job.applicantRights,
          drivingLisenceRequirements: job.drivingLisenceRequirements,
          districts: job.districts,
          workDays: job.workDays,
          hasApplied: job.hasApplied,
          isFavorited: job.isFavorited,
          is_featured: job.is_featured,
          is_urgent: job.is_urgent,
          isActive: job.isActive,
          isShown: job.isShown,
          createdAt: job.createdAt,
          // Uyumluluk için orijinal veriyi koru
          ...job,
        }))
        .filter((job) => job.isActive !== false); // Sadece aktif ilanları göster

      const paginationRaw = result.data?.pagination || {};
      set({
        jobs: normalizedJobs,
        jobPagination: {
          currentPage:
            paginationRaw.page || paginationRaw.currentPage || params.page || 1,
          totalPages: paginationRaw.totalPages || 0,
          total: paginationRaw.total || 0,
        },
        jobFilters: params,
        jobsLoading: false,
        error: null,
      });
      return { success: true };
    }

    set({
      jobs: [],
      jobPagination: {
        currentPage: params.page || 1,
        totalPages: 0,
        total: 0,
      },
      jobFilters: params,
      jobsLoading: false,
      error: result.error,
    });

    return { success: false, error: result.error, errors: result.errors || [] };
  },

  getJobDetail: async (jobId) => {
    set({ loading: true, error: null });
    const result = await api.get(`/jobs/${jobId}`);

    if (result.success) {
      const job = result.data;

      // İş ilanı veri yapısını beklenen formata uygun hale getir
      // Sadece API response'undan gelen field'ları kullan
      const normalizedJob = {
        id: job.id,
        title: job.postTitle,
        description: job.postDescription,
        location:
          job.districts?.map((d) => d.district?.title || d.title).join(", ") ||
          "",
        city: job.districts?.[0]?.district?.cityId || null,
        type: job.workingMethod?.title || "",
        workingMethod: job.workingMethod,
        profession: job.professions?.profession || "",
        experience: job.minExperienceYear || 0,
        qualifications: job.qualifications,
        hiringCount: job.hiringCount,
        workStartedAt: job.workStartedAt,
        workEndAt: job.workEndAt,
        ageMin: job.ageMin,
        ageMax: job.ageMax,
        weeklyWorkingHours: job.weeklyWorkingHours,
        genderOption: job.genderOption,
        militaryStatus: job.militaryStatus,
        isShown: job.isShown,
        isActive: job.isActive,
        applicationUntilDate: job.applicationUntilDate,
        viewCount: job.viewCount,
        applicationCount: job.applicationCount,
        coverLetterRequest: job.coverLetterRequest,
        isPostForDisabledPersons: job.isPostForDisabledPersons,
        createdAt: job.createdAt,
        educationLevels: job.educationLevels || [],
        applicantRights: job.applicantRights || [],
        drivingLisenceRequirements: job.drivingLisenceRequirements || [],
        districts: job.districts || [],
        workDays: job.workDays || [],
        hasApplied: job.hasApplied,
        isFavorited: job.isFavorited,
        // Görüntüleme için parse et
        responsibilities: job.postDescription ? [job.postDescription] : [],
        requirements: job.qualifications ? [job.qualifications] : [],
        niceToHave: [],
        benefits:
          job.applicantRights?.map(
            (ar) => ar.applicantRight?.name || ar.name,
          ) || [],
        skills: [],
        // Uyumluluk için computed field'lar
        applicants: job.applicationCount || 0,
        deadline: job.applicationUntilDate
          ? new Date(job.applicationUntilDate).toLocaleDateString("tr-TR")
          : "",
        workModel: job.workingMethod?.title || "",
        // Orijinal veriyi koru
        ...job,
      };

      set({ currentJob: normalizedJob, loading: false });
      return { success: true };
    }

    set({ error: result.error, loading: false, currentJob: null });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  updateJobFilters: (filters) => {
    set({ jobFilters: { ...get().jobFilters, ...filters } });
  },

  // ===== BAŞVURU ACTION'LARI =====
  applyToJob: async (jobId, coverLetter) => {
    set({ loading: true, error: null });
    const result = await api.post(`/jobs/${jobId}/apply`, {
      coverLetter: coverLetter || "",
    });

    if (result.success) {
      set({ loading: false });
      return { success: true, data: result.data };
    }

    // Backend'den gelen İngilizce hata mesajlarını Türkçe'ye çevir
    let errorMessage = result.error;
    if (result.error) {
      const errorLower = result.error.toLowerCase();
      if (
        errorLower.includes("account not approved") ||
        errorLower.includes("account not approved yet")
      ) {
        errorMessage =
          "Hesabınız henüz onaylanmamış. Lütfen hesap onayını bekleyin.";
      } else if (errorLower.includes("not approved")) {
        errorMessage = "Hesabınız henüz onaylanmamış.";
      }
    }

    set({ error: errorMessage, loading: false });
    return { success: false, error: errorMessage, errors: result.errors || [] };
  },

  getApplications: async (filters = {}) => {
    set({ loading: true, error: null });
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        // Array değerlerini handle et (status için virgülle ayrılmış)
        if (Array.isArray(value) && value.length > 0) {
          queryParams.append(key, value.join(","));
        } else if (typeof value === "string" && value.includes(",")) {
          // Zaten virgülle ayrılmış string (örn: "pending, accepted, rejected")
          queryParams.append(key, value);
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });
    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/jobs/applications/my?${queryString}`
      : `/jobs/applications/my`;

    // Başvurular sayfasında güncel veriyi göstermek için cache'i kullanma
    const result = await api.get(endpoint, { skipCache: true });

    if (result.success) {
      set({ loading: false });
      return { success: true, data: result.data };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  withdrawApplication: async (applicationId) => {
    set({ loading: true, error: null });
    const result = await api.delete(
      `/jobs/applications/${applicationId}/withdraw`,
    );

    if (result.success) {
      set({ loading: false });
      return { success: true, data: result.data };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  // ===== FAVORİ ACTION'LARI =====
  addToFavorites: async (jobId) => {
    set({ loading: true, error: null });
    const result = await api.post(`/jobs/favorites/${jobId}`);

    if (result.success) {
      set({ loading: false });
      return {
        success: true,
        isFavorited: result.data?.isFavorited ?? result.isFavorited ?? true,
        message: result.data?.message || result.message,
      };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  removeFromFavorites: async (jobId) => {
    set({ loading: true, error: null });
    const result = await api.delete(`/jobs/favorites/${jobId}`);

    if (result.success) {
      set({ loading: false });
      return { success: true };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  getFavorites: async () => {
    set({ loading: true, error: null });
    const result = await api.get("/jobs/favorites");

    if (result.success) {
      set({ loading: false });
      return { success: true, data: result.data };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },
});
