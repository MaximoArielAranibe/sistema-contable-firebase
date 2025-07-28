import {
  modificarCliente,
  registrarHistorial,
  obtenerHistorialCliente,
  sumarDeuda,
  restarDeuda,
} from "../services/clientesService.js";
import { Timestamp, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "react-toastify";
import { getAuth } from "firebase/auth";

export function formatearFecha(fechaISO) {
  const [año, mes, dia] = fechaISO.split("-");
  return `${dia}/${mes}/${año}`;
}

export const actualizarFechaAPagar = async ({ clienteId, fechaISO, setClientes }) => {
  if (!fechaISO) return;

  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    toast.error("Usuario no autenticado");
    return;
  }

  const emailAId = (email) => email.replace(/\./g, "_").replace(/@/g, "-");
  const userIdTransformado = emailAId(user.email);

  const fechaFormateada = formatearFecha(fechaISO);

  try {
    await modificarCliente(clienteId, { fechaAPagar: fechaFormateada });

    // Registro en historial la actualización de fecha
    await registrarHistorial(
      clienteId,
      "actualizar_fecha",
      fechaFormateada,
      "Fecha a pagar actualizada"
    );

    setClientes((prev) =>
      prev.map((c) =>
        c.id === clienteId ? { ...c, fechaAPagar: fechaFormateada } : c
      )
    );

    toast.success("Fecha actualizada correctamente");
  } catch (error) {
    toast.error("Error al actualizar fecha: " + error.message);
  }
};

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
  const monto = Number(input);

  if (isNaN(monto) || monto <= 0) {
    toast.warning("Ingresá un número válido mayor que cero");
    return;
  }

  try {
    const nuevaDeuda = operacion === "sumar"
      ? await sumarDeuda(id, monto)
      : await restarDeuda(id, monto);

    // Registro en historial la operación de deuda
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

export async function actualizarDireccionCliente({ clienteId, direccionActual, setClientes }) {
  const nuevaDireccion = prompt(`Dirección actual: ${direccionActual}\n\nIngresá la nueva dirección:`)
  if (!nuevaDireccion) {
    toast.warning("No se ingresó una dirección");
    return;
  }

  if (nuevaDireccion === direccionActual) {
    toast.info("La dirección no cambió porque estás ingresando la misma.");
    return;
  }

  try {
    await modificarCliente(clienteId, { direccion: nuevaDireccion });

    setClientes((prev) => prev.map((c) => c.id === clienteId ? { ...c, direccion: nuevaDireccion } : c));
    toast.success("Dirección actualizada con éxito.");

  } catch (error) {
    toast.error("Error al actualizar la dirección: " + error.message);
  };
}

export async function actualizarTelefonoCliente({ clienteId, telefonoActual, setClientes }) {
  if (!telefonoActual) {
    telefonoActual = "No tiene número agendado.";
  }
  const telefonoNuevo = prompt(`Número actual: ${telefonoActual}\n\nIngrese un nuevo número de teléfono:`);

  if (!telefonoNuevo) {
    toast.warning("No se ingresó ningún teléfono");
    return;
  };

  if (telefonoNuevo === telefonoActual) {
    toast.info("El número que ingresaste es el mismo que estaba antes.");
    return;
  }

  try {
    await modificarCliente(clienteId, { telefono: telefonoNuevo });
    setClientes((prev) => prev.map((c) => c.id === clienteId ? { ...c, telefono: telefonoNuevo } : c))
    toast.success("Teléfono actualizado con éxito.");
  } catch (error) {
    toast.error("Ha ocurrido un error: " + error.message);
  };
};
