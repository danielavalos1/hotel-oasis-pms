import { NextRequest, NextResponse } from "next/server";
import { bookingService } from "@/services/bookingService";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { emailService } from "@/services/emailService";
import { BookingRoomInput } from "@/lib/validations/booking";

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
    console.log("[API] Create Booking - Request body:", body);

    // Validar que el cuerpo incluya la propiedad rooms como un array
    if (!body.rooms || !Array.isArray(body.rooms) || body.rooms.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: "Al menos una habitación debe ser especificada",
        },
        { status: 400 }
      );
    }

    // Asegurarse de que cada elemento tenga un roomId y priceAtTime
    if (
      body.rooms.some(
        (room: Partial<BookingRoomInput>) =>
          !room.roomId || typeof room.priceAtTime !== "number"
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details:
            "Todas las habitaciones deben tener un roomId y priceAtTime válidos",
        },
        { status: 400 }
      );
    }

    const booking = await bookingService.createBooking(body);
    console.log("[API] Create Booking - Success:", booking);

    // Enviar correos electrónicos
    try {
      await Promise.all([
        emailService.sendGuestBookingConfirmation(booking),
        emailService.sendStaffBookingNotification(booking),
      ]);
    } catch (emailError) {
      console.error("[API] Create Booking - Email sending failed:", emailError);
      // Continuamos con la respuesta exitosa aunque falle el envío de correos
    }

    return NextResponse.json({ success: true, data: booking }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      console.log("[API] Create Booking - Validation error:", error.errors);
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
      console.log("[API] Create Booking - Prisma error:", {
        code: error.code,
        message: error.message,
      });
      switch (error.code) {
        case "P2002":
          return NextResponse.json(
            {
              success: false,
              error: "Unique constraint violation",
              details: `Una o más habitaciones ya están reservadas para este rango de fechas`,
            },
            { status: 409 }
          );
        case "P2003":
          return NextResponse.json(
            {
              success: false,
              error: "Foreign key constraint failed",
              details: "El huésped o alguna habitación especificada no existe",
            },
            { status: 400 }
          );
        default:
          break;
      }
    }

    // Log para errores no manejados específicamente
    console.error("[API] Create Booking - Unhandled error:", {
      error: error instanceof Error ? error.message : error,
    });

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
