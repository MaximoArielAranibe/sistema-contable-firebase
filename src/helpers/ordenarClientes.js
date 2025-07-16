export function ordenarYFiltrarClientes(clientes, busqueda, orden) {
  return [...clientes]
    .filter((cliente) => {
      if (!busqueda.trim()) return true;
      return [
        cliente.nombre,
        cliente.telefono,
        cliente.direccion,
        cliente.comentariosAdicionales,
      ].some((campo) => campo?.toLowerCase().includes(busqueda.toLowerCase()));
    })
    .sort((a, b) => {
      switch (orden) {
        case "deudaAsc": return parseFloat(a.deuda || 0) - parseFloat(b.deuda || 0);
        case "deudaDesc": return parseFloat(b.deuda || 0) - parseFloat(a.deuda || 0);
        case "nombreAZ": return a.nombre.localeCompare(b.nombre);
        case "nombreZA": return b.nombre.localeCompare(a.nombre);
        default: return b.createdAt - a.createdAt;
      }
    });
}
