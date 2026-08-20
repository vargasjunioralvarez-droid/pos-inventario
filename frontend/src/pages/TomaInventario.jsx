import { useEffect, useState } from 'react';
import api from '../services/api';

export default function TomaInventario() {
  const [conteos, setConteos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [conteoActivo, setConteoActivo] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [usuario, setUsuario] = useState('admin');
  const [semana, setSemana] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [modalEliminarConteo, setModalEliminarConteo] = useState(false);
  const [modalEliminarDetalle, setModalEliminarDetalle] = useState(null);

  const cargarDatos = async () => {
    try {
      const [resConteos, resProductos] = await Promise.all([
        api.get('/conteos'),
        api.get('/productos')
      ]);
      setConteos(resConteos.data);
      setProductos(resProductos.data);
    } catch (error) {
      console.error('Error al cargar datos', error);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const crearConteo = async () => {
    try {
      const res = await api.post('/conteos', { usuario, semana, fechaInicio, fechaFin });
      await cargarDatos();
      setConteoActivo(res.data);
      setDetalles([]);
      alert(`Conteo #${res.data.id} creado`);
    } catch (error) {
      alert('Error al crear conteo');
    }
  };

  const seleccionarConteo = async (conteoId) => {
    if (!conteoId) return;
    try {
      const res = await api.get(`/conteos/${conteoId}`);
      const c = res.data;
      setConteoActivo(c);
      setDetalles(c.detalles || []);
      setUsuario(c.usuario || 'admin');
      setSemana(c.semana || '');
      setFechaInicio(c.fechaInicio ? new Date(c.fechaInicio).toISOString().slice(0,10) : '');
      setFechaFin(c.fechaFin ? new Date(c.fechaFin).toISOString().slice(0,10) : '');
    } catch (error) {
      alert('Error al cargar conteo');
    }
  };

  const editarConteo = (c) => {
    setConteoActivo(c);
    setDetalles(c.detalles || []);
    setUsuario(c.usuario || 'admin');
    setSemana(c.semana || '');
    setFechaInicio(c.fechaInicio ? new Date(c.fechaInicio).toISOString().slice(0,10) : '');
    setFechaFin(c.fechaFin ? new Date(c.fechaFin).toISOString().slice(0,10) : '');
  };

  const actualizarConteo = async () => {
    if (!conteoActivo) return;
    try {
      await api.put(`/conteos/${conteoActivo.id}`, { usuario, semana, fechaInicio, fechaFin });
      alert('Conteo actualizado');
      await cargarDatos();
    } catch (error) {
      alert('Error al actualizar conteo');
    }
  };

  const guardarDetalle = async (productoId, cantidadContada) => {
    if (!conteoActivo || conteoActivo.estado !== 'ABIERTO') {
      alert('No hay un conteo activo o ya está cerrado');
      return;
    }
    if (cantidadContada === '' || isNaN(cantidadContada)) {
      alert('Ingrese una cantidad válida');
      return;
    }
    try {
      const res = await api.post(`/conteos/${conteoActivo.id}/detalles`, {
        productoId,
        cantidadContada: Number(cantidadContada)
      });
      setDetalles(prev => {
        const idx = prev.findIndex(d => d.productoId === productoId);
        if (idx !== -1) {
          const nuevos = [...prev];
          nuevos[idx] = res.data;
          return nuevos;
        }
        return [...prev, res.data];
      });
    } catch (error) {
      alert('Error al guardar detalle');
    }
  };

  const confirmarEliminarDetalle = async () => {
    if (!modalEliminarDetalle) return;
    try {
      await api.delete(`/conteos/${conteoActivo.id}/detalles/${modalEliminarDetalle.detalleId}`);
      const res = await api.get(`/conteos/${conteoActivo.id}`);
      setDetalles(res.data.detalles || []);
      setModalEliminarDetalle(null);
    } catch (error) {
      alert('Error al eliminar detalle');
    }
  };

  const confirmarEliminarConteo = async () => {
    try {
      await api.delete(`/conteos/${conteoActivo.id}`);
      setConteoActivo(null);
      setDetalles([]);
      setModalEliminarConteo(false);
      await cargarDatos();
    } catch (error) {
      alert(error.response?.data?.error || 'Error al eliminar conteo');
    }
  };

  const cerrarConteo = async () => {
    const confirmar = window.confirm('¿Cerrar conteo y aplicar ajustes?');
    if (!confirmar) return;
    try {
      await api.put(`/conteos/${conteoActivo.id}/cerrar`);
      await cargarDatos();
      setConteoActivo(null);
      setDetalles([]);
      alert('Conteo cerrado');
    } catch (error) {
      alert('Error al cerrar conteo');
    }
  };

  return (
    <div>
      <div className="page-title">
        <h1>📋 Toma de Inventario</h1>
      </div>

      <div className="card">
        <div className="flex gap-10 items-center flex-wrap">
          <input type="text" placeholder="Usuario" value={usuario} onChange={e => setUsuario(e.target.value)} style={{ padding: '8px', width: '150px' }} />
          <input type="text" placeholder="Semana (ej: 2026-W08)" value={semana} onChange={e => setSemana(e.target.value)} style={{ padding: '8px', width: '180px' }} />
          <label>Desde:</label>
          <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
          <label>Hasta:</label>
          <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
          <button className="btn btn-primary" onClick={crearConteo}>+ Nuevo Conteo</button>
        </div>
      </div>

      <div className="card">
        <h2>Conteos Realizados</h2>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Desde</th>
              <th>Hasta</th>
              <th>Semana</th>
              <th>Usuario</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {conteos.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{new Date(c.fecha).toLocaleDateString()}</td>
                <td>{c.fechaInicio ? new Date(c.fechaInicio).toLocaleDateString() : '-'}</td>
                <td>{c.fechaFin ? new Date(c.fechaFin).toLocaleDateString() : '-'}</td>
                <td>{c.semana || '-'}</td>
                <td>{c.usuario || '-'}</td>
                <td>{c.estado}</td>
                <td>
                  <button className="btn btn-warning" onClick={() => editarConteo(c)} style={{ marginRight: '5px' }}>Ver/Editar</button>
                  {c.estado === 'ABIERTO' && (
                    <button className="btn btn-danger" onClick={() => { setConteoActivo(c); setModalEliminarConteo(true); }}>Eliminar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {conteoActivo && (
        <div className="card">
          <div className="flex justify-between items-center mb-10">
            <h2>Conteo #{conteoActivo.id} ({conteoActivo.estado})</h2>
            <div className="flex gap-10">
              <button className="btn btn-primary" onClick={actualizarConteo}>Guardar Cambios</button>
              {conteoActivo.estado === 'ABIERTO' && (
                <>
                  <button className="btn btn-warning" onClick={cerrarConteo}>Cerrar Conteo</button>
                  <button className="btn btn-danger" onClick={() => setModalEliminarConteo(true)}>Eliminar</button>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-10 mb-10">
            <label>Usuario: </label>
            <input type="text" value={usuario} onChange={e => setUsuario(e.target.value)} />
            <label>Semana: </label>
            <input type="text" value={semana} onChange={e => setSemana(e.target.value)} />
            <label>Desde:</label>
            <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
            <label>Hasta:</label>
            <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Stock Sistema</th>
                <th>Cantidad Contada</th>
                <th>Diferencia</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map(p => {
                const detalle = detalles.find(d => d.productoId === p.id);
                const cantidadContada = detalle ? detalle.cantidadContada : '';
                const stockSistema = Number(p.stockActual);
                const contadaNum = Number(cantidadContada);
                const diferencia = cantidadContada !== '' && !isNaN(contadaNum) ? contadaNum - stockSistema : 0;

                return (
                  <tr key={p.id}>
                    <td>{p.nombre || p.descripcion}</td>
                    <td>{stockSistema.toFixed(2)}</td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={cantidadContada}
                        onChange={e => {
                          const nuevos = [...detalles];
                          const idx = nuevos.findIndex(d => d.productoId === p.id);
                          if (idx !== -1) nuevos[idx] = { ...nuevos[idx], cantidadContada: e.target.value };
                          else nuevos.push({ productoId: p.id, cantidadContada: e.target.value });
                          setDetalles(nuevos);
                        }}
                        disabled={conteoActivo.estado !== 'ABIERTO'}
                        style={{ width: '100px' }}
                      />
                    </td>
                    <td style={{ color: diferencia >= 0 ? 'green' : 'red', fontWeight: 'bold' }}>
                      {diferencia.toFixed(2)}
                    </td>
                    <td>
                      <button className="btn btn-primary" onClick={() => guardarDetalle(p.id, cantidadContada)} disabled={conteoActivo.estado !== 'ABIERTO'}>
                        {detalle ? 'Actualizar' : 'Guardar'}
                      </button>
                      {detalle && (
                        <button className="btn btn-danger" onClick={() => setModalEliminarDetalle({ detalleId: detalle.id, productoNombre: p.nombre || p.descripcion })} disabled={conteoActivo.estado !== 'ABIERTO'}>
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modalEliminarConteo && (
        <div className="modal-overlay" onClick={() => setModalEliminarConteo(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>¿Eliminar este conteo?</h3>
            <div className="flex gap-10 justify-center mt-10">
              <button className="btn btn-danger" onClick={confirmarEliminarConteo}>Sí, eliminar</button>
              <button className="btn btn-secondary" onClick={() => setModalEliminarConteo(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {modalEliminarDetalle && (
        <div className="modal-overlay" onClick={() => setModalEliminarDetalle(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>¿Eliminar detalle de {modalEliminarDetalle.productoNombre}?</h3>
            <div className="flex gap-10 justify-center mt-10">
              <button className="btn btn-danger" onClick={confirmarEliminarDetalle}>Sí, eliminar</button>
              <button className="btn btn-secondary" onClick={() => setModalEliminarDetalle(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}