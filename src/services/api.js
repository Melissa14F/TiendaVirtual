// URL base de la API — si no hay variable de entorno configurada, queda vacía
// (las rutas ya empiezan con "/", así que funcionan igual como ruta relativa).
const API_URL = 'https://6aa6bc85d7765db985079180.mockapi.io';

/** Normalized shape for every failure apiFetch can throw. */
// Clase de error personalizada: así cualquier falla de red o de la API (404, 500, etc.)
// llega al resto de la app con la misma forma (status, statusText, url), en vez de
// mezclar errores nativos de fetch con errores de la API.
export class ApiError extends Error {
  constructor(message, { status, statusText, url } = {}) {
    super(message); // arma el mensaje de error normal de JS
    this.name = 'ApiError';
    this.status = status ?? 0; // código HTTP (0 si fue un error de red, sin respuesta)
    this.statusText = statusText ?? '';
    this.url = url;
  }
}

/** Turns { page: 1, categoria: 'Laptops' } into "?page=1&categoria=Laptops", skipping empty values. */
// Convierte un objeto de parámetros en el string de query de una URL.
function buildQueryString(params) {
  if (!params) return ''; // sin parámetros, no hay nada que armar
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue; // ignora valores vacíos
    search.set(key, value);
  }
  const query = search.toString();
  return query ? `?${query}` : ''; // si quedó algo, le agrega el "?" adelante
}

/** Runs the fetch and normalizes both network failures and non-OK responses into ApiError. */
// Función central que hace el fetch real: arma la URL completa, hace la petición,
// y convierte cualquier problema (de red o de respuesta) en un ApiError uniforme.
async function request(path, { params, ...options } = {}) {
  const url = `${API_URL}${path}${buildQueryString(params)}`;
  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers }, // headers por defecto + los que mande el caller
    });
  } catch {
    // fetch tira una excepción cuando ni siquiera pudo conectarse (sin internet, servidor caído, etc.)
    throw new ApiError('No se pudo conectar con el servidor.', { status: 0, url });
  }

  if (!res.ok) {
    // la petición llegó, pero el servidor respondió con un error (4xx/5xx)
    let message = res.statusText || `Error ${res.status}`;
    try {
      const body = await res.clone().json(); // intenta leer un mensaje de error más específico del cuerpo
      message = body?.message ?? message;
    } catch {
      // no JSON body to read a message from — keep the statusText fallback
    }
    throw new ApiError(message, { status: res.status, statusText: res.statusText, url });
  }

  return res; // todo bien, devuelve la respuesta cruda para que el caller la procese
}

/** Bridge for the Claude-built backend: point this at real endpoints once it's live. */
// Función que usa el resto de la app para pedir datos a la API — hace la petición
// y devuelve directamente el JSON ya parseado (o null si la respuesta no tiene contenido).
export async function apiFetch(path, options) {
  const res = await request(path, options);
  return res.status === 204 ? null : res.json(); // 204 = "sin contenido", no hay nada que parsear
}
