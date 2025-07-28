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
} from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";

// Convierte un email a un ID seguro para Firestore (evita puntos y @)
const emailAId = (email) => email.replace(/\./g, "_").replace(/@/g, "-");



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

export const registrarHistorial = async (
  clienteId,
  operacion,
  monto,
  fechaCustom = null
) => {
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

  const fecha = fechaCustom ? new Date(fechaCustom) : new Date();

  await addDoc(historialRef, {
    operacion,
    monto,
    timestamp: Timestamp.fromDate(fecha),
    realizadoPor: user.email,
    fechaISO: fecha.toISOString(),
  });
};

export const agregarCliente = async (cliente) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Usuario no autenticado");

  const email = user.email;
  const userIdTransformado = emailAId(email);

  const usuarioRef = doc(db, "usuarios", userIdTransformado);
  await setDoc(usuarioRef, { email }, { merge: true });

  const clienteConFechaConvertida = {
    ...cliente,
    fechaAPagar: cliente.fechaAPagar ?
      Timestamp.fromDate(new Date(cliente.fechaAPagar)) : null,
  };

  const clientesRef = collection(db, "usuarios", userIdTransformado, "clientes");
  const docRef = await addDoc(clientesRef, clienteConFechaConvertida);
  return docRef.id;
};

export const obtenerClientes = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return [];

  const email = user.email;
  const userIdTransformado = emailAId(email);

  const clientesRef = collection(db, "usuarios", userIdTransformado, "clientes");
  const snapshot = await getDocs(clientesRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const eliminarCliente = async (clienteId) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Usuario no autenticado");

  const email = user.email;
  const userIdTransformado = emailAId(email);

  const clienteRef = doc(
    db,
    "usuarios",
    userIdTransformado,
    "clientes",
    clienteId
  );
  await deleteDoc(clienteRef);
};

export const modificarCliente = async (clienteId, nuevosDatos) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Usuario no autenticado");

  const email = user.email;
  const userIdTransformado = emailAId(email);

  const clienteRef = doc(
    db,
    "usuarios",
    userIdTransformado,
    "clientes",
    clienteId
  );
  await updateDoc(clienteRef, nuevosDatos);
};


export const sumarDeuda = async (clienteId, monto) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Usuario no autenticado");

  const email = user.email;
  const userIdTransformado = emailAId(email);

  const clienteRef = doc(
    db,
    "usuarios",
    userIdTransformado,
    "clientes",
    clienteId
  );
  const snapshot = await getDoc(clienteRef);
  const actual = snapshot.data()?.deuda || 0;
  const nuevaDeuda = actual + monto;
  await updateDoc(clienteRef, { deuda: nuevaDeuda });
  return nuevaDeuda;
};

export const restarDeuda = async (clienteId, monto) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Usuario no autenticado");

  const email = user.email;
  const userIdTransformado = emailAId(email);

  const clienteRef = doc(
    db,
    "usuarios",
    userIdTransformado,
    "clientes",
    clienteId
  );
  const snapshot = await getDoc(clienteRef);
  const actual = snapshot.data()?.deuda || 0;
  const nuevaDeuda = actual - monto;
  await updateDoc(clienteRef, { deuda: nuevaDeuda });
  return nuevaDeuda;
};

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
