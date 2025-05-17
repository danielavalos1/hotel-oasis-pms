import { prisma } from "@/lib/prisma";
import {
  createBookingSchema,
  type CreateBookingInput,
} from "@/lib/validations/booking";
import { Booking } from "@prisma/client";

export const bookingService = {
  async createBooking(input: CreateBookingInput) {
    const validatedData = createBookingSchema.parse(input);

    return await prisma.$transaction(async (tx) => {
      let guestId: number;

      if ("id" in validatedData.guest) {
        const existingGuest = await tx.guest.findUnique({
          where: { id: validatedData.guest.id },
        });

        if (!existingGuest) {
          throw new Error("Guest not found");
        }

        guestId = existingGuest.id;
      } else {
        // Primero buscar por email
        const existingGuest = await tx.guest.findUnique({
          where: { email: validatedData.guest.email },
        });

        if (existingGuest) {
          // Si existe, actualizar sus datos
          const updatedGuest = await tx.guest.update({
            where: { id: existingGuest.id },
            data: validatedData.guest,
          });
          guestId = updatedGuest.id;
        } else {
          // Si no existe, crear nuevo huésped
          const newGuest = await tx.guest.create({
            data: validatedData.guest,
          });
          guestId = newGuest.id;
        }
      }

      // Crear la reserva
      const booking = await tx.booking.create({
        data: {
          guestId,
          checkInDate: validatedData.checkInDate,
          checkOutDate: validatedData.checkOutDate,
          totalPrice: validatedData.totalPrice,
          status: validatedData.status,
          numberOfGuests: validatedData.numberOfGuests || 1,
          // Crear las relaciones de BookingRoom
          bookingRooms: {
            create: validatedData.rooms.map((room) => ({
              roomId: room.roomId,
              priceAtTime: room.priceAtTime,
            })),
          },
        },
        include: {
          guest: true,
          bookingRooms: {
            include: {
              room: true,
            },
          },
        },
      });

      return booking;
    });
  },

  // Read
  async getBooking(id: number) {
    try {
      return await prisma.booking.findUnique({
        where: { id },
        include: {
          guest: true,
          bookingRooms: {
            include: {
              room: true,
            },
          },
          payments: true,
          modifications: true,
        },
      });
    } catch (error) {
      throw new Error(`Error fetching booking: ${error}`);
    }
  },

  /**
   * Fetch a booking along with its related guest and rooms. Throws if not found.
   */
  async getBookingWithRelations(id: number) {
    try {
      return await prisma.booking.findUniqueOrThrow({
        where: { id },
        include: {
          guest: true,
          bookingRooms: { include: { room: true } },
        },
      });
    } catch (error) {
      throw new Error(`Error fetching booking with relations: ${error}`);
    }
  },

  async getAllBookings() {
    try {
      return await prisma.booking.findMany({
        include: {
          guest: true,
          bookingRooms: {
            include: {
              room: true,
            },
          },
        },
      });
    } catch (error) {
      throw new Error(`Error fetching bookings: ${error}`);
    }
  },

  async getBookingsByDateRange(startDate: Date, endDate: Date) {
    try {
      return await prisma.booking.findMany({
        where: {
          OR: [
            {
              checkInDate: {
                gte: startDate,
                lte: endDate,
              },
            },
            {
              checkOutDate: {
                gte: startDate,
                lte: endDate,
              },
            },
          ],
        },
        include: {
          guest: true,
          bookingRooms: {
            include: {
              room: true,
            },
          },
        },
      });
    } catch (error) {
      throw new Error(`Error fetching bookings by date range: ${error}`);
    }
  },

  // Update
  async updateBooking(id: number, data: Partial<Booking>) {
    try {
      return await prisma.booking.update({
        where: { id },
        data,
        include: {
          guest: true,
          bookingRooms: {
            include: {
              room: true,
            },
          },
        },
      });
    } catch (error) {
      throw new Error(`Error updating booking: ${error}`);
    }
  },

  // Delete
  async deleteBooking(id: number): Promise<Booking> {
    try {
      return await prisma.booking.delete({
        where: { id },
      });
    } catch (error) {
      throw new Error(`Error deleting booking: ${error}`);
    }
  },

  async getBookingDetail(id: number) {
    return await prisma.booking.findUnique({
      where: { id },
      include: {
        guest: true,
        bookingRooms: { include: { room: true } },
      },
    });
  },
};
