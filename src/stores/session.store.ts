import { create } from 'zustand';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  /** App Roles del tenant (claim `roles`). Vacío = sin permisos en TallerPro. */
  roles: string[];
  workshopName?: string;
  jobTitle?: string;
}

interface SessionState {
  user: SessionUser | null;
  setUser: (user: SessionUser | null) => void;
}

// Con Azure configurado, quien llena esto es AuthProvider a partir del token.
// En modo demo lo llena la pantalla de acceso con el rol elegido, y se guarda
// en sessionStorage para que sobreviva a un F5 sin sobrevivir al cierre de la
// pestaña (mismo criterio que la caché de MSAL).
const CLAVE_DEMO = 'tallerpro.demo.user';

function usuarioGuardado(): SessionUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const crudo = window.sessionStorage.getItem(CLAVE_DEMO);
    return crudo ? (JSON.parse(crudo) as SessionUser) : null;
  } catch {
    return null;
  }
}

function guardar(user: SessionUser | null) {
  if (typeof window === 'undefined') return;
  try {
    if (user) window.sessionStorage.setItem(CLAVE_DEMO, JSON.stringify(user));
    else window.sessionStorage.removeItem(CLAVE_DEMO);
  } catch {
    // Modo privado o storage bloqueado: la sesión dura lo que dure la página.
  }
}

export const useSessionStore = create<SessionState>()((set) => ({
  user: usuarioGuardado(),
  setUser: (user) => {
    guardar(user);
    set({ user });
  },
}));
