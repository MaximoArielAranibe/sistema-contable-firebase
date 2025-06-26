import { query, getDocs, collection, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { auth } from "../firebase"; // si usas auth también

const db = getFirestore();

export async function agregarCliente(nombre, telefono, direccion) {
  try {
    const docRef = await addDoc(collection(db, "clientes"), {
      nombre,
      telefono,
      direccion,
      creadoEn: new Date()  // te recomiendo agregar fecha para ordenar después
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
}


export async function eliminarCliente(idCliente) {
  return deleteDoc(doc(db, "clientes", idCliente));
}

export async function modificarCliente(idCliente, nuevosDatos) {
  return updateDoc(doc(db, "clientes", idCliente), nuevosDatos);
}

export async function obtenerClientes() {
  const q = query(collection(db, "clientes"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Agregar aquí otras funciones para transacciones, historial, resumen global
