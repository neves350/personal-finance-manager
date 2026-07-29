/*
  Warnings:

  - You are about to drop the column `icon_color` on the `categories` table. All the data in the column will be lost.
  - Made the column `user_id` on table `categories` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "categories" DROP COLUMN "icon_color",
ALTER COLUMN "user_id" SET NOT NULL;
