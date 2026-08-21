import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Inicio() {
  const [totales, setTotales] = useState({ productos: 0, ventas: 0, compras: 0, proveedores: 0 });

  const cargarResumen = async () => {
    try {
      const [prod, vent, comp, prov] = await Promise.all([
        api.get('/productos'),
        api.get('/ventas'),
        api.get('/compras'),
        api.get('/proveedores')
      ]);
      setTotales({
        productos: prod.data.length,
        ventas: vent.data.length,
        compras: comp.data.length,
        proveedores: prov.data.length
      });
    } catch (error) {
      console.error('Error al cargar resumen', error);
    }
  };

  useEffect(() => {
    cargarResumen();
  }, []);

  const maxValor = Math.max(totales.productos, totales.ventas, totales.compras, totales.proveedores, 1);

  return (
    <div>
      <div className="page-title" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
        <h1>🏪 Bienvenido al Sistema Mi Bodega</h1>
      </div>

      <div className="card">
        <h2>Resumen General</h2>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '150px', background: '#f0f4ff', padding: '15px', borderRadius: '10px' }}>
            <small>Productos</small>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{totales.productos}</div>
          </div>
          <div style={{ flex: 1, minWidth: '150px', background: '#e6f7e6', padding: '15px', borderRadius: '10px' }}>
            <small>Ventas</small>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{totales.ventas}</div>
          </div>
          <div style={{ flex: 1, minWidth: '150px', background: '#fdeaea', padding: '15px', borderRadius: '10px' }}>
            <small>Compras</small>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{totales.compras}</div>
          </div>
          <div style={{ flex: 1, minWidth: '150px', background: '#fff8e1', padding: '15px', borderRadius: '10px' }}>
            <small>Proveedores</small>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{totales.proveedores}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Gráfico simple</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { label: 'Productos', valor: totales.productos, color: '#667eea' },
            { label: 'Ventas', valor: totales.ventas, color: '#10b981' },
            { label: 'Compras', valor: totales.compras, color: '#ef4444' },
            { label: 'Proveedores', valor: totales.proveedores, color: '#f59e0b' },
          ].map(item => (
            <div key={item.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>{item.label}</span>
                <span>{item.valor}</span>
              </div>
              <div style={{ background: '#e5e7eb', borderRadius: '10px', height: '20px', overflow: 'hidden' }}>
                <div style={{ width: `${(item.valor / maxValor) * 100}%`, background: item.color, height: '100%', borderRadius: '10px', transition: 'width 0.5s' }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}