import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Crear roles
  const adminRole = await prisma.role.create({
    data: {
      roleName: "administrator",
    },
  });

  await prisma.role.createMany({
    data: [{ roleName: "receptionist" }, { roleName: "creator" }],
  });

  // Crear permisos básicos
  await prisma.permission.createMany({
    data: [
      { permissionName: "manage_users" },
      { permissionName: "manage_bookings" },
      { permissionName: "manage_rooms" },
      { permissionName: "manage_guests" },
      { permissionName: "view_reports" },
      { permissionName: "manage_payments" },
    ],
  });

  // Obtener todos los permisos para asignarlos al rol de administrador
  const allPermissions = await prisma.permission.findMany();

  // Asignar todos los permisos al rol de administrador
  for (const permission of allPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Crear usuario administrador
  const hashedPassword = await bcrypt.hash("123456", 10);

  const adminUser = await prisma.user.create({
    data: {
      username: "admin",
      email: "admin@test.com",
      passwordHash: hashedPassword,
      roleId: adminRole.id,
    },
  });

  console.log("Database seeded successfully!");
  console.log("Admin user created:", adminUser.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
