-- CreateTable
CREATE TABLE "Parametro" (
    "id" SERIAL NOT NULL,
    "tasaDolar" DECIMAL(12,2) NOT NULL,
    "monedaLocal" TEXT NOT NULL DEFAULT 'USD',
    "margenGanancia" DECIMAL(5,2) NOT NULL,
    "impuesto" DECIMAL(5,2) NOT NULL DEFAULT 0,

    CONSTRAINT "Parametro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proveedor" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "ruc" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "direccion" TEXT,

    CONSTRAINT "Proveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "proveedorId" INTEGER,
    "costoUsd" DECIMAL(12,2) NOT NULL,
    "costoLocal" DECIMAL(12,2) NOT NULL,
    "precioVenta" DECIMAL(12,2) NOT NULL,
    "precioVentaUsd" DECIMAL(12,2),
    "stockActual" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "stockMinimo" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Compra" (
    "id" SERIAL NOT NULL,
    "proveedorId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "numeroFactura" TEXT,
    "total" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "Compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetalleCompra" (
    "id" SERIAL NOT NULL,
    "compraId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" DECIMAL(12,2) NOT NULL,
    "costoUsd" DECIMAL(12,2) NOT NULL,
    "costoLocal" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "DetalleCompra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venta" (
    "id" SERIAL NOT NULL,
    "cliente" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total" DECIMAL(12,2) NOT NULL,
    "metodoPago" TEXT,

    CONSTRAINT "Venta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetalleVenta" (
    "id" SERIAL NOT NULL,
    "ventaId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" DECIMAL(12,2) NOT NULL,
    "precioVenta" DECIMAL(12,2) NOT NULL,
    "costoUnitario" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "DetalleVenta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventarioInicial" (
    "productoId" INTEGER NOT NULL,
    "cantidad" DECIMAL(12,2) NOT NULL,
    "costoUnitario" DECIMAL(12,2) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventarioInicial_pkey" PRIMARY KEY ("productoId")
);

-- CreateTable
CREATE TABLE "MovimientoInventario" (
    "id" SERIAL NOT NULL,
    "productoId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "cantidad" DECIMAL(12,2) NOT NULL,
    "costoUnitario" DECIMAL(12,2) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referenciaId" INTEGER,

    CONSTRAINT "MovimientoInventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConteoInventario" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'ABIERTO',

    CONSTRAINT "ConteoInventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetalleConteo" (
    "id" SERIAL NOT NULL,
    "conteoId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidadSistema" DECIMAL(12,2) NOT NULL,
    "cantidadContada" DECIMAL(12,2) NOT NULL,
    "diferencia" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "DetalleConteo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Producto_codigo_key" ON "Producto"("codigo");

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compra" ADD CONSTRAINT "Compra_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleCompra" ADD CONSTRAINT "DetalleCompra_compraId_fkey" FOREIGN KEY ("compraId") REFERENCES "Compra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleCompra" ADD CONSTRAINT "DetalleCompra_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleVenta" ADD CONSTRAINT "DetalleVenta_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleVenta" ADD CONSTRAINT "DetalleVenta_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventarioInicial" ADD CONSTRAINT "InventarioInicial_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoInventario" ADD CONSTRAINT "MovimientoInventario_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleConteo" ADD CONSTRAINT "DetalleConteo_conteoId_fkey" FOREIGN KEY ("conteoId") REFERENCES "ConteoInventario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleConteo" ADD CONSTRAINT "DetalleConteo_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
