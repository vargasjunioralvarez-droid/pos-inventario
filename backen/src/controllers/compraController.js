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
  const { proveedorId, numeroFactura, detalles, total, totalUsd, tasaDolar, tipoPago } = req.body;

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
          totalUsd: Number(totalUsd) || null,
          tasaDolar: Number(tasaDolar) || null,
          tipoPago: tipoPago || 'CONTADO',
          detalles: {
            create: detalles.map(d => {
              const totalUnidades = Number(d.cantidadBultos) * Number(d.unidadesPorBulto);
              let costoUsd, costoLocal;
              if (d.moneda === 'USD') {
                costoUsd = Number(d.costoUnitario);
                costoLocal = costoUsd * Number(tasaDolar || 1);
              } else {
                costoLocal = Number(d.costoUnitario);
                costoUsd = costoLocal / Number(tasaDolar || 1);
              }
              return {
                productoId: Number(d.productoId),
                cantidad: totalUnidades,
                cantidadBultos: Number(d.cantidadBultos),
                unidadesPorBulto: Number(d.unidadesPorBulto),
                costoUsd,
                costoLocal
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
        let costoUnitarioLocal, costoUnitarioUsd;
        if (detalle.moneda === 'USD') {
          costoUnitarioUsd = Number(detalle.costoUnitario);
          costoUnitarioLocal = costoUnitarioUsd * Number(tasaDolar || 1);
        } else {
          costoUnitarioLocal = Number(detalle.costoUnitario);
          costoUnitarioUsd = costoUnitarioLocal / Number(tasaDolar || 1);
        }

        const stockAnterior = Number(producto.stockActual);
        const costoAnteriorLocal = Number(producto.costoLocal);
        const nuevoStock = stockAnterior + totalUnidades;
        const nuevoCostoLocal = (stockAnterior * costoAnteriorLocal + totalUnidades * costoUnitarioLocal) / nuevoStock;

        await tx.producto.update({
          where: { id: producto.id },
          data: {
            stockActual: nuevoStock,
            costoLocal: nuevoCostoLocal,
            costoUsd: costoUnitarioUsd
          }
        });

        await tx.movimientoInventario.create({
          data: {
            productoId: producto.id,
            tipo: 'COMPRA',
            cantidad: totalUnidades,
            costoUnitario: costoUnitarioLocal,
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

// Actualizar una compra
exports.updateCompra = async (req, res) => {
  const { id } = req.params;
  const { proveedorId, numeroFactura, total, totalUsd, tasaDolar, tipoPago, detalles } = req.body;

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      const compraAntigua = await tx.compra.findUnique({
        where: { id: Number(id) },
        include: { detalles: true }
      });

      if (!compraAntigua) throw new Error('Compra no encontrada');

      // Revertir stock
      for (const detalle of compraAntigua.detalles) {
        const producto = await tx.producto.findUnique({ where: { id: detalle.productoId } });
        if (producto) {
          const stockNuevo = Number(producto.stockActual) - Number(detalle.cantidad);
          if (stockNuevo < 0) throw new Error('Stock insuficiente para revertir');
          await tx.producto.update({
            where: { id: detalle.productoId },
            data: { stockActual: stockNuevo }
          });
        }
      }

      await tx.detalleCompra.deleteMany({ where: { compraId: Number(id) } });

      for (const d of detalles) {
        const totalUnidades = Number(d.cantidadBultos) * Number(d.unidadesPorBulto);
        let costoUsd, costoLocal;
        if (d.moneda === 'USD') {
          costoUsd = Number(d.costoUnitario);
          costoLocal = costoUsd * Number(tasaDolar || 1);
        } else {
          costoLocal = Number(d.costoUnitario);
          costoUsd = costoLocal / Number(tasaDolar || 1);
        }

        await tx.detalleCompra.create({
          data: {
            compraId: Number(id),
            productoId: Number(d.productoId),
            cantidad: totalUnidades,
            cantidadBultos: Number(d.cantidadBultos),
            unidadesPorBulto: Number(d.unidadesPorBulto),
            costoUsd,
            costoLocal
          }
        });

        const producto = await tx.producto.findUnique({ where: { id: Number(d.productoId) } });
        if (producto) {
          const stockAnterior = Number(producto.stockActual);
          const costoAnteriorLocal = Number(producto.costoLocal);
          const nuevoStock = stockAnterior + totalUnidades;
          const nuevoCostoLocal = (stockAnterior * costoAnteriorLocal + totalUnidades * costoLocal) / nuevoStock;
          await tx.producto.update({
            where: { id: producto.id },
            data: {
              stockActual: nuevoStock,
              costoLocal: nuevoCostoLocal,
              costoUsd
            }
          });
        }
      }

      await tx.compra.update({
        where: { id: Number(id) },
        data: {
          proveedorId: Number(proveedorId),
          numeroFactura,
          total: Number(total),
          totalUsd: Number(totalUsd),
          tasaDolar: Number(tasaDolar),
          tipoPago
        }
      });

      return await tx.compra.findUnique({
        where: { id: Number(id) },
        include: { proveedor: true, detalles: { include: { producto: true } } }
      });
    });

    res.json(resultado);
  } catch (error) {
    console.error('Error en updateCompra:', error);
    res.status(500).json({ error: error.message });
  }
};

// Eliminar compra
exports.deleteCompra = async (req, res) => {
  const { id } = req.params;

  try {
    const compra = await prisma.compra.findUnique({
      where: { id: Number(id) },
      include: { detalles: true }
    });

    if (!compra) return res.status(404).json({ error: 'Compra no encontrada' });

    await prisma.$transaction(async (tx) => {
      for (const detalle of compra.detalles) {
        const producto = await tx.producto.findUnique({ where: { id: detalle.productoId } });
        if (producto) {
          const stockNuevo = Number(producto.stockActual) - Number(detalle.cantidad);
          if (stockNuevo < 0) throw new Error('Stock insuficiente para revertir');
          await tx.producto.update({
            where: { id: detalle.productoId },
            data: { stockActual: stockNuevo }
          });
        }
      }
      await tx.detalleCompra.deleteMany({ where: { compraId: Number(id) } });
      await tx.compra.delete({ where: { id: Number(id) } });
    });

    res.json({ message: 'Compra eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reporte filtrado
exports.getComprasPorFiltro = async (req, res) => {
  const { fechaInicio, fechaFin, proveedorId, tipoPago } = req.query;
  const filtro = {};
  if (fechaInicio && fechaFin) {
    filtro.fecha = { gte: new Date(fechaInicio + 'T00:00:00'), lte: new Date(fechaFin + 'T23:59:59') };
  }
  if (proveedorId) filtro.proveedorId = Number(proveedorId);
  if (tipoPago) filtro.tipoPago = tipoPago;

  try {
    const compras = await prisma.compra.findMany({
      where: filtro,
      include: { proveedor: true, detalles: { include: { producto: true } } },
      orderBy: { fecha: 'desc' }
    });
    res.json(compras);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};