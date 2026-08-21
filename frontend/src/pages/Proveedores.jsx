import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [form, setForm] = useState({
    nombre: '',
    ruc: '',
    telefono: '',
    email: '',
    direccion: ''
  });

  const cargar = async () => {
    try {
      const res = await api.get('/proveedores');
      setProveedores(res.data);
    } catch (error) {
      console.error('Error al cargar proveedores', error);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editandoId) {
        await api.put(`/proveedores/${editandoId}`, form);
        alert('Proveedor actualizado');
      } else {
        await api.post('/proveedores', form);
        alert('Proveedor creado');
      }
      setEditandoId(null);
      setForm({ nombre: '', ruc: '', telefono: '', email: '', direccion: '' });
      cargar();
    } catch (error) {
      console.error('Error al guardar proveedor', error);
      alert('Error al guardar proveedor');
    }
  };

  const editarProveedor = (proveedor) => {
    setEditandoId(proveedor.id);
    setForm({
      nombre: proveedor.nombre,
      ruc: proveedor.ruc || '',
      telefono: proveedor.telefono || '',
      email: proveedor.email || '',
      direccion: proveedor.direccion || ''
    });
  };

  const eliminarProveedor = async (id) => {
    if (!window.confirm('¿Eliminar este proveedor?')) return;
    try {
      await api.delete(`/proveedores/${id}`);
      cargar();
      alert('Proveedor eliminado');
    } catch (error) {
      console.error('Error al eliminar proveedor', error);
      alert('Error al eliminar proveedor');
    }
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setForm({ nombre: '', ruc: '', telefono: '', email: '', direccion: '' });
  };

  const proveedoresFiltrados = proveedores.filter(p =>
    (p.nombre || '').toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
    (p.ruc || '').toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
    (p.email || '').toLowerCase().includes(terminoBusqueda.toLowerCase())
  );

  return (
    <div>
      <div className="page-title">
        <h1>🏢 Proveedores</h1>
      </div>

      <div className="card">
        <h2>{editandoId ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
        <form onSubmit={handleSubmit} className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div className="form-group">
            <label>Nombre</label>
            <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>RIF</label>
            <input type="text" name="ruc" value={form.ruc} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <input type="text" name="telefono" value={form.telefono} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Dirección</label>
            <input type="text" name="direccion" value={form.direccion} onChange={handleChange} />
          </div>
          <div className="form-group" style={{ alignSelf: 'end', display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn btn-primary">
              {editandoId ? 'Guardar Cambios' : 'Guardar'}
            </button>
            {editandoId && (
              <button type="button" className="btn btn-secondary" onClick={cancelarEdicion}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Lista de Proveedores</h2>
        <input
          type="text"
          placeholder="🔍 Buscar proveedor..."
          value={terminoBusqueda}
          onChange={e => setTerminoBusqueda(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
        />
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>RIF</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Dirección</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedoresFiltrados.map(p => (
              <tr key={p.id}>
                <td>{p.nombre}</td>
                <td>{p.ruc || '-'}</td>
                <td>{p.telefono || '-'}</td>
                <td>{p.email || '-'}</td>
                <td>{p.direccion || '-'}</td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button className="btn btn-warning" onClick={() => editarProveedor(p)} style={{ marginRight: '5px' }}>Editar</button>
                  <button className="btn btn-danger" onClick={() => eliminarProveedor(p.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {proveedoresFiltrados.length === 0 && (
              <tr><td colSpan="6">No hay proveedores que coincidan con la búsqueda</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}