import { useState } from 'react';
import { createDiscount, updateDiscount, toggleDiscount, deleteDiscount } from '../../services/discountsService';
import { SectionHeader, AddBtn, IconBtn, Th, Td, FormField, Modal, SaveBtn, ConfirmModal } from '../admin/shared';

export default function DescuentoAdmin({ discounts, setDiscounts, showToast }) {
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const blank = { code: '', type: 'porcentaje', value: 10, minOrder: 0, uses: 0, maxUses: 100, active: true, expires: '' };
  const [draft, setDraft] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [listError, setListError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const del = async (id, code) => {
    setListError('');
    setDeleting(true);
    try {
      await deleteDiscount(id);
      setDiscounts(discounts.filter(d => d.id !== id));
      setDeleteTarget(null);
      showToast(`Cupón "${code}" eliminado`);
    } catch (err) {
      setListError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const toggle = async (d) => {
    setListError('');
    try {
      const result = await toggleDiscount(d.id, !d.active);
      setDiscounts(discounts.map(x => x.id === d.id ? result : x));
      showToast(`Cupón "${d.code}" ${result.active ? 'activado' : 'desactivado'}`);
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
      const result = await updateDiscount(editing.id, editing);
      setDiscounts(discounts.map(d => d.id === editing.id ? result : d));
      setEditing(null);
      showToast(`Cupón "${result.code}" actualizado`);
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
      const result = await createDiscount(draft);
      setDiscounts([...discounts, result]);
      setAdding(false);
      setDraft(blank);
      showToast(`Cupón "${result.code}" creado`);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <SectionHeader title={`Descuentos (${discounts.length})`} action={<AddBtn onClick={() => { setFormError(''); setAdding(true); }} label="Nuevo cupón" />} />
      {listError && <p className="adm-form-error">{listError}</p>}
      <div className="adm-panel">
        <table className="adm-table">
          <thead><tr><Th>Código</Th><Th>Descuento</Th><Th>Mín. compra</Th><Th>Usos</Th><Th>Vence</Th><Th>Estado</Th><Th>Acciones</Th></tr></thead>
          <tbody>
            {discounts.map((d, i) => (
              <tr key={d.id} className={i > 0 ? 'adm-td-row' : ''}>
                <Td><code className="adm-discount-code">{d.code}</code></Td>
                <Td><span className="adm-discount-value">{d.type === 'porcentaje' ? `${d.value}%` : `$${d.value}`}</span></Td>
                <Td className="adm-text-muted">{d.minOrder > 0 ? `$${d.minOrder}` : '—'}</Td>
                <Td><span className="adm-text-muted">{d.uses}</span><span className="adm-text-border">/</span><span className="adm-text-strong">{d.maxUses}</span></Td>
                <Td className="adm-text-muted adm-text-sm">{d.expires || '—'}</Td>
                <Td>
                  <button onClick={() => toggle(d)} className={`adm-toggle ${d.active ? 'adm-toggle--on-green' : ''}`}>
                    <div className={`adm-toggle-knob ${d.active ? 'adm-toggle-knob--on' : ''}`} />
                  </button>
                </Td>
                <Td>
                  <div className="adm-actions-row">
                    <IconBtn onClick={() => { setFormError(''); setEditing({ ...d }); }} title="Editar"><svg className="icon icon-15" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></IconBtn>
                    <IconBtn onClick={() => setDeleteTarget(d)} danger title="Eliminar"><svg className="icon icon-15" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></IconBtn>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {[{ show: !!editing, item: editing, onClose: () => setEditing(null), onSave: saveEdit, title: 'Editar cupón' },
        { show: adding, item: draft, onClose: () => setAdding(false), onSave: saveAdd, title: 'Nuevo cupón' }].map(({ show, item, onClose, onSave, title: t }) =>
        show && item ? (
          <Modal key={t} title={t} onClose={onClose}>
            <form onSubmit={onSave}>
              <FormField label="Código" value={item.code} onChange={v => editing ? setEditing({ ...editing, code: v }) : setDraft({ ...draft, code: v.toUpperCase() })} placeholder="PROMO20" />
              <div className="adm-form-grid-2">
                <div className="adm-form-field">
                  <label className="adm-form-label">Tipo</label>
                  <select value={item.type} onChange={e => editing ? setEditing({ ...editing, type: e.target.value }) : setDraft({ ...draft, type: e.target.value })} className="adm-form-input">
                    <option value="porcentaje">Porcentaje (%)</option>
                    <option value="monto_fijo">Monto fijo ($)</option>
                  </select>
                </div>
                <FormField label="Valor" type="number" value={item.value} onChange={v => editing ? setEditing({ ...editing, value: Number(v) }) : setDraft({ ...draft, value: Number(v) })} />
              </div>
              <div className="adm-form-grid-2">
                <FormField label="Mín. compra ($)" type="number" value={item.minOrder} onChange={v => editing ? setEditing({ ...editing, minOrder: Number(v) }) : setDraft({ ...draft, minOrder: Number(v) })} />
                <FormField label="Usos máximos" type="number" value={item.maxUses} onChange={v => editing ? setEditing({ ...editing, maxUses: Number(v) }) : setDraft({ ...draft, maxUses: Number(v) })} />
              </div>
              <FormField label="Fecha de vencimiento" type="date" value={item.expires} onChange={v => editing ? setEditing({ ...editing, expires: v }) : setDraft({ ...draft, expires: v })} />
              {formError && <p className="adm-form-error">{formError}</p>}
              <div className="adm-form-actions">
                <button type="button" onClick={onClose} className="adm-btn-secondary">Cancelar</button>
                <SaveBtn disabled={saving} label={saving ? 'Guardando…' : (editing ? 'Guardar cambios' : 'Crear cupón')} />
              </div>
            </form>
          </Modal>
        ) : null
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Eliminar cupón"
          message={`¿Seguro que querés eliminar el cupón "${deleteTarget.code}"? Esta acción no se puede deshacer.`}
          confirming={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => del(deleteTarget.id, deleteTarget.code)}
        />
      )}
    </div>
  );
}
