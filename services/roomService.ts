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
        bookingRooms: {
          include: {
            booking: true,
          },
        },
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
    // Find bookings that overlap with the requested date range
    const bookings = await prisma.booking.findMany({
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
      include: {
        bookingRooms: {
          select: {
            roomId: true,
          },
        },
      },
    });

    // Extract room IDs from the bookingRooms relation
    const bookedRoomIds = bookings
      .flatMap((booking) => booking.bookingRooms)
      .map((bookingRoom) => bookingRoom.roomId);

    return await prisma.room.findMany({
      where: {
        AND: [
          { isAvailable: true },
          { id: { notIn: bookedRoomIds.length > 0 ? bookedRoomIds : [0] } },
        ],
      },
      include: { roomInventory: true },
    });
  },

  async getAvailableRoomsByType({
    checkIn,
    checkOut,
    roomType,
  }: RoomAvailabilityParams): Promise<AvailableRoomsByType[]> {
    // Find bookings that overlap with the requested dates
    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          // Check-in before/during stay, check-out after requested check-in
          {
            AND: [
              { checkInDate: { lte: checkIn } },
              { checkOutDate: { gt: checkIn } },
            ],
          },
          // Check-in before requested check-out, check-out during/after stay
          {
            AND: [
              { checkInDate: { lt: checkOut } },
              { checkOutDate: { gte: checkOut } },
            ],
          },
          // Complete overlap (booking is fully within the requested period)
          {
            AND: [
              { checkInDate: { gte: checkIn } },
              { checkOutDate: { lte: checkOut } },
            ],
          },
        ],
      },
      include: {
        bookingRooms: {
          select: {
            roomId: true,
          },
        },
      },
    });

    // Extract room IDs from the bookingRooms relation
    const bookedRoomIds = bookings
      .flatMap((booking) => booking.bookingRooms)
      .map((bookingRoom) => bookingRoom.roomId);

    // Handle empty bookedRoomIds array (add a dummy ID that won't match any room)
    const notInCondition = bookedRoomIds.length > 0 ? bookedRoomIds : [0];

    const availableRooms = await prisma.room.groupBy({
      by: ["type"],
      where: {
        NOT: {
          id: { in: notInCondition },
        },
        ...(roomType && { type: roomType }),
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
              id: { in: notInCondition },
            },
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
          pricePerNight: typeof roomExample.pricePerNight === "object" && "toNumber" in roomExample.pricePerNight
            ? roomExample.pricePerNight.toNumber()
            : Number(roomExample.pricePerNight),
          availableCount: group._count.id,
        } as AvailableRoomsByType;
      })
    );

    return roomsWithDetails;
  },

  async getAvailableRoomListByType({
    checkIn,
    checkOut,
    roomType,
  }: {
    checkIn: Date;
    checkOut: Date;
    roomType: RoomType;
  }): Promise<Room[]> {
    // Find bookings that overlap with the requested dates
    const bookings = await prisma.booking.findMany({
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
      include: {
        bookingRooms: {
          select: {
            roomId: true,
          },
        },
      },
    });

    // Extract booked room IDs
    const bookedRoomIds = bookings
      .flatMap((booking) => booking.bookingRooms)
      .map((bookingRoom) => bookingRoom.roomId);

    // Get all available rooms of the specified type
    const rooms = await prisma.room.findMany({
      where: {
        type: roomType,
        NOT: {
          id: { in: bookedRoomIds.length > 0 ? bookedRoomIds : [0] },
        },
        isAvailable: true,
      },
      orderBy: {
        roomNumber: "asc",
      },
    });

    // Convertir el Decimal a number antes de retornar
    return rooms.map((room) => ({
      ...room,
      pricePerNight: room.pricePerNight,
    }));
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
