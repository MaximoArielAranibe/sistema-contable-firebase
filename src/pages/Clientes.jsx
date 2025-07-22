import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React, { useState } from "react";
import {
  agregarCliente,
  eliminarCliente,
} from "../services/clientesService";
import "../styles/index.scss";
import ModalAgregarCliente from "../components/Clientes/ModalAgregarCliente";
import ClienteCard from "../components/Clientes/ClienteCard";
import { useClientes } from "../hooks/useClientes";
import { useFormularioCliente } from "../hooks/useFormularioCliente";
import { ordenarYFiltrarClientes } from "../helpers/ordenarClientes";
import {
  actualizarDeudaCliente,
  guardarComentarioCliente,
  actualizarNombreCliente
} from "../helpers/clienteActions";



function Clientes() {
  const {
    clientes,
    setClientes,
    deudaTotal,
    calcularDeudaTotal,
    historiales,
    setHistoriales,
    clienteHistorialVisible,
    historialesVisibles,
    setHistorialesVisibles,
    historialesCargando,
    cargandoMasHistorial,
    setCargandoMasHistorial,
    usuarioLogeado,
    toggleHistorial,
  } = useClientes();

  const {
    nombre, setNombre,
    telefono, setTelefono,
    direccion, setDireccion,
    deuda, setDeuda,
    comentariosAdicionales, setComentariosAdicionales,
    resetFormulario
  } = useFormularioCliente();

  // Estados propios del componente
  const [mostrarModal, setMostrarModal] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [ordenSeleccionado, setOrdenSeleccionado] = useState("recientes");
  const [editandoComentario, setEditandoComentario] = useState(null);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const clientesOrdenados = ordenarYFiltrarClientes(clientes, busqueda, ordenSeleccionado);



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
        deuda: parseFloat(deuda),
        comentariosAdicionales,
        createdAt: Date.now(),
        creadoPor: usuarioLogeado,
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
      setClientes((prev) => {
        const actualizados = prev.filter((cliente) => cliente.id !== id);
        calcularDeudaTotal(actualizados);
        return actualizados;
      });
    } catch (error) {
      alert("Error al eliminar al cliente: " + error.message);
    }
  };

  const handleCambiarNombreCliente = (clienteId, nombreActual) => {
    actualizarNombreCliente({ clienteId, nombreActual, setClientes });
  };


  const actualizarDeuda = (id, operacion, name) => {
    actualizarDeudaCliente({
      id,
      operacion,
      name,
      setClientes,
      calcularDeudaTotal,
      setHistoriales,
      clienteHistorialVisible
    });
  };

  const guardarComentario = (clienteId) => {
    guardarComentarioCliente({
      clienteId,
      nuevoComentario,
      setClientes,
      setEditandoComentario,
      setNuevoComentario
    });
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
            className="clientes__modal-abrir"
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
              <ClienteCard
                key={cliente.id}
                cliente={cliente}
                editandoComentario={editandoComentario}
                nuevoComentario={nuevoComentario}
                setNuevoComentario={setNuevoComentario}
                setEditandoComentario={setEditandoComentario}
                guardarComentario={guardarComentario}
                handleBorrarCliente={handleBorrarCliente}
                actualizarDeuda={actualizarDeuda}
                toggleHistorial={toggleHistorial}
                clienteHistorialVisible={clienteHistorialVisible}
                historiales={historiales}
                historialesVisibles={historialesVisibles}
                setHistorialesVisibles={setHistorialesVisibles}
                cargandoMasHistorial={cargandoMasHistorial}
                setCargandoMasHistorial={setCargandoMasHistorial}
                historialesCargando={historialesCargando}
                handleCambiarNombreCliente={handleCambiarNombreCliente}
              />
            ))}
          </ul>
        )}
      </div>

      <ModalAgregarCliente
        mostrarModal={mostrarModal}
        onClose={() => setMostrarModal(false)}
        onSubmit={handleAgregarCliente}
        isLoading={isLoading}
        nombre={nombre}
        setNombre={setNombre}
        telefono={telefono}
        setTelefono={setTelefono}
        direccion={direccion}
        setDireccion={setDireccion}
        deuda={deuda}
        setDeuda={setDeuda}
        comentariosAdicionales={comentariosAdicionales}
        setComentariosAdicionales={setComentariosAdicionales}
      />

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}

export default Clientes;
