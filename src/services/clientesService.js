// servicios/clientesService.js
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";

export const agregarCliente = async (cliente) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Usuario no autenticado");

  const clientesRef = collection(db, "usuarios", user.uid, "clientes");
  const docRef = await addDoc(clientesRef, cliente);
  return docRef.id;
};

export const obtenerClientes = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return [];

  const clientesRef = collection(db, "usuarios", user.uid, "clientes");
  const snapshot = await getDocs(clientesRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const eliminarCliente = async (clienteId) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Usuario no autenticado");

  const clienteRef = doc(db, "usuarios", user.uid, "clientes", clienteId);
  await deleteDoc(clienteRef);
};

export const modificarCliente = async (clienteId, nuevosDatos) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Usuario no autenticado");

  const clienteRef = doc(db, "usuarios", user.uid, "clientes", clienteId);
  await updateDoc(clienteRef, nuevosDatos);
};

export const sumarDeuda = async (clienteId, monto) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Usuario no autenticado");

  const clienteRef = doc(db, "usuarios", user.uid, "clientes", clienteId);
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

  const clienteRef = doc(db, "usuarios", user.uid, "clientes", clienteId);
  const snapshot = await getDoc(clienteRef);
  const actual = snapshot.data()?.deuda || 0;
  const nuevaDeuda = Math.max(actual - monto, 0);
  await updateDoc(clienteRef, { deuda: nuevaDeuda });
  return nuevaDeuda;
};

export const calcularDeudaTotal = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return 0;

  const clientesRef = collection(db, "usuarios", user.uid, "clientes");
  const snapshot = await getDocs(clientesRef);
  let total = 0;
  snapshot.forEach((doc) => {
    const data = doc.data();
    total += parseFloat(data.deuda || 0);
  });
  return total;
};
