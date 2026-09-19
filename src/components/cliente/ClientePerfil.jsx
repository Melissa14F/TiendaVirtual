import { useState, useEffect } from 'react';
import { getById as getClienteById, updateCliente, changePassword } from '../../services/clienteService';

function ProfileField({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div className="ca-field-wrap">
      <label className="ca-field-label">{label}</label>
      <input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="ca-field-input" />
    </div>
  );
}

export default function ClientePerfil({ userId }) {
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [passwordStatus, setPasswordStatus] = useState({ saving: false, error: '', success: false });

  useEffect(() => {
    let cancelled = false;
    getClienteById(userId)
      .then(data => { if (!cancelled) { setCliente(data); setDraft(data); } })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [userId]);

  const set = (key) => (v) => setDraft(d => ({ ...d, [key]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      const result = await updateCliente(userId, draft);
      setCliente(result);
      setDraft(result);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.next !== passwords.confirm) {
      setPasswordStatus({ saving: false, error: 'Las contraseñas nuevas no coinciden.', success: false });
      return;
    }
    setPasswordStatus({ saving: true, error: '', success: false });
    try {
      await changePassword(userId, passwords.current, passwords.next);
      setPasswords({ current: '', next: '', confirm: '' });
      setPasswordStatus({ saving: false, error: '', success: true });
      setTimeout(() => setPasswordStatus(s => ({ ...s, success: false })), 2500);
    } catch (err) {
      setPasswordStatus({ saving: false, error: err.message, success: false });
    }
  };

  if (loading) return <div className="ca-orders-status">Cargando tu perfil…</div>;
  if (error || !draft) return <div className="ca-orders-status ca-orders-status--error">No se pudo cargar tu perfil.</div>;

  return (
    <div className="ca-profile-grid">
      <form onSubmit={handleSave} className="ca-profile-card ca-profile-card--full">
        <div className="ca-profile-card-title">Datos personales</div>
        <div className="ca-profile-fields-grid">
          <ProfileField label="Nombre" value={draft.name} onChange={set('name')} />
          <ProfileField label="Apellido" value={draft.lastName} onChange={set('lastName')} />
        </div>
        <ProfileField label="Correo electrónico" value={draft.email} onChange={set('email')} type="email" />
        <ProfileField label="Teléfono" value={draft.phone} onChange={set('phone')} />
        <div className="ca-profile-fields-grid">
          <ProfileField label="Dirección" value={draft.address} onChange={set('address')} />
          <ProfileField label="Código postal" value={draft.postalCode} onChange={set('postalCode')} />
        </div>
        <div className="ca-profile-save-row">
          <button type="submit" disabled={saving} className="ca-profile-save-btn">
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
          {saved && <span className="ca-profile-saved-msg">✓ Cambios guardados</span>}
          {saveError && <span className="ca-coupon-error">{saveError}</span>}
        </div>
      </form>

      <form onSubmit={handleChangePassword} className="ca-profile-card ca-profile-card--full">
        <div className="ca-profile-card-title">Seguridad</div>
        <ProfileField label="Contraseña actual" type="password" value={passwords.current} onChange={v => setPasswords(p => ({ ...p, current: v }))} />
        <ProfileField label="Nueva contraseña" type="password" value={passwords.next} onChange={v => setPasswords(p => ({ ...p, next: v }))} placeholder="Mín. 8 caracteres" />
        <ProfileField label="Confirmar contraseña" type="password" value={passwords.confirm} onChange={v => setPasswords(p => ({ ...p, confirm: v }))} placeholder="Repetí la nueva contraseña" />
        <button type="submit" disabled={passwordStatus.saving} className="ca-profile-change-pass-btn">
          {passwordStatus.saving ? 'Cambiando…' : 'Cambiar contraseña'}
        </button>
        {passwordStatus.success && <span className="ca-profile-saved-msg">✓ Contraseña actualizada</span>}
        {passwordStatus.error && <span className="ca-coupon-error">{passwordStatus.error}</span>}
      </form>
    </div>
  );
}
