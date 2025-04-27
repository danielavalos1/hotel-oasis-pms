import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { userService } from "@/services/userService";
import { createUserSchema } from "@/validations/user";
import { resetPasswordSchema } from "@/validations/user";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }
  const users = await userService.getAllUsers();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }
  const body = await request.json();
  const result = createUserSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ errors: result.error.format() }, { status: 400 });
  }
  const newUser = await userService.createUser(result.data);
  return NextResponse.json(newUser, { status: 201 });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }
  const body = await request.json();
  const result = resetPasswordSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ errors: result.error.format() }, { status: 400 });
  }
  const updatedUser = await userService.resetPassword(result.data.userId);
  return NextResponse.json(updatedUser);
}