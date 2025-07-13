/*
  Warnings:

  - You are about to drop the column `optimizedAt` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "optimizedAt",
ADD COLUMN     "descriptionOptimizedAt" TIMESTAMP(3),
ADD COLUMN     "metaDataOptimizedAt" TIMESTAMP(3);
