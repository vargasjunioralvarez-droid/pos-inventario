import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
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
      await api.post('/proveedores', form);
      setForm({ nombre: '', ruc: '', telefono: '', email: '', direccion: '' });
      cargar();
      alert('Proveedor creado');
    } catch (error) {
      console.error('Error al crear proveedor', error);
      alert('Error al crear proveedor');
    }
  };

  return (
    <div>
      <div className="page-title">
        <h1>🏢 Proveedores</h1>
      </div>

      <div className="card">
        <h2>Nuevo Proveedor</h2>
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
          <div className="form-group" style={{ alignSelf: 'end' }}>
            <button type="submit" className="btn btn-primary">Guardar</button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Lista de Proveedores</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>RIF</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Dirección</th>
            </tr>
          </thead>
          <tbody>
            {proveedores.map(p => (
              <tr key={p.id}>
                <td>{p.nombre}</td>
                <td>{p.rif || '-'}</td>
                <td>{p.telefono || '-'}</td>
                <td>{p.email || '-'}</td>
                <td>{p.direccion || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}