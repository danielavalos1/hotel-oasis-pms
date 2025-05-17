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
  try {
    const booking = await bookingService.updateBooking(id, { status });
    return NextResponse.json({ success: true, data: booking });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
