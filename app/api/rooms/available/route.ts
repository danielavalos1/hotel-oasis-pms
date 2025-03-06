import { NextRequest, NextResponse } from "next/server";
import { roomService } from "@/services/roomService";
import { RoomType } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    const guests = searchParams.get("guests");
    const roomType = searchParams.get("roomType") as
      | RoomType
      | undefined
      | null;

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

    // Add robust error handling for the service call
    let availableRooms;
    try {
      availableRooms = await roomService.getAvailableRoomsByType({
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        guests: guests ? parseInt(guests) : undefined,
        roomType: roomType || undefined, // Ensure null is converted to undefined if needed
      });

      console.log(
        "[API] Available Rooms - Found rooms:",
        availableRooms?.length || 0
      );
    } catch (serviceError) {
      console.error("[API] Room Service Error:", serviceError);
      return NextResponse.json(
        {
          success: false,
          error: "Error in room service",
          details:
            serviceError instanceof Error
              ? serviceError.message
              : "Unknown service error",
        },
        { status: 500 }
      );
    }

    // Check if the result is valid before proceeding
    if (!availableRooms || !Array.isArray(availableRooms)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid response from room service",
          details: `Expected array but got: ${typeof availableRooms}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: availableRooms });
  } catch (error) {
    // Handle outer try-catch with robust error checking
    let errorDetails;
    try {
      errorDetails =
        error instanceof Error
          ? error.message
          : typeof error === "string"
          ? error
          : JSON.stringify(error);
    } catch {
      errorDetails = "Unserializable error object";
    }

    console.error("[API] Available Rooms - Error:", errorDetails);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch available rooms",
        details: errorDetails,
      },
      { status: 500 }
    );
  }
}
