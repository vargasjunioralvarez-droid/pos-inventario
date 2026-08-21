-- AlterTable
ALTER TABLE "Compra" ADD COLUMN     "tasaDolar" DECIMAL(12,2),
ADD COLUMN     "tipoPago" TEXT NOT NULL DEFAULT 'CONTADO',
ADD COLUMN     "totalUsd" DECIMAL(12,2);

-- AlterTable
ALTER TABLE "ConteoInventario" ADD COLUMN     "fechaFin" TIMESTAMP(3),
ADD COLUMN     "fechaInicio" TIMESTAMP(3);
