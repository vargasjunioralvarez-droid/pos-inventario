import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Compras() {
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [compras, setCompras] = useState([]);
  const [proveedorId, setProveedorId] = useState('');
  const [numeroFactura, setNumeroFactura] = useState('');
  const [conIva, setConIva] = useState(false);
  const [porcentajeIva, setPorcentajeIva] = useState(16);
  const [detalles, setDetalles] = useState([
    { id: 1, productoId: '', cantidadBultos: '', unidadesPorBulto: '', costoUnitario: '' }
  ]);
  const [editandoId, setEditandoId] = useState(null);
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  const cargarDatos = async () => {
    try {
      const [resProveedores, resProductos, resCompras] = await Promise.all([
        api.get('/proveedores'),
        api.get('/productos'),
        api.get('/compras')
      ]);
      setProveedores(resProveedores.data);
      setProductos(resProductos.data);
      setCompras(resCompras.data);
    } catch (error) {
      console.error('Error al cargar datos', error);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const handleDetalleChange = (id, field, value) => {
    setDetalles(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const agregarLinea = () => {
    const nuevoId = detalles.length > 0 ? Math.max(...detalles.map(d => d.id)) + 1 : 1;
    setDetalles([...detalles, { id: nuevoId, productoId: '', cantidadBultos: '', unidadesPorBulto: '', costoUnitario: '' }]);
  };

  const eliminarLinea = (id) => {
    setDetalles(detalles.filter(d => d.id !== id));
  };

  const calcularSubtotal = () => {
    return detalles.reduce((sum, d) => {
      const costoTotal = (Number(d.costoUnitario) || 0) * (Number(d.cantidadBultos) || 0) * (Number(d.unidadesPorBulto) || 0);
      return sum + costoTotal;
    }, 0);
  };

  const calcularIva = () => calcularSubtotal() * (Number(porcentajeIva) / 100);
  const calcularTotal = () => calcularSubtotal() + (conIva ? calcularIva() : 0);

  const limpiarFormulario = () => {
    setProveedorId('');
    setNumeroFactura('');
    setConIva(false);
    setPorcentajeIva(16);
    setDetalles([{ id: 1, productoId: '', cantidadBultos: '', unidadesPorBulto: '', costoUnitario: '' }]);
    setEditandoId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editandoId) {
      try {
        await api.put(`/compras/${editandoId}`, {
          proveedorId: Number(proveedorId),
          numeroFactura,
          total: calcularTotal()
        });
        alert('Compra actualizada');
        limpiarFormulario();
        cargarDatos();
      } catch (error) {
        alert(error.response?.data?.error || 'Error al actualizar');
      }
      return;
    }

    for (const d of detalles) {
      if (!d.productoId || Number(d.cantidadBultos) <= 0 || Number(d.unidadesPorBulto) <= 0 || Number(d.costoUnitario) <= 0) {
        alert('Complete todos los campos de cada línea');
        return;
      }
    }

    try {
      await api.post('/compras', {
        proveedorId: Number(proveedorId),
        numeroFactura,
        total: calcularTotal(),
        detalles: detalles.map(d => ({
          productoId: Number(d.productoId),
          cantidadBultos: Number(d.cantidadBultos),
          unidadesPorBulto: Number(d.unidadesPorBulto),
          costoUnitario: Number(d.costoUnitario)
        }))
      });
      limpiarFormulario();
      cargarDatos();
      alert('Compra registrada');
    } catch (error) {
      console.error('Error al registrar compra', error);
      alert(error.response?.data?.error || 'Error al registrar compra');
    }
  };

  const editarCompra = (compra) => {
    setEditandoId(compra.id);
    setProveedorId(compra.proveedorId);
    setNumeroFactura(compra.numeroFactura || '');
    setConIva(false);
    alert('Modo edición: puede cambiar proveedor y número de factura');
  };

  const eliminarCompra = async (id) => {
    if (!window.confirm('¿Eliminar esta compra? Se revertirá el stock.')) return;
    try {
      await api.delete(`/compras/${id}`);
      cargarDatos();
      alert('Compra eliminada');
    } catch (error) {
      alert(error.response?.data?.error || 'Error al eliminar');
    }
  };

  return (
    <div>
      <div className="page-title">
        <h1>🛒 Compras</h1>
      </div>

      <div className="card">
        <h2>{editandoId ? 'Editar Compra' : 'Nueva Compra'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div className="form-group">
              <label>Proveedor</label>
              <select value={proveedorId} onChange={e => setProveedorId(e.target.value)} required>
                <option value="">Seleccione...</option>
                {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Número de Factura</label>
              <input type="text" value={numeroFactura} onChange={e => setNumeroFactura(e.target.value)} placeholder="Opcional" />
            </div>
          </div>

          {!editandoId && (
            <>
              <h3>Detalles</h3>
              <div style={{ overflowX: 'auto', marginBottom: '15px' }}>
                <table className="table" style={{ minWidth: '1000px' }}>
                  <thead>
                    <tr>
                      <th style={{ minWidth: '250px' }}>Producto</th>
                      <th>Cant. Bultos</th>
                      <th>Unid. por Bulto</th>
                      <th>Total Unidades</th>
                      <th>Costo Unitario</th>
                      <th>Costo por Bulto</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalles.map(d => (
                      <tr key={d.id}>
                        <td>
                          <select value={d.productoId} onChange={e => handleDetalleChange(d.id, 'productoId', e.target.value)} required style={{ width: '100%', minWidth: '200px' }}>
                            <option value="">Seleccione producto...</option>
                            {productos.map(p => <option key={p.id} value={p.id}>{p.nombre || p.descripcion}</option>)}
                          </select>
                        </td>
                        <td><input type="text" inputMode="decimal" value={d.cantidadBultos} onChange={e => handleDetalleChange(d.id, 'cantidadBultos', e.target.value)} placeholder="0" style={{ width: '100px' }} /></td>
                        <td><input type="text" inputMode="decimal" value={d.unidadesPorBulto} onChange={e => handleDetalleChange(d.id, 'unidadesPorBulto', e.target.value)} placeholder="0" style={{ width: '100px' }} /></td>
                        <td><input type="text" value={(Number(d.cantidadBultos) || 0) * (Number(d.unidadesPorBulto) || 0)} readOnly style={{ width: '100px' }} /></td>
                        <td><input type="text" inputMode="decimal" value={d.costoUnitario} onChange={e => handleDetalleChange(d.id, 'costoUnitario', e.target.value)} placeholder="0.00" style={{ width: '120px' }} /></td>
                        <td><input type="text" value={(Number(d.costoUnitario) || 0) * (Number(d.cantidadBultos) || 0) * (Number(d.unidadesPorBulto) || 0)} readOnly style={{ width: '120px' }} /></td>
                        <td><button type="button" className="btn btn-danger" onClick={() => eliminarLinea(d.id)} disabled={detalles.length === 1}>✕</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button type="button" className="btn btn-secondary" onClick={agregarLinea}>+ Agregar línea</button>
              <br /><br />

              <div style={{ marginTop: '20px', padding: '15px', background: '#f9fafb', borderRadius: '5px' }}>
                <div className="form-group">
                  <label>
                    <input type="checkbox" checked={conIva} onChange={e => setConIva(e.target.checked)} style={{ marginRight: '5px' }} />
                    ¿Tiene IVA?
                  </label>
                </div>
                {conIva && (
                  <div className="form-group">
                    <label>Porcentaje de IVA (%)</label>
                    <input type="number" step="0.01" value={porcentajeIva} onChange={e => setPorcentajeIva(e.target.value)} style={{ width: '100px' }} />
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '10px' }}>
                  <span><strong>Subtotal:</strong> {calcularSubtotal().toFixed(2)}</span>
                  {conIva && <span><strong>IVA ({porcentajeIva}%):</strong> {calcularIva().toFixed(2)}</span>}
                  <span style={{ fontSize: '18px', color: '#2563eb' }}><strong>Total: {calcularTotal().toFixed(2)}</strong></span>
                </div>
              </div>
            </>
          )}

          <br />
          <button type="submit" className="btn btn-success">
            {editandoId ? 'Guardar Cambios' : 'Registrar Compra'}
          </button>
          {editandoId && (
            <button type="button" className="btn btn-secondary ml-10" onClick={() => limpiarFormulario()}>Cancelar</button>
          )}
        </form>
      </div>

      <div className="card">
        <h2>Historial de Compras</h2>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Proveedor</th>
              <th>Fecha</th>
              <th>Factura</th>
              <th>Total</th>
              <th>Detalles</th>
              {usuario.rol === 'ADMIN' && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {compras.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.proveedor?.nombre || 'N/A'}</td>
                <td>{new Date(c.fecha).toLocaleString()}</td>
                <td>{c.numeroFactura || '-'}</td>
                <td>{Number(c.total).toFixed(2)}</td>
                <td>
                  <ul style={{ margin: 0, paddingLeft: 15 }}>
                    {c.detalles.map(d => (
                      <li key={d.id}>{d.producto?.nombre}: {Number(d.cantidad).toFixed(2)} unid. x {Number(d.costoLocal).toFixed(2)}</li>
                    ))}
                  </ul>
                </td>
                {usuario.rol === 'ADMIN' && (
                  <td>
                    <button className="btn btn-warning" onClick={() => editarCompra(c)} style={{ marginRight: '5px' }}>Editar</button>
                    <button className="btn btn-danger" onClick={() => eliminarCompra(c.id)}>Eliminar</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}