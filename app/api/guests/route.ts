import { NextRequest, NextResponse } from "next/server";
import { guestService } from "@/services/guestService";
import { guestSchema } from "@/lib/validations/guest";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("search");

    if (query) {
      const guests = await guestService.searchGuests(query);
      return NextResponse.json({ success: true, data: guests });
    }

    const guests = await guestService.getAllGuests();
    return NextResponse.json({ success: true, data: guests });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch guests" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = guestSchema.parse(body);
    const guest = await guestService.createGuest(validatedData);
    return NextResponse.json({ success: true, data: guest }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          {
            success: false,
            error: "Email already exists",
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: "Failed to create guest" },
      { status: 500 }
    );
  }
}
