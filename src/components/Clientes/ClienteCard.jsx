import React from "react";
import Spinner from "../../components/Spinner";
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
  handleCambiarNombreCliente
}) {
  return (
    <li key={cliente.id} className="cliente">
      <div className="cliente__info">
        <h4 className="d-flex-row">
          Nombre: {cliente.nombre}{" "}
          <button
            onClick={() => handleCambiarNombreCliente(cliente.id, cliente.nombre)}
            className="button-lapiz"
            aria-label="Editar nombre"
          >
            ✏️
          </button>
        </h4>

        <h4>Teléfono: {cliente.telefono}</h4>
        <h4>Dirección: {cliente.direccion}</h4>
        <h4>
          Deuda:{" "}
          {cliente.deuda < 0
            ? `$${Math.abs(cliente.deuda).toLocaleString("es-AR")} a favor`
            : `$${cliente.deuda.toLocaleString("es-AR")}`}
        </h4>
        <h4 className="">
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
            </>
          )}
        </h4>
      </div>

      <div className="cliente__funciones">
        <button onClick={() => handleBorrarCliente(cliente.id)}>🗑️</button>
        <button onClick={() => actualizarDeuda(cliente.id, "restar", cliente.nombre)}>
          ➖
        </button>
        <button onClick={() => actualizarDeuda(cliente.id, "sumar", cliente.nombre)}>
          ➕
        </button>
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
