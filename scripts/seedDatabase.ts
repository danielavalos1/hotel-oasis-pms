import { PrismaClient, RoomType, UserRole, EmployeeStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function cleanDatabase() {
  // Eliminar registros en orden para respetar las restricciones de claves foráneas
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

  // Crear habitaciones con los nuevos campos
  for (const spec of roomSpecifications) {
    for (const roomNumber of spec.numbers) {
      const details = roomTypeDetails[spec.type];
      await prisma.room.create({
        data: {
          roomNumber,
          type: spec.type,
          capacity: details.capacity,
          description: details.description,
          floor: roomNumber.startsWith("2") ? 2 : 1,
          amenities: details.amenities,
          pricePerNight: details.price,
          isAvailable: true,
          roomInventory: {
            create: {
              maintenanceStatus: "GOOD",
              lastMaintenanceDate: new Date(),
            },
          },
        },
      });
    }
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

  // Crear reservas de ejemplo
  const booking1 = await prisma.booking.create({
    data: {
      guestId: guest1.id,
      checkInDate: new Date('2024-01-15'),
      checkOutDate: new Date('2024-01-18'),
      numberOfGuests: 2,
      totalPrice: 2500,
      status: "CONFIRMED",
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      guestId: guest2.id,
      checkInDate: new Date('2024-01-16'),
      checkOutDate: new Date('2024-01-19'),
      numberOfGuests: 1,
      totalPrice: 1800,
      status: "CHECKED_IN",
    },
  });

  // Obtener habitación para asociar
  const room = await prisma.room.findFirst({
    where: { roomNumber: { in: ["101", "102", "103", "201", "202"] } },
  });

  if (!room) {
    console.error("No se encontró ninguna habitación disponible");
    return;
  }

  console.log("Usando habitación:", room.roomNumber);

  // Crear movimientos de ejemplo con datos financieros completos
  await prisma.bookingMovement.create({
    data: {
      bookingId: booking1.id,
      roomId: room.id,
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
      roomId: room.id,
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
