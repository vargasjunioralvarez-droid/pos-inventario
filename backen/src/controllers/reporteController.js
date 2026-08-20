const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener reporte de inventario y ganancias por rango de fechas
exports.getReporteInventario = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;

  if (!fechaInicio || !fechaFin) {
    return res.status(400).json({ error: 'Debe indicar fechaInicio y fechaFin (YYYY-MM-DD)' });
  }

  const inicio = new Date(fechaInicio + 'T00:00:00');
  const fin = new Date(fechaFin + 'T23:59:59');

  try {
    const productos = await prisma.producto.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' }
    });

    const reporte = await Promise.all(productos.map(async (producto) => {
      // Compras en el rango
      const compras = await prisma.detalleCompra.aggregate({
        _sum: { cantidad: true },
        where: {
          productoId: producto.id,
          compra: { fecha: { gte: inicio, lte: fin } }
        }
      });

      // Ventas contado en el rango
      const ventasContado = await prisma.detalleVenta.aggregate({
        _sum: { cantidad: true },
        where: {
          productoId: producto.id,
          venta: {
            fecha: { gte: inicio, lte: fin },
            metodoPago: 'CONTADO'
          }
        }
      });

      // Ventas fiado en el rango
      const ventasFiado = await prisma.detalleVenta.aggregate({
        _sum: { cantidad: true },
        where: {
          productoId: producto.id,
          venta: {
            fecha: { gte: inicio, lte: fin },
            metodoPago: 'FIADO'
          }
        }
      });

      const cantidadCompras = Number(compras._sum.cantidad || 0);
      const cantidadVentasContado = Number(ventasContado._sum.cantidad || 0);
      const cantidadVentasFiado = Number(ventasFiado._sum.cantidad || 0);
      const cantidadVentas = cantidadVentasContado + cantidadVentasFiado;
      const stockActual = Number(producto.stockActual);

      // Inventario inicial = stock actual - compras + ventas totales
      const inventarioInicial = stockActual - cantidadCompras + cantidadVentas;

      // Obtener la última toma de inventario (físico) para este producto
      const ultimoDetalle = await prisma.detalleConteo.findFirst({
        where: { productoId: producto.id },
        orderBy: { id: 'desc' },
      });

      const inventarioFisico = ultimoDetalle ? Number(ultimoDetalle.cantidadContada) : 0;
      const diferencia = stockActual - inventarioFisico;
      const perdida = diferencia > 0 ? diferencia : 0; // solo si falta mercancía

      const costoUnitario = Number(producto.costoLocal);
      const precioVenta = Number(producto.precioVenta);
      const gananciaUnitaria = precioVenta - costoUnitario;
      const gananciaTotal = gananciaUnitaria * cantidadVentas;

      return {
        productoId: producto.id,
        codigo: producto.codigo,
        nombre: producto.nombre,
        inventarioInicial,
        compras: cantidadCompras,
        ventasContado: cantidadVentasContado,
        ventasFiado: cantidadVentasFiado,
        ventas: cantidadVentas, // total
        inventarioFinal: stockActual,
        inventarioFisico,
        diferencia,
        perdida,
        costoUnitario,
        precioVenta,
        gananciaUnitaria,
        gananciaTotal
      };
    }));

    res.json(reporte);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};