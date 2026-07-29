-- AlterTable: Add columns as nullable first
ALTER TABLE "cards" ADD COLUMN "cvc" VARCHAR(4);
ALTER TABLE "cards" ADD COLUMN "expiration_date" VARCHAR(5);

-- Backfill existing rows with placeholder values
UPDATE "cards" SET "cvc" = '000', "expiration_date" = '00/00' WHERE "cvc" IS NULL;

-- Make columns required
ALTER TABLE "cards" ALTER COLUMN "cvc" SET NOT NULL;
ALTER TABLE "cards" ALTER COLUMN "expiration_date" SET NOT NULL;
