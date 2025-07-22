import {
  modificarCliente,
  registrarHistorial,
  obtenerHistorialCliente,
  sumarDeuda,
  restarDeuda,
} from "../services/clientesService.js";
import { toast } from "react-toastify";

export async function actualizarNombreCliente({ clienteId, nombreActual, setClientes }) {
  const nuevoNombre = prompt(`Nombre actual: ${nombreActual}\n\nIngresá el nuevo nombre:`)?.trim();

  if (!nuevoNombre) {
    toast.warning("No se ingresó ningún nombre.");
    return;
  }

  if (nuevoNombre === nombreActual) {
    toast.info("El nombre no cambió.");
    return;
  }

  try {
    await modificarCliente(clienteId, { nombre: nuevoNombre });

    setClientes((prev) =>
      prev.map((c) =>
        c.id === clienteId ? { ...c, nombre: nuevoNombre } : c
      )
    );

    toast.success("Nombre actualizado correctamente");
  } catch (error) {
    toast.error("Error al actualizar el nombre: " + error.message);
  }
}


export async function actualizarDeudaCliente({
  id, operacion, name, setClientes, calcularDeudaTotal, setHistoriales, clienteHistorialVisible
}) {
  const input = prompt(`¿Cuánto querés ${operacion === "sumar" ? "sumar" : "restar"} a la deuda de ${name}?`);
  const monto = parseFloat(input);
  if (isNaN(monto) || monto <= 0) {
    toast.warning("Ingresá un número válido mayor que cero");
    return;
  }

  try {
    const nuevaDeuda = operacion === "sumar"
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

    toast.success(`Deuda ${operacion === "sumar" ? "sumada" : "restada"} correctamente`);
  } catch (error) {
    toast.error(`Error al ${operacion} deuda: ` + error.message);
  }
}

export async function guardarComentarioCliente({
  clienteId, nuevoComentario, setClientes, setEditandoComentario, setNuevoComentario
}) {
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
}
