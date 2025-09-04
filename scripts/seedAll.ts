import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runSeedSequence() {
  console.log("🌱 Iniciando proceso completo de seeding...\n");

  try {
    // Verificar conexión a la base de datos
    console.log("📊 Verificando conexión a la base de datos...");
    await prisma.$connect();
    console.log("✅ Conexión exitosa\n");

    // Ejecutar seedDatabase.ts
    console.log("🏨 Ejecutando seed básico (seedDatabase.ts)...");
    execSync('npx tsx scripts/seedDatabase.ts', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log("✅ Seed básico completado\n");

    // Ejecutar seedReportsData.ts
    console.log("📈 Ejecutando seed de datos para reportes (seedReportsData.ts)...");
    execSync('npx tsx scripts/seedReportsData.ts', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log("✅ Seed de reportes completado\n");

    console.log("🎉 ¡Proceso de seeding completado exitosamente!");
    console.log("\n📋 Resumen de datos creados:");
    console.log("- ✅ Turnos de trabajo (3)");
    console.log("- ✅ Departamentos (4)");
    console.log("- ✅ Usuarios del sistema (4)");
    console.log("- ✅ Habitaciones y amenidades");
    console.log("- ✅ Huéspedes (6)");
    console.log("- ✅ Reservas con movimientos financieros (6)");
    console.log("- ✅ Pagos y movimientos de caja");
    console.log("- ✅ Registros de asistencia de empleados");
    console.log("- ✅ Horarios de trabajo");
    console.log("\n🚀 La base de datos está lista para usar con el sistema de reportes!");

  } catch (error) {
    console.error("❌ Error durante el proceso de seeding:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Función para mostrar ayuda
function showHelp() {
  console.log(`
🌱 Hotel Oasis PMS - Sistema de Seeding

USO:
  npm run seed:all     - Ejecutar seeding completo (básico + reportes)
  npm run seed:basic   - Solo seeding básico
  npm run seed:reports - Solo datos para reportes

DESCRIPCIÓN:
  Este script ejecuta el proceso completo de seeding para el Hotel Oasis PMS,
  creando todos los datos necesarios para el funcionamiento del sistema y
  la generación de reportes financieros.

DATOS CREADOS:
  - Turnos de trabajo (Matutino, Vespertino, Nocturno)
  - Departamentos (Recepción, Limpieza, Administración, Mantenimiento)
  - Usuarios del sistema con diferentes roles
  - Habitaciones con inventario y amenidades
  - Huéspedes y reservas de ejemplo
  - Movimientos financieros y pagos
  - Registros de asistencia de empleados
  - Horarios de trabajo

REQUISITOS:
  - Base de datos PostgreSQL configurada
  - Variables de entorno DATABASE_URL configurada
  - Migraciones de Prisma aplicadas
`);
}

// Verificar argumentos de línea de comandos
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Ejecutar el seeding
runSeedSequence();
