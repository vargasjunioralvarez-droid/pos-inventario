const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_super_segura';

exports.generarToken = (usuario) => {
  return jwt.sign(
    { id: usuario.id, rol: usuario.rol },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
};