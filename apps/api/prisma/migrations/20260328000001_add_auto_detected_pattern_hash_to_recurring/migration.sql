-- AlterTable
ALTER TABLE "recurrings" ADD COLUMN "auto_detected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "pattern_hash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "recurrings_pattern_hash_key" ON "recurrings"("pattern_hash");
