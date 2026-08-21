const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function crearAdmin() {
  try {
    // Verificar si ya existe
    const existente = await prisma.usuario.findUnique({
      where: { nombre: 'Admin' }
    });

    if (existente) {
      console.log('El usuario Admin ya existe.');
      process.exit(0);
    }

    const hash = await bcrypt.hash('admin123', 10);
    await prisma.usuario.create({
      data: {
        nombre: 'Admin',
        password: hash,
        rol: 'ADMIN'
      }
    });
    console.log('Admin creado correctamente.');
    console.log('Usuario: Admin');
    console.log('Contraseña: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Error al crear admin:', error);
    process.exit(1);
  }
}

crearAdmin();