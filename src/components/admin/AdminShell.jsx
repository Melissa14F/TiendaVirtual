import { useState, useRef, useEffect } from 'react';
import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from '../../hooks/useBreakpoint';
import { useAuth } from '../../context/AuthContext';
import { getPageInfo, DEFAULT_PAGE_INFO } from '../../services/pageInfoService';
import { NAV, ROUTE_SLUG, SLUG_TO_ID, SidebarContent, getVisibleNav } from './AdminSidebar';
import { Toast } from './shared';
import '../../styles/AdminView.css';

/**
 * Layout route for every /admin/* page: sidebar + topbar + the toast
 * notification system, shared by all 10 admin sections instead of each
 * one reimplementing it. Also the single gate that checks the logged-in
 * admin is allowed on the current section (see getVisibleNav) — a
 * non-principal admin without "Productos" granted gets the same "No
 * tenés permiso" message no matter how they land on /admin/productos.
 */
export default function AdminShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { userRole, userId, userName, userEmail, isPrincipal, permissions, logout } = useAuth();

  const [storeInfo, setStoreInfo] = useState(DEFAULT_PAGE_INFO);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const userMenuRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  const visibleNav = getVisibleNav({ isPrincipal, permissions });
  const allowedSections = new Set(['dashboard', 'settings', ...visibleNav.map(n => n.id)]);

  // Sección actual, derivada de la URL (en vez de un estado local) —
  // así el título de la topbar y el chequeo de permisos siempre reflejan
  // la ruta real, sin importar cómo se llegó a ella (sidebar, botón
  // "atrás" del navegador, un link directo).
  const slug = location.pathname.replace(/^\/admin\/?/, '');
  const currentId = SLUG_TO_ID[slug] ?? 'dashboard';

  /** Every page gets this via outlet context — called right after a
   * create/update/delete/toggle succeeds, so the admin always sees
   * explicit confirmation of what just happened instead of only a
   * silent row change in a table. */
  const showToast = (message) => {
    setToastMessage(message);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => () => clearTimeout(toastTimeoutRef.current), []);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    let cancelled = false;
    getPageInfo().then(data => { if (!cancelled && data) setStoreInfo(data); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Cierra el sidebar mobile cada vez que cambia de sección.
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  if (userRole !== 'admin') return <Navigate to="/login" replace />;

  const handleExit = () => navigate('/');
  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="adm-root">
      {/* Sidebar — sticky en desktop, deslizable en mobile */}
      {!isMobile && (
        <aside className="adm-sidebar">
          <SidebarContent isMobile={isMobile} setSidebarOpen={setSidebarOpen} storeInfo={storeInfo} onExit={handleExit} onLogout={handleLogout} isPrincipal={isPrincipal} permissions={permissions} />
        </aside>
      )}

      {isMobile && sidebarOpen && (
        <>
          <div onClick={() => setSidebarOpen(false)} className="adm-sidebar-overlay" />
          <aside className="adm-sidebar adm-sidebar--mobile">
            <SidebarContent isMobile={isMobile} setSidebarOpen={setSidebarOpen} storeInfo={storeInfo} onExit={handleExit} onLogout={handleLogout} isPrincipal={isPrincipal} permissions={permissions} />
          </aside>
        </>
      )}

      {/* Main */}
      <div className="adm-main">
        {/* Top bar */}
        <div className={`adm-topbar ${isMobile ? 'adm-topbar--mobile' : ''}`}>
          <div className="adm-topbar-left">
            {isMobile && (
              <button onClick={() => setSidebarOpen(true)} className="adm-hamburger">
                <span className="adm-hamburger-bar" />
                <span className="adm-hamburger-bar" />
                <span className="adm-hamburger-bar" />
              </button>
            )}
            <h1 className={`adm-topbar-title ${isMobile ? 'adm-topbar-title--mobile' : ''}`}>
              {currentId === 'settings' ? 'Configuración' : NAV.find(n => n.id === currentId)?.label}
            </h1>
          </div>
          {!isMobile && (
            <div ref={userMenuRef} className="adm-topbar-user-wrap">
              <button onClick={() => setUserMenuOpen(v => !v)} className="adm-topbar-user">
                <div className="adm-topbar-avatar">
                  <svg className="icon icon-16 icon-stroke-white" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <div>
                  <div className="adm-topbar-user-name">{userName}</div>
                  <div className="adm-topbar-user-email">{userEmail}</div>
                </div>
                <svg className={`icon icon-13 icon-sw-2_5 icon-stroke-muted adm-topbar-user-chevron ${userMenuOpen ? 'adm-topbar-user-chevron--open' : ''}`} viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
              </button>

              {userMenuOpen && (
                <div className="adm-topbar-user-menu">
                  <button onClick={() => { navigate('/admin/configuracion'); setUserMenuOpen(false); }} className="adm-topbar-user-menu-item">
                    <svg className="icon icon-15" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    Configuración
                  </button>
                  <button onClick={handleLogout} className="adm-topbar-user-menu-item adm-topbar-user-menu-item--danger">
                    <svg className="icon icon-15" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className={`adm-content ${isMobile ? 'adm-content--mobile' : ''}`}>
          {!allowedSections.has(currentId) ? (
            <div className="adm-status adm-status--error">No tenés permiso para acceder a esta sección.</div>
          ) : (
            <Outlet context={{ showToast, adminId: userId, isPrincipal, permissions }} />
          )}
        </div>
      </div>

      <Toast message={toastMessage} />
    </div>
  );
}
