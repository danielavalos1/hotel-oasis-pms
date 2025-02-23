import { NextRequest, NextResponse } from "next/server";
import { bookingService } from "@/services/bookingService";

export async function GET(request: NextRequest) {
  try {
    const body = await request.json();
    const booking = await bookingService.getBooking(Number(body.id));
    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: booking });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const booking = await bookingService.updateBooking(Number(body.id), body);
    return NextResponse.json({ success: true, data: booking });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    await bookingService.deleteBooking(Number(body.id));
    return NextResponse.json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}
