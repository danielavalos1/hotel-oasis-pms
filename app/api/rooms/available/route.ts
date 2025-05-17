import { NextRequest, NextResponse } from "next/server";
import { roomService } from "@/services/roomService";
import { RoomType } from "@prisma/client";

// --- CORS helper ---
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || ["*"];

function setCORSHeaders(origin: string | null) {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization,x-api-key",
  };
  if (origin && allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  } else if (allowedOrigins.includes("*")) {
    headers["Access-Control-Allow-Origin"] = "*";
  }
  return headers;
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  // Permitir cualquier origen si no hay origin explícito (útil para pruebas locales)
  const headers = setCORSHeaders(origin);
  if (!origin) {
    headers["Access-Control-Allow-Origin"] = "*";
  }
  headers["Access-Control-Allow-Credentials"] = "true";
  return new NextResponse(null, {
    status: 204,
    headers,
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const guests = searchParams.get("guests");
  const roomType = searchParams.get("roomType") as RoomType | undefined | null;
  const origin = request.headers.get("origin");

  try {
    console.log("[API] Available Rooms - Request params:", {
      checkIn: checkIn,
      checkOut: checkOut,
      guests: guests,
      roomType: roomType,
    });

    if (!checkIn || !checkOut) {
      console.log("[API] Available Rooms - Missing required params");
      return NextResponse.json(
        { success: false, error: "Check-in and check-out dates are required" },
        { status: 400, headers: setCORSHeaders(origin) }
      );
    }

    let availableRooms;
    try {
      availableRooms = await roomService.getAvailableRoomsByType({
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        roomType: roomType || undefined,
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
        { status: 500, headers: setCORSHeaders(origin) }
      );
    }

    if (!availableRooms || !Array.isArray(availableRooms)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid response from room service",
          details: `Expected array but got: ${typeof availableRooms}`,
        },
        { status: 500, headers: setCORSHeaders(origin) }
      );
    }

    console.log(
      "[API] Available Rooms - Response data:",
      JSON.stringify(availableRooms, null, 2)
    );

    return NextResponse.json(
      { success: true, data: availableRooms },
      { headers: setCORSHeaders(origin) }
    );
  } catch (error) {
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
      { status: 500, headers: setCORSHeaders(origin) }
    );
  }
}
