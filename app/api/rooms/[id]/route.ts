import { NextRequest, NextResponse } from "next/server";
import { roomService } from "@/services/roomService";

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
