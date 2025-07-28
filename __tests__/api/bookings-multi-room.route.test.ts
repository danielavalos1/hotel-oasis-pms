// Tests para la API de bookings multi-room (POST /api/bookings/multi-room)
import { POST } from "@/app/api/bookings/multi-room/route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

describe("Bookings Multi-Room API (App Router handler)", () => {
  let guestId: number;
  let roomId: number;

  beforeAll(async () => {
    await prisma.booking.deleteMany();
    await prisma.bookingRoom.deleteMany?.();
    await prisma.room.deleteMany?.();
    await prisma.guest.deleteMany();
    // Crea un guest
    const guest = await prisma.guest.create({
      data: {
        firstName: "Multi",
        lastName: "Tester",
        email: "multi@test.com",
        phoneNumber: "1234567890",
      },
    });
    guestId = guest.id;
    // Crea dos rooms de tipo SENCILLA
    await prisma.room.create({
      data: {
        roomNumber: "501",
        type: "SENCILLA",
        capacity: 2,
        pricePerNight: 100,
      },
    });
    await prisma.room.create({
      data: {
        roomNumber: "502",
        type: "SENCILLA",
        capacity: 2,
        pricePerNight: 100,
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  function createMockRequest(url: string, body: any) {
    return new NextRequest(url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
  }

  it("POST /api/bookings/multi-room crea un booking con varias habitaciones", async () => {
    const body = {
      guest: {
        firstName: "Multi",
        lastName: "Tester",
        email: "multi@test.com",
        phoneNumber: "1234567890",
      },
      checkInDate: new Date().toISOString(),
      checkOutDate: new Date(Date.now() + 2 * 86400000).toISOString(),
      totalPrice: 200,
      status: "confirmed",
      numberOfGuests: 2,
      rooms: [
        { roomType: "SENCILLA", quantity: 2 },
      ],
    };
    const req = createMockRequest("http://localhost:3000/api/bookings/multi-room", body);
    const res = await POST(req);
    expect([200, 201]).toContain(res.status);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toBeDefined();
  });

  it("POST /api/bookings/multi-room con body inválido responde 400", async () => {
    const body = {
      guest: {
        firstName: "Inválido",
        lastName: "Tester",
        email: "invalido-multi@test.com",
        phoneNumber: "1234567890",
      },
      checkInDate: new Date().toISOString(),
      checkOutDate: new Date(Date.now() + 2 * 86400000).toISOString(),
      totalPrice: 200,
      status: "confirmed",
      numberOfGuests: 2,
      rooms: [], // No rooms
    };
    const req = createMockRequest("http://localhost:3000/api/bookings/multi-room", body);
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBeDefined();
  });

  it("POST /api/bookings/multi-room con cantidad insuficiente responde 500 o 400", async () => {
    const body = {
      guest: {
        firstName: "Fail",
        lastName: "Tester",
        email: "fail-multi@test.com",
        phoneNumber: "1234567890",
      },
      checkInDate: new Date().toISOString(),
      checkOutDate: new Date(Date.now() + 2 * 86400000).toISOString(),
      totalPrice: 200,
      status: "confirmed",
      numberOfGuests: 2,
      rooms: [
        { roomType: "SENCILLA", quantity: 5 }, // Solo hay 2 disponibles
      ],
    };
    const req = createMockRequest("http://localhost:3000/api/bookings/multi-room", body);
    const res = await POST(req);
    expect([400, 500]).toContain(res.status);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBeDefined();
  });
});
