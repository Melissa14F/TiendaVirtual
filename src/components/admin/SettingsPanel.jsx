import { useState } from 'react';
import { changeAdminPassword } from '../../services/authService';
import { SectionHeader, FormField, SaveBtn } from './shared';

export default function SettingsPanel({ adminId, showToast }) {
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.next !== passwords.confirm) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await changeAdminPassword(adminId, passwords.current, passwords.next);
      setPasswords({ current: '', next: '', confirm: '' });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      showToast('Contraseña actualizada');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <SectionHeader title="Configuración" />
      <form onSubmit={handleChangePassword} className="adm-page-info-card adm-settings-card">
        <div className="adm-page-info-card-title">Cambiar contraseña</div>
        <FormField label="Contraseña actual" type="password" value={passwords.current} onChange={v => setPasswords(p => ({ ...p, current: v }))} />
        <FormField label="Nueva contraseña" type="password" value={passwords.next} onChange={v => setPasswords(p => ({ ...p, next: v }))} placeholder="Mín. 8 caracteres" />
        <FormField label="Confirmar contraseña" type="password" value={passwords.confirm} onChange={v => setPasswords(p => ({ ...p, confirm: v }))} placeholder="Repetí la nueva contraseña" />
        <div className="adm-page-info-save-row">
          <SaveBtn label={saving ? 'Cambiando…' : 'Cambiar contraseña'} disabled={saving} />
          {saved && (
            <span className="adm-saved-msg">
              <svg className="icon icon-16 icon-sw-2_5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              Contraseña actualizada
            </span>
          )}
          {error && <span className="adm-form-error">{error}</span>}
        </div>
      </form>
    </div>
  );
}
