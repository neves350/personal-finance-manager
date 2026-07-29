/*
  Warnings:

  - You are about to drop the column `wallet_id` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the `wallets` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `card_id` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CardColor" AS ENUM ('GRAY', 'RED', 'GREEN', 'BLUE', 'PURPLE', 'ORANGE', 'YELLOW', 'PINK');

-- CreateEnum
CREATE TYPE "CardType" AS ENUM ('CREDIT_CARD', 'DEBIT_CARD');

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_wallet_id_fkey";

-- DropForeignKey
ALTER TABLE "wallets" DROP CONSTRAINT "wallets_user_id_fkey";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "wallet_id",
ADD COLUMN     "card_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "wallets";

-- DropEnum
DROP TYPE "Currency";

-- DropEnum
DROP TYPE "WalletColor";

-- DropEnum
DROP TYPE "WalletType";

-- CreateTable
CREATE TABLE "cards" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" "CardColor" NOT NULL DEFAULT 'GRAY',
    "type" "CardType" NOT NULL,
    "last_four" VARCHAR(4),
    "credit_limit" DECIMAL(65,30),
    "closing_day" INTEGER,
    "due_day" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
