import { getMonthlySales } from '../../services/adminService';

/** Rounds a 0–100 percentage to the nearest 5, for the .adm-h-N/.adm-w-N step classes. */
const step5 = (pct) => Math.min(100, Math.max(0, Math.round(pct / 5) * 5));

const MONTHLY_SALES = getMonthlySales();

const ORDER_STATUS = {
  completado: { label: 'Completado' },
  enviado:    { label: 'Enviado' },
  procesando: { label: 'Procesando' },
  cancelado:  { label: 'Cancelado' },
};

/* ─── KPI card ─── */
function KpiCard({ label, value, delta, deltaLabel, colorClass = 'adm-kpi-icon-box--brand', icon, prefix = '' }) {
  const up = delta !== undefined && delta >= 0;
  return (
    <div className="adm-card">
      <div className="adm-kpi-header">
        <div className={`adm-kpi-icon-box ${colorClass}`}>{icon}</div>
        {delta !== undefined && (
          <div className={`adm-kpi-delta ${up ? 'adm-kpi-delta--up' : 'adm-kpi-delta--down'}`}>
            {up
              ? <svg className="icon icon-11 icon-sw-3" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>
              : <svg className="icon icon-11 icon-sw-3" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
            }
            {Math.abs(delta)}%
          </div>
        )}
      </div>
      <div className="adm-kpi-value">{prefix}{typeof value === 'number' ? value.toLocaleString() : value}</div>
      <div className="adm-kpi-label">{label}</div>
      {deltaLabel && <div className="adm-kpi-delta-label">{deltaLabel}</div>}
    </div>
  );
}

/* ─── Mini sparkline ─── */
function Sparkline({ data }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 120, h = 40, pad = 4;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = pad + ((max - v) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(' ');
  const area = `M${pad},${h} L${pts.replace(/(\d+\.?\d*),(\d+\.?\d*)/g, '$1,$2 L').trimEnd()} L${w - pad},${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="adm-sparkline-svg">
      <defs>
        <linearGradient id="adm-spark-gradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" className="adm-spark-stop-start" />
          <stop offset="100%" className="adm-spark-stop-end" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#adm-spark-gradient)" />
      <polyline points={pts} className="adm-spark-line" />
    </svg>
  );
}

/* ─── Bar chart ─── */
function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.ventas));
  return (
    <div className="adm-bar-chart">
      {data.map((d, i) => {
        const pct = d.ventas / max;
        const isLast = i === data.length - 1;
        return (
          <div key={d.mes} className="adm-bar-col">
            <div className={`adm-bar-value ${isLast ? 'adm-bar-value--last' : ''}`}>${(d.ventas / 1000).toFixed(0)}k</div>
            <div className={`adm-bar adm-h-${step5(pct * 100)} ${isLast ? 'adm-bar--last' : ''}`} />
            <div className={`adm-bar-label ${isLast ? 'adm-bar-label--last' : ''}`}>{d.mes}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminDashboard({ products, discounts, recentOrders }) {
  const lowStock = products.filter(p => p.stock === 'low');
  const outStock = products.filter(p => p.stock === 'out');
  const activeDisc = discounts.filter(d => d.active);
  const totalRevenue = MONTHLY_SALES.reduce((s, m) => s + m.ventas, 0);
  const thisMonth = MONTHLY_SALES[MONTHLY_SALES.length - 1];
  const lastMonth = MONTHLY_SALES[MONTHLY_SALES.length - 2];
  const revDelta = Math.round(((thisMonth.ventas - lastMonth.ventas) / lastMonth.ventas) * 100);
  const ordDelta = Math.round(((thisMonth.ordenes - lastMonth.ordenes) / lastMonth.ordenes) * 100);

  // Category breakdown
  const catMap = {};
  products.forEach(p => {
    if (!catMap[p.category]) catMap[p.category] = { count: 0, revenue: 0 };
    catMap[p.category].count++;
    catMap[p.category].revenue += p.price;
  });
  const cats = Object.entries(catMap).sort((a, b) => b[1].revenue - a[1].revenue);
  const maxCatRev = cats[0]?.[1].revenue ?? 1;

  const conversionRate = 3.8;
  const avgOrder = Math.round(thisMonth.ventas / thisMonth.ordenes);

  return (
    <div className="adm-dash-col">

      {/* Date header */}
      <div className="adm-dash-header">
        <div>
          <h2 className="adm-dash-title">Resumen general</h2>
          <p className="adm-dash-subtitle">Septiembre 2026 · Actualizado hace 5 min</p>
        </div>
        <div className="adm-date-pill">
          <svg className="icon icon-14 icon-stroke-muted" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span className="adm-date-pill-text">Sep 2026</span>
        </div>
      </div>

      {/* KPI row */}
      <div className="adm-kpi-row">
        <KpiCard label="Ingresos del mes" value={thisMonth.ventas} prefix="$" delta={revDelta} deltaLabel="vs. mes anterior" colorClass="adm-kpi-icon-box--brand"
          icon={<svg className="icon icon-20 icon-sw-1_8" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
        />
        <KpiCard label="Órdenes del mes" value={thisMonth.ordenes} delta={ordDelta} deltaLabel="vs. mes anterior" colorClass="adm-kpi-icon-box--blue"
          icon={<svg className="icon icon-20 icon-sw-1_8" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>}
        />
        <KpiCard label="Ticket promedio" value={`$${avgOrder.toLocaleString()}`} delta={5} deltaLabel="por orden" colorClass="adm-kpi-icon-box--purple"
          icon={<svg className="icon icon-20 icon-sw-1_8" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>}
        />
        <KpiCard label="Tasa de conversión" value={`${conversionRate}%`} delta={0.4} deltaLabel="de visitas a compras" colorClass="adm-kpi-icon-box--green"
          icon={<svg className="icon icon-20 icon-sw-1_8" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
        />
      </div>

      {/* Middle row: chart + alerts */}
      <div className="adm-mid-grid">

        {/* Sales chart */}
        <div className="adm-card">
          <div className="adm-chart-header">
            <div>
              <div className="adm-chart-title">Ventas mensuales</div>
              <div className="adm-chart-subtitle">Últimos 6 meses · Total ${(totalRevenue / 1000).toFixed(0)}k</div>
            </div>
            <div className="adm-legend-item">
              <div className="adm-legend-dot" />
              <span className="adm-legend-text">Ingresos</span>
            </div>
          </div>
          <BarChart data={MONTHLY_SALES} />
          {/* Ordenes sparkline */}
          <div className="adm-orders-trend">
            <div>
              <div className="adm-orders-trend-label">Tendencia de órdenes</div>
              <div className="adm-orders-trend-value">{MONTHLY_SALES.reduce((s, m) => s + m.ordenes, 0)} <span className="adm-orders-trend-suffix">órdenes totales</span></div>
            </div>
            <Sparkline data={MONTHLY_SALES.map(m => m.ordenes)} />
          </div>
        </div>

        {/* Alerts panel */}
        <div className="adm-alerts-col">

          {/* Stock alerts */}
          <div className="adm-alerts-card">
            <div className="adm-alerts-header">
              <div className={`adm-alert-dot ${lowStock.length + outStock.length > 0 ? 'adm-alert-dot--warn' : 'adm-alert-dot--ok'}`} />
              <span className="adm-alerts-title">Alertas de stock</span>
              {(lowStock.length + outStock.length) > 0 && (
                <span className="adm-alerts-count">{lowStock.length + outStock.length}</span>
              )}
            </div>
            {outStock.length > 0 && outStock.map(p => (
              <div key={p.id} className="adm-alert-row">
                <img src={p.image} className="adm-alert-thumb" />
                <div className="adm-flex-fill">
                  <div className="adm-alert-name">{p.name}</div>
                  <span className="adm-alert-tag adm-alert-tag--out">Sin stock</span>
                </div>
              </div>
            ))}
            {lowStock.length > 0 && lowStock.map(p => (
              <div key={p.id} className="adm-alert-row">
                <img src={p.image} className="adm-alert-thumb" />
                <div className="adm-flex-fill">
                  <div className="adm-alert-name">{p.name}</div>
                  <span className="adm-alert-tag adm-alert-tag--low">Stock bajo</span>
                </div>
              </div>
            ))}
            {lowStock.length + outStock.length === 0 && (
              <div className="adm-alerts-empty">Todo el stock está en orden ✓</div>
            )}
          </div>

          {/* Discount usage */}
          <div className="adm-alerts-card">
            <div className="adm-alerts-title adm-alerts-title--block">Cupones activos</div>
            {activeDisc.map(d => {
              const pct = Math.round((d.uses / d.maxUses) * 100);
              const nearLimit = pct >= 80;
              return (
                <div key={d.id} className="adm-coupon-block">
                  <div className="adm-coupon-header">
                    <span className="adm-coupon-code">{d.code}</span>
                    <span className={`adm-coupon-usage ${nearLimit ? 'adm-coupon-usage--near' : ''}`}>{d.uses}/{d.maxUses}</span>
                  </div>
                  <div className="adm-progress-track">
                    <div className={`adm-progress-fill adm-w-${step5(pct)} ${nearLimit ? 'adm-progress-fill--warn' : ''}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom row: recent orders + top products */}
      <div className="adm-bottom-grid">

        {/* Recent orders */}
        <div className="adm-panel">
          <div className="adm-panel-header">
            <span className="adm-panel-title">Órdenes recientes</span>
            <span className="adm-panel-subtitle">Últimas 6</span>
          </div>
          <table className="adm-table">
            <thead>
              <tr>
                {['Orden', 'Cliente', 'Producto', 'Monto', 'Estado', 'Fecha'].map(h => (
                  <th key={h} className="adm-th adm-th--dashboard">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => {
                const s = ORDER_STATUS[o.status];
                return (
                  <tr key={o.id} className="adm-td-row">
                    <td className="adm-td adm-order-id-cell">{o.id}</td>
                    <td className="adm-td adm-order-customer-cell">{o.customer}</td>
                    <td className="adm-td adm-order-product-cell">{o.product}</td>
                    <td className="adm-td adm-order-amount-cell">${o.amount.toLocaleString()}</td>
                    <td className="adm-td">
                      <span className={`adm-order-status-badge adm-status--${o.status}`}>{s.label}</span>
                    </td>
                    <td className="adm-td adm-order-date-cell">{o.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Top categories by revenue */}
        <div className="adm-alerts-card">
          <div className="adm-cat-revenue-title">Categorías por ingresos</div>
          <div className="adm-cat-revenue-subtitle">Basado en precio de catálogo</div>
          {cats.map(([cat, data], i) => {
            const pct = Math.round((data.revenue / maxCatRev) * 100);
            const colorClass = `adm-cat-color-${i % 7}`;
            return (
              <div key={cat} className="adm-cat-row">
                <div className="adm-cat-row-header">
                  <div className="adm-cat-row-left">
                    <div className={`adm-cat-dot ${colorClass}`} />
                    <span className="adm-cat-name">{cat}</span>
                  </div>
                  <span className="adm-cat-count">{data.count} prod.</span>
                </div>
                <div className="adm-cat-bar-track">
                  <div className={`adm-cat-bar-fill adm-w-${step5(pct)} ${colorClass}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
