import { Flex, Spinner } from "@chakra-ui/react";
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const LoginPage = lazy(() =>
  import("@modules/login/components/LoginPage").then((m) => ({
    default: m.LoginPage,
  }))
);
const RegisterPage = lazy(() =>
  import("@modules/register/components/RegisterPage").then((m) => ({
    default: m.RegisterPage,
  }))
);
const ForgotPasswordPage = lazy(() =>
  import("@modules/forgot-password/components/ForgotPasswordPage").then((m) => ({
    default: m.ForgotPasswordPage,
  }))
);

function PageSpinner() {
  return (
    <Flex align="center" justify="center" minH="40vh">
      <Spinner size="lg" color="blue.500" borderWidth="3px" />
    </Flex>
  );
}

export default function AuthRoutes() {
  return (
    <Routes>
      {/* /auth → /auth/login */}
      <Route index element={<Navigate to="login" replace />} />
      <Route
        path="login"
        element={
          <Suspense fallback={<PageSpinner />}>
            <LoginPage />
          </Suspense>
        }
      />
      <Route
        path="register"
        element={
          <Suspense fallback={<PageSpinner />}>
            <RegisterPage />
          </Suspense>
        }
      />
      <Route
        path="forgot-password"
        element={
          <Suspense fallback={<PageSpinner />}>
            <ForgotPasswordPage />
          </Suspense>
        }
      />
    </Routes>
  );
}
