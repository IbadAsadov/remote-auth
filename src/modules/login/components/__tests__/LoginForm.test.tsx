import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "../../../../store/authStore";
import { render } from "../../../../test-utils";
import { LoginForm } from "../LoginForm";

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("@utils/toaster", () => ({
  toaster: { create: vi.fn() },
}));

function setup() {
  const user = userEvent.setup();
  render(<LoginForm />);
  return { user };
}

describe("LoginForm", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    useAuthStore.setState({ user: null, isLoading: false, error: null });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    useAuthStore.setState({ user: null, isLoading: false, error: null });
  });

  it("renders email and password input fields", () => {
    setup();
    expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
  });

  it("renders the Sign In submit button", () => {
    setup();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("renders a link to the register page", () => {
    setup();
    expect(screen.getByText(/register/i)).toBeInTheDocument();
  });

  it("renders a password visibility toggle button", () => {
    setup();
    expect(screen.getByRole("button", { name: /show password/i })).toBeInTheDocument();
  });

  it("shows an error when the email field is blurred while empty", async () => {
    const { user } = setup();

    await user.click(screen.getByRole("textbox", { name: /email/i }));
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it("shows an error when submitting with an invalid email format", async () => {
    const { user } = setup();

    await user.type(screen.getByRole("textbox", { name: /email/i }), "notanemail");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it("shows a password-required error when password is blurred while empty", async () => {
    const { user } = setup();

    await user.type(screen.getByRole("textbox", { name: /email/i }), "a@b.com");
    await user.click(screen.getByLabelText(/^password$/i));
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it("toggles password field visibility", async () => {
    const { user } = setup();
    const passwordInput = screen.getByLabelText(/^password$/i);

    expect(passwordInput).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: /show password/i }));

    expect(passwordInput).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: /hide password/i })).toBeInTheDocument();
  });

  it("shows an error alert when login fails", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0.1); // < 0.3 → failure
    const { user } = setup();

    await user.type(screen.getByRole("textbox", { name: /email/i }), "test@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(
      () => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("navigates to /dashboard on successful login", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0.9); // > 0.3 → success
    const { user } = setup();

    await user.type(screen.getByRole("textbox", { name: /email/i }), "test@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
      },
      { timeout: 3000 }
    );
  });
});
