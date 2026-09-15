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

## Variables de entorno

Copiar `.env.example` a `.env` y completar los valores de Azure AD y del
BFF antes de correr `npm run dev`.

## Comandos

| Comando           | Acción                                    |
| ------------------ | ------------------------------------------ |
| `npm install`       | Instala dependencias                        |
| `npm run dev`       | Dev server en `localhost:4321`              |
| `npm run build`     | Build de producción a `./dist/`             |
| `npm run preview`   | Preview del build local                     |
