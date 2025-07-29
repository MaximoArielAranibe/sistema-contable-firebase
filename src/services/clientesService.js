import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  setDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";

// 🔐 Convierte email a ID válido para Firestore
const emailAId = (email) => email.replace(/\./g, "_").replace(/@/g, "-");

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
  comentario = ""
) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Usuario no autenticado");
  const email = user.email;

  const userIdTransformado = emailAId(email);

  const historialRef = collection(
    db,
    "usuarios",
    userIdTransformado,
    "clientes",
    clienteId,
    "historial"
  );

  await addDoc(historialRef, {
    clienteId,
    operacion,
    monto,
    comentario,
    realizadoPor: user.email,
    timestamp: new Date()
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

  const clientesRef = collection(db, "usuarios", userIdTransformado, "clientes");
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

  await updateDoc(clienteRef, nuevosDatos);
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
  const actual = Number(snapshot.data()?.deuda || 0);
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
  const actual = Number(snapshot.data()?.deuda || 0);
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