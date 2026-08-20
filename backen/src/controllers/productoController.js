const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener tasa actual del dólar
async function getTasaDolar() {
  const parametro = await prisma.parametro.findUnique({ where: { id: 1 } });
  return parametro ? Number(parametro.tasaDolar) : 1;
}

// Listar productos activos
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

// Crear producto simplificado (solo código, descripción y moneda)
exports.createProducto = async (req, res) => {
  const { codigo, descripcion, moneda, stockMinimo } = req.body;

  if (!codigo || !descripcion || !moneda) {
    return res.status(400).json({ error: 'Faltan campos obligatorios: código, descripción y moneda' });
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

// Actualizar producto (solo datos básicos)
exports.updateProducto = async (req, res) => {
  const { id } = req.params;
  try {
    const { codigo, descripcion, moneda, stockMinimo } = req.body;
    const data = {};
    if (codigo !== undefined) data.codigo = codigo;
    if (descripcion !== undefined) {
      data.descripcion = descripcion;
      data.nombre = descripcion;
    }
    if (moneda !== undefined) data.moneda = moneda;
    if (stockMinimo !== undefined) data.stockMinimo = Number(stockMinimo);

    const producto = await prisma.producto.update({
      where: { id: Number(id) },
      data
    });
    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar producto (soft delete)
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

// Actualizar precios según nueva tasa de dólar
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

    const productosUSD = await prisma.producto.findMany({
      where: { moneda: 'USD' }
    });

    for (const p of productosUSD) {
      await prisma.producto.update({
        where: { id: p.id },
        data: {
          costoLocal: Number(p.costoUsd) * Number(tasaDolar),
          precioVenta: Number(p.precioVentaUsd || 0) * Number(tasaDolar)
        }
      });
    }

    res.json({ message: 'Precios actualizados según nueva tasa' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar precio de un producto (precio o margen)
exports.actualizarPrecioProducto = async (req, res) => {
  const { id } = req.params;
  const { precioVenta, precioVentaUsd, margen } = req.body;

  try {
    const producto = await prisma.producto.findUnique({ where: { id: Number(id) } });
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

    const tasa = await getTasaDolar();
    let nuevoPrecioLocal = Number(producto.precioVenta);
    let nuevoPrecioUsd = Number(producto.precioVentaUsd || 0);

    // 1. Si viene precioVenta (BS), usarlo directamente
    if (precioVenta !== undefined) {
      nuevoPrecioLocal = Number(precioVenta);
      nuevoPrecioUsd = nuevoPrecioLocal / tasa;
    }
    // 2. Si viene precioVentaUsd, usarlo
    else if (precioVentaUsd !== undefined) {
      nuevoPrecioUsd = Number(precioVentaUsd);
      nuevoPrecioLocal = nuevoPrecioUsd * tasa;
    }
    // 3. Si solo viene margen, calcular con costo (si costo 0, no hacer nada)
    else if (margen !== undefined) {
      const m = Number(margen);
      const costo = Number(producto.costoLocal) || 0;
      if (costo > 0) {
        nuevoPrecioLocal = costo * (1 + m / 100);
        nuevoPrecioUsd = nuevoPrecioLocal / tasa;
      }
    }

    const actualizado = await prisma.producto.update({
      where: { id: Number(id) },
      data: {
        precioVenta: nuevoPrecioLocal,
        precioVentaUsd: nuevoPrecioUsd
      }
    });

    res.json(actualizado);
  } catch (error) {
    console.error('Error en actualizarPrecioProducto:', error);
    res.status(500).json({ error: error.message });
  }
};