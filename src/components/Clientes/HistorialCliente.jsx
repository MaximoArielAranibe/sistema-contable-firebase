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
    await new Promise((res) => setTimeout(res, 2000));
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
    return <p>No hay historial aún.</p>
  };

  return (
    <div className="cliente__historial">
      <ul>{historial.slice(0, historialVisible || 5).map((h) => (
        <li key={h.id}>
          <strong>{h.operacion === "sumar" ? "➕" : "➖"}</strong> ${h.monto} el{" "}
          {new Date(h.timestamp).toLocaleString("es-AR")} por {h.realizadoPor}
        </li>
      ))}</ul>
      {historial.length > (historialVisible || 5) && (
        <button onClick={handleCargarMas} disabled={cargandoMas}>
          {cargandoMas ? "Cargando..." : "Cargar más"}
        </button>
      )}
    </div>
  )
}

export default HistorialCliente;