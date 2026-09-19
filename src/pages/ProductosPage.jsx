import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getProducts } from '../services/productsService';
import { getCategories } from '../services/categoriesService';
import ProductoAdmin from '../components/producto/ProductoAdmin';

// Página de administración de productos (ruta /admin/productos).
export default function ProductosPage() {
  const { showToast } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([getProducts(), getCategories()])
      .then(([productsResult, categoriesData]) => {
        if (cancelled) return;
        setProducts(productsResult.data);
        setCategories(categoriesData);
      })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [retryKey]);

  const retry = useCallback(() => setRetryKey(k => k + 1), []);

  if (loading) return <div className="adm-status">Cargando productos…</div>;
  if (error) return (
    <div className="adm-status adm-status--error">
      No se pudieron cargar los productos: {error}
      <button onClick={retry} className="adm-retry-btn">Reintentar</button>
    </div>
  );
  return <ProductoAdmin products={products} setProducts={setProducts} categories={categories} showToast={showToast} />;
}
