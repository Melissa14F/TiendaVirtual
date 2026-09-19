import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getAll as getAllClientes } from '../services/clienteService';
import ClienteAdmin from '../components/cliente/ClienteAdmin';

// Página de administración de clientes (ruta /admin/clientes).
export default function ClientesPage() {
  const { showToast } = useOutletContext();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getAllClientes()
      .then(data => { if (!cancelled) setClientes(data); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [retryKey]);

  const retry = useCallback(() => setRetryKey(k => k + 1), []);

  if (loading) return <div className="adm-status">Cargando clientes…</div>;
  if (error) return (
    <div className="adm-status adm-status--error">
      No se pudieron cargar los clientes: {error}
      <button onClick={retry} className="adm-retry-btn">Reintentar</button>
    </div>
  );
  return <ClienteAdmin clientes={clientes} setClientes={setClientes} showToast={showToast} />;
}
