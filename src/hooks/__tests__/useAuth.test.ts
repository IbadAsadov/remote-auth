import { useAuth } from "@hooks/useAuth";
import { useAuthStore } from "@store/authStore";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const MOCK_USER = { id: "1", email: "user@example.com", name: "Test User" };

describe("useAuth", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isLoading: false, error: null });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns isAuthenticated=false when user is null", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("returns isAuthenticated=true when a user is set in the store", () => {
    useAuthStore.setState({ user: MOCK_USER });
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("reflects user from the store", () => {
    useAuthStore.setState({ user: MOCK_USER });
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toEqual(MOCK_USER);
  });

  it("reflects isLoading from the store", () => {
    useAuthStore.setState({ isLoading: true });
    const { result } = renderHook(() => useAuth());
    expect(result.current.isLoading).toBe(true);
  });

  it("reflects error from the store", () => {
    useAuthStore.setState({ error: "Unauthorized" });
    const { result } = renderHook(() => useAuth());
    expect(result.current.error).toBe("Unauthorized");
  });

  it("exposes login, logout, register, clearError functions", () => {
    const { result } = renderHook(() => useAuth());
    expect(typeof result.current.login).toBe("function");
    expect(typeof result.current.logout).toBe("function");
    expect(typeof result.current.register).toBe("function");
    expect(typeof result.current.clearError).toBe("function");
  });

  it("logout clears user via the hook", () => {
    useAuthStore.setState({ user: MOCK_USER });
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("clearError removes the error via the hook", () => {
    useAuthStore.setState({ error: "login failed" });
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it("updates isAuthenticated reactively when store changes", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(false);

    act(() => {
      useAuthStore.setState({ user: MOCK_USER });
    });

    expect(result.current.isAuthenticated).toBe(true);
  });
});
