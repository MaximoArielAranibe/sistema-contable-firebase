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
import Spinner from "../components/Spinner";
import ModalAgregarCliente from "../components/Clientes/ModalAgregarCliente";
import ClienteCard from "../components/Clientes/ClienteCard";

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
