import { z } from "zod";
import { guestSchema } from "./guest";

export const createBookingSchema = z.object({
  guest: z.union([
    z.object({ id: z.number().int().positive() }), // Existing guest
    guestSchema, // New guest data
  ]),
  roomId: z.number().int().positive(),
  checkInDate: z.string().transform((date) => new Date(date + "T00:00:00Z")),
  checkOutDate: z.string().transform((date) => new Date(date + "T00:00:00Z")),
  totalPrice: z.number().positive(),
  status: z.string(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
