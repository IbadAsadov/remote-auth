import { differenceInYears } from "date-fns";
import { z } from "zod";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthError {
  code: string;
  message: string;
}

export const step1Schema = z.object({
  firstName: z.string().min(2, "Min 2 chars").max(50, "Max 50 chars"),
  lastName: z.string().min(2, "Min 2 chars").max(50, "Max 50 chars"),
  dateOfBirth: z.string().refine((val) => {
    if (!val) return false;
    return differenceInYears(new Date(), new Date(val)) >= 18;
  }, "You must be at least 18 years old"),
});

const step2BaseSchema = z.object({
  email: z.string().email("Invalid email format"),
  username: z
    .string()
    .min(4, "Min 4 characters")
    .max(20, "Max 20 characters")
    .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, underscores"),
  password: z
    .string()
    .min(8, "Min 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Must contain at least one special character"),
  confirmPassword: z.string(),
});

export const step2Schema = step2BaseSchema.superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: "custom",
      path: ["confirmPassword"],
      message: "Passwords do not match",
    });
  }
});

export const step3Schema = z.object({
  role: z.enum(["Developer", "Designer", "Manager", "Other"]),
  newsletter: z.boolean(),
  bio: z.string().max(200, "Max 200 characters").optional(),
});

export const registerSchema = step1Schema
  .merge(step2BaseSchema)
  .merge(step3Schema)
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
