-- Propuesta de migración para mejorar el sistema de reportes financieros
-- Archivo: enhance_financial_reporting.sql

-- 1. Agregar campos faltantes al modelo Payment para mejor tracking
ALTER TABLE "Payment" ADD COLUMN "turnoId" INTEGER;
ALTER TABLE "Payment" ADD COLUMN "userId" INTEGER;
ALTER TABLE "Payment" ADD COLUMN "currency" VARCHAR(3) DEFAULT 'MXN';
ALTER TABLE "Payment" ADD COLUMN "paymentType" VARCHAR(20);
ALTER TABLE "Payment" ADD COLUMN "cashAmount" DECIMAL(10,2);
ALTER TABLE "Payment" ADD COLUMN "cardAmount" DECIMAL(10,2);

-- 2. Crear enum para tipos de pago más específicos
CREATE TYPE "PaymentType" AS ENUM ('CASH', 'CARD', 'TRANSFER', 'CHECK', 'OTHER');

-- 3. Crear enum para monedas
CREATE TYPE "Currency" AS ENUM ('MXN', 'USD', 'EUR');

-- 4. Actualizar el campo paymentType para usar el enum
ALTER TABLE "Payment" ALTER COLUMN "paymentType" TYPE "PaymentType" USING "paymentType"::"PaymentType";

-- 5. Agregar campos de auditoría
ALTER TABLE "Payment" ADD COLUMN "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Payment" ADD COLUMN "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- 6. Crear foreign keys
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "Turno"("id");
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id");

-- 7. Expandir el enum MovementType para más granularidad
ALTER TYPE "MovementType" ADD VALUE 'LODGING_PAYMENT';
ALTER TYPE "MovementType" ADD VALUE 'CASH_PAYMENT';
ALTER TYPE "MovementType" ADD VALUE 'CARD_PAYMENT';
ALTER TYPE "MovementType" ADD VALUE 'SERVICE_CHARGE';
ALTER TYPE "MovementType" ADD VALUE 'DISCOUNT';

-- 8. Crear vista para reportes de conceptos por turno
CREATE OR REPLACE VIEW "TurnReportView" AS
SELECT 
  bm.id,
  bm.type as movement_type,
  bm.amount,
  bm.total,
  bm.concept,
  bm.reference,
  bm.createdAt,
  t.numero as turno_numero,
  t.nombre as turno_nombre,
  u.name as usuario_name,
  u.lastName as usuario_lastname,
  b.id as booking_id,
  g.firstName as guest_firstName,
  g.lastName as guest_lastName,
  'MXN' as currency -- Por defecto, se puede agregar campo currency a BookingMovement
FROM "BookingMovement" bm
LEFT JOIN "Turno" t ON bm."turnoId" = t.id
LEFT JOIN "User" u ON bm."userId" = u.id
LEFT JOIN "Booking" b ON bm."bookingId" = b.id
LEFT JOIN "Guest" g ON b."guestId" = g.id

UNION ALL

SELECT 
  p.id + 100000 as id, -- Offset para evitar conflictos de ID
  CASE 
    WHEN p."paymentType" = 'CASH' THEN 'CASH_PAYMENT'::MovementType
    WHEN p."paymentType" = 'CARD' THEN 'CARD_PAYMENT'::MovementType
    ELSE 'PAYMENT'::MovementType
  END as movement_type,
  p.amount,
  p.amount as total,
  CONCAT('Pago ', p."paymentMethod") as concept,
  CAST(p.id as TEXT) as reference,
  COALESCE(p."createdAt", p."paymentDate"::timestamp) as createdAt,
  t.numero as turno_numero,
  t.nombre as turno_nombre,
  u.name as usuario_name,
  u.lastName as usuario_lastname,
  b.id as booking_id,
  g.firstName as guest_firstName,
  g.lastName as guest_lastName,
  COALESCE(p.currency, 'MXN') as currency
FROM "Payment" p
LEFT JOIN "Turno" t ON p."turnoId" = t.id
LEFT JOIN "User" u ON p."userId" = u.id
LEFT JOIN "Booking" b ON p."bookingId" = b.id
LEFT JOIN "Guest" g ON b."guestId" = g.id;

-- 9. Crear índices para optimizar consultas de reportes
CREATE INDEX "idx_booking_movement_turno_date" ON "BookingMovement"("turnoId", "createdAt");
CREATE INDEX "idx_payment_turno_date" ON "Payment"("turnoId", "paymentDate");
CREATE INDEX "idx_turno_date_range" ON "BookingMovement"("createdAt");
