import { NextRequest, NextResponse } from "next/server";
import { bookingService } from "@/services/bookingService";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (isNaN(id))
    return NextResponse.json(
      { success: false, error: "ID inválido" },
      { status: 400 }
    );
  const { status } = await request.json();
  // eslint-disable-next-line no-console
  console.log("[API][PATCH][bookings/[id]/notes] id:", id, "status:", status);
  try {
    const booking = await bookingService.updateBooking(id, { status });
    // eslint-disable-next-line no-console
    console.log("[API][PATCH][bookings/[id]/notes] booking actualizado:", booking);
    return NextResponse.json({ success: true, data: booking });
  } catch (e: any) {
    // Manejo específico para booking no encontrado
    if (e.code === 'P2025' || e.message?.includes('No record was found')) {
      return NextResponse.json(
        { success: false, error: "Booking no encontrado" },
        { status: 404 }
      );
    }
    // Otros errores
    console.error("[API][PATCH][bookings/[id]/notes] Error:", e.message);
    return NextResponse.json(
      { success: false, error: e.message || "Error interno" },
      { status: 500 }
    );
  }
}
