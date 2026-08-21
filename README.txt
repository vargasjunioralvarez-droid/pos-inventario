@"
# 📦 Sistema POS-Inventario

Sistema de Punto de Venta y Control de Inventarios desarrollado con **Node.js**, **Express**, **Prisma**, **PostgreSQL** y **React + Vite**.

## 🚀 Funcionalidades

- 🔐 **Autenticación de usuarios** con roles (Admin y Vendedor).
- 📦 **Gestión de Productos** con buscador, edición, eliminación y unidades por bulto.
- 🏢 **Proveedores** con CRUD completo.
- 🛒 **Compras** con detalle de bultos, unidades, costos en BS y USD, IVA, tipo de pago.
- 🧾 **Punto de Venta** con precios diferenciados para contado y fiado.
- 📋 **Toma de Inventario** con conteos, diferencias y ajustes.
- 💵 **Cambio de Precio** con márgenes y precios en dólares y bolívares.
- 📊 **Reportes** de ventas, compras e inventario con totales en BS y USD.
- ⚙️ **Parámetros** para la tasa del dólar.
- 👥 **Usuarios** con roles y control de acceso.

## 🛠️ Tecnologías

| Componente     | Tecnología           |
|----------------|----------------------|
| Frontend       | React + Vite         |
| Backend        | Node.js + Express    |
| Base de datos  | PostgreSQL           |
| ORM            | Prisma               |
| Autenticación  | JWT + bcryptjs       |
| Estilos        | CSS puro             |
| Comunicación   | Axios + API REST     |

## 📁 Estructura del Proyecto

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
│   │   ├── utils/
│   │   │   └── jwt.js
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
    │   │   ├── Inicio.jsx
    │   │   ├── Login.jsx
    │   │   ├── Parametros.jsx
    │   │   ├── Productos.jsx
    │   │   ├── Proveedores.jsx
    │   │   ├── Registro.jsx
    │   │   ├── Reportes.jsx
    │   │   ├── ReporteCompras.jsx
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

## 🔧 Requisitos Previos

1. Node.js LTS (https://nodejs.org/)
2. PostgreSQL (https://www.postgresql.org/)

## ⚙️ Configuración

### 1. Crear base de datos

CREATE DATABASE pos_inventario;
CREATE USER pos_user WITH PASSWORD 'su_contraseña';
GRANT ALL PRIVILEGES ON DATABASE pos_inventario TO pos_user;

### 2. Editar backen/.env

DATABASE_URL="postgresql://pos_user:su_contraseña@localhost:5432/pos_inventario?schema=public"

### 3. Editar frontend/.env

VITE_API_URL=http://localhost:4000/api

## 💻 Instalación

cd backen
npm install
npx prisma migrate dev
node seed.js

cd frontend
npm install

## ▶️ Inicio

cd backen
npm run dev

cd frontend
npm run dev

Abre http://localhost:5174

O usa INSTALAR.bat e INICIAR.bat

## 👤 Usuario Admin por Defecto

- Usuario: Admin
- Contraseña: admin123

## ☁️ Despliegue en Render

1. Subir a GitHub.
2. Crear cuenta en Render.
3. Conectar repositorio.
4. Crear PostgreSQL.
5. Crear Web Service para backend.
6. Crear Static Site para frontend.
7. Configurar variables de entorno.
8. Aplicar migraciones y seed.

## 📌 Notas

- El vendedor solo accede a Ventas.
- El admin tiene acceso a todo.
- Los precios se manejan en USD y BS según la tasa configurada.
"@ | Out-File -FilePath README.md -Encoding UTF8