import { apiFetch, ApiError } from './api';

// Formatea una fecha ISO como "19 Sep 2026" (para mostrarla en "Mis pedidos").
const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS_ES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/**
 * MockAPI's estado_orden has 10 distinct real values. `order.status`
 * carries that real value as-is (so any change the admin makes is always
 * visible to the client, not silently absorbed into a coarser bucket) —
 * this bucket is only for picking an icon/color grouping in the UI.
 */
// Agrupa los 10 estados reales en 4 categorías, solo para elegir
// ícono/color en la vista del cliente (el texto real del estado se
// muestra siempre tal cual, esto no lo reemplaza).
const STATUS_BUCKET = {
  'Entregado': 'entregado',
  'Enviado': 'enviado',
  'En camino': 'enviado',
  'Cancelado': 'cancelado',
  'Devuelto': 'cancelado',
  'Reembolsado': 'cancelado',
  'Pendiente': 'procesando',
  'Confirmado': 'procesando',
  'En preparación': 'procesando',
  'En espera de pago': 'procesando',
};

// Devuelve el grupo correspondiente a un estado real.
export function statusBucket(estado) {
  return STATUS_BUCKET[estado] ?? 'procesando';
}

// El número de seguimiento solo se muestra una vez que el pedido
// realmente se despachó (aunque los datos de prueba lo traigan cargado
// desde el principio, sin importar el estado).
const SHIPPED_STATUSES = new Set(['Enviado', 'En camino', 'Entregado', 'Devuelto', 'Reembolsado']);

// Trae los pedidos de un cliente puntual, filtrando por su nombre.
async function fetchClienteOrdenes(clienteName) {
  try {
    return await apiFetch('/orden', { params: { cliente: clienteName } });
  } catch (err) {
    // MockAPI devuelve 404 cuando el filtro no encuentra nada — se trata como "sin pedidos".
    if (err instanceof ApiError && err.status === 404) return [];
    throw err;
  }
}

/**
 * detalle_orden.orden is NOT orden.id — it's the tracking code
 * (numero_seguimiento, e.g. "TRK-100001"). That's the real join key.
 */
// Convierte un pedido crudo de MockAPI (+ sus líneas de detalle y los
// productos) a la forma que usa la vista "Mis pedidos" del cliente.
function mapOrder(o, detallesByTracking, productsByName) {
  const items = (detallesByTracking[o.numero_seguimiento] ?? []).map((d) => {
    const product = productsByName[d.producto];
    return {
      // queda undefined si el producto fue renombrado/borrado después —
      // "Volver a comprar" salta esos ítems porque no puede reencontrarlos.
      id: product?.id,
      // id real de la línea de detalle — es lo que se usa para calificarla.
      detalleId: d.id,
      name: d.producto,
      brand: product?.marca ?? '',
      qty: d.cantidad,
      price: d.precio_unitario,
      image: product?.imagen ?? '',
      rating: d.calificacion ?? null,
    };
  });

  return {
    id: `#ORD-${o.id}`,
    rawId: o.id,
    date: formatDate(o.fecha),
    status: o.estado_orden,
    total: o.total,
    items,
    tracking: SHIPPED_STATUSES.has(o.estado_orden) ? o.numero_seguimiento : '',
    address: o.direccion_envio,
    postalCode: o.codigo_postal,
    payment: o.metodo_pago,
  };
}

// Califica (1 a 5 estrellas) un producto puntual dentro de un pedido ya
// entregado. Solo debería ofrecerse esta opción cuando el pedido está "Entregado".
export async function rateOrderItem(detalleId, calificacion) {
  return apiFetch(`/detalle_orden/${detalleId}`, {
    method: 'PUT',
    body: JSON.stringify({ calificacion }),
  });
}

// Cancela un pedido (cambia su estado a "Cancelado").
export async function cancelOrder(id) {
  return apiFetch(`/orden/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ estado_orden: 'Cancelado' }),
  });
}

// Crea un pedido nuevo junto con sus líneas de detalle (un producto = una
// línea). El "número de seguimiento" se genera acá y se usa para
// relacionar ambos (el pedido y sus líneas), siempre arranca en estado "Pendiente".
export async function createOrder({ clienteName, items, address, postalCode, paymentMethod = 'Tarjeta de crédito', discountAmount = 0, shippingAmount = 0 }) {
  // Calcula el total sumando cada producto (precio x cantidad), restando el
  // descuento y sumando el envío — antes el envío se mostraba en el resumen
  // de "Mi carrito" pero nunca quedaba reflejado en el pedido guardado.
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = Math.max(0, Math.round(subtotal - discountAmount + shippingAmount));
  const trackingCode = `TRK-${Date.now()}`; // número de seguimiento único, basado en la hora actual

  // Crea el pedido principal.
  const order = await apiFetch('/orden', {
    method: 'POST',
    body: JSON.stringify({
      cliente: clienteName,
      fecha: new Date().toISOString(),
      metodo_pago: paymentMethod,
      total,
      descuento: discountAmount,
      costo_envio: shippingAmount,
      direccion_envio: address ?? '',
      codigo_postal: postalCode ?? '',
      estado_orden: 'Pendiente', // todo pedido nuevo arranca así
      numero_seguimiento: trackingCode,
    }),
  });

  // Crea una línea de detalle por cada producto del carrito, todas en paralelo.
  await Promise.all(items.map((item) => apiFetch('/detalle_orden', {
    method: 'POST',
    body: JSON.stringify({
      orden: trackingCode,
      producto: item.name,
      cantidad: item.qty,
      precio_unitario: item.price,
      subtotal: item.price * item.qty,
    }),
  })));

  // Se devuelve para que quien llamó pueda mostrar una confirmación
  // (número de pedido / de seguimiento) sin tener que volver a pedirlo.
  return { id: `#ORD-${order.id}`, trackingCode, total };
}

// Trae los pedidos de un cliente, con todo el detalle, ordenados del más
// reciente al más viejo — es lo que muestra "Mis pedidos".
export async function getOrders(clienteName) {
  const [ordenes, detalles, productos] = await Promise.all([
    fetchClienteOrdenes(clienteName),
    apiFetch('/detalle_orden'),
    apiFetch('/producto'),
  ]);

  // Agrupa las líneas de detalle por número de seguimiento.
  const detallesByTracking = {};
  for (const d of detalles) {
    (detallesByTracking[d.orden] ??= []).push(d);
  }

  // Arma un diccionario de productos por nombre.
  const productsByName = {};
  for (const p of productos) productsByName[p.nombre] = p;

  return ordenes
    .slice()
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)) // más recientes primero
    .map((o) => mapOrder(o, detallesByTracking, productsByName));
}
