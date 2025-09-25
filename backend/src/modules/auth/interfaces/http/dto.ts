import { z } from "zod";
import UserRole from "../../domain/user.role.js";

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.nativeEnum(UserRole).optional(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
