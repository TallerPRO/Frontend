import { useMsal } from '@azure/msal-react';
import { azureConfigurado, getMsalInstance, loginRequest } from './msalConfig';
import { hasAccess, type Section } from './roles';
import { useSessionStore } from '../stores/session.store';
import { setTokenProvider } from '../api/client';

/**
 * Sesión y permisos del usuario actual.
 *
 * Los roles vienen del claim `roles` del token (App Roles de Azure AD). Todo lo
 * que decide esta capa es **qué se muestra**: la autorización real la aplica
 * cada microservicio con sus `@PreAuthorize`, y responde 403 aunque la UI
 * hubiera dejado pasar.
 */
export function useAuth() {
  const user = useSessionStore((s) => s.user);
  const setUser = useSessionStore((s) => s.setUser);
  const roles = user?.roles ?? [];

  async function login() {
    if (!azureConfigurado) return;
    await getMsalInstance().loginRedirect(loginRequest);
  }

  async function logout() {
    if (!azureConfigurado) {
      // Modo demo: basta con limpiar la sesión local.
      setUser(null);
      setTokenProvider(null);
      window.location.assign('/login');
      return;
    }
    const cuenta = getMsalInstance().getActiveAccount();
    await getMsalInstance().logoutRedirect({ account: cuenta ?? undefined });
  }

  return {
    user,
    roles,
    autenticado: !!user,
    /** ¿Tiene algún rol asignado en TallerPro? Estar en el tenant no basta. */
    tienePermisos: roles.length > 0,
    /** ¿Puede ver esta sección? (menú y rutas) */
    puedeVer: (seccion: Section) => hasAccess(roles, seccion),
    /** ¿Tiene alguno de estos roles? Para ocultar acciones puntuales. */
    tieneRol: (...requeridos: string[]) => requeridos.some((r) => roles.includes(r)),
    login,
    logout,
    azureConfigurado,
  };
}
