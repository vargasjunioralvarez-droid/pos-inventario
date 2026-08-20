import { useEffect, useState } from 'react';
import api from '../services/api';

export default function ReporteVentas() {
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().slice(0, 10));
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().slice(0, 10));
  const [metodoPago, setMetodoPago] = useState('');
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

  const totalContado = ventas.filter(v => v.metodoPago === 'CONTADO').reduce((s, v) => s + Number(v.total), 0);
  const totalFiado = ventas.filter(v => v.metodoPago === 'FIADO').reduce((s, v) => s + Number(v.total), 0);
  const totalGeneral = totalContado + totalFiado;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <div className="page-title">
        <h1>📊 Reporte de Ventas</h1>
      </div>

      <div className="card">
        <div className="flex gap-10 flex-wrap">
          <label>Desde:</label>
          <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
          <label>Hasta:</label>
          <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
          <select value={metodoPago} onChange={e => setMetodoPago(e.target.value)}>
            <option value="">Todos</option>
            <option value="CONTADO">Contado</option>
            <option value="FIADO">Fiado</option>
          </select>
          <button className="btn btn-primary" onClick={consultar}>Consultar</button>
        </div>
      </div>

      <div className="card">
        <h2>Resumen</h2>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div><strong>Total Contado:</strong> {totalContado.toFixed(2)} Bs</div>
          <div><strong>Total Fiado:</strong> {totalFiado.toFixed(2)} Bs</div>
          <div><strong>Total General:</strong> {totalGeneral.toFixed(2)} Bs</div>
        </div>
      </div>

      <div className="card">
        <h2>Ventas</h2>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Método</th>
              <th>Total</th>
              <th>Detalles</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map(v => (
              <tr key={v.id}>
                <td>{v.id}</td>
                <td>{new Date(v.fecha).toLocaleString()}</td>
                <td>{v.cliente || '-'}</td>
                <td>{v.metodoPago}</td>
                <td>{Number(v.total).toFixed(2)}</td>
                <td>
                  <ul style={{ margin: 0, paddingLeft: 15 }}>
                    {v.detalles.map(d => (
                      <li key={d.id}>{d.producto?.nombre}: {d.cantidad} x {d.precioVenta}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}