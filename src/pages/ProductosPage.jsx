import { useState, useEffect } from 'react';
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

  useEffect(() => {
    let cancelled = false;
    Promise.all([getProducts(), getCategories()])
      .then(([productsResult, categoriesData]) => {
        if (cancelled) return;
        setProducts(productsResult.data);
        setCategories(categoriesData);
      })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="adm-status">Cargando productos…</div>;
  if (error) return <div className="adm-status adm-status--error">No se pudieron cargar los productos.</div>;
  return <ProductoAdmin products={products} setProducts={setProducts} categories={categories} showToast={showToast} />;
}
