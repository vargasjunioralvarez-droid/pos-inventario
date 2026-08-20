/*
  Warnings:

  - You are about to drop the column `impuesto` on the `Parametro` table. All the data in the column will be lost.
  - You are about to drop the column `margenGanancia` on the `Parametro` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Parametro" DROP COLUMN "impuesto",
DROP COLUMN "margenGanancia",
ALTER COLUMN "monedaLocal" SET DEFAULT 'BS';

-- AlterTable
ALTER TABLE "Producto" ADD COLUMN     "moneda" TEXT NOT NULL DEFAULT 'USD';
