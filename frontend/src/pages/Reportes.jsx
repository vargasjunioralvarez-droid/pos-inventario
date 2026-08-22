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

  const totalVentas = datos.reduce((s, item) => s + (Number(item.totalVenta) || 0), 0);
  const totalCosto = datos.reduce((s, item) => s + (Number(item.costoUnitario) * Number(item.ventas)), 0);
  const totalGanancia = totalVentas - totalCosto;
  const totalPerdida = datos.reduce((s, item) => s + Number(item.perdidaBs), 0);

  const porcentajeGanancia = totalVentas > 0 ? ((totalGanancia * 100) / totalVentas).toFixed(2) : '0.00';
  const porcentajePerdida = totalVentas > 0 ? ((totalPerdida * 100) / totalVentas).toFixed(2) : '0.00';

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
          <table className="table" style={{ width: '100%', fontSize: '12px' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Código</th>
                <th style={{ textAlign: 'left' }}>Producto</th>
                <th style={{ textAlign: 'right' }}>Inv. Inicial</th>
                <th style={{ textAlign: 'right' }}>Compras</th>
                <th style={{ textAlign: 'right' }}>Ventas Contado</th>
                <th style={{ textAlign: 'right' }}>Ventas Fiado</th>
                <th style={{ textAlign: 'right' }}>Ventas Totales</th>
                <th style={{ textAlign: 'right' }}>Inv. Final</th>
                <th style={{ textAlign: 'right' }}>Inventario Físico</th>
                <th style={{ textAlign: 'right' }}>Diferencia</th>
                <th style={{ textAlign: 'right' }}>Pérdida (Unid.)</th>
                <th style={{ textAlign: 'right' }}>Costo Unit.</th>
                <th style={{ textAlign: 'right' }}>Precio Venta</th>
                <th style={{ textAlign: 'right' }}>% Ganan.</th>
                <th style={{ textAlign: 'right' }}>Ganancia Total</th>
                <th style={{ textAlign: 'right' }}>Total Venta</th>
                <th style={{ textAlign: 'right' }}>Total Pérdida</th>
              </tr>
            </thead>
            <tbody>
              {datos.map(item => (
                <tr key={item.productoId}>
                  <td style={{ textAlign: 'left' }}>{item.codigo}</td>
                  <td style={{ textAlign: 'left' }}>{item.nombre}</td>
                  <td style={{ textAlign: 'right' }}>{Number(item.inventarioInicial).toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>{Number(item.compras).toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>{Number(item.ventasContado || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>{Number(item.ventasFiado || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>{Number(item.ventas || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>{Number(item.inventarioFinal).toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>{Number(item.inventarioFisico).toFixed(2)}</td>
                  <td className={item.diferencia >= 0 ? 'text-warning' : 'text-success'} style={{ textAlign: 'right' }}>
                    {Number(item.diferencia).toFixed(2)}
                  </td>
                  <td className="text-danger" style={{ textAlign: 'right' }}>{Number(item.perdida).toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>{Number(item.costoUnitario).toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>{Number(item.precioVenta).toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>
                    {Number(item.costoUnitario) > 0
                      ? (((Number(item.precioVenta) - Number(item.costoUnitario)) / Number(item.costoUnitario)) * 100).toFixed(2) + '%'
                      : '0%'}
                  </td>
                  <td className={item.gananciaTotal >= 0 ? 'text-success' : 'text-danger'} style={{ textAlign: 'right' }}>
                    {Number(item.gananciaTotal).toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right' }}>{Number(item.totalVenta).toFixed(2)}</td>
                  <td className="text-danger" style={{ textAlign: 'right' }}>{Number(item.perdidaBs).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {datos.length > 0 && (
        <div className="card" style={{ maxWidth: '450px' }}>
          <h2>Totales</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '5px' }}>
              <span>Total Venta:</span>
              <strong>{totalVentas.toFixed(2)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '5px' }}>
              <span>Total Costo:</span>
              <strong>{totalCosto.toFixed(2)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '5px' }}>
              <span>Total Ganancia:</span>
              <strong style={{ color: totalGanancia >= 0 ? '#10b981' : '#ef4444' }}>
                {totalGanancia.toFixed(2)} ({porcentajeGanancia}%)
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Pérdida:</span>
              <strong style={{ color: '#ef4444' }}>
                {totalPerdida.toFixed(2)} ({porcentajePerdida}%)
              </strong>
            </div>
          </div>
        </div>
      )}

      {datos.length === 0 && !cargando && !error && (
        <p>No hay datos para mostrar. Seleccione un rango y haga clic en Consultar.</p>
      )}
    </div>
  );
}