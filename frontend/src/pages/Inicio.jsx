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

  const tarjetas = [
    { label: 'Productos', valor: totales.productos, color: '#667eea', icono: '📦' },
    { label: 'Ventas', valor: totales.ventas, color: '#10b981', icono: '💰' },
    { label: 'Compras', valor: totales.compras, color: '#ef4444', icono: '🛒' },
    { label: 'Proveedores', valor: totales.proveedores, color: '#f59e0b', icono: '🏢' },
  ];

  return (
    <div>
      <div className="page-title" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: '12px', padding: '25px' }}>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>🏪 Bienvenido al Sistema Mi Bodega</h1>
        <p style={{ marginTop: '8px', opacity: '0.9' }}>Resumen general de tu negocio</p>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '20px' }}>Resumen General</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {tarjetas.map(item => (
            <div
              key={item.label}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'default'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{ fontSize: '2.5rem' }}>{item.icono}</div>
              <div>
                <small style={{ color: '#6b7280' }}>{item.label}</small>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: item.color }}>{item.valor}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '20px' }}>Gráfico de Resumen</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {tarjetas.map(item => (
            <div key={item.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontWeight: '500' }}>{item.label}</span>
                <span style={{ fontWeight: 'bold', color: item.color }}>{item.valor}</span>
              </div>
              <div style={{ background: '#e5e7eb', borderRadius: '10px', height: '25px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${(item.valor / maxValor) * 100}%`,
                    background: `linear-gradient(90deg, ${item.color}, ${item.color}cc)`,
                    height: '100%',
                    borderRadius: '10px',
                    transition: 'width 1s ease'
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}