import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthUser, Role } from '@/types/api';

interface AppState {
  token: string | null;
  user: AuthUser | null;
  selectedVenueId: number | null;
  setAuth: (payload: { token: string; user: AuthUser }) => void;
  setUser: (user: AuthUser) => void;
  setSelectedVenueId: (venueId: number | null) => void;
  login: (email: string, password: string) => Promise<void>;
  hydrate: () => Promise<void>;
  logout: () => void;
  hasRole: (role: Role) => boolean;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      selectedVenueId: null,
      setAuth: ({ token, user }) => {
        const selectedVenueId =
          user.role === 'VENUE_ADMIN' ? user.venueId : get().selectedVenueId;
        set({ token, user, selectedVenueId });
      },
      setUser: (user) => {
        const selectedVenueId =
          user.role === 'VENUE_ADMIN' ? user.venueId : get().selectedVenueId;
        set({ user, selectedVenueId });
      },
      setSelectedVenueId: (venueId) => set({ selectedVenueId: venueId }),
      login: async (email, password) => {
        const { login: loginRequest } = await import('@/services/auth');
        const res = await loginRequest(email, password);
        get().setAuth({ token: res.token, user: res.user });
      },
      hydrate: async () => {
        const { me } = await import('@/services/auth');
        const user = await me();
        get().setUser(user);
      },
      logout: () => set({ token: null, user: null, selectedVenueId: null }),
      hasRole: (role) => get().user?.role === role,
    }),
    {
      name: 'qr-admin-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        selectedVenueId: state.selectedVenueId,
      }),
    },
  ),
);
