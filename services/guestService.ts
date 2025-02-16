import { PrismaClient, Guest } from "@prisma/client";

const prisma = new PrismaClient();

export const guestService = {
  // Create
  async createGuest(data: Omit<Guest, "id">): Promise<Guest> {
    try {
      return await prisma.guest.create({
        data,
      });
    } catch (error) {
      throw new Error(`Error creating guest: ${error}`);
    }
  },

  // Read
  async getGuest(id: bigint): Promise<Guest | null> {
    try {
      return await prisma.guest.findUnique({
        where: { id },
      });
    } catch (error) {
      throw new Error(`Error fetching guest: ${error}`);
    }
  },

  async getAllGuests(): Promise<Guest[]> {
    try {
      return await prisma.guest.findMany();
    } catch (error) {
      throw new Error(`Error fetching guests: ${error}`);
    }
  },

  // Update
  async updateGuest(id: bigint, data: Partial<Guest>): Promise<Guest> {
    try {
      return await prisma.guest.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new Error(`Error updating guest: ${error}`);
    }
  },

  // Delete
  async deleteGuest(id: bigint): Promise<Guest> {
    try {
      return await prisma.guest.delete({
        where: { id },
      });
    } catch (error) {
      throw new Error(`Error deleting guest: ${error}`);
    }
  },
};
