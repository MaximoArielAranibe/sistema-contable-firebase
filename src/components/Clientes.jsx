import React, { useEffect, useState } from "react";
import { agregarCliente, obtenerClientes } from "../services/clientesService";

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");

  // Cargar clientes al montar el componente
  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    const lista = await obtenerClientes();
    console.log("Clientes cargados:", lista);
    setClientes(lista);
  };

  const handleAgregarCliente = async (e) => {
    e.preventDefault();
    if (!nombre.trim() || !telefono.trim() || !direccion.trim()) {
      alert("Completa todos los campos");
      return;
    }

    try {
      const nuevoId = await agregarCliente(nombre, telefono, direccion);
      const nuevoCliente = {
        id: nuevoId,
        nombre,
        telefono,
        direccion,
      };

      setClientes(prev => [...prev, nuevoCliente]); // lo agregás directo a la lista
      setNombre("");
      setTelefono("");
      setDireccion("");
    } catch (error) {
      alert("Error al agregar cliente: " + error.message);
    }

  };

  return (
    <div>
      <h2>Agregar Cliente</h2>
      <form onSubmit={handleAgregarCliente}>
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          type="text"
          placeholder="Teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />
        <input
          type="text"
          placeholder="Dirección"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
        />
        <button type="submit">Agregar</button>
      </form>

      <h2>Lista de Clientes</h2>
      {clientes.length === 0 && <p>No hay clientes registrados</p>}
      <ul>
        {clientes.map((cliente) => (
          <li key={cliente.id}>
            <strong>{cliente.nombre}</strong> - {cliente.telefono} - {cliente.direccion}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Clientes;
