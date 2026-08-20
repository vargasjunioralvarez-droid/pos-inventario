const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener parámetro (tasa de dólar)
exports.getParametro = async (req, res) => {
  try {
    const parametro = await prisma.parametro.findUnique({ where: { id: 1 } });
    if (!parametro) return res.status(404).json({ error: 'Parámetro no encontrado' });
    res.json(parametro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear o actualizar parámetro (solo tasa de dólar y moneda local)
exports.upsertParametro = async (req, res) => {
  const { tasaDolar, monedaLocal } = req.body;
  try {
    const parametro = await prisma.parametro.upsert({
      where: { id: 1 },
      update: {
        tasaDolar: Number(tasaDolar),
        monedaLocal: monedaLocal || 'BS'
      },
      create: {
        id: 1,
        tasaDolar: Number(tasaDolar),
        monedaLocal: monedaLocal || 'BS'
      }
    });
    res.json(parametro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};