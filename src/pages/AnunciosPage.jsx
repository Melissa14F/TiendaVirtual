import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getAllBanners } from '../services/bannerService';
import BannerAdmin from '../components/banner/BannerAdmin';

// Página de administración de banners/anuncios del carrusel (ruta /admin/anuncios).
export default function AnunciosPage() {
  const { showToast } = useOutletContext();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getAllBanners()
      .then(data => { if (!cancelled) setBanners(data); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="adm-status">Cargando anuncios…</div>;
  if (error) return <div className="adm-status adm-status--error">No se pudieron cargar los anuncios.</div>;
  return <BannerAdmin banners={banners} setBanners={setBanners} showToast={showToast} />;
}
