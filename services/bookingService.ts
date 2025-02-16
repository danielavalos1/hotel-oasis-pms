import { prisma } from "@/lib/prisma";
import { createBookingSchema, type CreateBookingInput } from "@/lib/validations/booking";
import { Booking } from "@prisma/client";

export const bookingService = {
  async createBooking(input: CreateBookingInput) {
    const validatedData = createBookingSchema.parse(input);
    
    return await prisma.$transaction(async (tx) => {
      let guestId: number;
      
      if ('id' in validatedData.guest) {
        const existingGuest = await tx.guest.findUnique({
          where: { id: validatedData.guest.id },
        });
        
        if (!existingGuest) {
          throw new Error('Guest not found');
        }
        
        guestId = existingGuest.id;
      } else {
        const newGuest = await tx.guest.create({
          data: validatedData.guest,
        });
        guestId = newGuest.id;
      }
      
      return await tx.booking.create({
        data: {
          guestId,
          roomId: validatedData.roomId,
          checkInDate: validatedData.checkInDate,
          checkOutDate: validatedData.checkOutDate,
          totalPrice: validatedData.totalPrice,
          status: validatedData.status,
        },
        include: {
          guest: true,
          room: true,
        },
      });
    });
  },

  // Read
  async getBooking(id: number): Promise<Booking | null> {
    try {
      return await prisma.booking.findUnique({
        where: { id },
        include: {
          guest: true,
          room: true,
          payments: true,
          modifications: true,
        },
      });
    } catch (error) {
      throw new Error(`Error fetching booking: ${error}`);
    }
  },

  async getAllBookings(): Promise<Booking[]> {
    try {
      return await prisma.booking.findMany({
        include: {
          guest: true,
          room: true,
        },
      });
    } catch (error) {
      throw new Error(`Error fetching bookings: ${error}`);
    }
  },

  async getBookingsByDateRange(startDate: Date, endDate: Date): Promise<Booking[]> {
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
          room: true,
        },
      });
    } catch (error) {
      throw new Error(`Error fetching bookings by date range: ${error}`);
    }
  },

  // Update
  async updateBooking(id: number, data: Partial<Booking>): Promise<Booking> {
    try {
      return await prisma.booking.update({
        where: { id },
        data,
        include: {
          guest: true,
          room: true,
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
};
