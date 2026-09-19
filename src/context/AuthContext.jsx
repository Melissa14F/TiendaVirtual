import { createContext, useContext, useState } from 'react';

// Contexto global de sesión — guarda quién está logueado (cliente o
// admin) para que cualquier componente de la app pueda leerlo sin tener
// que pasarlo como prop manualmente por todos lados.
const AuthContext = createContext(null);

const STORAGE_KEY = 'techmarket_session';

const BLANK_SESSION = { userRole: null, userId: null, userName: '', userEmail: '', isPrincipal: false, permissions: [] };

/** Guarda solo lo que ya devuelve login() (rol, id, nombre, email,
 * permisos) — nunca la contraseña ni su hash. Si localStorage no está
 * disponible (modo privado, storage bloqueado) simplemente no persiste;
 * la sesión sigue funcionando en memoria durante esa visita. */
function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...BLANK_SESSION, ...JSON.parse(raw) } : BLANK_SESSION;
  } catch {
    return BLANK_SESSION;
  }
}

function saveSession(session) {
  try {
    if (session.userRole === null) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // localStorage bloqueado — la sesión no sobrevive un recargo, pero la app sigue andando.
  }
}

// Componente que envuelve toda la app (ver main.jsx) y provee los datos
// de sesión a todos sus hijos.
export function AuthProvider({ children }) {
  // Lee la sesión guardada una sola vez, al montar — así un F5 no saca
  // al usuario que ya había iniciado sesión.
  const [session, setSession] = useState(loadSession);
  const { userRole, userId, userName, userEmail, isPrincipal, permissions } = session;

  /** `extra` only carries anything for an admin login (isPrincipal +
   * permissions) — a client login just omits it. */
  // Guarda los datos de la sesión al loguearse. "extra" solo trae algo
  // cuando el que inició sesión es un admin (isPrincipal + permissions).
  const login = (role, id, name, email, extra = {}) => {
    const next = { userRole: role, userId: id, userName: name, userEmail: email, isPrincipal: extra.isPrincipal ?? false, permissions: extra.permissions ?? [] };
    setSession(next);
    saveSession(next);
  };

  // Limpia todos los datos de sesión al cerrar sesión.
  const logout = () => {
    setSession(BLANK_SESSION);
    saveSession(BLANK_SESSION);
  };

  return (
    <AuthContext.Provider value={{ userRole, userId, userName, userEmail, isPrincipal, permissions, isLoggedIn: userRole !== null, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para leer el contexto de sesión desde cualquier componente.
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider'); // uso incorrecto: falta envolver con <AuthProvider>
  return ctx;
}
