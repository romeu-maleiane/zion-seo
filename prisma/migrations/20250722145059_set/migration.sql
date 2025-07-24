-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "productUrl" TEXT,
ADD COLUMN     "showForLlms" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "collectionImage" TEXT,
    "collectionUrl" TEXT,
    "storeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "showForLlms" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "pageUrl" TEXT,
    "storeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Blog" (
    "id" TEXT NOT NULL,
    "blogId" TEXT NOT NULL,
    "blogUrl" TEXT,
    "storeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Blog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Collection_collectionId_key" ON "Collection"("collectionId");

-- CreateIndex
CREATE UNIQUE INDEX "Page_pageId_key" ON "Page"("pageId");

-- CreateIndex
CREATE UNIQUE INDEX "Blog_blogId_key" ON "Blog"("blogId");

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("storeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("storeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("storeId") ON DELETE RESTRICT ON UPDATE CASCADE;
