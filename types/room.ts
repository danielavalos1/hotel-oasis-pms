import { RoomType } from "@prisma/client";

export interface AvailableRoomsByType {
  id: number;
  type: RoomType;
  capacity: number;
  pricePerNight: number;
  description: string | null;
  amenities: string[];
  availableCount: number;
}

export interface RoomAvailabilityParams {
  checkIn: Date;
  checkOut: Date;
  guests?: number;
  roomType?: RoomType;
}
