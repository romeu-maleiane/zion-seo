/*
  Warnings:

  - Made the column `blogUrl` on table `Blog` required. This step will fail if there are existing NULL values in that column.
  - Made the column `collectionUrl` on table `Collection` required. This step will fail if there are existing NULL values in that column.
  - Made the column `pageUrl` on table `Page` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Blog" ALTER COLUMN "blogUrl" SET NOT NULL;

-- AlterTable
ALTER TABLE "Collection" ALTER COLUMN "collectionUrl" SET NOT NULL;

-- AlterTable
ALTER TABLE "Page" ALTER COLUMN "pageUrl" SET NOT NULL;

-- CreateTable
CREATE TABLE "LLMDotTxtConfig" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "llmDotTxtDescription" TEXT,
    "includeProducts" BOOLEAN NOT NULL DEFAULT true,
    "includeCollections" BOOLEAN NOT NULL DEFAULT true,
    "includeBlogs" BOOLEAN NOT NULL DEFAULT true,
    "includePages" BOOLEAN NOT NULL DEFAULT true,
    "selectAllProducts" BOOLEAN NOT NULL DEFAULT true,
    "selectProducts" BOOLEAN NOT NULL DEFAULT false,
    "removeProducts" BOOLEAN NOT NULL DEFAULT false,
    "selectAllCollections" BOOLEAN NOT NULL DEFAULT true,
    "selectCollections" BOOLEAN NOT NULL DEFAULT false,
    "removeCollections" BOOLEAN NOT NULL DEFAULT false,
    "selectChatGPT" BOOLEAN NOT NULL DEFAULT true,
    "selectGemini" BOOLEAN NOT NULL DEFAULT true,
    "selectGrok" BOOLEAN NOT NULL DEFAULT true,
    "selectDeepSeek" BOOLEAN NOT NULL DEFAULT true,
    "selectClaude" BOOLEAN NOT NULL DEFAULT true,
    "selectPerplexity" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "LLMDotTxtConfig_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LLMDotTxtConfig" ADD CONSTRAINT "LLMDotTxtConfig_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("storeId") ON DELETE RESTRICT ON UPDATE CASCADE;
