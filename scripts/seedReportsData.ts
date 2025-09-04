import { 
  PrismaClient, 
  MovementType, 
  PaymentType, 
  Currency, 
  BookingEventType,
  AttendanceStatus 
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando proceso de seeding para datos de reportes...");

  // Obtener usuarios, turnos y habitaciones existentes
  const users = await prisma.user.findMany();
  const turnos = await prisma.turno.findMany();
  const rooms = await prisma.room.findMany();

  if (users.length === 0 || turnos.length === 0 || rooms.length === 0) {
    console.error("Error: Debe ejecutar primero el seedDatabase.ts");
    process.exit(1);
  }

  const adminUser = users.find(u => u.role === 'SUPERADMIN');
  const receptionistUser = users.find(u => u.role === 'RECEPTIONIST');
  const housekeeperUser = users.find(u => u.role === 'HOUSEKEEPER');

  console.log("Creando huéspedes...");
  
  // Crear huéspedes para las reservas
  const guests = [
    {
      firstName: "Carlos",
      lastName: "Rodríguez",
      email: "carlos.rodriguez@email.com",
      phoneNumber: "+52 55 1234 5678",
      address: "Av. Reforma 123, CDMX",
    },
    {
      firstName: "Ana",
      lastName: "Martínez",
      email: "ana.martinez@email.com",
      phoneNumber: "+52 55 2345 6789",
      address: "Calle Juárez 456, Guadalajara",
    },
    {
      firstName: "Roberto",
      lastName: "López",
      email: "roberto.lopez@email.com",
      phoneNumber: "+52 55 3456 7890",
      address: "Blvd. Díaz Ordaz 789, Monterrey",
    },
    {
      firstName: "Laura",
      lastName: "Hernández",
      email: "laura.hernandez@email.com",
      phoneNumber: "+52 55 4567 8901",
      address: "Av. Universidad 321, Puebla",
    },
    {
      firstName: "Miguel",
      lastName: "Torres",
      email: "miguel.torres@email.com",
      phoneNumber: "+52 55 5678 9012",
      address: "Calle Morelos 654, Querétaro",
    },
    {
      firstName: "Sofia",
      lastName: "Ramírez",
      email: "sofia.ramirez@email.com",
      phoneNumber: "+52 55 6789 0123",
      address: "Av. Hidalgo 987, Toluca",
    },
  ];

  const createdGuests = [];
  for (const guest of guests) {
    const createdGuest = await prisma.guest.create({
      data: guest,
    });
    createdGuests.push(createdGuest);
  }

  console.log("Creando reservas con movimientos financieros...");

  // Crear reservas con diferentes estados y fechas para reportes
  const bookingsData = [
    {
      guestId: createdGuests[0].id,
      checkInDate: new Date("2024-08-15"),
      checkOutDate: new Date("2024-08-18"),
      status: "CONFIRMED",
      numberOfGuests: 2,
      roomNumbers: ["102", "103"],
      totalPrice: 2250.00, // 3 noches x 750 x 2 habitaciones
    },
    {
      guestId: createdGuests[1].id,
      checkInDate: new Date("2024-08-20"),
      checkOutDate: new Date("2024-08-23"),
      status: "CHECKED_IN",
      numberOfGuests: 4,
      roomNumbers: ["107"],
      totalPrice: 3150.00, // 3 noches x 1050
    },
    {
      guestId: createdGuests[2].id,
      checkInDate: new Date("2024-08-25"),
      checkOutDate: new Date("2024-08-27"),
      status: "CHECKED_OUT",
      numberOfGuests: 2,
      roomNumbers: ["214"],
      totalPrice: 1800.00, // 2 noches x 900
    },
    {
      guestId: createdGuests[3].id,
      checkInDate: new Date("2024-08-28"),
      checkOutDate: new Date("2024-08-30"),
      status: "CONFIRMED",
      numberOfGuests: 4,
      roomNumbers: ["205"],
      totalPrice: 2400.00, // 2 noches x 1200
    },
    {
      guestId: createdGuests[4].id,
      checkInDate: new Date("2024-09-01"),
      checkOutDate: new Date("2024-09-04"),
      status: "CHECKED_IN",
      numberOfGuests: 4,
      roomNumbers: ["213"],
      totalPrice: 4200.00, // 3 noches x 1400
    },
    {
      guestId: createdGuests[5].id,
      checkInDate: new Date("2024-09-05"),
      checkOutDate: new Date("2024-09-08"),
      status: "CONFIRMED",
      numberOfGuests: 4,
      roomNumbers: ["106"],
      totalPrice: 4200.00, // 3 noches x 1400
    },
  ];

  const createdBookings = [];
  for (const bookingData of bookingsData) {
    // Crear la reserva
    const booking = await prisma.booking.create({
      data: {
        guestId: bookingData.guestId,
        checkInDate: bookingData.checkInDate,
        checkOutDate: bookingData.checkOutDate,
        status: bookingData.status,
        numberOfGuests: bookingData.numberOfGuests,
        totalPrice: bookingData.totalPrice,
      },
    });

    // Asociar habitaciones a la reserva
    for (const roomNumber of bookingData.roomNumbers) {
      const room = rooms.find(r => r.roomNumber === roomNumber);
      if (room) {
        await prisma.bookingRoom.create({
          data: {
            bookingId: booking.id,
            roomId: room.id,
            priceAtTime: room.pricePerNight,
          },
        });
      }
    }

    createdBookings.push(booking);
  }

  console.log("Creando pagos y movimientos financieros...");

  // Crear pagos y movimientos financieros para las reservas
  const paymentTypes = [PaymentType.CASH, PaymentType.CARD, PaymentType.TRANSFER];
  const currencies = [Currency.MXN, Currency.USD];
  
  for (let i = 0; i < createdBookings.length; i++) {
    const booking = createdBookings[i];
    const randomTurno = turnos[Math.floor(Math.random() * turnos.length)];
    const randomUser = [adminUser, receptionistUser][Math.floor(Math.random() * 2)];
    const randomPaymentType = paymentTypes[Math.floor(Math.random() * paymentTypes.length)];
    const randomCurrency = currencies[Math.floor(Math.random() * currencies.length)];

    // Crear pago principal
    const paymentAmount = Number(booking.totalPrice) * 0.8; // 80% del total
    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: paymentAmount,
        paymentDate: booking.checkInDate,
        paymentMethod: randomPaymentType,
        turnoId: randomTurno.numero,
        userId: randomUser?.id,
        currency: randomCurrency,
        paymentType: randomPaymentType,
        description: `Pago de hospedaje - Reserva #${booking.id}`,
        reference: `PAY-${booking.id}-${Date.now()}`,
      },
    });

    // Crear movimiento principal de hospedaje
    const subtotal = paymentAmount / 1.16; // Sin IVA
    const iva = subtotal * 0.16;
    const tax3 = subtotal * 0.03;

    await prisma.bookingMovement.create({
      data: {
        bookingId: booking.id,
        roomId: rooms.find(r => r.roomNumber === bookingsData[i].roomNumbers[0])?.id,
        type: MovementType.LODGING_PAYMENT,
        amount: paymentAmount,
        subtotal: subtotal,
        iva: iva,
        tax3: tax3,
        total: paymentAmount,
        reference: `MOV-${booking.id}-LODGING`,
        concept: `Pago por hospedaje - ${bookingsData[i].roomNumbers.join(', ')}`,
        turnoId: randomTurno.numero,
        userId: randomUser?.id,
        currency: randomCurrency,
        paymentType: randomPaymentType,
        createdAt: booking.checkInDate,
      },
    });

    // Agregar algunos cargos extra aleatorios
    if (Math.random() > 0.5) {
      const extraCharge = 150.00;
      const extraSubtotal = extraCharge / 1.16;
      const extraIva = extraSubtotal * 0.16;
      const extraTax3 = extraSubtotal * 0.03;

      await prisma.bookingMovement.create({
        data: {
          bookingId: booking.id,
          type: MovementType.SERVICE_CHARGE,
          amount: extraCharge,
          subtotal: extraSubtotal,
          iva: extraIva,
          tax3: extraTax3,
          total: extraCharge,
          reference: `MOV-${booking.id}-SERVICE`,
          concept: "Cargo por servicios adicionales",
          turnoId: randomTurno.numero,
          userId: randomUser?.id,
          currency: Currency.MXN,
          paymentType: PaymentType.CASH,
          createdAt: new Date(booking.checkInDate.getTime() + 24 * 60 * 60 * 1000), // Al día siguiente
        },
      });

      // Pago del cargo extra
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: extraCharge,
          paymentDate: new Date(booking.checkInDate.getTime() + 24 * 60 * 60 * 1000),
          paymentMethod: PaymentType.CASH,
          turnoId: randomTurno.numero,
          userId: randomUser?.id,
          currency: Currency.MXN,
          paymentType: PaymentType.CASH,
          description: "Pago de servicios adicionales",
          reference: `PAY-${booking.id}-EXTRA-${Date.now()}`,
        },
      });
    }

    // Crear eventos de reserva
    await prisma.bookingEvent.create({
      data: {
        bookingId: booking.id,
        eventType: BookingEventType.CHECKIN,
        eventDate: booking.checkInDate,
        userId: receptionistUser?.id,
        notes: `Check-in realizado por ${receptionistUser?.name}`,
      },
    });

    if (booking.status === "CHECKED_OUT") {
      await prisma.bookingEvent.create({
        data: {
          bookingId: booking.id,
          eventType: BookingEventType.CHECKOUT,
          eventDate: booking.checkOutDate,
          userId: receptionistUser?.id,
          notes: `Check-out realizado por ${receptionistUser?.name}`,
        },
      });
    }
  }

  console.log("Creando registros de asistencia...");

  // Crear registros de asistencia para los empleados
  const startDate = new Date("2024-08-01");
  const endDate = new Date("2024-09-01");
  
  for (const user of users) {
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      // Simular asistencia (90% de probabilidad de estar presente)
      const isPresent = Math.random() > 0.1;
      const status = isPresent ? AttendanceStatus.PRESENT : 
                    Math.random() > 0.5 ? AttendanceStatus.ABSENT : AttendanceStatus.LATE;
      
      const checkInHour = 8 + Math.floor(Math.random() * 2); // Entre 8 y 9 AM
      const checkInMinute = Math.floor(Math.random() * 60);
      const checkOutHour = 17 + Math.floor(Math.random() * 2); // Entre 5 y 6 PM
      const checkOutMinute = Math.floor(Math.random() * 60);

      const checkInTime = new Date(currentDate);
      checkInTime.setHours(checkInHour, checkInMinute, 0, 0);
      
      const checkOutTime = new Date(currentDate);
      checkOutTime.setHours(checkOutHour, checkOutMinute, 0, 0);

      await prisma.attendance.create({
        data: {
          userId: user.id,
          checkInTime: checkInTime,
          checkOutTime: isPresent ? checkOutTime : null,
          date: new Date(currentDate),
          status: status,
          notes: status === AttendanceStatus.LATE ? "Llegada tardía" : 
                status === AttendanceStatus.ABSENT ? "Ausencia justificada" : null,
        },
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  console.log("Creando horarios de empleados...");

  // Crear horarios para los empleados
  for (const user of users) {
    // Horario de lunes a viernes
    for (let dayOfWeek = 1; dayOfWeek <= 5; dayOfWeek++) {
      const startTime = new Date("2024-01-01T08:00:00Z");
      const endTime = new Date("2024-01-01T17:00:00Z");
      
      await prisma.schedule.create({
        data: {
          userId: user.id,
          startTime: startTime,
          endTime: endTime,
          dayOfWeek: dayOfWeek,
          isRecurring: true,
        },
      });
    }
  }

  console.log("Datos de reportes creados exitosamente!");
  console.log(`- ${createdGuests.length} huéspedes creados`);
  console.log(`- ${createdBookings.length} reservas creadas`);
  console.log(`- Pagos y movimientos financieros generados`);
  console.log(`- Registros de asistencia generados para ${users.length} empleados`);
  console.log(`- Horarios de trabajo configurados`);
  console.log("La base de datos ahora contiene datos suficientes para generar reportes completos.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
