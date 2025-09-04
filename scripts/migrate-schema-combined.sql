-- Migración para aplicar los cambios del schema combinado
-- Ejecutar este script después de actualizar el schema.prisma

BEGIN;

-- 1. Crear los nuevos enums
DO $$ BEGIN
    CREATE TYPE "PaymentType" AS ENUM ('CASH', 'CARD', 'TRANSFER', 'CHECK', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "Currency" AS ENUM ('MXN', 'USD', 'EUR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Agregar nuevos valores al enum MovementType existente
ALTER TYPE "MovementType" ADD VALUE IF NOT EXISTS 'LODGING_PAYMENT';
ALTER TYPE "MovementType" ADD VALUE IF NOT EXISTS 'CASH_PAYMENT';
ALTER TYPE "MovementType" ADD VALUE IF NOT EXISTS 'CARD_PAYMENT';
ALTER TYPE "MovementType" ADD VALUE IF NOT EXISTS 'SERVICE_CHARGE';
ALTER TYPE "MovementType" ADD VALUE IF NOT EXISTS 'DISCOUNT';

-- 3. Agregar nuevos campos al modelo Payment
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "turnoId" INTEGER;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "userId" INTEGER;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "currency" "Currency" DEFAULT 'MXN';
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "paymentType" "PaymentType" DEFAULT 'CASH';
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "reference" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- 4. Agregar nuevos campos al modelo BookingMovement
ALTER TABLE "BookingMovement" ADD COLUMN IF NOT EXISTS "currency" "Currency" DEFAULT 'MXN';
ALTER TABLE "BookingMovement" ADD COLUMN IF NOT EXISTS "paymentType" "PaymentType";

-- 5. Actualizar el modelo Turno (cambiar id a numero como PK)
-- Primero, crear la nueva tabla Turno
CREATE TABLE IF NOT EXISTS "Turno_new" (
    "numero" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fin" TIMESTAMP(3) NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "Turno_new_pkey" PRIMARY KEY ("numero")
);

-- Migrar datos existentes si hay
INSERT INTO "Turno_new" ("numero", "nombre", "inicio", "fin", "descripcion", "activo")
SELECT 
    CASE 
        WHEN "numero" = 1 THEN 1
        WHEN "numero" = 2 THEN 2
        WHEN "numero" = 3 THEN 3
        ELSE "numero"
    END as numero,
    "nombre",
    "inicio",
    "fin",
    '' as descripcion,
    true as activo
FROM "Turno"
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Turno')
ON CONFLICT ("numero") DO NOTHING;

-- Eliminar tabla vieja y renombrar la nueva
DROP TABLE IF EXISTS "Turno";
ALTER TABLE "Turno_new" RENAME TO "Turno";

-- 6. Agregar foreign keys
ALTER TABLE "Payment" ADD CONSTRAINT IF NOT EXISTS "Payment_turnoId_fkey" 
    FOREIGN KEY ("turnoId") REFERENCES "Turno"("numero") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Payment" ADD CONSTRAINT IF NOT EXISTS "Payment_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "BookingMovement" ADD CONSTRAINT IF NOT EXISTS "BookingMovement_turnoId_fkey" 
    FOREIGN KEY ("turnoId") REFERENCES "Turno"("numero") ON DELETE SET NULL ON UPDATE CASCADE;

-- 7. Crear trigger para updatedAt en Payment
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_payment_updated_at ON "Payment";
CREATE TRIGGER update_payment_updated_at
    BEFORE UPDATE ON "Payment"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_turno_updated_at ON "Turno";
CREATE TRIGGER update_turno_updated_at
    BEFORE UPDATE ON "Turno"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Insertar datos iniciales para turnos si no existen
INSERT INTO "Turno" ("numero", "nombre", "inicio", "fin", "descripcion")
VALUES 
    (1, 'Turno Matutino', '2024-01-01 06:00:00', '2024-01-01 14:00:00', 'Turno de la mañana'),
    (2, 'Turno Vespertino', '2024-01-01 14:00:00', '2024-01-01 22:00:00', 'Turno de la tarde'),
    (3, 'Turno Nocturno', '2024-01-01 22:00:00', '2024-01-02 06:00:00', 'Turno de la noche')
ON CONFLICT ("numero") DO NOTHING;

-- 9. Crear índices para optimizar consultas de reportes
CREATE INDEX IF NOT EXISTS "Payment_turnoId_createdAt_idx" ON "Payment"("turnoId", "createdAt");
CREATE INDEX IF NOT EXISTS "Payment_currency_paymentType_idx" ON "Payment"("currency", "paymentType");
CREATE INDEX IF NOT EXISTS "Payment_userId_createdAt_idx" ON "Payment"("userId", "createdAt");

CREATE INDEX IF NOT EXISTS "BookingMovement_turnoId_createdAt_idx" ON "BookingMovement"("turnoId", "createdAt");
CREATE INDEX IF NOT EXISTS "BookingMovement_currency_paymentType_idx" ON "BookingMovement"("currency", "paymentType");
CREATE INDEX IF NOT EXISTS "BookingMovement_userId_createdAt_idx" ON "BookingMovement"("userId", "createdAt");

COMMIT;

-- Comentarios sobre la migración
COMMENT ON COLUMN "Payment"."currency" IS 'Moneda con la que se realizó el pago (MXN, USD, EUR)';
COMMENT ON COLUMN "Payment"."paymentType" IS 'Tipo de pago (CASH, CARD, TRANSFER, CHECK, OTHER)';
COMMENT ON COLUMN "Payment"."turnoId" IS 'Turno en el que se registró el pago';
COMMENT ON COLUMN "Payment"."userId" IS 'Usuario que registró el pago';

COMMENT ON COLUMN "BookingMovement"."currency" IS 'Moneda del movimiento financiero';
COMMENT ON COLUMN "BookingMovement"."paymentType" IS 'Tipo de pago del movimiento cuando aplique';
COMMENT ON COLUMN "BookingMovement"."turnoId" IS 'Turno en el que se registró el movimiento';
COMMENT ON COLUMN "BookingMovement"."userId" IS 'Usuario que registró el movimiento (usuario logueado)';

COMMENT ON TABLE "Turno" IS 'Turnos de trabajo para seguimiento de reportes financieros';
