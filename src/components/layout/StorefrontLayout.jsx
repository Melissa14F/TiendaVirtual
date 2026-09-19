import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../hooks/useFavorites';
import { useIsMobile } from '../../hooks/useBreakpoint';
import { getPageInfo, DEFAULT_PAGE_INFO } from '../../services/pageInfoService';
import Header from './Header';
import Menu from './Menu';
import MenuInferior from './MenuInferior';
import Footer from './Footer';
import Carrito from './Carrito';
import '../../styles/StorefrontLayout.css';

/**
 * Shared chrome for every storefront route (Catálogo, Producto, Cuenta):
 * Header + Menu + the cart drawer + Footer + the mobile bottom nav. Not
 * used by /admin (its own AdminShell) or /login (its own full-page
 * layout) — those aren't "the storefront", they don't need this chrome.
 *
 * Owns the state genuinely shared across storefront pages (search text,
 * the mobile menu, favorites) and exposes it to child pages via the
 * router's outlet context instead of prop-drilling through every route.
 */
export default function StorefrontLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { userRole, userName, isLoggedIn, logout } = useAuth();
  const clienteName = userRole === 'client' ? userName : null;
  const { favorites, isFavorite, toggleFavorite } = useFavorites(clienteName);

  const [storeInfo, setStoreInfo] = useState(DEFAULT_PAGE_INFO);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  // Se re-ejecuta cada vez que se vuelve a montar este layout (por
  // ejemplo, al salir del panel admin y volver a la tienda), así que la
  // info de la tienda siempre está al día sin necesitar un refresco manual.
  useEffect(() => {
    let cancelled = false;
    getPageInfo().then(data => { if (!cancelled && data) setStoreInfo(data); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Cierra el menú mobile cada vez que cambia de página.
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleAccountOpen = () => {
    if (userRole === 'admin') navigate('/admin');
    else if (userRole === 'client') navigate('/cuenta');
    else navigate('/login');
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const handleCategorySelect = (categoria) => navigate(`/catalogo?categoria=${encodeURIComponent(categoria)}`);

  const handleSearchSubmit = () => navigate(`/catalogo?buscar=${encodeURIComponent(searchQuery)}`);

  const handleToggleFavorite = (product) => toggleFavorite(product);

  // The heart button itself is hidden for guests and admins, not just
  // gated on click — pages only render it when this is truthy, so
  // passing `undefined` here (instead of always passing a handler) is
  // what makes ProductCard hide the button entirely.
  const favoriteHandler = clienteName ? handleToggleFavorite : undefined;

  // "Mi cuenta" no muestra la barra de categorías — es una página
  // distinta, no un lugar desde el que seguir navegando el catálogo.
  const hideNav = location.pathname.startsWith('/cuenta');

  return (
    <div className="sfl-root">
      <Header
        info={storeInfo}
        isMobile={isMobile}
        onHome={() => navigate('/')}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        onAccountOpen={handleAccountOpen}
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen(v => !v)}
      />
      <Menu
        info={storeInfo}
        isMobile={isMobile}
        hidden={hideNav}
        onHome={() => navigate('/')}
        onCategorySelect={handleCategorySelect}
        menuOpen={menuOpen}
        onMenuClose={() => setMenuOpen(false)}
        onAccountOpen={handleAccountOpen}
      />

      <main className={`sfl-main ${isMobile ? 'sfl-main--mobile' : ''}`}>
        <Outlet context={{ storeInfo, favorites, isFavorite, onToggleFavorite: favoriteHandler, isLoggedIn, onLogout: handleLogout }} />
      </main>

      <Footer info={storeInfo} />
      <Carrito />
      {isMobile && <MenuInferior onAccountOpen={handleAccountOpen} />}
    </div>
  );
}
