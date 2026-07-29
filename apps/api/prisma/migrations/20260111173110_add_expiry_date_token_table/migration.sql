/*
  Warnings:

  - Added the required column `expiryDate` to the `token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `token` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "token" ADD COLUMN     "expiryDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
