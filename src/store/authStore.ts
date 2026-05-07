import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type User, type Restaurant } from "@/types";

interface AuthStore {
  user: (User & { restaurant?: Restaurant | null }) | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: (User & { restaurant?: Restaurant | null }) | null) => void;
  setToken: (token: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  login: (user: User & { restaurant?: Restaurant | null }, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      setIsLoading: (isLoading) => set({ isLoading }),

      login: (user, token) =>
        set({ user, token, isAuthenticated: true, isLoading: false }),

      logout: () =>
        set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
