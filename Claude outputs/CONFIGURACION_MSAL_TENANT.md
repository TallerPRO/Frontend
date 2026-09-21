# Guía de Configuración — MSAL y Tenant de Azure AD (TallerPro Frontend)

> Cómo dejar funcionando el login real con Azure AD en el frontend, a partir del
> estado actual del repo. Complementa `CLAUDE_FRONTEND.md` (sección 6) y
> `ARQUITECTURA_ACCESO.md` (secciones 3–5), que ya definen el diseño; esta guía
> es la checklist de ejecución.
>
> Proyecto: TallerPro · Asignatura Cloud Native · Duoc UC

---

## 1. Diagnóstico del estado actual

Revisé `Frontend/src` y esto es lo que hay hoy:

**Ya existe (solo visual, sin lógica de auth):**
- `src/components/auth/LoginCard.tsx`, `MicrosoftButton.tsx`, `AuthCallback.tsx`, `NoPermissionsScreen.tsx` — componentes de presentación, reciben `status`/`onLogin`/`onRetry` por props, no conocen MSAL.
- `src/components/auth/LoginCardDemo.tsx` — wrapper **temporal** que salta el login y navega directo a `/app/dashboard`. Está montado en `src/pages/login.astro`.
- `src/auth/roles.ts` — enum `Role` y `ROLE_PERMISSIONS` ya completos, más un helper `hasAccess()`.
- `src/stores/session.store.ts` — Zustand con un `DEMO_USER` hardcodeado (María González, `JefeTaller`).
- `src/app/App.tsx` y `src/app/routes.tsx` — routing sin ningún guard ni filtro por rol.
- `src/api/client.ts` — instancia de Axios sin interceptor de token.
- `.env.example` y `package.json` — **ya tienen** las variables `PUBLIC_AZURE_*` y las dependencias `@azure/msal-browser` (^5.21.0) y `@azure/msal-react` (^5.7.0) instaladas.

**No existe todavía (hay que crearlo):**
- `src/auth/msalConfig.ts`
- `src/auth/msalInstance.ts`
- `src/auth/AuthProvider.tsx`
- `src/auth/useAuth.ts`
- `src/auth/ProtectedRoute.tsx`
- `.env` real (solo está el `.env.example`)

En resumen: el diseño visual y el modelo de roles están listos; falta *todo* el cableado con Azure AD. Las secciones 3 y 4 son el trabajo de código; la sección 2 es lo que hay que configurar en el portal de Azure antes de que ese código funcione.

---

## 2. Configuración en el portal de Azure AD (App Registration)

Esto lo hace quien tenga acceso al tenant corporativo (Azure Portal → Microsoft Entra ID → App registrations).

### 2.1 Crear el registro de la aplicación

1. **New registration**
   - Nombre: `TallerPro Frontend` (o el que uses).
   - **Supported account types:** *Accounts in this organizational directory only* — nunca "multitenant" ni "personal Microsoft accounts". Esto es lo que impide que cuentas de otro tenant inicien sesión (ver `ARQUITECTURA_ACCESO.md` §10).
   - Redirect URI: por ahora déjalo vacío, se agrega en el paso siguiente como tipo SPA.
2. Anota **Application (client) ID** y **Directory (tenant) ID** — van a `.env`.

### 2.2 Configurar la plataforma como SPA

En **Authentication → Add a platform → Single-page application**:
- Redirect URIs:
  - `http://localhost:4321/auth/callback` (dev — el puerto es el default de Astro)
  - la URL de producción equivalente, ej. `https://app.tallerpro.cl/auth/callback`
- **Front-channel logout URL:** `.../login`
- Deja **desmarcadas** las casillas de "Access tokens" / "ID tokens" bajo "Implicit grant" — MSAL con SPA usa `authorization_code` + PKCE, no implicit flow.

> No elijas la plataforma "Web": el flujo PKCE de SPA no funciona igual y expone el `client_secret` innecesariamente (una SPA no debe tener secretos).

### 2.3 Fijar la versión del token (evita 401 sin explicación)

En **Manifest**, busca `"accessTokenAcceptedVersion"` y ponlo en `2` explícitamente (no lo dejes en `null`). Esto determina que el `iss` del token sea `https://login.microsoftonline.com/<tenant-id>/v2.0` en vez de `https://sts.windows.net/<tenant-id>/`. El backend (BFF) va a validar contra el `issuer-uri` v2, así que si esto queda mal configurado el Authorizer del API Gateway rechaza todo con `401` sin motivo aparente. Está documentado como "trampa conocida" en `ARQUITECTURA_ACCESO.md` §5.

### 2.4 Agregar el claim `roles` al ID token

En **Token configuration → Add optional claim → ID**, agrega `roles` si no aparece automáticamente al crear app roles (ver 2.6). Verifica que quede marcado para el **ID token**, no solo el access token — `useAuth.ts` lee los roles de `idTokenClaims`.

### 2.5 Exponer la API (el scope que pide el frontend)

En **Expose an API**:
- **Application ID URI:** acepta el default `api://<client-id>` (o defínelo tú).
- **Add a scope:**
  - Scope name: `TallerPro.Access`
  - Who can consent: *Admins and users* (o solo admins, según la política del taller)
  - Admin consent display name/description: algo como "Acceso a la API de TallerPro"
- En **API permissions**, agrega ese scope propio (`api://<client-id>/TallerPro.Access`) y dale **Grant admin consent** — sin esto, el primer login de cada usuario se puede quedar pidiendo consentimiento (`AADSTS65004`).

### 2.6 Definir los App Roles

En **App roles → Create app role**, uno por cada valor de `src/auth/roles.ts`:

| Display name | Value | Allowed member types |
|---|---|---|
| Administrador | `Admin` | Users/Groups |
| Jefe de Taller | `JefeTaller` | Users/Groups |
| Mecánico | `Mecanico` | Users/Groups |
| Cliente | `Cliente` | Users/Groups |
| Auditor | `Auditor` | Users/Groups |

El **Value** tiene que coincidir letra por letra con el enum `Role` (`src/auth/roles.ts`) — es lo que llega en el claim `roles` del token.

### 2.7 Asignar usuarios a los roles

Los app roles no se autoasignan. En **Microsoft Entra ID → Enterprise applications → TallerPro Frontend → Users and groups**, agrega cada usuario/grupo de prueba con el rol que le corresponda. Un usuario del tenant sin asignación se autentica igual pero llega con `roles: []` — es el caso que maneja `NoPermissionsScreen.tsx`, no un error.

---

## 3. Variables de entorno

Copia `.env.example` a `.env` en `Frontend/` y complétalo con los valores del paso 2:

```env
PUBLIC_AZURE_CLIENT_ID=<Application (client) ID del paso 2.1>
PUBLIC_AZURE_TENANT_ID=<Directory (tenant) ID del paso 2.1>
PUBLIC_AZURE_REDIRECT_URI=http://localhost:4321/auth/callback
PUBLIC_AZURE_POST_LOGOUT_URI=http://localhost:4321/login

PUBLIC_BFF_BASE_URL=http://localhost:8080
PUBLIC_API_SCOPE=api://<client-id>/TallerPro.Access

PUBLIC_ENABLE_AUDIT=true
PUBLIC_ENABLE_REPORTS=true
```

`.env` no debe subirse al repo (confirma que está en `.gitignore`).

---

## 4. Archivos a crear en el frontend

Todos van en `src/auth/`. El flujo es **redirect**, no popup (MFA por autenticador pierde el popup en varios navegadores/móviles).

### 4.1 `src/auth/msalConfig.ts`

```typescript
import type { Configuration, RedirectRequest } from '@azure/msal-browser';

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.PUBLIC_AZURE_CLIENT_ID,
    // Tenant único y explícito: NUNCA 'common' ni 'organizations'.
    authority: `https://login.microsoftonline.com/${import.meta.env.PUBLIC_AZURE_TENANT_ID}`,
    redirectUri: import.meta.env.PUBLIC_AZURE_REDIRECT_URI,
    postLogoutRedirectUri: import.meta.env.PUBLIC_AZURE_POST_LOGOUT_URI,
    navigateToLoginRequestUrl: false,
  },
  cache: {
    // sessionStorage, no localStorage: ver ARQUITECTURA_ACCESO.md §10.
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: true, // necesario para que el flujo redirect sobreviva en Safari/Edge con cookies estrictas
  },
};

export const loginRequest: RedirectRequest = {
  scopes: ['openid', 'profile', 'email', import.meta.env.PUBLIC_API_SCOPE],
  prompt: 'select_account',
};

export const apiTokenRequest = {
  scopes: [import.meta.env.PUBLIC_API_SCOPE],
};
```

### 4.2 `src/auth/msalInstance.ts`

```typescript
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from './msalConfig';

// Singleton a nivel de módulo: debe ser el mismo objeto en todo el árbol de React.
export const msalInstance = new PublicClientApplication(msalConfig);
export const msalReady = msalInstance.initialize();
```

### 4.3 `src/auth/AuthProvider.tsx`

```tsx
import { useEffect, useState } from 'react';
import { MsalProvider } from '@azure/msal-react';
import { msalInstance, msalReady } from './msalInstance';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await msalReady;
      // Se resuelve UNA sola vez, antes de renderizar nada que dependa de la cuenta.
      // Si esto no corre antes del primer render, MSAL pierde el `code` del callback.
      const result = await msalInstance.handleRedirectPromise();
      if (result?.account) {
        msalInstance.setActiveAccount(result.account);
      } else if (!msalInstance.getActiveAccount()) {
        const [first] = msalInstance.getAllAccounts();
        if (first) msalInstance.setActiveAccount(first);
      }
      setReady(true);
    })();
  }, []);

  if (!ready) return null; // o un spinner de pantalla completa

  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
}
```

### 4.4 `src/auth/useAuth.ts`

```typescript
import { useCallback, useMemo } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { loginRequest, apiTokenRequest } from './msalConfig';

export function useAuth() {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const account = accounts[0];

  const roles = useMemo<string[]>(
    () => (account?.idTokenClaims as { roles?: string[] } | undefined)?.roles ?? [],
    [account],
  );

  const user = useMemo(() => {
    if (!account) return null;
    const claims = account.idTokenClaims as
      | { name?: string; preferred_username?: string; oid?: string }
      | undefined;
    return {
      name: claims?.name ?? account.name ?? '',
      email: claims?.preferred_username ?? account.username,
      oid: claims?.oid ?? '',
    };
  }, [account]);

  const login = useCallback(() => {
    // Nunca llamar esto dentro de un useEffect sin guardia contra
    // `interaction_in_progress` — ver nota 3b de CLAUDE_FRONTEND.md.
    if (inProgress !== 'none') return;
    return instance.loginRedirect(loginRequest);
  }, [instance, inProgress]);

  const logout = useCallback(() => {
    return instance.logoutRedirect({ account });
  }, [instance, account]);

  const getToken = useCallback(async () => {
    try {
      const result = await instance.acquireTokenSilent({ ...apiTokenRequest, account });
      return result.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        await instance.acquireTokenRedirect(apiTokenRequest);
        return null; // la página va a navegar; no hay token que devolver en este ciclo
      }
      throw error;
    }
  }, [instance, account]);

  return {
    user,
    roles,
    isAuthenticated,
    isLoading: inProgress !== 'none',
    login,
    logout,
    getToken,
  };
}
```

### 4.5 `src/auth/ProtectedRoute.tsx`

```tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { hasAccess, type Section } from './roles';
import { NoPermissionsScreen } from '../components/auth/NoPermissionsScreen';

export function ProtectedRoute({
  section,
  children,
}: {
  section: Section;
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, roles, logout } = useAuth();

  if (isLoading) return null; // o Spinner
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles.length === 0) return <NoPermissionsScreen onLogout={logout} />;
  if (!hasAccess(roles, section)) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
```

---

## 5. Cablear lo anterior en el resto del frontend

Estos son los archivos existentes que hay que tocar (no reescribir desde cero):

**`src/pages/login.astro`** — reemplazar `<LoginCardDemo />` por `<LoginCard client:load onLogin={...} />` conectado a `useAuth().login`. Como este componente vive fuera del árbol de `<App />`, necesita su propio `<AuthProvider>` envolviendo un wrapper React (o mover el botón a montarse dentro del árbol de `AuthProvider`, igual que `AuthCallback`).

**`src/pages/auth/callback.astro`** — el componente `AuthCallback` debe quedar dentro de `<AuthProvider>`; cuando `handleRedirectPromise()` resuelve, redirige a `/app/dashboard` (o a `/login` con el mensaje de error correspondiente, según la tabla de errores de `CLAUDE_FRONTEND.md` §6.6).

**`src/pages/index.astro`** — hoy hace un refresh fijo a `/login`. Cambiarlo para revisar `msalInstance.getAllAccounts().length > 0` (tras `msalReady`) y mandar a `/app/dashboard` si ya hay sesión, a `/login` si no.

**`src/app/App.tsx`** — envolver el `<BrowserRouter>` con `<AuthProvider>`, y cada `<Route>` con `<ProtectedRoute section="...">` usando el `path` como pista de la sección (mapear `/orders` → `'orders'`, `/bays` → `'bays'`, etc., igual que en `ROLE_PERMISSIONS`).

**`src/app/routes.tsx`** — agregar el campo `section: Section` a cada entrada de `RouteConfig`, para que `App.tsx` no tenga que adivinarlo del `path`.

**`src/stores/session.store.ts`** — quitar `DEMO_USER`; poblar `user` desde `useAuth()` (usualmente con un `useEffect` en `App.tsx` o `AppShell.tsx` que llama `setUser(...)` cuando cambia la cuenta activa, y `setUser(null)` en `logout`).

**`src/api/client.ts`** — agregar los dos interceptors:

```typescript
import { msalInstance } from '../auth/msalInstance';
import { apiTokenRequest, loginRequest } from '../auth/msalConfig';

apiClient.interceptors.request.use(async (config) => {
  const account = msalInstance.getActiveAccount();
  if (account) {
    const { accessToken } = await msalInstance.acquireTokenSilent({ ...apiTokenRequest, account });
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      msalInstance.loginRedirect(loginRequest);
    }
    return Promise.reject(error);
  },
);
```

**`src/components/layout/Sidebar.tsx` / `Topbar.tsx`** — hoy reciben datos de muestra; conectarlos a `useAuth()` / `useSessionStore()` para mostrar nombre real, ocultar secciones sin acceso (`hasAccess`) y disparar `logout()` real desde el botón de salir.

---

## 6. Checklist de verificación

Antes de dar esto por integrado, probar en orden (mismo criterio que `ARQUITECTURA_ACCESO.md` §9, pero del lado del frontend):

- [ ] `npm run dev` sin sesión activa → `/` redirige a `/login`, un solo botón, sin campos de credenciales.
- [ ] Click en "Iniciar sesión" → redirige a Microsoft → pide MFA → vuelve a `/auth/callback` → termina en `/app/dashboard`.
- [ ] Recargar la página con sesión activa → no vuelve a pedir login.
- [ ] Un usuario del tenant sin app role asignado (ver 2.7) ve `NoPermissionsScreen`, no un dashboard vacío.
- [ ] Un usuario `Mecanico` no ve en el sidebar "Catálogo", "Reportes" ni "Auditoría", y si fuerza la URL (`/reports`) es redirigido, no ve la vista.
- [ ] `logout()` limpia `session.store` y vuelve a `/login`.
- [ ] Con el token expirado, una llamada a la API dispara `acquireTokenSilent` → si falla, `acquireTokenRedirect`, sin quedar en loop de `interaction_in_progress`.
- [ ] Revisar en las DevTools que el token esté en `sessionStorage`, nunca en `localStorage`.

Recuerda: nada de esto reemplaza la validación en el backend (`@PreAuthorize` + filtrado por `oid`, ver `ARQUITECTURA_ACCESO.md` §6–7). Lo que se arma acá es experiencia de usuario y el enganche con Azure AD; la autorización real sigue viviendo en el BFF.
