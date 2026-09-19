import { useState } from 'react';
import { createPageInfo, updatePageInfo } from '../../services/pageInfoService';
import { SectionHeader, FormField, SaveBtn } from '../admin/shared';

const BLANK_PAGE_INFO = { storeName: '', tagline: '', email: '', phone: '', address: '', hours: '', whatsapp: '', facebook: '', instagram: '' };

export default function InformacionAdmin({ info, setInfo, showToast }) {
  const [draft, setDraft] = useState(info ?? BLANK_PAGE_INFO);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const result = info ? await updatePageInfo(info.id, draft) : await createPageInfo(draft);
      setInfo(result);
      setDraft(result);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      showToast('Información de la tienda guardada');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const set = (key) => (v) => setDraft(d => ({ ...d, [key]: v }));

  return (
    <div>
      <SectionHeader title="Información de la tienda" />
      {!info && (
        <div className="adm-status">Todavía no hay información guardada. Completá el formulario y guardá para crearla.</div>
      )}
      <form onSubmit={handleSave}>
        <div className="adm-page-info-grid">
          {/* General */}
          <div className="adm-page-info-card">
            <div className="adm-page-info-card-title">General</div>
            <FormField label="Nombre de la tienda" value={draft.storeName} onChange={set('storeName')} />
            <FormField label="Eslogan" value={draft.tagline} onChange={set('tagline')} />
            <FormField label="Email de contacto" type="email" value={draft.email} onChange={set('email')} />
          </div>

          {/* Contact */}
          <div className="adm-page-info-card">
            <div className="adm-page-info-card-title">Contacto</div>
            <FormField label="Teléfono" value={draft.phone} onChange={set('phone')} />
            <FormField label="Dirección" value={draft.address} onChange={set('address')} />
            <FormField label="Horario de atención" value={draft.hours} onChange={set('hours')} />
          </div>
          {/* Social */}
          <div className="adm-page-info-card adm-page-info-card--full">
            <div className="adm-page-info-card-title">Redes sociales</div>
            <div className="adm-page-info-social-grid">
              <FormField label="WhatsApp (número)" value={draft.whatsapp} onChange={set('whatsapp')} placeholder="5491112345678" />
              <FormField label="Facebook (@usuario)" value={draft.facebook} onChange={set('facebook')} placeholder="techmarket" />
              <FormField label="Instagram (@usuario)" value={draft.instagram} onChange={set('instagram')} placeholder="techmarket.ar" />
            </div>
          </div>
        </div>

        <div className="adm-page-info-save-row">
          <SaveBtn label={saving ? 'Guardando…' : 'Guardar cambios'} disabled={saving} />
          {saved && (
            <span className="adm-saved-msg">
              <svg className="icon icon-16 icon-sw-2_5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              Cambios guardados
            </span>
          )}
          {error && <span className="adm-form-error">{error}</span>}
        </div>
      </form>
    </div>
  );
}
