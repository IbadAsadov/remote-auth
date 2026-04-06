import { useAuthStore } from "@store/authStore";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const MOCK_USER = { id: "1", email: "test@example.com", name: "Demo User" };

describe("authStore", () => {
  beforeEach(() => {
    // Reset store to initial state before every test
    useAuthStore.setState({ user: null, isLoading: false, error: null });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("has correct initial state", () => {
    const { user, isLoading, error } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(isLoading).toBe(false);
    expect(error).toBeNull();
  });

  describe("login", () => {
    it("sets isLoading to true while in flight", async () => {
      vi.spyOn(Math, "random").mockReturnValue(0.9);
      const { login } = useAuthStore.getState();
      const promise = login({ email: "test@example.com", password: "pass" });

      expect(useAuthStore.getState().isLoading).toBe(true);
      expect(useAuthStore.getState().error).toBeNull();

      await vi.runAllTimersAsync();
      await promise;
    });

    it("sets user and clears isLoading after successful login", async () => {
      vi.spyOn(Math, "random").mockReturnValue(0.9);
      const { login } = useAuthStore.getState();
      const promise = login({ email: "test@example.com", password: "pass" });

      await vi.runAllTimersAsync();
      await promise;

      const { user, isLoading } = useAuthStore.getState();
      expect(user).toMatchObject({ email: "test@example.com", name: "Demo User" });
      expect(isLoading).toBe(false);
    });

    it("preserves user id after login", async () => {
      vi.spyOn(Math, "random").mockReturnValue(0.9);
      const { login } = useAuthStore.getState();
      const promise = login({ email: "test@example.com", password: "pass" });

      await vi.runAllTimersAsync();
      await promise;

      expect(useAuthStore.getState().user?.id).toBe("1");
    });

    it("sets error and clears isLoading after failed login", async () => {
      vi.spyOn(Math, "random").mockReturnValue(0.1);
      const { login } = useAuthStore.getState();
      const promise = login({ email: "test@example.com", password: "pass" });

      await vi.runAllTimersAsync();
      await promise;

      const { user, isLoading, error } = useAuthStore.getState();
      expect(user).toBeNull();
      expect(isLoading).toBe(false);
      expect(error).toBe("Invalid email or password. Please try again.");
    });
  });

  describe("register", () => {
    it("sets isLoading to true while in flight", async () => {
      const { register } = useAuthStore.getState();
      const promise = register({ name: "Alice", email: "alice@example.com", password: "pass" });

      expect(useAuthStore.getState().isLoading).toBe(true);

      await vi.runAllTimersAsync();
      await promise;
    });

    it("sets user with provided name after registration", async () => {
      const { register } = useAuthStore.getState();
      const promise = register({ name: "Alice", email: "alice@example.com", password: "pass" });

      await vi.runAllTimersAsync();
      await promise;

      const { user, isLoading } = useAuthStore.getState();
      expect(user).toMatchObject({ name: "Alice", email: "alice@example.com" });
      expect(isLoading).toBe(false);
    });
  });

  describe("logout", () => {
    it("clears user and error", () => {
      useAuthStore.setState({ user: MOCK_USER, error: "stale error" });

      useAuthStore.getState().logout();

      const { user, error } = useAuthStore.getState();
      expect(user).toBeNull();
      expect(error).toBeNull();
    });
  });

  describe("clearError", () => {
    it("sets error back to null", () => {
      useAuthStore.setState({ error: "something went wrong" });

      useAuthStore.getState().clearError();

      expect(useAuthStore.getState().error).toBeNull();
    });

    it("does not affect user or isLoading", () => {
      useAuthStore.setState({ user: MOCK_USER, isLoading: false, error: "err" });

      useAuthStore.getState().clearError();

      expect(useAuthStore.getState().user).toEqual(MOCK_USER);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });
});
