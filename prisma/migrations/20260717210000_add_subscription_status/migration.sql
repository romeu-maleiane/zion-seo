ALTER TABLE "Store"
ADD COLUMN "shopifySubscriptionId" TEXT,
ADD COLUMN "subscriptionStatus" TEXT NOT NULL DEFAULT 'none';