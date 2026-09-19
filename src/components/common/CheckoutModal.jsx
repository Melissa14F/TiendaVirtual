import { useState, useEffect } from 'react';
import { getById as getClienteById, updateCliente } from '../../services/clienteService';
import '../../styles/CheckoutModal.css';

// Métodos de pago disponibles en el formulario de compra.
const PAYMENT_METHODS = ['Tarjeta de crédito', 'PSE', 'Efectivo contraentrega'];

/**
 * Shared by every place an order can be placed (header cart drawer, "Mi
 * carrito" tab, "Comprar ahora") — pre-fills address/postal code from the
 * client's saved profile, but requires confirming (or editing) them here
 * before the order actually gets created, instead of silently reusing
 * whatever was last saved in "Mi perfil".
 */
export default function CheckoutModal({ userId, total, submitting, error, onClose, onConfirm }) {
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [loadingProfile, setLoadingProfile] = useState(true); // mientras trae los datos guardados del cliente
  const [formError, setFormError] = useState('');

  // Al abrir el modal, precarga dirección y código postal desde el perfil del cliente (si ya los tiene guardados).
  useEffect(() => {
    let cancelled = false;
    getClienteById(userId)
      .then(data => {
        if (cancelled) return;
        setAddress(data.address ?? '');
        setPostalCode(data.postalCode ?? '');
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingProfile(false); });
    return () => { cancelled = true; };
  }, [userId]);

  // Valida los campos obligatorios, guarda la dirección en el perfil (para no volver a pedirla) y confirma el pedido.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address.trim() || !postalCode.trim()) {
      setFormError('Completá la dirección y el código postal para continuar.');
      return;
    }
    setFormError('');
    const trimmedAddress = address.trim();
    const trimmedPostalCode = postalCode.trim();
    // Best-effort: this only appears when the profile is missing shipping
    // info, so saving it here means the next purchase won't ask again.
    // If the save fails, the order still goes through — it just asks again.
    await updateCliente(userId, { address: trimmedAddress, postalCode: trimmedPostalCode }).catch(() => {});
    onConfirm({ address: trimmedAddress, postalCode: trimmedPostalCode, paymentMethod });
  };

  return (
    <>
      {/* Fondo oscuro, clic afuera cierra el modal */}
      <div onClick={onClose} className="chk-overlay" />
      <div className="chk-modal">
        <div className="chk-header">
          <h3 className="chk-title">Datos de la orden</h3>
          <button onClick={onClose} className="chk-close">×</button>
        </div>

        {loadingProfile ? (
          <div className="chk-loading">Cargando tus datos…</div>
        ) : (
          <form onSubmit={handleSubmit} className="chk-body">
            {/* Campos de dirección, código postal y método de pago */}
            <div className="chk-field">
              <label className="chk-label">Dirección de envío</label>
              <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Calle, número, ciudad" className="chk-input" />
            </div>
            <div className="chk-field">
              <label className="chk-label">Código postal</label>
              <input value={postalCode} onChange={e => setPostalCode(e.target.value)} placeholder="0000" className="chk-input" />
            </div>
            <div className="chk-field">
              <label className="chk-label">Método de pago</label>
              <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="chk-input">
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* Total a pagar */}
            <div className="chk-total-row">
              <span>Total a pagar</span>
              <span className="chk-total-value">${total.toLocaleString()}</span>
            </div>

            {(formError || error) && <p className="chk-error">{formError || error}</p>}

            {/* Botones de cancelar / confirmar */}
            <div className="chk-actions">
              <button type="button" onClick={onClose} className="chk-btn-secondary">Cancelar</button>
              <button type="submit" disabled={submitting} className="chk-btn-primary">
                {submitting ? 'Procesando…' : 'Confirmar pedido'}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
