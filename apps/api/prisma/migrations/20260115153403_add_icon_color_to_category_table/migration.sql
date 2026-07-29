/*
  Warnings:

  - You are about to drop the column `isDefault` on the `categories` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "categories" DROP COLUMN "isDefault",
ADD COLUMN     "icon_color" TEXT NOT NULL DEFAULT '#1e40af',
ADD COLUMN     "is_default" BOOLEAN NOT NULL DEFAULT false;
