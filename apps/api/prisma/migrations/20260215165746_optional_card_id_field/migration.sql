/*
  Warnings:

  - Made the column `bank_account_id` on table `transactions` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "transactions" ALTER COLUMN "card_id" DROP NOT NULL,
ALTER COLUMN "bank_account_id" SET NOT NULL;
