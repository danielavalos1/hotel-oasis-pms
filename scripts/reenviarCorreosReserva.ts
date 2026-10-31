/**
 * Reenvía los correos de una o más reservas (los mismos que manda POST /api/bookings).
 *
 * Uso (en Heroku, donde están las variables SMTP y la base):
 *   heroku run -a hotel-oasis-pms -- npx tsx scripts/reenviarCorreosReserva.ts 1093
 *   heroku run -a hotel-oasis-pms -- npx tsx scripts/reenviarCorreosReserva.ts 1093 1090 --enviar
 *
 * Sin --enviar solo muestra qué se mandaría (simulacro).
 * --solo-huesped  manda solo la confirmación al huésped
 * --solo-staff    manda solo el aviso al personal (STAFF_EMAIL)
 */
import { prisma } from "@/lib/prisma";
import { emailService } from "@/services/emailService";

async function main() {
  const args = process.argv.slice(2);
  const enviar = args.includes("--enviar");
  const soloHuesped = args.includes("--solo-huesped");
  const soloStaff = args.includes("--solo-staff");
  const ids = args.filter((a) => /^\d+$/.test(a)).map(Number);

  if (ids.length === 0 || (soloHuesped && soloStaff)) {
    console.error(
      "Uso: npx tsx scripts/reenviarCorreosReserva.ts <id...> [--enviar] [--solo-huesped | --solo-staff]"
    );
    process.exit(2);
  }

  const mandarHuesped = !soloStaff;
  const mandarStaff = !soloHuesped;
  let fallos = 0;

  for (const id of ids) {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { guest: true, bookingRooms: { include: { room: true } } },
    });

    if (!booking) {
      console.log(`#${id}: no existe`);
      fallos++;
      continue;
    }

    const resumen =
      `#${id} ${booking.guest.firstName} ${booking.guest.lastName} ` +
      `${booking.checkInDate.toISOString().slice(0, 10)} → ${booking.checkOutDate.toISOString().slice(0, 10)} ` +
      `${booking.status} $${booking.totalPrice} (${booking.bookingRooms.length} hab.)`;

    if (booking.status === "CANCELLED") {
      console.log(`${resumen}: cancelada, se omite`);
      continue;
    }

    const destinos = [
      mandarHuesped && `huésped <${booking.guest.email}>`,
      mandarStaff && `personal <${process.env.STAFF_EMAIL}>`,
    ].filter(Boolean);

    if (!enviar) {
      console.log(`${resumen}: SIMULACRO, mandaría a ${destinos.join(" y ")}`);
      continue;
    }

    try {
      if (mandarHuesped) await emailService.sendGuestBookingConfirmation(booking);
      if (mandarStaff) await emailService.sendStaffBookingNotification(booking);
      console.log(`${resumen}: enviado a ${destinos.join(" y ")}`);
    } catch (error) {
      fallos++;
      console.error(`${resumen}: FALLÓ`, error);
    }
  }

  if (!enviar) console.log("\nSimulacro. Agrega --enviar para mandar los correos.");
  await prisma.$disconnect();
  process.exit(fallos ? 1 : 0);
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
