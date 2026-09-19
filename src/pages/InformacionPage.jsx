import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getPageInfo } from '../services/pageInfoService';
import InformacionAdmin from '../components/informacion/InformacionAdmin';

// Página de administración de la información general de la tienda
// (ruta /admin/informacion): nombre, contacto, redes sociales, horario.
export default function InformacionPage() {
  const { showToast } = useOutletContext();
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getPageInfo()
      .then(data => { if (!cancelled) setInfo(data); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [retryKey]);

  const retry = useCallback(() => setRetryKey(k => k + 1), []);

  if (loading) return <div className="adm-status">Cargando información de la tienda…</div>;
  if (error) return (
    <div className="adm-status adm-status--error">
      No se pudo cargar la información de la tienda: {error}
      <button onClick={retry} className="adm-retry-btn">Reintentar</button>
    </div>
  );
  return <InformacionAdmin info={info} setInfo={setInfo} showToast={showToast} />;
}
