-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "userId" TEXT;

-- CreateTable
CREATE TABLE "purchase_patterns" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "intervalDays" INTEGER NOT NULL,
    "notify" BOOLEAN NOT NULL DEFAULT true,
    "notifyDaysBefore" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_patterns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "purchase_patterns_userId_productId_key" ON "purchase_patterns"("userId", "productId");

-- AddForeignKey
ALTER TABLE "purchase_patterns" ADD CONSTRAINT "purchase_patterns_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
