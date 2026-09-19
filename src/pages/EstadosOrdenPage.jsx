import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getOrderStatuses } from '../services/orderStatusService';
import EstadoOrdenAdmin from '../components/estado_orden/EstadoOrdenAdmin';

// Página de administración de estados de pedido (ruta /admin/estados-pedido).
export default function EstadosOrdenPage() {
  const { showToast } = useOutletContext();
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getOrderStatuses()
      .then(data => { if (!cancelled) setStatuses(data); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="adm-status">Cargando estados de pedido…</div>;
  if (error) return <div className="adm-status adm-status--error">No se pudieron cargar los estados de pedido.</div>;
  return <EstadoOrdenAdmin statuses={statuses} setStatuses={setStatuses} showToast={showToast} />;
}
