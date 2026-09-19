import { NavLink } from 'react-router-dom';
import logo from '../../assets/logo.svg';

export const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: <svg className="icon icon-16" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
  { id: 'products', label: 'Productos', icon: <svg className="icon icon-16" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> },
  { id: 'orders', label: 'Pedidos', icon: <svg className="icon icon-16" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
  { id: 'orderstatus', label: 'Estados de pedido', icon: <svg className="icon icon-16" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { id: 'clientes', label: 'Clientes', icon: <svg className="icon icon-16" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { id: 'categories', label: 'Categorías', icon: <svg className="icon icon-16" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> },
  { id: 'discounts', label: 'Descuentos', icon: <svg className="icon icon-16" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> },
  { id: 'banners', label: 'Anuncios', icon: <svg className="icon icon-16" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> },
  { id: 'pageinfo', label: 'Info de la tienda', icon: <svg className="icon icon-16" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
  { id: 'usuarios', label: 'Usuarios', icon: <svg className="icon icon-16" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
];

/**
 * URL segment for each internal section id — kept separate from the id
 * itself because `id` doubles as the value stored in an admin's
 * `permisos` array in MockAPI (see ADMIN_SECTIONS in authService.js).
 * Renaming the id to match a nicer URL would silently break permission
 * checks for admins that already have permissions saved.
 */
export const ROUTE_SLUG = {
  dashboard: '', products: 'productos', orders: 'pedidos', orderstatus: 'estados-pedido',
  clientes: 'clientes', categories: 'categorias', discounts: 'descuentos', banners: 'anuncios',
  pageinfo: 'informacion', usuarios: 'usuarios', settings: 'configuracion',
};

// Reverso de ROUTE_SLUG, para saber en qué sección está parado el admin a partir de la URL actual.
export const SLUG_TO_ID = Object.fromEntries(Object.entries(ROUTE_SLUG).map(([id, slug]) => [slug, id]));

/**
 * Which NAV entries a logged-in admin actually gets to see. The principal
 * sees everything, including "Usuarios" (managing other admin accounts is
 * principal-only, not a grantable permission — see ADMIN_SECTIONS in
 * authService.js). Everyone else sees Dashboard plus whatever sections
 * they were explicitly granted.
 */
export function getVisibleNav({ isPrincipal, permissions = [] }) {
  if (isPrincipal) return NAV;
  const allowed = new Set(['dashboard', ...permissions]);
  return NAV.filter(item => item.id !== 'usuarios' && allowed.has(item.id));
}

/**
 * Top-level, not defined inside AdminShell — a component declared inside
 * another component's body gets a new identity every render, so React
 * remounts its DOM on every state change in the parent. No text input
 * lives here, so it never showed a visible bug, but it's the same
 * underlying issue as BannerForm/FiltersContent, fixed the same way.
 */
export function SidebarContent({ isMobile, setSidebarOpen, storeInfo, onExit, onLogout, isPrincipal, permissions }) {
  const visibleNav = getVisibleNav({ isPrincipal, permissions });
  return (
    <>
      {/* Logo */}
      <div className="adm-sidebar-logo-wrap">
        <div className="adm-sidebar-logo-row">
          <div className="adm-sidebar-logo-info">
            <div className="adm-sidebar-logo-box">
              <img src={logo} alt={storeInfo.storeName} className="hdr-logo-img" />
            </div>
            <div>
              <div className="adm-sidebar-brand">{storeInfo.storeName}</div>
              <div className="adm-sidebar-subtitle">Panel Admin</div>
            </div>
          </div>
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)} className="adm-sidebar-close">✕</button>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="adm-sidebar-nav">
        {visibleNav.map(item => (
          <NavLink key={item.id} to={`/admin/${ROUTE_SLUG[item.id]}`} end={item.id === 'dashboard'} onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `adm-sidebar-nav-btn ${isActive ? 'adm-sidebar-nav-btn--active' : ''}`}
          >
            {item.icon}{item.label}
          </NavLink>
        ))}
      </nav>

      {/* Exit */}
      <div className="adm-sidebar-exit-wrap">
        {isMobile && (
          <NavLink to="/admin/configuracion" onClick={() => setSidebarOpen(false)} className="adm-sidebar-exit-btn adm-sidebar-exit-btn--neutral">
            <svg className="icon icon-15" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            Configuración
          </NavLink>
        )}
        <button onClick={onExit} className="adm-sidebar-exit-btn">
          <svg className="icon icon-15" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Volver a la tienda
        </button>
        {isMobile && (
          <button onClick={onLogout} className="adm-sidebar-exit-btn">
            <svg className="icon icon-15" viewBox="0 0 24 24"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
            Cerrar sesión
          </button>
        )}
      </div>
    </>
  );
}
