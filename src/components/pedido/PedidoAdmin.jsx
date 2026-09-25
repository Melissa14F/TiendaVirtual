import { useState, Fragment } from 'react';
import { updateOrderStatus, statusBucket } from '../../services/adminService';
import { SectionHeader, Th, Td, IconBtn } from '../admin/shared';

export default function PedidoAdmin({ orders, setOrders, statuses, showToast }) {
  const [expanded, setExpanded] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [errorById, setErrorById] = useState({});
  const [search, setSearch] = useState('');

  const filtered = orders.filter(o =>
    o.displayId.toLowerCase().includes(search.toLowerCase()) ||
    o.customer.toLowerCase().includes(search.toLowerCase()) ||
    (o.tracking ?? '').toLowerCase().includes(search.toLowerCase())
  );

  // The dropdown offers whatever's actually configured in "Estados de
  // pedido" — an order's own current status is always kept as an option
  // too, even if it was since deactivated/renamed there, so changing it
  // never silently reassigns the order to something else.
  const statusOptions = new Set(statuses.filter(s => s.active).map(s => s.name));

  const handleStatusChange = async (order, newEstado) => {
    setUpdatingId(order.id);
    setErrorById(e => ({ ...e, [order.id]: '' }));
    try {
      await updateOrderStatus(order.id, newEstado);
      setOrders(orders.map(o => o.id === order.id ? { ...o, estado: newEstado } : o));
      showToast(`Pedido ${order.displayId} → "${newEstado}"`);
    } catch (err) {
      setErrorById(e => ({ ...e, [order.id]: err.message }));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <SectionHeader title={`Pedidos (${orders.length})`} />

      {/* Search */}
      <div className="adm-search-wrap">
        <svg className="adm-search-icon icon icon-14 icon-sw-2_5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por orden, cliente o seguimiento..." className="adm-search-input" />
      </div>

      <div className="adm-panel">
        <table className="adm-table">
          <thead>
            <tr>
              <Th>Orden</Th><Th>Cliente</Th><Th>Fecha</Th><Th>Total</Th><Th>Estado</Th><Th>Seguimiento</Th><Th></Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o, i) => {
              const isOpen = expanded === o.id;
              return (
                <Fragment key={o.id}>
                  <tr className={i > 0 ? 'adm-td-row' : ''}>
                    <Td className="adm-order-id-cell">{o.displayId}</Td>
                    <Td>{o.customer}</Td>
                    <Td className="adm-text-muted adm-text-sm">{o.date}</Td>
                    <Td className="adm-order-amount-cell">${o.total.toLocaleString()}</Td>
                    <Td>
                      <div className="adm-order-status-cell">
                        <select
                          value={o.estado}
                          onChange={e => handleStatusChange(o, e.target.value)}
                          disabled={updatingId === o.id}
                          className={`adm-order-status-select adm-status--${statusBucket(o.estado)}`}
                        >
                          {!statusOptions.has(o.estado) && (
                            <option value={o.estado}>{o.estado}</option>
                          )}
                          {statuses.filter(s => s.active).map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                        </select>
                        {errorById[o.id] && <span className="adm-form-error">{errorById[o.id]}</span>}
                      </div>
                    </Td>
                    <Td className="adm-text-muted adm-text-sm">{o.tracking || '—'}</Td>
                    <Td>
                      <IconBtn onClick={() => setExpanded(isOpen ? null : o.id)} title={isOpen ? 'Ocultar' : 'Ver detalle'}>
                        <svg className={`icon icon-16 icon-sw-2_5 ${isOpen ? 'adm-chevron--open' : ''}`} viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
                      </IconBtn>
                    </Td>
                  </tr>
                  {isOpen && (
                    <tr>
                      <td colSpan={7} className="adm-order-detail-cell">
                        <div className="adm-order-detail-grid">
                          <div>
                            <div className="adm-order-detail-label">Productos</div>
                            {o.items.length === 0 ? (
                              <div className="adm-text-muted adm-text-sm">Sin líneas de detalle cargadas para este pedido.</div>
                            ) : o.items.map((item, idx) => (
                              <div key={idx} className="adm-order-detail-item">
                                {item.image && <img src={item.image} alt={item.name} className="adm-order-detail-img" />}
                                <span className="adm-flex-fill">{item.name} × {item.qty}</span>
                                <span className="adm-text-muted">${(item.price * item.qty).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                          <div>
                            <div className="adm-order-detail-label">Envío</div>
                            <div className="adm-text-sm">{o.address || '—'}</div>
                            <div className="adm-text-sm adm-text-muted">{o.postalCode}</div>
                            <div className="adm-order-detail-label adm-order-detail-label--spaced">Pago</div>
                            <div className="adm-text-sm">{o.payment}</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
