import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getAllBanners } from '../services/bannerService';
import BannerAdmin from '../components/banner/BannerAdmin';

// Página de administración de banners/anuncios del carrusel (ruta /admin/anuncios).
export default function AnunciosPage() {
  const { showToast } = useOutletContext();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getAllBanners()
      .then(data => { if (!cancelled) setBanners(data); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [retryKey]);

  const retry = useCallback(() => setRetryKey(k => k + 1), []);

  if (loading) return <div className="adm-status">Cargando anuncios…</div>;
  if (error) return (
    <div className="adm-status adm-status--error">
      No se pudieron cargar los anuncios: {error}
      <button onClick={retry} className="adm-retry-btn">Reintentar</button>
    </div>
  );
  return <BannerAdmin banners={banners} setBanners={setBanners} showToast={showToast} />;
}
