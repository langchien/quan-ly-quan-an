-- AlterTable
ALTER TABLE "Order" ADD COLUMN "billId" INTEGER;

-- CreateTable
CREATE TABLE "Bill" (
    "id" SERIAL NOT NULL,
    "orderCode" BIGINT NOT NULL,
    "guestId" INTEGER,
    "tableNumber" INTEGER,
    "orderHandlerId" INTEGER,
    "totalAmount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "paymentMethod" TEXT NOT NULL DEFAULT 'PayOS',
    "paymentLinkId" TEXT,
    "checkoutUrl" TEXT,
    "qrCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bill_orderCode_key" ON "Bill"("orderCode");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_tableNumber_fkey" FOREIGN KEY ("tableNumber") REFERENCES "Table"("number") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_orderHandlerId_fkey" FOREIGN KEY ("orderHandlerId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
