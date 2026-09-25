import { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getProductById, incrementarVisita } from '../services/productsService';
import { placeOrder } from '../services/checkoutService';
import ProductoDetalle from '../components/producto/ProductoDetalle';

// Página de detalle de un producto puntual (ruta /producto/:id). Trae el
// producto fresco desde la API (no reutiliza el objeto que traía la
// tarjeta de la lista, que puede estar desactualizado) y registra la
// visita apenas se abre.
export default function ProductoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId, userRole, userName } = useAuth();
  const { addToCart } = useCart();
  const { isFavorite, onToggleFavorite } = useOutletContext();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProductById(id)
      .then(data => { if (!cancelled) setProduct(data); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    incrementarVisita(id).catch(() => {});
    return () => { cancelled = true; };
  }, [id]);

  const handleAddToCart = (p, qty) => {
    if (userRole !== 'client') { navigate('/login'); return; }
    addToCart(p, qty);
  };

  // Buy-now bypasses the cart entirely — a single-item order for whatever
  // quantity was picked on the product page. Returns the created order so
  // ProductoDetalle can show its confirmation instead of navigating right
  // away; navigation only happens once the client asks for it (onViewOrders).
  const handleBuyNow = async (p, qty, orderDetails) => {
    if (userRole !== 'client') { navigate('/login'); return; }
    return placeOrder({ clienteName: userName, items: [{ ...p, qty }], orderDetails });
  };

  if (loading) return <div className="app-status">Cargando producto…</div>;
  if (error || !product) return <div className="app-status app-status--error">No se pudo cargar el producto.</div>;

  return (
    <ProductoDetalle
      product={product}
      userId={userId}
      onBack={() => navigate(-1)}
      onAddToCart={handleAddToCart}
      onBuyNow={handleBuyNow}
      onViewOrders={() => navigate('/cuenta')}
      isFavorite={isFavorite(product.name)}
      onToggleFavorite={onToggleFavorite}
    />
  );
}
