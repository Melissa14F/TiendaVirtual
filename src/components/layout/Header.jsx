import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.svg';
import '../../styles/Header.css';

/** Keeps the two-tone logo look (last word in accent color) for any
 * store name, not just the literal "Tech" + "Market" split it replaces. */
// Separa el nombre de la tienda en dos partes para pintar la última palabra con el color de acento.
function BrandName({ name, className }) {
  const words = name.trim().split(' ');
  const last = words.pop();
  const rest = words.join(' ');
  return (
    <span className={className}>
      {rest && `${rest} `}<span className="hdr-brand-accent">{last}</span>
    </span>
  );
}

// Barra superior de la tienda: solo el logo, el buscador y los accesos a
// cuenta/carrito. La navegación por categorías vive en Menu.jsx — se
// separó de este archivo porque son dos responsabilidades distintas
// (identidad/acciones globales vs. navegación).
export default function Header({ info, onHome, isMobile, searchQuery, onSearch, onSearchSubmit, onAccountOpen, menuOpen, onMenuToggle }) {
  const { cartCount, openCart } = useCart();
  const { isLoggedIn } = useAuth();
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false); // barra de búsqueda desplegada (mobile)

  return (
    <header className="hdr-root">
      {isMobile ? (
        /* ─── CABECERA MOBILE ─── */
        <>
          <div className="hdr-mobile-bar">
            {/* Logo */}
            <button onClick={onHome} className="hdr-mobile-logo-btn">
              <div className="hdr-logo-box">
                <img src={logo} alt={info.storeName} className="hdr-logo-img" />
              </div>
              <BrandName name={info.storeName} className="hdr-brand-mobile" />
            </button>

            {/* Ícono de búsqueda */}
            <button onClick={() => setSearchOpen(v => !v)} className="hdr-icon-btn">
              <svg className="icon icon-16 icon-sw-2_5" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>

            {/* Carrito */}
            <button onClick={openCart} className="hdr-icon-btn hdr-icon-btn--cart">
              <svg className="icon icon-18" viewBox="0 0 24 24">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {cartCount > 0 && (
                <span className="hdr-cart-badge">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Botón hamburguesa (abre el menú de navegación, ver Menu.jsx) */}
            <button onClick={onMenuToggle} className={`hdr-hamburger ${menuOpen ? 'hdr-hamburger--open' : ''}`}>
              <span className={`hdr-hamburger-bar ${menuOpen ? 'hdr-hamburger-bar--top-open' : ''}`} />
              <span className={`hdr-hamburger-bar ${menuOpen ? 'hdr-hamburger-bar--mid-open' : ''}`} />
              <span className={`hdr-hamburger-bar ${menuOpen ? 'hdr-hamburger-bar--bot-open' : ''}`} />
            </button>
          </div>

          {/* Barra de búsqueda mobile (solo si se abrió) */}
          {searchOpen && (
            <div className="hdr-mobile-search-wrap">
              <div className="hdr-mobile-search-inner">
                <svg className="hdr-search-icon icon icon-15 icon-sw-2_5" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text" autoFocus placeholder="Buscar productos..."
                  value={searchQuery} onChange={e => onSearch(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { onSearchSubmit(); setSearchOpen(false); } }}
                  className="hdr-mobile-search-input"
                />
              </div>
            </div>
          )}
        </>
      ) : (
        /* ─── CABECERA DESKTOP ─── */
        <div className="hdr-desktop-container">
          <div className="hdr-desktop-row">
            {/* IZQUIERDA — Logo */}
            <button onClick={onHome} className="hdr-desktop-logo-btn">
              <div className="hdr-logo-box hdr-logo-box--lg">
                <img src={logo} alt={info.storeName} className="hdr-logo-img" />
              </div>
              <BrandName name={info.storeName} className="hdr-brand-desktop" />
            </button>

            {/* CENTRO — Buscador */}
            <div className="hdr-search-wrap">
              <svg className="hdr-search-icon hdr-search-icon--desktop icon icon-16 icon-sw-2_5" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Buscar productos, marcas, categorías..."
                value={searchQuery}
                onChange={e => onSearch(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') onSearchSubmit(); }}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className={`hdr-search-input ${searchFocused ? 'hdr-search-input--focused' : ''}`}
              />
            </div>

            {/* DERECHA — Cuenta + Carrito */}
            <div className="hdr-right-actions">
              {/* Always opens the account view (or the login screen when
                  logged out) — signing out lives inside the account page
                  itself, not here, so this never doubles as a logout. */}
              <button onClick={onAccountOpen} className="hdr-account-btn">
                <div className="hdr-account-dot-wrap">
                  <svg className="icon icon-20" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  {isLoggedIn && <div className="hdr-account-online-dot" />}
                </div>
                <span className={`hdr-account-label ${isLoggedIn ? 'hdr-account-label--active' : ''}`}>Mi cuenta</span>
              </button>

              <div className="hdr-divider-v" />

              <button onClick={openCart} className="hdr-account-btn">
                <div className="hdr-account-dot-wrap">
                  <svg className="icon icon-20" viewBox="0 0 24 24">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                  {cartCount > 0 && (
                    <span className="hdr-cart-badge hdr-cart-badge--desktop">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="hdr-account-label">Carrito</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
