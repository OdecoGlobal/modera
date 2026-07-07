-- AlterTable
ALTER TABLE "VirtualAccount" ADD COLUMN     "accountHolderId" TEXT,
ADD COLUMN     "bvn" TEXT,
ADD COLUMN     "expired" BOOLEAN NOT NULL DEFAULT false;
