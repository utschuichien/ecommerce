import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserProfile } from '../types/auth.types';

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: UserProfile, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  setUser: (user: UserProfile) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
}

function syncAuthCookie(isAuthenticated: boolean) {
  if (typeof document !== 'undefined') {
    if (isAuthenticated) {
      document.cookie = 'is_authenticated=true; path=/; max-age=604800; SameSite=Lax';
    } else {
      document.cookie = 'is_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    }
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user: UserProfile, accessToken: string) => {
        syncAuthCookie(true);
        set({
          user,
          accessToken,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      setAccessToken: (accessToken: string) => {
        const isAuth = Boolean(accessToken);
        syncAuthCookie(isAuth);
        set({
          accessToken,
          isAuthenticated: isAuth,
        });
      },

      setUser: (user: UserProfile) =>
        set({
          user,
        }),

      setLoading: (isLoading: boolean) =>
        set({
          isLoading,
        }),

      logout: () => {
        syncAuthCookie(false);
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: 'commerce_os_auth',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.isAuthenticated) {
          syncAuthCookie(true);
        } else {
          syncAuthCookie(false);
        }
      },
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

