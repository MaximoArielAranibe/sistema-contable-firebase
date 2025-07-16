import { useEffect, useState } from "react";
import {
  obtenerClientes,
  obtenerHistorialCliente,
} from "../services/clientesService";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";

export function useClientes() {
  const [clientes, setClientes] = useState([]);
  const [deudaTotal, setDeudaTotal] = useState(0);
  const [historiales, setHistoriales] = useState({});
  const [historialesVisibles, setHistorialesVisibles] = useState({});
  const [clienteHistorialVisible, setClienteHistorialVisible] = useState(null);
  const [historialesCargando, setHistorialesCargando] = useState({});
  const [cargandoMasHistorial, setCargandoMasHistorial] = useState({});
  const [usuarioLogeado, setUsuarioLogeado] = useState("");

  useEffect(() => {
    const auth = getAuth();
    const userEmail = auth.currentUser?.email || "Desconocido";
    setUsuarioLogeado(userEmail);
    cargarClientes();
  }, []);

  const calcularDeudaTotal = (clientes) => {
    const total = clientes.reduce((acc, cliente) => {
      const deudaNumerica = parseFloat(cliente.deuda);
      return acc + (isNaN(deudaNumerica) ? 0 : deudaNumerica);
    }, 0);
    setDeudaTotal(total);
  };

  const cargarClientes = async () => {
    try {
      const lista = await obtenerClientes();
      setClientes(lista);
      calcularDeudaTotal(lista);
    } catch (error) {
      toast.error("Error al cargar clientes: " + error.message);
    }
  };

  const toggleHistorial = async (clienteId) => {
    if (clienteHistorialVisible === clienteId) {
      setClienteHistorialVisible(null);
      return;
    }

    setHistorialesCargando((prev) => ({ ...prev, [clienteId]: true }));

    try {
      const historial = await obtenerHistorialCliente(clienteId);
      setHistoriales((prev) => ({ ...prev, [clienteId]: historial }));
      setHistorialesVisibles((prev) => ({ ...prev, [clienteId]: 5 }));
      setClienteHistorialVisible(clienteId);
    } catch (error) {
      toast.error("Error al cargar historial: " + error.message);
    } finally {
      setHistorialesCargando((prev) => ({ ...prev, [clienteId]: false }));
    }
  };

  return {
    clientes,
    setClientes,
    deudaTotal,
    calcularDeudaTotal,
    historiales,
    setHistoriales,
    clienteHistorialVisible,
    setClienteHistorialVisible,
    historialesVisibles,
    setHistorialesVisibles,
    historialesCargando,
    cargandoMasHistorial,
    setCargandoMasHistorial,
    usuarioLogeado,
    toggleHistorial,
  };
}
