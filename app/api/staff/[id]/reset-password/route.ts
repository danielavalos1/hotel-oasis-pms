import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { staffService } from "@/services/staffService";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Autenticación
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Permisos
  const role = session.user?.role;
  if (role !== "ADMIN" && role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // Validar ID
  const { id } = await params;
  const userId = parseInt(id);
  if (isNaN(userId)) {
    return NextResponse.json({ error: "Invalid staff ID" }, { status: 400 });
  }
  try {
    // Resetear contraseña a '123456'
    await staffService.resetPassword(userId);
    return NextResponse.json({ message: "Password reset to default (123456)" });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
