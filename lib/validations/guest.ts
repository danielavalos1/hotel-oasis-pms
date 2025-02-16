import { z } from "zod";

export const guestSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phoneNumber: z.string().min(10),
  address: z.string().optional(),
});

export type GuestInput = z.infer<typeof guestSchema>;
