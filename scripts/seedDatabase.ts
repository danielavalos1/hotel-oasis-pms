import { PrismaClient, RoomType, UserRole, EmployeeStatus, RateType, DiscountType, DiscountReason } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function cleanDatabase() {
  // Eliminar registros en orden para respetar las restricciones de claves foráneas
  await prisma.bookingDiscount.deleteMany();
  await prisma.bookingEvent.deleteMany();
  await prisma.bookingMovement.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.bookingRoom.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.guest.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.employeeDocument.deleteMany();
  await prisma.channelRate.deleteMany();
  await prisma.channel.deleteMany();
  await prisma.roomInventory.deleteMany();
  await prisma.roomRate.deleteMany();
  await prisma.discount.deleteMany();
  await prisma.room.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();
  await prisma.turno.deleteMany();

  console.log("Todas las tablas han sido limpiadas");
}

async function main() {
  console.log("Iniciando proceso de seeding...");

  // Limpiar la base de datos primero
  await cleanDatabase();

  // Crear turnos primero (requeridos para reportes)
  const turnos = [
    {
      numero: 1,
      nombre: "Turno Matutino",
      inicio: new Date("2024-01-01T06:00:00Z"),
      fin: new Date("2024-01-01T14:00:00Z"),
      descripcion: "Turno de 6:00 AM a 2:00 PM",
      activo: true,
    },
    {
      numero: 2,
      nombre: "Turno Vespertino", 
      inicio: new Date("2024-01-01T14:00:00Z"),
      fin: new Date("2024-01-01T22:00:00Z"),
      descripcion: "Turno de 2:00 PM a 10:00 PM",
      activo: true,
    },
    {
      numero: 3,
      nombre: "Turno Nocturno",
      inicio: new Date("2024-01-01T22:00:00Z"),
      fin: new Date("2024-01-02T06:00:00Z"),
      descripcion: "Turno de 10:00 PM a 6:00 AM",
      activo: true,
    },
  ];

  for (const turno of turnos) {
    await prisma.turno.create({
      data: turno,
    });
  }

  // Crear departamentos
  const departments = [
    { name: "Recepción", description: "Atención al cliente y reservas" },
    { name: "Limpieza", description: "Mantenimiento y limpieza de habitaciones" },
    { name: "Administración", description: "Gestión administrativa y financiera" },
    { name: "Mantenimiento", description: "Mantenimiento de instalaciones" },
  ];

  const createdDepartments = [];
  for (const dept of departments) {
    const department = await prisma.department.create({
      data: dept,
    });
    createdDepartments.push(department);
  }

  // Crear usuarios con departamentos y fechas de contratación
  const hashedPassword = await bcrypt.hash("123456", 10);

  const users = [
    {
      username: "admin",
      name: "Administrator",
      lastName: "System",
      email: "admin@test.com",
      role: UserRole.SUPERADMIN,
      departmentId: createdDepartments[2].id, // Administración
      position: "Administrador General",
      hireDate: new Date("2023-01-15"),
      status: EmployeeStatus.ACTIVE,
    },
    {
      username: "receptionist1",
      name: "John",
      lastName: "Doe",
      email: "receptionist@test.com",
      role: UserRole.RECEPTIONIST,
      departmentId: createdDepartments[0].id, // Recepción
      position: "Recepcionista Senior",
      hireDate: new Date("2023-03-10"),
      status: EmployeeStatus.ACTIVE,
    },
    {
      username: "housekeeper1",
      name: "Jane",
      lastName: "Smith",
      email: "housekeeper@test.com",
      role: UserRole.HOUSEKEEPER,
      departmentId: createdDepartments[1].id, // Limpieza
      position: "Supervisora de Limpieza",
      hireDate: new Date("2023-02-20"),
      status: EmployeeStatus.ACTIVE,
    },
    {
      username: "receptionist2",
      name: "Maria",
      lastName: "Garcia",
      email: "maria@test.com",
      role: UserRole.RECEPTIONIST,
      departmentId: createdDepartments[0].id, // Recepción
      position: "Recepcionista",
      hireDate: new Date("2023-06-01"),
      status: EmployeeStatus.ACTIVE,
    },
  ];

  const createdUsers = [];
  for (const user of users) {
    const createdUser = await prisma.user.create({
      data: {
        ...user,
        passwordHash: hashedPassword,
      },
    });
    createdUsers.push(createdUser);
  }

  // Crear amenidades
  const amenities = [
    "Televisión",
    "Smart TV",
    'TV 65"',
    "Aire acondicionado",
    "Baño privado",
    "Baño familiar",
    "WiFi gratuito",
    "Amenidades premium",
    "Dos camas",
    "Jacuzzi privado",
    "Sala de estar",
    "Comedor",
  ];

  for (const amenity of amenities) {
    await prisma.amenity.create({
      data: {
        name: amenity,
        description: `Amenidad: ${amenity}`,
      },
    });
  }

  const roomSpecifications = [
    {
      numbers: [
        "102",
        "103",
        "104",
        "105",
        "109",
        "112",
        "113",
        "114",
        "201",
        "202",
        "203",
      ],
      type: RoomType.SENCILLA,
    },
    { numbers: ["214"], type: RoomType.SENCILLA_ESPECIAL },
    {
      numbers: [
        "107",
        "108",
        "110",
        "111",
        "204",
        "207",
        "208",
        "209",
        "210",
        "211",
        "212",
      ],
      type: RoomType.DOBLE,
    },
    { numbers: ["205", "206"], type: RoomType.DOBLE_ESPECIAL },
    { numbers: ["213"], type: RoomType.SUITE_A },
    { numbers: ["106"], type: RoomType.SUITE_B },
  ];

  const roomTypeDetails = {
    [RoomType.SENCILLA]: {
      price: 750.0,
      capacity: 2,
      description: "Habitación sencilla con una cama matrimonial",
      amenities: [
        "Televisión",
        "Aire acondicionado",
        "Baño privado",
        "WiFi gratuito",
      ],
    },
    [RoomType.SENCILLA_ESPECIAL]: {
      price: 900.0,
      capacity: 2,
      description: "Habitación sencilla especial con vista privilegiada",
      amenities: [
        "Smart TV",
        "Aire acondicionado",
        "Baño privado",
        "WiFi gratuito",
        "Amenidades premium",
      ],
    },
    [RoomType.DOBLE]: {
      price: 1050.0,
      capacity: 4,
      description: "Habitación doble con dos camas matrimoniales",
      amenities: [
        "Televisión",
        "Aire acondicionado",
        "Baño familiar",
        "WiFi gratuito",
        "Dos camas",
      ],
    },
    [RoomType.DOBLE_ESPECIAL]: {
      price: 1200.0,
      capacity: 4,
      description: "Habitación doble especial con vista y amenidades premium",
      amenities: [
        "Smart TV",
        "Aire acondicionado",
        "Baño familiar",
        "WiFi gratuito",
        "Dos camas",
        "Amenidades premium",
      ],
    },
    [RoomType.SUITE_A]: {
      price: 1400.0,
      capacity: 4,
      description: "Suite de lujo con jacuzzi y sala de estar",
      amenities: [
        "Aire acondicionado",
        "Baño privado",
        "WiFi gratuito",
        "Amenidades premium",
        "Jacuzzi privado",
        "Sala de estar",
      ],
    },
    [RoomType.SUITE_B]: {
      price: 1400.0,
      capacity: 4,
      description: "Suite familiar con sala de estar y comedor",
      amenities: [
        'TV 65"',
        "Aire acondicionado",
        "Baño familiar",
        "WiFi gratuito",
        "Amenidades premium",
        "Sala de estar",
        "Comedor",
        "Dos camas",
      ],
    },
  };

  // Crear habitaciones con el nuevo sistema de rates
  const createdRooms = [];
  for (const spec of roomSpecifications) {
    for (const roomNumber of spec.numbers) {
      const details = roomTypeDetails[spec.type];
      const room = await prisma.room.create({
        data: {
          roomNumber,
          type: spec.type,
          capacity: details.capacity,
          description: details.description,
          floor: roomNumber.startsWith("2") ? 2 : 1,
          amenities: details.amenities,
          isAvailable: true,
          roomInventory: {
            create: {
              maintenanceStatus: "GOOD",
              lastMaintenanceDate: new Date(),
            },
          },
        },
      });
      createdRooms.push({ room, basePrice: details.price });
    }
  }

  // Crear tarifas base para cada habitación
  console.log("Creando tarifas base para las habitaciones...");
  for (const { room, basePrice } of createdRooms) {
    const taxRate = 0.16; // 16% IVA
    const serviceFeeRate = 0.04; // 4% ISH (Impuesto Sobre Hospedaje)
    
    // basePrice es el precio final CON impuestos
    // Para obtener el subtotal (precio sin impuestos), dividimos entre 1.2 (1 + 0.16 + 0.04)
    const subtotal = basePrice / 1.2;
    const taxAmount = subtotal * taxRate;
    const serviceFeeAmount = subtotal * serviceFeeRate;
    const totalPrice = basePrice; // basePrice ya incluye impuestos

    await prisma.roomRate.create({
      data: {
        roomId: room.id,
        name: "Tarifa Base",
        type: RateType.BASE,
        basePrice: basePrice,
        taxRate: taxRate,
        serviceFeeRate: serviceFeeRate,
        subtotal: subtotal,
        taxAmount: taxAmount,
        serviceFeeAmount: serviceFeeAmount,
        totalPrice: totalPrice,
        isActive: true,
        isDefault: true,
        createdBy: "system",
      },
    });

    // Crear tarifa de fin de semana (20% más cara)
    const weekendBasePrice = basePrice * 1.2;
    const weekendSubtotal = weekendBasePrice / 1.2;
    const weekendTaxAmount = weekendSubtotal * taxRate;
    const weekendServiceFeeAmount = weekendSubtotal * serviceFeeRate;
    const weekendTotalPrice = weekendBasePrice; // weekendBasePrice ya incluye impuestos

    await prisma.roomRate.create({
      data: {
        roomId: room.id,
        name: "Tarifa Fin de Semana",
        type: RateType.WEEKEND,
        basePrice: weekendBasePrice,
        taxRate: taxRate,
        serviceFeeRate: serviceFeeRate,
        subtotal: weekendSubtotal,
        taxAmount: weekendTaxAmount,
        serviceFeeAmount: weekendServiceFeeAmount,
        totalPrice: weekendTotalPrice,
        isActive: true,
        isDefault: false,
        validDays: ["FRIDAY", "SATURDAY", "SUNDAY"],
        createdBy: "system",
      },
    });
  }

  // Crear descuentos del sistema
  console.log("Creando descuentos del sistema...");
  const discounts = [
    {
      name: "Descuento Corporativo",
      description: "Descuento para convenios corporativos",
      type: DiscountType.PERCENTAGE,
      value: 15.00,
      minAmount: 500.00,
      isActive: true,
      requiresApproval: false,
      allowedRoles: ["RECEPTIONIST", "ADMIN", "SUPERADMIN"],
      createdBy: "system",
    },
    {
      name: "Descuento VIP",
      description: "Descuento para clientes VIP y frecuentes",
      type: DiscountType.PERCENTAGE,
      value: 20.00,
      minAmount: 1000.00,
      maxAmount: 500.00,
      isActive: true,
      requiresApproval: true,
      allowedRoles: ["ADMIN", "SUPERADMIN"],
      createdBy: "system",
    },
    {
      name: "Descuento Promocional",
      description: "Descuento por promoción especial",
      type: DiscountType.FIXED_AMOUNT,
      value: 200.00,
      isActive: true,
      requiresApproval: false,
      allowedRoles: ["RECEPTIONIST", "ADMIN", "SUPERADMIN"],
      createdBy: "system",
    },
    {
      name: "Descuento Amigo",
      description: "Descuento para amigos de los dueños",
      type: DiscountType.PERCENTAGE,
      value: 25.00,
      isActive: true,
      requiresApproval: true,
      allowedRoles: ["ADMIN", "SUPERADMIN"],
      createdBy: "system",
    },
  ];

  for (const discount of discounts) {
    await prisma.discount.create({
      data: discount,
    });
  }

  console.log("Database seeded successfully!");
  console.log("Turnos created:", turnos.map((t) => t.nombre).join(", "));
  console.log("Departments created:", departments.map((d) => d.name).join(", "));
  console.log(
    "Users created:",
    users.map((u) => `${u.name} ${u.lastName} (${u.role})`).join(", ")
  );
  console.log("Rooms created according to the specified configuration");
  console.log("Amenities created:", amenities.length, "items");

  // Crear datos de prueba para reportes
  await createSampleReportData();
}

async function createSampleReportData() {
  console.log("Creando datos de prueba para reportes...");

  // Obtener usuarios existentes
  const adminUser = await prisma.user.findFirst({
    where: { role: "SUPERADMIN" },
  });

  const receptionistUser = await prisma.user.findFirst({
    where: { role: "RECEPTIONIST" },
  });

  if (!adminUser || !receptionistUser) {
    console.error("No se encontraron usuarios necesarios");
    return;
  }

  // Crear huéspedes de ejemplo
  const guest1 = await prisma.guest.create({
    data: {
      firstName: "María",
      lastName: "González",
      email: "maria.gonzalez@example.com",
      phoneNumber: "+52 123 456 7890",
      address: "Calle Principal 123, Ciudad de México",
    },
  });

  const guest2 = await prisma.guest.create({
    data: {
      firstName: "Carlos",
      lastName: "Rodríguez",
      email: "carlos.rodriguez@example.com",
      phoneNumber: "+52 987 654 3210",
      address: "Avenida Central 456, Guadalajara",
    },
  });

  // Obtener algunas habitaciones y sus tarifas para crear reservas
  const roomsWithRates = await prisma.room.findMany({
    take: 3,
    include: {
      roomRates: {
        where: { isDefault: true },
      },
    },
  });

  if (roomsWithRates.length === 0) {
    console.error("No se encontraron habitaciones con tarifas");
    return;
  }

  // Crear reservas de ejemplo con pricing detallado
  const room1 = roomsWithRates[0];
  const room1Rate = room1.roomRates[0];
  
  if (!room1Rate) {
    console.error("No se encontró tarifa para la habitación", room1.roomNumber);
    return;
  }

  // Reserva 1: 3 noches sin descuento
  const nights1 = 3;
  const booking1TotalPrice = Number(room1Rate.totalPrice) * nights1; // Precio total con impuestos
  const booking1Subtotal = Number(room1Rate.subtotal) * nights1; // Precio sin impuestos
  const booking1BaseAmount = booking1Subtotal; // baseAmount es el precio sin impuestos
  const booking1TaxAmount = Number(room1Rate.taxAmount) * nights1; // IVA
  const booking1ServiceFeeAmount = Number(room1Rate.serviceFeeAmount) * nights1; // ISH

  const booking1 = await prisma.booking.create({
    data: {
      guestId: guest1.id,
      checkInDate: new Date('2024-01-15'),
      checkOutDate: new Date('2024-01-18'),
      numberOfGuests: 2,
      baseAmount: booking1BaseAmount,
      subtotal: booking1Subtotal,
      discountAmount: 0,
      taxAmount: booking1TaxAmount,
      serviceFeeAmount: booking1ServiceFeeAmount,
      totalPrice: booking1TotalPrice,
      status: "CONFIRMED",
    },
  });

  // Crear BookingRoom para la reserva 1
  await prisma.bookingRoom.create({
    data: {
      bookingId: booking1.id,
      roomId: room1.id,
      priceAtTime: room1Rate.totalPrice,
    },
  });

  // Reserva 2: Con descuento corporativo del 15%
  const room2 = roomsWithRates[1];
  const room2Rate = room2.roomRates[0];
  
  if (!room2Rate) {
    console.error("No se encontró tarifa para la habitación", room2.roomNumber);
    return;
  }

  const nights2 = 2;
  const booking2Subtotal = Number(room2Rate.subtotal) * nights2; // Precio sin impuestos
  const booking2BaseAmount = booking2Subtotal; // baseAmount es el precio sin impuestos
  const discountAmount = booking2Subtotal * 0.15; // 15% descuento sobre el subtotal
  const subtotalAfterDiscount = booking2Subtotal - discountAmount;
  const booking2TaxAmount = subtotalAfterDiscount * Number(room2Rate.taxRate); // IVA sobre precio con descuento
  const booking2ServiceFeeAmount = subtotalAfterDiscount * Number(room2Rate.serviceFeeRate); // ISH sobre precio con descuento
  const booking2TotalPrice = subtotalAfterDiscount + booking2TaxAmount + booking2ServiceFeeAmount;

  const booking2 = await prisma.booking.create({
    data: {
      guestId: guest2.id,
      checkInDate: new Date('2024-01-16'),
      checkOutDate: new Date('2024-01-18'),
      numberOfGuests: 1,
      baseAmount: booking2BaseAmount,
      subtotal: booking2Subtotal,
      discountAmount: discountAmount,
      taxAmount: booking2TaxAmount,
      serviceFeeAmount: booking2ServiceFeeAmount,
      totalPrice: booking2TotalPrice,
      status: "CHECKED_IN",
    },
  });

  // Crear BookingRoom para la reserva 2
  await prisma.bookingRoom.create({
    data: {
      bookingId: booking2.id,
      roomId: room2.id,
      priceAtTime: room2Rate.totalPrice,
    },
  });

  // Aplicar descuento corporativo a la reserva 2
  const corporateDiscount = await prisma.discount.findFirst({
    where: { name: "Descuento Corporativo" },
  });

  if (corporateDiscount) {
    await prisma.bookingDiscount.create({
      data: {
        bookingId: booking2.id,
        discountId: corporateDiscount.id,
        appliedBy: receptionistUser.username,
        discountAmount: discountAmount,
        discountType: corporateDiscount.type,
        discountValue: corporateDiscount.value,
        reason: DiscountReason.CORPORATE,
        notes: "Cliente con convenio corporativo verificado",
      },
    });
  }

  // Crear movimientos de ejemplo con datos financieros completos
  await prisma.bookingMovement.create({
    data: {
      bookingId: booking1.id,
      roomId: room1.id,
      type: "PAYMENT",
      amount: 2500,
      subtotal: 2155.17,  // 82.76% del total
      iva: 344.83,        // 16% del subtotal
      tax3: 64.66,        // 3% del subtotal
      total: 2500,
      reference: "REF001",
      concept: "Pago de hospedaje - Check-in",
      createdAt: new Date('2024-01-15T10:00:00Z'), // Fecha específica
      turnoId: 1,
      userId: adminUser.id,
      currency: "MXN",
      paymentType: "CASH",
    },
  });

  await prisma.bookingMovement.create({
    data: {
      bookingId: booking2.id,
      roomId: room2.id,
      type: "EXTRA_CHARGE",
      amount: 500,
      subtotal: 431.03,   // 82.76% del total
      iva: 68.97,         // 16% del subtotal
      tax3: 12.93,        // 3% del subtotal
      total: 500,
      reference: "REF002",
      concept: "Servicio a habitación",
      createdAt: new Date('2024-01-16T15:30:00Z'), // Fecha específica
      turnoId: 2,
      userId: receptionistUser.id,
      currency: "MXN",
      paymentType: "CARD",
    },
  });

  // Crear pagos de ejemplo
  await prisma.payment.create({
    data: {
      bookingId: booking1.id,
      amount: 2500,
      paymentDate: new Date('2024-01-15'),
      paymentMethod: "Efectivo",
      turnoId: 1,
      userId: adminUser.id,
      currency: "MXN",
      paymentType: "CASH",
      description: "Pago completo de hospedaje",
      reference: "PAY001",
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking2.id,
      amount: 1800,
      paymentDate: new Date('2024-01-16'),
      paymentMethod: "Tarjeta de crédito",
      turnoId: 2,
      userId: receptionistUser.id,
      currency: "MXN",
      paymentType: "CARD",
      description: "Pago de reserva",
      reference: "PAY002",
    },
  });

  console.log("✅ Datos de prueba para reportes creados exitosamente!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
