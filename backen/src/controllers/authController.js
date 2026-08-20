const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const { generarToken } = require('../utils/jwt');

// Registrar usuario (solo admin)
exports.registrar = async (req, res) => {
  const { nombre, password, rol } = req.body;

  if (!nombre || !password) {
    return res.status(400).json({ error: 'Nombre y contraseña son obligatorios' });
  }

  try {
    const existente = await prisma.usuario.findUnique({ where: { nombre } });
    if (existente) {
      return res.status(400).json({ error: 'El nombre de usuario ya existe' });
    }

    const hash = await bcrypt.hash(password, 10);
    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        password: hash,
        rol: rol || 'VENDEDOR'
      }
    });
    res.status(201).json({ mensaje: 'Usuario creado correctamente', id: usuario.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login (ahora con nombre en lugar de email)
exports.login = async (req, res) => {
  const { nombre, password } = req.body;

  if (!nombre || !password) {
    return res.status(400).json({ error: 'Nombre y contraseña son obligatorios' });
  }

  try {
    const usuario = await prisma.usuario.findUnique({ where: { nombre } });
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = generarToken(usuario);
    res.json({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        rol: usuario.rol
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los usuarios
exports.getUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        rol: true,
        activo: true,
        fechaCreacion: true
      }
    });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un usuario (nombre, rol, activo)
exports.updateUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, rol, activo } = req.body;

  try {
    const data = {};
    if (nombre !== undefined) data.nombre = nombre;
    if (rol !== undefined) data.rol = rol;
    if (activo !== undefined) data.activo = activo;

    const usuario = await prisma.usuario.update({
      where: { id: Number(id) },
      data,
      select: { id: true, nombre: true, rol: true, activo: true }
    });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};