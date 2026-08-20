import { useState } from 'react';
import api from '../services/api';

export default function Reportes() {
  const [fechaInicio, setFechaInicio] = useState('2026-01-01');
  const [fechaFin, setFechaFin] = useState('2026-12-31');
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const consultar = async () => {
    if (!fechaInicio || !fechaFin) {
      alert('Seleccione ambas fechas');
      return;
    }
    setCargando(true);
    setError('');
    try {
      const res = await api.get('/reportes/inventario', {
        params: { fechaInicio, fechaFin }
      });
      setDatos(res.data);
    } catch (err) {
      setError('No se pudo cargar el reporte');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div>
      <div className="page-title">
        <h1>📊 Reportes de Inventario y Ganancias</h1>
      </div>

      <div className="card">
        <div className="flex gap-10 items-center flex-wrap">
          <label>Desde:</label>
          <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
          <label>Hasta:</label>
          <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
          <button className="btn btn-primary" onClick={consultar}>Consultar</button>
        </div>
      </div>

      {cargando && <p>Cargando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {datos.length > 0 && (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Inv. Inicial</th>
                <th>Compras</th>
                <th>Ventas Contado</th>
                <th>Ventas Fiado</th>
                <th>Ventas Totales</th>
                <th>Inv. Final</th>
                <th>Inventario Físico</th>
                <th>Diferencia</th>
                <th>Pérdida</th>
                <th>Costo Unit.</th>
                <th>Precio Venta</th>
                <th>Ganancia Unit.</th>
                <th>Ganancia Total</th>
              </tr>
            </thead>
            <tbody>
              {datos.map(item => (
                <tr key={item.productoId}>
                  <td>{item.codigo}</td>
                  <td>{item.nombre}</td>
                  <td>{Number(item.inventarioInicial).toFixed(2)}</td>
                  <td>{Number(item.compras).toFixed(2)}</td>
                  <td>{Number(item.ventasContado || 0).toFixed(2)}</td>
                  <td>{Number(item.ventasFiado || 0).toFixed(2)}</td>
                  <td>{Number(item.ventas || 0).toFixed(2)}</td>
                  <td>{Number(item.inventarioFinal).toFixed(2)}</td>
                  <td>{Number(item.inventarioFisico).toFixed(2)}</td>
                  <td className={item.diferencia >= 0 ? 'text-warning' : 'text-success'}>
                    {Number(item.diferencia).toFixed(2)}
                  </td>
                  <td className="text-danger">{Number(item.perdida).toFixed(2)}</td>
                  <td>{Number(item.costoUnitario).toFixed(2)}</td>
                  <td>{Number(item.precioVenta).toFixed(2)}</td>
                  <td className={item.gananciaUnitaria >= 0 ? 'text-success' : 'text-danger'}>
                    {Number(item.gananciaUnitaria).toFixed(2)}
                  </td>
                  <td className={item.gananciaTotal >= 0 ? 'text-success' : 'text-danger'}>
                    {Number(item.gananciaTotal).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {datos.length === 0 && !cargando && !error && (
        <p>No hay datos para mostrar. Seleccione un rango y haga clic en Consultar.</p>
      )}
    </div>
  );
}