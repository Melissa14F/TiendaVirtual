import { useNavigate } from 'react-router-dom';
import '../../styles/Product.css';

// Relaciona cada tipo de etiqueta de producto con su clase CSS de color.
const BADGE_CLASS = {
  'Nuevo': 'pc-badge--nuevo',
  'Gaming': 'pc-badge--gaming',
  'Oferta': 'pc-badge--oferta',
};

// Tarjeta de producto: se usa en la grilla de catálogo, favoritos y
// secciones de la portada. Al hacer clic navega al detalle del producto.
export default function ProductCard({ product, isFavorite, onToggleFavorite }) {
  const navigate = useNavigate();
  // Calcula el % de descuento a partir del precio original vs. el actual.
  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  return (
    <div onClick={() => navigate(`/producto/${product.id}`)} className="pc-card">
      {/* Imagen del producto, con la etiqueta, el badge de descuento y el aviso de "sin stock" superpuestos */}
      <div className="pc-image-wrap">
        <img src={product.image} alt={product.name} className="pc-image" />
        {product.badge && (
          <span className={`pc-badge ${BADGE_CLASS[product.badge.label] ?? 'pc-badge--default'}`}>
            {product.badge.label}
          </span>
        )}
        {discount > 0 && (
          <span className="pc-discount-badge">
            -{discount}%
          </span>
        )}
        {product.stock === 'out' && (
          <div className="pc-out-overlay">
            <span className="pc-out-label">Sin stock</span>
          </div>
        )}
      </div>

      {/* Datos del producto: marca + corazón de favorito, nombre, estrellas y precio */}
      <div className="pc-body">
        <div className="pc-brand-row">
          <div className="pc-brand">{product.brand}</div>
          {onToggleFavorite && (
            <button
              onClick={e => { e.stopPropagation(); onToggleFavorite(product); }} // evita que el clic también dispare onView (abrir el detalle)
              title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              className="pc-favorite-btn"
            >
              <svg className={`icon icon-15 icon-sw-2_5 ${isFavorite ? 'pc-favorite-icon--active' : ''}`} viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          )}
        </div>
        <div className="pc-name">{product.name}</div>

        <Stars rating={product.rating} reviews={product.reviews} />

        <div className="pc-spacer" /> {/* empuja el precio hacia abajo, así todas las tarjetas quedan parejas */}

        <div className="pc-price-row">
          <span className="pc-price">
            ${product.price.toLocaleString()}
          </span>
          {product.originalPrice && (
            <span className="pc-price-original">
              ${product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Fila de estrellas de calificación (dibuja 5, rellenas hasta el
// promedio redondeado) + cantidad de reseñas entre paréntesis.
function Stars({ rating, reviews }) {
  return (
    <div className="pc-stars-row">
      <div className="pc-stars-icons">
        {[1,2,3,4,5].map(i => (
          <svg key={i} className={`icon-fill icon-12 ${i <= Math.round(rating) ? 'icon-star-filled' : 'icon-star-empty'}`} viewBox="0 0 24 24">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        ))}
      </div>
      <span className="pc-stars-count">({reviews})</span>
    </div>
  );
}
