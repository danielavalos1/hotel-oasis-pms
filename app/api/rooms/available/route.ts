import { NextRequest, NextResponse } from "next/server";
import { roomService } from "@/services/roomService";
import { RoomType } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    const guests = searchParams.get("guests");
    const roomType = searchParams.get("roomType") as RoomType | undefined;

    console.log("[API] Available Rooms - Request params:", {
      checkIn,
      checkOut,
      guests,
      roomType,
    });

    if (!checkIn || !checkOut) {
      console.log("[API] Available Rooms - Missing required params");
      return NextResponse.json(
        { success: false, error: "Check-in and check-out dates are required" },
        { status: 400 }
      );
    }

    const availableRooms = await roomService.getAvailableRoomsByType({
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      guests: guests ? parseInt(guests) : undefined,
      roomType,
    });

    console.log("[API] Available Rooms - Found rooms:", availableRooms.length);

    return NextResponse.json({ success: true, data: availableRooms });
  } catch (error) {
    console.error("[API] Available Rooms - Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch available rooms",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
