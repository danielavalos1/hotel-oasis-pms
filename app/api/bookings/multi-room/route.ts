import { NextRequest, NextResponse } from "next/server";
import { bookingService } from "@/services/bookingService";
import { roomService } from "@/services/roomService";
import { ZodError } from "zod";
import { Prisma, RoomType } from "@prisma/client";
import { emailService } from "@/services/emailService";

interface RoomTypeRequest {
  roomType: string;
  quantity: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("[API] multi-room POST body:", JSON.stringify(body, null, 2));
    // Validación básica
    if (!body.rooms || !Array.isArray(body.rooms) || body.rooms.length === 0) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: "Al menos un tipo de habitación debe ser especificado" },
        { status: 400 }
      );
    }
    // Cada elemento debe contener roomType y quantity
    const invalid = body.rooms.some((r: RoomTypeRequest) => !r.roomType || typeof r.quantity !== 'number' || r.quantity < 1);
    if (invalid) {
      console.error("[API] multi-room validation error: rooms invalid", body.rooms);
      return NextResponse.json(
        { success: false, error: "Validation error", details: "Los tipos y cantidades deben ser válidos" },
        { status: 400 }
      );
    }
    // Asignar habitaciones según tipo y cantidad
    const assignedRooms = await Promise.all(
      body.rooms.map(async (r: RoomTypeRequest) => {
        const list = await roomService.getAvailableRoomListByType({
          checkIn: new Date(body.checkInDate),
          checkOut: new Date(body.checkOutDate),
          roomType: r.roomType as RoomType
        });
        if (list.length < r.quantity) {
          throw new Error(`No hay suficientes habitaciones de tipo ${r.roomType}`);
        }
        return list.slice(0, r.quantity).map(room => ({
          roomId: room.id,
          priceAtTime:
            typeof room.pricePerNight === "object" && "toNumber" in room.pricePerNight
              ? room.pricePerNight.toNumber()
              : Number(room.pricePerNight),
        }));
      })
    );
    // Aplanar
    const roomsPayload = assignedRooms.flat();
    // Construir payload final
    const payload = { ...body, rooms: roomsPayload };
    // Crear booking
    const booking = await bookingService.createBooking(payload);
    const bookingWithRel = await bookingService.getBookingWithRelations(booking.id);
    // Enviar correos
    try {
      await Promise.all([
        emailService.sendGuestBookingConfirmation(bookingWithRel),
        emailService.sendStaffBookingNotification(bookingWithRel)
      ]);
    } catch {}
    return NextResponse.json({ success: true, data: booking }, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      console.error("[API] multi-room ZodError", err.errors);
      return NextResponse.json({ success: false, error: 'Validation error', details: err.errors }, { status: 400 });
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ success: false, error: err.code, details: err.message }, { status: 400 });
    }
    console.error("[API] multi-room error", err);
    return NextResponse.json({ success: false, error: 'Booking creation failed', details: (err as Error).message }, { status: 500 });
  }
}