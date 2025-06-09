import { NextRequest, NextResponse } from "next/server";
import { roomService } from "@/services/roomService";
import { bookingService } from "@/services/bookingService";
import { RoomStatus, Room, Booking, BookingRoom } from "@prisma/client";

// Utilidad para determinar el status de una habitación en una fecha
function getRoomStatusForDate({
  room,
  bookings,
  date,
}: {
  room: Room;
  bookings: (Booking & { bookingRooms: BookingRoom[] })[];
  date: Date;
}): RoomStatus {
  // 1. ¿Está bloqueada por operación?
  // (blockOps puede ser implementado en el futuro)

  // 2. ¿Está en mantenimiento?
  if (room.status === "EN_MANTENIMIENTO") return RoomStatus.EN_MANTENIMIENTO;

  // 3. ¿Tiene una reserva activa en esa fecha?
  const isBooked = bookings.some((b) => {
    return (
      b.bookingRooms.some((br) => br.roomId === room.id) &&
      new Date(b.checkInDate) <= date &&
      new Date(b.checkOutDate) > date
    );
  });
  if (isBooked) {
    return RoomStatus.RESERVADA;
  }

  // 4. ¿Está ocupada? (puede ser igual a reservada, depende del flujo PMS)
  // Aquí asumimos que "ocupada" es cuando hay un check-in hecho (no solo reservada)
  // Si tienes un campo/flag para check-in, deberías consultarlo aquí

  // 5. ¿Está sucia?
  if (room.status === "SUCIA") return RoomStatus.SUCIA;

  // 6. ¿Está libre?
  if (room.status === "LIBRE") return RoomStatus.LIBRE;

  // 7. Otros estados
  return room.status as RoomStatus;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const date = dateParam ? new Date(dateParam) : new Date();

    // Obtener todas las habitaciones
    const rooms = await roomService.getAllRooms();
    // Obtener todas las reservas activas para esa fecha
    const bookings = await bookingService.getBookingsByDateRange(date, date);

    // Mapear status por habitación
    const result = rooms.map((room) => {
      const status = getRoomStatusForDate({
        room,
        bookings,
        date,
      });
      return {
        id: room.id,
        roomNumber: room.roomNumber,
        floor: room.floor ?? null,
        type: room.type,
        capacity: room.capacity,
        status,
        pricePerNight: room.pricePerNight,
        amenities: room.amenities,
      };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
