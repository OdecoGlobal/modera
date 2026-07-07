/*
  Warnings:

  - A unique constraint covering the columns `[requestId]` on the table `webhook_log` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "webhook_log" ADD COLUMN     "requestId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "webhook_log_requestId_key" ON "webhook_log"("requestId");
