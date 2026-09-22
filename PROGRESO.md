# Progreso del proyecto — TallerPro Frontend

## Estado actual
- Login con MSAL implementado y funcional en local
- Build de Astro configurado para deploy estático
- Deploy en S3 en progreso — falta configurar CloudFront para HTTPS

---

## 1. Fix de rutas 404 en Astro

**Problema:** al navegar directo a `/app/dashboard` el servidor devolvía 404.

**Causa:** `output: 'static'` solo generaba la ruta `/app` (path: undefined) en `getStaticPaths`.

**Solución:** `Frontend/src/pages/app/[...path].astro` — se listaron todas las rutas conocidas:

```js
export function getStaticPaths() {
  return [
    { params: { path: undefined } },
    { params: { path: 'dashboard' } },
    { params: { path: 'orders' } },
    { params: { path: 'orders/new' } },
    { params: { path: 'bays' } },
    { params: { path: 'catalog/services' } },
    { params: { path: 'catalog/parts' } },
    { params: { path: 'reports' } },
    { params: { path: 'audit' } },
    { params: { path: 'profile' } },
  ];
}
```

> Las rutas dinámicas como `/orders/:id` no se pueden pre-renderizar — se navega desde la lista.

---

## 2. Implementación MSAL

### Archivos creados

| Archivo | Rol |
|---|---|
| `Frontend/src/auth/authConfig.ts` | Config de MSAL (clientId, tenant, redirectUri, scopes) desde `.env` |
| `Frontend/src/auth/msalInstance.ts` | Singleton con `initializeMsal()` — secuencia obligatoria v3+: `initialize()` → `handleRedirectPromise()` |
| `Frontend/src/components/auth/AuthProvider.tsx` | Wrapper React: espera init async, expone `redirectResult` y `initError` via contexto, envuelve con `MsalProvider` |
| `Frontend/src/components/auth/LoginPage.tsx` | `AuthProvider` + `LoginCard` conectado a `loginRedirect()` |
| `Frontend/src/components/auth/CallbackPage.tsx` | `AuthProvider` + lee `redirectResult` → redirige a `/app/dashboard` o `/login` |

### Archivos modificados

- `Frontend/src/app/App.tsx` — envuelve con `AuthProvider`, guard con `useIsAuthenticated()`, pasa `userName`/`roles`/`onLogout` a `AppShell`
- `Frontend/src/pages/login.astro` — usa `<LoginPage client:only="react" />`
- `Frontend/src/pages/auth/callback.astro` — usa `<CallbackPage client:only="react" />`

### Secuencia de init MSAL (v3+)

```
new PublicClientApplication(config)
        ↓
  initialize()           ← obligatorio antes de cualquier otra llamada
        ↓
  handleRedirectPromise() ← procesa el auth code al volver de Azure
        ↓
  setReady(true) → renderiza hijos
```

### Flujo de autenticación

```
Usuario → /login → click "Iniciar sesión"
    → loginRedirect() → sale hacia Microsoft
    → Microsoft autentica → redirige a /auth/callback?code=...
    → handleRedirectPromise() procesa el código
    → redirect a /app/dashboard
```

---

## 3. Variables de entorno

### `.env` (desarrollo local)

```dotenv
PUBLIC_AZURE_CLIENT_ID=3b120135-1566-46f2-ad6e-27e8236ff15a
PUBLIC_AZURE_TENANT_ID=b65e7112-37c4-4af1-b8d3-fa26b7548826
PUBLIC_AZURE_REDIRECT_URI=http://localhost:4321/auth/callback
PUBLIC_AZURE_POST_LOGOUT_URI=http://localhost:4321/login
PUBLIC_BFF_BASE_URL=http://localhost:9000
PUBLIC_API_SCOPE=api://3b120135-1566-46f2-ad6e-27e8236ff15a/TallerPro.Access
PUBLIC_ENABLE_AUDIT=true
PUBLIC_ENABLE_REPORTS=true
```

### `.env.production` (deploy en AWS)

```dotenv
PUBLIC_AZURE_CLIENT_ID=3b120135-1566-46f2-ad6e-27e8236ff15a
PUBLIC_AZURE_TENANT_ID=b65e7112-37c4-4af1-b8d3-fa26b7548826
PUBLIC_AZURE_REDIRECT_URI=https://CLOUDFRONT_ID.cloudfront.net/auth/callback
PUBLIC_AZURE_POST_LOGOUT_URI=https://CLOUDFRONT_ID.cloudfront.net/login
PUBLIC_BFF_BASE_URL=http://TU-API-EN-AWS
PUBLIC_API_SCOPE=api://3b120135-1566-46f2-ad6e-27e8236ff15a/TallerPro.Access
PUBLIC_ENABLE_AUDIT=true
PUBLIC_ENABLE_REPORTS=true
```

> Las variables `PUBLIC_*` se incrustan en el bundle en tiempo de build — el `.env` no se sube a S3.

---

## 4. Configuración Azure AD

### App Registration: `3b120135-1566-46f2-ad6e-27e8236ff15a`
### Tenant: `b65e7112-37c4-4af1-b8d3-fa26b7548826`

**Pasos realizados:**
- Expose an API → Application ID URI: `api://3b120135-1566-46f2-ad6e-27e8236ff15a`
- Scope creado: `TallerPro.Access`
- Authentication → Single-page application → Redirect URIs configuradas

**Redirect URIs que deben estar en Azure (Authentication → SPA):**
```
http://localhost:4321/auth/callback
https://CLOUDFRONT_ID.cloudfront.net/auth/callback
```

---

## 5. Deploy en AWS — Estado actual y pasos pendientes

### S3
- Bucket: `tallerpro`
- Región: `us-east-1`
- Static Website Hosting: habilitado
- Bucket policy: pública para `s3:GetObject`
- Block public access: desactivado

### Problema actual
El S3 website hosting es solo **HTTP**. MSAL requiere HTTPS porque usa la Web Crypto API (solo disponible en contextos seguros). Esto produce el error:
```
BrowserAuthError: crypto_nonexistent
```

### Solución pendiente: CloudFront

**Pasos para crear la distribución:**

1. AWS Console → **CloudFront → Create distribution**
   - Origin domain: bucket `tallerpro` (website endpoint)
   - Default root object: `index.html`

2. **Custom error responses → Add response** (repetir para 403 y 404):
   - HTTP error code: `403` / `404`
   - Response page path: `/index.html`
   - HTTP response code: `200`

3. Esperar ~5 min → obtener URL: `https://XXXX.cloudfront.net`

4. **Actualizar Azure Portal** → Authentication → agregar:
   ```
   https://XXXX.cloudfront.net/auth/callback
   ```

5. **Actualizar `.env.production`** con la URL de CloudFront

6. **Rebuild y redeploy:**
   ```bash
   npm run build
   aws s3 sync dist/ s3://tallerpro --delete
   aws cloudfront create-invalidation --distribution-id XXXX --paths "/*"
   ```

---

## 6. Comandos útiles

```bash
# Dev local
npm run dev

# Build para producción (usa .env.production automáticamente)
npm run build

# Subir a S3
aws s3 sync dist/ s3://tallerpro --delete

# Invalidar caché de CloudFront
aws cloudfront create-invalidation --distribution-id TU_ID --paths "/*"
```
