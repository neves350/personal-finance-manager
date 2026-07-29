/*
  Warnings:

  - You are about to alter the column `amount` on the `deposits` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to drop the column `deadline` on the `goals` table. All the data in the column will be lost.
  - You are about to alter the column `current_amount` on the `goals` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.

*/
-- CreateEnum
CREATE TYPE "GoalType" AS ENUM ('SAVINGS', 'SPENDING_LIMIT');

-- DropForeignKey
ALTER TABLE "deposits" DROP CONSTRAINT "deposits_goal_id_fkey";

-- AlterTable
ALTER TABLE "deposits" ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "note" TEXT,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "goals" DROP COLUMN "deadline",
ADD COLUMN     "bank_account_id" TEXT,
ADD COLUMN     "category_id" TEXT,
ADD COLUMN     "end_date" TIMESTAMP(3),
ADD COLUMN     "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "type" "GoalType" NOT NULL DEFAULT 'SAVINGS',
ALTER COLUMN "current_amount" SET DATA TYPE DECIMAL(12,2);

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
