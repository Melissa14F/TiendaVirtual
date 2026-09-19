import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getDiscounts } from '../services/discountsService';
import DescuentoAdmin from '../components/descuento/DescuentoAdmin';

// Página de administración de cupones de descuento (ruta /admin/descuentos).
export default function DescuentosPage() {
  const { showToast } = useOutletContext();
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getDiscounts()
      .then(data => { if (!cancelled) setDiscounts(data); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [retryKey]);

  const retry = useCallback(() => setRetryKey(k => k + 1), []);

  if (loading) return <div className="adm-status">Cargando descuentos…</div>;
  if (error) return (
    <div className="adm-status adm-status--error">
      No se pudieron cargar los descuentos: {error}
      <button onClick={retry} className="adm-retry-btn">Reintentar</button>
    </div>
  );
  return <DescuentoAdmin discounts={discounts} setDiscounts={setDiscounts} showToast={showToast} />;
}
