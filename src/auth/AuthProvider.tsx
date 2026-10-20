import { useEffect, useState, type ReactNode } from 'react';
import { MsalProvider, useMsal } from '@azure/msal-react';
import {
  EventType,
  InteractionRequiredAuthError,
  type AccountInfo,
  type IPublicClientApplication,
} from '@azure/msal-browser';
import { apiRequest, azureConfigurado, getMsalInstance } from './msalConfig';
import { setSessionExpiredHandler, setTokenProvider } from '../api/client';
import { useSessionStore, type SessionUser } from '../stores/session.store';

/**
 * Conecta Azure AD con la aplicación:
 *
 *  - Inicializa MSAL y procesa la vuelta del redirect.
 *  - Traduce los claims de la cuenta al usuario de sesión (incluidos los roles,
 *    que son los App Roles asignados en el tenant).
 *  - Registra en el cliente HTTP el proveedor de token, para que cada llamada
 *    al gateway lleve su `Authorization: Bearer`.
 *
 * Si el tenant no está configurado, no monta MSAL: la aplicación queda en modo
 * demo con el rol que se elija en la pantalla de acceso.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [listo, setListo] = useState(!azureConfigurado);
  const setUser = useSessionStore((s) => s.setUser);

  useEffect(() => {
    if (!azureConfigurado) return;
    let cancelado = false;
    const msalInstance = getMsalInstance();

    msalInstance
      .initialize()
      .then(() => msalInstance.handleRedirectPromise())
      .then((resultado) => {
        // Tras el redirect, la cuenta del resultado es la recién autenticada.
        const cuenta = resultado?.account ?? msalInstance.getAllAccounts()[0];
        if (cuenta) msalInstance.setActiveAccount(cuenta);

        // La sesión se deja lista ANTES de renderizar. Si se dejara para el
        // efecto del sincronizador, ProtectedRoute vería `user = null` en el
        // primer render y mandaría al login; el login encontraría la cuenta de
        // MSAL y devolvería a /app: un ida y vuelta infinito.
        return cuenta ? usuarioDesdeCuenta(msalInstance, cuenta) : null;
      })
      .then((usuario) => {
        if (!cancelado) {
          setUser(usuario);
          setListo(true);
        }
      })
      .catch((error) => {
        console.error('[auth] no se pudo inicializar MSAL', error);
        if (!cancelado) {
          setUser(null);
          setListo(true);
        }
      });

    // Si el login ocurre en otra pestaña o se renueva la cuenta activa.
    const callbackId = msalInstance.addEventCallback((evento) => {
      if (evento.eventType === EventType.LOGIN_SUCCESS && evento.payload) {
        const cuenta = (evento.payload as { account?: AccountInfo }).account;
        if (cuenta) msalInstance.setActiveAccount(cuenta);
      }
    });

    return () => {
      cancelado = true;
      if (callbackId) msalInstance.removeEventCallback(callbackId);
    };
  }, [setUser]);

  if (!azureConfigurado) return <>{children}</>;
  if (!listo) return null; // evita parpadeos mientras se resuelve el redirect

  return (
    <MsalProvider instance={getMsalInstance()}>
      <SincronizadorDeSesion />
      {children}
    </MsalProvider>
  );
}

/**
 * Mantiene el store de sesión y el token de la API alineados con la cuenta
 * activa de MSAL. Va dentro de MsalProvider porque usa su contexto.
 */
function SincronizadorDeSesion() {
  const { instance, accounts } = useMsal();
  const setUser = useSessionStore((s) => s.setUser);

  useEffect(() => {
    const cuenta = instance.getActiveAccount() ?? accounts[0];

    if (!cuenta) {
      setUser(null);
      setTokenProvider(null);
      setSessionExpiredHandler(null);
      return;
    }

    usuarioDesdeCuenta(instance, cuenta).then((usuario) => setUser(usuario));

    // Un 401 del backend significa que el token ya no sirve: se pide uno nuevo
    // con interacción del usuario, que es la única forma de recuperarlo.
    setSessionExpiredHandler(() => {
      instance.acquireTokenRedirect({ ...apiRequest, account: cuenta }).catch((error) => {
        console.error('[auth] no se pudo relanzar la autenticacion', error);
      });
    });

    // El token se pide en cada request: MSAL lo entrega de su caché y solo
    // renueva contra Azure cuando está por expirar.
    setTokenProvider(async () => {
      try {
        const resultado = await instance.acquireTokenSilent({ ...apiRequest, account: cuenta });
        return resultado.accessToken;
      } catch (error) {
        // La sesión expiró o hace falta consentimiento: solo el usuario puede
        // resolverlo, así que se manda al login en vez de fallar en silencio.
        if (error instanceof InteractionRequiredAuthError) {
          await instance.acquireTokenRedirect({ ...apiRequest, account: cuenta });
        }
        console.error('[auth] no se pudo obtener el token', error);
        return null;
      }
    });
  }, [instance, accounts, setUser]);

  return null;
}

/** Decodifica el payload de un JWT (base64url) sin librerías externas. */
function decodificarPayload(jwt: string): Record<string, unknown> {
  const payload = jwt.split('.')[1] ?? '';
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  const json = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join(''),
  );
  return JSON.parse(json);
}

/**
 * Claims del token -> usuario de la aplicación.
 *
 * Modelo de 2 App Registrations (Portal + API): App 2 (la API) es dueña de
 * los App Roles, así que `roles` NUNCA viaja en el ID Token del Portal
 * (App 1) — solo en el Access Token emitido para la audiencia de la API.
 * Por eso hay que pedir ese token (acquireTokenSilent con apiRequest) y
 * decodificar su payload en vez de leer cuenta.idTokenClaims.roles.
 */
async function usuarioDesdeCuenta(
  instance: IPublicClientApplication,
  cuenta: AccountInfo,
): Promise<SessionUser> {
  const idClaims = (cuenta.idTokenClaims ?? {}) as {
    oid?: string;
    name?: string;
    preferred_username?: string;
    jobTitle?: string;
  };

  let roles: string[] = [];
  let oid = idClaims.oid;
  try {
    const resultado = await instance.acquireTokenSilent({ ...apiRequest, account: cuenta });
    const accessClaims = decodificarPayload(resultado.accessToken) as { roles?: string[]; oid?: string };
    roles = accessClaims.roles ?? [];
    oid = accessClaims.oid ?? oid;
  } catch (error) {
    // Sin App Roles asignados (o sin poder renovar el token en silencio) el
    // arreglo llega vacío: no es un error, es alguien de la organización que
    // no es usuario de TallerPro (lo maneja SinPermisos).
    console.error('[auth] no se pudo leer los roles del access token', error);
  }

  return {
    // `oid` y no el correo: es el identificador estable del usuario en el
    // tenant y es lo que el backend usa para el alcance de datos.
    id: oid ?? cuenta.localAccountId,
    name: idClaims.name ?? cuenta.name ?? cuenta.username,
    email: idClaims.preferred_username ?? cuenta.username,
    roles,
    jobTitle: idClaims.jobTitle,
  };
}
