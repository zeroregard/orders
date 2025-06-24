-- CreateEnum
CREATE TYPE "OrderSource" AS ENUM ('MANUAL', 'EMAIL', 'API');

-- CreateEnum
CREATE TYPE "ProcessingStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'DUPLICATE');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "isDraft" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "originalEmailHash" TEXT,
ADD COLUMN     "source" "OrderSource" NOT NULL DEFAULT 'MANUAL';

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "isDraft" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "email_processing_logs" (
    "id" TEXT NOT NULL,
    "emailHash" TEXT NOT NULL,
    "senderEmail" TEXT NOT NULL,
    "subject" TEXT,
    "rawContent" TEXT NOT NULL,
    "status" "ProcessingStatus" NOT NULL,
    "errorMessage" TEXT,
    "orderId" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_processing_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_processing_logs_emailHash_key" ON "email_processing_logs"("emailHash");
