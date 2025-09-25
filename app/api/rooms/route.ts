import { NextRequest, NextResponse } from "next/server";
import { roomService } from "@/services/roomService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const withDetails = searchParams.get("withDetails");

    if (startDate && endDate) {
      const availableRooms = await roomService.getAvailableRooms(
        new Date(startDate),
        new Date(endDate)
      );
      return NextResponse.json({ success: true, data: availableRooms });
    }

    if (withDetails === "true") {
      const rooms = await roomService.getAllRoomsWithDetails();
      return NextResponse.json(rooms);
    }

    const rooms = await roomService.getAllRooms();
    return NextResponse.json({ success: true, data: rooms });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const room = await roomService.createRoom(body);
    return NextResponse.json({ success: true, data: room }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create room",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
