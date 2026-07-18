CREATE INDEX "Product_storeId_createdAt_productId_idx"
ON "Product" ("storeId", "createdAt" DESC, "productId" ASC);
