// Tests para la API de status de booking (PATCH /api/bookings/[id]/status)
import { PATCH } from "@/app/api/bookings/[id]/status/route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

function createMockRequest(url: string, body: any) {
  return new NextRequest(url, {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("Booking Status API (App Router handler)", () => {
  let bookingId: number;
  let testPrefix: string;

  beforeAll(async () => {
    // Crear un prefijo único para este test
    testPrefix = `status-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Limpiar cualquier dato previo con este prefijo
    await prisma.bookingRoom.deleteMany({
      where: {
        booking: {
          guest: {
            email: {
              startsWith: testPrefix
            }
          }
        }
      }
    });
    await prisma.booking.deleteMany({
      where: {
        guest: {
          email: {
            startsWith: testPrefix
          }
        }
      }
    });
    await prisma.room.deleteMany({
      where: {
        roomNumber: {
          startsWith: testPrefix
        }
      }
    });
    await prisma.guest.deleteMany({
      where: {
        email: {
          startsWith: testPrefix
        }
      }
    });
    
    // Usar una transacción para asegurar que todo se guarde correctamente
    const result = await prisma.$transaction(async (tx) => {
      // Crea un guest con email único
      const guest = await tx.guest.create({
        data: {
          firstName: "Status",
          lastName: "Tester",
          email: `${testPrefix}@test.com`,
          phoneNumber: "1234567890",
        },
      });
      console.log("[TEST][beforeAll] Guest creado:", guest);
      
      // Crea un room con número único
      const room = await tx.room.create({
        data: {
          roomNumber: `${testPrefix}-301`,
          type: "SENCILLA",
          capacity: 2,
          pricePerNight: 100,
        },
      });
      console.log("[TEST][beforeAll] Room creado:", room);
      
      // Crea el booking
      const booking = await tx.booking.create({
        data: {
          guestId: guest.id,
          checkInDate: new Date(),
          checkOutDate: new Date(Date.now() + 86400000),
          totalPrice: 100,
          status: "confirmed",
          numberOfGuests: 1,
        },
      });
      console.log("[TEST][beforeAll] Booking creado:", booking);
      
      // Relacionar el booking con el room
      const bookingRoom = await tx.bookingRoom.create({
        data: {
          bookingId: booking.id,
          roomId: room.id,
          priceAtTime: 100,
        },
      });
      console.log("[TEST][beforeAll] BookingRoom creado:", bookingRoom);
      
      return { guest, room, booking, bookingRoom };
    });
    
    bookingId = result.booking.id;
    console.log("[TEST][beforeAll] Todo creado exitosamente. Booking ID:", bookingId);
  });

  afterAll(async () => {
    // Limpiar los datos creados en este test
    if (testPrefix) {
      await prisma.bookingRoom.deleteMany({
        where: {
          booking: {
            guest: {
              email: {
                startsWith: testPrefix
              }
            }
          }
        }
      });
      await prisma.booking.deleteMany({
        where: {
          guest: {
            email: {
              startsWith: testPrefix
            }
          }
        }
      });
      await prisma.room.deleteMany({
        where: {
          roomNumber: {
            startsWith: testPrefix
          }
        }
      });
      await prisma.guest.deleteMany({
        where: {
          email: {
            startsWith: testPrefix
          }
        }
      });
    }
    await prisma.$disconnect();
  });

  it("PATCH /api/bookings/[id]/status actualiza correctamente el status", async () => {
    const body = { status: "checked-in" };
    const req = createMockRequest(`http://localhost:3000/api/bookings/${bookingId}/status`, body);
    const res = await PATCH(req, { params: { id: String(bookingId) } });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.status).toBe("checked-in");
  });

  it("PATCH /api/bookings/[id]/status con ID inválido responde 400", async () => {
    const body = { status: "cancelled" };
    const req = createMockRequest(`http://localhost:3000/api/bookings/abc/status`, body);
    const res = await PATCH(req, { params: { id: "abc" } });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe("ID inválido");
  });

  it("PATCH /api/bookings/[id]/status con booking inexistente responde 404", async () => {
    const body = { status: "cancelled" };
    const req = createMockRequest(`http://localhost:3000/api/bookings/999999/status`, body);
    const res = await PATCH(req, { params: { id: "999999" } });
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe("Booking no encontrado");
  });
});

/**
 * Explicación general:
 * - Cada test simula una petición HTTP PATCH al endpoint de status de booking.
 * - Se valida el status code, la estructura de la respuesta y los datos esperados.
 * - Se cubren casos exitosos, ID inválido y booking inexistente.
 * - Se prepara una reserva real en la base de datos antes de los tests.
 * - Si usas Prisma, configura una base de datos de test y limpia los datos entre tests para evitar efectos colaterales.
 */
