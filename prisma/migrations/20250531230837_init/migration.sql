-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "storeName" TEXT NOT NULL,
    "storeDomain" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "activePlan" TEXT NOT NULL DEFAULT 'free',
    "aiCredits" INTEGER NOT NULL DEFAULT 20,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productImage" TEXT,
    "storeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "currentDescription" TEXT NOT NULL,
    "currentMetaTitle" TEXT NOT NULL,
    "currentMetaDescription" TEXT NOT NULL,
    "generatedDescription" TEXT,
    "generatedMetaTitle" TEXT,
    "generatedMetaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Store_storeId_key" ON "Store"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Store_storeDomain_key" ON "Store"("storeDomain");

-- CreateIndex
CREATE UNIQUE INDEX "Store_email_key" ON "Store"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Product_productId_key" ON "Product"("productId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("storeId") ON DELETE RESTRICT ON UPDATE CASCADE;
