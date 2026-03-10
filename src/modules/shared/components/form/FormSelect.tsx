import { Field, NativeSelect } from "@chakra-ui/react";
import { Controller, type FieldValues, type Path, useFormContext } from "react-hook-form";

interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export function FormSelect<T extends FieldValues>({
  name,
  label,
  options,
  placeholder,
  required,
  disabled,
}: FormSelectProps<T>) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field.Root invalid={!!fieldState.error} required={required} w="full">
          <Field.Label>{label}</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field
              {...field}
              value={(field.value as string) ?? ""}
              data-disabled={disabled ? true : undefined}
            >
              {placeholder && (
                <option value="" disabled>
                  {placeholder}
                </option>
              )}
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
          {fieldState.error && <Field.ErrorText>{fieldState.error.message}</Field.ErrorText>}
        </Field.Root>
      )}
    />
  );
}
