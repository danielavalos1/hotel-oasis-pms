import { prisma } from "@/lib/prisma";
import { Room, Prisma, RoomType } from "@prisma/client";
import { AvailableRoomsByType, RoomAvailabilityParams } from "@/types/room";

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

  async getAvailableRoomsByType({
    checkIn,
    checkOut,
    guests,
    roomType,
  }: RoomAvailabilityParams): Promise<AvailableRoomsByType[]> {
    const bookedRooms = await prisma.booking.findMany({
      where: {
        OR: [
          {
            AND: [
              { checkInDate: { lte: checkIn } },
              { checkOutDate: { gt: checkIn } },
            ],
          },
          {
            AND: [
              { checkInDate: { lt: checkOut } },
              { checkOutDate: { gte: checkOut } },
            ],
          },
          {
            AND: [
              { checkInDate: { gte: checkIn } },
              { checkOutDate: { lte: checkOut } },
            ],
          },
        ],
      },
      select: {
        roomId: true,
      },
    });

    const bookedRoomIds = bookedRooms.map((booking) => booking.roomId);

    const availableRooms = await prisma.room.groupBy({
      by: ["type"],
      where: {
        NOT: {
          id: { in: bookedRoomIds },
        },
        ...(roomType && { type: roomType as RoomType }),
        ...(guests && { capacity: { gte: guests } }),
        isAvailable: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        type: "asc",
      },
    });

    const roomsWithDetails = await Promise.all(
      availableRooms.map(async (group) => {
        const roomExample = await prisma.room.findFirst({
          where: {
            type: group.type,
            NOT: {
              id: { in: bookedRoomIds },
            },
            ...(guests && { capacity: { gte: guests } }),
            isAvailable: true,
          },
          select: {
            id: true,
            type: true,
            capacity: true,
            pricePerNight: true,
            description: true,
            amenities: true,
          },
        });

        if (!roomExample) {
          throw new Error(`No room found for type ${group.type}`);
        }

        return {
          ...roomExample,
          pricePerNight: roomExample.pricePerNight.toNumber(),
          availableCount: group._count.id,
        } as AvailableRoomsByType;
      })
    );

    return roomsWithDetails;
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
