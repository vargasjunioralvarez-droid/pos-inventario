// seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function crearAdmin() {
  const hash = await bcrypt.hash('admin123', 10);
  await prisma.usuario.create({
    data: {
      nombre: 'Admin',
      email: 'admin@example.com',
      password: hash,
      rol: 'ADMIN'
    }
  });
  console.log('Admin creado');
  process.exit();
}
crearAdmin();