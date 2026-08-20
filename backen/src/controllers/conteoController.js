const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Crear un nuevo conteo
exports.crearConteo = async (req, res) => {
  const { usuario, semana, fechaInicio, fechaFin } = req.body;
  try {
    const conteo = await prisma.conteoInventario.create({
      data: {
        usuario: usuario || 'admin',
        semana: semana || null,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : null,
        fechaFin: fechaFin ? new Date(fechaFin) : null,
        estado: 'ABIERTO'
      }
    });
    res.status(201).json(conteo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los conteos
exports.getConteos = async (req, res) => {
  try {
    const conteos = await prisma.conteoInventario.findMany({
      include: { detalles: { include: { producto: true } } }
    });
    res.json(conteos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un conteo por ID
exports.getConteoById = async (req, res) => {
  const { id } = req.params;
  try {
    const conteo = await prisma.conteoInventario.findUnique({
      where: { id: Number(id) },
      include: { detalles: { include: { producto: true } } }
    });
    if (!conteo) return res.status(404).json({ error: 'Conteo no encontrado' });
    res.json(conteo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar datos básicos del conteo
exports.updateConteo = async (req, res) => {
  const { id } = req.params;
  const { usuario, semana, fechaInicio, fechaFin } = req.body;
  try {
    const conteo = await prisma.conteoInventario.update({
      where: { id: Number(id) },
      data: {
        usuario: usuario !== undefined ? usuario : undefined,
        semana: semana !== undefined ? semana : undefined,
        fechaInicio: fechaInicio !== undefined ? new Date(fechaInicio) : undefined,
        fechaFin: fechaFin !== undefined ? new Date(fechaFin) : undefined
      }
    });
    res.json(conteo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Agregar o actualizar detalle de conteo
exports.upsertDetalleConteo = async (req, res) => {
  const { id } = req.params;
  const { productoId, cantidadContada } = req.body;

  if (!productoId || cantidadContada === undefined) {
    return res.status(400).json({ error: 'Debe indicar productoId y cantidadContada' });
  }

  try {
    const conteo = await prisma.conteoInventario.findUnique({ where: { id: Number(id) } });
    if (!conteo) return res.status(404).json({ error: 'Conteo no encontrado' });
    if (conteo.estado !== 'ABIERTO') return res.status(400).json({ error: 'El conteo ya está cerrado' });

    const producto = await prisma.producto.findUnique({ where: { id: Number(productoId) } });
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

    const cantidadSistema = Number(producto.stockActual);
    const detalleExistente = await prisma.detalleConteo.findFirst({
      where: { conteoId: Number(id), productoId: Number(productoId) }
    });

    if (detalleExistente) {
      const detalle = await prisma.detalleConteo.update({
        where: { id: detalleExistente.id },
        data: {
          cantidadContada: Number(cantidadContada),
          cantidadSistema,
          diferencia: Number(cantidadContada) - cantidadSistema
        }
      });
      res.json(detalle);
    } else {
      const detalle = await prisma.detalleConteo.create({
        data: {
          conteoId: Number(id),
          productoId: Number(productoId),
          cantidadSistema,
          cantidadContada: Number(cantidadContada),
          diferencia: Number(cantidadContada) - cantidadSistema
        }
      });
      res.status(201).json(detalle);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cerrar conteo y aplicar ajustes
exports.cerrarConteo = async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await prisma.$transaction(async (tx) => {
      const conteo = await tx.conteoInventario.findUnique({
        where: { id: Number(id) },
        include: { detalles: true }
      });
      if (!conteo) throw new Error('Conteo no encontrado');
      if (conteo.estado !== 'ABIERTO') throw new Error('El conteo ya está cerrado');

      for (const detalle of conteo.detalles) {
        const producto = await tx.producto.findUnique({ where: { id: detalle.productoId } });
        if (!producto) continue;

        const cantidadSistema = Number(producto.stockActual);
        const cantidadContada = Number(detalle.cantidadContada);
        const diferencia = cantidadContada - cantidadSistema;

        await tx.producto.update({
          where: { id: detalle.productoId },
          data: { stockActual: cantidadContada }
        });

        await tx.movimientoInventario.create({
          data: {
            productoId: detalle.productoId,
            tipo: 'AJUSTE',
            cantidad: diferencia,
            costoUnitario: producto.costoLocal || 0,
            referenciaId: conteo.id
          }
        });

        await tx.detalleConteo.update({
          where: { id: detalle.id },
          data: { cantidadSistema, diferencia }
        });
      }

      await tx.conteoInventario.update({
        where: { id: Number(id) },
        data: { estado: 'CERRADO' }
      });

      return { message: 'Conteo cerrado y ajustes aplicados' };
    });

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un conteo completo (solo abierto)
exports.deleteConteo = async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await prisma.$transaction(async (tx) => {
      const conteo = await tx.conteoInventario.findUnique({
        where: { id: Number(id) },
        include: { detalles: true }
      });
      if (!conteo) throw new Error('Conteo no encontrado');
      if (conteo.estado !== 'ABIERTO') throw new Error('Solo se pueden eliminar conteos abiertos');

      if (conteo.detalles.length > 0) {
        await tx.detalleConteo.deleteMany({ where: { conteoId: Number(id) } });
      }
      await tx.conteoInventario.delete({ where: { id: Number(id) } });
      return { message: 'Conteo eliminado correctamente' };
    });

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un detalle de un conteo abierto
exports.deleteDetalleConteo = async (req, res) => {
  const { id, detalleId } = req.params;
  try {
    const conteo = await prisma.conteoInventario.findUnique({ where: { id: Number(id) } });
    if (!conteo) return res.status(404).json({ error: 'Conteo no encontrado' });
    if (conteo.estado !== 'ABIERTO') return res.status(400).json({ error: 'No se puede eliminar un detalle de un conteo cerrado' });

    const detalle = await prisma.detalleConteo.findFirst({
      where: { id: Number(detalleId), conteoId: Number(id) }
    });
    if (!detalle) return res.status(404).json({ error: 'Detalle no encontrado' });

    await prisma.detalleConteo.delete({ where: { id: detalle.id } });
    res.json({ message: 'Detalle eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};