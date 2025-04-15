import { PrismaClient, RoomType, UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
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
      username: "admin2",
      name: "Administrator 2",
      email: "d@test.com",
      role: UserRole.ADMIN,
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
    await prisma.user.upsert({
      where: { username: user.username },
      update: {},
      create: {
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

  // Configuración de tipos de habitaciones
  const roomConfigs = [
    {
      type: RoomType.SENCILLA,
      count: 11,
      baseNumber: 101,
      price: 750.0,
    },
    {
      type: RoomType.SENCILLA_ESPECIAL,
      count: 1,
      baseNumber: 201,
      price: 900.0,
    },
    {
      type: RoomType.DOBLE,
      count: 11,
      baseNumber: 301,
      price: 1050.0,
    },
    {
      type: RoomType.DOBLE_ESPECIAL,
      count: 2,
      baseNumber: 401,
      price: 1200.0,
    },
    {
      type: RoomType.SUITE_A,
      count: 1,
      baseNumber: 501,
      price: 1400.0,
    },
    {
      type: RoomType.SUITE_B,
      count: 1,
      baseNumber: 601,
      price: 1400.0,
    },
  ];

  // Crear habitaciones
  for (const config of roomConfigs) {
    for (let i = 0; i < config.count; i++) {
      const roomNumber = (config.baseNumber + i).toString();
      await prisma.room.create({
        data: {
          roomNumber,
          roomType: config.type,
          pricePerNight: config.price,
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
  console.log(`Created rooms:
    - ${roomConfigs[0].count} Sencillas
    - ${roomConfigs[1].count} Sencilla Especial
    - ${roomConfigs[2].count} Dobles
    - ${roomConfigs[3].count} Dobles Especiales
    - ${roomConfigs[4].count} Suite A
    - ${roomConfigs[5].count} Suite B`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
