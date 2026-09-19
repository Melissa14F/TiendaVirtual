import { useState, useRef, useEffect } from 'react';
import { createBanner, updateBanner, deleteBanner } from '../../services/bannerService';
import { SectionHeader, AddBtn, IconBtn, FormField, Modal, SaveBtn, ConfirmModal } from '../admin/shared';

/** Applies a free-form accent color (picked via a color input, so it has
 * no fixed set of values) through the CSS custom property App.css reads,
 * set imperatively via ref instead of a JSX style attribute. */
function AccentDot({ color }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.style.setProperty('--accent', color);
  }, [color]);
  return <div ref={ref} className="adm-banner-accent-dot" />;
}

// MockAPI's real request body ceiling is much smaller than it looks —
// confirmed empirically: a 99KB body succeeds, 100KB comes back
// "413 Request Entity Too Large". A raw photo's base64 (33% bigger than
// the file itself) blows past that instantly, which is what the 413 in
// the screenshot was. Budgeting well under that ceiling, and leaving
// room for the banner's other fields, means the image itself has to be
// resized + recompressed client-side before it's ever sent.
const MAX_BANNER_IMAGE_PAYLOAD_CHARS = 70 * 1024;
const BANNER_IMAGE_MAX_WIDTH = 960;
const BANNER_IMAGE_MAX_HEIGHT = 360;

/** Downscales + recompresses (JPEG) in a <canvas> until the resulting
 * data URL fits the budget, shrinking further each attempt if it doesn't. */
function resizeImageFile(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, BANNER_IMAGE_MAX_WIDTH / img.width, BANNER_IMAGE_MAX_HEIGHT / img.height);
      let width = Math.round(img.width * scale);
      let height = Math.round(img.height * scale);

      for (let attempt = 0; attempt < 8; attempt++) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        const quality = Math.max(0.3, 0.8 - attempt * 0.1);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        if (dataUrl.length <= MAX_BANNER_IMAGE_PAYLOAD_CHARS) {
          resolve(dataUrl);
          return;
        }
        width = Math.round(width * 0.85);
        height = Math.round(height * 0.85);
      }
      reject(new Error('No se pudo comprimir la imagen lo suficiente. Probá con una imagen más simple o de menor resolución.'));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('No se pudo leer la imagen.'));
    };
    img.src = objectUrl;
  });
}

/**
 * Top-level, not defined inside BannersPanel — a component declared
 * inside another component's body gets a new identity every render, so
 * React remounts its DOM (losing input focus) on every keystroke that
 * updates the parent's state. That's what made the banner name/subtitle
 * fields only accept one character at a time before this was pulled out.
 */
function BannerForm({ item, onClose, onSave, onChange, onImageFile, imageError, formError, saving, resizingImage, isEdit }) {
  return (
    <form onSubmit={onSave}>
      <FormField label="Título" value={item.title} onChange={v => onChange('title', v)} />
      <FormField label="Subtítulo" value={item.subtitle} onChange={v => onChange('subtitle', v)} />
      <FormField label="Texto del botón CTA" value={item.cta} onChange={v => onChange('cta', v)} />
      <FormField label="URL de destino del botón" value={item.link ?? ''} onChange={v => onChange('link', v)} placeholder="/categoria/laptops" />
      <div className="adm-form-field">
        <label className="adm-form-label">Imagen</label>
        <input
          type="file"
          accept="image/*"
          disabled={resizingImage}
          onChange={e => onImageFile(e.target.files?.[0])}
          className="adm-form-input"
        />
        <p className="adm-form-hint">Se redimensiona y comprime automáticamente al subirla — MockAPI rechaza registros de más de ~100KB.</p>
        {resizingImage && <p className="adm-form-hint">Procesando imagen…</p>}
        {imageError && <p className="adm-form-error">{imageError}</p>}
      </div>
      <div className="adm-form-field">
        <label className="adm-form-label">Color de acento</label>
        <div className="adm-color-field-row">
          <input type="color" value={item.accent} onChange={e => onChange('accent', e.target.value)} className="adm-color-swatch" />
          <span className="adm-color-value">{item.accent}</span>
        </div>
      </div>
      {item.image && (
        <div className="adm-banner-preview">
          <img src={item.image} alt="preview" className="adm-banner-preview-img" onError={e => { e.target.style.display = 'none'; }} />
        </div>
      )}
      {formError && <p className="adm-form-error">{formError}</p>}
      <div className="adm-form-actions">
        <button type="button" onClick={onClose} className="adm-btn-secondary">Cancelar</button>
        <SaveBtn disabled={saving || resizingImage} label={saving ? 'Guardando…' : (isEdit ? 'Guardar cambios' : 'Crear anuncio')} />
      </div>
    </form>
  );
}

export default function BannerAdmin({ banners, setBanners, showToast }) {
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const blank = { title: '', subtitle: '', cta: 'Ver ahora', link: '', image: '', accent: '#5B2A86' };
  const [draft, setDraft] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [imageError, setImageError] = useState('');
  const [resizingImage, setResizingImage] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const del = async (id, title) => {
    setDeleting(true);
    try {
      await deleteBanner(id);
      setBanners(banners.filter(b => b.id !== id));
      setDeleteTarget(null);
      showToast(`Anuncio "${title}" eliminado`);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setFormError('');
    try {
      const result = await updateBanner(editing.id, editing);
      setBanners(banners.map(b => b.id === editing.id ? result : b));
      setEditing(null);
      showToast(`Anuncio "${result.title}" actualizado`);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const saveAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const result = await createBanner({ ...draft, order: banners.length });
      setBanners([...banners, result]);
      setAdding(false);
      setDraft(blank);
      showToast(`Anuncio "${result.title}" creado`);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const move = async (id, dir) => {
    const idx = banners.findIndex(b => b.id === id);
    const next = idx + dir;
    if (next < 0 || next >= banners.length) return;
    const arr = [...banners];
    [arr[idx], arr[next]] = [arr[next], arr[idx]];
    setBanners(arr);
    try {
      await Promise.all([
        updateBanner(arr[idx].id, { order: idx }),
        updateBanner(arr[next].id, { order: next }),
      ]);
    } catch (err) {
      setFormError(err.message);
    }
  };

  const toggleActive = async (b) => {
    try {
      const result = await updateBanner(b.id, { active: !b.active });
      setBanners(banners.map(x => x.id === b.id ? result : x));
      showToast(`Anuncio "${b.title}" ${result.active ? 'activado' : 'desactivado'}`);
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleImageFile = async (file, isEdit) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageError('El archivo debe ser una imagen.');
      return;
    }
    setImageError('');
    setResizingImage(true);
    try {
      const dataUrl = await resizeImageFile(file);
      if (isEdit) setEditing(item => ({ ...item, image: dataUrl }));
      else setDraft(item => ({ ...item, image: dataUrl }));
    } catch (err) {
      setImageError(err.message);
    } finally {
      setResizingImage(false);
    }
  };

  return (
    <div>
      <SectionHeader title={`Anuncios del carrusel (${banners.length})`} action={<AddBtn onClick={() => { setFormError(''); setImageError(''); setAdding(true); }} label="Nuevo anuncio" />} />
      <div className="adm-banner-list">
        {banners.map((b, i) => (
          <div key={b.id} className="adm-banner-card">
            {/* Order controls */}
            <div className="adm-banner-order-controls">
              <IconBtn onClick={() => move(b.id, -1)} title="Subir"><svg className="icon icon-14 icon-sw-2_5" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg></IconBtn>
              <span className="adm-banner-order-num">{i + 1}</span>
              <IconBtn onClick={() => move(b.id, 1)} title="Bajar"><svg className="icon icon-14 icon-sw-2_5" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></IconBtn>
            </div>
            {/* Image preview */}
            <div className="adm-banner-image-wrap">
              <img src={b.image} alt={b.title} className="adm-banner-image" />
              <div className="adm-banner-image-fade" />
              <AccentDot color={b.accent} />
            </div>
            {/* Info */}
            <div className="adm-banner-info">
              <div className="adm-banner-title">{b.title}</div>
              <div className="adm-banner-subtitle">{b.subtitle}</div>
              <span className="adm-banner-cta-tag">CTA: {b.cta} → {b.link || '—'}</span>
            </div>
            {/* Active toggle */}
            <button onClick={() => toggleActive(b)} title={b.active ? 'Activo' : 'Inactivo'} className={`adm-toggle ${b.active ? 'adm-toggle--on' : ''}`}>
              <div className={`adm-toggle-knob ${b.active ? 'adm-toggle-knob--on' : ''}`} />
            </button>
            {/* Actions */}
            <div className="adm-banner-actions">
              <IconBtn onClick={() => { setFormError(''); setImageError(''); setEditing({ ...b }); }} title="Editar"><svg className="icon icon-15" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></IconBtn>
              <IconBtn onClick={() => setDeleteTarget(b)} danger title="Eliminar"><svg className="icon icon-15" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></IconBtn>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <Modal title="Editar anuncio" onClose={() => setEditing(null)}>
          <BannerForm
            item={editing}
            onClose={() => setEditing(null)}
            onSave={saveEdit}
            onChange={(field, value) => setEditing(prev => ({ ...prev, [field]: value }))}
            onImageFile={file => handleImageFile(file, true)}
            imageError={imageError}
            formError={formError}
            saving={saving}
            resizingImage={resizingImage}
            isEdit
          />
        </Modal>
      )}
      {adding && (
        <Modal title="Nuevo anuncio" onClose={() => setAdding(false)}>
          <BannerForm
            item={draft}
            onClose={() => setAdding(false)}
            onSave={saveAdd}
            onChange={(field, value) => setDraft(prev => ({ ...prev, [field]: value }))}
            onImageFile={file => handleImageFile(file, false)}
            imageError={imageError}
            formError={formError}
            saving={saving}
            resizingImage={resizingImage}
            isEdit={false}
          />
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Eliminar anuncio"
          message={`¿Seguro que querés eliminar "${deleteTarget.title}"? Esta acción no se puede deshacer.`}
          confirming={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => del(deleteTarget.id, deleteTarget.title)}
        />
      )}
    </div>
  );
}
