const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getTasaDolar() {
  const parametro = await prisma.parametro.findUnique({ where: { id: 1 } });
  return parametro ? Number(parametro.tasaDolar) : 1;
}

exports.getProductos = async (req, res) => {
  try {
    const productos = await prisma.producto.findMany({
      where: { activo: true },
      include: { proveedor: true }
    });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createProducto = async (req, res) => {
  const { codigo, descripcion, moneda, stockMinimo } = req.body;

  if (!codigo || !descripcion || !moneda) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const producto = await prisma.producto.create({
      data: {
        codigo,
        nombre: descripcion,
        descripcion,
        moneda,
        costoUsd: 0,
        costoLocal: 0,
        precioVenta: 0,
        precioVentaUsd: 0,
        precioVentaFiado: 0,
        precioVentaFiadoUsd: 0,
        margenContado: 0,
        margenFiado: 0,
        stockActual: 0,
        stockMinimo: stockMinimo ? Number(stockMinimo) : 0
      }
    });
    res.status(201).json(producto);
  } catch (error) {
    console.error('Error en createProducto:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateProducto = async (req, res) => {
  const { id } = req.params;
  const { codigo, descripcion, moneda, stockMinimo } = req.body;
  const data = {};
  if (codigo !== undefined) data.codigo = codigo;
  if (descripcion !== undefined) {
    data.descripcion = descripcion;
    data.nombre = descripcion;
  }
  if (moneda !== undefined) data.moneda = moneda;
  if (stockMinimo !== undefined) data.stockMinimo = Number(stockMinimo);

  try {
    const producto = await prisma.producto.update({
      where: { id: Number(id) },
      data
    });
    res.json(producto);
  } catch (error) {
    console.error('Error en updateProducto:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProducto = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.producto.update({
      where: { id: Number(id) },
      data: { activo: false }
    });
    res.json({ message: 'Producto desactivado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.actualizarPreciosConTasa = async (req, res) => {
  const { tasaDolar } = req.body;
  if (!tasaDolar || tasaDolar <= 0) {
    return res.status(400).json({ error: 'Tasa de dólar inválida' });
  }

  try {
    await prisma.parametro.upsert({
      where: { id: 1 },
      update: { tasaDolar: Number(tasaDolar) },
      create: { id: 1, tasaDolar: Number(tasaDolar) }
    });

    const productos = await prisma.producto.findMany();

    for (const p of productos) {
      const precioUsd = Number(p.precioVentaUsd) || 0;
      if (precioUsd > 0) {
        await prisma.producto.update({
          where: { id: p.id },
          data: { precioVenta: precioUsd * Number(tasaDolar) }
        });
      }
      const precioFiadoUsd = Number(p.precioVentaFiadoUsd) || 0;
      if (precioFiadoUsd > 0) {
        await prisma.producto.update({
          where: { id: p.id },
          data: { precioVentaFiado: precioFiadoUsd * Number(tasaDolar) }
        });
      }
    }

    res.json({ message: 'Precios en BS actualizados según nueva tasa' });
  } catch (error) {
    console.error('Error en actualizarPreciosConTasa:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.actualizarPrecioProducto = async (req, res) => {
  const { id } = req.params;
  const { precioVenta, precioVentaUsd, precioVentaFiado, precioVentaFiadoUsd, margen, margenFiado } = req.body;

  try {
    const producto = await prisma.producto.findUnique({ where: { id: Number(id) } });
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

    const tasa = await getTasaDolar();
    const data = {};

    // Guardar márgenes exactos
    if (margen !== undefined) {
      data.margenContado = Number(margen);
      const costoUsd = Number(producto.costoUsd) || 0;
      const precioUsd = costoUsd * (1 + Number(margen) / 100);
      data.precioVentaUsd = precioUsd;
      data.precioVenta = precioUsd * tasa;
    }
    if (margenFiado !== undefined) {
      data.margenFiado = Number(margenFiado);
      const costoUsd = Number(producto.costoUsd) || 0;
      const precioFiadoUsd = costoUsd * (1 + Number(margenFiado) / 100);
      data.precioVentaFiadoUsd = precioFiadoUsd;
      data.precioVentaFiado = precioFiadoUsd * tasa;
    }

    // Si no vinieron márgenes, usar precios directos
    if (margen === undefined) {
      if (precioVenta !== undefined && precioVentaUsd !== undefined) {
        data.precioVenta = Number(precioVenta);
        data.precioVentaUsd = Number(precioVentaUsd);
      } else if (precioVentaUsd !== undefined) {
        data.precioVentaUsd = Number(precioVentaUsd);
        data.precioVenta = Number(precioVentaUsd) * tasa;
      } else if (precioVenta !== undefined) {
        data.precioVenta = Number(precioVenta);
        data.precioVentaUsd = Number(precioVenta) / tasa;
      }
    }

    if (margenFiado === undefined) {
      if (precioVentaFiado !== undefined && precioVentaFiadoUsd !== undefined) {
        data.precioVentaFiado = Number(precioVentaFiado);
        data.precioVentaFiadoUsd = Number(precioVentaFiadoUsd);
      } else if (precioVentaFiadoUsd !== undefined) {
        data.precioVentaFiadoUsd = Number(precioVentaFiadoUsd);
        data.precioVentaFiado = Number(precioVentaFiadoUsd) * tasa;
      } else if (precioVentaFiado !== undefined) {
        data.precioVentaFiado = Number(precioVentaFiado);
        data.precioVentaFiadoUsd = Number(precioVentaFiado) / tasa;
      }
    }

    const actualizado = await prisma.producto.update({
      where: { id: Number(id) },
      data
    });

    res.json(actualizado);
  } catch (error) {
    console.error('Error en actualizarPrecioProducto:', error);
    res.status(500).json({ error: error.message });
  }
};