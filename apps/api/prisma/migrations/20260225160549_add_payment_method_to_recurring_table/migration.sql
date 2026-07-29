/*
  Warnings:

  - Added the required column `payment_method` to the `recurrings` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('MONEY', 'CARD');

-- AlterTable
ALTER TABLE "recurrings" ADD COLUMN     "payment_method" "PaymentMethod" NOT NULL;
