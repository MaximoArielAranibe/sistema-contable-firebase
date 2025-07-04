import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React, { useEffect, useState } from "react";
import {
  agregarCliente,
  obtenerClientes,
  eliminarCliente,
  restarDeuda,
  sumarDeuda,
} from "../services/clientesService";
import '../styles/clientes.scss'

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [deuda, setDeuda] = useState("");
  const [comentariosAdicionales, setComentariosAdicionales] = useState("")

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      const lista = await obtenerClientes();
      setClientes(lista);
    } catch (error) {
      alert("Error al cargar clientes: " + error.message);
    }
  };

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
      const nuevoId = await agregarCliente(nombre, telefono, direccion, deuda, comentariosAdicionales);
      const nuevoCliente = { id: nuevoId, nombre, telefono, direccion, deuda, comentariosAdicionales };
      toast.success("Cliente agregado con éxito")
      setClientes((prev) => [...prev, nuevoCliente]);
      resetFormulario();
    } catch (error) {
      toast.error("Error al agregar cliente: " + error.message);

    }
  };

  const handleBorrarCliente = async (id) => {
    const confirmacion = prompt("Si estás seguro de eliminar este cliente, escribí: eliminar");

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
    const input = prompt(`¿Cuánto querés ${operacion === "sumar" ? "sumar" : "restar"} a la deuda de ${name} ?`);
    const monto = parseFloat(input);
    if (isNaN(monto) || monto <= 0) return alert("Ingresá un número válido mayor que cero");

    try {
      const nuevaDeuda =
        operacion === "sumar"
          ? await sumarDeuda(id, monto)
          : await restarDeuda(id, monto);

      setClientes((prev) =>
        prev.map((c) => (c.id === id ? { ...c, deuda: nuevaDeuda } : c))
      );
    } catch (error) {
      alert(`Error al ${operacion} deuda: ` + error.message);
    }
  };

  return (
    <div className="clientes">
      <div className="clientes__agregar">
        <h2 className="clientes__agregar-title">Agregar Cliente</h2>
        <form onSubmit={handleAgregarCliente}>
          <input className="clientes__agregar-input" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <input className="clientes__agregar-input" placeholder="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          <input className="clientes__agregar-input" placeholder="Dirección" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
          <input className="clientes__agregar-input" placeholder="Deuda" type="number" value={deuda} onChange={(e) => setDeuda(e.target.value)} />
          <input className="clientes__agregar-input" placeholder="Comentarios adicionales..." value={comentariosAdicionales} onChange={(e) => setComentariosAdicionales(e.target.value)} />
        </form>
        <button type="submit" className="clientes__agregar-button" onClick={handleAgregarCliente}>Agregar</button>
      </div>
      <hr />
      <div className="clientes__lista">
        <h2 className="clientes__lista-title">Lista de Clientes</h2>
        {clientes.length === 0 ? (
          <p>No hay clientes registrados</p>
        ) : (
          <ul>
            {clientes.map((cliente) => (
              <li key={cliente.id} className="cliente">
                <div className="cliente__info">
                  <h4>Nombre: {cliente.nombre}</h4>
                  <h4>Telefono: {cliente.telefono}</h4>
                  <h4>Dirección: {cliente.direccion}</h4>
                  <h4>Deuda: ${Number(cliente.deuda).toLocaleString("es-AR")}</h4>
                  <h4>Comentarios: {cliente.comentariosAdicionales}</h4>
                </div>
                <div className="cliente__funciones">
                  <button onClick={() => handleBorrarCliente(cliente.id)}>🗑️</button>
                  <button onClick={() => actualizarDeuda(cliente.id, "restar", cliente.nombre)}>➖</button>
                  <button onClick={() => actualizarDeuda(cliente.id, "sumar", cliente.nombre)}>➕</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );

}

export default Clientes;
