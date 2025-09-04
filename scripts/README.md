# Scripts de Seeding - Hotel Oasis PMS

Este directorio contiene los scripts necesarios para poblar la base de datos del Hotel Oasis PMS con datos de prueba y desarrollo.

## Scripts Disponibles

### 📁 `seedDatabase.ts`
**Propósito**: Script básico que crea la estructura fundamental del sistema.

**Datos creados**:
- ✅ **Turnos de trabajo**: 3 turnos (Matutino, Vespertino, Nocturno)
- ✅ **Departamentos**: Recepción, Limpieza, Administración, Mantenimiento
- ✅ **Usuarios del sistema**: 4 usuarios con diferentes roles
  - Administrator (SUPERADMIN)
  - John Doe (RECEPTIONIST)
  - Jane Smith (HOUSEKEEPER) 
  - Maria Garcia (RECEPTIONIST)
- ✅ **Habitaciones**: 23 habitaciones con diferentes tipos y amenidades
- ✅ **Amenidades**: Lista completa de servicios disponibles

**Ejecutar**:
```bash
npm run db:seed
# o
npx tsx scripts/seedDatabase.ts
```

### 📈 `seedReportsData.ts`
**Propósito**: Script especializado que crea datos financieros y operacionales para el sistema de reportes.

**Prerrequisitos**: Debe ejecutarse DESPUÉS de `seedDatabase.ts`

**Datos creados**:
- ✅ **Huéspedes**: 6 huéspedes de prueba con información completa
- ✅ **Reservas**: 6 reservas con diferentes estados y fechas
- ✅ **Pagos**: Pagos asociados a las reservas con diferentes métodos
- ✅ **Movimientos financieros**: Movimientos de caja con desglose de impuestos
- ✅ **Eventos de reserva**: Check-ins, check-outs y otros eventos
- ✅ **Registros de asistencia**: 30 días de asistencia para todos los empleados
- ✅ **Horarios de trabajo**: Horarios configurados para todos los empleados

**Características especiales**:
- Pagos en diferentes monedas (MXN, USD)
- Diferentes tipos de pago (efectivo, tarjeta, transferencia)
- Cálculo automático de impuestos (IVA 16%, ISH 3%)
- Registros distribuidos en diferentes turnos
- Auditoría completa (usuario y turno que registró cada transacción)

**Ejecutar**:
```bash
npm run db:seed:reports
# o
npx tsx scripts/seedReportsData.ts
```

### 🚀 `seedAll.ts`
**Propósito**: Script principal que ejecuta el proceso completo de seeding en secuencia.

**Funcionalidades**:
- Ejecuta automáticamente `seedDatabase.ts` y luego `seedReportsData.ts`
- Verificación de conexión a base de datos
- Manejo de errores integrado
- Resumen detallado del proceso
- Ayuda integrada (`--help`)

**Ejecutar**:
```bash
npm run db:seed:all
# o
npx tsx scripts/seedAll.ts
```

**Ver ayuda**:
```bash
npx tsx scripts/seedAll.ts --help
```

## Comandos NPM Disponibles

```bash
# Seeding completo (recomendado)
npm run db:seed:all

# Solo datos básicos
npm run db:seed

# Solo datos para reportes
npm run db:seed:reports

# Seeding automático con Prisma
npx prisma db seed
```

## Estructura de Datos para Reportes

### 💰 Sistema Financiero
Los scripts crean un sistema financiero completo con:

- **Turnos**: Cada transacción está asociada a un turno específico
- **Monedas**: Soporte para MXN, USD, EUR
- **Tipos de pago**: Efectivo, tarjeta, transferencia, cheque
- **Impuestos**: Cálculo automático de IVA (16%) e ISH (3%)
- **Auditoría**: Registro de usuario y turno para cada transacción

### 📊 Tipos de Movimientos
- `LODGING_PAYMENT`: Pagos por hospedaje
- `SERVICE_CHARGE`: Cargos por servicios adicionales
- `CASH_PAYMENT`: Pagos en efectivo
- `CARD_PAYMENT`: Pagos con tarjeta
- `DISCOUNT`: Descuentos aplicados
- `REFUND`: Reembolsos

### 🏨 Estados de Reservas
- `CONFIRMED`: Reserva confirmada
- `CHECKED_IN`: Huésped registrado
- `CHECKED_OUT`: Huésped dado de salida

### 👥 Sistema de Personal
- **Asistencia**: 30 días de registros con diferentes estados
- **Horarios**: Lunes a viernes, 8:00 AM - 5:00 PM
- **Departamentos**: Organización jerárquica del personal

## Requisitos

### Base de Datos
- PostgreSQL configurado y ejecutándose
- Variable de entorno `DATABASE_URL` configurada
- Migraciones de Prisma aplicadas (`npx prisma migrate dev`)

### Dependencias
- Node.js v18+
- Prisma Client v6.6.0+
- tsx para ejecución de TypeScript

## Uso Recomendado

### Para Desarrollo
```bash
# 1. Aplicar migraciones
npx prisma migrate dev

# 2. Ejecutar seeding completo
npm run db:seed:all
```

### Para Testing
```bash
# Solo datos básicos para tests unitarios
npm run db:seed

# Datos completos para tests de integración
npm run db:seed:all
```

### Para Demo/Presentación
```bash
# Datos completos con reportes funcionales
npm run db:seed:all
```

## Personalización

### Modificar Datos de Prueba
Para personalizar los datos de prueba, edita los arrays de datos en:
- `seedDatabase.ts`: usuarios, habitaciones, amenidades
- `seedReportsData.ts`: huéspedes, reservas, movimientos financieros

### Agregar Nuevos Datos
1. Identifica el script apropiado (`seedDatabase.ts` para estructura básica, `seedReportsData.ts` para datos operacionales)
2. Agrega los datos respetando las relaciones de clave foránea
3. Actualiza los logs de confirmación

### Configurar Fechas
Los scripts usan fechas relativas que se pueden ajustar modificando las constantes de fecha en cada archivo.

## Solución de Problemas

### Error: "Debe ejecutar primero el seedDatabase.ts"
- **Causa**: Intentar ejecutar `seedReportsData.ts` sin datos básicos
- **Solución**: Ejecutar `npm run db:seed:all` o primero `npm run db:seed`

### Error de conexión a base de datos
- **Causa**: Variable `DATABASE_URL` incorrecta o PostgreSQL no ejecutándose
- **Solución**: Verificar configuración de base de datos

### Error de tipos en cálculos decimales
- **Causa**: Prisma Decimal vs number en operaciones matemáticas
- **Solución**: Usar `Number()` para convertir Decimals antes de operaciones

## Notas Importantes

⚠️ **Advertencia**: Los scripts limpian completamente la base de datos antes de insertar datos nuevos. No ejecutar en producción.

✅ **Desarrollo**: Perfecto para entornos de desarrollo y testing.

🔄 **Idempotencia**: Los scripts pueden ejecutarse múltiples veces de manera segura.

📈 **Reportes**: Después del seeding completo, todos los tipos de reportes financieros estarán disponibles con datos realistas.
