import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../hooks/useBreakpoint';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/usuario/LoginForm';
import RegisterForm from '../components/usuario/RegisterForm';
import logo from '../assets/logo.svg';
import '../styles/AuthPage.css';

// Página de autenticación (ruta /login): alterna entre "Iniciar sesión"
// y "Registrarse" dentro de la misma tarjeta. Sirve tanto para
// administradores como clientes.
export default function AuthPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState('login');
  const isMobile = useIsMobile();

  // Guarda la sesión y manda al admin a su panel, o al cliente de vuelta a la tienda.
  const handleSuccess = (role, id, name, email, extra) => {
    login(role, id, name, email, extra);
    navigate(role === 'admin' ? '/admin' : '/cuenta');
  };

  return (
    <div className="av-page">
      <div className="av-card">

        {/* Panel izquierdo — presentación de la marca (oculto en mobile) */}
        {!isMobile && <div className="av-brand-panel">
          {/* círculos decorativos */}
          <div className="av-circle-1" />
          <div className="av-circle-2" />

          <div className="av-brand-content">
            <button onClick={() => navigate('/')} className="av-back-btn">
              <svg className="icon icon-14 icon-sw-2_5" viewBox="0 0 24 24">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Volver a la tienda
            </button>

            <div className="av-brand-logo-row">
              <div className="av-brand-logo-box">
                <img src={logo} alt="TechMarket" className="hdr-logo-img" />
              </div>
              <span className="av-brand-name">TechMarket</span>
            </div>

            <h2 className="av-brand-title">
              {mode === 'login' ? 'Bienvenido de vuelta' : 'Creá tu cuenta'}
            </h2>
            <p className="av-brand-desc">
              {mode === 'login'
                ? 'Ingresá para ver tus pedidos, tus favoritos y seguir comprando.'
                : 'Creá tu cuenta para comprar más rápido y hacer seguimiento de tus pedidos.'}
            </p>
          </div>

          <div className="av-benefits-wrap">
            {[
              { icon: <svg className="icon icon-15" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>, text: 'Seguimiento de tus pedidos en tiempo real' },
              { icon: <svg className="icon icon-15" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>, text: 'Favoritos guardados y compra más rápida' },
              { icon: <svg className="icon icon-15" viewBox="0 0 24 24"><path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12.58V2h10.58l8.01 8.01a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>, text: 'Ofertas y cupones exclusivos' },
            ].map((b) => (
              <div key={b.text} className="av-benefit-row">
                <div className="av-benefit-icon-box">{b.icon}</div>
                <span className="av-benefit-text">{b.text}</span>
              </div>
            ))}
          </div>
        </div>}

        {/* Panel derecho — formulario */}
        <div className="av-form-panel">

          {/* Botón de volver, solo en mobile (el desktop lo tiene dentro del panel de marca) */}
          {isMobile && (
            <button onClick={() => navigate('/')} className="av-mobile-back-btn">
              <svg className="icon icon-14 icon-sw-2_5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
              Volver a la tienda
            </button>
          )}

          {/* Logo, solo en mobile */}
          {isMobile && (
            <div className="av-mobile-logo-row">
              <div className="av-mobile-logo-box">
                <img src={logo} alt="TechMarket" className="hdr-logo-img" />
              </div>
              <span className="av-mobile-brand">Tech<span className="hdr-brand-accent">Market</span></span>
            </div>
          )}

          {/* Selector de modo: iniciar sesión / registrarse */}
          <div className="av-toggle-wrap">
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => setMode(m)} className={`av-toggle-btn ${mode === m ? 'av-toggle-btn--active' : ''}`}>
                {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
              </button>
            ))}
          </div>

          {mode === 'login'
            ? <LoginForm onSuccess={handleSuccess} />
            : <RegisterForm onSuccess={(id, name, email) => handleSuccess('client', id, name, email)} />
          }
        </div>
      </div>
    </div>
  );
}
