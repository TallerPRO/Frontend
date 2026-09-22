import { useEffect, useState } from 'react';
import { LoginCard, type LoginStatus } from './LoginCard';
import { Select } from '../ui/Select';
import { Role } from '../../auth/roles';
import { azureConfigurado, getMsalInstance, loginRequest } from '../../auth/msalConfig';
import { useSessionStore } from '../../stores/session.store';

const ROLES_DEMO = [
  { value: Role.ADMIN, label: 'Administrador', nombre: 'Ana Dominguez' },
  { value: Role.JEFE_TALLER, label: 'Jefe de taller', nombre: 'María González' },
  { value: Role.MECANICO, label: 'Mecánico', nombre: 'Pedro Soto' },
  { value: Role.AUDITOR, label: 'Auditor', nombre: 'Carla Ruiz' },
  { value: Role.CLIENTE, label: 'Cliente', nombre: 'Juan Pérez' },
];

/**
 * Pantalla de acceso.
 *
 * Con el tenant configurado hace el `loginRedirect` real y los roles salen del
 * token. Sin tenant (variables en "pendiente") entra en modo demo con un rol
 * elegible, que permite ver y probar el control de acceso sin Azure.
 */
export function LoginCardDemo() {
  const setUser = useSessionStore((s) => s.setUser);
  const [rol, setRol] = useState<string>(Role.JEFE_TALLER);
  const [estado, setEstado] = useState<LoginStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  /**
   * Si ya hay sesión, esta pantalla no tiene nada que hacer.
   *
   * Hace falta porque MSAL, al terminar el redirect, vuelve a la página que
   * inició el login (esta) en vez de quedarse en /auth/callback. Sin esta
   * comprobación el usuario se autentica bien pero ve el botón de nuevo, como
   * si no hubiera pasado nada.
   */
  useEffect(() => {
    if (!azureConfigurado) return;

    (async () => {
      try {
        const msal = getMsalInstance();
        await msal.initialize();
        const resultado = await msal.handleRedirectPromise();
        const cuenta = resultado?.account ?? msal.getAllAccounts()[0];
        if (cuenta) {
          msal.setActiveAccount(cuenta);
          window.location.assign('/app/dashboard');
        }
      } catch (e) {
        setEstado('error');
        setError(e instanceof Error ? e.message : 'No pudimos completar el inicio de sesión.');
      }
    })();
  }, []);

  async function entrar() {
    if (azureConfigurado) {
      // Con try/catch: si MSAL rechaza (redirect URI mal registrado, falta de
      // consentimiento…), el usuario tiene que ver el motivo y no un botón
      // que aparentemente no hace nada.
      setEstado('redirecting');
      setError(null);
      try {
        const msalInstance = getMsalInstance();
        await msalInstance.initialize();
        // Se resuelve cualquier redirect pendiente antes de pedir otro: MSAL
        // rechaza un login nuevo si cree que hay una interacción en curso.
        await msalInstance.handleRedirectPromise();
        await msalInstance.loginRedirect(loginRequest);
      } catch (e) {
        setEstado('error');
        setError(e instanceof Error ? e.message : 'No pudimos contactar a Microsoft.');
      }
      return;
    }

    const elegido = ROLES_DEMO.find((r) => r.value === rol)!;
    setUser({
      id: `demo-${rol.toLowerCase()}`,
      name: elegido.nombre,
      email: `${rol.toLowerCase()}@tallerpro.cl`,
      roles: [rol],
      workshopName: 'Taller Central',
      jobTitle: elegido.label,
    });
    window.location.assign('/app/dashboard');
  }

  return (
    <LoginCard onLogin={entrar} status={estado} errorMessage={error}>
      {!azureConfigurado && (
        <div className="mt-6 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
          <p className="mb-2 text-xs text-yellow-200">
            El tenant de Azure aún no está configurado. Entra en modo demostración eligiendo un rol
            para ver qué permite cada uno.
          </p>
          <Select
            aria-label="Rol de demostración"
            options={ROLES_DEMO.map((r) => ({ value: r.value, label: r.label }))}
            value={rol}
            onChange={(e) => setRol(e.target.value)}
          />
        </div>
      )}
    </LoginCard>
  );
}
