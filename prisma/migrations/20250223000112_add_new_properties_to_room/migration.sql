/*
  Warnings:

  - You are about to drop the column `roomType` on the `Room` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Room" DROP COLUMN "roomType",
ADD COLUMN     "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "capacity" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "type" "RoomType" NOT NULL DEFAULT 'SENCILLA';
