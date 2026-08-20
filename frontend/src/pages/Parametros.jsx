import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Parametros() {
  const [tasaDolar, setTasaDolar] = useState(0);
  const [monedaLocal, setMonedaLocal] = useState('BS');
  const [mensaje, setMensaje] = useState('');

  const cargar = async () => {
    try {
      const res = await api.get('/parametros');
      if (res.data) {
        setTasaDolar(Number(res.data.tasaDolar));
        setMonedaLocal(res.data.monedaLocal || 'BS');
      }
    } catch (error) {
      console.log('Sin parámetros aún');
    }
  };

  useEffect(() => { cargar(); }, []);

  const guardar = async (e) => {
    e.preventDefault();
    try {
      await api.post('/parametros', { tasaDolar: Number(tasaDolar), monedaLocal });
      setMensaje('Parámetro actualizado');
    } catch (error) {
      setMensaje('Error al guardar');
    }
  };

  return (
    <div>
      <div className="page-title">
        <h1>⚙️ Parámetro del Dólar</h1>
      </div>

      <div className="card">
        <form onSubmit={guardar} style={{ maxWidth: '400px' }}>
          <div className="form-group">
            <label>Tasa del dólar (Bs por USD)</label>
            <input type="number" step="0.0001" value={tasaDolar} onChange={e => setTasaDolar(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Moneda local</label>
            <input type="text" value={monedaLocal} onChange={e => setMonedaLocal(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary">Guardar</button>
          {mensaje && <p className="mt-10">{mensaje}</p>}
        </form>
      </div>
    </div>
  );
}