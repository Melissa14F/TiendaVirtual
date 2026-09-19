import { useState, useEffect } from 'react';
import { getProducts } from '../../services/productsService';
import ProductCard from '../layout/Product';
import { useIsMobile } from '../../hooks/useBreakpoint';
import '../../styles/CatalogoGrid.css';

const PAGE_SIZE = 6;

// Opciones del selector de orden.
const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevancia' },
  { value: 'price-asc', label: 'Menor precio' },
  { value: 'price-desc', label: 'Mayor precio' },
  { value: 'rating', label: 'Más valorados' },
  { value: 'bestsellers', label: 'Más vendidos' },
  { value: 'visitas', label: 'Más vistos' },
];

/** The home page's "Ver todo" buttons land here with a real sort applied
 * (rating/bestsellers/visitas) instead of a real category — the page
 * title reflects that context instead of just saying "Todos los
 * productos" while quietly showing a different order. */
const SORT_TITLES = { rating: 'Productos Destacados', bestsellers: 'Lo Más Vendido', visitas: 'Recomendados para Ti' };

// Vista de listado de productos: catálogo por categoría, resultados de
// búsqueda, promociones, o "ver todo" de una sección de la portada
// (destacados/más vendidos/recomendados). Incluye filtros, orden y paginación.
export default function CatalogoGrid({ category, searchQuery = '', initialOnlyPromo = false, initialSort = 'relevance', isFavorite, onToggleFavorite }) {
  const [sort, setSort] = useState(initialSort);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [onlyPromo, setOnlyPromo] = useState(initialOnlyPromo);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false); // panel de filtros en mobile
  const [page, setPage] = useState(1);
  const isMobile = useIsMobile();

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // "Todos los productos" (home default), "Resultados de búsqueda" (search
  // mode) and "Promociones" (a banner's /promociones link — there's no real
  // "promociones" category, it's "todos los productos con descuento") aren't
  // real category names — only a genuine category picked from Header/mega-menu
  // should filter by it.
  const categoriaFilter = (category && category !== 'Todos los productos' && category !== 'Resultados de búsqueda' && category !== 'Promociones')
    ? category
    : undefined;

  // Changing the sort dropdown away from rating/bestsellers/visitas moves
  // the title back to the plain category, since it's no longer accurate.
  const displayTitle = SORT_TITLES[sort] ?? category;

  // Brand checklist scoped to the current category — showing every brand in
  // the whole catalog while browsing "Laptops" meant picking "Auriculares
  // brand X" and silently getting zero results. Re-fetched (unfiltered by
  // price/brand/promo, so picking one brand doesn't shrink the list of
  // others) whenever the category itself changes.
  const [allBrands, setAllBrands] = useState([]);
  useEffect(() => {
    let cancelled = false;
    getProducts({ soloDisponible: true, categoria: categoriaFilter }).then(({ data }) => {
      if (!cancelled) setAllBrands([...new Set(data.map(p => p.brand))].sort());
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [categoriaFilter]);

  // A brand selected in one category is almost never valid in another —
  // drop it instead of leaving an invisible filter that zeroes out results.
  // Returns the same array reference when already empty, so React bails
  // out instead of triggering an extra products re-fetch for nothing.
  useEffect(() => { setSelectedBrands(prev => prev.length === 0 ? prev : []); }, [categoriaFilter]);

  // Any filter/sort/search/category change starts back at page 1.
  useEffect(() => { setPage(1); }, [category, searchQuery, priceMin, priceMax, selectedBrands, onlyPromo, sort]);

  // Trae los productos según página, categoría, filtros, orden y búsqueda actuales.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProducts({
      page,
      limit: PAGE_SIZE,
      categoria: categoriaFilter,
      marca: selectedBrands,
      precioMin: priceMin,
      precioMax: priceMax,
      soloDescuento: onlyPromo,
      soloDisponible: true,
      sort,
      search: searchQuery,
    })
      .then(result => {
        if (cancelled) return;
        setProducts(result.data);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, categoriaFilter, searchQuery, priceMin, priceMax, selectedBrands, onlyPromo, sort]);

  // Agrega o quita una marca de la lista de marcas seleccionadas.
  const toggleBrand = (brand) =>
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);

  const activeFilterCount = (priceMin ? 1 : 0) + (priceMax ? 1 : 0) + selectedBrands.length + (onlyPromo ? 1 : 0);

  // Renderiza la grilla de resultados (o el estado de carga/error/vacío) + la paginación.
  const renderResults = (gridClassName) => {
    if (loading) return <div className="cv-status">Cargando productos…</div>;
    if (error) return <div className="cv-status cv-status--error">No se pudieron cargar los productos.</div>;
    if (products.length === 0) return <EmptyState />;
    return (
      <>
        <div className={gridClassName}>
          {products.map(p => (
            <ProductCard key={p.id} product={p}
              isFavorite={isFavorite?.(p.name)} onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
        {totalPages > 1 && (
          <div className="cv-pagination">
            <button onClick={() => setPage(p => p - 1)} disabled={page <= 1} className="cv-page-btn">‹ Anterior</button>
            <span className="cv-page-info">Página {page} de {totalPages}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages} className="cv-page-btn">Siguiente ›</button>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="cv-container">
      {/* Mobile: barra superior con botón de filtros y orden */}
      {isMobile && (
        <div className="cv-mobile-topbar">
          <div>
            <h2 className="cv-mobile-title">{displayTitle}</h2>
            <p className="cv-mobile-count">{total} productos</p>
          </div>
          <div className="cv-mobile-actions">
            <button onClick={() => setFilterDrawerOpen(true)} className={`cv-filter-btn ${activeFilterCount > 0 ? 'cv-filter-btn--active' : ''}`}>
              <svg className="icon icon-14 icon-sw-2_5" viewBox="0 0 24 24">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              Filtros{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </button>
            <select value={sort} onChange={e => setSort(e.target.value)} className="cv-sort-select">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Panel de filtros deslizable en mobile */}
      {isMobile && filterDrawerOpen && (
        <>
          <div onClick={() => setFilterDrawerOpen(false)} className="cv-drawer-overlay" />
          <div className="cv-drawer-panel">
            <div className="cv-drawer-handle" />
            <FiltersContent
              priceMin={priceMin} setPriceMin={setPriceMin}
              priceMax={priceMax} setPriceMax={setPriceMax}
              allBrands={allBrands} selectedBrands={selectedBrands} toggleBrand={toggleBrand}
              onlyPromo={onlyPromo} setOnlyPromo={setOnlyPromo}
              onClear={() => { setPriceMin(''); setPriceMax(''); setSelectedBrands([]); setOnlyPromo(false); }}
            />
            <button onClick={() => setFilterDrawerOpen(false)} className="cv-drawer-cta">
              Ver {total} resultados
            </button>
          </div>
        </>
      )}

      {isMobile ? (
        /* Mobile: solo la grilla a todo el ancho */
        renderResults('cv-grid--mobile')
      ) : (
        /* Desktop: barra lateral de filtros + grilla */
        <div className="cv-desktop-grid">
          <aside className="cv-sidebar">
            <FiltersContent
              priceMin={priceMin} setPriceMin={setPriceMin}
              priceMax={priceMax} setPriceMax={setPriceMax}
              allBrands={allBrands} selectedBrands={selectedBrands} toggleBrand={toggleBrand}
              onlyPromo={onlyPromo} setOnlyPromo={setOnlyPromo}
              onClear={() => { setPriceMin(''); setPriceMax(''); setSelectedBrands([]); setOnlyPromo(false); }}
            />
          </aside>

          <main>
            <div className="cv-main-header">
              <div>
                <h2 className="cv-main-title">{displayTitle}</h2>
                <p className="cv-main-count">{total} productos</p>
              </div>
              <select value={sort} onChange={e => setSort(e.target.value)} className="cv-sort-select cv-sort-select--desktop">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {renderResults('cv-grid--desktop')}
          </main>
        </div>
      )}
    </div>
  );
}

/**
 * Top-level, not defined inside CategoryView — a component declared
 * inside another component's body gets a new identity every render, so
 * React remounts its DOM (losing input focus) on every keystroke that
 * updates the parent's state. That's what made the price inputs only
 * accept one character at a time before this was pulled out.
 */
// Contenido del panel de filtros (precio, marca, ofertas), compartido entre el drawer mobile y la barra lateral de escritorio.
function FiltersContent({ priceMin, setPriceMin, priceMax, setPriceMax, allBrands, selectedBrands, toggleBrand, onlyPromo, setOnlyPromo, onClear }) {
  return (
    <>
      <div className="cv-filters-header">
        <span className="cv-filters-title">Filtros</span>
        <button onClick={onClear} className="cv-clear-btn">
          Limpiar
        </button>
      </div>

      <FilterSection title="Precio">
        <div className="cv-price-row">
          <input type="number" placeholder="Mín" value={priceMin} onChange={e => setPriceMin(e.target.value)} className="cv-price-input" />
          <span className="cv-price-sep">—</span>
          <input type="number" placeholder="Máx" value={priceMax} onChange={e => setPriceMax(e.target.value)} className="cv-price-input" />
        </div>
      </FilterSection>

      <FilterSection title="Marca">
        <div className="cv-brand-list">
          {allBrands.map(brand => (
            <label key={brand} className="cv-checkbox-label">
              <input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => toggleBrand(brand)} className="cv-checkbox" />
              {brand}
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Ofertas">
        <label className="cv-checkbox-label">
          <input type="checkbox" checked={onlyPromo} onChange={e => setOnlyPromo(e.target.checked)} className="cv-checkbox" />
          Solo con descuento
        </label>
      </FilterSection>
    </>
  );
}

// Estado vacío cuando ningún producto cumple los filtros aplicados.
function EmptyState() {
  return (
    <div className="cv-empty">
      <div className="cv-empty-icon-box">
        <svg className="icon icon-26 icon-sw-1_8 icon-stroke-border" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </div>
      <div className="cv-empty-title">Sin resultados</div>
      <div className="cv-empty-sub">Prueba ajustando los filtros</div>
    </div>
  );
}

// Sección genérica del panel de filtros (título + contenido).
function FilterSection({ title, children }) {
  return (
    <div className="cv-filter-section">
      <div className="cv-filter-section-title">{title}</div>
      {children}
    </div>
  );
}
