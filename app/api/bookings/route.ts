import { NextRequest, NextResponse } from "next/server";
import { bookingService } from "@/services/bookingService";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (startDate && endDate) {
      const bookings = await bookingService.getBookingsByDateRange(
        new Date(startDate),
        new Date(endDate)
      );
      return NextResponse.json({ success: true, data: bookings });
    }

    const bookings = await bookingService.getAllBookings();
    return NextResponse.json({ success: true, data: bookings });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const booking = await bookingService.createBooking(body);
    return NextResponse.json({ success: true, data: booking }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2002":
          return NextResponse.json(
            {
              success: false,
              error: "Unique constraint violation",
              details: `A booking already exists for this room and date range`,
            },
            { status: 409 }
          );
        case "P2003":
          return NextResponse.json(
            {
              success: false,
              error: "Foreign key constraint failed",
              details: "The specified guest or room does not exist",
            },
            { status: 400 }
          );
        default:
          break;
      }
    }

    // Capturar cualquier error de serialización
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        error: "Booking creation failed",
        details: errorMessage,
      },
      { status: 400 }
    );
  }
}
