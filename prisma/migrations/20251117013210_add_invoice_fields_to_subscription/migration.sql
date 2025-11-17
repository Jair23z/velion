/*
  Warnings:

  - A unique constraint covering the columns `[invoiceNumber]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "invoiceIssued" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "invoiceNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_invoiceNumber_key" ON "Subscription"("invoiceNumber");
