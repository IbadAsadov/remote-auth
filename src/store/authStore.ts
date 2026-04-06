import type { AuthUser, LoginCredentials, RegisterCredentials } from "@app-types/auth.types";
import { create } from "zustand";

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 800));
      if (Math.random() <= 0.3) {
        throw new Error("Invalid email or password. Please try again.");
      }
      set({
        user: { id: "1", email: credentials.email, name: "Demo User" },
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Login failed",
        isLoading: false,
      });
    }
  },

  register: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 800));
      set({
        user: { id: "2", email: credentials.email, name: credentials.name },
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Registration failed",
        isLoading: false,
      });
    }
  },

  logout: () => set({ user: null, error: null }),

  clearError: () => set({ error: null }),
}));
