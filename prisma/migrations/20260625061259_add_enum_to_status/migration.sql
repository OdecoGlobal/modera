/*
  Warnings:

  - The `status` column on the `transaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `virtual_account` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `fromTier` on the `kyc_event` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `toTier` on the `kyc_event` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `role` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "KycTierEnum" AS ENUM ('unverified', 'basic', 'verified');

-- CreateEnum
CREATE TYPE "KycSubmissionStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "WebhookProcessedAs" AS ENUM ('success', 'misdirected', 'duplicate', 'flagged', 'ignored');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('success', 'misdirected', 'flagged');

-- CreateEnum
CREATE TYPE "VirtualAccountStatus" AS ENUM ('active', 'suspended', 'closed');

-- AlterTable
ALTER TABLE "kyc_event" DROP COLUMN "fromTier",
ADD COLUMN     "fromTier" "KycTierEnum" NOT NULL,
DROP COLUMN "toTier",
ADD COLUMN     "toTier" "KycTierEnum" NOT NULL;

-- AlterTable
ALTER TABLE "transaction" DROP COLUMN "status",
ADD COLUMN     "status" "TransactionStatus" NOT NULL DEFAULT 'success';

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "bvn" TEXT,
ALTER COLUMN "role" SET NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'user';

-- AlterTable
ALTER TABLE "virtual_account" DROP COLUMN "status",
ADD COLUMN     "status" "VirtualAccountStatus" NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "webhook_log" ADD COLUMN     "processedAs" "WebhookProcessedAs";

-- CreateTable
CREATE TABLE "kyc_submission" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "bvn" TEXT,
    "nin" TEXT,
    "dateOfBirth" TEXT,
    "address" TEXT,
    "tier" "KycTierEnum" NOT NULL DEFAULT 'unverified',
    "status" "KycSubmissionStatus" NOT NULL DEFAULT 'pending',
    "rejectionReason" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kyc_submission_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "kyc_submission" ADD CONSTRAINT "kyc_submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
