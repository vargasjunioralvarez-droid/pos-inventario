import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [form, setForm] = useState({
    codigo: '',
    descripcion: '',
    unidadesPorBulto: ''
  });

  const cargar = async () => {
    try {
      const res = await api.get('/productos');
      setProductos(res.data);
    } catch (error) {
      console.error('Error al cargar productos', error);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editandoId) {
        await api.put(`/productos/${editandoId}`, form);
        alert('Producto actualizado');
      } else {
        await api.post('/productos', form);
        alert('Producto creado');
      }
      setEditandoId(null);
      setForm({ codigo: '', descripcion: '', unidadesPorBulto: '' });
      cargar();
    } catch (error) {
      console.error('Error al guardar producto', error);
      alert(error.response?.data?.error || 'Error al guardar producto');
    }
  };

  const editarProducto = (p) => {
    setEditandoId(p.id);
    setForm({
      codigo: p.codigo,
      descripcion: p.descripcion || p.nombre,
      unidadesPorBulto: p.unidadesPorBulto || ''
    });
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    try {
      await api.delete(`/productos/${id}`);
      cargar();
      alert('Producto eliminado');
    } catch (error) {
      console.error('Error al eliminar', error);
      alert('Error al eliminar producto');
    }
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setForm({ codigo: '', descripcion: '', unidadesPorBulto: '' });
  };

  const productosFiltrados = productos.filter(p =>
    p.codigo.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
    (p.nombre || p.descripcion).toLowerCase().includes(terminoBusqueda.toLowerCase())
  );

  return (
    <div>
      <div className="page-title"><h1>📦 Productos</h1></div>

      <div className="card">
        <h2>{editandoId ? 'Editar Producto' : 'Nuevo Producto'}</h2>
        <form onSubmit={handleSubmit} className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div className="form-group">
            <label>Código</label>
            <input type="text" name="codigo" value={form.codigo} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <input type="text" name="descripcion" value={form.descripcion} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Unidades por Bulto</label>
            <input type="number" step="0.01" name="unidadesPorBulto" value={form.unidadesPorBulto} onChange={handleChange} />
          </div>
          <div className="form-group" style={{ alignSelf: 'end', display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn btn-primary">{editandoId ? 'Guardar Cambios' : 'Guardar'}</button>
            {editandoId && <button type="button" className="btn btn-secondary" onClick={cancelarEdicion}>Cancelar</button>}
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Lista de Productos</h2>
        <input
          type="text"
          placeholder="🔍 Buscar producto..."
          value={terminoBusqueda}
          onChange={e => setTerminoBusqueda(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
        />
        <table className="table" style={{ tableLayout: 'fixed', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ width: '20%' }}>Código</th>
              <th style={{ width: '15%', textAlign: 'left', paddingLeft: '20px' }}>Descripción</th>
              <th style={{ width: '15%', textAlign: 'center' }}>Unid. por Bulto</th>
              <th style={{ width: '20%', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.map(p => (
              <tr key={p.id}>
                <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.codigo}</td>
                <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left', paddingLeft: '20px' }}>{p.nombre || p.descripcion}</td>
                <td style={{ textAlign: 'center' }}>{p.unidadesPorBulto || '-'}</td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button className="btn btn-warning" onClick={() => editarProducto(p)} style={{ marginRight: '5px' }}>Editar</button>
                  <button className="btn btn-danger" onClick={() => eliminarProducto(p.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}