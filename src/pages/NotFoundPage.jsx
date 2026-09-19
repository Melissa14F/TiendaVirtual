import { Link } from 'react-router-dom';
import '../styles/NotFoundPage.css';

// Página de error 404: se muestra para cualquier ruta que no coincide
// con ninguna de las definidas en App.jsx.
export default function NotFoundPage() {
  return (
    <div className="nf-root">
      <span className="nf-code">404</span>
      <h1 className="nf-title">Página no encontrada</h1>
      <p className="nf-desc">La página que buscás no existe o fue movida.</p>
      <Link to="/" className="nf-link">Volver al inicio</Link>
    </div>
  );
}
