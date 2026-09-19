import { useState, useEffect } from 'react';
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

  useEffect(() => {
    let cancelled = false;
    getPageInfo()
      .then(data => { if (!cancelled) setInfo(data); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="adm-status">Cargando información de la tienda…</div>;
  if (error) return <div className="adm-status adm-status--error">No se pudo cargar la información de la tienda.</div>;
  return <InformacionAdmin info={info} setInfo={setInfo} showToast={showToast} />;
}
