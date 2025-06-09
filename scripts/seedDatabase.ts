import { PrismaClient, RoomType, UserRole } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function cleanDatabase() {
  // Eliminar registros en orden para respetar las restricciones de claves foráneas
  await prisma.roomInventory.deleteMany();
  await prisma.room.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.user.deleteMany();

  console.log("Todas las tablas han sido limpiadas");
}

async function main() {
  console.log("Iniciando proceso de seeding...");

  // Limpiar la base de datos primero
  await cleanDatabase();

  // Crear usuarios
  const hashedPassword = await bcrypt.hash("123456", 10);

  const users = [
    {
      username: "admin",
      name: "Administrator",
      email: "admin@test.com",
      role: UserRole.SUPERADMIN,
    },
    {
      username: "receptionist1",
      name: "John Doe",
      email: "receptionist@test.com",
      role: UserRole.RECEPTIONIST,
    },
    {
      username: "housekeeper1",
      name: "Jane Smith",
      email: "housekeeper@test.com",
      role: UserRole.HOUSEKEEPER,
    },
  ];

  for (const user of users) {
    await prisma.user.create({
      data: {
        ...user,
        passwordHash: hashedPassword,
      },
    });
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
  console.log(
    "Users created:",
    users.map((u) => `${u.name} (${u.role})`).join(", ")
  );
  console.log("Rooms created according to the specified configuration");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
