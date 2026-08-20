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
      if (resParam.data) {
        setTasaDolar(Number(resParam.data.tasaDolar));
      }
      const iniciales = {};
      resProd.data.forEach(p => {
        const costoBs = Number(p.costoLocal) || 0;
        const precioBs = Number(p.precioVenta) || 0;
        const precioUsd = Number(p.precioVentaUsd) || (precioBs / tasaDolar) || 0;
        const margen = calcularMargen(costoBs, precioBs);
        iniciales[p.id] = {
          precioBs: precioBs.toFixed(2),
          precioUsd: precioUsd.toFixed(2),
          margen: margen.toFixed(2)
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

  // Función segura para calcular margen
  const calcularMargen = (costo, precio) => {
    if (costo === 0) {
      return precio > 0 ? 100 : 0;
    }
    return ((precio - costo) / costo) * 100;
  };

  const handlePrecioBsChange = (productoId, valor) => {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;
    const precioBs = Number(valor);
    if (isNaN(precioBs)) return;

    const costoBs = Number(producto.costoLocal) || 0;
    const margen = calcularMargen(costoBs, precioBs);
    const precioUsd = precioBs / tasaDolar;

    setValores(prev => ({
      ...prev,
      [productoId]: {
        precioBs: valor,
        precioUsd: precioUsd.toFixed(2),
        margen: margen.toFixed(2)
      }
    }));
  };

  const handlePrecioUsdChange = (productoId, valor) => {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;
    const precioUsd = Number(valor);
    if (isNaN(precioUsd)) return;

    const precioBs = precioUsd * tasaDolar;
    const costoBs = Number(producto.costoLocal) || 0;
    const margen = calcularMargen(costoBs, precioBs);

    setValores(prev => ({
      ...prev,
      [productoId]: {
        precioBs: precioBs.toFixed(2),
        precioUsd: valor,
        margen: margen.toFixed(2)
      }
    }));
  };

  const handleMargenChange = (productoId, valor) => {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;
    const nuevoMargen = Number(valor);
    if (isNaN(nuevoMargen)) return;

    const costoBs = Number(producto.costoLocal) || 0;
    let precioBs = Number(valores[productoId]?.precioBs) || 0;
    let precioUsd = precioBs / tasaDolar;

    if (costoBs > 0) {
      precioBs = costoBs * (1 + nuevoMargen / 100);
      precioUsd = precioBs / tasaDolar;
    }

    setValores(prev => ({
      ...prev,
      [productoId]: {
        precioBs: precioBs.toFixed(2),
        precioUsd: precioUsd.toFixed(2),
        margen: valor
      }
    }));
  };

  const guardarCambio = async (productoId) => {
    const valoresActuales = valores[productoId];
    if (!valoresActuales) return;

    try {
      await api.put(`/productos/${productoId}/precio`, {
        precioVenta: Number(valoresActuales.precioBs),
        precioVentaUsd: Number(valoresActuales.precioUsd),
        margen: Number(valoresActuales.margen)
      });
      setMensaje('Cambio guardado correctamente');
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
              <th>Código</th>
              <th>Descripción</th>
              <th>Moneda</th>
              <th>Precio Costo BS</th>
              <th>Precio Venta BS</th>
              <th>Precio Venta USD</th>
              <th>Ganancia BS</th>
              <th>Margen %</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {productos.map(p => {
              const costoBs = Number(p.costoLocal) || 0;
              const val = valores[p.id] || { precioBs: '0.00', precioUsd: '0.00', margen: '0.00' };
              const precioBs = Number(val.precioBs) || 0;
              const precioUsd = Number(val.precioUsd) || 0;
              const gananciaBs = precioBs - costoBs;
              const margen = Number(val.margen) || 0;
              return (
                <tr key={p.id}>
                  <td>{p.codigo}</td>
                  <td>{p.nombre || p.descripcion}</td>
                  <td>{p.moneda}</td>
                  <td>{costoBs.toFixed(2)}</td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      value={val.precioBs}
                      onChange={e => handlePrecioBsChange(p.id, e.target.value)}
                      style={{ width: '100px' }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      value={val.precioUsd}
                      onChange={e => handlePrecioUsdChange(p.id, e.target.value)}
                      style={{ width: '100px' }}
                    />
                  </td>
                  <td>{gananciaBs.toFixed(2)}</td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      value={val.margen}
                      onChange={e => handleMargenChange(p.id, e.target.value)}
                      style={{ width: '80px' }}
                    />
                  </td>
                  <td>
                    <button className="btn btn-success" onClick={() => guardarCambio(p.id)}>Guardar</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}