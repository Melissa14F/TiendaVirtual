import { useState } from 'react';
import { createCategory, updateCategory, toggleCategory, deleteCategory } from '../../services/categoriesService';
import { SectionHeader, AddBtn, IconBtn, Th, Td, FormField, Modal, SaveBtn, ConfirmModal } from '../admin/shared';

export default function CategoriaAdmin({ categories, setCategories, showToast }) {
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [listError, setListError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const del = async (id, name) => {
    setListError('');
    setDeleting(true);
    try {
      await deleteCategory(id);
      setCategories(categories.filter(c => c.id !== id));
      setDeleteTarget(null);
      showToast(`Categoría "${name}" eliminada`);
    } catch (err) {
      setListError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  // count is derived (products per category), not a real MockAPI field —
  // updateCategory/createCategory don't recompute it, so it's kept from
  // local state rather than overwritten with the service's raw response.
  const toggle = async (cat) => {
    setListError('');
    try {
      const result = await toggleCategory(cat.id, !cat.active);
      setCategories(categories.map(c => c.id === cat.id ? { ...c, active: result.active } : c));
      showToast(`Categoría "${cat.name}" ${result.active ? 'activada' : 'desactivada'}`);
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
      const result = await updateCategory(editing.id, editing);
      setCategories(categories.map(c => c.id === editing.id ? { ...c, name: result.name, description: result.description, active: result.active } : c));
      setEditing(null);
      showToast(`Categoría "${result.name}" actualizada`);
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
      const result = await createCategory(draft);
      setCategories([...categories, result]);
      setAdding(false);
      setDraft({ name: '', description: '' });
      showToast(`Categoría "${result.name}" creada`);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <SectionHeader title={`Categorías (${categories.length})`} action={<AddBtn onClick={() => { setFormError(''); setAdding(true); }} label="Nueva categoría" />} />
      {listError && <p className="adm-form-error">{listError}</p>}
      <div className="adm-panel">
        <table className="adm-table">
          <thead><tr><Th>Nombre</Th><Th>Descripción</Th><Th>Productos</Th><Th>Activa</Th><Th>Acciones</Th></tr></thead>
          <tbody>
            {categories.map((cat, i) => (
              <tr key={cat.id} className={i > 0 ? 'adm-td-row' : ''}>
                <Td><span className="adm-text-strong">{cat.name}</span></Td>
                <Td className="adm-text-muted">{cat.description || '—'}</Td>
                <Td>{cat.count}</Td>
                <Td>
                  <button onClick={() => toggle(cat)} className={`adm-toggle ${cat.active ? 'adm-toggle--on' : ''}`}>
                    <div className={`adm-toggle-knob ${cat.active ? 'adm-toggle-knob--on' : ''}`} />
                  </button>
                </Td>
                <Td>
                  <div className="adm-actions-row">
                    <IconBtn onClick={() => { setFormError(''); setEditing({ ...cat }); }} title="Editar"><svg className="icon icon-15" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></IconBtn>
                    <IconBtn onClick={() => setDeleteTarget(cat)} danger title="Eliminar"><svg className="icon icon-15" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></IconBtn>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title="Editar categoría" onClose={() => setEditing(null)}>
          <form onSubmit={saveEdit}>
            <FormField label="Nombre" value={editing.name} onChange={v => setEditing({ ...editing, name: v })} />
            <FormField label="Descripción" value={editing.description} onChange={v => setEditing({ ...editing, description: v })} />
            {formError && <p className="adm-form-error">{formError}</p>}
            <div className="adm-form-actions">
              <button type="button" onClick={() => setEditing(null)} className="adm-btn-secondary">Cancelar</button>
              <SaveBtn disabled={saving} label={saving ? 'Guardando…' : 'Guardar cambios'} />
            </div>
          </form>
        </Modal>
      )}
      {adding && (
        <Modal title="Nueva categoría" onClose={() => setAdding(false)}>
          <form onSubmit={saveAdd}>
            <FormField label="Nombre" value={draft.name} onChange={v => setDraft({ ...draft, name: v })} />
            <FormField label="Descripción" value={draft.description} onChange={v => setDraft({ ...draft, description: v })} />
            {formError && <p className="adm-form-error">{formError}</p>}
            <div className="adm-form-actions">
              <button type="button" onClick={() => setAdding(false)} className="adm-btn-secondary">Cancelar</button>
              <SaveBtn disabled={saving} label={saving ? 'Creando…' : 'Crear categoría'} />
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Eliminar categoría"
          message={`¿Seguro que querés eliminar "${deleteTarget.name}"? Esta acción no se puede deshacer.`}
          confirming={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => del(deleteTarget.id, deleteTarget.name)}
        />
      )}
    </div>
  );
}
