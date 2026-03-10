import { Box, Heading, VStack } from "@chakra-ui/react";
import { LoginForm } from "./LoginForm";

export function LoginPage() {
  return (
    <Box maxW="400px" mx="auto" mt={16} px={4}>
      <VStack gap={6} align="stretch">
        <Heading size="lg" textAlign="center">
          Welcome back
        </Heading>
        <LoginForm />
      </VStack>
    </Box>
  );
}
