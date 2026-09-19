import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getCategories } from '../services/categoriesService';
import CategoriaAdmin from '../components/categoria/CategoriaAdmin';

// Página de administración de categorías (ruta /admin/categorias).
export default function CategoriasPage() {
  const { showToast } = useOutletContext();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getCategories()
      .then(data => { if (!cancelled) setCategories(data); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [retryKey]);

  const retry = useCallback(() => setRetryKey(k => k + 1), []);

  if (loading) return <div className="adm-status">Cargando categorías…</div>;
  if (error) return (
    <div className="adm-status adm-status--error">
      No se pudieron cargar las categorías: {error}
      <button onClick={retry} className="adm-retry-btn">Reintentar</button>
    </div>
  );
  return <CategoriaAdmin categories={categories} setCategories={setCategories} showToast={showToast} />;
}
