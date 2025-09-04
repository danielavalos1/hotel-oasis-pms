-- Migración para soporte completo del sistema de reportes
-- Archivo: prisma/migrations/add-reports-support.sql

-- Agregar campos faltantes a la tabla Payment para reportes completos
ALTER TABLE "Payment" 
ADD COLUMN IF NOT EXISTS "currency" TEXT DEFAULT 'MXN',
ADD COLUMN IF NOT EXISTS "paymentType" TEXT DEFAULT 'CASH',
ADD COLUMN IF NOT EXISTS "turnoId" INTEGER,
ADD COLUMN IF NOT EXISTS "processedById" INTEGER,
ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- Agregar campos faltantes a la tabla BookingMovement para mejor tracking
ALTER TABLE "BookingMovement" 
ADD COLUMN IF NOT EXISTS "currency" TEXT DEFAULT 'MXN',
ADD COLUMN IF NOT EXISTS "paymentType" TEXT DEFAULT 'CASH',
ADD COLUMN IF NOT EXISTS "turnoId" INTEGER,
ADD COLUMN IF NOT EXISTS "processedById" INTEGER;

-- Crear tabla para tipos de pago si no existe
CREATE TABLE IF NOT EXISTS "PaymentType" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentType_pkey" PRIMARY KEY ("id")
);

-- Crear tabla para monedas si no existe
CREATE TABLE IF NOT EXISTS "Currency" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "exchangeRate" DECIMAL(10,4) DEFAULT 1.0000,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("id")
);

-- Crear índices únicos
CREATE UNIQUE INDEX IF NOT EXISTS "PaymentType_code_key" ON "PaymentType"("code");
CREATE UNIQUE INDEX IF NOT EXISTS "Currency_code_key" ON "Currency"("code");

-- Agregar foreign keys
ALTER TABLE "Payment" 
ADD CONSTRAINT IF NOT EXISTS "Payment_turnoId_fkey" 
FOREIGN KEY ("turnoId") REFERENCES "Turno"("numero") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Payment" 
ADD CONSTRAINT IF NOT EXISTS "Payment_processedById_fkey" 
FOREIGN KEY ("processedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "BookingMovement" 
ADD CONSTRAINT IF NOT EXISTS "BookingMovement_turnoId_fkey" 
FOREIGN KEY ("turnoId") REFERENCES "Turno"("numero") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "BookingMovement" 
ADD CONSTRAINT IF NOT EXISTS "BookingMovement_processedById_fkey" 
FOREIGN KEY ("processedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Insertar datos iniciales para tipos de pago
INSERT INTO "PaymentType" ("code", "name", "description") VALUES
('CASH', 'Efectivo', 'Pago en efectivo'),
('CARD', 'Tarjeta', 'Pago con tarjeta de crédito o débito'),
('TRANSFER', 'Transferencia', 'Transferencia bancaria'),
('CHECK', 'Cheque', 'Pago con cheque'),
('DEPOSIT', 'Depósito', 'Depósito bancario'),
('OTHER', 'Otro', 'Otro método de pago')
ON CONFLICT ("code") DO NOTHING;

-- Insertar datos iniciales para monedas
INSERT INTO "Currency" ("code", "name", "symbol", "exchangeRate") VALUES
('MXN', 'Peso Mexicano', '$', 1.0000),
('USD', 'Dólar Americano', '$', 18.5000),
('EUR', 'Euro', '€', 20.2000),
('CAD', 'Dólar Canadiense', '$', 13.8000)
ON CONFLICT ("code") DO NOTHING;

-- Crear índices para optimizar consultas de reportes
CREATE INDEX IF NOT EXISTS "Payment_turnoId_createdAt_idx" ON "Payment"("turnoId", "createdAt");
CREATE INDEX IF NOT EXISTS "Payment_currency_paymentType_idx" ON "Payment"("currency", "paymentType");
CREATE INDEX IF NOT EXISTS "Payment_processedById_createdAt_idx" ON "Payment"("processedById", "createdAt");

CREATE INDEX IF NOT EXISTS "BookingMovement_turnoId_createdAt_idx" ON "BookingMovement"("turnoId", "createdAt");
CREATE INDEX IF NOT EXISTS "BookingMovement_currency_paymentType_idx" ON "BookingMovement"("currency", "paymentType");
CREATE INDEX IF NOT EXISTS "BookingMovement_processedById_createdAt_idx" ON "BookingMovement"("processedById", "createdAt");

-- Crear vista para reportes consolidados
CREATE OR REPLACE VIEW "ConsolidatedMovements" AS
SELECT 
    'PAYMENT' as movementType,
    p."id",
    p."bookingId",
    p."amount",
    p."currency",
    p."paymentType",
    p."turnoId",
    p."processedById",
    p."createdAt",
    p."description",
    b."guestId",
    b."roomId",
    b."checkIn",
    b."checkOut",
    u."name" as processedByName,
    t."nombre" as turnoName,
    g."firstName" || ' ' || g."lastName" as guestName
FROM "Payment" p
LEFT JOIN "Booking" b ON p."bookingId" = b."id"
LEFT JOIN "User" u ON p."processedById" = u."id"
LEFT JOIN "Turno" t ON p."turnoId" = t."numero"
LEFT JOIN "Guest" g ON b."guestId" = g."id"

UNION ALL

SELECT 
    'BOOKING_MOVEMENT' as movementType,
    bm."id",
    bm."bookingId",
    bm."amount",
    bm."currency",
    bm."paymentType",
    bm."turnoId",
    bm."processedById",
    bm."createdAt",
    bm."description",
    b."guestId",
    b."roomId",
    b."checkIn",
    b."checkOut",
    u."name" as processedByName,
    t."nombre" as turnoName,
    g."firstName" || ' ' || g."lastName" as guestName
FROM "BookingMovement" bm
LEFT JOIN "Booking" b ON bm."bookingId" = b."id"
LEFT JOIN "User" u ON bm."processedById" = u."id"
LEFT JOIN "Turno" t ON bm."turnoId" = t."numero"
LEFT JOIN "Guest" g ON b."guestId" = g."id";

-- Comentarios sobre la migración
COMMENT ON VIEW "ConsolidatedMovements" IS 'Vista consolidada de todos los movimientos financieros para reportes';
COMMENT ON COLUMN "Payment"."currency" IS 'Código de moneda (MXN, USD, EUR, etc.)';
COMMENT ON COLUMN "Payment"."paymentType" IS 'Tipo de pago (CASH, CARD, TRANSFER, etc.)';
COMMENT ON COLUMN "Payment"."turnoId" IS 'Referencia al turno en que se procesó el pago';
COMMENT ON COLUMN "Payment"."processedById" IS 'Usuario que procesó el pago';
