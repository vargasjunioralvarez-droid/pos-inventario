import { useState } from 'react';
import api from '../services/api';

export default function Reportes() {
  const [fechaInicio, setFechaInicio] = useState('2026-01-01');
  const [fechaFin, setFechaFin] = useState('2026-12-31');
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(10);

  const consultar = async () => {
    if (!fechaInicio || !fechaFin) {
      alert('Seleccione ambas fechas');
      return;
    }
    setCargando(true);
    setError('');
    setPaginaActual(1);
    try {
      const res = await api.get('/reportes/inventario', {
        params: { fechaInicio, fechaFin }
      });
      setDatos(res.data);
    } catch (err) {
      setError('No se pudo cargar el reporte');
    } finally {
      setCargando(false);
    }
  };

  const obtenerSemana = (fecha) => {
    const d = new Date(fecha);
    const diaInicio = new Date(d.getFullYear(), 0, 1);
    const dias = Math.floor((d - diaInicio) / (24 * 60 * 60 * 1000));
    return Math.ceil((dias + diaInicio.getDay() + 1) / 7);
  };

  const semanaInicio = fechaInicio ? obtenerSemana(fechaInicio) : '';
  const semanaFin = fechaFin ? obtenerSemana(fechaFin) : '';
  const rangoSemana = semanaInicio === semanaFin ? `Semana ${semanaInicio}` : `Semanas ${semanaInicio} - ${semanaFin}`;

  const indiceUltimo = paginaActual * itemsPorPagina;
  const indicePrimero = indiceUltimo - itemsPorPagina;
  const datosPaginados = datos.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(datos.length / itemsPorPagina);

  const cambiarPagina = (numero) => {
    setPaginaActual(numero);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalVentas = datos.reduce((s, item) => s + (Number(item.totalVenta) || 0), 0);
  const totalCosto = datos.reduce((s, item) => s + (Number(item.costoUnitario) * Number(item.ventas)), 0);
  const totalGanancia = totalVentas - totalCosto;
  const totalPerdida = datos.reduce((s, item) => s + Number(item.perdidaBs), 0);

  const porcentajeGanancia = totalVentas > 0 ? ((totalGanancia * 100) / totalVentas).toFixed(2) : '0.00';
  const porcentajePerdida = totalVentas > 0 ? ((totalPerdida * 100) / totalVentas).toFixed(2) : '0.00';

  const formatearFecha = (fecha) => {
    const d = new Date(fecha);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="reporte-container">
      <div className="page-title no-print">
        <h1>📊 Reportes de Inventario y Ganancias</h1>
      </div>

      <div className="card filtros-card no-print">
        <div className="flex gap-10 items-center flex-wrap">
          <label>Desde:</label>
          <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
          <label>Hasta:</label>
          <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
          <button className="btn btn-primary" onClick={consultar}>Consultar</button>
        </div>
      </div>

      {datos.length > 0 && (
        <div className="card info-fechas">
          <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', fontSize: '15px' }}>
            <div>
              <strong>📅 Período:</strong> {formatearFecha(fechaInicio)} - {formatearFecha(fechaFin)}
            </div>
            <div>
              <strong>📆 {rangoSemana}</strong>
            </div>
            <div>
              <strong>📦 Total Productos:</strong> {datos.length}
            </div>
          </div>
        </div>
      )}

      {cargando && <p className="cargando">Cargando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {datos.length > 0 && (
        <>
          <div className="card tabla-container">
            <div className="tabla-scroll-wrapper">
              <table className="tabla-reporte" id="tabla-reporte">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Código</th>
                    <th>Producto</th>
                    <th>Inv.Inicial</th>
                    <th>Compras</th>
                    <th>Vtas Contado</th>
                    <th>Vtas Fiado</th>
                    <th>Vtas Totales</th>
                    <th>Inv.Final</th>
                    <th>Inv.Físico</th>
                    <th>Diferencia</th>
                    <th>Pérdida Und</th>
                    <th>Costo Unit.</th>
                    <th>Precio Venta</th>
                    <th>% Ganan.</th>
                    <th>Ganancia Total</th>
                    <th>Total Venta</th>
                    <th>Total Pérdida</th>
                  </tr>
                </thead>
                <tbody>
                  {datosPaginados.map((item, index) => (
                    <tr key={item.productoId}>
                      <td>{indicePrimero + index + 1}</td>
                      <td>{item.codigo}</td>
                      <td className="nombre-producto">{item.nombre}</td>
                      <td>{Number(item.inventarioInicial).toFixed(2)}</td>
                      <td>{Number(item.compras).toFixed(2)}</td>
                      <td>{Number(item.ventasContado || 0).toFixed(2)}</td>
                      <td>{Number(item.ventasFiado || 0).toFixed(2)}</td>
                      <td>{Number(item.ventas || 0).toFixed(2)}</td>
                      <td>{Number(item.inventarioFinal).toFixed(2)}</td>
                      <td>{Number(item.inventarioFisico).toFixed(2)}</td>
                      <td className={item.diferencia >= 0 ? 'text-warning' : 'text-success'}>
                        {Number(item.diferencia).toFixed(2)}
                      </td>
                      <td className="text-danger">{Number(item.perdida).toFixed(2)}</td>
                      <td>{Number(item.costoUnitario).toFixed(2)}</td>
                      <td>{Number(item.precioVenta).toFixed(2)}</td>
                      <td>
                        {Number(item.costoUnitario) > 0
                          ? (((Number(item.precioVenta) - Number(item.costoUnitario)) / Number(item.costoUnitario)) * 100).toFixed(2)
                          : '0'}%
                      </td>
                      <td className={item.gananciaTotal >= 0 ? 'text-success' : 'text-danger'}>
                        {Number(item.gananciaTotal).toFixed(2)}
                      </td>
                      <td>{Number(item.totalVenta).toFixed(2)}</td>
                      <td className="text-danger">{Number(item.perdidaBs).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPaginas > 1 && (
              <div className="paginacion no-print">
                <button 
                  onClick={() => cambiarPagina(paginaActual - 1)} 
                  disabled={paginaActual === 1}
                  className="btn-paginacion"
                >
                  ◀ Anterior
                </button>
                <span className="info-pagina">
                  Página {paginaActual} de {totalPaginas}
                </span>
                <button 
                  onClick={() => cambiarPagina(paginaActual + 1)} 
                  disabled={paginaActual === totalPaginas}
                  className="btn-paginacion"
                >
                  Siguiente ▶
                </button>
              </div>
            )}
          </div>

          <div className="card resumen-totales">
            <h2>📈 Resumen de Totales</h2>
            <div className="grid-totales">
              <div className="total-item">
                <span>Total Venta:</span>
                <strong className="text-primary">{totalVentas.toFixed(2)}</strong>
              </div>
              <div className="total-item">
                <span>Total Costo:</span>
                <strong className="text-primary">{totalCosto.toFixed(2)}</strong>
              </div>
              <div className="total-item">
                <span>Total Ganancia:</span>
                <strong className={totalGanancia >= 0 ? 'text-success' : 'text-danger'}>
                  {totalGanancia.toFixed(2)} ({porcentajeGanancia}%)
                </strong>
              </div>
              <div className="total-item">
                <span>Total Pérdida:</span>
                <strong className="text-danger">
                  {totalPerdida.toFixed(2)} ({porcentajePerdida}%)
                </strong>
              </div>
            </div>
          </div>

          <div className="no-print" style={{ marginTop: '20px', textAlign: 'center' }}>
            <button 
              className="btn btn-success" 
              onClick={() => window.print()}
              style={{ padding: '12px 30px', fontSize: '16px' }}
            >
              🖨️ Imprimir Reporte
            </button>
          </div>
        </>
      )}

      {datos.length === 0 && !cargando && !error && (
        <p>No hay datos para mostrar. Seleccione un rango y haga clic en Consultar.</p>
      )}

      <style jsx>{`
        .reporte-container {
          padding: 20px;
          max-width: 100%;
        }

        .filtros-card {
          margin-bottom: 20px;
        }

        .info-fechas {
          background: #f0f7ff;
          border-left: 4px solid #3b82f6;
          margin-bottom: 20px;
          padding: 12px 20px;
        }

        .tabla-container {
          overflow: hidden;
          padding: 0;
        }

        .tabla-scroll-wrapper {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .tabla-reporte {
          width: 100%;
          min-width: 1200px;
          font-size: 13px;
          border-collapse: collapse;
        }

        .tabla-reporte th {
          background: #1e293b;
          color: #ffffff;
          padding: 10px 6px;
          text-align: center;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          position: sticky;
          top: 0;
          z-index: 10;
          border: 1px solid #334155;
        }

        .tabla-reporte td {
          padding: 8px 6px;
          text-align: center;
          border-bottom: 1px solid #e2e8f0;
          font-size: 12px;
          white-space: nowrap;
          border: 1px solid #e2e8f0;
        }

        .tabla-reporte tr:nth-child(even) {
          background: #f8fafc;
        }

        .tabla-reporte tr:hover {
          background: #e2e8f0;
        }

        .nombre-producto {
          text-align: left !important;
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .text-success {
          color: #10b981;
          font-weight: 600;
        }

        .text-danger {
          color: #ef4444;
          font-weight: 600;
        }

        .text-warning {
          color: #f59e0b;
          font-weight: 600;
        }

        .text-primary {
          color: #3b82f6;
        }

        .paginacion {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          padding: 15px;
          border-top: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .btn-paginacion {
          padding: 10px 25px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }

        .btn-paginacion:hover:not(:disabled) {
          background: #f1f5f9;
          border-color: #94a3b8;
        }

        .btn-paginacion:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .info-pagina {
          font-size: 15px;
          font-weight: 600;
        }

        .resumen-totales {
          margin-top: 20px;
        }

        .resumen-totales h2 {
          font-size: 18px;
          margin-bottom: 10px;
        }

        .grid-totales {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 15px;
          margin-top: 10px;
        }

        .total-item {
          display: flex;
          justify-content: space-between;
          padding: 12px 18px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          font-size: 15px;
        }

        .total-item span {
          color: #64748b;
        }

        .total-item strong {
          font-size: 18px;
        }

        .cargando {
          text-align: center;
          padding: 40px;
          font-size: 18px;
        }

        /* ESTILOS PARA IMPRESIÓN */
        @media print {
          /* Ocultar TODO lo que no debe aparecer en impresión */
          .no-print {
            display: none !important;
          }

          /* Ocultar menú lateral y header */
          nav, 
          header,
          .sidebar,
          .menu-lateral,
          .navbar,
          .header,
          aside,
          .aside-menu,
          [class*="sidebar"],
          [class*="menu-lateral"],
          [class*="side-menu"],
          [class*="navigation"],
          [class*="nav-menu"] {
            display: none !important;
          }

          /* Asegurar que el contenido principal ocupe todo el ancho */
          .reporte-container {
            padding: 0;
            margin: 0;
            width: 100% !important;
            max-width: 100% !important;
          }

          /* Ocultar elementos específicos del reporte */
          .filtros-card,
          .btn-success,
          .paginacion {
            display: none !important;
          }

          .tabla-scroll-wrapper {
            overflow: visible !important;
          }

          .tabla-reporte {
            min-width: auto;
            font-size: 9px;
            width: 100%;
            border-collapse: collapse;
          }

          .tabla-reporte th {
            background: #ffffff !important;
            color: #000000 !important;
            padding: 5px 3px;
            font-size: 8px;
            font-weight: 700;
            border: 1px solid #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          .tabla-reporte td {
            padding: 4px 3px;
            font-size: 8px;
            border: 1px solid #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          .tabla-reporte tr:nth-child(even) {
            background: #f1f5f9 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          .tabla-reporte tr:nth-child(odd) {
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          .nombre-producto {
            max-width: 80px;
          }

          .info-fechas {
            border-left: 4px solid #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            background: #ffffff !important;
            font-size: 11px !important;
            padding: 8px 15px;
            margin-bottom: 10px;
            border: 1px solid #000000 !important;
          }

          .info-fechas div {
            font-size: 11px !important;
          }

          .card {
            border: 1px solid #000000 !important;
            box-shadow: none !important;
            page-break-inside: avoid;
            margin-bottom: 10px;
          }

          .tabla-container {
            border: 1px solid #000000 !important;
          }

          .grid-totales {
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
          }

          .total-item {
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            padding: 6px 12px;
            font-size: 11px;
            border: 1px solid #000000 !important;
          }

          .total-item strong {
            font-size: 13px;
          }

          .text-success {
            color: #10b981 !important;
          }
          .text-danger {
            color: #ef4444 !important;
          }
          .text-warning {
            color: #f59e0b !important;
          }
          .text-primary {
            color: #3b82f6 !important;
          }

          .resumen-totales h2 {
            font-size: 13px;
            margin-bottom: 5px;
          }

          thead {
            display: table-header-group;
          }

          tr {
            page-break-inside: avoid;
          }

          /* Ocultar cualquier otro elemento no deseado */
          .page-title {
            display: none !important;
          }
        }

        @media (max-width: 768px) {
          .tabla-reporte {
            font-size: 11px;
            min-width: 1000px;
          }
          .tabla-reporte th {
            font-size: 10px;
            padding: 6px 4px;
          }
          .tabla-reporte td {
            font-size: 10px;
            padding: 5px 4px;
          }
          .nombre-producto {
            max-width: 100px;
          }
          .grid-totales {
            grid-template-columns: 1fr 1fr;
          }
          .total-item {
            font-size: 13px;
          }
          .total-item strong {
            font-size: 15px;
          }
        }
      `}</style>
    </div>
  );
}