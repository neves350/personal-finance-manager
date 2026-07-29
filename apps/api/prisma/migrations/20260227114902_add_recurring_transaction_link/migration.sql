-- AlterTable
ALTER TABLE "recurrings" ADD COLUMN     "last_generated_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "recurring_id" TEXT;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_recurring_id_fkey" FOREIGN KEY ("recurring_id") REFERENCES "recurrings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
