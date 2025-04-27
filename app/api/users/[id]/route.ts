import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { userService } from "@/services/userService";
import { updateUserSchema } from "@/validations/user";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }
  const user = await userService.getUser(Number(params.id));
  if (!user) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  return NextResponse.json(user);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }
  const body = await request.json();
  const result = updateUserSchema.safeParse({ ...body, id: Number(params.id) });
  if (!result.success) {
    return NextResponse.json({ errors: result.error.format() }, { status: 400 });
  }
  const updated = await userService.updateUser(Number(params.id), result.data);
  return NextResponse.json(updated);
}