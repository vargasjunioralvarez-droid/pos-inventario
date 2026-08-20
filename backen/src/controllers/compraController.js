const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener todas las compras con detalles
exports.getCompras = async (req, res) => {
  try {
    const compras = await prisma.compra.findMany({
      include: {
        proveedor: true,
        detalles: { include: { producto: true } }
      },
      orderBy: { fecha: 'desc' }
    });
    res.json(compras);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear una compra con detalles y actualizar stock/costo
exports.crearCompra = async (req, res) => {
  const { proveedorId, numeroFactura, detalles, total } = req.body;

  if (!proveedorId || !detalles || !detalles.length) {
    return res.status(400).json({ error: 'Debe indicar proveedor y al menos un detalle' });
  }

  for (const d of detalles) {
    if (!d.productoId || !d.cantidadBultos || !d.unidadesPorBulto || !d.costoUnitario) {
      return res.status(400).json({ error: 'Cada detalle debe tener producto, bultos, unidades por bulto y costo unitario' });
    }
  }

  try {
    const compra = await prisma.$transaction(async (tx) => {
      const nuevaCompra = await tx.compra.create({
  data: {
    proveedorId: Number(proveedorId),
    numeroFactura,
    total: Number(total) || 0,
    semana: req.body.semana || null,
    detalles: {
            create: detalles.map(d => {
              const totalUnidades = Number(d.cantidadBultos) * Number(d.unidadesPorBulto);
              return {
                productoId: Number(d.productoId),
                cantidad: totalUnidades,
                costoUsd: Number(d.costoUnitario),
                costoLocal: Number(d.costoUnitario)
              };
            })
          }
        },
        include: { detalles: true }
      });

      for (const detalle of detalles) {
        const producto = await tx.producto.findUnique({ where: { id: Number(detalle.productoId) } });
        if (!producto) throw new Error(`Producto ${detalle.productoId} no existe`);

        const totalUnidades = Number(detalle.cantidadBultos) * Number(detalle.unidadesPorBulto);
        const costoUnitario = Number(detalle.costoUnitario);
        const stockAnterior = Number(producto.stockActual);
        const costoAnteriorLocal = Number(producto.costoLocal);
        const nuevoStock = stockAnterior + totalUnidades;
        const nuevoCostoLocal = (stockAnterior * costoAnteriorLocal + totalUnidades * costoUnitario) / nuevoStock;

        await tx.producto.update({
          where: { id: producto.id },
          data: {
            stockActual: nuevoStock,
            costoLocal: nuevoCostoLocal,
            costoUsd: costoUnitario
          }
        });

        await tx.movimientoInventario.create({
          data: {
            productoId: producto.id,
            tipo: 'COMPRA',
            cantidad: totalUnidades,
            costoUnitario,
            referenciaId: nuevaCompra.id
          }
        });
      }

      return await tx.compra.findUnique({
        where: { id: nuevaCompra.id },
        include: { proveedor: true, detalles: { include: { producto: true } } }
      });
    });

    res.status(201).json(compra);
  } catch (error) {
    console.error('Error en crearCompra:', error);
    res.status(500).json({ error: error.message });
  }
};

// Actualizar una compra (solo admin)
exports.updateCompra = async (req, res) => {
  const { id } = req.params;
  const { proveedorId, numeroFactura, total } = req.body;

  try {
    const compra = await prisma.compra.update({
      where: { id: Number(id) },
      data: {
        proveedorId: proveedorId ? Number(proveedorId) : undefined,
        numeroFactura,
        total: total !== undefined ? Number(total) : undefined
      }
    });
    res.json(compra);
  } catch (error) {
    console.error('Error en updateCompra:', error);
    res.status(500).json({ error: error.message });
  }
};

// Eliminar una compra y revertir stock (solo admin)
exports.deleteCompra = async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      const compra = await tx.compra.findUnique({
        where: { id: Number(id) },
        include: { detalles: true }
      });

      if (!compra) throw new Error('Compra no encontrada');

      // 1. Revertir stock
      for (const detalle of compra.detalles) {
        const producto = await tx.producto.findUnique({ where: { id: detalle.productoId } });
        if (producto) {
          await tx.producto.update({
            where: { id: detalle.productoId },
            data: { stockActual: { decrement: Number(detalle.cantidad) } }
          });
        }
      }

      // 2. Eliminar detalles primero
      await tx.detalleCompra.deleteMany({ where: { compraId: Number(id) } });

      // 3. Ahora eliminar la compra
      await tx.compra.delete({ where: { id: Number(id) } });

      return { message: 'Compra eliminada correctamente' };
    });

    res.json(resultado);
  } catch (error) {
    console.error('Error en deleteCompra:', error);
    res.status(500).json({ error: error.message });
  }
};