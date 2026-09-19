import logo from '../../assets/logo.svg';
import '../../styles/Footer.css';

// Pie de página de la tienda: muestra la marca, datos de contacto,
// enlaces y redes sociales. Todos los datos vienen del prop "info"
// (la información real de la tienda, cargada desde la API).
export default function Footer({ info }) {
  // Arma la lista de datos de contacto a mostrar (dirección, teléfono,
  // correo, horario), cada uno con su ícono correspondiente.
  const contactItems = [
    {
      text: info.address,
      icon: <svg className="ftr-contact-icon icon icon-14" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    },
    {
      text: info.phone,
      icon: <svg className="ftr-contact-icon icon icon-14" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.93 12 19.79 19.79 0 0 1 1.85 3.4 2 2 0 0 1 3.84 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.09a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
    },
    {
      text: info.email,
      icon: <svg className="ftr-contact-icon icon icon-14" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    },
    {
      text: info.hours,
      icon: <svg className="ftr-contact-icon icon icon-14" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    },
  ];
  return (
    <footer className="ftr-root">
      <div className="ftr-container">
        <div className="ftr-grid">

          {/* Columna: logo, nombre de la tienda, eslogan y redes sociales */}
          <div>
            <div className="ftr-brand-row">
              <div className="ftr-logo-box">
                <img src={logo} alt={info.storeName} className="ftr-logo-img" />
              </div>
              <span className="ftr-brand-name">{info.storeName}</span>
            </div>
            <p className="ftr-about-text">
              {info.tagline}
            </p>
            <div className="ftr-social-row">
              <a href={`https://facebook.com/${info.facebook}`} target="_blank" rel="noopener noreferrer" className="ftr-social-btn">F</a>
              <a href={`https://instagram.com/${info.instagram}`} target="_blank" rel="noopener noreferrer" className="ftr-social-btn">I</a>
              <a href="#" className="ftr-social-btn">X</a>
              <a href={`https://wa.me/${info.whatsapp}`} target="_blank" rel="noopener noreferrer" className="ftr-social-btn ftr-social-btn--whatsapp">
                <svg className="icon-fill icon-16 icon-whatsapp-light" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.25.625 4.35 1.71 6.136L0 24l5.996-1.674A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.96 0-3.8-.535-5.375-1.462l-.386-.228-3.996 1.115 1.072-3.9-.25-.4A9.945 9.945 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
              </a>
            </div>
          </div>

          {/* Columna: datos de contacto (el id sirve para que el Header pueda hacer scroll hasta acá) */}
          <div id="footer-contact">
            <div className="ftr-heading">Contacto</div>
            <div className="ftr-contact-list">
              {contactItems.map(item => (
                <div key={item.text} className="ftr-contact-item">
                  <span>{item.icon}</span>
                  <span className="ftr-contact-text">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Columna: enlaces (política de envíos, devoluciones, términos) */}
          <div>
            <div className="ftr-heading">Enlaces</div>
            <div className="ftr-links-list">
              {['Política de envíos', 'Devoluciones', 'Términos y condiciones'].map(link => (
                <a key={link} href="#" className="ftr-link">{link}</a>
              ))}
            </div>
          </div>
        </div>

        {/* Franja inferior: derechos reservados + logos de medios de pago */}
        <div className="ftr-bottom">
          <span className="ftr-copyright">© 2026 {info.storeName}. Todos los derechos reservados.</span>
          <div className="ftr-payment-row">
            {['Visa', 'Mastercard', 'AMEX', 'PayPal'].map(pm => (
              <span key={pm} className="ftr-payment-badge">{pm}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
