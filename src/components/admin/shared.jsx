/* ─── Shared UI primitives used across the admin panels ─── */
export function SectionHeader({ title, action }) {
  return (
    <div className="adm-section-header">
      <h2 className="adm-section-title">{title}</h2>
      {action}
    </div>
  );
}

export function AddBtn({ onClick, label = 'Agregar' }) {
  return (
    <button onClick={onClick} className="adm-add-btn">
      <svg className="icon icon-14 icon-sw-2_5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      {label}
    </button>
  );
}

export function IconBtn({ onClick, danger, title, children }) {
  return (
    <button onClick={onClick} title={title} className={`adm-icon-btn ${danger ? 'adm-icon-btn--danger' : ''}`}>{children}</button>
  );
}

export function Th({ children }) {
  return <th className="adm-th">{children}</th>;
}

export function Td({ children, className = '' }) {
  return <td className={`adm-td ${className}`}>{children}</td>;
}

export function FormField({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div className="adm-form-field">
      <label className="adm-form-label">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="adm-form-input" />
    </div>
  );
}

export function Modal({ title, onClose, children }) {
  return (
    <>
      <div onClick={onClose} className="adm-modal-overlay" />
      <div className="adm-modal">
        <div className="adm-modal-header">
          <h3 className="adm-modal-title">{title}</h3>
          <button onClick={onClose} className="adm-modal-close">×</button>
        </div>
        <div className="adm-modal-body">{children}</div>
      </div>
    </>
  );
}

export function SaveBtn({ label = 'Guardar cambios', disabled }) {
  return (
    <button type="submit" className="adm-save-btn" disabled={disabled}>{label}</button>
  );
}

/** Confirmation gate for destructive actions — every panel's delete
 * button opens this instead of deleting straight away. */
export function ConfirmModal({ title = 'Confirmar eliminación', message, onConfirm, onCancel, confirming }) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="adm-confirm-text">{message}</p>
      <div className="adm-form-actions">
        <button type="button" onClick={onCancel} className="adm-btn-secondary">Cancelar</button>
        <button type="button" onClick={onConfirm} disabled={confirming} className="adm-btn-danger">
          {confirming ? 'Eliminando…' : 'Eliminar'}
        </button>
      </div>
    </Modal>
  );
}

/** Success confirmation after a create/update/delete/toggle — every panel
 * calls showToast() (from AdminView's index.jsx) with a message specific
 * to what just happened, instead of the change only being visible as a
 * silent row update in the table. */
export function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="adm-toast">
      <svg className="icon icon-16 icon-sw-2_5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
      {message}
    </div>
  );
}
