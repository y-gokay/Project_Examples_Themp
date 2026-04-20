/**
 * Ana Store Dosyası - Zustand State Management
 * 
 * Bu dosya, uygulamanın tüm global state'ini yönetir.
 * Store, domain'lere göre slice'lara ayrılmıştır (Slice Pattern).
 * 
 * Slice Pattern'in Avantajları:
 * - Her slice tek bir domain'e odaklanır (auth, profile, job, vb.)
 * - Kod daha organize ve bakımı kolaydır
 * - Farklı geliştiriciler farklı slice'lar üzerinde çalışabilir
 * - Test etmek daha kolaydır
 * 
 * Store Kullanımı:
 * ```javascript
 * import { useAppStore } from './store';
 * 
 * const MyComponent = () => {
 *   // Tüm store'u almak yerine sadece ihtiyacımız olanları alıyoruz
 *   const { user, login, logout } = useAppStore();
 *   
 *   return <div>{user?.name}</div>;
 * };
 * ```
 * 
 * Persist Middleware:
 * - Store state'i localStorage'a kaydedilir
 * - Sayfa yenilendiğinde state korunur
 * - Sadece önemli state'ler persist edilir (user, isAuthenticated, jobFilters)
 * 
 * @module store/appStore
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setStoreInstance } from "../lib/api";
import { authSlice } from "./slices/authSlice";
import { profileSlice } from "./slices/profileSlice";
import { jobSlice } from "./slices/jobSlice";
import { lookupSlice } from "./slices/lookupSlice";
import { businessSlice } from "./slices/businessSlice";
import { commonSlice } from "./slices/commonSlice";
import { otherSlice } from "./slices/otherSlice";

/**
 * Zustand store instance'ı
 * 
 * Slice'lar birleştirilerek tek bir store oluşturulur.
 * Her slice, kendi state ve action'larını sağlar.
 * 
 * Slice'lar:
 * - authSlice: Kimlik doğrulama (login, logout, register)
 * - profileSlice: Kullanıcı profili (getProfile, updateProfile)
 * - jobSlice: İş ilanları (searchJobs, getJobDetail, applyToJob)
 * - lookupSlice: Lookup verileri (şehirler, meslekler, vb.)
 * - businessSlice: İşveren işlemleri (createJobPost, getBusinessProfile)
 * - commonSlice: Ortak state ve utility actions
 * - otherSlice: CV, Notification, Appointment, vb.
 */
const useAppStore = create(
  persist(
    (...a) => ({
      ...authSlice(...a),
      ...profileSlice(...a),
      ...jobSlice(...a),
      ...lookupSlice(...a),
      ...businessSlice(...a),
      ...commonSlice(...a),
      ...otherSlice(...a),
    }),
    {
      name: "atim-store", // localStorage key
      // Sadece önemli state'leri persist et (performans için)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        jobFilters: state.jobFilters,
        theme: state.theme,
        // Lookup verileri 24 saat TTL ile persist edilir
        lookups: state.lookups,
        lookupsPersistedAt: state.lookupsPersistedAt,
      }),
    }
  )
);

/**
 * Store instance'ı api.js'e set et
 * 
 * Circular dependency'yi önlemek için lazy import kullanılır.
 * Store, API çağrılarında 401 hatalarında logout yapmak için kullanılır.
 * 
 * Not: Sadece browser ortamında çalışır (SSR için kontrol)
 */
if (typeof window !== "undefined") {
  setStoreInstance(useAppStore);
}

export default useAppStore;

