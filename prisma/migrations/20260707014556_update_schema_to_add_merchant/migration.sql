/*
  Warnings:

  - You are about to drop the column `userId` on the `api_key` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `audit_log` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `kyc_event` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `kyc_submission` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `transaction` table. All the data in the column will be lost.
  - You are about to drop the column `bvn` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `kycTier` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `virtual_account` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[merchantId]` on the table `api_key` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[merchantId]` on the table `virtual_account` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[customerId]` on the table `virtual_account` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[bankAccountNumber]` on the table `virtual_account` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `merchantId` to the `api_key` table without a default value. This is not possible if the table is not empty.
  - Added the required column `merchantId` to the `audit_log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerId` to the `kyc_submission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `merchantId` to the `kyc_submission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `merchantId` to the `virtual_account` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VirtualAccountType" AS ENUM ('merchant', 'customer');

-- DropForeignKey
ALTER TABLE "api_key" DROP CONSTRAINT "api_key_userId_fkey";

-- DropForeignKey
ALTER TABLE "audit_log" DROP CONSTRAINT "audit_log_userId_fkey";

-- DropForeignKey
ALTER TABLE "kyc_event" DROP CONSTRAINT "kyc_event_userId_fkey";

-- DropForeignKey
ALTER TABLE "kyc_submission" DROP CONSTRAINT "kyc_submission_userId_fkey";

-- DropForeignKey
ALTER TABLE "transaction" DROP CONSTRAINT "transaction_userId_fkey";

-- DropForeignKey
ALTER TABLE "virtual_account" DROP CONSTRAINT "virtual_account_userId_fkey";

-- DropIndex
DROP INDEX "api_key_userId_key";

-- DropIndex
DROP INDEX "virtual_account_userId_key";

-- AlterTable
ALTER TABLE "api_key" DROP COLUMN "userId",
ADD COLUMN     "merchantId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "audit_log" DROP COLUMN "userId",
ADD COLUMN     "merchantId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "kyc_event" DROP COLUMN "userId",
ADD COLUMN     "customerId" UUID,
ADD COLUMN     "merchantId" UUID;

-- AlterTable
ALTER TABLE "kyc_submission" DROP COLUMN "userId",
ADD COLUMN     "customerId" UUID NOT NULL,
ADD COLUMN     "merchantId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "transaction" DROP COLUMN "userId",
ADD COLUMN     "customerId" UUID,
ADD COLUMN     "merchantId" UUID,
ADD COLUMN     "narration" TEXT,
ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "bvn",
DROP COLUMN "kycTier";

-- AlterTable
ALTER TABLE "virtual_account" DROP COLUMN "userId",
ADD COLUMN     "customerId" UUID,
ADD COLUMN     "merchantId" UUID NOT NULL,
ADD COLUMN     "type" "VirtualAccountType" NOT NULL DEFAULT 'customer';

-- CreateTable
CREATE TABLE "merchant" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "businessEmail" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "merchant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "merchantId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "kycTier" "KycTierEnum" NOT NULL DEFAULT 'unverified',
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "merchant_userId_key" ON "merchant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "api_key_merchantId_key" ON "api_key"("merchantId");

-- CreateIndex
CREATE UNIQUE INDEX "virtual_account_merchantId_key" ON "virtual_account"("merchantId");

-- CreateIndex
CREATE UNIQUE INDEX "virtual_account_customerId_key" ON "virtual_account"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "virtual_account_bankAccountNumber_key" ON "virtual_account"("bankAccountNumber");

-- AddForeignKey
ALTER TABLE "merchant" ADD CONSTRAINT "merchant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer" ADD CONSTRAINT "customer_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "virtual_account" ADD CONSTRAINT "virtual_account_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "virtual_account" ADD CONSTRAINT "virtual_account_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_key" ADD CONSTRAINT "api_key_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc_event" ADD CONSTRAINT "kyc_event_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc_event" ADD CONSTRAINT "kyc_event_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc_submission" ADD CONSTRAINT "kyc_submission_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
