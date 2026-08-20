const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Crear una venta con detalles y actualizar stock
exports.crearVenta = async (req, res) => {
  const { cliente, metodoPago, detalles } = req.body;
  // detalles: [{ productoId, cantidad, precioVenta }]

  if (!detalles || !detalles.length) {
    return res.status(400).json({ error: 'Debe incluir al menos un detalle de venta' });
  }

  try {
    const venta = await prisma.$transaction(async (tx) => {
      let total = 0;
      const detallesVenta = [];

      for (const detalle of detalles) {
        const producto = await tx.producto.findUnique({
          where: { id: detalle.productoId }
        });

        if (!producto) {
          throw new Error(`Producto con ID ${detalle.productoId} no existe`);
        }

        const cantidad = Number(detalle.cantidad);
        const precioVenta = Number(detalle.precioVenta);

        // Permitir venta sin stock (quitar validación)
        // Si quieres restringir, descomenta esta línea:
        // if (Number(producto.stockActual) < cantidad) {
        //   throw new Error(`Stock insuficiente para ${producto.nombre}. Disponible: ${Number(producto.stockActual)}`);
        // }

        const costoUnitario = Number(producto.costoLocal);
        const subtotal = cantidad * precioVenta;
        total += subtotal;

        detallesVenta.push({
          productoId: detalle.productoId,
          cantidad,
          precioVenta,
          costoUnitario
        });

        await tx.producto.update({
          where: { id: detalle.productoId },
          data: { stockActual: { decrement: cantidad } }
        });

        await tx.movimientoInventario.create({
          data: {
            productoId: detalle.productoId,
            tipo: 'VENTA',
            cantidad: -cantidad,
            costoUnitario,
            referenciaId: null
          }
        });
      }

      const nuevaVenta = await tx.venta.create({
        data: {
          cliente: cliente || '',
          metodoPago: metodoPago || 'EFECTIVO',
          total,
          detalles: { create: detallesVenta }
        },
        include: { detalles: true }
      });

      return nuevaVenta;
    });

    res.status(201).json(venta);
  } catch (error) {
    console.error('Error en crearVenta:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener todas las ventas (con detalles)
exports.getVentas = async (req, res) => {
  try {
    const ventas = await prisma.venta.findMany({
      include: {
        detalles: { include: { producto: true } }
      },
      orderBy: { fecha: 'desc' }
    });
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener ventas filtradas por fecha y método de pago (para reportes)
exports.getVentasPorMetodo = async (req, res) => {
  const { fechaInicio, fechaFin, metodoPago } = req.query;

  const filtro = {};
  if (fechaInicio && fechaFin) {
    filtro.fecha = {
      gte: new Date(fechaInicio + 'T00:00:00'),
      lte: new Date(fechaFin + 'T23:59:59')
    };
  }
  if (metodoPago) {
    filtro.metodoPago = metodoPago;
  }

  try {
    const ventas = await prisma.venta.findMany({
      where: filtro,
      include: { detalles: { include: { producto: true } } },
      orderBy: { fecha: 'desc' }
    });
    res.json(ventas);
  } catch (error) {
    console.error('Error en getVentasPorMetodo:', error);
    res.status(500).json({ error: error.message });
  }
};