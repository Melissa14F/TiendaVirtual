import { useState, useEffect, useCallback } from 'react';
import { getProducts } from '../services/productsService';
import { getDiscounts } from '../services/discountsService';
import { getRecentOrders } from '../services/adminService';
import AdminDashboard from '../components/admin/AdminDashboard';

// Página de inicio del panel admin (ruta /admin): resumen general con
// ventas del mes, productos con bajo stock, cupones activos y las
// últimas órdenes.
export default function DashboardPage() {
  const [products, setProducts] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([getProducts(), getDiscounts(), getRecentOrders()])
      .then(([productsResult, discountsData, ordersData]) => {
        if (cancelled) return;
        setProducts(productsResult.data);
        setDiscounts(discountsData);
        setRecentOrders(ordersData);
      })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [retryKey]);

  const retry = useCallback(() => setRetryKey(k => k + 1), []);

  if (loading) return <div className="adm-status">Cargando panel…</div>;
  // Muestra el motivo real del fallo (ej. "No se pudo conectar con el
  // servidor" o un 429 por límite de solicitudes de MockAPI) en vez de un
  // mensaje genérico, y deja reintentar sin recargar toda la página.
  if (error) return (
    <div className="adm-status adm-status--error">
      No se pudo cargar el dashboard: {error}
      <button onClick={retry} className="adm-retry-btn">Reintentar</button>
    </div>
  );
  return <AdminDashboard products={products} discounts={discounts} recentOrders={recentOrders} />;
}
