import { Box, Field, Textarea } from "@chakra-ui/react";
import { Controller, type FieldValues, type Path, useFormContext } from "react-hook-form";

interface FormTextareaProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
  showCounter?: boolean;
}

export function FormTextarea<T extends FieldValues>({
  name,
  label,
  placeholder,
  required,
  disabled,
  rows = 3,
  maxLength,
  showCounter,
}: FormTextareaProps<T>) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const charCount = ((field.value as string) ?? "").length;
        const nearLimit = showCounter && maxLength && charCount / maxLength > 0.9;

        return (
          <Field.Root invalid={!!fieldState.error} required={required} w="full">
            <Field.Label>{label}</Field.Label>
            <Box w="full" position="relative">
              <Textarea
                {...field}
                value={(field.value as string) ?? ""}
                placeholder={placeholder}
                disabled={disabled}
                rows={rows}
                maxLength={maxLength}
                resize="vertical"
              />
              {showCounter && maxLength && (
                <Box
                  position="absolute"
                  bottom={2}
                  right={3}
                  fontSize="xs"
                  color={nearLimit ? "red.500" : "fg.muted"}
                  pointerEvents="none"
                >
                  {charCount} / {maxLength}
                </Box>
              )}
            </Box>
            {fieldState.error && <Field.ErrorText>{fieldState.error.message}</Field.ErrorText>}
          </Field.Root>
        );
      }}
    />
  );
}
