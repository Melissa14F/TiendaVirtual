import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getAll as getAllClientes } from '../services/clienteService';
import ClienteAdmin from '../components/cliente/ClienteAdmin';

// Página de administración de clientes (ruta /admin/clientes).
export default function ClientesPage() {
  const { showToast } = useOutletContext();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getAllClientes()
      .then(data => { if (!cancelled) setClientes(data); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="adm-status">Cargando clientes…</div>;
  if (error) return <div className="adm-status adm-status--error">No se pudieron cargar los clientes.</div>;
  return <ClienteAdmin clientes={clientes} setClientes={setClientes} showToast={showToast} />;
}
