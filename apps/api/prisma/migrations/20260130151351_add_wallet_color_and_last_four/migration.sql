-- CreateEnum
CREATE TYPE "WalletColor" AS ENUM ('GRAY', 'RED', 'GREEN', 'BLUE', 'PURPLE', 'ORANGE', 'YELLOW', 'PINK');

-- AlterTable
ALTER TABLE "wallets" ADD COLUMN     "color" "WalletColor" NOT NULL DEFAULT 'GRAY',
ADD COLUMN     "last_four" VARCHAR(4);
