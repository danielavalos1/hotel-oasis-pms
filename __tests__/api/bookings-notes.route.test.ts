// Tests para la API de notas de booking (PATCH /api/bookings/[id]/notes)
import { PATCH } from "@/app/api/bookings/[id]/notes/route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// Helper para crear un mock de NextRequest con body y método
function createMockRequest(url: string, body: any) {
  return new NextRequest(url, {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("Booking Notes API (App Router handler)", () => {
  let bookingId: number;

  beforeAll(async () => {
    // Limpia bookings, rooms y guests
    await prisma.booking.deleteMany();
    await prisma.bookingRoom.deleteMany?.();
    await prisma.room.deleteMany?.();
    await prisma.guest.deleteMany();
    // Log estado inicial
    // eslint-disable-next-line no-console
    console.log("[TEST][beforeAll] Estado inicial:", {
      bookings: await prisma.booking.findMany(),
      rooms: await prisma.room.findMany(),
      guests: await prisma.guest.findMany(),
      bookingRooms: await prisma.bookingRoom.findMany?.(),
    });
    // Crea un guest
    const guest = await prisma.guest.create({
      data: {
        firstName: "Notes",
        lastName: "Tester",
        email: "notes@test.com",
        phoneNumber: "1234567890",
      },
    });
    console.log("[TEST][beforeAll] Guest creado:", guest);
    // Crea un room
    const room = await prisma.room.create({
      data: {
        roomNumber: "201",
        type: "SENCILLA",
        capacity: 2,
        pricePerNight: 100,
      },
    });
    // Crea el booking
    const booking = await prisma.booking.create({
      data: {
        guestId: guest.id,
        checkInDate: new Date(),
        checkOutDate: new Date(Date.now() + 86400000),
        totalPrice: 100,
        status: "confirmed",
        numberOfGuests: 1,
      },
    });
    bookingId = booking.id;
    // Relacionar el booking con el room
    await prisma.bookingRoom.create({
      data: {
        bookingId: booking.id,
        roomId: room.id,
        priceAtTime: 100,
      },
    });
    // Log estado después de crear booking/room/bookingRoom
    // eslint-disable-next-line no-console
    console.log("[TEST][beforeAll] Estado después de crear:", {
      bookings: await prisma.booking.findMany(),
      rooms: await prisma.room.findMany(),
      guests: await prisma.guest.findMany(),
      bookingRooms: await prisma.bookingRoom.findMany?.(),
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  /**
   * Test: PATCH /api/bookings/[id]/notes actualiza correctamente el status
   */
  it("PATCH /api/bookings/[id]/notes actualiza correctamente el status", async () => {
    const body = { status: "checked-in" };
    const req = createMockRequest(`http://localhost:3000/api/bookings/${bookingId}/notes`, body);
    const res = await PATCH(req, { params: { id: String(bookingId) } });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.status).toBe("checked-in");
  });

  /**
   * Test: PATCH /api/bookings/[id]/notes con ID inválido
   */
  it("PATCH /api/bookings/[id]/notes con ID inválido responde 400", async () => {
    const body = { status: "cancelled" };
    const req = createMockRequest(`http://localhost:3000/api/bookings/abc/notes`, body);
    const res = await PATCH(req, { params: { id: "abc" } });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe("ID inválido");
  });

  /**
   * Test: PATCH /api/bookings/[id]/notes con booking inexistente
   */
  it("PATCH /api/bookings/[id]/notes con booking inexistente responde 404", async () => {
    const body = { status: "cancelled" };
    const req = createMockRequest(`http://localhost:3000/api/bookings/999999/notes`, body);
    const res = await PATCH(req, { params: { id: "999999" } });
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBeDefined();
  });
});

/**
 * Explicación general:
 * - Cada test simula una petición HTTP PATCH al endpoint de notas de booking.
 * - Se valida el status code, la estructura de la respuesta y los datos esperados.
 * - Se cubren casos exitosos, ID inválido y booking inexistente.
 * - Se prepara una reserva real en la base de datos antes de los tests.
 * - Si usas Prisma, configura una base de datos de test y limpia los datos entre tests para evitar efectos colaterales.
 */
