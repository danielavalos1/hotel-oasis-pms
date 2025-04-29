import { prisma } from "@/lib/prisma";
import { Guest, Prisma } from "@prisma/client";

export const guestService = {
  async createGuest(data: Prisma.GuestCreateInput): Promise<Guest> {
    return await prisma.guest.create({ data });
  },

  async getGuest(id: number): Promise<Guest | null> {
    return await prisma.guest.findUnique({
      where: { id },
      include: { bookings: true },
    });
  },

  async getAllGuests(): Promise<Guest[]> {
    return await prisma.guest.findMany({
      include: { bookings: true },
    });
  },

  async updateGuest(id: number, data: Partial<Guest>): Promise<Guest> {
    return await prisma.guest.update({
      where: { id },
      data,
      include: { bookings: true },
    });
  },

  async deleteGuest(id: number): Promise<Guest> {
    return await prisma.guest.delete({
      where: { id },
    });
  },

  async searchGuests(query: string): Promise<Guest[]> {
    return await prisma.guest.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
    });
  },

  // Count total guests
  async countGuests(): Promise<number> {
    return await prisma.guest.count();
  },
};
