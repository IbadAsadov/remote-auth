import { ChakraProvider } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { AppToaster } from "../utils/toaster";
import { system } from "./index";

interface AppThemeProviderProps {
  children: ReactNode;
}

export function AppThemeProvider({ children }: AppThemeProviderProps) {
  return (
    <ChakraProvider value={system}>
      {children}
      <AppToaster />
    </ChakraProvider>
  );
}
