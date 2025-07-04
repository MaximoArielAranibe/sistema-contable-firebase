import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  getDocs,
  getDoc,
} from "firebase/firestore";

const db = getFirestore();
const clientesRef = collection(db, "clientes");

export async function agregarCliente(nombre, telefono, direccion, deuda, comentariosAdicionales) {
  const docRef = await addDoc(clientesRef, {
    nombre,
    telefono,
    direccion,
    deuda,
    creadoEn: new Date(),
    comentariosAdicionales
  });
  return docRef.id;
}

export async function eliminarCliente(idCliente) {
  return deleteDoc(doc(db, "clientes", idCliente));
}

export async function modificarCliente(idCliente, nuevosDatos) {
  return updateDoc(doc(db, "clientes", idCliente), nuevosDatos);
}

export async function obtenerClientes() {
  const snapshot = await getDocs(clientesRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function actualizarCampoDeuda(idCliente, operacion, monto) {
  const ref = doc(db, "clientes", idCliente);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Cliente no encontrado");

  const cliente = snap.data();
  const deudaActual = parseFloat(cliente.deuda) || 0;
  const nuevaDeuda = operacion === "sumar"
    ? deudaActual + monto
    : deudaActual - monto;

  await updateDoc(ref, { deuda: nuevaDeuda });
  return nuevaDeuda;
}

export const sumarDeuda = (id, monto) => actualizarCampoDeuda(id, "sumar", monto);
export const restarDeuda = (id, monto) => actualizarCampoDeuda(id, "restar", monto);
