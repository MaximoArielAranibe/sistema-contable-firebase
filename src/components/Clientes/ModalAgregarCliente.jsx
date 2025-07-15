import React from "react";

function ModalAgregarCliente({
  mostrarModal,
  onClose,
  onSubmit,
  isLoading,
  nombre,
  setNombre,
  telefono,
  setTelefono,
  direccion,
  setDireccion,
  deuda,
  setDeuda,
  comentariosAdicionales,
  setComentariosAdicionales
}) {
  if (!mostrarModal) return null;

  return (
    <div className="clientes__modal-overlay">
      <div className="clientes__modal">
        <button
          onClick={onClose}
          className="clientes__modal-cerrar"
        >
          ✖
        </button>
        <h2 className="clientes__modal-title">Agregar Cliente</h2>
        <form onSubmit={onSubmit} className="clientes__modal-form">
          <input
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <input
            placeholder="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
          <input
            placeholder="Dirección"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
          />
          <input
            placeholder="Deuda"
            type="number"
            value={deuda}
            onChange={(e) => setDeuda(e.target.value)}
          />
          <input
            placeholder="Comentarios adicionales..."
            value={comentariosAdicionales}
            onChange={(e) => setComentariosAdicionales(e.target.value)}
          />
          <button
            type="submit"
            className="clientes__modal-button"
            disabled={isLoading}
          >
            {isLoading ? "Agregando..." : "Agregar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ModalAgregarCliente;
