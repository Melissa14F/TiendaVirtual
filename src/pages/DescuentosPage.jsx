import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getDiscounts } from '../services/discountsService';
import DescuentoAdmin from '../components/descuento/DescuentoAdmin';

// Página de administración de cupones de descuento (ruta /admin/descuentos).
export default function DescuentosPage() {
  const { showToast } = useOutletContext();
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getDiscounts()
      .then(data => { if (!cancelled) setDiscounts(data); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="adm-status">Cargando descuentos…</div>;
  if (error) return <div className="adm-status adm-status--error">No se pudieron cargar los descuentos.</div>;
  return <DescuentoAdmin discounts={discounts} setDiscounts={setDiscounts} showToast={showToast} />;
}
