// Piezas de UI compartidas entre LoginForm y RegisterForm.

// Input reutilizable con label y, opcionalmente, un botón para mostrar/ocultar la contraseña.
export function Field({ label, type = 'text', placeholder, showToggle, show, onToggle, autoComplete, value, onChange }) {
  return (
    <div className="av-field-wrap">
      <label className="av-field-label">
        {label}
      </label>
      <div className="av-field-input-wrap">
        <input
          type={showToggle ? (show ? 'text' : 'password') : type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange ? e => onChange(e.target.value) : undefined}
          className={`av-field-input ${showToggle ? 'av-field-input--toggle' : ''}`}
        />
        {showToggle && (
          <button type="button" onClick={onToggle} className="av-field-toggle-btn">
            {show ? (
              <svg className="icon icon-16" viewBox="0 0 24 24">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg className="icon icon-16" viewBox="0 0 24 24">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// Botón principal de envío del formulario.
export function PrimaryBtn({ children, disabled }) {
  return (
    <button type="submit" className="av-primary-btn" disabled={disabled}>{children}</button>
  );
}

// Separador visual "o continuá con" entre el formulario y el botón de Google.
export function Divider() {
  return (
    <div className="av-divider-wrap">
      <div className="av-divider-line" />
      <span className="av-divider-text">o continuá con</span>
      <div className="av-divider-line" />
    </div>
  );
}

// Botón decorativo de "Continuar con Google" (no tiene funcionalidad real conectada).
export function GoogleBtn() {
  return (
    <button type="button" className="av-google-btn">
      <svg className="icon icon-18" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Continuar con Google
    </button>
  );
}
