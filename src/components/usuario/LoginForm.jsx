import { useState } from 'react';
import { login as authLogin } from '../../services/authService';
import { PrimaryBtn } from './AuthFields';

/* ── Formulario de inicio de sesión ── */
// Login por correo y contraseña; delega la verificación al servicio authService.login.
export default function LoginForm({ onSuccess }) {
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Intenta iniciar sesión y, si funciona, pasa el rol/id/nombre/permisos al padre.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await authLogin(email, password);
      setError('');
      onSuccess(result.role, result.id, result.name, result.email, { isPrincipal: result.isPrincipal, permissions: result.permissions });
    } catch {
      setError('Correo o contraseña incorrectos.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="av-form">
      <div className="av-field-wrap">
        <label className="av-field-label">Correo electrónico</label>
        <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} placeholder="tu@email.com" autoComplete="email"
          className={`av-field-input ${error ? 'av-field-input--error' : ''}`}
        />
      </div>

      <div className="av-field-wrap">
        <label className="av-field-label">Contraseña</label>
        <div className="av-field-input-wrap">
          <input type={showPass ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setError(''); }} placeholder="••••••••" autoComplete="current-password"
            className={`av-field-input av-field-input--toggle ${error ? 'av-field-input--error' : ''}`}
          />
          <button type="button" onClick={() => setShowPass(v => !v)} className="av-field-toggle-btn">
            {showPass
              ? <svg className="icon icon-16" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              : <svg className="icon icon-16" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            }
          </button>
        </div>
      </div>

      {error && (
        <div className="av-error-box">
          <svg className="av-error-icon icon icon-15 icon-sw-2_5 icon-stroke-danger" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span className="av-error-text">{error}</span>
        </div>
      )}

      <div className="av-forgot-row">
        <button type="button" className="av-forgot-btn">
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <PrimaryBtn disabled={submitting}>{submitting ? 'Verificando…' : 'Iniciar sesión →'}</PrimaryBtn>

      {/* Credenciales de prueba visibles para facilitar la demo/pruebas */}
      <div className="av-demo-box">
        <div className="av-demo-title">Credenciales de prueba</div>
        <div className="av-demo-text">
          <span className="av-demo-label">Email:</span> admin@techmarket.com<br />
          <span className="av-demo-label">Pass:</span> admin123
        </div>
      </div>
    </form>
  );
}
