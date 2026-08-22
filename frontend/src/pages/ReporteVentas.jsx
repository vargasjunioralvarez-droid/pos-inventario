import { useEffect, useState } from 'react';
import api from '../services/api';

export default function ReporteVentas() {
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().slice(0, 10));
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().slice(0, 10));
  const [metodoPago, setMetodoPago] = useState('');
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [ventas, setVentas] = useState([]);

  const consultar = async () => {
    try {
      const res = await api.get('/ventas/reporte', {
        params: { fechaInicio, fechaFin, metodoPago }
      });
      setVentas(res.data);
    } catch (error) {
      console.error('Error al consultar reporte', error);
    }
  };

  useEffect(() => {
    consultar();
  }, []);

  const ventasFiltradas = ventas.filter(v =>
    (v.cliente || '').toLowerCase().includes(terminoBusqueda.toLowerCase())
  );

  const totalBs = ventasFiltradas.reduce((s, v) => s + Number(v.total), 0);

  const marcarPagado = async (id, pagado) => {
    try {
      await api.put(`/ventas/${id}/pago`, { pagado });
      consultar();
    } catch (error) {
      console.error('Error al actualizar pago', error);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px' }}>
      <div className="page-title">
        <h1>📊 Reporte de Ventas</h1>
      </div>

      <div className="card">
        <div className="flex gap-10 flex-wrap items-center">
          <label>Desde:</label>
          <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
          <label>Hasta:</label>
          <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
          <select value={metodoPago} onChange={e => setMetodoPago(e.target.value)}>
            <option value="">Todos</option>
            <option value="CONTADO">Contado</option>
            <option value="FIADO">Fiado</option>
          </select>
          <input
            type="text"
            placeholder="Buscar por cliente..."
            value={terminoBusqueda}
            onChange={e => setTerminoBusqueda(e.target.value)}
            style={{ padding: '8px', width: '200px' }}
          />
          <button className="btn btn-primary" onClick={consultar}>Consultar</button>
        </div>
      </div>

      <div className="card">
        <h2>Resumen</h2>
        <div><strong>Total BS:</strong> {totalBs.toFixed(2)}</div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Método</th>
              <th>Total BS</th>
              <th>Total USD</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {ventasFiltradas.map(v => {
              const tasaVenta = Number(v.tasaDolar) || 0;
              const totalUsd = tasaVenta > 0 ? Number(v.total) / tasaVenta : 0;
              return (
                <tr key={v.id}>
                  <td>{v.id}</td>
                  <td>{new Date(v.fecha).toLocaleString()}</td>
                  <td>{v.cliente || '-'}</td>
                  <td>{v.metodoPago}</td>
                  <td>{Number(v.total).toFixed(2)}</td>
                  <td>{tasaVenta > 0 ? `$${totalUsd.toFixed(2)}` : '-'}</td>
                  <td>{v.pagado ? 'Pagado' : 'Pendiente'}</td>
                  <td>
                    {v.metodoPago === 'FIADO' && (
                      <button
                        className="btn"
                        style={{ background: v.pagado ? '#10b981' : '#f59e0b', color: 'white' }}
                        onClick={() => marcarPagado(v.id, !v.pagado)}
                      >
                        {v.pagado ? 'Pagado' : 'Marcar Pagado'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {ventasFiltradas.length === 0 && (
              <tr><td colSpan="8">No hay ventas para el filtro</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}