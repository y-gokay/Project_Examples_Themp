import { api, clearCacheForEndpoint } from "../../lib/api";

/**
 * Profile Slice - Kullanıcı profili ile ilgili state ve action'lar
 */
export const profileSlice = (set, get) => ({
  // ===== PROFİL ACTION'LARI =====
  getProfile: async () => {
    set({ loading: true, error: null });
    const result = await api.get("/users/profile");

    if (result.success && result.data) {
      const profileData = result.data;

      // Mevcut user'dan role'ü al (eğer varsa)
      const currentUser = get().user;

      // API response'unu frontend formatına dönüştür
      const user = {
        id: profileData.id,
        name: profileData.name,
        surname: profileData.surname,
        email: profileData.email,
        phone: profileData.phoneNumber,
        phoneNumber: profileData.phoneNumber,
        secondaryPhone: profileData.secondaryPhone,
        tc: profileData.tc,
        avatar: profileData.profilePicture,
        profilePicture: profileData.profilePicture,
        gender: profileData.gender,
        birthday: profileData.birthday,
        nationalityId: profileData.nationalityId,
        nationality: profileData.nationality,
        address:
          profileData.address ||
          profileData.ikametgahAddress ||
          profileData.addressText,
        addressText:
          profileData.addressText ||
          profileData.address ||
          profileData.ikametgahAddress,
        addressNeighbourhoodId: profileData.addressNeighbourhoodId || null,
        ikametgahAddress:
          profileData.ikametgahAddress ||
          profileData.address ||
          profileData.addressText,
        district: profileData.ikametgahDistrictRef?.title || null,
        ikametgahDistrict: profileData.ikametgahDistrict,
        ikametgahDistrictRef: profileData.ikametgahDistrictRef,
        city: profileData.ikametgahDistrictRef?.city?.title || null,
        workingStatus: profileData.workingStatus,
        militaryStatus: profileData.militaryStatus,
        retirementStatus: profileData.retirementStatus,
        smokingStatus: profileData.smokingStatus,
        isDisabledPerson: profileData.isDisabledPerson,
        isMarried: profileData.isMarried,
        isCriminalRecorded: profileData.isCriminalRecorded,
        criminalRecordFile: profileData.criminalRecordFile,
        ikametgahFile: profileData.ikametgahFile,
        neighbourhood: profileData.neighbourhood,
        neighbourhoodId:
          profileData.addressNeighbourhoodId ||
          profileData.neighbourhood?.id ||
          null,
        isPhoneApproved: profileData.isPhoneApproved,
        isEmailApproved: profileData.isEmailApproved,
        isApproved: profileData.isApproved,
        // Role'ü mevcut user'dan al veya default olarak "seeker" kullan
        role: currentUser?.role || profileData.role || "seeker",
        userType: currentUser?.userType || profileData.userType || "user",
        // İlişkili veriler
        sectors: profileData.sectors || [],
        workExperiences: profileData.workExperiences || [],
        languages: profileData.languages || [],
        exams: profileData.exams || [],
        drivingLisences: profileData.drivingLisences || [],
        educations: profileData.educations || [],
        professions: profileData.professions || [],
        // Frontend için mapping işlemi
        education: profileData.educations || [],
        experience: profileData.workExperiences || [],
        skills: profileData.professions || [],
        // Description
        description: profileData.description || null,
      };

      set({ user, loading: false });
      return { success: true, data: profileData };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  updateProfile: async (profileData) => {
    set({ loading: true, error: null });
    const result = await api.put("/users/profile", profileData);

    if (result.success) {
      // Cache'i temizle ve profili tekrar çek
      clearCacheForEndpoint("/users/profile", "GET");
      await get().getProfile();
      return { success: true, data: result.data };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  updateDescription: async (description) => {
    set({ loading: true, error: null });
    const result = await api.post("/users/description", { description });

    if (result.success) {
      // Cache'i temizle ve profili tekrar çek
      clearCacheForEndpoint("/users/profile", "GET");
      await get().getProfile();
      return { success: true, data: result.data };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  getUserStatistics: async () => {
    set({ loading: true, error: null });
    const result = await api.get("/users/statistics");

    if (result.success && result.data) {
      set({ loading: false });
      return { success: true, data: result.data };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  getJobRecommendations: async () => {
    set({ loading: true, error: null });
    const result = await api.get("/users/job-recommendations");

    if (result.success && result.data) {
      set({ loading: false });
      return { success: true, data: result.data };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  uploadProfilePicture: async (file) => {
    set({ loading: true, error: null });
    const formData = new FormData();
    formData.append("profilePicture", file);

    const result = await api.post("/users/profile-picture", formData);

    if (result.success) {
      // Cache'i temizle ve profili tekrar çek
      clearCacheForEndpoint("/users/profile", "GET");
      await get().getProfile();
      return { success: true, data: result.data };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  deleteProfilePicture: async () => {
    set({ loading: true, error: null });
    const result = await api.delete("/users/profile-picture");

    if (result.success) {
      // Cache'i temizle ve profili tekrar çek
      clearCacheForEndpoint("/users/profile", "GET");
      await get().getProfile();
      return { success: true };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  uploadIkametgah: async (file) => {
    set({ loading: true, error: null });
    const formData = new FormData();
    formData.append("document", file);

    const result = await api.post("/users/set-ikametgah", formData);

    if (result.success) {
      // Cache'i temizle ve profili tekrar çek
      clearCacheForEndpoint("/users/profile", "GET");
      await get().getProfile();
      return { success: true, data: result.data };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  uploadCriminalRecord: async (file, isCriminalRecorded = false) => {
    set({ loading: true, error: null });
    const formData = new FormData();
    formData.append("document", file);
    formData.append("isCriminalRecorded", isCriminalRecorded.toString());

    const result = await api.post("/users/set-criminal-records", formData);

    if (result.success) {
      // Cache'i temizle ve profili tekrar çek
      clearCacheForEndpoint("/users/profile", "GET");
      await get().getProfile();
      return { success: true, data: result.data };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  updateCriminalRecordStatus: async (isCriminalRecorded) => {
    set({ loading: true, error: null });
    const formData = new FormData();
    formData.append("isCriminalRecorded", isCriminalRecorded.toString());

    // Dosya gerekmez - sadece isCriminalRecorded status'unu güncelle
    const result = await api.post("/users/set-criminal-records", formData);

    if (result.success) {
      // Cache'i temizle ve profili tekrar çek
      clearCacheForEndpoint("/users/profile", "GET");
      await get().getProfile();
      return { success: true, data: result.data };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  // ===== ŞİFRE DEĞİŞTİRME =====
  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    set({ loading: true, error: null });
    const result = await api.put("/users/change-password", {
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (result.success) {
      set({ loading: false });
      return { success: true };
    }

    // API'den gelen hata formatı: { success: false, errors: [{ field, message }] }
    const errorMessage =
      result.error ||
      (result.errors && result.errors.map((e) => e.message).join(", ")) ||
      "Şifre değiştirilemedi";

    set({ error: errorMessage, loading: false });
    return { success: false, error: errorMessage, errors: result.errors };
  },

  // ===== E-POSTA DOĞRULAMA =====
  sendEmailVerificationCode: async () => {
    // Global loading state'i set etme - sadece local loading kullanılacak
    const result = await api.post("/users/email/send-code");

    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error, errors: result.errors || [] };
  },

  verifyEmail: async (code) => {
    // Global loading state'i set etme - sadece local loading kullanılacak
    const result = await api.post("/users/email/verify", { code });

    if (result.success) {
      // Profil güncellendi, tekrar çek
      await get().getProfile();
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error, errors: result.errors || [] };
  },

  // ===== TELEFON DOĞRULAMA =====
  sendPhoneVerificationCode: async () => {
    // Global loading state'i set etme - sadece local loading kullanılacak
    const result = await api.post("/users/phone/send-code");

    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error, errors: result.errors || [] };
  },

  verifyPhone: async (code) => {
    // Global loading state'i set etme - sadece local loading kullanılacak
    const result = await api.post("/users/phone/verify", { code });

    if (result.success) {
      // Cache'i temizle ve profili tekrar çek
      clearCacheForEndpoint("/users/profile", "GET");
      await get().getProfile();
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error, errors: result.errors || [] };
  },

  // ===== E-POSTA DEĞİŞTİRME =====
  requestEmailChange: async (newEmail) => {
    // Global loading state'i set etme - sadece local loading kullanılacak
    const result = await api.post("/users/email/change-request", {
      newEmail,
    });

    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error, errors: result.errors || [] };
  },

  verifyEmailChange: async (code) => {
    // Global loading state'i set etme - sadece local loading kullanılacak
    const result = await api.post("/users/email/change-verify", { code });

    if (result.success) {
      // Profil güncellendi, tekrar çek
      await get().getProfile();
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error, errors: result.errors || [] };
  },

  // ===== TELEFON DEĞİŞTİRME =====
  requestPhoneChange: async (newPhoneNumber) => {
    // Global loading state'i set etme - sadece local loading kullanılacak
    const result = await api.post("/users/phone/change-request", {
      newPhoneNumber: newPhoneNumber,
    });

    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error, errors: result.errors || [] };
  },

  verifyPhoneChange: async (code) => {
    // Global loading state'i set etme - sadece local loading kullanılacak
    const result = await api.post("/users/phone/change-verify", { code });

    if (result.success) {
      // Cache'i temizle ve profili tekrar çek
      clearCacheForEndpoint("/users/profile", "GET");
      await get().getProfile();
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error, errors: result.errors || [] };
  },

  // ===== SECTOR ACTIONS =====
  addSector: async (sectorId) => {
    set({ loading: true, error: null });
    const result = await api.post("/users/sectors", { sectorId });

    if (result.success) {
      // Cache'i temizle ve profili tekrar çek
      clearCacheForEndpoint("/users/profile", "GET");
      await get().getProfile();
      set({ loading: false });
      return { success: true, data: result.data };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  removeSector: async (sectorId) => {
    set({ loading: true, error: null });
    const result = await api.delete(`/users/sectors/${sectorId}`);

    if (result.success) {
      // Cache'i temizle ve profili tekrar çek
      clearCacheForEndpoint("/users/profile", "GET");
      await get().getProfile();
      set({ loading: false });
      return { success: true };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  // ===== LANGUAGE ACTIONS =====
  addLanguage: async (languageData) => {
    set({ loading: true, error: null });
    const result = await api.post("/users/languages", languageData);

    if (result.success) {
      // Profil güncellendi, tekrar çek
      await get().getProfile();
      set({ loading: false });
      return { success: true, data: result.data };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  deleteLanguage: async (languageId) => {
    set({ loading: true, error: null });
    const result = await api.delete(`/users/languages/${languageId}`);

    if (result.success) {
      // Cache'i temizle ve profili tekrar çek
      clearCacheForEndpoint("/users/profile", "GET");
      await get().getProfile();
      return { success: true };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  // ===== EXAM ACTIONS =====
  addExam: async (examData) => {
    // examData: { examId: number, point: number, attemptDate?: string }
    set({ loading: true, error: null });
    const result = await api.post("/users/exams", examData);

    if (result.success) {
      // Cache'i temizle ve profili tekrar çek
      clearCacheForEndpoint("/users/profile", "GET");
      await get().getProfile();
      return { success: true, data: result.data };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  deleteExam: async (examId) => {
    set({ loading: true, error: null });
    const result = await api.delete(`/users/exams/${examId}`);

    if (result.success) {
      // Profil güncellendi, tekrar çek
      clearCacheForEndpoint("/users/profile", "GET");
      await get().getProfile();
      set({ loading: false });
      return { success: true };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  // ===== DRIVING LICENSE ACTIONS =====
  addDrivingLicense: async (drivingLicenseTypeId) => {
    set({ loading: true, error: null });
    // Note: API uses "drivingListenceTypeId" (typo in API)
    const result = await api.post("/users/driving-licenses", {
      drivingListenceTypeId: drivingLicenseTypeId,
    });

    if (result.success) {
      // Cache'i temizle ve profili tekrar çek
      clearCacheForEndpoint("/users/profile", "GET");
      await get().getProfile();
      return { success: true, data: result.data };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  deleteDrivingLicense: async (licenseTypeId) => {
    set({ loading: true, error: null });
    const result = await api.delete(`/users/driving-licenses/${licenseTypeId}`);

    if (result.success) {
      // Profil güncellendi, tekrar çek
      clearCacheForEndpoint("/users/profile", "GET");
      await get().getProfile();
      set({ loading: false });
      return { success: true };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  // ===== EDUCATION ACTIONS =====
  addEducation: async (educationData) => {
    set({ loading: true, error: null });
    const result = await api.post("/users/educations", educationData);

    if (result.success) {
      // Cache'i temizle ve profili tekrar çek
      clearCacheForEndpoint("/users/profile", "GET");
      await get().getProfile();
      return { success: true, data: result.data };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  deleteEducation: async (educationId) => {
    set({ loading: true, error: null });
    const result = await api.delete(`/users/educations/${educationId}`);

    if (result.success) {
      // Profil güncellendi, tekrar çek
      clearCacheForEndpoint("/users/profile", "GET");
      await get().getProfile();
      set({ loading: false });
      return { success: true };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  // ===== PROFESSION ACTIONS =====
  addProfession: async (professionData) => {
    set({ loading: true, error: null });
    const result = await api.post("/users/professions", professionData);

    if (result.success) {
      // Cache'i temizle ve profili tekrar çek
      clearCacheForEndpoint("/users/profile", "GET");
      await get().getProfile();
      return { success: true, data: result.data };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  deleteProfession: async (professionId) => {
    set({ loading: true, error: null });
    const result = await api.delete(`/users/professions/${professionId}`);

    if (result.success) {
      // Cache'i temizle ve profili tekrar çek
      clearCacheForEndpoint("/users/profile", "GET");
      await get().getProfile();
      return { success: true };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  // ===== WORK EXPERIENCE ACTIONS =====
  addWorkExperience: async (workExperienceData) => {
    set({ loading: true, error: null });
    const result = await api.post(
      "/users/work-experiences",
      workExperienceData
    );

    if (result.success) {
      // Cache'i temizle ve profili tekrar çek
      clearCacheForEndpoint("/users/profile", "GET");
      await get().getProfile();
      return { success: true, data: result.data };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  deleteWorkExperience: async (workExperienceId) => {
    set({ loading: true, error: null });
    const result = await api.delete(
      `/users/work-experiences/${workExperienceId}`
    );

    if (result.success) {
      // Cache'i temizle ve profili tekrar çek
      clearCacheForEndpoint("/users/profile", "GET");
      await get().getProfile();
      return { success: true };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },
});
