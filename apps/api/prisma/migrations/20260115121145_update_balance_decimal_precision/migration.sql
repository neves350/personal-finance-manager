/*
  Warnings:

  - You are about to alter the column `balance` on the `wallets` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.

*/
-- AlterTable
ALTER TABLE "wallets" ALTER COLUMN "currency" DROP DEFAULT,
ALTER COLUMN "balance" SET DATA TYPE DECIMAL(12,2);
