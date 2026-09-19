import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getAllOrders } from '../services/adminService';
import { getOrderStatuses } from '../services/orderStatusService';
import PedidoAdmin from '../components/pedido/PedidoAdmin';

// Página de administración de pedidos (ruta /admin/pedidos).
export default function PedidosPage() {
  const { showToast } = useOutletContext();
  const [orders, setOrders] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getAllOrders(), getOrderStatuses()])
      .then(([ordersData, statusesData]) => {
        if (cancelled) return;
        setOrders(ordersData);
        setStatuses(statusesData);
      })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="adm-status">Cargando pedidos…</div>;
  if (error) return <div className="adm-status adm-status--error">No se pudieron cargar los pedidos.</div>;
  return <PedidoAdmin orders={orders} setOrders={setOrders} statuses={statuses} showToast={showToast} />;
}
