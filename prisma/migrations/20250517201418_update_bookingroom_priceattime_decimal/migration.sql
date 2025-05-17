/*
  Warnings:

  - You are about to alter the column `priceAtTime` on the `BookingRoom` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "BookingRoom" ALTER COLUMN "priceAtTime" SET DATA TYPE DECIMAL(10,2);
