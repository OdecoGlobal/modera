/*
  Warnings:

  - You are about to drop the column `key` on the `api_key` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[keyHash]` on the table `api_key` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `keyHash` to the `api_key` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prefix` to the `api_key` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "api_key_key_key";

-- AlterTable
ALTER TABLE "api_key" DROP COLUMN "key",
ADD COLUMN     "keyHash" TEXT NOT NULL,
ADD COLUMN     "prefix" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "api_key_keyHash_key" ON "api_key"("keyHash");
