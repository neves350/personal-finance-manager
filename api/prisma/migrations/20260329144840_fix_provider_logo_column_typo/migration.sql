/*
  Warnings:

  - You are about to drop the column `providder_logo_url` on the `open_banking_connections` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "open_banking_connections" DROP COLUMN "providder_logo_url",
ADD COLUMN     "provider_logo_url" TEXT;
