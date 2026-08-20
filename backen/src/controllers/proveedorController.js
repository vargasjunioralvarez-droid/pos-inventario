const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener todos los proveedores
exports.getProveedores = async (req, res) => {
  try {
    const proveedores = await prisma.proveedor.findMany();
    res.json(proveedores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear un nuevo proveedor
exports.createProveedor = async (req, res) => {
  try {
    const { nombre, ruc, telefono, email, direccion } = req.body;
    const proveedor = await prisma.proveedor.create({
      data: { nombre, ruc, telefono, email, direccion }
    });
    res.status(201).json(proveedor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un proveedor
exports.updateProveedor = async (req, res) => {
  const { id } = req.params;
  try {
    const proveedor = await prisma.proveedor.update({
      where: { id: Number(id) },
      data: req.body
    });
    res.json(proveedor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un proveedor
exports.deleteProveedor = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.proveedor.delete({
      where: { id: Number(id) }
    });
    res.json({ message: 'Proveedor eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};