import { Box, Flex, Text } from "@chakra-ui/react";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <Flex align="center" mb={8} gap={0}>
      {steps.map((label, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <Flex key={label} align="center" flex={index < steps.length - 1 ? 1 : undefined}>
            {/* Circle */}
            <Flex direction="column" align="center" gap={1} flexShrink={0}>
              <Box position="relative">
                {/* Pulsing ring on current step */}
                {isCurrent && (
                  <Box
                    position="absolute"
                    inset="-4px"
                    borderRadius="full"
                    border="2px solid"
                    borderColor="brand.400"
                    opacity={0.5}
                    style={{
                      animation: "mf-pulse 1.8s ease-in-out infinite",
                    }}
                  />
                )}
                <Flex
                  w={8}
                  h={8}
                  borderRadius="full"
                  align="center"
                  justify="center"
                  fontSize="sm"
                  fontWeight="bold"
                  transition="all 0.2s"
                  bg={isCompleted ? "brand.500" : isCurrent ? "brand.500" : "bg.subtle"}
                  color={isCompleted || isCurrent ? "white" : "fg.muted"}
                  border="2px solid"
                  borderColor={
                    isCompleted ? "brand.500" : isCurrent ? "brand.500" : "border.subtle"
                  }
                >
                  {isCompleted ? (
                    // biome-ignore lint/a11y/noSvgWithoutTitle: Decorative SVG
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M2.5 7L5.5 10L11.5 4"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </Flex>
              </Box>
              <Text
                fontSize="xs"
                fontWeight={isCurrent ? "semibold" : "normal"}
                color={isCurrent ? "brand.600" : isCompleted ? "fg" : "fg.muted"}
                whiteSpace="nowrap"
              >
                {label}
              </Text>
            </Flex>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <Box
                flex={1}
                h="2px"
                mx={2}
                mb={5}
                bg={isCompleted ? "brand.500" : "border.subtle"}
                transition="background 0.2s"
              />
            )}
          </Flex>
        );
      })}

      {/* Pulse keyframe — injected once via a style tag */}
      <style>{`
        @keyframes mf-pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.25); opacity: 0.15; }
        }
      `}</style>
    </Flex>
  );
}
