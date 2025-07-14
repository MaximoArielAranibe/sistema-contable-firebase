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
  registrarHistorial,
  obtenerHistorialCliente,
} from "../services/clientesService";
import "../styles/clientes.scss";
import { getAuth } from "firebase/auth";
import Spinner from "./Spinner";
import { Circles } from 'react-loader-spinner';

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [deuda, setDeuda] = useState("");
  const [comentariosAdicionales, setComentariosAdicionales] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [deudaTotal, setDeudaToobal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [editandoComentario, setEditandoComentario] = useState(null);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [ordenSeleccionado, setOrdenSeleccionado] = useState("recientes");
  const [historiales, setHistoriales] = useState({});
  const [clienteHistorialVisible, setClienteHistorialVisible] = useState(null);
  const [usuarioLogeado, setUsuarioLogeado] = useState("");
  const [historialesVisibles, setHistorialesVisibles] = useState({});
  const [historialesCargando, setHistorialesCargando] = useState({});
  const [cargandoMasHistorial, setCargandoMasHistorial] = useState({});



  useEffect(() => {
    const auth = getAuth();
    const userEmail = auth.currentUser?.email || "Desconocido";
    setUsuarioLogeado(userEmail);
    cargarClientes();
  }, []);

  const calcularDeudaTotal = (clientes) => {
    const total = clientes.reduce((acc, cliente) => {
      const deudaNumerica = parseFloat(cliente.deuda);
      return acc + (isNaN(deudaNumerica) ? 0 : deudaNumerica);
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

  const toggleHistorial = async (clienteId) => {
    if (clienteHistorialVisible === clienteId) {
      setClienteHistorialVisible(null);
      return;
    }

    setHistorialesCargando((prev) => ({ ...prev, [clienteId]: true }))

    try {
      const historial = await obtenerHistorialCliente(clienteId);
      setHistoriales((prev) => ({ ...prev, [clienteId]: historial }));
      setHistorialesVisibles((prev) => ({ ...prev, [clienteId]: 5 }));
      setClienteHistorialVisible(clienteId);
    } catch (error) {
      toast.error("Error al cargar historial: " + error.message);
    } finally {
      setHistorialesCargando((prev) => ({ ...prev, [clienteId]: false }))
    }
  };

  const clientesOrdenados = [...clientes]
    .filter((cliente) => {
      if (!busqueda.trim()) return true;
      return [
        cliente.nombre,
        cliente.telefono,
        cliente.direccion,
        cliente.comentariosAdicionales,
      ].some((campo) => campo?.toLowerCase().includes(busqueda.toLowerCase()));
    })
    .sort((a, b) => {
      switch (ordenSeleccionado) {
        case "deudaAsc": return parseFloat(a.deuda || 0) - parseFloat(b.deuda || 0);
        case "deudaDesc": return parseFloat(b.deuda || 0) - parseFloat(a.deuda || 0);
        case "nombreAZ": return a.nombre.localeCompare(b.nombre);
        case "nombreZA": return b.nombre.localeCompare(a.nombre);
        default: return b.createdAt - a.createdAt;
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
    const auth = getAuth();
    const emailUsuario = auth.currentUser?.email || "sin email";
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
        deuda: parseFloat(deuda),
        comentariosAdicionales,
        createdAt: Date.now(),
        creadoPor: emailUsuario,
      };

      const nuevoId = await agregarCliente(nuevoClienteObj);
      const nuevoCliente = { id: nuevoId, ...nuevoClienteObj };
      toast.success("Cliente agregado con éxito");

      setClientes((prev) => {
        const nuevosClientes = [nuevoCliente, ...prev];
        calcularDeudaTotal(nuevosClientes);
        return nuevosClientes;
      });

      resetFormulario();
      setMostrarModal(false);
    } catch (error) {
      toast.error("Error al agregar cliente: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBorrarCliente = async (id) => {
    const confirmacion = prompt("Si estás seguro de eliminar este cliente, escribí: eliminar");
    if (confirmacion?.toLowerCase() !== "eliminar") {
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
    const input = prompt(`¿Cuánto querés ${operacion === "sumar" ? "sumar" : "restar"} a la deuda de ${name} ?`);
    const monto = parseFloat(input);
    if (isNaN(monto) || monto <= 0) return alert("Ingresá un número válido mayor que cero");

    try {
      const nuevaDeuda =
        operacion === "sumar"
          ? await sumarDeuda(id, monto)
          : await restarDeuda(id, monto);

      await registrarHistorial(id, operacion, monto);

      if (clienteHistorialVisible === id) {
        const historialActualizado = await obtenerHistorialCliente(id);
        setHistoriales((prev) => ({ ...prev, [id]: historialActualizado }));
      }

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
      await modificarCliente(clienteId, { comentariosAdicionales: nuevoComentario });
      setClientes((prev) =>
        prev.map((c) =>
          c.id === clienteId ? { ...c, comentariosAdicionales: nuevoComentario } : c
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
          <div className="usuario-logeado" style={{ marginBottom: "1rem" }}>
            <strong>Usuario logeado como:</strong> {usuarioLogeado}
          </div>

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

        <select
          value={ordenSeleccionado}
          onChange={(e) => setOrdenSeleccionado(e.target.value)}
          className="clientes__orden-select"
        >
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
                    <h4>
                      Deuda:{" "}
                      {cliente.deuda < 0
                        ? `$${Math.abs(cliente.deuda).toLocaleString("es-AR")} a favor`
                        : `$${cliente.deuda.toLocaleString("es-AR")}`}
                    </h4>

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
                  <button onClick={() => toggleHistorial(cliente.id)}>
                    {clienteHistorialVisible === cliente.id
                      ? "Ocultar Historial"
                      : "Ver Historial"}
                  </button>
                </div>
                {clienteHistorialVisible === cliente.id && (
                  <div className="cliente__historial">
                    {historialesCargando[cliente.id] ? (
                      <Spinner />
                    ) : historiales[cliente.id]?.length > 0 ? (
                      <>
                        <ul>
                          {historiales[cliente.id]
                            .slice(0, historialesVisibles[cliente.id] || 5)
                            .map((h) => (
                              <li key={h.id}>
                                <strong>{h.operacion === "sumar" ? "➕" : "➖"}</strong> ${h.monto} el{" "}
                                {new Date(h.timestamp).toLocaleString("es-AR")} por {h.realizadoPor}
                              </li>
                            ))}
                        </ul>

                        {historialesVisibles[cliente.id] < historiales[cliente.id].length && (
                          cargandoMasHistorial[cliente.id] ? (
                            <Spinner />
                          ) : (
                            <button
                              onClick={async () => {
                                setCargandoMasHistorial((prev) => ({
                                  ...prev,
                                  [cliente.id]: true,
                                }));
                                await new Promise((res) => setTimeout(res, 2000));
                                setHistorialesVisibles((prev) => ({
                                  ...prev,
                                  [cliente.id]: prev[cliente.id] + 5,
                                }));
                                setCargandoMasHistorial((prev) => ({
                                  ...prev,
                                  [cliente.id]: false,
                                }));
                              }}
                            >
                              Cargar más
                            </button>
                          )
                        )}
                      </>
                    ) : (
                      <p>No hay historial aún.</p>
                    )}
                  </div>
                )}

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
            <form
              onSubmit={handleAgregarCliente}
              className="clientes__modal-form"
            >
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
                onChange={(e) =>
                  setComentariosAdicionales(e.target.value)
                }
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
      )}
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}

export default Clientes;
