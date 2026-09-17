-- CreateEnum
CREATE TYPE "RsvpStatus" AS ENUM ('PENDING', 'CONFIRMED', 'DECLINED');

-- AlterTable
ALTER TABLE "Guest" ADD COLUMN     "rsvpStatus" "RsvpStatus" NOT NULL DEFAULT 'PENDING';
