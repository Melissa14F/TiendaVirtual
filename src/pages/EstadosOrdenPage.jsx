import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getOrderStatuses } from '../services/orderStatusService';
import EstadoOrdenAdmin from '../components/estado_orden/EstadoOrdenAdmin';

// Página de administración de estados de pedido (ruta /admin/estados-pedido).
export default function EstadosOrdenPage() {
  const { showToast } = useOutletContext();
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getOrderStatuses()
      .then(data => { if (!cancelled) setStatuses(data); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [retryKey]);

  const retry = useCallback(() => setRetryKey(k => k + 1), []);

  if (loading) return <div className="adm-status">Cargando estados de pedido…</div>;
  if (error) return (
    <div className="adm-status adm-status--error">
      No se pudieron cargar los estados de pedido: {error}
      <button onClick={retry} className="adm-retry-btn">Reintentar</button>
    </div>
  );
  return <EstadoOrdenAdmin statuses={statuses} setStatuses={setStatuses} showToast={showToast} />;
}
