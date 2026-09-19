import { useState, useRef, useEffect } from 'react';
import { getCategories } from '../../services/categoriesService';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Menu.css';

// Navegación de la tienda: la barra de categorías (con el mega-menú
// "Catálogo") en desktop, y el panel deslizable de navegación en mobile.
// Separado de Header.jsx porque ahí vive la identidad/acciones globales
// (logo, buscador, cuenta, carrito) y acá la navegación por categorías.
export default function Menu({ info, isMobile, hidden, onHome, onCategorySelect, menuOpen, onMenuClose, onAccountOpen }) {
  const { isLoggedIn, logout } = useAuth();
  const [megaOpen, setMegaOpen] = useState(false); // menú desplegable "Catálogo" (desktop)
  const [categories, setCategories] = useState([]);
  const megaRef = useRef(null);
  const topCats = categories.slice(0, 3); // las primeras 3 categorías se muestran directo en la barra de navegación
  const whatsappUrl = `https://wa.me/${info.whatsapp}`;

  // Carga las categorías activas una sola vez al montar.
  useEffect(() => {
    let cancelled = false;
    getCategories()
      .then(data => { if (!cancelled) setCategories(data.filter(c => c.active)); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Cierra el menú "Catálogo" al hacer clic fuera de él.
  useEffect(() => {
    const handler = (e) => {
      if (megaRef.current && !megaRef.current.contains(e.target)) setMegaOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Cierra el panel mobile si la pantalla pasa a tamaño desktop.
  useEffect(() => {
    if (!isMobile && menuOpen) onMenuClose();
  }, [isMobile]);

  // Bloquea el scroll del body mientras el panel mobile está abierto.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleLogout = () => { logout(); onMenuClose(); };

  if (isMobile) {
    // Panel lateral deslizable (solo si está abierto)
    if (!menuOpen) return null;
    return (
      <>
        <div onClick={onMenuClose} className="hdr-menu-overlay" />
        <div className="hdr-menu-panel">
          {/* Encabezado del menú */}
          <div className="hdr-menu-header">
            <span className="hdr-menu-title">Menú</span>
            <button onClick={onMenuClose} className="hdr-menu-close">✕</button>
          </div>

          {/* Fila de cuenta: login o acceso a "Mi cuenta" + cerrar sesión */}
          <div className={`hdr-menu-account-row ${isLoggedIn ? 'hdr-menu-account-row--logged' : ''}`}>
            {isLoggedIn ? (
              <div className="hdr-menu-account-flex">
                <button onClick={() => { onAccountOpen(); onMenuClose(); }} className="hdr-menu-account-info">
                  <div className="hdr-menu-avatar">
                    <svg className="icon icon-18 icon-stroke-white" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <span className="hdr-menu-account-label">Mi cuenta</span>
                </button>
                <button onClick={handleLogout} className="hdr-menu-logout-link">Cerrar sesión</button>
              </div>
            ) : (
              <button onClick={() => { onAccountOpen(); onMenuClose(); }} className="hdr-menu-login-btn">
                Iniciar sesión
              </button>
            )}
          </div>

          {/* Enlaces de navegación: inicio + las 3 categorías principales */}
          <div className="hdr-menu-nav-group">
            <MobileMenuItem icon="🏠" label="Inicio" onClick={() => { onHome(); onMenuClose(); }} />
            {topCats.map(cat => (
              <MobileMenuItem key={cat.id} icon="›" label={cat.name} onClick={() => { onCategorySelect(cat.name); onMenuClose(); }} />
            ))}
          </div>

          {/* Todas las categorías (catálogo completo) */}
          <div className="hdr-menu-nav-group hdr-menu-nav-group--bordered">
            <div className="hdr-menu-catalog-label">Catálogo</div>
            {categories.map(cat => (
              <MobileMenuItem key={cat.id} icon="" label={cat.name} onClick={() => { onCategorySelect(cat.name); onMenuClose(); }} indent />
            ))}
          </div>

          <div className="hdr-menu-nav-group hdr-menu-nav-group--bordered">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hdr-menu-whatsapp">
              <span className="hdr-menu-emoji">💬</span> WhatsApp
            </a>
          </div>
        </div>
      </>
    );
  }

  if (hidden) return null;

  return (
    /* ─── BARRA DE NAVEGACIÓN DESKTOP ─── */
    <div className="hdr-nav-bar">
      <div className="hdr-nav-inner">
        <nav className="hdr-nav">
          <NavBtn onClick={onHome} icon={
            <svg className="icon icon-13 icon-sw-2_5" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          }>Inicio</NavBtn>

          <div className="hdr-nav-sep" />

          {topCats.map((cat, i) => (
            <span key={cat.id} className="hdr-nav-cat">
              <NavBtn onClick={() => onCategorySelect(cat.name)}>{cat.name}</NavBtn>
              {i < topCats.length - 1 && <div className="hdr-nav-sep" />}
            </span>
          ))}

          <div className="hdr-nav-sep" />

          {/* Menú desplegable "Catálogo" con todas las categorías */}
          <div ref={megaRef} className="hdr-mega-wrap">
            <button onClick={() => setMegaOpen(v => !v)} className={`hdr-mega-trigger ${megaOpen ? 'hdr-mega-trigger--open' : ''}`}>
              <svg className="icon icon-13 icon-sw-2_5" viewBox="0 0 24 24">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
              Catálogo
              <svg className="`hdr-mega-chevron ${megaOpen ? 'hdr-mega-chevron--open' : '' icon icon-12 icon-sw-2_5" viewBox="0 0 24 24">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {megaOpen && (
              <div className="hdr-mega-panel">
                {categories.map(cat => (
                  <button key={cat.id} onClick={() => { onCategorySelect(cat.name); setMegaOpen(false); }} className="hdr-mega-link">{cat.name}</button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Enlaces de la derecha: contacto + WhatsApp */}
        <div className="hdr-right-links">
          <NavBtn onClick={() => document.getElementById('footer-contact')?.scrollIntoView({ behavior: 'smooth' })}>Contáctenos</NavBtn>
          <div className="hdr-nav-sep" />
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hdr-whatsapp-link">
            <svg className="icon-fill icon-14 icon-whatsapp-dark" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.25.625 4.35 1.71 6.136L0 24l5.996-1.674A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.96 0-3.8-.535-5.375-1.462l-.386-.228-3.996 1.115 1.072-3.9-.25-.4A9.945 9.945 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

// Ítem individual del menú lateral mobile.
function MobileMenuItem({ icon, label, onClick, indent }) {
  return (
    <button onClick={onClick} className={`hdr-menu-item ${indent ? 'hdr-menu-item--indent' : ''}`}>
      {icon && <span className="hdr-menu-item-icon">{icon}</span>}
      {label}
    </button>
  );
}

// Botón de navegación del desktop (con ícono opcional).
function NavBtn({ children, onClick, icon }) {
  return (
    <button onClick={onClick} className="hdr-nav-btn">
      {icon}{children}
    </button>
  );
}
