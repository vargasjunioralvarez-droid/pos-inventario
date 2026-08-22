import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Compras() {
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [compras, setCompras] = useState([]);
  const [proveedorId, setProveedorId] = useState('');
  const [numeroFactura, setNumeroFactura] = useState('');
  const [tasaDolar, setTasaDolar] = useState(0);
  const [tipoPago, setTipoPago] = useState('CONTADO');
  const [conIva, setConIva] = useState(false);
  const [porcentajeIva, setPorcentajeIva] = useState(16);
  const [detalles, setDetalles] = useState([
    { id: 1, productoId: '', cantidadBultos: '', unidadesPorBulto: '', costoBultoBs: '', costoBultoUsd: '' }
  ]);
  const [editandoId, setEditandoId] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [porPagina, setPorPagina] = useState(10);
  const [modalDetalles, setModalDetalles] = useState(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');

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
    setDetalles(prev => prev.map(d => {
      if (d.id === id) {
        const nuevo = { ...d, [field]: value };

        if (field === 'productoId') {
          const producto = productos.find(p => p.id === Number(value));
          if (producto && producto.unidadesPorBulto) {
            nuevo.unidadesPorBulto = producto.unidadesPorBulto;
          }
        }

        // Si cambia costo en BS, calcular USD
        if (field === 'costoBultoBs') {
          const bs = Number(value);
          if (!isNaN(bs) && tasaDolar > 0) {
            nuevo.costoBultoUsd = (bs / tasaDolar).toFixed(2);
          } else {
            nuevo.costoBultoUsd = '';
          }
        }

        // Si cambia costo en USD, calcular BS
        if (field === 'costoBultoUsd') {
          const usd = Number(value);
          if (!isNaN(usd) && tasaDolar > 0) {
            nuevo.costoBultoBs = (usd * tasaDolar).toFixed(2);
          } else {
            nuevo.costoBultoBs = '';
          }
        }

        return nuevo;
      }
      return d;
    }));
  };

  const agregarLinea = () => {
    const nuevoId = detalles.length > 0 ? Math.max(...detalles.map(d => d.id)) + 1 : 1;
    setDetalles([...detalles, { id: nuevoId, productoId: '', cantidadBultos: '', unidadesPorBulto: '', costoBultoBs: '', costoBultoUsd: '' }]);
  };

  const eliminarLinea = (id) => setDetalles(detalles.filter(d => d.id !== id));

  const calcularSubtotal = () => {
    return detalles.reduce((sum, d) => {
      const costoBultoBs = Number(d.costoBultoBs) || 0;
      const cantidadBultos = Number(d.cantidadBultos) || 0;
      return sum + (cantidadBultos * costoBultoBs);
    }, 0);
  };

  const calcularIva = () => calcularSubtotal() * (Number(porcentajeIva) / 100);
  const calcularTotal = () => calcularSubtotal() + (conIva ? calcularIva() : 0);
  const calcularTotalUsd = () => tasaDolar > 0 ? calcularTotal() / tasaDolar : 0;

  const limpiarFormulario = () => {
    setProveedorId('');
    setNumeroFactura('');
    setTasaDolar(0);
    setTipoPago('CONTADO');
    setConIva(false);
    setPorcentajeIva(16);
    setDetalles([{ id: 1, productoId: '', cantidadBultos: '', unidadesPorBulto: '', costoBultoBs: '', costoBultoUsd: '' }]);
    setEditandoId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    for (const d of detalles) {
      if (!d.productoId || Number(d.cantidadBultos) <= 0 || Number(d.unidadesPorBulto) <= 0 || (!Number(d.costoBultoBs) && !Number(d.costoBultoUsd))) {
        alert('Complete todos los campos de cada línea');
        return;
      }
    }

    const payload = {
      proveedorId: Number(proveedorId),
      numeroFactura,
      total: calcularTotal(),
      totalUsd: calcularTotalUsd(),
      tasaDolar: Number(tasaDolar),
      tipoPago,
      detalles: detalles.map(d => {
        const totalUnidades = Number(d.cantidadBultos) * Number(d.unidadesPorBulto);
        const costoBultoBs = Number(d.costoBultoBs) || 0;
        const costoUnitarioBs = costoBultoBs / totalUnidades;
        return {
          productoId: Number(d.productoId),
          cantidadBultos: Number(d.cantidadBultos),
          unidadesPorBulto: Number(d.unidadesPorBulto),
          costoUnitario: costoUnitarioBs,
          moneda: 'BS'
        };
      })
    };

    try {
      if (editandoId) {
        await api.put(`/compras/${editandoId}`, payload);
        alert('Compra actualizada');
      } else {
        await api.post('/compras', payload);
        alert('Compra registrada');
      }
      limpiarFormulario();
      cargarDatos();
    } catch (error) {
      console.error('Error al guardar compra', error);
      alert(error.response?.data?.error || 'Error al guardar compra');
    }
  };

  const editarCompra = (compra) => {
    setEditandoId(compra.id);
    setProveedorId(compra.proveedorId);
    setNumeroFactura(compra.numeroFactura || '');
    setTasaDolar(Number(compra.tasaDolar) || 0);
    setTipoPago(compra.tipoPago || 'CONTADO');
    setConIva(false);

    const detallesCargados = compra.detalles.map(d => ({
      id: d.id,
      productoId: d.productoId,
      cantidadBultos: d.cantidadBultos || 1,
      unidadesPorBulto: d.unidadesPorBulto || 1,
      costoBultoBs: Number(d.costoLocal) * Number(d.cantidad),
      costoBultoUsd: (Number(d.costoLocal) * Number(d.cantidad)) / (Number(compra.tasaDolar) || 1)
    }));
    setDetalles(detallesCargados.length > 0 ? detallesCargados : [{ id: 1, productoId: '', cantidadBultos: '', unidadesPorBulto: '', costoBultoBs: '', costoBultoUsd: '' }]);
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

  const comprasFiltradas = compras.filter(c =>
    (c.proveedor?.nombre || '').toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
    (c.numeroFactura || '').toLowerCase().includes(terminoBusqueda.toLowerCase())
  );

  const totalPaginas = Math.ceil(comprasFiltradas.length / porPagina);
  const comprasPaginadas = comprasFiltradas.slice((paginaActual - 1) * porPagina, paginaActual * porPagina);

  return (
    <div>
      <div className="page-title"><h1>🛒 Compras</h1></div>

      <div className="card">
        <h2>{editandoId ? 'Editar Compra' : 'Nueva Compra'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div className="form-group">
              <label>Proveedor</label>
              <select id="proveedorInput" value={proveedorId} onChange={e => setProveedorId(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('numeroFacturaInput').focus(); } }} required>
                <option value="">Seleccione...</option>
                {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Número de Factura</label>
              <input id="numeroFacturaInput" type="text" value={numeroFactura} onChange={e => setNumeroFactura(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('tasaDolarInput').focus(); } }} placeholder="Opcional" />
            </div>
            <div className="form-group">
              <label>Tasa del dólar (Bs/USD)</label>
              <input id="tasaDolarInput" type="number" step="0.0001" value={tasaDolar} onChange={e => setTasaDolar(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('tipoPagoSelect').focus(); } }} />
            </div>
            <div className="form-group">
              <label>Tipo de pago</label>
              <select id="tipoPagoSelect" value={tipoPago} onChange={e => setTipoPago(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); const primerProducto = document.querySelector('select[name="productoId"]'); if (primerProducto) primerProducto.focus(); } }}>
                <option value="CONTADO">Contado</option>
                <option value="CREDITO">Crédito</option>
              </select>
            </div>
          </div>

          <h3>Detalles</h3>
          <div style={{ overflowX: 'auto', marginBottom: '15px' }}>
            <table className="table" style={{ minWidth: '1300px' }}>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cant. Bultos</th>
                  <th>Unid. por Bulto</th>
                  <th>Total Unid.</th>
                  <th>Costo Bulto BS</th>
                  <th>Costo Bulto USD</th>
                  <th>Costo Unit. BS</th>
                  <th>Costo Unit. USD</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {detalles.map(d => {
                  const totalUnidades = (Number(d.cantidadBultos) || 0) * (Number(d.unidadesPorBulto) || 0);
                  const costoBultoBs = Number(d.costoBultoBs) || 0;
                  const costoBultoUsd = Number(d.costoBultoUsd) || 0;
                  const costoUnitarioBs = totalUnidades > 0 ? costoBultoBs / totalUnidades : 0;
                  const costoUnitarioUsd = totalUnidades > 0 ? costoBultoUsd / totalUnidades : 0;
                  return (
                    <tr key={d.id}>
                      <td>
                        <select name="productoId" value={d.productoId} onChange={e => handleDetalleChange(d.id, 'productoId', e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); const inputs = e.target.closest('tr').querySelectorAll('input'); if (inputs[0]) inputs[0].focus(); } }} required style={{ width: '100%', minWidth: '180px' }}>
                          <option value="">Seleccione producto...</option>
                          {productos.map(p => <option key={p.id} value={p.id}>{p.nombre || p.descripcion}</option>)}
                        </select>
                      </td>
                      <td><input type="text" inputMode="decimal" value={d.cantidadBultos} onChange={e => handleDetalleChange(d.id, 'cantidadBultos', e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); const inputs = e.target.closest('tr').querySelectorAll('input'); if (inputs[1]) inputs[1].focus(); } }} placeholder="0" style={{ width: '100px' }} /></td>
                      <td><input type="text" inputMode="decimal" value={d.unidadesPorBulto} onChange={e => handleDetalleChange(d.id, 'unidadesPorBulto', e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); const inputs = e.target.closest('tr').querySelectorAll('input'); if (inputs[2]) inputs[2].focus(); } }} placeholder="0" style={{ width: '100px' }} /></td>
                      <td><input type="text" value={totalUnidades} readOnly style={{ width: '100px' }} /></td>
                      <td><input type="text" inputMode="decimal" value={d.costoBultoBs} onChange={e => handleDetalleChange(d.id, 'costoBultoBs', e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); const inputs = e.target.closest('tr').querySelectorAll('input'); if (inputs[3]) inputs[3].focus(); } }} placeholder="0.00" style={{ width: '120px' }} /></td>
                      <td><input type="text" inputMode="decimal" value={d.costoBultoUsd} onChange={e => handleDetalleChange(d.id, 'costoBultoUsd', e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); const btnEliminar = e.target.closest('tr').querySelector('button'); if (btnEliminar) btnEliminar.focus(); } }} placeholder="0.00" style={{ width: '120px' }} /></td>
                      <td><input type="text" value={costoUnitarioBs.toFixed(2)} readOnly style={{ width: '120px' }} /></td>
                      <td><input type="text" value={costoUnitarioUsd.toFixed(2)} readOnly style={{ width: '120px' }} /></td>
                      <td><button type="button" className="btn btn-danger" onClick={() => eliminarLinea(d.id)} disabled={detalles.length === 1}>✕</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button type="button" className="btn btn-secondary" onClick={agregarLinea}>+ Agregar línea</button>
          <br /><br />

          <div style={{ marginTop: '20px', padding: '15px', background: '#f9fafb', borderRadius: '5px' }}>
            <div className="form-group">
              <label><input type="checkbox" checked={conIva} onChange={e => setConIva(e.target.checked)} style={{ marginRight: '5px' }} /> ¿Tiene IVA?</label>
            </div>
            {conIva && (
              <div className="form-group">
                <label>Porcentaje de IVA (%)</label>
                <input type="number" step="0.01" value={porcentajeIva} onChange={e => setPorcentajeIva(e.target.value)} style={{ width: '100px' }} />
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '10px' }}>
              <span><strong>Subtotal BS:</strong> {calcularSubtotal().toFixed(2)}</span>
              {conIva && <span><strong>IVA ({porcentajeIva}%):</strong> {calcularIva().toFixed(2)}</span>}
              <span style={{ fontSize: '16px', color: '#2563eb' }}><strong>Total BS: {calcularTotal().toFixed(2)}</strong></span>
              <span style={{ fontSize: '16px', color: '#16a34a' }}><strong>Total USD: {calcularTotalUsd().toFixed(2)}</strong></span>
            </div>
          </div>

          <br />
          <button type="submit" className="btn btn-success">{editandoId ? 'Guardar Cambios' : 'Registrar Compra'}</button>
          {editandoId && <button type="button" className="btn btn-secondary ml-10" onClick={() => limpiarFormulario()}>Cancelar</button>}
        </form>
      </div>

      {/* Historial y modal similares al anterior */}
    </div>
  );
}