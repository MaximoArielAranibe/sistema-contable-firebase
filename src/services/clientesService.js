import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  setDoc,
  Timestamp,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";

// 🔐 Convierte email a ID válido para Firestore
const emailAId = (email) => email.replace(/\./g, "_").replace(/@/g, "-");

// 🔁 Convierte a string formato 'YYYY-MM-DD'
const formatearFechaParaInput = (fecha) => {
  try {
    if (fecha instanceof Timestamp) {
      return fecha.toDate().toISOString().split("T")[0];
    } else if (typeof fecha === "string" && fecha.includes("/")) {
      const [dia, mes, año] = fecha.split("/");
      return new Date(`${año}-${mes}-${dia}`).toISOString().split("T")[0];
    } else if (typeof fecha === "string") {
      const date = new Date(fecha);
      return !isNaN(date) ? date.toISOString().split("T")[0] : "";
    }
  } catch {
    return "";
  }
  return "";
};

// 🔁 Convierte string 'YYYY-MM-DD' a Timestamp
const convertirAFechaTimestamp = (fechaString) => {
  if (!fechaString) return null;
  const fecha = new Date(fechaString);
  return isNaN(fecha) ? null : Timestamp.fromDate(fecha);
};

// 📥 Obtener historial de un cliente
export const obtenerHistorialCliente = async (clienteId) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Usuario no autenticado");

  const historialRef = collection(
    db,
    "usuarios",
    emailAId(user.email),
    "clientes",
    clienteId,
    "historial"
  );

  const q = query(historialRef, orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// 📌 Registrar entrada en historial
export const registrarHistorial = async (
  clienteId,
  operacion,
  monto,
  fechaCustom = null,
  comentario = ""
) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Usuario no autenticado");
  const email = user.email;
  const userIdTransformado = emailAId(email)

  const historialRef = collection(
    db,
    "usuarios",
    emailAId(user.email),
    "clientes",
    clienteId,
    "historial"
  );




console.log(fecha);


  await addDoc(historialRef, {
    clienteId,
  operacion,
  monto,
  comentario,
  timestamp: fecha || serverTimestamp(), // fallback de seguridad
  realizadoPor: user.email,
  });
};

// ➕ Agregar cliente
export const agregarCliente = async (cliente) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Usuario no autenticado");

  const email = user.email;
  const userIdTransformado = emailAId(email);

  const usuarioRef = doc(db, "usuarios", userIdTransformado);
  await setDoc(usuarioRef, { email }, { merge: true });

  // ✔ Referencia correcta a la colección de clientes
  const clientesRef = collection(db, "usuarios", userIdTransformado, "clientes");

  // ✔ Insertar el cliente en la colección
  const docRef = await addDoc(clientesRef, cliente);

  return docRef.id;
};

// 📤 Obtener clientes
export const obtenerClientes = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return [];

  const email = user.email;
  const userIdTransformado = emailAId(email);

  const clientesRef = collection(db, "usuarios", userIdTransformado, "clientes");
  const snapshot = await getDocs(clientesRef);

  return snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      ...data,
    };
  });
};

// ❌ Eliminar cliente
export const eliminarCliente = async (clienteId) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Usuario no autenticado");

  const email = user.email;
  const userIdTransformado = emailAId(email);

  const clienteRef = doc(db, "usuarios", userIdTransformado, "clientes", clienteId);
  await deleteDoc(clienteRef);
};

// ✏️ Modificar cliente
export const modificarCliente = async (clienteId, nuevosDatos) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Usuario no autenticado");

  const email = user.email;
  const userIdTransformado = emailAId(email);

  const clienteRef = doc(db, "usuarios", userIdTransformado, "clientes", clienteId);

  const datosProcesados = {
    ...nuevosDatos,
  };
  await updateDoc(clienteRef, datosProcesados);
};

// ➕ Sumar deuda
export const sumarDeuda = async (clienteId, monto) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Usuario no autenticado");

  const email = user.email;
  const userIdTransformado = emailAId(email);

  const clienteRef = doc(db, "usuarios", userIdTransformado, "clientes", clienteId);
  const snapshot = await getDoc(clienteRef);
  const actual = snapshot.data()?.deuda || 0;
  const nuevaDeuda = actual + monto;
  await updateDoc(clienteRef, { deuda: nuevaDeuda });
  return nuevaDeuda;
};

// ➖ Restar deuda
export const restarDeuda = async (clienteId, monto) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Usuario no autenticado");

  const email = user.email;
  const userIdTransformado = emailAId(email);

  const clienteRef = doc(db, "usuarios", userIdTransformado, "clientes", clienteId);
  const snapshot = await getDoc(clienteRef);
  const actual = snapshot.data()?.deuda || 0;
  const nuevaDeuda = actual - monto;
  await updateDoc(clienteRef, { deuda: nuevaDeuda });
  return nuevaDeuda;
};

// 📊 Calcular deuda total
export const calcularDeudaTotal = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return 0;

  const email = user.email;
  const userIdTransformado = emailAId(email);

  const clientesRef = collection(db, "usuarios", userIdTransformado, "clientes");
  const snapshot = await getDocs(clientesRef);
  let total = 0;
  snapshot.forEach((doc) => {
    const data = doc.data();
    total += parseFloat(data.deuda || 0);
  });
  return total;
};
