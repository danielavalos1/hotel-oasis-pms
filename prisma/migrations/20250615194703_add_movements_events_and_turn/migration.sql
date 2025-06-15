-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('PAYMENT', 'EXTENSION', 'CANCELLATION', 'EXTRA_CHARGE', 'REFUND', 'OTHER');

-- CreateEnum
CREATE TYPE "BookingEventType" AS ENUM ('CHECKIN', 'CHECKOUT', 'EXTENSION', 'NO_SHOW', 'EARLY_CHECKOUT', 'OTHER');

-- CreateTable
CREATE TABLE "BookingMovement" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "roomId" INTEGER,
    "type" "MovementType" NOT NULL,
    "amount" DECIMAL(10,2),
    "subtotal" DECIMAL(10,2),
    "iva" DECIMAL(10,2),
    "tax3" DECIMAL(10,2),
    "total" DECIMAL(10,2),
    "reference" TEXT,
    "concept" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "turnoId" INTEGER,
    "userId" INTEGER,

    CONSTRAINT "BookingMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingEvent" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "eventType" "BookingEventType" NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,
    "notes" TEXT,

    CONSTRAINT "BookingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Turno" (
    "id" SERIAL NOT NULL,
    "numero" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fin" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Turno_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BookingMovement" ADD CONSTRAINT "BookingMovement_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingMovement" ADD CONSTRAINT "BookingMovement_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingMovement" ADD CONSTRAINT "BookingMovement_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "Turno"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingMovement" ADD CONSTRAINT "BookingMovement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingEvent" ADD CONSTRAINT "BookingEvent_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingEvent" ADD CONSTRAINT "BookingEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
