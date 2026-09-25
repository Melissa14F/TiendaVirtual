import { useState } from 'react';
import { getSavedShippingInfo } from '../../services/clienteService';
import CheckoutModal from '../common/CheckoutModal';
import '../../styles/ProductoDetalle.css';

// Relaciona cada tipo de etiqueta de producto con su clase CSS de color.
const BADGE_CLASS = {
  'Nuevo': 'pd-badge--nuevo',
  'Gaming': 'pd-badge--gaming',
  'Oferta': 'pd-badge--oferta',
};

// Vista de detalle de un producto: imagen grande, descripción, selector
// de cantidad, y los botones de "Agregar al carrito" / "Comprar ahora".
export default function ProductoDetalle({ product, userId, onBack, onAddToCart, onBuyNow, onViewOrders, isFavorite, onToggleFavorite }) {
  const [qty, setQty] = useState(1); // cantidad elegida
  const [showCheckoutForm, setShowCheckoutForm] = useState(false); // si se muestra el formulario de datos de envío
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState(null); // pedido recién creado, mientras se muestra su confirmación

  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
  const outOfStock = product.stock === 'out';
  const maxQty = Math.max(product.stockQty, 1); // no deja elegir más cantidad de la que hay en stock

  // Confirma la compra directa ("Comprar ahora") con los datos de envío ya
  // definidos (sea porque el cliente los completó en el formulario, o
  // porque ya los tenía guardados de antes). El modal se queda abierto
  // mostrando la confirmación en vez de navegar en silencio.
  const placeOrderWithDetails = async (orderDetails) => {
    setBuying(true);
    setBuyError('');
    try {
      const order = await onBuyNow(product, qty, orderDetails);
      setShowCheckoutForm(false);
      setConfirmedOrder({ ...order, items: [{ ...product, qty }] });
    } catch (err) {
      setBuyError(err.message);
    } finally {
      setBuying(false);
    }
  };

  const dismissCheckout = () => {
    setShowCheckoutForm(false);
    setConfirmedOrder(null);
  };

  // onBuyNow itself redirects to login when nobody's signed in — no point
  // showing the order-details form to a guest, so this checks first and
  // skips straight to that redirect without opening it. Once the client
  // already has shipping info on file, the form only shows up once (the
  // first purchase) — later ones reuse it directly.
  const handleBuyNowClick = async () => {
    if (!userId) { onBuyNow(product, qty); return; } // invitado: onBuyNow lo redirige al login
    setBuyError('');
    const saved = await getSavedShippingInfo(userId).catch(() => null);
    if (saved) placeOrderWithDetails(saved); // ya tiene dirección guardada -> compra directo
    else setShowCheckoutForm(true); // primera compra -> pide los datos
  };

  return (
    <div className="pd-container">
      <button onClick={onBack} className="pd-back-btn">
        <svg className="icon icon-14 icon-sw-2_5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
        Volver
      </button>

      <div className="pd-grid">
        {/* Imagen principal, con la etiqueta y el badge de descuento superpuestos */}
        <div className="pd-image-wrap">
          <img src={product.image} alt={product.name} className="pd-image" />
          {product.badge && (
            <span className={`pd-badge ${BADGE_CLASS[product.badge.label] ?? 'pd-badge--default'}`}>
              {product.badge.label}
            </span>
          )}
          {discount > 0 && <span className="pd-discount-badge">-{discount}%</span>}
        </div>

        {/* Info del producto: marca, nombre, categoría, precio, descripción, cantidad y acciones */}
        <div className="pd-info">
          <div className="pd-brand">{product.brand}</div>
          <h1 className="pd-name">{product.name}</h1>
          <div className="pd-category">{product.category}</div>

          <div className="pd-price-row">
            <span className="pd-price">${product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="pd-price-original">${product.originalPrice.toLocaleString()}</span>
            )}
          </div>

          {product.description && <p className="pd-description">{product.description}</p>}

          {/* Selector de cantidad (solo si hay stock disponible) */}
          {!outOfStock && (
            <div className="pd-qty-row">
              <span className="pd-qty-label">Cantidad</span>
              <div className="pd-qty-wrap">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="pd-qty-btn">−</button>
                <span className="pd-qty-value">{qty}</span>
                <button onClick={() => setQty(q => Math.min(maxQty, q + 1))} className="pd-qty-btn">+</button>
              </div>
            </div>
          )}

          {/* Aviso de pocas unidades disponibles */}
          {product.stock === 'low' && (
            <p className="pd-low-stock-warning">¡Solo quedan {product.stockQty} unidades!</p>
          )}

          {/* Botón de favorito (solo aparece si hay un cliente logueado, ver onToggleFavorite en App.jsx) */}
          {onToggleFavorite && (
            <button onClick={() => onToggleFavorite(product)} className="pd-favorite-btn">
              <svg className={`icon icon-16 icon-sw-2_5 ${isFavorite ? 'pd-favorite-icon--active' : ''}`} viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {isFavorite ? 'En tus favoritos' : 'Agregar a favoritos'}
            </button>
          )}

          {/* Botones de compra */}
          <div className="pd-actions">
            <button
              onClick={() => onAddToCart(product, qty)}
              disabled={outOfStock}
              className={`pd-add-btn ${outOfStock ? 'pd-add-btn--disabled' : ''}`}
            >
              <svg className="icon icon-15 icon-sw-2_5" viewBox="0 0 24 24">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              Agregar al carrito
            </button>
            <button
              onClick={handleBuyNowClick}
              disabled={outOfStock || buying}
              className={`pd-buy-btn ${outOfStock ? 'pd-buy-btn--disabled' : ''}`}
            >
              {buying ? 'Procesando…' : 'Comprar ahora →'}
            </button>
          </div>
          {buyError && <span className="pd-buy-error">{buyError}</span>}
        </div>
      </div>

      {/* Formulario de datos de envío (ver handleBuyNowClick), o su confirmación una vez creado el pedido */}
      {(showCheckoutForm || confirmedOrder) && (
        <CheckoutModal
          userId={userId}
          total={product.price * qty}
          submitting={buying}
          error={buyError}
          confirmedOrder={confirmedOrder}
          onClose={dismissCheckout}
          onViewOrders={() => { dismissCheckout(); onViewOrders(); }}
          onConfirm={placeOrderWithDetails}
        />
      )}
    </div>
  );
}
