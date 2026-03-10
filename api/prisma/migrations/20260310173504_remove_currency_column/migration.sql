/*
  Warnings:

  - You are about to drop the column `currency` on the `bank_accounts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "bank_accounts" DROP COLUMN "currency";

-- DropEnum
DROP TYPE "BankCurrency";
