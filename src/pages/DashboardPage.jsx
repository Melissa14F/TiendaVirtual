import { useState, useEffect } from 'react';
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

  useEffect(() => {
    let cancelled = false;
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
  }, []);

  if (loading) return <div className="adm-status">Cargando panel…</div>;
  if (error) return <div className="adm-status adm-status--error">No se pudo cargar el dashboard.</div>;
  return <AdminDashboard products={products} discounts={discounts} recentOrders={recentOrders} />;
}
