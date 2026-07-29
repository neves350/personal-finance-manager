-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "transfers" ADD COLUMN     "executed_at" TIMESTAMP(3),
ADD COLUMN     "status" "TransferStatus" NOT NULL DEFAULT 'PENDING';
