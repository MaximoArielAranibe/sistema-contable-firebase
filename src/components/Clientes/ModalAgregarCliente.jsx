import React from "react";
import '../../styles/modalAgregarCliente.scss'

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
  fechaAPagar,
  setFechaAPagar,
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
          <label className="clientes__modal-label">
            <h4>Nombre <span>*</span></h4>
            <input
              placeholder="Nombre del cliente"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </label>

          <label className="clientes__modal-label">
            <h4>Teléfono (opcional)</h4>
            <input
              placeholder="Teléfono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              type="tel"
            />
          </label>

          <label className="clientes__modal-label">
            <h4>Dirección (opcional)</h4>
            <input
              placeholder="Dirección"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
            />
          </label>

          <label className="clientes__modal-label">
            <h4>Deuda <span>*</span></h4>
            <input
              placeholder="0"
              type="number"
              value={deuda}
              onChange={(e) => setDeuda(e.target.value)}
              required
              min="0"
              step="any"
            />
          </label>

          <label htmlFor="" className="clientes__modal-label">
            <h4>Fecha a pagar: <span>*</span></h4>
            <input type="date"
              placeholder="DD/MM/AAAA"
              value={fechaAPagar}
              onChange={(e) => setFechaAPagar(e.target.value)}
              required
              />
          </label>

          <label className="clientes__modal-label">
            <h4>Comentarios adicionales (opcional)</h4>
            <input
              placeholder="Notas adicionales"
              value={comentariosAdicionales}
              onChange={(e) => setComentariosAdicionales(e.target.value)}
            />
          </label>

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
