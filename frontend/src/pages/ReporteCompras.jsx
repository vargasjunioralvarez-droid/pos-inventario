import { useEffect, useState } from 'react';
import api from '../services/api';

export default function ReporteCompras() {
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().slice(0, 10));
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().slice(0, 10));
  const [proveedores, setProveedores] = useState([]);
  const [proveedorId, setProveedorId] = useState('');
  const [tipoPago, setTipoPago] = useState('');
  const [compras, setCompras] = useState([]);
  const [modalDetalles, setModalDetalles] = useState(null);

  const cargarProveedores = async () => {
    try {
      const res = await api.get('/proveedores');
      setProveedores(res.data);
    } catch (error) {
      console.error('Error al cargar proveedores', error);
    }
  };

  const consultar = async () => {
    try {
      const res = await api.get('/compras/reporte', {
        params: { fechaInicio, fechaFin, proveedorId, tipoPago }
      });
      setCompras(res.data);
    } catch (error) {
      console.error('Error al consultar compras', error);
    }
  };

  useEffect(() => {
    cargarProveedores();
    consultar();
  }, []);

  const totalContado = compras.filter(c => c.tipoPago === 'CONTADO').reduce((s, c) => s + Number(c.total), 0);
  const totalCredito = compras.filter(c => c.tipoPago === 'CREDITO').reduce((s, c) => s + Number(c.total), 0);
  const totalGeneral = totalContado + totalCredito;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px' }}>
      <div className="page-title">
        <h1>📦 Reporte de Compras</h1>
      </div>

      <div className="card">
        <div className="flex gap-10 flex-wrap items-center">
          <label>Desde:</label>
          <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
          <label>Hasta:</label>
          <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
          <select value={proveedorId} onChange={e => setProveedorId(e.target.value)}>
            <option value="">Todos los proveedores</option>
            {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
          <select value={tipoPago} onChange={e => setTipoPago(e.target.value)}>
            <option value="">Todos</option>
            <option value="CONTADO">Contado</option>
            <option value="CREDITO">Crédito</option>
          </select>
          <button className="btn btn-primary" onClick={consultar}>Consultar</button>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div><strong>Total Contado:</strong> {totalContado.toFixed(2)} Bs</div>
          <div><strong>Total Crédito:</strong> {totalCredito.toFixed(2)} Bs</div>
          <div><strong>Total General:</strong> {totalGeneral.toFixed(2)} Bs</div>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Proveedor</th>
              <th>Factura</th>
              <th>Tipo Pago</th>
              <th>Total BS</th>
              <th>Total USD</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {compras.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{new Date(c.fecha).toLocaleString()}</td>
                <td>{c.proveedor?.nombre || 'N/A'}</td>
                <td>{c.numeroFactura || '-'}</td>
                <td>{c.tipoPago || 'CONTADO'}</td>
                <td>{Number(c.total).toFixed(2)}</td>
                <td>{c.totalUsd ? Number(c.totalUsd).toFixed(2) : '-'}</td>
                <td>
                  <button className="btn btn-primary" onClick={() => setModalDetalles(c)}>Ver Detalles</button>
                </td>
              </tr>
            ))}
            {compras.length === 0 && (
              <tr><td colSpan="8">No hay compras para el filtro seleccionado</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modalDetalles && (
        <div className="modal-overlay" onClick={() => setModalDetalles(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
            <h3>Detalles de Compra #{modalDetalles.id}</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cant.</th>
                  <th>Costo Unit.</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {modalDetalles.detalles.map(d => (
                  <tr key={d.id}>
                    <td>{d.producto?.nombre}</td>
                    <td>{Number(d.cantidad).toFixed(2)}</td>
                    <td>{Number(d.costoLocal).toFixed(2)}</td>
                    <td>{(Number(d.cantidad) * Number(d.costoLocal)).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn btn-secondary" onClick={() => setModalDetalles(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}