/*
  Warnings:

  - You are about to drop the column `exceptSeleptedCollections` on the `LLMDotTxtConfig` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LLMDotTxtConfig" DROP COLUMN "exceptSeleptedCollections",
ADD COLUMN     "exceptSelectedCollections" BOOLEAN NOT NULL DEFAULT false;
