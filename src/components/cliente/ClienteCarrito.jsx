import { useState, useEffect } from 'react';
import { getDiscounts, calculateDiscount } from '../../services/discountsService';
import { getSavedShippingInfo } from '../../services/clienteService';
import CheckoutModal from '../common/CheckoutModal';

const COUPON_ERROR_LABEL = {
  inactive: 'Este cupón ya no está activo.',
  expired: 'Este cupón venció.',
  max_uses: 'Este cupón alcanzó su límite de usos.',
  min_order: 'Tu compra no alcanza el mínimo requerido para este cupón.',
};

// Pestaña "Mi carrito" de la cuenta del cliente: ítems, cupón de
// descuento y el formulario de checkout completo (con resumen de pedido).
export default function ClienteCarrito({ items, userId, onChangeQty, onRemove, cartTotal, onCheckout, onOrderPlaced }) {
  const [coupon, setCoupon] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [discounts, setDiscounts] = useState([]);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState(null); // pedido recién creado, mientras se muestra su confirmación

  useEffect(() => {
    let cancelled = false;
    getDiscounts().then(data => { if (!cancelled) setDiscounts(data); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const shipping = cartTotal > 500 ? 0 : 12.99;
  const discount = appliedDiscount?.amount ?? 0;
  const finalTotal = cartTotal - discount + shipping;

  const applyCoupon = () => {
    const match = discounts.find(d => d.code === coupon.trim().toUpperCase());
    if (!match) { setCouponError('Cupón no válido.'); return; }
    const result = calculateDiscount(match, cartTotal);
    if (!result.eligible) {
      setCouponError(COUPON_ERROR_LABEL[result.reason] ?? 'Este cupón no se puede aplicar.');
      return;
    }
    setCouponError('');
    setAppliedDiscount({ id: match.id, code: match.code, amount: result.amount });
  };

  const placeOrderWithDetails = async (orderDetails) => {
    setCheckingOut(true);
    setCheckoutError('');
    try {
      const order = await onCheckout(discount, shipping, orderDetails, appliedDiscount?.id);
      setShowCheckoutForm(false);
      setConfirmedOrder({ ...order, items });
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

  // The form only shows up once (the first purchase) — once the client
  // has shipping info on file, later checkouts reuse it directly.
  const handleCheckoutClick = async () => {
    setCheckoutError('');
    const saved = await getSavedShippingInfo(userId).catch(() => null);
    if (saved) placeOrderWithDetails(saved);
    else setShowCheckoutForm(true);
  };

  if (items.length === 0 && !confirmedOrder) return (
    <div className="ca-cart-empty">
      <div className="ca-cart-empty-icon-box">
        <svg className="icon icon-32 icon-sw-1_5 icon-stroke-border" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
      </div>
      <div className="ca-cart-empty-title">Tu carrito está vacío</div>
      <div className="ca-cart-empty-sub">Explorá nuestra tienda y encontrá algo que te guste</div>
    </div>
  );

  return (
    <div className="ca-cart-grid">
      {/* Items */}
      <div className="ca-cart-items">
        {items.map(item => (
          <div key={item.id} className="ca-cart-item">
            <img src={item.image} alt={item.name} className="ca-cart-item-img" />
            <div className="ca-flex-fill">
              <div className="ca-cart-item-name">{item.name}</div>
              <div className="ca-cart-item-brand">{item.brand}</div>
              <div className="ca-cart-item-controls">
                <div className="ca-qty-wrap">
                  <button onClick={() => item.qty <= 1 ? onRemove(item.id) : onChangeQty(item.id, item.qty - 1)} className="ca-qty-btn">−</button>
                  <span className="ca-qty-value">{item.qty}</span>
                  <button onClick={() => onChangeQty(item.id, item.qty + 1)} disabled={item.qty >= item.stockQty} className="ca-qty-btn">+</button>
                </div>
                <button onClick={() => onRemove(item.id)} className="ca-cart-remove-btn">
                  <svg className="icon icon-13" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                  Eliminar
                </button>
              </div>
              {item.qty >= item.stockQty && <div className="ca-qty-limit">No hay más stock disponible</div>}
            </div>
            <div className="ca-cart-item-total-col">
              <div className="ca-cart-item-total">${(item.price * item.qty).toLocaleString()}</div>
              {item.qty > 1 && <div className="ca-cart-item-unit">${item.price.toLocaleString()} c/u</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Order summary */}
      <div className="ca-summary-card">
        <div className="ca-summary-title">Resumen del pedido</div>

        <div className="ca-summary-rows">
          <div className="ca-summary-row">
            <span>Subtotal ({items.reduce((s, i) => s + i.qty, 0)} items)</span>
            <span className="ca-summary-row-value">${cartTotal.toLocaleString()}</span>
          </div>
          {appliedDiscount && (
            <div className="ca-summary-row ca-summary-row--discount">
              <span>Cupón {appliedDiscount.code}</span>
              <span className="ca-summary-row-discount-value">−${discount.toLocaleString()}</span>
            </div>
          )}
          <div className="ca-summary-row">
            <span>Envío</span>
            <span className={`ca-summary-row-value ${shipping === 0 ? 'ca-summary-row-value--free' : ''}`}>{shipping === 0 ? 'Gratis' : `$${shipping}`}</span>
          </div>
          {shipping === 0 && <div className="ca-summary-free-ship">✓ Superaste el mínimo para envío gratis</div>}
        </div>

        {/* Coupon */}
        <div className="ca-coupon-wrap">
          <div className="ca-coupon-label">Código de descuento</div>
          <div className="ca-coupon-row">
            <input value={coupon} onChange={e => { setCoupon(e.target.value.toUpperCase()); setCouponError(''); }} placeholder="Código de cupón" disabled={!!appliedDiscount}
              className={`ca-coupon-input ${appliedDiscount ? 'ca-coupon-input--applied' : ''}`}
            />
            <button onClick={applyCoupon}
              disabled={!!appliedDiscount}
              className={`ca-coupon-apply-btn ${appliedDiscount ? 'ca-coupon-apply-btn--applied' : ''}`}>
              {appliedDiscount ? '✓' : 'Aplicar'}
            </button>
          </div>
          {couponError && <span className="ca-coupon-error">{couponError}</span>}
        </div>

        <div className="ca-summary-divider">
          <div className="ca-summary-total-row">
            <span className="ca-summary-total-label">Total</span>
            <span className="ca-summary-total-value">${finalTotal.toLocaleString()}</span>
          </div>
        </div>

        <button onClick={handleCheckoutClick} disabled={checkingOut} className="ca-checkout-btn">
          {checkingOut ? 'Procesando…' : 'Finalizar compra →'}
        </button>
        {checkoutError && <span className="ca-coupon-error">{checkoutError}</span>}

        <div className="ca-secure-row">
          <svg className="icon icon-13 icon-stroke-muted" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span className="ca-secure-text">Pago 100% seguro y encriptado</span>
        </div>
      </div>

      {(showCheckoutForm || confirmedOrder) && (
        <CheckoutModal
          userId={userId}
          total={finalTotal}
          submitting={checkingOut}
          error={checkoutError}
          confirmedOrder={confirmedOrder}
          onClose={dismissCheckout}
          onViewOrders={() => { dismissCheckout(); onOrderPlaced(); }}
          onConfirm={placeOrderWithDetails}
        />
      )}
    </div>
  );
}
