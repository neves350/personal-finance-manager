/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `tokens` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `tokens` table without a default value. This is not possible if the table is not empty.

*/
DELETE FROM "tokens";

-- AlterTable
ALTER TABLE "tokens" ADD COLUMN "code" VARCHAR(5) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "tokens_code_key" ON "tokens"("code");
