import { Checkbox, Field, Text } from "@chakra-ui/react";
import { Controller, type FieldValues, type Path, useFormContext } from "react-hook-form";

interface FormCheckboxProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  description?: string;
  disabled?: boolean;
}

export function FormCheckbox<T extends FieldValues>({
  name,
  label,
  description,
  disabled,
}: FormCheckboxProps<T>) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field.Root invalid={!!fieldState.error} w="full">
          <Checkbox.Root
            checked={field.value as boolean}
            onCheckedChange={(details) => field.onChange(details.checked === true)}
            disabled={disabled}
          >
            <Checkbox.HiddenInput ref={field.ref} onBlur={field.onBlur} />
            <Checkbox.Control />
            <Checkbox.Label>{label}</Checkbox.Label>
          </Checkbox.Root>
          {description && (
            <Text fontSize="xs" color="fg.muted" mt={1} ml={6}>
              {description}
            </Text>
          )}
          {fieldState.error && <Field.ErrorText>{fieldState.error.message}</Field.ErrorText>}
        </Field.Root>
      )}
    />
  );
}
