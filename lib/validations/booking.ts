import { z } from "zod";
import { guestSchema } from "./guest";

// Schema for each room in a booking
export const bookingRoomSchema = z.object({
  roomId: z.number().int().positive(),
  priceAtTime: z
    .union([z.number(), z.string()])
    .transform((val) => (typeof val === "string" ? Number(val) : val))
    .refine((val) => typeof val === "number" && val > 0, {
      message: "priceAtTime debe ser un número positivo",
    }),
});

export const createBookingSchema = z.object({
  // Replace single roomId with array of room objects
  rooms: z
    .array(bookingRoomSchema)
    .min(1, "At least one room must be selected"),
  checkInDate: z.string().transform((date) => {
    // Manejar tanto formato de fecha simple (YYYY-MM-DD) como ISO completo
    const parsedDate = date.includes('T') ? new Date(date) : new Date(date + "T00:00:00Z");
    if (isNaN(parsedDate.getTime())) {
      throw new Error("Fecha de check-in inválida");
    }
    return parsedDate;
  }),
  checkOutDate: z.string().transform((date) => {
    // Manejar tanto formato de fecha simple (YYYY-MM-DD) como ISO completo
    const parsedDate = date.includes('T') ? new Date(date) : new Date(date + "T00:00:00Z");
    if (isNaN(parsedDate.getTime())) {
      throw new Error("Fecha de check-out inválida");
    }
    return parsedDate;
  }),
  totalPrice: z
    .union([z.number(), z.string()])
    .transform((val) => (typeof val === "string" ? Number(val) : val))
    .refine((val) => typeof val === "number" && val > 0, {
      message: "totalPrice debe ser un número positivo",
    }),
  status: z.string(),
  numberOfGuests: z.number().min(1).default(1),
  guest: z.union([z.object({ id: z.number().int().positive() }), guestSchema]),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type BookingRoomInput = z.infer<typeof bookingRoomSchema>;
