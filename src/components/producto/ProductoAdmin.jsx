import { useState } from 'react';
import { createProduct, updateProduct, deleteProduct } from '../../services/productsService';
import { SectionHeader, AddBtn, IconBtn, Th, Td, FormField, Modal, SaveBtn, ConfirmModal } from '../admin/shared';

const STOCK_LABEL = { available: 'Disponible', low: 'Stock bajo', out: 'Sin stock' };

function StockBadge({ stock }) {
  return <span className={`adm-stock-badge adm-stock-badge--${stock}`}>{STOCK_LABEL[stock]}</span>;
}

/** Mirrors productsService's stockLevel() threshold, only for the live
 * preview shown next to the quantity input — the real status is always
 * derived server-side (from the same real `stock` number) on reload. */
function previewStockStatus(qty) {
  const n = Number(qty);
  if (n <= 0) return 'out';
  if (n <= 5) return 'low';
  return 'available';
}

/**
 * "Precio" is the only field shown by default — "Precio anterior" only
 * appears once the admin flags the product as discounted, and shows a
 * live preview matching exactly how ProductCard renders it on the
 * storefront (crossed-out original + current price + "-X%" badge),
 * instead of just two bare number inputs.
 */
function PriceFields({ price, originalPrice, onChangePrice, onChangeOriginalPrice, onToggleDiscount }) {
  const hasDiscount = originalPrice !== undefined && originalPrice !== '';
  const discountPct = hasDiscount && Number(originalPrice) > Number(price)
    ? Math.round((1 - Number(price) / Number(originalPrice)) * 100)
    : null;

  return (
    <>
      <FormField label="Precio ($)" type="number" value={price} onChange={onChangePrice} />

      <label className="adm-checkbox-label adm-discount-toggle">
        <input type="checkbox" checked={hasDiscount} onChange={e => onToggleDiscount(e.target.checked)} className="adm-checkbox" />
        Este producto tiene descuento
      </label>

      {hasDiscount && (
        <>
          <FormField label="Precio anterior ($)" type="number" value={originalPrice} onChange={onChangeOriginalPrice} placeholder="Precio antes del descuento" />
          {discountPct !== null ? (
            <div className="adm-price-preview">
              <span className="adm-price-preview-original">${Number(originalPrice).toLocaleString()}</span>
              <span className="adm-price-preview-current">${Number(price || 0).toLocaleString()}</span>
              <span className="adm-price-preview-badge">-{discountPct}%</span>
            </div>
          ) : (
            <p className="adm-form-hint">El precio anterior debe ser mayor al precio actual para mostrar el descuento.</p>
          )}
        </>
      )}
    </>
  );
}

export default function ProductoAdmin({ products, setProducts, categories, showToast }) {
  const [editItem, setEditItem] = useState(null);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [blank] = useState({ name: '', description: '', brand: '', category: '', price: 0, image: '', stockQty: 0 });
  const [draft, setDraft] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const activeCategories = categories.filter(c => c.active);

  const openAdd = () => {
    setDraft({ ...blank, category: activeCategories[0]?.name ?? '' });
    setAdding(true);
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const del = async (id, name) => {
    setDeleting(true);
    try {
      await deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
      setDeleteTarget(null);
      showToast(`Producto "${name}" eliminado`);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  /** originalPrice being set at all means the admin flagged "tiene
   * descuento" — if it isn't actually higher than price, that's a data
   * entry mistake, not a valid discount, so it's rejected here rather
   * than silently saved as a discount that never shows on the storefront. */
  const validatePrices = (item) => {
    if (item.originalPrice !== undefined && Number(item.originalPrice) <= Number(item.price)) {
      return 'El precio anterior debe ser mayor al precio actual.';
    }
    return null;
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editItem) return;
    const validationError = validatePrices(editItem);
    if (validationError) { setFormError(validationError); return; }
    setSaving(true);
    setFormError('');
    try {
      const result = await updateProduct(editItem.id, editItem);
      setProducts(products.map(p => p.id === editItem.id ? result : p));
      setEditItem(null);
      showToast(`Producto "${result.name}" actualizado`);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const saveAdd = async (e) => {
    e.preventDefault();
    const validationError = validatePrices(draft);
    if (validationError) { setFormError(validationError); return; }
    setSaving(true);
    setFormError('');
    try {
      const result = await createProduct(draft);
      setProducts([...products, result]);
      setAdding(false);
      setDraft(blank);
      showToast(`Producto "${result.name}" creado`);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <SectionHeader title={`Productos (${products.length})`} action={<AddBtn onClick={openAdd} label="Nuevo producto" />} />

      {/* Search */}
      <div className="adm-search-wrap">
        <svg className="adm-search-icon icon icon-14 icon-sw-2_5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar productos..." className="adm-search-input" />
      </div>

      <div className="adm-panel">
        <table className="adm-table">
          <thead><tr><Th>Producto</Th><Th>Categoría</Th><Th>Precio</Th><Th>Stock</Th><Th>Acciones</Th></tr></thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id} className={i > 0 ? 'adm-td-row' : ''}>
                <Td>
                  <div className="adm-cell-thumb-row">
                    <img src={p.image} alt={p.name} className="adm-cell-thumb" />
                    <div>
                      <div className="adm-cell-name">{p.name}</div>
                      <div className="adm-cell-brand">{p.brand}</div>
                    </div>
                  </div>
                </Td>
                <Td className="adm-text-muted">{p.category}</Td>
                <Td><span className="adm-price-main">${p.price.toLocaleString()}</span>{p.originalPrice && <span className="adm-price-original">${p.originalPrice.toLocaleString()}</span>}</Td>
                <Td>
                  <div className="adm-stock-cell">
                    <span className="adm-stock-qty">{p.stockQty} u.</span>
                    <StockBadge stock={p.stock} />
                  </div>
                </Td>
                <Td>
                  <div className="adm-actions-row">
                    <IconBtn onClick={() => setEditItem({ ...p })} title="Editar">
                      <svg className="icon icon-15" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </IconBtn>
                    <IconBtn onClick={() => setDeleteTarget(p)} danger title="Eliminar">
                      <svg className="icon icon-15" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </IconBtn>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit modal */}
      {editItem && (
        <Modal title="Editar producto" onClose={() => setEditItem(null)}>
          <form onSubmit={saveEdit}>
            <FormField label="Nombre" value={editItem.name} onChange={v => setEditItem({ ...editItem, name: v })} />
            <FormField label="Descripción" value={editItem.description ?? ''} onChange={v => setEditItem({ ...editItem, description: v })} />
            <FormField label="Marca" value={editItem.brand} onChange={v => setEditItem({ ...editItem, brand: v })} />
            <div className="adm-form-field">
              <label className="adm-form-label">Categoría</label>
              <select value={editItem.category} onChange={e => setEditItem({ ...editItem, category: e.target.value })} className="adm-form-input">
                {!activeCategories.some(c => c.name === editItem.category) && (
                  <option value={editItem.category}>{editItem.category}</option>
                )}
                {activeCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <PriceFields
              price={editItem.price}
              originalPrice={editItem.originalPrice}
              onChangePrice={v => setEditItem({ ...editItem, price: Number(v) })}
              onChangeOriginalPrice={v => setEditItem({ ...editItem, originalPrice: v ? Number(v) : undefined })}
              onToggleDiscount={checked => setEditItem({ ...editItem, originalPrice: checked ? Math.round(editItem.price * 1.2) : undefined })}
            />
            <FormField label="URL de imagen" value={editItem.image} onChange={v => setEditItem({ ...editItem, image: v })} />
            <div className="adm-form-field">
              <label className="adm-form-label">Stock (unidades)</label>
              <div className="adm-stock-input-row">
                <input type="number" min="0" value={editItem.stockQty} onChange={e => setEditItem({ ...editItem, stockQty: e.target.value })} className="adm-form-input" />
                <StockBadge stock={previewStockStatus(editItem.stockQty)} />
              </div>
            </div>
            {formError && <p className="adm-form-error">{formError}</p>}
            <div className="adm-form-actions">
              <button type="button" onClick={() => setEditItem(null)} className="adm-btn-secondary">Cancelar</button>
              <SaveBtn disabled={saving} label={saving ? 'Guardando…' : 'Guardar cambios'} />
            </div>
          </form>
        </Modal>
      )}

      {/* Add modal */}
      {adding && (
        <Modal title="Nuevo producto" onClose={() => setAdding(false)}>
          <form onSubmit={saveAdd}>
            <FormField label="Nombre" value={draft.name} onChange={v => setDraft({ ...draft, name: v })} />
            <FormField label="Descripción" value={draft.description ?? ''} onChange={v => setDraft({ ...draft, description: v })} />
            <FormField label="Marca" value={draft.brand} onChange={v => setDraft({ ...draft, brand: v })} />
            <div className="adm-form-field">
              <label className="adm-form-label">Categoría</label>
              <select value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value })} className="adm-form-input">
                {activeCategories.length === 0 && <option value="">No hay categorías creadas todavía</option>}
                {activeCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <PriceFields
              price={draft.price}
              originalPrice={draft.originalPrice}
              onChangePrice={v => setDraft({ ...draft, price: Number(v) })}
              onChangeOriginalPrice={v => setDraft({ ...draft, originalPrice: v ? Number(v) : undefined })}
              onToggleDiscount={checked => setDraft({ ...draft, originalPrice: checked ? Math.round((draft.price || 0) * 1.2) : undefined })}
            />
            <FormField label="URL de imagen" value={draft.image} onChange={v => setDraft({ ...draft, image: v })} />
            <div className="adm-form-field">
              <label className="adm-form-label">Stock (unidades)</label>
              <div className="adm-stock-input-row">
                <input type="number" min="0" value={draft.stockQty} onChange={e => setDraft({ ...draft, stockQty: e.target.value })} className="adm-form-input" />
                <StockBadge stock={previewStockStatus(draft.stockQty)} />
              </div>
            </div>
            {formError && <p className="adm-form-error">{formError}</p>}
            <div className="adm-form-actions">
              <button type="button" onClick={() => setAdding(false)} className="adm-btn-secondary">Cancelar</button>
              <SaveBtn disabled={saving} label={saving ? 'Creando…' : 'Crear producto'} />
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Eliminar producto"
          message={`¿Seguro que querés eliminar "${deleteTarget.name}"? Esta acción no se puede deshacer.`}
          confirming={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => del(deleteTarget.id, deleteTarget.name)}
        />
      )}
    </div>
  );
}
