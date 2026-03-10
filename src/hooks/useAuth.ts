import { useAuthStore } from "@store/authStore";

export function useAuth() {
  const { user, isLoading, error, login, register, logout, clearError } = useAuthStore();

  return {
    user,
    isLoading,
    error,
    isAuthenticated: user !== null,
    login,
    register,
    logout,
    clearError,
  };
}
