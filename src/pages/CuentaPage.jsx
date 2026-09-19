import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getOrders, cancelOrder, rateOrderItem } from '../services/ordersService';
import { placeOrder } from '../services/checkoutService';
import ClienteFavoritos from '../components/cliente/ClienteFavoritos';
import ClientePedidos from '../components/cliente/ClientePedidos';
import ClienteCarrito from '../components/cliente/ClienteCarrito';
import ClientePerfil from '../components/cliente/ClientePerfil';
import '../styles/ClientAccount.css';

// Página de cuenta del cliente logueado (ruta /cuenta): pestañas de
// pedidos, favoritos, carrito y perfil. No usa sub-rutas — cambia de
// pestaña con estado local, igual que antes, porque son vistas livianas
// que no necesitan URL propia.
export default function CuentaPage() {
  const navigate = useNavigate();
  const { userId, userName, userEmail } = useAuth();
  const { cartItems, changeQty, removeFromCart, clearCart, addToCart } = useCart();
  const { favorites, isFavorite, onToggleFavorite, onLogout } = useOutletContext();

  const [tab, setTab] = useState('orders');
  const [expanded, setExpanded] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(null);
  const [ordersRefreshKey, setOrdersRefreshKey] = useState(0);
  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  useEffect(() => {
    let cancelled = false;
    setOrdersLoading(true);
    getOrders(userName)
      .then(data => { if (!cancelled) setOrders(data); })
      .catch(err => { if (!cancelled) setOrdersError(err.message); })
      .finally(() => { if (!cancelled) setOrdersLoading(false); });
    return () => { cancelled = true; };
  }, [userName, ordersRefreshKey]);

  // Confirma la compra del carrito completo (con el cupón aplicado, si había uno).
  const handleCheckout = async (discountAmount = 0, orderDetails, discountId) => {
    await placeOrder({ clienteName: userName, items: cartItems, discountAmount, orderDetails, discountId });
    clearCart();
  };

  // Refresca "Mis pedidos" y muestra esa pestaña una vez que la compra ya se confirmó.
  const handleOrderPlaced = () => {
    setOrdersRefreshKey(k => k + 1);
    setTab('orders');
  };

  // "Volver a comprar" — re-adds a past order's items to the cart. Items
  // without a resolved `id` (their product was renamed/deleted since)
  // are skipped rather than guessed at.
  const handleReorder = (items) => {
    items.filter(item => item.id).forEach(item => addToCart(item, item.qty));
    setTab('cart');
  };

  const handleCancelOrder = async (order) => {
    await cancelOrder(order.rawId);
    setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'Cancelado' } : o));
  };

  const handleRateItem = async (order, item, stars) => {
    await rateOrderItem(item.detalleId, stars);
    setOrders(orders.map(o => o.id === order.id
      ? { ...o, items: o.items.map(it => it.detalleId === item.detalleId ? { ...it, rating: stars } : it) }
      : o
    ));
  };

  return (
    <div className="ca-page">
      {/* Encabezado de la página */}
      <div className="ca-header">
        <div className="ca-header-inner">
          <div className="ca-header-top">
            <div className="ca-header-user">
              <div className="ca-avatar">
                <svg className="icon icon-26 icon-sw-1_8 icon-stroke-white" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div>
                <h1 className="ca-greeting">Hola, {userName}</h1>
                <p className="ca-email">{userEmail}</p>
              </div>
            </div>
            <div className="ca-header-actions">
              <button onClick={() => navigate('/')} className="ca-back-btn">
                <svg className="icon icon-14 icon-sw-2_5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                Volver a la tienda
              </button>
              <button onClick={onLogout} className="ca-logout-btn">
                <svg className="icon icon-14 icon-sw-2_5" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Cerrar sesión
              </button>
            </div>
          </div>

          {/* Pestañas */}
          <div className="ca-tabs">
            {[
              { id: 'orders', label: 'Mis pedidos', count: orders.length, icon: <svg className="icon icon-15" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> },
              { id: 'favorites', label: 'Favoritos', count: favorites.length, icon: <svg className="icon icon-15" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> },
              { id: 'cart', label: 'Mi carrito', count: cartCount, icon: <svg className="icon icon-15" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> },
              { id: 'profile', label: 'Mi perfil', count: null, icon: <svg className="icon icon-15" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`ca-tab ${tab === t.id ? 'ca-tab--active' : ''}`}>
                {t.icon}
                {t.label}
                {t.count !== null && t.count > 0 && (
                  <span className={`ca-tab-count ${tab === t.id ? 'ca-tab-count--active' : ''}`}>{t.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido de la pestaña activa */}
      <div className="ca-content">
        {tab === 'orders' && (
          ordersLoading ? <div className="ca-orders-status">Cargando tus pedidos…</div> :
          ordersError ? <div className="ca-orders-status ca-orders-status--error">No se pudieron cargar tus pedidos.</div> :
          <ClientePedidos orders={orders} expanded={expanded} setExpanded={setExpanded} onReorder={handleReorder} onCancelOrder={handleCancelOrder} onRateItem={handleRateItem} />
        )}
        {tab === 'favorites' && (
          <ClienteFavoritos favorites={favorites} isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} />
        )}
        {tab === 'cart' && <ClienteCarrito items={cartItems} userId={userId} onChangeQty={changeQty} onRemove={removeFromCart} cartTotal={cartTotal} onCheckout={handleCheckout} onOrderPlaced={handleOrderPlaced} />}
        {tab === 'profile' && <ClientePerfil userId={userId} />}
      </div>
    </div>
  );
}
