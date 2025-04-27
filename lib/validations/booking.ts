import { z } from "zod";
import { guestSchema } from "./guest";

// Schema for each room in a booking
export const bookingRoomSchema = z.object({
  roomId: z.number().int().positive(),
  priceAtTime: z.number().positive(),
});

export const createBookingSchema = z.object({
  // Replace single roomId with array of room objects
  rooms: z
    .array(bookingRoomSchema)
    .min(1, "At least one room must be selected"),
  checkInDate: z.string().transform((date) => new Date(date + "T00:00:00Z")),
  checkOutDate: z.string().transform((date) => new Date(date + "T00:00:00Z")),
  totalPrice: z.number().positive(),
  status: z.string(),
  numberOfGuests: z.number().min(1).default(1),
  guest: z.union([z.object({ id: z.number().int().positive() }), guestSchema]),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type BookingRoomInput = z.infer<typeof bookingRoomSchema>;
