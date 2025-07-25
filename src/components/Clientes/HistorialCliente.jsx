
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
          <li key={h.id}>
            <strong>{h.operacion === 'sumar' ? '➕' : '➖'}</strong> ${h.monto} el{' '}
            {h.timestamp && !isNaN(new Date(h.timestamp))
              ? new Date(h.timestamp).toLocaleString('es-AR')
              : 'Fecha inválida'}

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
