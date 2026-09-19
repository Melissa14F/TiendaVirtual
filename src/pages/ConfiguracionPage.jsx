import { useOutletContext } from 'react-router-dom';
import SettingsPanel from '../components/admin/SettingsPanel';

// Página de configuración de la cuenta del propio admin logueado (ruta
// /admin/configuracion): cambiar su contraseña.
export default function ConfiguracionPage() {
  const { adminId, showToast } = useOutletContext();
  return <SettingsPanel adminId={adminId} showToast={showToast} />;
}
