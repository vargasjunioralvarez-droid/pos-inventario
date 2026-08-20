/*
  Warnings:

  - You are about to drop the column `email` on the `Usuario` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nombre]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Usuario_email_key";

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "email";

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_nombre_key" ON "Usuario"("nombre");
