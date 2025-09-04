import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function showDatabaseInfo() {
  console.log("📊 Hotel Oasis PMS - Información de Base de Datos\n");

  try {
    // Verificar conexión
    await prisma.$connect();
    console.log("✅ Conexión a base de datos: OK\n");

    // Contar registros en todas las tablas principales
    const counts = await Promise.all([
      prisma.turno.count(),
      prisma.department.count(),
      prisma.user.count(),
      prisma.room.count(),
      prisma.amenity.count(),
      prisma.guest.count(),
      prisma.booking.count(),
      prisma.bookingRoom.count(),
      prisma.payment.count(),
      prisma.bookingMovement.count(),
      prisma.bookingEvent.count(),
      prisma.attendance.count(),
      prisma.schedule.count(),
    ]);

    const [
      turnosCount,
      departmentsCount,
      usersCount,
      roomsCount,
      amenitiesCount,
      guestsCount,
      bookingsCount,
      bookingRoomsCount,
      paymentsCount,
      movementsCount,
      eventsCount,
      attendanceCount,
      schedulesCount,
    ] = counts;

    // Mostrar resumen por categorías
    console.log("🏢 ESTRUCTURA ORGANIZACIONAL");
    console.log(`   Turnos de trabajo: ${turnosCount}`);
    console.log(`   Departamentos: ${departmentsCount}`);
    console.log(`   Usuarios del sistema: ${usersCount}`);
    console.log();

    console.log("🏨 INFRAESTRUCTURA HOTELERA");
    console.log(`   Habitaciones: ${roomsCount}`);
    console.log(`   Amenidades disponibles: ${amenitiesCount}`);
    console.log();

    console.log("👥 OPERACIONES DE HUÉSPEDES");
    console.log(`   Huéspedes registrados: ${guestsCount}`);
    console.log(`   Reservas totales: ${bookingsCount}`);
    console.log(`   Asignaciones habitación-reserva: ${bookingRoomsCount}`);
    console.log(`   Eventos de reserva: ${eventsCount}`);
    console.log();

    console.log("💰 SISTEMA FINANCIERO");
    console.log(`   Pagos registrados: ${paymentsCount}`);
    console.log(`   Movimientos financieros: ${movementsCount}`);
    console.log();

    console.log("👷 GESTIÓN DE PERSONAL");
    console.log(`   Registros de asistencia: ${attendanceCount}`);
    console.log(`   Horarios configurados: ${schedulesCount}`);
    console.log();

    // Información detallada si hay datos
    if (usersCount > 0) {
      console.log("👤 USUARIOS POR ROL:");
      const usersByRole = await prisma.user.groupBy({
        by: ['role'],
        _count: { id: true },
      });
      
      usersByRole.forEach(role => {
        console.log(`   ${role.role}: ${role._count.id}`);
      });
      console.log();
    }

    if (roomsCount > 0) {
      console.log("🏠 HABITACIONES POR TIPO:");
      const roomsByType = await prisma.room.groupBy({
        by: ['type'],
        _count: { id: true },
      });
      
      roomsByType.forEach(type => {
        console.log(`   ${type.type}: ${type._count.id}`);
      });
      console.log();
    }

    if (bookingsCount > 0) {
      console.log("📅 RESERVAS POR ESTADO:");
      const bookingsByStatus = await prisma.booking.groupBy({
        by: ['status'],
        _count: { id: true },
      });
      
      bookingsByStatus.forEach(status => {
        console.log(`   ${status.status}: ${status._count.id}`);
      });
      console.log();
    }

    if (paymentsCount > 0) {
      console.log("💳 RESUMEN FINANCIERO:");
      
      // Total de pagos por moneda
      const paymentsByCurrency = await prisma.payment.groupBy({
        by: ['currency'],
        _sum: { amount: true },
        _count: { id: true },
      });
      
      paymentsByCurrency.forEach(currency => {
        const total = currency._sum.amount || 0;
        console.log(`   ${currency.currency}: $${Number(total).toLocaleString()} (${currency._count.id} pagos)`);
      });
      
      // Total de movimientos por tipo
      console.log("\n   MOVIMIENTOS POR TIPO:");
      const movementsByType = await prisma.bookingMovement.groupBy({
        by: ['type'],
        _sum: { total: true },
        _count: { id: true },
      });
      
      movementsByType.forEach(movement => {
        const total = movement._sum.total || 0;
        console.log(`   ${movement.type}: $${Number(total).toLocaleString()} (${movement._count.id} movimientos)`);
      });
      console.log();
    }

    // Estado de readiness para reportes
    console.log("📈 ESTADO DEL SISTEMA DE REPORTES:");
    const hasFinancialData = paymentsCount > 0 && movementsCount > 0;
    const hasOperationalData = bookingsCount > 0 && guestsCount > 0;
    const hasHRData = attendanceCount > 0 && schedulesCount > 0;
    
    console.log(`   Datos financieros: ${hasFinancialData ? '✅ Listos' : '❌ Faltan datos'}`);
    console.log(`   Datos operacionales: ${hasOperationalData ? '✅ Listos' : '❌ Faltan datos'}`);
    console.log(`   Datos de RRHH: ${hasHRData ? '✅ Listos' : '❌ Faltan datos'}`);
    
    const isReady = hasFinancialData && hasOperationalData && hasHRData;
    console.log(`\n🎯 Sistema de reportes: ${isReady ? '✅ COMPLETAMENTE FUNCIONAL' : '⚠️  REQUIERE SEEDING COMPLETO'}`);
    
    if (!isReady) {
      console.log("\n💡 Para habilitar todos los reportes, ejecute:");
      console.log("   npm run db:seed:all");
    }

  } catch (error) {
    console.error("❌ Error al consultar la base de datos:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  showDatabaseInfo();
}

export { showDatabaseInfo };
