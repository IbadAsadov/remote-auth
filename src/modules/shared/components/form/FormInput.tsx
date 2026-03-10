import type { InputProps } from "@chakra-ui/react";
import { Field, Input, InputGroup } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { Controller, type FieldValues, type Path, useFormContext } from "react-hook-form";

interface FormInputProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  helperText?: string;
  placeholder?: string;
  type?: InputProps["type"];
  required?: boolean;
  disabled?: boolean;
  rightElement?: ReactNode;
  onBlur?: () => void;
}

export function FormInput<T extends FieldValues>({
  name,
  label,
  helperText,
  placeholder,
  type = "text",
  required,
  disabled,
  rightElement,
  onBlur: onBlurExternal,
}: FormInputProps<T>) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field.Root invalid={!!fieldState.error} required={required} w="full">
          <Field.Label>{label}</Field.Label>
          {rightElement ? (
            <InputGroup endElement={rightElement}>
              <Input
                {...field}
                value={(field.value as string) ?? ""}
                type={type}
                placeholder={placeholder}
                disabled={disabled}
                onBlur={() => {
                  field.onBlur();
                  onBlurExternal?.();
                }}
              />
            </InputGroup>
          ) : (
            <Input
              {...field}
              value={(field.value as string) ?? ""}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              onBlur={() => {
                field.onBlur();
                onBlurExternal?.();
              }}
            />
          )}
          {fieldState.error && <Field.ErrorText>{fieldState.error.message}</Field.ErrorText>}
          {helperText && !fieldState.error && <Field.HelperText>{helperText}</Field.HelperText>}
        </Field.Root>
      )}
    />
  );
}
