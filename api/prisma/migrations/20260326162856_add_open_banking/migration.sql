/*
  Warnings:

  - A unique constraint covering the columns `[external_id]` on the table `transactions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ConnectionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "TransactionSource" AS ENUM ('MANUAL', 'OPEN_BANKING');

-- AlterTable
ALTER TABLE "bank_accounts" ADD COLUMN     "bank_logo" TEXT,
ADD COLUMN     "is_linked" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "external_id" TEXT,
ADD COLUMN     "source" "TransactionSource" NOT NULL DEFAULT 'MANUAL';

-- CreateTable
CREATE TABLE "open_banking_customers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "salt_edge_customer_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "open_banking_customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "open_banking_connections" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "salt_edge_connection_id" TEXT NOT NULL,
    "provider_code" TEXT NOT NULL,
    "provider_name" TEXT NOT NULL,
    "status" "ConnectionStatus" NOT NULL DEFAULT 'ACTIVE',
    "consent_expires_at" TIMESTAMP(3),
    "last_sync_at" TIMESTAMP(3),
    "next_refresh_possible_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "open_banking_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "open_banking_accounts" (
    "id" TEXT NOT NULL,
    "connection_id" TEXT NOT NULL,
    "bank_account_id" TEXT NOT NULL,
    "salt_edge_account_id" TEXT NOT NULL,
    "iban" TEXT,
    "currency_code" TEXT NOT NULL DEFAULT 'EUR',
    "nature" TEXT NOT NULL,
    "last_sync_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "open_banking_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "open_banking_customers_user_id_key" ON "open_banking_customers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "open_banking_customers_salt_edge_customer_id_key" ON "open_banking_customers"("salt_edge_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "open_banking_connections_salt_edge_connection_id_key" ON "open_banking_connections"("salt_edge_connection_id");

-- CreateIndex
CREATE UNIQUE INDEX "open_banking_accounts_bank_account_id_key" ON "open_banking_accounts"("bank_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "open_banking_accounts_salt_edge_account_id_key" ON "open_banking_accounts"("salt_edge_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_external_id_key" ON "transactions"("external_id");

-- AddForeignKey
ALTER TABLE "open_banking_customers" ADD CONSTRAINT "open_banking_customers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "open_banking_connections" ADD CONSTRAINT "open_banking_connections_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "open_banking_customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "open_banking_accounts" ADD CONSTRAINT "open_banking_accounts_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "open_banking_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "open_banking_accounts" ADD CONSTRAINT "open_banking_accounts_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
