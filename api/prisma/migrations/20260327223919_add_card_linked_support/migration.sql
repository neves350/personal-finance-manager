-- AlterTable
ALTER TABLE "bank_accounts" ADD COLUMN     "is_card_account" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "cards" ADD COLUMN     "is_linked" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "cvc" DROP NOT NULL,
ALTER COLUMN "expiration_date" DROP NOT NULL;
