import { z } from "zod";
import { guestSchema } from "./guest";

export const createBookingSchema = z.object({
  roomId: z.number().int().positive(),
  checkInDate: z.string().transform((date) => new Date(date + "T00:00:00Z")),
  checkOutDate: z.string().transform((date) => new Date(date + "T00:00:00Z")),
  totalPrice: z.number().positive(),
  status: z.string(),
  numberOfGuests: z.number().min(1).default(1),
  guest: z.union([z.object({ id: z.number().int().positive() }), guestSchema]),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
