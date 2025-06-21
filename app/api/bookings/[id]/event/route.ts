import { NextRequest, NextResponse } from "next/server";
import { bookingService } from "@/services/bookingService";
import { BookingEventType } from "@prisma/client";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bookingId = Number(params.id);
    if (isNaN(bookingId)) {
      return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });
    }
    const body = await request.json();
    const { eventType, userId, notes, newRoomId } = body;
    if (!eventType || !Object.values(BookingEventType).includes(eventType)) {
      return NextResponse.json({ success: false, error: "Tipo de evento inválido" }, { status: 400 });
    }
    // Registrar evento
    const event = await bookingService.registerBookingEvent({
      bookingId,
      eventType,
      userId,
      notes,
      newRoomId,
    });
    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
