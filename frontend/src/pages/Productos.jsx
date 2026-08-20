import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [editandoId, setEditandoId] = useState(null); // estado para edición
  const [form, setForm] = useState({
    codigo: '',
    descripcion: '',
    moneda: 'USD'
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editandoId) {
        // Actualizar producto existente
        await api.put(`/productos/${editandoId}`, form);
        alert('Producto actualizado');
      } else {
        // Crear nuevo producto
        await api.post('/productos', form);
        alert('Producto creado');
      }
      setEditandoId(null);
      setForm({ codigo: '', descripcion: '', moneda: 'USD' });
      cargar();
    } catch (error) {
      console.error('Error al guardar producto', error);
      alert(error.response?.data?.error || 'Error al guardar producto');
    }
  };

  const editarProducto = (producto) => {
    setEditandoId(producto.id);
    setForm({
      codigo: producto.codigo,
      descripcion: producto.descripcion || producto.nombre,
      moneda: producto.moneda
    });
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setForm({ codigo: '', descripcion: '', moneda: 'USD' });
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    try {
      await api.delete(`/productos/${id}`);
      cargar();
      alert('Producto eliminado');
    } catch (error) {
      console.error('Error al eliminar producto', error);
      alert('Error al eliminar producto');
    }
  };

  return (
    <div>
      <div className="page-title">
        <h1>📦 Productos</h1>
      </div>

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
            <label>Moneda</label>
            <select name="moneda" value={form.moneda} onChange={handleChange}>
              <option value="USD">Dólar (USD)</option>
              <option value="BS">Bolívares (BS)</option>
            </select>
          </div>
          <div className="form-group" style={{ alignSelf: 'end', display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn btn-primary">
              {editandoId ? 'Guardar Edición' : 'Guardar'}
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
        <h2>Lista de Productos</h2>
        <table className="table" style={{ tableLayout: 'fixed', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ width: '15%' }}>Código</th>
              <th style={{ width: '50%', textAlign: 'left', paddingLeft: '250px' }}>Descripción</th>
              <th style={{ width: '15%', textAlign: 'center' }}>Moneda</th>
              <th style={{ width: '20%', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map(p => (
              <tr key={p.id}>
                <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.codigo}</td>
                <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left', paddingLeft: '250px' }}>{p.nombre || p.descripcion}</td>
                <td style={{ textAlign: 'center' }}>{p.moneda}</td>
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