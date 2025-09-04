/*
  Warnings:

  - The primary key for the `Turno` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Turno` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Turno` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('CASH', 'CARD', 'TRANSFER', 'CHECK', 'OTHER');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('MXN', 'USD', 'EUR');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MovementType" ADD VALUE 'LODGING_PAYMENT';
ALTER TYPE "MovementType" ADD VALUE 'CASH_PAYMENT';
ALTER TYPE "MovementType" ADD VALUE 'CARD_PAYMENT';
ALTER TYPE "MovementType" ADD VALUE 'SERVICE_CHARGE';
ALTER TYPE "MovementType" ADD VALUE 'DISCOUNT';

-- DropForeignKey
ALTER TABLE "BookingMovement" DROP CONSTRAINT "BookingMovement_turnoId_fkey";

-- AlterTable
ALTER TABLE "BookingMovement" ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'MXN',
ADD COLUMN     "paymentType" "PaymentType";

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'MXN',
ADD COLUMN     "description" TEXT,
ADD COLUMN     "paymentType" "PaymentType" NOT NULL DEFAULT 'CASH',
ADD COLUMN     "reference" TEXT,
ADD COLUMN     "turnoId" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "Turno" DROP CONSTRAINT "Turno_pkey",
DROP COLUMN "id",
ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "descripcion" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "Turno_pkey" PRIMARY KEY ("numero");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "Turno"("numero") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingMovement" ADD CONSTRAINT "BookingMovement_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "Turno"("numero") ON DELETE SET NULL ON UPDATE CASCADE;
