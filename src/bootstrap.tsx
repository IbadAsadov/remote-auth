import { Box, Flex, Link, Text } from "@chakra-ui/react";
import { AppThemeProvider } from "@theme/AppThemeProvider";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Link as RouterLink, Routes } from "react-router-dom";
import AuthRoutes from "./routes/AuthRoutes";

function DevBar() {
  return (
    <Flex
      align="center"
      px={6}
      h="44px"
      bg="orange.50"
      borderBottom="1px solid"
      borderColor="orange.200"
      gap={5}
    >
      <Text fontSize="xs" fontWeight="bold" color="orange.600" letterSpacing="wide">
        ▶ AUTH DEV
      </Text>
      <Link asChild fontSize="sm">
        <RouterLink to="/auth/login">Login</RouterLink>
      </Link>
      <Link asChild fontSize="sm">
        <RouterLink to="/auth/register">Register</RouterLink>
      </Link>
      <Link asChild fontSize="sm">
        <RouterLink to="/auth/forgot-password">Forgot Password</RouterLink>
      </Link>
    </Flex>
  );
}

const container = document.getElementById("root");
if (!container) {
  throw new Error("[remote-auth] Root element #root not found in the DOM.");
}

createRoot(container).render(
  <StrictMode>
    <AppThemeProvider>
      <BrowserRouter>
        <DevBar />
        <Box pt={4}>
          <Routes>
            <Route path="/" element={<Navigate to="/auth/login" replace />} />
            <Route path="/auth/*" element={<AuthRoutes />} />
          </Routes>
        </Box>
      </BrowserRouter>
    </AppThemeProvider>
  </StrictMode>
);
