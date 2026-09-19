import { useState, useEffect } from 'react';
import { getBanners } from '../../services/bannerService';
import { useIsMobile } from '../../hooks/useBreakpoint';
import '../../styles/Banner.css';

// Carrusel de banners de la portada. Carga los banners activos, los va
// rotando solo cada 5 segundos, y al hacer clic en el botón avisa al
// componente padre (App.jsx) para que decida a dónde navegar.
export default function Banner({ onCtaClick }) {
  const [current, setCurrent] = useState(0); // índice del banner que se está mostrando
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMobile = useIsMobile();

  // Carga los banners una sola vez, al montar el componente.
  useEffect(() => {
    let cancelled = false;
    getBanners()
      .then(data => { if (!cancelled) setBanners(data); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Rotación automática: cada 5 segundos pasa al siguiente banner.
  useEffect(() => {
    if (banners.length === 0) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % banners.length), 5000);
    return () => clearInterval(t); // limpia el temporizador al desmontar o si cambia la cantidad de banners
  }, [banners.length]);

  const b = banners[current]; // banner actualmente visible

  return (
    <div className="hero-root">
      {loading && <div className="hero-status">Cargando banners…</div>}
      {!loading && error && <div className="hero-status hero-status--error">No se pudieron cargar los banners.</div>}

      {!loading && !error && b && (
        <>
          {/* Todas las imágenes de fondo se renderizan siempre; solo la
              del banner actual queda visible (vía la clase --active),
              para poder animar la transición entre una y otra. */}
          {banners.map((banner, i) => (
            <div key={banner.id} className={`hero-slide ${i === current ? 'hero-slide--active' : ''}`}>
              <img src={banner.image} alt={banner.title} className="hero-slide-img" />
              <div className="hero-slide-overlay" />
            </div>
          ))}

          {/* Texto y botón del banner actual */}
          <div className="hero-content">
            <div className="hero-inner">
              <div className="hero-badge">
                Oferta destacada
              </div>
              <h1 className="hero-title">
                {b.title}
              </h1>
              {!isMobile && (
                <p className="hero-subtitle">
                  {b.subtitle}
                </p>
              )}
              <button onClick={() => onCtaClick(b)} className="hero-cta-btn">
                {b.cta} →
              </button>
            </div>
          </div>

          {/* Flechas para pasar de banner manualmente — ocultas en mobile */}
          {!isMobile && (
            <>
              <button onClick={() => setCurrent(c => (c - 1 + banners.length) % banners.length)} className="hero-arrow hero-arrow--left">‹</button>
              <button onClick={() => setCurrent(c => (c + 1) % banners.length)} className="hero-arrow hero-arrow--right">›</button>
            </>
          )}

          {/* Puntitos indicadores, uno por banner — clic para ir directo a ese banner */}
          <div className="hero-dots">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} className={`hero-dot ${i === current ? 'hero-dot--active' : ''}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
