import { useState } from 'react';
import { createAdminUser, updateAdminUser, toggleAdminUser, deleteAdminUser } from '../../services/adminUsersService';
import { ADMIN_SECTIONS } from '../../services/authService';
import { SectionHeader, AddBtn, IconBtn, Th, Td, FormField, Modal, SaveBtn, ConfirmModal } from '../admin/shared';

const BLANK_DRAFT = { name: '', email: '', password: '', permissions: [] };

function PermissionsChecklist({ selected, onToggle }) {
  return (
    <div className="adm-form-field">
      <label className="adm-form-label">Secciones que puede gestionar</label>
      <div className="adm-permissions-grid">
        {ADMIN_SECTIONS.map(sec => (
          <label key={sec.id} className="adm-checkbox-label">
            <input type="checkbox" checked={selected.includes(sec.id)} onChange={() => onToggle(sec.id)} className="adm-checkbox" />
            {sec.label}
          </label>
        ))}
      </div>
    </div>
  );
}

export default function UsuarioAdmin({ users, setUsers, showToast }) {
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(BLANK_DRAFT);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [listError, setListError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const del = async (id, name) => {
    setListError('');
    setDeleting(true);
    try {
      await deleteAdminUser(id);
      setUsers(users.filter(u => u.id !== id));
      setDeleteTarget(null);
      showToast(`Usuario "${name}" eliminado`);
    } catch (err) {
      setListError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const toggle = async (u) => {
    setListError('');
    try {
      const result = await toggleAdminUser(u.id, !u.active);
      setUsers(users.map(x => x.id === u.id ? result : x));
      showToast(`Usuario "${u.name}" ${result.active ? 'activado' : 'desactivado'}`);
    } catch (err) {
      setListError(err.message);
    }
  };

  const toggleDraftPermission = (id) => {
    setDraft(d => ({ ...d, permissions: d.permissions.includes(id) ? d.permissions.filter(p => p !== id) : [...d.permissions, id] }));
  };

  const toggleEditingPermission = (id) => {
    setEditing(e => ({ ...e, permissions: e.permissions.includes(id) ? e.permissions.filter(p => p !== id) : [...e.permissions, id] }));
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setFormError('');
    try {
      const result = await updateAdminUser(editing.id, editing);
      setUsers(users.map(u => u.id === editing.id ? result : u));
      setEditing(null);
      showToast(`Usuario "${result.name}" actualizado`);
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
      const result = await createAdminUser(draft);
      setUsers([...users, result]);
      setAdding(false);
      setDraft(BLANK_DRAFT);
      showToast(`Usuario "${result.name}" creado`);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <SectionHeader title={`Usuarios (${users.length})`} action={<AddBtn onClick={() => { setFormError(''); setAdding(true); }} label="Nuevo usuario" />} />
      <p className="adm-form-hint">Solo el administrador principal puede crear cuentas y gestionar sus permisos.</p>
      {listError && <p className="adm-form-error">{listError}</p>}
      <div className="adm-panel">
        <table className="adm-table">
          <thead><tr><Th>Nombre</Th><Th>Correo</Th><Th>Rol</Th><Th>Activo</Th><Th>Acciones</Th></tr></thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id} className={i > 0 ? 'adm-td-row' : ''}>
                <Td><span className="adm-text-strong">{u.name}</span></Td>
                <Td className="adm-text-muted">{u.email}</Td>
                <Td>{u.isPrincipal ? <span className="adm-badge-principal">Principal</span> : <span className="adm-text-muted">Administrador</span>}</Td>
                <Td>
                  <button onClick={() => toggle(u)} disabled={u.isPrincipal} className={`adm-toggle ${u.active ? 'adm-toggle--on' : ''}`}>
                    <div className={`adm-toggle-knob ${u.active ? 'adm-toggle-knob--on' : ''}`} />
                  </button>
                </Td>
                <Td>
                  <div className="adm-actions-row">
                    <IconBtn onClick={() => { setFormError(''); setEditing({ ...u }); }} title="Editar"><svg className="icon icon-15" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></IconBtn>
                    {!u.isPrincipal && (
                      <IconBtn onClick={() => setDeleteTarget(u)} danger title="Eliminar"><svg className="icon icon-15" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></IconBtn>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title="Editar usuario" onClose={() => setEditing(null)}>
          <form onSubmit={saveEdit}>
            <FormField label="Nombre" value={editing.name} onChange={v => setEditing({ ...editing, name: v })} />
            <FormField label="Correo electrónico" type="email" value={editing.email} onChange={v => setEditing({ ...editing, email: v })} />
            {editing.isPrincipal ? (
              <p className="adm-form-hint">Es el administrador principal — siempre tiene acceso a todas las secciones, no se le pueden restringir permisos.</p>
            ) : (
              <PermissionsChecklist selected={editing.permissions} onToggle={toggleEditingPermission} />
            )}
            {formError && <p className="adm-form-error">{formError}</p>}
            <div className="adm-form-actions">
              <button type="button" onClick={() => setEditing(null)} className="adm-btn-secondary">Cancelar</button>
              <SaveBtn disabled={saving} label={saving ? 'Guardando…' : 'Guardar cambios'} />
            </div>
          </form>
        </Modal>
      )}
      {adding && (
        <Modal title="Nuevo usuario" onClose={() => setAdding(false)}>
          <form onSubmit={saveAdd}>
            <FormField label="Nombre" value={draft.name} onChange={v => setDraft({ ...draft, name: v })} />
            <FormField label="Correo electrónico" type="email" value={draft.email} onChange={v => setDraft({ ...draft, email: v })} />
            <FormField label="Contraseña" type="password" value={draft.password} onChange={v => setDraft({ ...draft, password: v })} placeholder="Mín. 8 caracteres" />
            <PermissionsChecklist selected={draft.permissions} onToggle={toggleDraftPermission} />
            {formError && <p className="adm-form-error">{formError}</p>}
            <div className="adm-form-actions">
              <button type="button" onClick={() => setAdding(false)} className="adm-btn-secondary">Cancelar</button>
              <SaveBtn disabled={saving} label={saving ? 'Creando…' : 'Crear usuario'} />
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Eliminar usuario"
          message={`¿Seguro que querés eliminar a "${deleteTarget.name}"? Esta acción no se puede deshacer.`}
          confirming={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => del(deleteTarget.id, deleteTarget.name)}
        />
      )}
    </div>
  );
}
