# TallerPro — Frontend SPA

Plataforma de gestión de órdenes de servicio para una red de talleres
automotrices. Ver `CLAUDE.md` para el contexto completo de producto y la
lista de tareas por fase.

## Stack

- **Astro 7** + **React 19** (islands) — la versión instalada difiere de la
  spec original (Astro 4 / React 18); se generó el proyecto sobre lo que ya
  estaba scaffoldeado en este repo.
- **Tailwind CSS v4** vía `@tailwindcss/vite`. La spec pedía Tailwind v3 con
  `tailwind.config.mjs`, pero `@astrojs/tailwind` no soporta Astro 7. La
  paleta de colores (`brand`, `navy`, `status`, `bay`) vive en
  `src/styles/global.css` dentro de un bloque `@theme`, que es la fuente de
  verdad equivalente en v4.
- **Azure AD (MSAL)** con flujo `redirect` — ver `src/auth/`.
- **React Router** (dentro del SPA en `/app/*`), **Zustand**, **Axios**,
  **React Hook Form + Zod**, **Sonner**, **lucide-react**.

## Estructura

- `src/pages/index.astro`, `login.astro`, `auth/callback.astro` — páginas
  públicas estáticas.
- `src/pages/app/[...path].astro` — shell que monta el SPA de React
  (`src/app/App.tsx`, `BrowserRouter basename="/app"`).
- `src/auth/` — MSAL config/instancia (singleton), `AuthProvider`,
  `useAuth`, `ProtectedRoute`, roles RBAC.
- `src/components/ui/` — primitivos (`Button`, `Input`, `Select`, `Badge`,
  `Card`, `Spinner`, `Table`, `Modal`, `Pagination`, `EmptyState`).
- `src/components/layout/` — `AppShell`, `Sidebar` (adaptado a rol),
  `Topbar`, `PageHeader`.
- `src/stores/` — estado de UI del login (`auth.store.ts`) y del sidebar
  (`ui.store.ts`).

## Despliegue estático y deep-links

`output: 'static'` genera un sitio 100% estático. `/app/[...path].astro`
solo produce `dist/app/index.html`; el routing de `/app/orders`,
`/app/bays/...`, etc. lo resuelve React Router **en el cliente**. Para que
una recarga o un link directo a esas rutas funcione, el hosting debe
redirigir cualquier 404 bajo `/app/*` a `/app/index.html` (en CloudFront:
una "Custom Error Response" 403/404 → `/app/index.html`; en S3 website
hosting: `error document` = `app/index.html`).

## Integración con el backend (API Gateway)

Todo el tráfico va al **API Gateway** (`PUBLIC_BFF_BASE_URL`, `:8080`); el front
nunca llama a un microservicio por su puerto. La capa `src/api/*.ts` son
**adaptadores**: traducen el contrato real de cada microservicio (español, UUID)
al modelo que usan las vistas (`src/types/*`).

| Adaptador | Microservicio (vía gateway) | Rutas |
|---|---|---|
| `orders.api.ts` | ms-tallerpro-jobs | `/api/v1/ordenes`, `/{id}/diagnostico\|reparacion\|lista-retiro\|entrega\|anulacion\|asignacion` |
| `bays.api.ts` | ms-tallerpro-catalog | `/api/v1/talleres/{tallerId}/bahias` (+ `/resumen`, `/reserva`, `/ocupacion`, `/liberacion`) |
| `catalog.api.ts` | ms-tallerpro-catalog | `/api/v1/servicios`, `/api/v1/talleres/{tallerId}/repuestos` |
| `reports.api.ts` | ms-tallerpro-report | `/api/report/kpis`, `/kpis/dwell-time` |
| `audit.api.ts` | ms-tallerpro-audit | `/api/audit/timeline` |

Decisiones del mapeo:
- `folio` se deriva del UUID (`TP-<año>-<5 chars>`); el backend no maneja folios.
- El **timeline** de una orden se construye desde las fechas de cada estado que guarda jobs.
- La asignación de una bahía (patente, cliente, mecánico) se completa consultando la orden en jobs.
- `clienteId` (UUID que exige jobs) se deriva determinísticamente del correo del cliente (`src/lib/uuid.ts`).
- Ingresos y desempeño por mecánico no existen en el backend: las vistas muestran estado vacío.
- Los talleres (UUID ↔ nombre) se configuran en `PUBLIC_WORKSHOPS` (`src/lib/workshops.ts`) hasta que el backend exponga un maestro.

Errores (contrato §8 de `ARQUITECTURA_ACCESO.md`): `403` y `503` muestran toast; cada vista muestra `ErrorBanner` si su carga falla. Ya no hay datos de muestra (mocks).

## Variables de entorno

Copiar `.env.example` a `.env`. Para desarrollo local sin tenant basta
`PUBLIC_BFF_BASE_URL=http://localhost:8080` y `PUBLIC_WORKSHOPS` (el backend debe
correr con `TALLERPRO_JWT_ENABLED=false`). Los valores de Azure AD se completan al
integrar MSAL.

## Comandos

| Comando           | Acción                                    |
| ------------------ | ------------------------------------------ |
| `npm install`       | Instala dependencias                        |
| `npm run dev`       | Dev server en `localhost:4321`              |
| `npm run build`     | Build de producción a `./dist/`             |
| `npm run preview`   | Preview del build local                     |
| `npm test`          | Tests unitarios (vitest)                    |
| `TALLERPRO_LIVE=1 npm run test:live` | Integración real front → gateway → microservicios (backend levantado en modo local) |
