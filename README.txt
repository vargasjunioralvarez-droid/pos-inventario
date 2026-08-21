SISTEMA POS-INVENTARIO
=======================

REQUISITOS PREVIOS:
1. Node.js LTS instalado (https://nodejs.org/)
2. PostgreSQL instalado (https://www.postgresql.org/)

CONFIGURACION:
1. Cree la base de datos en PostgreSQL:
   - Abra pgAdmin o psql
   - Ejecute:
     CREATE DATABASE pos_inventario;
     CREATE USER pos_user WITH PASSWORD 'su_contraseña';
     GRANT ALL PRIVILEGES ON DATABASE pos_inventario TO pos_user;

2. Edite el archivo backen/.env:
   DATABASE_URL="postgresql://pos_user:su_contraseña@localhost:5432/pos_inventario?schema=public"

3. Edite el archivo frontend/.env:
   VITE_API_URL=http://localhost:4000/api

INSTALACION:
- Ejecute INSTALAR.bat (doble clic)

INICIO:
- Ejecute INICIAR.bat (doble clic)
- Abra el navegador en http://localhost:5174/

USUARIO ADMIN POR DEFECTO:
- Usuario: admin
- Contraseña: admin123


📋 Resumen final
Componente	Tecnología
Frontend	React + Vite
Backend	Node.js + Express
Base de datos	PostgreSQL
ORM	Prisma
Autenticación	JWT + bcryptjs
Estilos	CSS puro
Comunicación	Axios + API REST

pos-inventario/
├── backen/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── compraController.js
│   │   │   ├── conteoController.js
│   │   │   ├── parametroController.js
│   │   │   ├── productoController.js
│   │   │   ├── proveedorController.js
│   │   │   ├── reporteController.js
│   │   │   └── ventaController.js
│   │   ├── middlewares/
│   │   │   └── auth.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── compras.js
│   │   │   ├── conteos.js
│   │   │   ├── parametros.js
│   │   │   ├── productos.js
│   │   │   ├── proveedores.js
│   │   │   ├── reportes.js
│   │   │   └── ventas.js
│   │   └── utils/
│   │       └── jwt.js
│   │   └── index.js
│   ├── .env
│   ├── package.json
│   └── seed.js
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── CambioPrecio.jsx
    │   │   ├── Compras.jsx
    │   │   ├── Login.jsx
    │   │   ├── Parametros.jsx
    │   │   ├── Productos.jsx
    │   │   ├── Proveedores.jsx
    │   │   ├── Registro.jsx
    │   │   ├── Reportes.jsx
    │   │   ├── ReporteVentas.jsx
    │   │   ├── TomaInventario.jsx
    │   │   └── Ventas.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env
    ├── package.json
    └── vite.config.js