/*
  Warnings:

  - Added the required column `type` to the `wallets` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "WalletType" AS ENUM ('CASH', 'BANK_ACCOUNT', 'CREDIT_CARD', 'DIGITAL_WALLET', 'INVESTMENT');

-- AlterTable
ALTER TABLE "wallets" ADD COLUMN     "type" "WalletType" NOT NULL;
