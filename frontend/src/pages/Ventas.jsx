import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Ventas() {
  const [productos, setProductos] = useState([]);
  const [tasaDolar, setTasaDolar] = useState(0);
  const [clienteCedula, setClienteCedula] = useState('');
  const [clienteNombre, setClienteNombre] = useState('');
  const [clientes, setClientes] = useState({});
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [productosEncontrados, setProductosEncontrados] = useState([]);
  const [detalles, setDetalles] = useState([]);
  const [tipoPago, setTipoPago] = useState('CONTADO');
  const [mensaje, setMensaje] = useState('');

  const cargarDatos = async () => {
    try {
      const [resProd, resParam, resVentas] = await Promise.all([
        api.get('/productos'),
        api.get('/parametros'),
        api.get('/ventas')
      ]);
      setProductos(resProd.data);
      if (resParam.data) setTasaDolar(Number(resParam.data.tasaDolar));

      const mapa = {};
      resVentas.data.forEach(v => {
        if (v.cliente) {
          const [cedula, ...nombrePartes] = v.cliente.split(' - ');
          if (cedula && nombrePartes.length > 0) {
            mapa[cedula] = nombrePartes.join(' - ');
          }
        }
      });
      setClientes(mapa);
    } catch (error) {
      console.error('Error al cargar datos', error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const buscarProductos = (termino) => {
    setTerminoBusqueda(termino);
    if (!termino.trim()) {
      setProductosEncontrados([]);
      return;
    }
    const filtrados = productos.filter(p =>
      p.codigo.toLowerCase().includes(termino.toLowerCase()) ||
      (p.nombre || p.descripcion).toLowerCase().includes(termino.toLowerCase())
    );
    setProductosEncontrados(filtrados);
  };

  const agregarProducto = (producto) => {
    const existente = detalles.find(d => d.productoId === producto.id);
    if (existente) {
      setDetalles(detalles.map(d =>
        d.productoId === producto.id ? { ...d, cantidad: d.cantidad + 1 } : d
      ));
    } else {
      const precioVenta = producto.moneda === 'USD'
        ? Number(producto.precioVentaUsd) * tasaDolar
        : Number(producto.precioVenta);
      setDetalles([...detalles, {
        productoId: producto.id,
        codigo: producto.codigo,
        descripcion: producto.nombre || producto.descripcion,
        cantidad: 1,
        precioVenta,
        precioVentaUsd: precioVenta / tasaDolar
      }]);
    }
    setTerminoBusqueda('');
    setProductosEncontrados([]);
  };

  const cambiarCantidad = (productoId, cantidad) => {
    setDetalles(detalles.map(d =>
      d.productoId === productoId ? { ...d, cantidad: Number(cantidad) } : d
    ));
  };

  const eliminarLinea = (productoId) => {
    setDetalles(detalles.filter(d => d.productoId !== productoId));
  };

  const totalBs = detalles.reduce((sum, d) => sum + d.precioVenta * d.cantidad, 0);
  const totalUsd = totalBs / tasaDolar;

  const registrarVenta = async () => {
    if (detalles.length === 0) {
      alert('Agregue al menos un producto');
      return;
    }
    if (!clienteCedula && !clienteNombre) {
      alert('Ingrese cédula o nombre del cliente');
      return;
    }
    try {
      await api.post('/ventas', {
        cliente: `${clienteCedula} - ${clienteNombre}`,
        metodoPago: tipoPago,
        detalles: detalles.map(d => ({
          productoId: d.productoId,
          cantidad: d.cantidad,
          precioVenta: d.precioVenta
        }))
      });
      setMensaje('✅ Venta registrada exitosamente');
      setDetalles([]);
      setClienteCedula('');
      setClienteNombre('');
      setTipoPago('CONTADO');
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      console.error('Error al registrar venta', error);
      alert(error.response?.data?.error || 'Error al registrar venta');
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px' }}>
      <div className="page-title" style={{ background: 'linear-gradient(135deg, #2b5876, #4e4376)', borderRadius: '12px' }}>
        <h1 style={{ margin: 0 }}>🛒 Punto de Venta</h1>
      </div>

      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <div style={{ flex: 1, minWidth: '150px', background: '#fff', borderRadius: '10px', padding: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <small style={{ color: '#6b7280' }}>Dólar</small>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{tasaDolar.toFixed(4)} Bs/USD</div>
        </div>
        <div style={{ flex: 1, minWidth: '150px', background: '#fff', borderRadius: '10px', padding: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <small style={{ color: '#6b7280' }}>Total BS</small>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2b5876' }}>{totalBs.toFixed(2)} Bs</div>
        </div>
        <div style={{ flex: 1, minWidth: '150px', background: '#fff', borderRadius: '10px', padding: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <small style={{ color: '#6b7280' }}>Total USD</small>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#4e4376' }}>${totalUsd.toFixed(2)}</div>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '10px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="Cédula"
            value={clienteCedula}
            onChange={e => {
              const cedula = e.target.value;
              setClienteCedula(cedula);
              if (clientes[cedula]) setClienteNombre(clientes[cedula]);
              else setClienteNombre('');
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('nombreCliente').focus();
              }
            }}
            style={{ flex: 1, minWidth: '120px', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
          />
          <input
            id="nombreCliente"
            type="text"
            placeholder="Nombre del cliente"
            value={clienteNombre}
            onChange={e => setClienteNombre(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('buscadorProducto').focus();
              }
            }}
            style={{ flex: 2, minWidth: '200px', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
          />
          <select
            value={tipoPago}
            onChange={e => setTipoPago(e.target.value)}
            style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', minWidth: '120px' }}
          >
            <option value="CONTADO">Contado</option>
            <option value="FIADO">Fiado</option>
          </select>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '10px', padding: '15px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <input
          id="buscadorProducto"
          type="text"
          placeholder="🔍 Buscar producto por código o nombre..."
          value={terminoBusqueda}
          onChange={e => buscarProductos(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && productosEncontrados.length > 0) {
              e.preventDefault();
              agregarProducto(productosEncontrados[0]);
              setTerminoBusqueda('');
              setProductosEncontrados([]);
              document.getElementById('buscadorProducto').focus();
            }
          }}
          style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '1rem' }}
        />
        {productosEncontrados.length > 0 && (
          <div style={{ maxHeight: '250px', overflowY: 'auto', marginTop: '10px' }}>
            {productosEncontrados.map(p => (
              <div
                key={p.id}
                onClick={() => agregarProducto(p)}
                style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span>{p.codigo} - {p.nombre || p.descripcion}</span>
                <span style={{ fontWeight: 'bold' }}>
                  {p.moneda === 'USD' ? `$${Number(p.precioVentaUsd).toFixed(2)}` : `Bs ${Number(p.precioVenta).toFixed(2)}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ background: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <h2 style={{ marginBottom: '15px' }}>Productos en Venta</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Descripción</th>
              <th>Cantidad</th>
              <th>Precio Bs</th>
              <th>Subtotal</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {detalles.map(d => (
              <tr key={d.productoId}>
                <td>{d.codigo}</td>
                <td>{d.descripcion}</td>
                <td>
                  <input
                    type="number"
                    min="1"
                    value={d.cantidad}
                    onChange={e => cambiarCantidad(d.productoId, e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        document.getElementById('btnRegistrarVenta').focus();
                      }
                    }}
                    style={{ width: '70px', padding: '5px' }}
                  />
                </td>
                <td>{d.precioVenta.toFixed(2)}</td>
                <td>{(d.precioVenta * d.cantidad).toFixed(2)}</td>
                <td>
                  <button className="btn btn-danger" onClick={() => eliminarLinea(d.productoId)}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
          <div>
            <div><strong>Total BS:</strong> {totalBs.toFixed(2)}</div>
            <div><strong>Total USD:</strong> ${totalUsd.toFixed(2)}</div>
          </div>
          <button id="btnRegistrarVenta" className="btn btn-success" onClick={registrarVenta} style={{ padding: '12px 30px', fontSize: '1.1rem' }}>
            Registrar Venta
          </button>
        </div>
        {mensaje && <p style={{ color: 'green', textAlign: 'center', marginTop: '10px' }}>{mensaje}</p>}
      </div>
    </div>
  );
}