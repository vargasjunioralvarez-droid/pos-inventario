import { useEffect, useState } from 'react';
import api from '../services/api';

export default function CambioPrecio() {
  const [productos, setProductos] = useState([]);
  const [tasaDolar, setTasaDolar] = useState(0);
  const [mensaje, setMensaje] = useState('');
  const [valores, setValores] = useState({});

  const cargarDatos = async () => {
    try {
      const [resProd, resParam] = await Promise.all([
        api.get('/productos'),
        api.get('/parametros')
      ]);
      setProductos(resProd.data);
      if (resParam.data) setTasaDolar(Number(resParam.data.tasaDolar));

      const iniciales = {};
      resProd.data.forEach(p => {
        const costoUsd = Number(p.costoUsd) || 0;
        const precioContadoUsd = Number(p.precioVentaUsd) || 0;
        const precioContadoBs = Number(p.precioVenta) || 0;
        const margenContado = Number(p.margenContado) || (costoUsd > 0 ? ((precioContadoUsd - costoUsd) / costoUsd) * 100 : 0);
        const precioFiadoUsd = Number(p.precioVentaFiadoUsd) || 0;
        const precioFiadoBs = Number(p.precioVentaFiado) || 0;
        const margenFiado = Number(p.margenFiado) || (costoUsd > 0 ? ((precioFiadoUsd - costoUsd) / costoUsd) * 100 : 0);

        iniciales[p.id] = {
          costoUsd: costoUsd.toFixed(2),
          precioContadoUsd: precioContadoUsd.toFixed(2),
          precioContadoBs: precioContadoBs.toFixed(2),
          margenContado: margenContado.toFixed(2),
          precioFiadoUsd: precioFiadoUsd.toFixed(2),
          precioFiadoBs: precioFiadoBs.toFixed(2),
          margenFiado: margenFiado.toFixed(2)
        };
      });
      setValores(iniciales);
    } catch (error) {
      console.error('Error al cargar datos', error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleContadoUsdChange = (productoId, valor) => {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;

    if (valor === '') {
      setValores(prev => ({
        ...prev,
        [productoId]: {
          ...prev[productoId],
          precioContadoUsd: '',
          precioContadoBs: '',
          margenContado: ''
        }
      }));
      return;
    }

    const precioUsd = Number(valor);
    if (isNaN(precioUsd)) return;
    const costoUsd = Number(producto.costoUsd) || 0;
    const precioBs = precioUsd * tasaDolar;
    const margen = costoUsd > 0 ? ((precioUsd - costoUsd) / costoUsd) * 100 : 0;
    setValores(prev => ({
      ...prev,
      [productoId]: {
        ...prev[productoId],
        precioContadoUsd: valor,
        precioContadoBs: precioBs.toFixed(2),
        margenContado: margen.toFixed(2)
      }
    }));
  };

  const handleContadoBsChange = (productoId, valor) => {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;

    if (valor === '') {
      setValores(prev => ({
        ...prev,
        [productoId]: {
          ...prev[productoId],
          precioContadoBs: '',
          precioContadoUsd: '',
          margenContado: ''
        }
      }));
      return;
    }

    const precioBs = Number(valor);
    if (isNaN(precioBs)) return;
    const precioUsd = precioBs / tasaDolar;
    const costoUsd = Number(producto.costoUsd) || 0;
    const margen = costoUsd > 0 ? ((precioUsd - costoUsd) / costoUsd) * 100 : 0;
    setValores(prev => ({
      ...prev,
      [productoId]: {
        ...prev[productoId],
        precioContadoBs: valor,
        precioContadoUsd: precioUsd.toFixed(2),
        margenContado: margen.toFixed(2)
      }
    }));
  };

  const handleMargenContadoChange = (productoId, valor) => {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;

    if (valor === '') {
      setValores(prev => ({
        ...prev,
        [productoId]: {
          ...prev[productoId],
          margenContado: '',
          precioContadoUsd: '',
          precioContadoBs: ''
        }
      }));
      return;
    }

    const nuevoMargen = Number(valor);
    if (isNaN(nuevoMargen)) return;
    const costoUsd = Number(producto.costoUsd) || 0;
    const precioUsd = costoUsd * (1 + nuevoMargen / 100);
    const precioBs = precioUsd * tasaDolar;
    setValores(prev => ({
      ...prev,
      [productoId]: {
        ...prev[productoId],
        margenContado: valor,
        precioContadoUsd: precioUsd.toFixed(2),
        precioContadoBs: precioBs.toFixed(2)
      }
    }));
  };

  const handleFiadoUsdChange = (productoId, valor) => {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;

    if (valor === '') {
      setValores(prev => ({
        ...prev,
        [productoId]: {
          ...prev[productoId],
          precioFiadoUsd: '',
          precioFiadoBs: '',
          margenFiado: ''
        }
      }));
      return;
    }

    const precioUsd = Number(valor);
    if (isNaN(precioUsd)) return;
    const costoUsd = Number(producto.costoUsd) || 0;
    const precioBs = precioUsd * tasaDolar;
    const margen = costoUsd > 0 ? ((precioUsd - costoUsd) / costoUsd) * 100 : 0;
    setValores(prev => ({
      ...prev,
      [productoId]: {
        ...prev[productoId],
        precioFiadoUsd: valor,
        precioFiadoBs: precioBs.toFixed(2),
        margenFiado: margen.toFixed(2)
      }
    }));
  };

  const handleFiadoBsChange = (productoId, valor) => {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;

    if (valor === '') {
      setValores(prev => ({
        ...prev,
        [productoId]: {
          ...prev[productoId],
          precioFiadoBs: '',
          precioFiadoUsd: '',
          margenFiado: ''
        }
      }));
      return;
    }

    const precioBs = Number(valor);
    if (isNaN(precioBs)) return;
    const precioUsd = precioBs / tasaDolar;
    const costoUsd = Number(producto.costoUsd) || 0;
    const margen = costoUsd > 0 ? ((precioUsd - costoUsd) / costoUsd) * 100 : 0;
    setValores(prev => ({
      ...prev,
      [productoId]: {
        ...prev[productoId],
        precioFiadoBs: valor,
        precioFiadoUsd: precioUsd.toFixed(2),
        margenFiado: margen.toFixed(2)
      }
    }));
  };

  const handleMargenFiadoChange = (productoId, valor) => {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;

    if (valor === '') {
      setValores(prev => ({
        ...prev,
        [productoId]: {
          ...prev[productoId],
          margenFiado: '',
          precioFiadoUsd: '',
          precioFiadoBs: ''
        }
      }));
      return;
    }

    const nuevoMargen = Number(valor);
    if (isNaN(nuevoMargen)) return;
    const costoUsd = Number(producto.costoUsd) || 0;
    const precioUsd = costoUsd * (1 + nuevoMargen / 100);
    const precioBs = precioUsd * tasaDolar;
    setValores(prev => ({
      ...prev,
      [productoId]: {
        ...prev[productoId],
        margenFiado: valor,
        precioFiadoUsd: precioUsd.toFixed(2),
        precioFiadoBs: precioBs.toFixed(2)
      }
    }));
  };

  const guardarCambio = async (productoId) => {
    const v = valores[productoId];
    if (!v) return;

    try {
      await api.put(`/productos/${productoId}/precio`, {
        margen: Number(v.margenContado) || 0,
        margenFiado: Number(v.margenFiado) || 0
      });
      setMensaje('Cambios guardados correctamente');
      await cargarDatos();
    } catch (error) {
      console.error('Error al guardar cambio', error);
      alert('Error al guardar cambio');
    }
  };

  return (
    <div>
      <div className="page-title">
        <h1>💵 Cambio de Precio</h1>
      </div>

      <div className="card">
        <div className="flex items-center gap-10 flex-wrap">
          <label><strong>Tasa del dólar actual:</strong> {tasaDolar.toFixed(4)} Bs/USD</label>
        </div>
        {mensaje && <p className="mt-10" style={{ color: 'green' }}>{mensaje}</p>}
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th rowSpan="2">Producto</th>
              <th rowSpan="2">Costo USD</th>
              <th colSpan="3">CONTADO</th>
              <th colSpan="3">FIADO</th>
              <th rowSpan="2">Acción</th>
            </tr>
            <tr>
              <th>Precio USD</th>
              <th>Precio BS</th>
              <th>Margen %</th>
              <th>Precio USD</th>
              <th>Precio BS</th>
              <th>Margen %</th>
            </tr>
          </thead>
          <tbody>
            {productos.map(p => {
              const costoUsd = Number(p.costoUsd) || 0;
              const v = valores[p.id] || {};
              return (
                <tr key={p.id}>
                  <td>{p.nombre || p.descripcion}</td>
                  <td>${costoUsd.toFixed(2)}</td>

                  {/* Contado */}
                  <td><input type="number" step="0.01" value={v.precioContadoUsd || ''} onChange={e => handleContadoUsdChange(p.id, e.target.value)} style={{ width: '90px' }} /></td>
                  <td><input type="number" step="0.01" value={v.precioContadoBs || ''} onChange={e => handleContadoBsChange(p.id, e.target.value)} style={{ width: '90px' }} /></td>
                  <td><input type="number" step="0.01" value={v.margenContado || ''} onChange={e => handleMargenContadoChange(p.id, e.target.value)} style={{ width: '70px' }} /> %</td>

                  {/* Fiado */}
                  <td><input type="number" step="0.01" value={v.precioFiadoUsd || ''} onChange={e => handleFiadoUsdChange(p.id, e.target.value)} style={{ width: '90px' }} /></td>
                  <td><input type="number" step="0.01" value={v.precioFiadoBs || ''} onChange={e => handleFiadoBsChange(p.id, e.target.value)} style={{ width: '90px' }} /></td>
                  <td><input type="number" step="0.01" value={v.margenFiado || ''} onChange={e => handleMargenFiadoChange(p.id, e.target.value)} style={{ width: '70px' }} /> %</td>

                  <td><button className="btn btn-success" onClick={() => guardarCambio(p.id)}>Guardar</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}