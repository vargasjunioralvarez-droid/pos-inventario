import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import Productos from './pages/Productos';
import Proveedores from './pages/Proveedores';
import Compras from './pages/Compras';
import Ventas from './pages/Ventas';
import TomaInventario from './pages/TomaInventario';
import Reportes from './pages/Reportes';
import Parametros from './pages/Parametros';
import CambioPrecio from './pages/CambioPrecio';
import Login from './pages/Login';
import Registro from './pages/Registro';
import ReporteVentas from './pages/ReporteVentas';
import ReporteCompras from './pages/ReporteCompras';
import Inicio from './pages/Inicio';

function RutaProtegida({ children, soloAdmin = false }) {
  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (soloAdmin && usuario.rol !== 'ADMIN') {
    return <Navigate to="/ventas" replace />;
  }
  return children;
}

function App() {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  return (
    <BrowserRouter>
      {window.location.pathname !== '/login' && (
        <nav className="navbar">
          {usuario.rol === 'ADMIN' ? (
            <>
              <Link to="/">Inicio</Link>
              <Link to="/productos">Productos</Link>
              <Link to="/proveedores">Proveedores</Link>
              <Link to="/compras">Compras</Link>
              <Link to="/ventas">Ventas</Link>
              <Link to="/toma-inventario">Toma Inventario</Link>
              <Link to="/cambio-precio">Cambio Precio</Link>
              <Link to="/reportes">Reportes</Link>
              <Link to="/reporte-ventas">Reporte Ventas</Link>
              <Link to="/reporte-compras">Reporte Compras</Link>
              <Link to="/parametros">Parámetros</Link>
              <Link to="/registro">Usuarios</Link>
            </>
          ) : (
            <>
              <Link to="/ventas">Ventas</Link>
            </>
          )}
          <button onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            window.location.href = '/login';
          }}>
            Cerrar Sesión
          </button>
        </nav>
      )}
      <div className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RutaProtegida><Navigate to={usuario.rol === 'VENDEDOR' ? '/ventas' : '/inicio'} replace /></RutaProtegida>} />
          <Route path="/inicio" element={<RutaProtegida><Inicio /></RutaProtegida>} />
          <Route path="/ventas" element={<RutaProtegida><Ventas /></RutaProtegida>} />
          <Route path="/productos" element={<RutaProtegida soloAdmin><Productos /></RutaProtegida>} />
          <Route path="/proveedores" element={<RutaProtegida soloAdmin><Proveedores /></RutaProtegida>} />
          <Route path="/compras" element={<RutaProtegida soloAdmin><Compras /></RutaProtegida>} />
          <Route path="/toma-inventario" element={<RutaProtegida soloAdmin><TomaInventario /></RutaProtegida>} />
          <Route path="/cambio-precio" element={<RutaProtegida soloAdmin><CambioPrecio /></RutaProtegida>} />
          <Route path="/reportes" element={<RutaProtegida soloAdmin><Reportes /></RutaProtegida>} />
          <Route path="/reporte-ventas" element={<RutaProtegida soloAdmin><ReporteVentas /></RutaProtegida>} />
          <Route path="/reporte-compras" element={<RutaProtegida soloAdmin><ReporteCompras /></RutaProtegida>} />
          <Route path="/parametros" element={<RutaProtegida soloAdmin><Parametros /></RutaProtegida>} />
          <Route path="/registro" element={<RutaProtegida soloAdmin><Registro /></RutaProtegida>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;