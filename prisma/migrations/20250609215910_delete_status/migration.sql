/*
  Warnings:

  - The values [SUCIA_RESERVADA,SUCIA_OCUPADA,SUCIA_BLOQUEADA,INSPECCION] on the enum `RoomStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RoomStatus_new" AS ENUM ('LIBRE', 'RESERVADA', 'SUCIA', 'BLOQUEADA', 'OCUPADA', 'EN_MANTENIMIENTO', 'LIMPIEZA');
ALTER TABLE "Room" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Room" ALTER COLUMN "status" TYPE "RoomStatus_new" USING ("status"::text::"RoomStatus_new");
ALTER TYPE "RoomStatus" RENAME TO "RoomStatus_old";
ALTER TYPE "RoomStatus_new" RENAME TO "RoomStatus";
DROP TYPE "RoomStatus_old";
ALTER TABLE "Room" ALTER COLUMN "status" SET DEFAULT 'LIBRE';
COMMIT;
