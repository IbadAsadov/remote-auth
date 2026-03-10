import { type LoginFormData, loginSchema } from "@app-types/auth.types";
import { Alert, Box, Button, Flex, IconButton, Link, Text, VStack } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormInput } from "@modules/shared/components/form/FormInput";
import { toaster } from "@utils/toaster";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Link as RouterLink, useNavigate } from "react-router-dom";

function EyeIcon() {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: Decorative SVG
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: Decorative SVG
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export function LoginForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const methods = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: LoginFormData) => {
    setSubmitError(null);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const success = Math.random() > 0.3;
    if (success) {
      toaster.create({
        title: "Welcome back!",
        description: `Signed in as ${data.email}`,
        type: "success",
      });
      navigate("/dashboard");
    } else {
      setSubmitError("Invalid email or password. Please try again.");
    }
  };

  return (
    <FormProvider {...methods}>
      <Box as="form" onSubmit={handleSubmit(onSubmit)} w="full">
        <VStack gap={4}>
          <FormInput<LoginFormData>
            name="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            required
          />

          <FormInput<LoginFormData>
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            required
            rightElement={
              <IconButton
                aria-label={showPassword ? "Hide password" : "Show password"}
                variant="ghost"
                size="xs"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </IconButton>
            }
          />

          <Flex w="full" justify="flex-end">
            <Link asChild fontSize="sm" color="brand.600">
              <RouterLink to="/auth/forgot-password">Forgot password?</RouterLink>
            </Link>
          </Flex>

          {submitError && (
            <Alert.Root status="error" borderRadius="md">
              <Alert.Indicator />
              <Alert.Title>{submitError}</Alert.Title>
            </Alert.Root>
          )}

          <Button
            type="submit"
            colorPalette="brand"
            w="full"
            loading={isSubmitting}
            loadingText="Signing in..."
          >
            Sign In
          </Button>

          <Text fontSize="sm" color="fg.muted">
            Don&apos;t have an account?{" "}
            <Link asChild color="brand.600" fontWeight="medium">
              <RouterLink to="/auth/register">Register</RouterLink>
            </Link>
          </Text>
        </VStack>
      </Box>
    </FormProvider>
  );
}
