import { NextRequest, NextResponse } from "next/server";
import { roomService } from "@/services/roomService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = Number(context.params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "ID inválido" },
        { status: 400 }
      );
    }
    const body = await request.json();
    const updatedRoom = await roomService.updateRoom(id, body);
    return NextResponse.json({ success: true, data: updatedRoom });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error inesperado",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Verificar autenticación y permisos
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    // Solo administradores pueden eliminar habitaciones
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN") {
      return NextResponse.json(
        { success: false, error: "Permisos insuficientes para eliminar habitaciones" },
        { status: 403 }
      );
    }

    const id = Number(context.params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "ID inválido" },
        { status: 400 }
      );
    }

    // Verificar si la habitación tiene reservas activas
    const roomWithBookings = await prisma.room.findUnique({
      where: { id },
      include: {
        bookingRooms: {
          include: {
            booking: true,
          },
        },
      },
    });

    if (!roomWithBookings) {
      return NextResponse.json(
        { success: false, error: "Habitación no encontrada" },
        { status: 404 }
      );
    }

    // Verificar si tiene reservas futuras o actuales
    const hasActiveBookings = roomWithBookings.bookingRooms.some((bookingRoom: any) => {
      const booking = bookingRoom.booking;
      const now = new Date();
      return new Date(booking.checkOutDate) > now;
    });

    if (hasActiveBookings) {
      return NextResponse.json(
        { 
          success: false, 
          error: "No se puede eliminar una habitación con reservas activas o futuras" 
        },
        { status: 400 }
      );
    }

    const deletedRoom = await roomService.deleteRoom(id);
    return NextResponse.json({ 
      success: true, 
      data: deletedRoom,
      message: "Habitación eliminada exitosamente"
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error inesperado",
      },
      { status: 500 }
    );
  }
}
