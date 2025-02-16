import { prisma } from "@/lib/prisma";
import { Room, Prisma } from "@prisma/client";

export const roomService = {
  async createRoom(data: Prisma.RoomCreateInput): Promise<Room> {
    return await prisma.room.create({
      data,
      include: {
        roomInventory: true,
      },
    });
  },

  async getRoom(id: number): Promise<Room | null> {
    return await prisma.room.findUnique({
      where: { id },
      include: {
        bookings: true,
        roomInventory: true,
        channelRates: true,
      },
    });
  },

  async getAllRooms(): Promise<Room[]> {
    return await prisma.room.findMany({
      include: {
        roomInventory: true,
        channelRates: true,
      },
    });
  },

  async getAvailableRooms(startDate: Date, endDate: Date): Promise<Room[]> {
    const bookedRooms = await prisma.booking.findMany({
      where: {
        OR: [
          {
            AND: [
              { checkInDate: { lte: endDate } },
              { checkOutDate: { gte: startDate } },
            ],
          },
        ],
      },
      select: { roomId: true },
    });

    const bookedRoomIds = bookedRooms.map((booking) => booking.roomId);

    return await prisma.room.findMany({
      where: {
        AND: [{ isAvailable: true }, { id: { notIn: bookedRoomIds } }],
      },
      include: { roomInventory: true },
    });
  },

  async updateRoom(id: number, data: Partial<Room>): Promise<Room> {
    return await prisma.room.update({
      where: { id },
      data,
      include: {
        roomInventory: true,
      },
    });
  },

  async deleteRoom(id: number): Promise<Room> {
    return await prisma.room.delete({
      where: { id },
    });
  },
};
