import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Registro() {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({ nombre: '', password: '', rol: 'VENDEDOR' });
  const [editando, setEditando] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const cargarUsuarios = async () => {
    try {
      const res = await api.get('/auth/usuarios');
      setUsuarios(res.data);
    } catch (err) {
      console.error('Error al cargar usuarios', err);
    }
  };

  useEffect(() => { cargarUsuarios(); }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');
    try {
      if (editando) {
        await api.put(`/auth/usuarios/${editando.id}`, {
          nombre: form.nombre,
          rol: form.rol,
          activo: form.activo
        });
        setMensaje('Usuario actualizado');
      } else {
        await api.post('/auth/registrar', form);
        setMensaje('Usuario creado correctamente');
      }
      setForm({ nombre: '', password: '', rol: 'VENDEDOR' });
      setEditando(null);
      cargarUsuarios();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar usuario');
    }
  };

  const editarUsuario = (usuario) => {
    setEditando(usuario);
    setForm({ nombre: usuario.nombre, password: '', rol: usuario.rol, activo: usuario.activo });
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setForm({ nombre: '', password: '', rol: 'VENDEDOR' });
  };

  return (
    <div>
      <div className="page-title">
        <h1>👥 Usuarios</h1>
      </div>

      <div className="flex gap-30 flex-wrap">
        <div className="card" style={{ flex: 1, minWidth: '300px' }}>
          <h2>{editando ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre</label>
              <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required />
            </div>
            {!editando && (
              <div className="form-group">
                <label>Contraseña</label>
                <input type="password" name="password" value={form.password} onChange={handleChange} required={!editando} />
              </div>
            )}
            <div className="form-group">
              <label>Rol</label>
              <select name="rol" value={form.rol} onChange={handleChange}>
                <option value="VENDEDOR">Vendedor</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
            {editando && (
              <div className="form-group">
                <label>Estado</label>
                <select name="activo" value={form.activo} onChange={handleChange}>
                  <option value={true}>Activo</option>
                  <option value={false}>Inactivo</option>
                </select>
              </div>
            )}
            <button type="submit" className="btn btn-primary">{editando ? 'Guardar Cambios' : 'Crear Usuario'}</button>
            {editando && <button type="button" className="btn btn-secondary mt-10" onClick={cancelarEdicion}>Cancelar</button>}
            {mensaje && <p className="mt-10" style={{ color: 'green' }}>{mensaje}</p>}
            {error && <p className="mt-10" style={{ color: 'red' }}>{error}</p>}
          </form>
        </div>

        <div className="card" style={{ flex: 2, minWidth: '300px' }}>
          <h2>Lista de Usuarios</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id}>
                  <td>{u.nombre}</td>
                  <td>{u.rol}</td>
                  <td>{u.activo ? 'Activo' : 'Inactivo'}</td>
                  <td>
                    <button className="btn btn-warning" onClick={() => editarUsuario(u)}>Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}