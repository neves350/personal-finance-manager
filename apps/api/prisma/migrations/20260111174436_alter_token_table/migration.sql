/*
  Warnings:

  - You are about to drop the column `expiryDate` on the `token` table. All the data in the column will be lost.
  - Changed the type of `type` on the `token` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('PASSWORD_RECOVER');

-- AlterTable
ALTER TABLE "token" DROP COLUMN "expiryDate",
DROP COLUMN "type",
ADD COLUMN     "type" "TokenType" NOT NULL;
