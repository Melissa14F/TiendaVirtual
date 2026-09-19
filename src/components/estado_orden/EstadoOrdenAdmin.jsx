import { useState, useRef, useEffect } from 'react';
import { createOrderStatus, updateOrderStatus, toggleOrderStatus, deleteOrderStatus } from '../../services/orderStatusService';
import { SectionHeader, AddBtn, IconBtn, Th, Td, FormField, Modal, SaveBtn, ConfirmModal } from '../admin/shared';

/** Shows an arbitrary hex color (no fixed set of values, so no CSS class
 * per color) as a small dot — same imperative-ref pattern BannersPanel's
 * AccentDot uses, to avoid a JSX style attribute. */
function ColorDot({ color }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.style.setProperty('--status-color', color);
  }, [color]);
  return <div ref={ref} className="adm-status-color-dot" />;
}

export default function EstadoOrdenAdmin({ statuses, setStatuses, showToast }) {
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: '', description: '', color: '#5B2A86' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [listError, setListError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const del = async (id, name) => {
    setListError('');
    setDeleting(true);
    try {
      await deleteOrderStatus(id);
      setStatuses(statuses.filter(s => s.id !== id));
      setDeleteTarget(null);
      showToast(`Estado "${name}" eliminado`);
    } catch (err) {
      setListError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const toggle = async (s) => {
    setListError('');
    try {
      const result = await toggleOrderStatus(s.id, !s.active);
      setStatuses(statuses.map(x => x.id === s.id ? result : x));
      showToast(`Estado "${s.name}" ${result.active ? 'activado' : 'desactivado'}`);
    } catch (err) {
      setListError(err.message);
    }
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setFormError('');
    try {
      const result = await updateOrderStatus(editing.id, editing);
      setStatuses(statuses.map(s => s.id === editing.id ? result : s));
      setEditing(null);
      showToast(`Estado "${result.name}" actualizado`);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const saveAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const result = await createOrderStatus(draft);
      setStatuses([...statuses, result]);
      setAdding(false);
      setDraft({ name: '', description: '', color: '#5B2A86' });
      showToast(`Estado "${result.name}" creado`);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <SectionHeader title={`Estados de pedido (${statuses.length})`} action={<AddBtn onClick={() => { setFormError(''); setAdding(true); }} label="Nuevo estado" />} />
      {listError && <p className="adm-form-error">{listError}</p>}
      <div className="adm-panel">
        <table className="adm-table">
          <thead><tr><Th>Nombre</Th><Th>Descripción</Th><Th>Color</Th><Th>Activo</Th><Th>Acciones</Th></tr></thead>
          <tbody>
            {statuses.map((s, i) => (
              <tr key={s.id} className={i > 0 ? 'adm-td-row' : ''}>
                <Td><span className="adm-text-strong">{s.name}</span></Td>
                <Td className="adm-text-muted">{s.description || '—'}</Td>
                <Td>
                  <div className="adm-color-field-row">
                    <ColorDot color={s.color} />
                    <span className="adm-color-value">{s.color}</span>
                  </div>
                </Td>
                <Td>
                  <button onClick={() => toggle(s)} className={`adm-toggle ${s.active ? 'adm-toggle--on' : ''}`}>
                    <div className={`adm-toggle-knob ${s.active ? 'adm-toggle-knob--on' : ''}`} />
                  </button>
                </Td>
                <Td>
                  <div className="adm-actions-row">
                    <IconBtn onClick={() => { setFormError(''); setEditing({ ...s }); }} title="Editar"><svg className="icon icon-15" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></IconBtn>
                    <IconBtn onClick={() => setDeleteTarget(s)} danger title="Eliminar"><svg className="icon icon-15" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></IconBtn>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title="Editar estado" onClose={() => setEditing(null)}>
          <form onSubmit={saveEdit}>
            <FormField label="Nombre" value={editing.name} onChange={v => setEditing({ ...editing, name: v })} />
            <FormField label="Descripción" value={editing.description} onChange={v => setEditing({ ...editing, description: v })} />
            <div className="adm-form-field">
              <label className="adm-form-label">Color</label>
              <div className="adm-color-field-row">
                <input type="color" value={editing.color} onChange={e => setEditing({ ...editing, color: e.target.value })} className="adm-color-swatch" />
                <span className="adm-color-value">{editing.color}</span>
              </div>
            </div>
            {formError && <p className="adm-form-error">{formError}</p>}
            <div className="adm-form-actions">
              <button type="button" onClick={() => setEditing(null)} className="adm-btn-secondary">Cancelar</button>
              <SaveBtn disabled={saving} label={saving ? 'Guardando…' : 'Guardar cambios'} />
            </div>
          </form>
        </Modal>
      )}
      {adding && (
        <Modal title="Nuevo estado" onClose={() => setAdding(false)}>
          <form onSubmit={saveAdd}>
            <FormField label="Nombre" value={draft.name} onChange={v => setDraft({ ...draft, name: v })} />
            <FormField label="Descripción" value={draft.description} onChange={v => setDraft({ ...draft, description: v })} />
            <div className="adm-form-field">
              <label className="adm-form-label">Color</label>
              <div className="adm-color-field-row">
                <input type="color" value={draft.color} onChange={e => setDraft({ ...draft, color: e.target.value })} className="adm-color-swatch" />
                <span className="adm-color-value">{draft.color}</span>
              </div>
            </div>
            {formError && <p className="adm-form-error">{formError}</p>}
            <div className="adm-form-actions">
              <button type="button" onClick={() => setAdding(false)} className="adm-btn-secondary">Cancelar</button>
              <SaveBtn disabled={saving} label={saving ? 'Creando…' : 'Crear estado'} />
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Eliminar estado"
          message={`¿Seguro que querés eliminar el estado "${deleteTarget.name}"? Esta acción no se puede deshacer.`}
          confirming={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => del(deleteTarget.id, deleteTarget.name)}
        />
      )}
    </div>
  );
}
