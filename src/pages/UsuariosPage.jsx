import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getAdminUsers } from '../services/adminUsersService';
import UsuarioAdmin from '../components/usuario/UsuarioAdmin';

// Página de administración de cuentas admin (ruta /admin/usuarios).
// Solo accesible para el admin principal — AdminShell ya bloquea esta
// ruta para cualquier otro admin antes de que este componente se monte.
export default function UsuariosPage() {
  const { showToast } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getAdminUsers()
      .then(data => { if (!cancelled) setUsers(data); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [retryKey]);

  const retry = useCallback(() => setRetryKey(k => k + 1), []);

  if (loading) return <div className="adm-status">Cargando usuarios…</div>;
  if (error) return (
    <div className="adm-status adm-status--error">
      No se pudieron cargar los usuarios: {error}
      <button onClick={retry} className="adm-retry-btn">Reintentar</button>
    </div>
  );
  return <UsuarioAdmin users={users} setUsers={setUsers} showToast={showToast} />;
}
