/*
  Warnings:

  - You are about to drop the column `pricePerNight` on the `Room` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "RateType" AS ENUM ('BASE', 'SEASONAL', 'WEEKEND', 'SPECIAL');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- CreateEnum
CREATE TYPE "DiscountReason" AS ENUM ('CORPORATE', 'LOYALTY', 'FRIEND', 'PROMOTIONAL', 'OTHER');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "baseAmount" DECIMAL(10,2),
ADD COLUMN     "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "serviceFeeAmount" DECIMAL(10,2),
ADD COLUMN     "subtotal" DECIMAL(10,2),
ADD COLUMN     "taxAmount" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "pricePerNight";

-- CreateTable
CREATE TABLE "Discount" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "DiscountType" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "minAmount" DECIMAL(10,2),
    "maxAmount" DECIMAL(10,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "allowedRoles" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "Discount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomRate" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" "RateType" NOT NULL,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "taxRate" DECIMAL(5,4) NOT NULL DEFAULT 0.16,
    "serviceFeeRate" DECIMAL(5,4) NOT NULL DEFAULT 0.03,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "taxAmount" DECIMAL(10,2) NOT NULL,
    "serviceFeeAmount" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "validDays" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "minNights" INTEGER,
    "maxNights" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "RoomRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingDiscount" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "discountId" INTEGER NOT NULL,
    "appliedBy" TEXT NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "discountAmount" DECIMAL(10,2) NOT NULL,
    "discountType" "DiscountType" NOT NULL,
    "discountValue" DECIMAL(10,2) NOT NULL,
    "reason" "DiscountReason" NOT NULL,
    "notes" TEXT,

    CONSTRAINT "BookingDiscount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoomRate_roomId_isActive_idx" ON "RoomRate"("roomId", "isActive");

-- CreateIndex
CREATE INDEX "RoomRate_roomId_isDefault_idx" ON "RoomRate"("roomId", "isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "RoomRate_roomId_name_key" ON "RoomRate"("roomId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "BookingDiscount_bookingId_discountId_key" ON "BookingDiscount"("bookingId", "discountId");

-- AddForeignKey
ALTER TABLE "RoomRate" ADD CONSTRAINT "RoomRate_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingDiscount" ADD CONSTRAINT "BookingDiscount_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingDiscount" ADD CONSTRAINT "BookingDiscount_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
