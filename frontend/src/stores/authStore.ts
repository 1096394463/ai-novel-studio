import { create } from "zustand";
import { authApi, type UserInfo } from "@/api/backup";

interface AuthState {
  user: UserInfo | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;

  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, nickname?: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: authApi.isLoggedIn(),
  isLoading: false,
  error: null,

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.login({ username, password });
      const res = await authApi.me();
      set({ user: res.data, isLoggedIn: true, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
      throw e;
    }
  },

  register: async (username, email, password, nickname) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.register({ username, email, password, nickname });
      const res = await authApi.me();
      set({ user: res.data, isLoggedIn: true, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
      throw e;
    }
  },

  logout: () => {
    authApi.logout();
    set({ user: null, isLoggedIn: false });
  },

  checkAuth: async () => {
    if (!authApi.isLoggedIn()) {
      set({ isLoggedIn: false, user: null });
      return;
    }
    try {
      const res = await authApi.me();
      set({ user: res.data, isLoggedIn: true });
    } catch {
      set({ isLoggedIn: false, user: null });
    }
  },

  clearError: () => set({ error: null }),
}));
