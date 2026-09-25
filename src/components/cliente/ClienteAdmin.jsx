import { useState } from 'react';
import { createCliente, updateCliente, toggleCliente, deleteCliente } from '../../services/clienteService';
import { SectionHeader, AddBtn, IconBtn, Th, Td, FormField, Modal, SaveBtn, ConfirmModal } from '../admin/shared';

const BLANK_DRAFT = { name: '', lastName: '', email: '', password: '' };

export default function ClienteAdmin({ clientes, setClientes, showToast }) {
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(BLANK_DRAFT);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [listError, setListError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = clientes.filter(c =>
    `${c.name} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const del = async (id, name) => {
    setListError('');
    setDeleting(true);
    try {
      await deleteCliente(id);
      setClientes(clientes.filter(c => c.id !== id));
      setDeleteTarget(null);
      showToast(`Cliente "${name}" eliminado`);
    } catch (err) {
      setListError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const toggle = async (c) => {
    setListError('');
    try {
      const result = await toggleCliente(c.id, !c.active);
      setClientes(clientes.map(x => x.id === c.id ? result : x));
      showToast(`Cliente "${c.name}" ${result.active ? 'activado' : 'desactivado'}`);
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
      const result = await updateCliente(editing.id, editing);
      setClientes(clientes.map(c => c.id === editing.id ? result : c));
      setEditing(null);
      showToast(`Cliente "${result.name}" actualizado`);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const saveAdd = async (e) => {
    e.preventDefault();
    if (draft.password.length < 8) {
      setFormError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const result = await createCliente(draft);
      setClientes([...clientes, result]);
      setAdding(false);
      setDraft(BLANK_DRAFT);
      showToast(`Cliente "${result.name}" creado`);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <SectionHeader title={`Clientes (${clientes.length})`} action={<AddBtn onClick={() => { setFormError(''); setAdding(true); }} label="Nuevo cliente" />} />
      {listError && <p className="adm-form-error">{listError}</p>}

      {/* Search */}
      <div className="adm-search-wrap">
        <svg className="adm-search-icon icon icon-14 icon-sw-2_5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar clientes..." className="adm-search-input" />
      </div>

      <div className="adm-panel">
        <table className="adm-table">
          <thead><tr><Th>Nombre</Th><Th>Correo</Th><Th>Teléfono</Th><Th>Dirección</Th><Th>Activo</Th><Th>Acciones</Th></tr></thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={c.id} className={i > 0 ? 'adm-td-row' : ''}>
                <Td><span className="adm-text-strong">{c.name} {c.lastName}</span></Td>
                <Td className="adm-text-muted">{c.email}</Td>
                <Td className="adm-text-muted">{c.phone || '—'}</Td>
                <Td className="adm-text-muted">{c.address || '—'}</Td>
                <Td>
                  <button onClick={() => toggle(c)} className={`adm-toggle ${c.active ? 'adm-toggle--on' : ''}`}>
                    <div className={`adm-toggle-knob ${c.active ? 'adm-toggle-knob--on' : ''}`} />
                  </button>
                </Td>
                <Td>
                  <div className="adm-actions-row">
                    <IconBtn onClick={() => { setFormError(''); setEditing({ ...c }); }} title="Editar"><svg className="icon icon-15" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></IconBtn>
                    <IconBtn onClick={() => setDeleteTarget(c)} danger title="Eliminar"><svg className="icon icon-15" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></IconBtn>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title="Editar cliente" onClose={() => setEditing(null)}>
          <form onSubmit={saveEdit}>
            <div className="adm-form-grid-2">
              <FormField label="Nombre" value={editing.name} onChange={v => setEditing({ ...editing, name: v })} />
              <FormField label="Apellido" value={editing.lastName} onChange={v => setEditing({ ...editing, lastName: v })} />
            </div>
            <FormField label="Correo electrónico" type="email" value={editing.email} onChange={v => setEditing({ ...editing, email: v })} />
            <FormField label="Teléfono" value={editing.phone} onChange={v => setEditing({ ...editing, phone: v })} />
            <FormField label="Dirección" value={editing.address} onChange={v => setEditing({ ...editing, address: v })} />
            <FormField label="Código postal" value={editing.postalCode} onChange={v => setEditing({ ...editing, postalCode: v })} />
            {formError && <p className="adm-form-error">{formError}</p>}
            <div className="adm-form-actions">
              <button type="button" onClick={() => setEditing(null)} className="adm-btn-secondary">Cancelar</button>
              <SaveBtn disabled={saving} label={saving ? 'Guardando…' : 'Guardar cambios'} />
            </div>
          </form>
        </Modal>
      )}
      {adding && (
        <Modal title="Nuevo cliente" onClose={() => setAdding(false)}>
          <form onSubmit={saveAdd}>
            <div className="adm-form-grid-2">
              <FormField label="Nombre" value={draft.name} onChange={v => setDraft({ ...draft, name: v })} />
              <FormField label="Apellido" value={draft.lastName} onChange={v => setDraft({ ...draft, lastName: v })} />
            </div>
            <FormField label="Correo electrónico" type="email" value={draft.email} onChange={v => setDraft({ ...draft, email: v })} />
            <FormField label="Contraseña" type="password" value={draft.password} onChange={v => setDraft({ ...draft, password: v })} placeholder="Mín. 8 caracteres" />
            <p className="adm-form-hint">Teléfono, dirección y código postal los puede completar el cliente después desde su perfil.</p>
            {formError && <p className="adm-form-error">{formError}</p>}
            <div className="adm-form-actions">
              <button type="button" onClick={() => setAdding(false)} className="adm-btn-secondary">Cancelar</button>
              <SaveBtn disabled={saving} label={saving ? 'Creando…' : 'Crear cliente'} />
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Eliminar cliente"
          message={`¿Seguro que querés eliminar a "${deleteTarget.name} ${deleteTarget.lastName}"? Esta acción no se puede deshacer.`}
          confirming={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => del(deleteTarget.id, `${deleteTarget.name} ${deleteTarget.lastName}`)}
        />
      )}
    </div>
  );
}
