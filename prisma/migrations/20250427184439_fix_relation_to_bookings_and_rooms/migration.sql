/*
  Warnings:

  - You are about to drop the column `roomId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `roomType` on the `Room` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_roomId_fkey";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "roomId";

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "roomType",
ADD COLUMN     "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "capacity" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "type" "RoomType" NOT NULL DEFAULT 'SENCILLA';

-- CreateTable
CREATE TABLE "BookingRoom" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,
    "priceAtTime" INTEGER NOT NULL,

    CONSTRAINT "BookingRoom_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookingRoom_bookingId_roomId_key" ON "BookingRoom"("bookingId", "roomId");

-- AddForeignKey
ALTER TABLE "BookingRoom" ADD CONSTRAINT "BookingRoom_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingRoom" ADD CONSTRAINT "BookingRoom_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
