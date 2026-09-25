import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { getSavedShippingInfo } from '../../services/clienteService';
import { placeOrder } from '../../services/checkoutService';
import CheckoutModal from '../common/CheckoutModal';
import '../../styles/Carrito.css';

// Panel deslizable del carrito (se abre desde el ícono del carrito en el
// Header o desde MenuInferior). Muestra los ítems agregados y permite
// finalizar la compra.
export default function Carrito() {
  const navigate = useNavigate();
  const { cartItems: items, cartOpen: open, closeCart, removeFromCart, changeQty, clearCart } = useCart();
  const { userId, userRole, userName } = useAuth();
  const [showCheckoutForm, setShowCheckoutForm] = useState(false); // si se muestra el formulario de datos de envío
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState(null); // pedido recién creado, mientras se muestra su confirmación
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  // Confirma la compra: valida stock real, crea el pedido y descuenta
  // stock (ver checkoutService.placeOrder). El carrito se vacía en el
  // momento (el pedido ya quedó creado), pero el modal se queda abierto
  // mostrando la confirmación — recién navega a "Mis pedidos" cuando el
  // cliente lo elige explícitamente (ver onViewOrders más abajo).
  const confirmCheckout = async (orderDetails) => {
    setCheckingOut(true);
    setCheckoutError('');
    try {
      const order = await placeOrder({ clienteName: userName, items, orderDetails });
      setConfirmedOrder({ ...order, items });
      clearCart();
      closeCart();
    } catch (err) {
      setCheckoutError(err.message);
    } finally {
      setCheckingOut(false);
    }
  };

  const dismissCheckout = () => {
    setShowCheckoutForm(false);
    setConfirmedOrder(null);
  };

  // Once the client already has shipping info on file, the form only
  // ever shows up once (the first purchase) — later ones reuse it
  // directly instead of asking again.
  const handleCheckoutClick = async () => {
    if (userRole !== 'client') { navigate('/login'); return; } // invitado o admin: manda a iniciar sesión como cliente
    setCheckoutError('');
    const saved = await getSavedShippingInfo(userId).catch(() => null);
    if (saved) confirmCheckout(saved); // ya tiene dirección guardada -> compra directo, sin mostrar el formulario
    else setShowCheckoutForm(true); // primera compra -> pide los datos de envío
  };

  return (
    <>
      {/* Fondo oscuro semitransparente, clic afuera cierra el panel */}
      <div onClick={closeCart} className={`cd-overlay ${open ? 'cd-overlay--open' : ''}`} />
      <div className={`cd-drawer ${open ? 'cd-drawer--open' : ''}`}>
        {/* Encabezado del panel */}
        <div className="cd-header">
          <h2 className="cd-title">
            Carrito <span className="cd-title-count">({items.reduce((s, i) => s + i.qty, 0)} items)</span>
          </h2>
          <button onClick={closeCart} className="cd-close-btn">×</button>
        </div>

        {/* Lista de productos en el carrito (o el mensaje de "carrito vacío") */}
        <div className="cd-items">
          {items.length === 0 ? (
            <div className="cd-empty">
              <div className="cd-empty-icon-box">
                <svg className="icon icon-32 icon-sw-1_5 icon-stroke-border" viewBox="0 0 24 24">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </div>
              <div className="cd-empty-title">Tu carrito está vacío</div>
              <div className="cd-empty-sub">Agrega productos para comenzar</div>
            </div>
          ) : (
            <div className="cd-list">
              {items.map(item => (
                <div key={item.id} className="cd-item">
                  <img src={item.image} alt={item.name} className="cd-item-img" />
                  <div className="cd-item-info">
                    <div className="cd-item-name">{item.name}</div>
                    <div className="cd-item-price">${item.price.toLocaleString()}</div>
                    <div className="cd-item-controls">
                      <div className="cd-qty-wrap">
                        <button onClick={() => item.qty <= 1 ? removeFromCart(item.id) : changeQty(item.id, item.qty - 1)} className="cd-qty-btn">−</button>
                        <span className="cd-qty-value">{item.qty}</span>
                        <button onClick={() => changeQty(item.id, item.qty + 1)} disabled={item.qty >= item.stockQty} className="cd-qty-btn">+</button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="cd-remove-btn">Eliminar</button>
                    </div>
                    {item.qty >= item.stockQty && <div className="cd-qty-limit">No hay más stock disponible</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Total y botón de finalizar compra (solo si hay algo en el carrito) */}
        {items.length > 0 && (
          <div className="cd-footer">
            <div className="cd-total-row">
              <span className="cd-total-label">Total</span>
              <span className="cd-total-value">${total.toLocaleString()}</span>
            </div>
            <button onClick={handleCheckoutClick} disabled={checkingOut} className="cd-checkout-btn">
              {checkingOut ? 'Procesando…' : 'Finalizar compra →'}
            </button>
            {checkoutError && <span className="cd-checkout-error">{checkoutError}</span>}
          </div>
        )}
      </div>

      {/* Formulario de datos de envío, o su confirmación una vez creado el pedido */}
      {(showCheckoutForm || confirmedOrder) && (
        <CheckoutModal
          userId={userId}
          total={total}
          submitting={checkingOut}
          error={checkoutError}
          confirmedOrder={confirmedOrder}
          onClose={dismissCheckout}
          onViewOrders={() => { dismissCheckout(); navigate('/cuenta'); }}
          onConfirm={confirmCheckout}
        />
      )}
    </>
  );
}
