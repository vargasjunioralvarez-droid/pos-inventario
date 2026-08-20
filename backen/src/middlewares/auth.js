const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_super_segura';

// Middleware para verificar token
exports.verificarToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuarioId = decoded.id;
    req.usuarioRol = decoded.rol;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

// Middleware para verificar rol
exports.verificarRol = (rolRequerido) => {
  return (req, res, next) => {
    if (req.usuarioRol !== rolRequerido) {
      return res.status(403).json({ error: 'No tiene permisos para esta acción' });
    }
    next();
  };
};