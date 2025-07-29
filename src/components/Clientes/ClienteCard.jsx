import React from "react";
import HistorialCliente from "./HistorialCliente";

function ClienteCard({
  cliente,
  editandoComentario,
  nuevoComentario,
  setNuevoComentario,
  setEditandoComentario,
  guardarComentario,
  handleBorrarCliente,
  actualizarDeuda,
  toggleHistorial,
  clienteHistorialVisible,
  historiales,
  historialesVisibles,
  setHistorialesVisibles,
  cargandoMasHistorial,
  setCargandoMasHistorial,
  historialesCargando,
  handleActualizarNombreCliente,
  handleActualizarDireccionCliente,
  handleActualizarTelefonoCliente,
  handleActualizarFechaAPagar
}) {
  function obtenerFechaInput(fechaAPagar) {
    if (!fechaAPagar) return "";

    if (fechaAPagar.toDate && typeof fechaAPagar.toDate === "function") {
      const date = fechaAPagar.toDate();
      if (!isNaN(date.getTime())) {
        return date.toISOString().split("T")[0];
      }
    }

    const date = new Date(fechaAPagar);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }

    return "";
  }

  return (
    <li key={cliente.id} className="cliente">
      <div className="cliente__info">
        <h4 className="d-flex-row">
          Nombre: {cliente.nombre}{" "}
          <button
            onClick={() => handleActualizarNombreCliente(cliente.id, cliente.nombre)}
            className="button-lapiz"
            aria-label="Editar nombre"
          >
            ✏️
          </button>
        </h4>

        <h4>Teléfono: {cliente.telefono}
          <button
            onClick={() => handleActualizarTelefonoCliente(cliente.id, cliente.telefono)}
            className="button-lapiz"
            aria-label="Editar télefono"
          >
            ✏️
          </button>
        </h4>

        <h4>Dirección: {cliente.direccion}
          <button
            onClick={() => handleActualizarDireccionCliente(cliente.id, cliente.direccion)}
            className="button-lapiz"
            aria-label="Editar dirección"
          >
            ✏️
          </button>
        </h4>

        <h4>
          Deuda:{" "}
          {cliente.deuda < 0
            ? `$${Math.abs(cliente.deuda).toLocaleString("es-AR")} a favor`
            : `$${cliente.deuda.toLocaleString("es-AR")}`}
        </h4>

        <h4>
          Comentarios:{" "}
          {editandoComentario === cliente.id ? (
            <>
              <input
                type="text"
                value={nuevoComentario}
                onChange={(e) => setNuevoComentario(e.target.value)}
              />
              <button onClick={() => guardarComentario(cliente.id)}>Guardar</button>
              <button onClick={() => setEditandoComentario(null)}>Cancelar</button>
            </>
          ) : (
            <>
              {cliente.comentariosAdicionales || "Sin comentarios"}{" "}
              <button
                onClick={() => {
                  setEditandoComentario(cliente.id);
                  setNuevoComentario(cliente.comentariosAdicionales || "");
                }}
                className="button-lapiz"
                aria-label="Editar comentario"
              >
                ✏️
              </button>

              <div className="form-group">
                <label htmlFor={`fecha-${cliente.id}`} className="form-label">
                  Fecha a pagar:
                </label>
                <input
                  type="date"
                  id={`fecha-${cliente.id}`}
                  className="form-control"
                  value={obtenerFechaInput(cliente.fechaAPagarTimestamp)}
                  onChange={(e) => handleActualizarFechaAPagar(cliente.id, e.target.value)}
                />
              </div>
            </>
          )}
        </h4>
      </div>

      <div className="cliente__funciones">
        <button onClick={() => handleBorrarCliente(cliente.id)}>🗑️</button>
        <button onClick={() => actualizarDeuda(cliente.id, "restar", cliente.nombre)}>➖</button>
        <button onClick={() => actualizarDeuda(cliente.id, "sumar", cliente.nombre)}>➕</button>
        <button onClick={() => toggleHistorial(cliente.id)}>
          {clienteHistorialVisible === cliente.id ? "Ocultar Historial" : "Ver Historial"}
        </button>
      </div>

      {clienteHistorialVisible === cliente.id && (
        <HistorialCliente
          clienteId={cliente.id}
          historial={historiales[cliente.id]}
          cargando={historialesCargando[cliente.id]}
          historialVisible={historialesVisibles[cliente.id]}
          setHistorialesVisibles={setHistorialesVisibles}
          cargandoMas={cargandoMasHistorial[cliente.id]}
          setCargandoMasHistorial={setCargandoMasHistorial}
        />
      )}
    </li>
  );
}

export default ClienteCard;
