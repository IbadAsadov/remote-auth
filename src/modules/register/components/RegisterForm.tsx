import { type RegisterFormData, registerSchema } from "@app-types/auth.types";
import {
  Alert,
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Link,
  Spinner,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormCheckbox } from "@modules/shared/components/form/FormCheckbox";
import { FormInput } from "@modules/shared/components/form/FormInput";
import { FormSelect } from "@modules/shared/components/form/FormSelect";
import { FormTextarea } from "@modules/shared/components/form/FormTextarea";
import { StepIndicator } from "@modules/shared/components/form/StepIndicator";
import { toaster } from "@utils/toaster";
import { useCallback, useRef, useState } from "react";
import { FormProvider, type Path, useForm } from "react-hook-form";
import { Link as RouterLink, useNavigate } from "react-router-dom";

const STEP_FIELDS: Record<number, Path<RegisterFormData>[]> = {
  0: ["firstName", "lastName", "dateOfBirth"],
  1: ["email", "username", "password", "confirmPassword"],
  2: ["role", "newsletter"],
};

const STEP_LABELS = ["Personal", "Account", "Preferences", "Review"];

const ROLE_OPTIONS = [
  { value: "Developer", label: "Developer" },
  { value: "Designer", label: "Designer" },
  { value: "Manager", label: "Manager" },
  { value: "Other", label: "Other" },
];

export function RegisterForm() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isValidatingEmail, setIsValidatingEmail] = useState(false);
  const emailDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const methods = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      role: "Developer",
      newsletter: false,
      bio: "",
    },
    mode: "onTouched",
  });

  const {
    handleSubmit,
    trigger,
    getValues,
    setError,
    formState: { isSubmitting },
  } = methods;

  const handleEmailBlur = useCallback(() => {
    if (emailDebounceRef.current) clearTimeout(emailDebounceRef.current);
    emailDebounceRef.current = setTimeout(async () => {
      const email = getValues("email");
      if (!email) return;
      setIsValidatingEmail(true);
      await new Promise((resolve) => setTimeout(resolve, 400));
      if (email.toLowerCase().includes("taken")) {
        setError("email", { message: "Email already in use" });
      }
      setIsValidatingEmail(false);
    }, 300);
  }, [getValues, setError]);

  const handleNext = async () => {
    const fields = STEP_FIELDS[currentStep] ?? [];
    const valid = await trigger(fields);
    if (valid) setCurrentStep((s) => s + 1);
  };

  const handleBack = () => setCurrentStep((s) => s - 1);

  const onSubmit = async (data: RegisterFormData) => {
    setSubmitError(null);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    if (Math.random() > 0.2) {
      toaster.create({
        title: "Account created!",
        description: `Welcome, ${data.firstName}!`,
        type: "success",
      });
      navigate("/auth/login");
    } else {
      setSubmitError("Something went wrong. Please try again.");
    }
  };

  const values = getValues();

  return (
    <FormProvider {...methods}>
      <Box w="full">
        <StepIndicator steps={STEP_LABELS} currentStep={currentStep} />

        <Box as="form" onSubmit={handleSubmit(onSubmit)}>
          {/* ── Step 0: Personal Info ──────────────────────────────────── */}
          {currentStep === 0 && (
            <VStack gap={4}>
              <FormInput<RegisterFormData>
                name="firstName"
                label="First Name"
                placeholder="John"
                required
              />
              <FormInput<RegisterFormData>
                name="lastName"
                label="Last Name"
                placeholder="Doe"
                required
              />
              <FormInput<RegisterFormData>
                name="dateOfBirth"
                label="Date of Birth"
                type="date"
                required
              />
            </VStack>
          )}

          {/* ── Step 1: Account ───────────────────────────────────────── */}
          {currentStep === 1 && (
            <VStack gap={4}>
              <FormInput<RegisterFormData>
                name="email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                required
                rightElement={
                  isValidatingEmail ? <Spinner size="xs" color="brand.500" /> : undefined
                }
                onBlur={handleEmailBlur}
              />
              <FormInput<RegisterFormData>
                name="username"
                label="Username"
                placeholder="john_doe"
                helperText="Lowercase letters, numbers, underscores only"
                required
              />
              <FormInput<RegisterFormData>
                name="password"
                label="Password"
                type="password"
                placeholder="••••••••"
                required
              />
              <FormInput<RegisterFormData>
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                required
              />
            </VStack>
          )}

          {/* ── Step 2: Preferences ───────────────────────────────────── */}
          {currentStep === 2 && (
            <VStack gap={4}>
              <FormSelect<RegisterFormData>
                name="role"
                label="Role"
                options={ROLE_OPTIONS}
                placeholder="Select your role"
                required
              />
              <FormTextarea<RegisterFormData>
                name="bio"
                label="Bio"
                placeholder="Tell us about yourself…"
                maxLength={200}
                showCounter
                rows={4}
              />
              <FormCheckbox<RegisterFormData>
                name="newsletter"
                label="Subscribe to newsletter"
                description="Receive product updates, tips, and announcements."
              />
            </VStack>
          )}

          {/* ── Step 3: Review ────────────────────────────────────────── */}
          {currentStep === 3 && (
            <VStack gap={4} align="stretch">
              <Heading size="sm">Review your information</Heading>

              {/* Personal */}
              <Card.Root>
                <Card.Header pb={2}>
                  <Flex justify="space-between" align="center">
                    <Text fontWeight="semibold" fontSize="sm">
                      Personal Info
                    </Text>
                    <Button size="xs" variant="ghost" onClick={() => setCurrentStep(0)}>
                      Edit
                    </Button>
                  </Flex>
                </Card.Header>
                <Card.Body pt={0}>
                  <Table.Root size="sm">
                    <Table.Body>
                      <Table.Row>
                        <Table.Cell color="fg.muted">First Name</Table.Cell>
                        <Table.Cell>{values.firstName}</Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell color="fg.muted">Last Name</Table.Cell>
                        <Table.Cell>{values.lastName}</Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell color="fg.muted">Date of Birth</Table.Cell>
                        <Table.Cell>{values.dateOfBirth}</Table.Cell>
                      </Table.Row>
                    </Table.Body>
                  </Table.Root>
                </Card.Body>
              </Card.Root>

              {/* Account */}
              <Card.Root>
                <Card.Header pb={2}>
                  <Flex justify="space-between" align="center">
                    <Text fontWeight="semibold" fontSize="sm">
                      Account
                    </Text>
                    <Button size="xs" variant="ghost" onClick={() => setCurrentStep(1)}>
                      Edit
                    </Button>
                  </Flex>
                </Card.Header>
                <Card.Body pt={0}>
                  <Table.Root size="sm">
                    <Table.Body>
                      <Table.Row>
                        <Table.Cell color="fg.muted">Email</Table.Cell>
                        <Table.Cell>{values.email}</Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell color="fg.muted">Username</Table.Cell>
                        <Table.Cell>{values.username}</Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell color="fg.muted">Password</Table.Cell>
                        <Table.Cell>{"•".repeat(8)}</Table.Cell>
                      </Table.Row>
                    </Table.Body>
                  </Table.Root>
                </Card.Body>
              </Card.Root>

              {/* Preferences */}
              <Card.Root>
                <Card.Header pb={2}>
                  <Flex justify="space-between" align="center">
                    <Text fontWeight="semibold" fontSize="sm">
                      Preferences
                    </Text>
                    <Button size="xs" variant="ghost" onClick={() => setCurrentStep(2)}>
                      Edit
                    </Button>
                  </Flex>
                </Card.Header>
                <Card.Body pt={0}>
                  <Table.Root size="sm">
                    <Table.Body>
                      <Table.Row>
                        <Table.Cell color="fg.muted">Role</Table.Cell>
                        <Table.Cell>{values.role}</Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell color="fg.muted">Newsletter</Table.Cell>
                        <Table.Cell>{values.newsletter ? "Yes" : "No"}</Table.Cell>
                      </Table.Row>
                      {values.bio && (
                        <Table.Row>
                          <Table.Cell color="fg.muted">Bio</Table.Cell>
                          <Table.Cell>{values.bio}</Table.Cell>
                        </Table.Row>
                      )}
                    </Table.Body>
                  </Table.Root>
                </Card.Body>
              </Card.Root>

              {submitError && (
                <Alert.Root status="error" borderRadius="md">
                  <Alert.Indicator />
                  <Alert.Title>{submitError}</Alert.Title>
                </Alert.Root>
              )}
            </VStack>
          )}

          {/* ── Navigation ────────────────────────────────────────────── */}
          <Flex justify="space-between" mt={6} gap={3}>
            {currentStep > 0 ? (
              <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
                Back
              </Button>
            ) : (
              <Box />
            )}

            {currentStep < 3 ? (
              <Button colorPalette="brand" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                colorPalette="brand"
                loading={isSubmitting}
                loadingText="Creating account…"
              >
                Create Account
              </Button>
            )}
          </Flex>

          {currentStep === 0 && (
            <Text fontSize="sm" color="fg.muted" mt={4} textAlign="center">
              Already have an account?{" "}
              <Link asChild color="brand.600" fontWeight="medium">
                <RouterLink to="/auth/login">Sign in</RouterLink>
              </Link>
            </Text>
          )}
        </Box>
      </Box>
    </FormProvider>
  );
}
