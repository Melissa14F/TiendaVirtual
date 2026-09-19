import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams, useOutletContext } from 'react-router-dom';
import { useIsMobile } from '../hooks/useBreakpoint';
import { getFeaturedProducts, getBestSellers, getRecommendedProducts } from '../services/productsService';
import Banner from '../components/layout/Banner';
import ProductCard from '../components/layout/Product';
import CatalogoGrid from '../components/producto/CatalogoGrid';
import '../styles/CatalogoPage.css';

/** The home page's "Ver todo" buttons land here with a real sort applied
 * (rating/bestsellers/visitas) instead of a real category — the page
 * title reflects that context instead of just saying "Todos los
 * productos" while quietly showing a different order (see CatalogoGrid). */

// Página raíz de la tienda. En "/" muestra el modo Home (banner +
// secciones destacadas); en "/catalogo" muestra el modo Catálogo (grilla
// con filtros, categoría, búsqueda u orden, según los parámetros de la URL).
export default function CatalogoPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { favorites, isFavorite, onToggleFavorite } = useOutletContext();

  const isHome = location.pathname === '/';

  /**
   * Each banner's real `link` (from MockAPI's boton_link, e.g.
   * "/categoria/laptops", "/promociones/black-friday") is a URL path this
   * app translates into the equivalent in-app route instead of following
   * it literally. Unrecognized patterns fall back to the generic catalog.
   */
  const handleBannerClick = (banner) => {
    const link = banner?.link || '';

    const categoriaMatch = link.match(/^\/categoria\/([\w-]+)/);
    if (categoriaMatch) {
      const categoryName = categoriaMatch[1]
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      navigate(`/catalogo?categoria=${encodeURIComponent(categoryName)}`);
      return;
    }

    if (link.startsWith('/promociones')) {
      navigate('/catalogo?promo=true');
      return;
    }

    navigate('/catalogo');
  };

  if (!isHome) {
    return (
      <CatalogoGrid
        category={searchParams.get('categoria') || (searchParams.get('buscar') ? 'Resultados de búsqueda' : 'Todos los productos')}
        searchQuery={searchParams.get('buscar') || ''}
        initialOnlyPromo={searchParams.get('promo') === 'true'}
        initialSort={searchParams.get('sort') || 'relevance'}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
      />
    );
  }

  return (
    <>
      <Banner onCtaClick={handleBannerClick} />

      <ProductSection title="Productos Destacados" subtitle="Selección especial de nuestros expertos" fetcher={getFeaturedProducts} errorMsg="No se pudieron cargar los productos destacados." onSeeAll={() => navigate('/catalogo?sort=rating')} isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} />
      <ProductSection title="Lo Más Vendido" subtitle="Los favoritos de nuestra comunidad" fetcher={getBestSellers} errorMsg="No se pudo cargar lo más vendido." onSeeAll={() => navigate('/catalogo?sort=bestsellers')} isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} alt />
      <ProductSection title="Recomendados para Ti" subtitle="Basado en tendencias y mejores valoraciones" fetcher={getRecommendedProducts} errorMsg="No se pudieron cargar los recomendados." onSeeAll={() => navigate('/catalogo?sort=visitas')} isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} />

      {/* Franja de confianza */}
      <div className="app-trust-bar">
        <div className="app-trust-inner">
          <TrustItem icon={<svg className="icon icon-22 icon-sw-1_8" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>} title="Envío rápido" desc="Entrega en 24–72 hs a todo el país" />
          <TrustItem icon={<svg className="icon icon-22 icon-sw-1_8" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>} title="Garantía oficial" desc="Todos los productos con garantía de fábrica" />
          <TrustItem icon={<svg className="icon icon-22 icon-sw-1_8" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>} title="Hasta 12 cuotas" desc="Sin interés con tarjetas seleccionadas" />
          <TrustItem icon={<svg className="icon icon-22 icon-sw-1_8" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>} title="Devolución fácil" desc="30 días para cambios sin preguntas" />
        </div>
      </div>
    </>
  );
}

// Sección de productos de la portada (título + "ver todo" + grilla),
// carga su propio listado de forma independiente — así una falla en una
// sección no afecta a las otras dos.
function ProductSection({ title, subtitle, fetcher, errorMsg, onSeeAll, alt, isFavorite, onToggleFavorite }) {
  const isMobile = useIsMobile();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetcher()
      .then(data => { if (!cancelled) setProducts(data); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [fetcher]);

  return (
    <section className={`app-section ${alt ? 'app-section--alt' : ''}`}>
      <div className="app-section-inner">
        <div className="app-section-header">
          <div>
            <h2 className="app-section-title">{title}</h2>
            {!isMobile && <p className="app-section-subtitle">{subtitle}</p>}
          </div>
          <button onClick={onSeeAll} className="app-see-all-btn">Ver todo →</button>
        </div>
        {loading ? <div className="app-status">Cargando productos…</div> :
         error ? <div className="app-status app-status--error">{errorMsg}</div> :
         <div className="app-product-grid">
           {products.map(p => (
             <ProductCard key={p.id} product={p} isFavorite={isFavorite(p.name)} onToggleFavorite={onToggleFavorite} />
           ))}
         </div>}
      </div>
    </section>
  );
}

function TrustItem({ icon, title, desc }) {
  return (
    <div className="app-trust-item">
      <div className="app-trust-icon-box">
        {icon}
      </div>
      <div>
        <div className="app-trust-title">{title}</div>
        <div className="app-trust-desc">{desc}</div>
      </div>
    </div>
  );
}
