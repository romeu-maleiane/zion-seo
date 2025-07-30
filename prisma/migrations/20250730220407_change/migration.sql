/*
  Warnings:

  - You are about to drop the column `removeCollections` on the `LLMDotTxtConfig` table. All the data in the column will be lost.
  - You are about to drop the column `removeProducts` on the `LLMDotTxtConfig` table. All the data in the column will be lost.
  - You are about to drop the column `selectCollections` on the `LLMDotTxtConfig` table. All the data in the column will be lost.
  - You are about to drop the column `selectProducts` on the `LLMDotTxtConfig` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LLMDotTxtConfig" DROP COLUMN "removeCollections",
DROP COLUMN "removeProducts",
DROP COLUMN "selectCollections",
DROP COLUMN "selectProducts",
ADD COLUMN     "exceptSelectedProducts" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "exceptSeleptedCollections" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "selectedCollections" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "selectedProducts" BOOLEAN NOT NULL DEFAULT false;
