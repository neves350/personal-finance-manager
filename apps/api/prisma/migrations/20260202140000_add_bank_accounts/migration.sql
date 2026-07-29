-- CreateEnum
CREATE TYPE "BankType" AS ENUM ('WALLET', 'CHECKING', 'SAVINGS', 'INVESTMENT');

-- CreateEnum
CREATE TYPE "BankCurrency" AS ENUM ('EUR', 'USD');

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "BankType" NOT NULL DEFAULT 'CHECKING',
    "currency" "BankCurrency" NOT NULL DEFAULT 'EUR',
    "balance" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 1: Add bank_account_id as NULLABLE first
ALTER TABLE "cards" ADD COLUMN "bank_account_id" TEXT;

-- Step 2: Create a default BankAccount for each user that has cards
INSERT INTO "bank_accounts" ("id", "user_id", "name", "type", "currency", "balance", "created_at", "updated_at")
SELECT
    gen_random_uuid()::TEXT,
    c."user_id",
    'Conta Principal',
    'CHECKING',
    'EUR',
    0,
    NOW(),
    NOW()
FROM "cards" c
GROUP BY c."user_id";

-- Step 3: Link existing cards to their user's default bank account
UPDATE "cards" c
SET "bank_account_id" = ba."id"
FROM "bank_accounts" ba
WHERE c."user_id" = ba."user_id";

-- Step 4: Now make bank_account_id NOT NULL
ALTER TABLE "cards" ALTER COLUMN "bank_account_id" SET NOT NULL;

-- Step 5: Add foreign key constraint
ALTER TABLE "cards" ADD CONSTRAINT "cards_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 6: Add optional bank_account_id to transactions
ALTER TABLE "transactions" ADD COLUMN "bank_account_id" TEXT;

-- Step 7: Add foreign key for transactions
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
