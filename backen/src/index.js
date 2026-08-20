const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const { verificarToken } = require('./middlewares/auth');

dotenv.config();
const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API POS-Inventario' });
});

app.use('/api/productos', require('./routes/productos'));
app.use('/api/proveedores', require('./routes/proveedores'));
app.use('/api/compras', require('./routes/compras'));
app.use('/api/ventas', require('./routes/ventas'));
app.use('/api/conteos', require('./routes/conteos'));
app.use('/api/reportes', require('./routes/reportes'));
app.use('/api/parametros', require('./routes/parametros'));
app.use('/api/auth', require('./routes/auth'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});