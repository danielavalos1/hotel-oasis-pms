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
    // Validar fechas
    const checkIn = new Date(body.checkInDate);
    const checkOut = new Date(body.checkOutDate);
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: "Fechas inválidas" },
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
    let assignedRooms: any[] = [];
    try {
      assignedRooms = await Promise.all(
        body.rooms.map(async (r: RoomTypeRequest) => {
          const list = await roomService.getAvailableRoomListByType({
            checkIn: new Date(body.checkInDate),
            checkOut: new Date(body.checkOutDate),
            roomType: r.roomType as RoomType
          });
          if (list.length < r.quantity) {
            // Retorna error 400 con mensaje claro
            throw { status: 400, message: `No hay suficientes habitaciones de tipo ${r.roomType}` };
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
    } catch (err: any) {
      if (err && err.status === 400) {
        return NextResponse.json({ success: false, error: "Validation error", details: err.message }, { status: 400 });
      }
      throw err;
    }
    // Aplanar
    const roomsPayload = assignedRooms.flat();
    // Construir payload final, asegurando que las fechas sean strings ISO
    const payload = {
      ...body,
      checkInDate: checkIn.toISOString(),
      checkOutDate: checkOut.toISOString(),
      rooms: roomsPayload,
    };
    // Crear booking
    const booking = await bookingService.createBooking(payload);
    const bookingWithRel = await bookingService.getBookingWithRelations(booking.id);
    console.log("[API] multi-room booking created:", bookingWithRel);
    console.log("[API] multi-room booking created with ID:", booking.id);
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