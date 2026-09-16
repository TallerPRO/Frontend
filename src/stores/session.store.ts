import { create } from 'zustand';
import { Role } from '../auth/roles';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
  workshopName?: string;
  jobTitle?: string;
}

interface SessionState {
  user: SessionUser | null;
  setUser: (user: SessionUser | null) => void;
}

// Usuario de muestra hasta que se integre MSAL: quien conecte el login llama
// a setUser() con la cuenta real (claims del ID token) y a setUser(null) en logout.
const DEMO_USER: SessionUser = {
  id: 'demo',
  name: 'María González',
  email: 'maria.gonzalez@tallerpro.cl',
  roles: [Role.JEFE_TALLER],
  workshopName: 'Providencia',
  jobTitle: 'Jefa de taller',
};

export const useSessionStore = create<SessionState>()((set) => ({
  user: DEMO_USER,
  setUser: (user) => set({ user }),
}));
