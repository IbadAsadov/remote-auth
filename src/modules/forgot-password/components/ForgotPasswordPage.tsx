import { Box, Button, Heading, Link, Text, VStack } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormInput } from "@modules/shared/components/form/FormInput";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Link as RouterLink } from "react-router-dom";
import { z } from "zod";

const forgotSchema = z.object({
  email: z.string().email("Invalid email format"),
});
type ForgotFormData = z.infer<typeof forgotSchema>;

export function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const methods = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: ForgotFormData) => {
    await new Promise<void>((resolve) => setTimeout(resolve, 800));
    setSubmittedEmail(data.email);
    setSubmitted(true);
  };

  return (
    <Box maxW="400px" mx="auto" mt={16} px={4}>
      <VStack gap={6} align="stretch">
        <Heading size="lg" textAlign="center">
          Reset your password
        </Heading>

        {submitted ? (
          <Text textAlign="center" color="green.600">
            If an account exists for <strong>{submittedEmail}</strong>, you will receive a reset
            link shortly.
          </Text>
        ) : (
          <FormProvider {...methods}>
            <Box as="form" onSubmit={handleSubmit(onSubmit)} w="full">
              <VStack gap={4}>
                <Text fontSize="sm" color="fg.muted">
                  Enter the email address associated with your account and we&apos;ll send you a
                  link to reset your password.
                </Text>
                <FormInput<ForgotFormData>
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
                <Button type="submit" colorPalette="brand" w="full" loading={isSubmitting}>
                  Send Reset Link
                </Button>
              </VStack>
            </Box>
          </FormProvider>
        )}

        <Text fontSize="sm" textAlign="center">
          <Link asChild color="fg.muted">
            <RouterLink to="/auth/login">Back to Sign In</RouterLink>
          </Link>
        </Text>
      </VStack>
    </Box>
  );
}
