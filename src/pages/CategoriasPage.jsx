import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getCategories } from '../services/categoriesService';
import CategoriaAdmin from '../components/categoria/CategoriaAdmin';

// Página de administración de categorías (ruta /admin/categorias).
export default function CategoriasPage() {
  const { showToast } = useOutletContext();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getCategories()
      .then(data => { if (!cancelled) setCategories(data); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="adm-status">Cargando categorías…</div>;
  if (error) return <div className="adm-status adm-status--error">No se pudieron cargar las categorías.</div>;
  return <CategoriaAdmin categories={categories} setCategories={setCategories} showToast={showToast} />;
}
