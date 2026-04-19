import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRecord } from './useDatabaseStore';

interface AuthState {
  user: UserRecord | null;
  isAuthenticated: boolean;
  login: (user: UserRecord) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
);
