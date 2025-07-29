import { useState } from "react";


export function useFormularioCliente() {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [deuda, setDeuda] = useState("");
  const [fechaAPagar, setFechaAPagar] = useState("")
  const [comentariosAdicionales, setComentariosAdicionales] = useState("");


  const resetFormulario = () => {
    setNombre("");
    setTelefono("");
    setDireccion("");
    setDeuda(0);
    setFechaAPagar("");
    setComentariosAdicionales("")
  }

  return {
    nombre, setNombre,
    telefono, setTelefono,
    direccion, setDireccion,
    deuda, setDeuda,
    fechaAPagar, setFechaAPagar,
    comentariosAdicionales, setComentariosAdicionales,
    resetFormulario
  }
}