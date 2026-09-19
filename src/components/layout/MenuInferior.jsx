import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import '../../styles/MenuInferior.css';

// Barra de navegación fija abajo de la pantalla, solo en mobile — acceso
// rápido a las secciones más usadas sin tener que abrir el menú
// hamburguesa. La pestaña activa se resalta según la ruta actual.
export default function MenuInferior({ onAccountOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount, openCart } = useCart();

  const items = [
    {
      id: 'inicio', label: 'Inicio', onClick: () => navigate('/'), active: location.pathname === '/',
      icon: <svg className="icon icon-18 icon-sw-2" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    },
    {
      id: 'catalogo', label: 'Catálogo', onClick: () => navigate('/catalogo'), active: location.pathname.startsWith('/catalogo'),
      icon: <svg className="icon icon-18 icon-sw-2" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
    },
    {
      id: 'carrito', label: 'Carrito', onClick: openCart, active: false, badge: cartCount,
      icon: <svg className="icon icon-18 icon-sw-2" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
    },
    {
      id: 'cuenta', label: 'Cuenta', onClick: onAccountOpen, active: location.pathname === '/cuenta',
      icon: <svg className="icon icon-18 icon-sw-2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    },
  ];

  return (
    <nav className="mif-root">
      {items.map(item => (
        <button key={item.id} onClick={item.onClick} className={`mif-item ${item.active ? 'mif-item--active' : ''}`}>
          <span className="mif-icon-wrap">
            {item.icon}
            {item.badge > 0 && <span className="mif-badge">{item.badge}</span>}
          </span>
          {item.label}
        </button>
      ))}
    </nav>
  );
}
