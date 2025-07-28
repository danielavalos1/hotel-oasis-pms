// Tests para la API de eventos de booking (POST /api/bookings/[id]/event)
import { POST } from "@/app/api/bookings/[id]/event/route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { BookingEventType } from "@prisma/client";

// Helper para crear un mock de NextRequest con body y método
function createMockRequest(url: string, body: any) {
  return new NextRequest(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}


describe("Booking Event API (App Router handler)", () => {
  let bookingId: number;
  let userId: number;

  // Prepara una reserva y un usuario staff antes de los tests
  beforeAll(async () => {
    // Limpia bookings, eventos, rooms y guests
    await prisma.bookingEvent.deleteMany();
    await prisma.bookingRoom.deleteMany?.();
    await prisma.booking.deleteMany();
    await prisma.room.deleteMany?.();
    await prisma.guest.deleteMany();
    // Usa un userId dummy (ajusta según tu modelo si es necesario)
    userId = 1;
    // Crea un guest
    const guest = await prisma.guest.create({
      data: {
        firstName: "Event",
        lastName: "Tester",
        email: "event@test.com",
        phoneNumber: "1234567890",
      },
    });
    // Crea un room
    const room = await prisma.room.create({
      data: {
        roomNumber: "101",
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
    console.log("[TEST][beforeAll] bookingId:", bookingId, "userId:", userId);
    // Verifica que el booking existe antes de crear bookingRoom
    const exists = await prisma.booking.findUnique({ where: { id: booking.id } });
    console.log("¿Booking existe antes de crear bookingRoom?", !!exists, booking.id);
    // Crea el bookingRoom
    await prisma.bookingRoom.create({
      data: {
        bookingId: booking.id,
        roomId: room.id,
        priceAtTime: 100,
      },
    });
    // Log para depuración
    // eslint-disable-next-line no-console
    console.log("[TEST] bookingId:", bookingId, "userId:", userId);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  /**
   * Test: POST /api/bookings/[id]/event
   * Verifica que se puede registrar un evento válido
   */
  it("POST /api/bookings/[id]/event registra un evento correctamente", async () => {
    // Verifica que el booking existe antes de crear el evento
    const allBookings = await prisma.booking.findMany();
    // eslint-disable-next-line no-console
    console.log("[TEST][PRE-EVENT] Bookings existentes:", allBookings);
    // No se envía userId para evitar error de FK si no existe staff/usuario
    const body = {
      eventType: BookingEventType.CHECKIN,
      notes: "Check-in realizado",
    };
    const req = createMockRequest(`http://localhost:3000/api/bookings/${bookingId}/event`, body);
    // El handler espera un segundo argumento con params
    const res = await POST(req, { params: { id: String(bookingId) } });
    // Log de status para depuración
    // eslint-disable-next-line no-console
    console.log("[TEST] Status recibido:", res.status);
    const json = await res.json();
    // Log de respuesta para depuración
    // eslint-disable-next-line no-console
    console.log("[TEST] Respuesta:", json);
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.eventType).toBe(BookingEventType.CHECKIN);
  });

  /**
   * Test: POST /api/bookings/[id]/event con tipo de evento inválido
   */
  it("POST /api/bookings/[id]/event con tipo de evento inválido responde 400", async () => {
    const body = {
      eventType: "INVALID_TYPE",
      notes: "Evento inválido",
    };
    const req = createMockRequest(`http://localhost:3000/api/bookings/${bookingId}/event`, body);
    const res = await POST(req, { params: { id: String(bookingId) } });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe("Tipo de evento inválido");
  });

  /**
   * Test: POST /api/bookings/[id]/event con ID inválido
   */
  it("POST /api/bookings/[id]/event con ID inválido responde 400", async () => {
    const body = {
      eventType: BookingEventType.CHECKIN,
      notes: "ID inválido",
    };
    const req = createMockRequest(`http://localhost:3000/api/bookings/abc/event`, body);
    const res = await POST(req, { params: { id: "abc" } });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe("ID inválido");
  });
});

/**
 * Explicación general:
 * - Cada test simula una petición HTTP POST al endpoint de eventos de booking.
 * - Se valida el status code, la estructura de la respuesta y los datos esperados.
 * - Se cubren casos exitosos, tipo de evento inválido y ID inválido.
 * - Se prepara una reserva real en la base de datos antes de los tests.
 * - Si usas Prisma, configura una base de datos de test y limpia los datos entre tests para evitar efectos colaterales.
 */
