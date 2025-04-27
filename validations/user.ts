import { z } from "zod";
import { UserRole } from "@prisma/client";

export const createUserSchema = z.object({
  username: z.string().min(3),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.nativeEnum(UserRole),
  shift: z.string().optional(),
});

export const resetPasswordSchema = z.object({
  userId: z.number().int(),
});

export const updateUserSchema = createUserSchema
  .partial()
  .extend({ id: z.number().int() });