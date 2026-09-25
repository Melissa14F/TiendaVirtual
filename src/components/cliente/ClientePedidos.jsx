import { useState } from 'react';
import { statusBucket } from '../../services/ordersService';

/**
 * Icon per status BUCKET, not per exact value — MockAPI's estado_orden
 * has 10 real values (Pendiente, Confirmado, En preparación, Enviado, En
 * camino, Entregado, Devuelto, Reembolsado, Cancelado, En espera de
 * pago); the label shown is always the real value itself, this only
 * picks which icon/color group it falls under.
 */
const BUCKET_ICON = {
  entregado:  <svg className="icon icon-13 icon-sw-2_5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
  enviado:    <svg className="icon icon-13" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  procesando: <svg className="icon icon-13" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  cancelado:  <svg className="icon icon-13" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
};

const TERMINAL_STATUSES = new Set(['Entregado', 'Cancelado', 'Devuelto', 'Reembolsado']);

/** Clickable 1-5 star input, hover-previews the value before you commit. */
function StarRatingInput({ value, disabled, onRate }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="ca-rate-stars">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onRate(n)}
          title={`${n} estrella${n > 1 ? 's' : ''}`}
          className="ca-rate-star-btn"
        >
          <svg className={`icon-fill icon-16 ${n <= shown ? 'icon-star-filled' : 'icon-star-empty'}`} viewBox="0 0 24 24">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </button>
      ))}
    </div>
  );
}

function ReceiptModal({ order, onClose }) {
  return (
    <>
      <div onClick={onClose} className="ca-modal-overlay" />
      <div className="ca-modal">
        <div className="ca-modal-header">
          <h3 className="ca-modal-title">Comprobante {order.id}</h3>
          <button onClick={onClose} className="ca-modal-close">×</button>
        </div>
        <div className="ca-modal-body">
          <div className="ca-receipt-row"><span>Fecha</span><span>{order.date}</span></div>
          <div className="ca-receipt-row"><span>Estado</span><span>{order.status}</span></div>
          <div className="ca-receipt-row"><span>Método de pago</span><span>{order.payment}</span></div>
          <div className="ca-receipt-row"><span>Dirección</span><span>{order.address || '—'}</span></div>

          <div className="ca-receipt-divider" />

          {order.items.map((item, i) => (
            <div key={i} className="ca-receipt-row">
              <span>{item.name} × {item.qty}</span>
              <span>${(item.price * item.qty).toLocaleString()}</span>
            </div>
          ))}

          <div className="ca-receipt-divider" />

          <div className="ca-receipt-row ca-receipt-row--total">
            <span>Total</span>
            <span>${order.total.toLocaleString()}</span>
          </div>
        </div>
        <div className="ca-modal-actions">
          <button onClick={onClose} className="ca-btn-ghost">Cerrar</button>
          <button onClick={() => window.print()} className="ca-btn-outline">Imprimir</button>
        </div>
      </div>
    </>
  );
}

export default function ClientePedidos({ orders, expanded, setExpanded, onReorder, onCancelOrder, onRateItem }) {
  const delivered = orders.filter(o => o.status === 'Entregado').length;
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelError, setCancelError] = useState(null);
  const [ratingItemId, setRatingItemId] = useState(null);
  const [rateError, setRateError] = useState(null);

  const handleCancelClick = async (order) => {
    if (!window.confirm(`¿Seguro que querés cancelar el pedido ${order.id}?`)) return;
    setCancellingId(order.id);
    setCancelError(null);
    try {
      await onCancelOrder(order);
    } catch (err) {
      setCancelError({ orderId: order.id, message: err.message });
    } finally {
      setCancellingId(null);
    }
  };

  const handleRate = async (order, item, stars) => {
    setRatingItemId(item.detalleId);
    setRateError(null);
    try {
      await onRateItem(order, item, stars);
    } catch (err) {
      setRateError({ itemId: item.detalleId, message: err.message });
    } finally {
      setRatingItemId(null);
    }
  };

  return (
    <div className="ca-orders-grid">
      <div className="ca-orders-list">
        {orders.length === 0 && (
          <div className="ca-orders-status">Todavía no hiciste ningún pedido.</div>
        )}
        {orders.map(order => {
          const bucket = statusBucket(order.status);
          const isOpen = expanded === order.id;
          return (
            <div key={order.id} className={`ca-order-card ${isOpen ? 'ca-order-card--open' : ''}`}>
              {/* Order header */}
              <button onClick={() => setExpanded(isOpen ? null : order.id)} className="ca-order-header-btn">
                {/* Product thumbnails */}
                <div className="ca-order-thumbs">
                  {order.items.slice(0, 3).map((item, i) => (
                    <img key={i} src={item.image} alt={item.name} className={`ca-order-thumb ${i > 0 ? 'ca-order-thumb--stacked' : ''}`} />
                  ))}
                  {order.items.length > 3 && (
                    <div className="ca-order-thumb-more">+{order.items.length - 3}</div>
                  )}
                </div>

                <div className="ca-order-summary">
                  <div className="ca-order-id-row">
                    <span className="ca-order-id">{order.id}</span>
                    <span className={`ca-order-status-pill ca-status--${bucket}`}>{BUCKET_ICON[bucket]}{order.status}</span>
                  </div>
                  <div className="ca-order-meta">
                    {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'} · {order.date}
                  </div>
                </div>

                <div className="ca-order-total-col">
                  <div className="ca-order-total">${order.total.toLocaleString()}</div>
                  <div className="ca-order-payment">{order.payment}</div>
                </div>

                <svg className={`ca-order-chevron ${isOpen ? 'ca-order-chevron--open' : ''} icon icon-16 icon-sw-2_5 icon-stroke-muted`} viewBox="0 0 24 24">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div className="ca-order-detail">
                  {/* Items list */}
                  <div className="ca-order-items-list">
                    {order.items.map((item, i) => (
                      <div key={i} className="ca-order-item-row">
                        <img src={item.image} alt={item.name} className="ca-order-item-img" />
                        <div className="ca-flex-1">
                          <div className="ca-order-item-name">{item.name}</div>
                          <div className="ca-order-item-meta">{item.brand} · Cantidad: {item.qty}</div>
                          {order.status === 'Entregado' && (
                            <div className="ca-order-item-rate">
                              <span className="ca-order-item-rate-label">{item.rating ? 'Tu calificación' : 'Calificar producto'}</span>
                              <StarRatingInput
                                value={item.rating ?? 0}
                                disabled={ratingItemId === item.detalleId}
                                onRate={stars => handleRate(order, item, stars)}
                              />
                              {rateError?.itemId === item.detalleId && (
                                <span className="ca-coupon-error">{rateError.message}</span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="ca-order-item-price">${item.price.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>

                  {/* Metadata grid */}
                  <div className="ca-order-meta-grid">
                    {[
                      { label: 'N° seguimiento', value: order.tracking || 'Aún no disponible', icon: <svg className="icon icon-13" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
                      { label: 'Dirección de entrega', value: order.address, icon: <svg className="icon icon-13" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> },
                      { label: 'Código postal', value: order.postalCode, icon: <svg className="icon icon-13" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> },
                      { label: 'Método de pago', value: order.payment, icon: <svg className="icon icon-13" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
                    ].map((meta, i) => (
                      <div key={i} className={`ca-order-meta-cell ${i % 2 === 0 ? 'ca-order-meta-cell--bordered-r' : ''} ${i < 2 ? 'ca-order-meta-cell--bordered-b' : ''}`}>
                        <div className="ca-order-meta-label-row">
                          {meta.icon}
                          <span className="ca-order-meta-label">{meta.label}</span>
                        </div>
                        <div className="ca-order-meta-value">{meta.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="ca-order-actions">
                    {order.status === 'Entregado' && (
                      <button
                        onClick={() => onReorder(order.items)}
                        disabled={order.items.every(item => !item.id)}
                        className="ca-btn-outline"
                      >
                        Volver a comprar
                      </button>
                    )}
                    <button onClick={() => setReceiptOrder(order)} className="ca-btn-ghost">Ver comprobante</button>
                    {!TERMINAL_STATUSES.has(order.status) && (
                      <button
                        onClick={() => handleCancelClick(order)}
                        disabled={cancellingId === order.id}
                        className="ca-btn-danger-outline"
                      >
                        {cancellingId === order.id ? 'Cancelando…' : 'Cancelar pedido'}
                      </button>
                    )}
                  </div>
                  {cancelError?.orderId === order.id && (
                    <span className="ca-coupon-error">{cancelError.message}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sidebar summary */}
      <div className="ca-sidebar">
        {/* Stats */}
        <div className="ca-sidebar-card">
          <div className="ca-sidebar-title">Resumen de compras</div>
          {[
            { label: 'Total pedidos', value: orders.length, className: '' },
            { label: 'Entregados', value: delivered, className: 'ca-stat-value--success' },
            { label: 'Cancelados', value: orders.filter(o => statusBucket(o.status) === 'cancelado').length, className: 'ca-stat-value--danger' },
            { label: 'Total gastado', value: `$${orders.filter(o => o.status === 'Entregado').reduce((s, o) => s + o.total, 0).toLocaleString()}`, className: 'ca-stat-value--brand' },
          ].map(s => (
            <div key={s.label} className="ca-stat-row">
              <span className="ca-stat-label">{s.label}</span>
              <span className={`ca-stat-value ${s.className}`}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Last purchased */}
        {orders.length > 0 && (
          <div className="ca-promo-card">
            <div className="ca-promo-label">Último pedido</div>
            <div className="ca-promo-order-id">{orders[0].id}</div>
            <div className="ca-promo-date">{orders[0].date}</div>
            <div className="ca-promo-badge">
              {BUCKET_ICON[statusBucket(orders[0].status)]}
              {orders[0].status}
            </div>
          </div>
        )}
      </div>

      {receiptOrder && <ReceiptModal order={receiptOrder} onClose={() => setReceiptOrder(null)} />}
    </div>
  );
}
