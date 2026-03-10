import { Box, Heading, VStack } from "@chakra-ui/react";
import { RegisterForm } from "./RegisterForm";

/**
 * RegisterPage — full-page layout wrapper around RegisterForm.
 * Navigation, error handling, and footer links are owned by RegisterForm.
 */
export function RegisterPage() {
  return (
    <Box maxW="540px" mx="auto" mt={10} px={4} pb={10}>
      <VStack gap={6} align="stretch">
        <Heading size="lg" textAlign="center">
          Create your account
        </Heading>
        <RegisterForm />
      </VStack>
    </Box>
  );
}
