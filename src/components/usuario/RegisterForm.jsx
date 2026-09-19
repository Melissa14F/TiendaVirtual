import { useState } from 'react';
import { createCliente } from '../../services/clienteService';
import { Field, PrimaryBtn, Divider, GoogleBtn } from './AuthFields';

/* ── Formulario de registro ── */
// Registro de una cuenta de cliente nueva; valida contraseña localmente antes de llamar a createCliente.
export default function RegisterForm({ onSuccess }) {
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Valida largo mínimo y coincidencia de contraseñas, luego crea la cuenta.
  // createCliente ya rechaza correos duplicados (normalizado, ver clienteService.js).
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const result = await createCliente({ name: firstName, lastName, email, password });
      onSuccess(result.id, `${result.name} ${result.lastName}`, result.email);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="av-form">
      <div className="av-name-grid">
        <Field label="Nombre" placeholder="Juan" autoComplete="given-name" value={firstName} onChange={v => { setFirstName(v); setError(''); }} />
        <Field label="Apellido" placeholder="García" autoComplete="family-name" value={lastName} onChange={v => { setLastName(v); setError(''); }} />
      </div>
      <Field label="Correo electrónico" type="email" placeholder="tu@email.com" autoComplete="email" value={email} onChange={v => { setEmail(v); setError(''); }} />
      <Field label="Contraseña" placeholder="Mín. 8 caracteres" showToggle show={showPass} onToggle={() => setShowPass(v => !v)} autoComplete="new-password" value={password} onChange={v => { setPassword(v); setError(''); }} />
      <Field label="Confirmar contraseña" placeholder="Repetí tu contraseña" showToggle show={showPass2} onToggle={() => setShowPass2(v => !v)} autoComplete="new-password" value={confirmPassword} onChange={v => { setConfirmPassword(v); setError(''); }} />

      {error && (
        <div className="av-error-box">
          <svg className="av-error-icon icon icon-15 icon-sw-2_5 icon-stroke-danger" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span className="av-error-text">{error}</span>
        </div>
      )}

      <label className="av-terms-label">
        <input type="checkbox" required className="av-terms-checkbox" />
        <span className="av-terms-text">
          Acepto los{' '}
          <span className="av-terms-link">Términos y condiciones</span>
          {' '}y la{' '}
          <span className="av-terms-link">Política de privacidad</span>
        </span>
      </label>

      <PrimaryBtn disabled={submitting}>{submitting ? 'Creando cuenta…' : 'Crear mi cuenta →'}</PrimaryBtn>
      <Divider />
      <GoogleBtn />
    </form>
  );
}
