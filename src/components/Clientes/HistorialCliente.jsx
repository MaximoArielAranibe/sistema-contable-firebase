
import '../../styles/historialCliente.scss';
import React from 'react';
import Spinner from '../Spinner';

function HistorialCliente({
  clienteId,
  historial,
  cargando,
  historialVisible,
  setHistorialesVisibles,
  cargandoMas,
  setCargandoMasHistorial,
}) {
  const handleCargarMas = async () => {
    setCargandoMasHistorial((prev) => ({
      ...prev,
      [clienteId]: true,
    }));
    setHistorialesVisibles((prev) => ({
      ...prev,
      [clienteId]: prev[clienteId] + 5,
    }));
    setCargandoMasHistorial((prev) => ({
      ...prev,
      [clienteId]: false,
    }));
  };

  if (cargando) return <Spinner />;

  if (!historial || historial.length === 0) {
    return <p className="historial__vacio">No hay historial aún.</p>;
  }

  return (
    <div className="cliente__historial">
      <ul>
        <strong>Historial</strong>
        {historial.slice(0, historialVisible || 5).map((h) => (
          <li key={h.id} className="historial__item">
            <div className="historial__header">
              <span className="historial__tipo">
                {h.operacion === 'sumar' ? '➕' : h.operacion === 'restar' ? '➖' : '🔄'}
              </span>
              <span className="historial__monto">
                {typeof h.monto === 'number' ? `$${h.monto.toLocaleString("es-AR")}` : h.monto}
              </span>
              <span className="historial__fecha">
                {h.timestamp?.toDate ? h.timestamp.toDate().toLocaleString("es-AR") : "Fecha inválida"}
              </span>
            </div>

            {h.comentario && (
              <div className="historial__comentario">
                💬 {h.comentario}
              </div>
            )}
          </li>

        ))}
      </ul>

      {historial.length > (historialVisible || 5) && (
        <button
          onClick={handleCargarMas}
          className="historial__cargar-mas"
          disabled={cargandoMas}
        >
          {cargandoMas ? '⏳ Cargando...' : '⬇️ Cargar más'}
        </button>
      )}
    </div>
  );
}

export default HistorialCliente;