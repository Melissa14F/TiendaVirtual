import { apiFetch } from './api';

/** Used only while pageInfo is loading, or if the "informacion" record
 * hasn't been created in MockAPI yet — keeps Header/Footer from showing
 * blank contact info on a first run. */
export const DEFAULT_PAGE_INFO = {
  storeName: 'TechMarket',
  tagline: 'Tu tienda de tecnología de confianza',
  email: 'hola@techmarket.com',
  phone: '+54 11 4567-8900',
  address: 'Av. Tecnología 1234, Piso 3',
  hours: 'Lun–Vie 9:00–18:00 · Sáb 10:00–14:00',
  whatsapp: '1234567890',
  facebook: 'techmarket',
  instagram: 'techmarket.ar',
};

// Convierte la información de la tienda cruda de MockAPI a la forma que
// usa la app (Header, Footer, panel de admin).
function mapPageInfo(i) {
  return {
    id: i.id,
    storeName: i.nombre,
    tagline: i.eslogan,
    email: i.correo,
    phone: i.telefono,
    address: i.direccion,
    hours: i.horario,
    whatsapp: i.whatsapp,
    facebook: i.facebook,
    instagram: i.instagram,
  };
}

// Trae la información de la tienda. Solo existe un único registro; si
// todavía no se creó ninguno, devuelve null (no es un error, es un
// estado válido de "todavía no configurado").
export async function getPageInfo() {
  const raw = await apiFetch('/informacion');
  const [info] = raw; // se queda con el primer (y único) registro
  return info ? mapPageInfo(info) : null;
}

// Crea el registro de información de la tienda (la primera vez que se guarda).
export async function createPageInfo(fields = {}) {
  const raw = await apiFetch('/informacion', {
    method: 'POST',
    body: JSON.stringify({
      nombre: fields.storeName ?? '',
      eslogan: fields.tagline ?? '',
      correo: fields.email ?? '',
      telefono: fields.phone ?? '',
      direccion: fields.address ?? '',
      horario: fields.hours ?? '',
      whatsapp: fields.whatsapp ?? '',
      facebook: fields.facebook ?? '',
      instagram: fields.instagram ?? '',
    }),
  });
  return mapPageInfo(raw);
}

// Actualiza la información de la tienda ya existente (edición parcial).
export async function updatePageInfo(id, fields = {}) {
  const body = {};
  if (fields.storeName !== undefined) body.nombre = fields.storeName;
  if (fields.tagline !== undefined) body.eslogan = fields.tagline;
  if (fields.email !== undefined) body.correo = fields.email;
  if (fields.phone !== undefined) body.telefono = fields.phone;
  if (fields.address !== undefined) body.direccion = fields.address;
  if (fields.hours !== undefined) body.horario = fields.hours;
  if (fields.whatsapp !== undefined) body.whatsapp = fields.whatsapp;
  if (fields.facebook !== undefined) body.facebook = fields.facebook;
  if (fields.instagram !== undefined) body.instagram = fields.instagram;

  const raw = await apiFetch(`/informacion/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return mapPageInfo(raw);
}
