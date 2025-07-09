import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React, { useEffect, useState } from "react";
import {
  agregarCliente,
  obtenerClientes,
  eliminarCliente,
  restarDeuda,
  sumarDeuda,
  modificarCliente,
} from "../services/clientesService";
import "../styles/clientes.scss";

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [deuda, setDeuda] = useState("");
  const [comentariosAdicionales, setComentariosAdicionales] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [editandoComentario, setEditandoComentario] = useState(null);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [deudaTotal, setDeudaToobal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [ordenSeleccionado, setOrdenSeleccionado] = useState("recientes");

  useEffect(() => {
    cargarClientes();
  }, []);

  const calcularDeudaTotal = (clientes) => {
    const total = clientes.reduce((acc, cliente) => {
      return acc + parseFloat(cliente.deuda || 0);
    }, 0);
    setDeudaToobal(total);
  };

  const cargarClientes = async () => {
    try {
      const lista = await obtenerClientes();
      setClientes(lista);
      calcularDeudaTotal(lista);
    } catch (error) {
      alert("Error al cargar clientes: " + error.message);
    }
  };

  const clientesOrdenados = [...clientes]
    .filter((cliente) =>
      busqueda.trim()
        ? [cliente.nombre, cliente.telefono, cliente.direccion, cliente.comentariosAdicionales]
          .some((campo) =>
            campo?.toLowerCase().includes(busqueda.toLowerCase())
          )
        : true
    )
    .sort((a, b) => {
      switch(ordenSeleccionado){
        case "deudaAsc":
          return parseFloat(a.deuda || 0) - parseFloat(b.deuda || 0);
        case "deudaDesc":
          return parseFloat(b.deuda || 0) - parseFloat(a.deuda || 0);
        case "nombreAZ":
          return a.nombre.localeCompare(b.nombre)
        case "nombreZA":
          return b.nombre.localeCompare(a.nombre);
          default:
            return b.createdAt - a.createdAt;
      }
    });

  const resetFormulario = () => {
    setNombre("");
    setTelefono("");
    setDireccion("");
    setDeuda("");
    setComentariosAdicionales("");
  };

  const handleAgregarCliente = async (e) => {
    e.preventDefault();
    if (![nombre, telefono, direccion, deuda].every((campo) => campo.trim())) {
      toast.warning("Completa todos los campos");
      return;
    }

    try {
      setIsLoading(true);
      const nuevoClienteObj = {
        nombre,
        telefono,
        direccion,
        deuda,
        comentariosAdicionales,
        createdAt: Date.now(),
      };

      const nuevoId = await agregarCliente(nuevoClienteObj);
      const nuevoCliente = { id: nuevoId, ...nuevoClienteObj };
      toast.success("Cliente agregado con éxito");

      setClientes((prev) => [nuevoCliente, ...prev]);
      resetFormulario();
      setMostrarModal(false);
    } catch (error) {
      toast.error("Error al agregar cliente: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBorrarCliente = async (id) => {
    const confirmacion = prompt(
      "Si estás seguro de eliminar este cliente, escribí: eliminar"
    );

    confirmacion.toLowerCase();

    if (confirmacion !== "eliminar") {
      toast.warning("Cancelado. No se eliminó el cliente.");
      return;
    }

    try {
      await eliminarCliente(id);
      setClientes((prev) => prev.filter((cliente) => cliente.id !== id));
    } catch (error) {
      alert("Error al eliminar al cliente: " + error.message);
    }
  };

  const actualizarDeuda = async (id, operacion, name) => {
    const input = prompt(
      `¿Cuánto querés ${operacion === "sumar" ? "sumar" : "restar"} a la deuda de ${name} ?`
    );
    const monto = parseFloat(input);
    if (isNaN(monto) || monto <= 0)
      return alert("Ingresá un número válido mayor que cero");

    try {
      const nuevaDeuda =
        operacion === "sumar"
          ? await sumarDeuda(id, monto)
          : await restarDeuda(id, monto);

      setClientes((prev) => {
        const actualizados = prev.map((c) =>
          c.id === id ? { ...c, deuda: nuevaDeuda } : c
        );
        calcularDeudaTotal(actualizados);
        return actualizados;
      });
    } catch (error) {
      alert(`Error al ${operacion} deuda: ` + error.message);
    }
  };

  const guardarComentario = async (clienteId) => {
    try {
      await modificarCliente(clienteId, {
        comentariosAdicionales: nuevoComentario,
      });

      setClientes((prev) =>
        prev.map((c) =>
          c.id === clienteId
            ? { ...c, comentariosAdicionales: nuevoComentario }
            : c
        )
      );

      toast.success("Comentario actualizado");
      setEditandoComentario(null);
      setNuevoComentario("");
    } catch (error) {
      toast.error("Error al actualizar comentario: " + error.message);
    }
  };

  return (
    <div className="clientes">
      <div className="clientes__lista">
        <div className="clientes__lista-header">
          <h2 className="clientes__lista-title">Lista de Clientes</h2>
          <button
            onClick={() => setMostrarModal(true)}
            className="clientes__abrir-modal"
          >
            + Agregar Cliente
          </button>
        </div>

        <input
          type="text"
          placeholder="Buscar por nombre, dirección, teléfono..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="clientes__buscar"
        />

        <select value={ordenSeleccionado} onChange={(e) => setOrdenSeleccionado(e.target.value)} className="clientes__orden-select">
          <option value="recientes">Más recientes</option>
          <option value="deudaAsc">Deuda: menor a mayor</option>
          <option value="deudaDesc">Deuda: mayor a menor</option>
          <option value="nombreAZ">Nombre: A a Z</option>
          <option value="nombreZA">Nombre: Z a A</option>
        </select>

        {clientesOrdenados.length === 0 ? (
          <p>No se encontraron clientes</p>
        ) : (
          <ul>
            <h3 className="clientes__deuda-total">
              Deuda total: ${deudaTotal.toLocaleString("es-AR")}
            </h3>

            {clientesOrdenados.map((cliente) => (
              <li key={cliente.id} className="cliente">
                <div className="cliente__info">
                  <h4>Nombre: {cliente.nombre}</h4>
                  <h4>Teléfono: {cliente.telefono}</h4>
                  <h4>Dirección: {cliente.direccion}</h4>
                  <h4>
                    Deuda: ${Number(cliente.deuda).toLocaleString("es-AR")}
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
                        <button onClick={() => guardarComentario(cliente.id)}>
                          Guardar
                        </button>
                        <button onClick={() => setEditandoComentario(null)}>
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        {cliente.comentariosAdicionales || "Sin comentarios"}{" "}
                        <button
                          onClick={() => {
                            setEditandoComentario(cliente.id);
                            setNuevoComentario(
                              cliente.comentariosAdicionales || ""
                            );
                          }}
                        >
                          ✏️
                        </button>
                      </>
                    )}
                  </h4>
                </div>
                <div className="cliente__funciones">
                  <button onClick={() => handleBorrarCliente(cliente.id)}>
                    🗑️
                  </button>
                  <button
                    onClick={() =>
                      actualizarDeuda(cliente.id, "restar", cliente.nombre)
                    }
                  >
                    ➖
                  </button>
                  <button
                    onClick={() =>
                      actualizarDeuda(cliente.id, "sumar", cliente.nombre)
                    }
                  >
                    ➕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {mostrarModal && (
        <div className="clientes__modal-overlay">
          <div className="clientes__modal">
            <button
              onClick={() => setMostrarModal(false)}
              className="clientes__modal-cerrar"
            >
              ✖
            </button>
            <h2 className="clientes__modal-title">Agregar Cliente</h2>
            <form onSubmit={handleAgregarCliente} className="clientes__modal-form">
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
              <button type="submit" className="clientes__modal-button" disabled={isLoading}>
                {isLoading ? "Agregando..." : "Agregar"}
              </button>
            </form>
          </div>
        </div>
      )}

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}

export default Clientes;
