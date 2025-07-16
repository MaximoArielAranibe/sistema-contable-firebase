import {useState} from "react";


export function useFormularioCliente() {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [deuda, setDeuda] = useState("");
  const [comentariosAdicionales, setComentariosAdicionales] = useState("");


  const resetFormulario = () =>{
    setNombre("");
    setTelefono("");
    setDireccion("");
    setDeuda("");
    setComentariosAdicionales("")
  }

  return {
    nombre, setNombre,
    telefono, setTelefono,
    direccion, setDireccion,
    deuda, setDeuda,
    comentariosAdicionales, setComentariosAdicionales,
    resetFormulario
  }
}