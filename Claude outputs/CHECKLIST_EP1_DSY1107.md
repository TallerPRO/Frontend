# Checklist EP1 · DSY1107 Desarrollo Cloud Native I — Sistema Pedidos360 / TallerPro

> Basado en `EP1_DSY1107_Estudiante_encargo.pdf` y `EP1_DSY1107_Estudiante_presentación.pdf`.
> Cruzado con el estado real del proyecto TallerPro (`ARQUITECTURA_ACCESO.md`, `CLAUDE_FRONTEND.md`,
> `CONFIGURACION_MSAL_TENANT.md` y el código revisado en `Frontend/src`).

**Ponderación general:** Encargo 40% (parejas) + Presentación 60% (individual) = 100% de la Evaluación Parcial N°1.

---

## 0. Alertas antes de seguir avanzando

Estas dos cosas conviene resolverlas **antes** de invertir más horas, porque cambian el trabajo pendiente:

### ⚠️ Alerta 1 — Angular vs. Astro + React

El encargo dice textualmente en "Aspectos formales": *"el frontend debe ser un componente Angular"*. El proyecto TallerPro actual (`CLAUDE_FRONTEND.md`) está construido en **Astro 4 + React 18 (islands)**, no Angular. El flujo MSAL, los conceptos de guards/interceptors y la lógica de roles se trasladan igual de un framework a otro, pero:
- Si la pauta se aplica de forma literal, un frontend que no es Angular puede perder puntos en "aspectos formales", aunque el indicador de MSAL en sí se cumpla.
- Antes de avanzar, confirma con el docente si el nombre "Angular" en la pauta es una plantilla genérica (reutilizada de otro grupo/sección) o un requisito real para tu curso. Si es real, se debe re-scaffoldear el frontend en Angular con `@azure/msal-angular`.

### ⚠️ Alerta 2 — Auto-registro de usuarios en el tenant

La rúbrica de Presentación pide: *"los usuarios puedan crear sus cuentas en el tenant y luego iniciar sesión"* (indicador de 10%). Esto es **auto-registro (self-service sign-up)**, algo que un tenant corporativo estándar de Microsoft Entra ID no ofrece por defecto — ahí los usuarios los crea un admin. `ARQUITECTURA_ACCESO.md` está diseñado sobre ese segundo modelo (admin asigna app roles, no hay pantalla de "crear cuenta"; de hecho `CLAUDE_FRONTEND.md` §6.1 dice explícitamente "no implementes botón de Registrarse").

Hay que decidir uno de estos caminos y dejarlo explícito antes de la presentación:
1. **Habilitar "self-service sign-up" en Entra ID** (User flows → sign-up) para el tenant, aunque contradiga el diseño de acceso corporativo documentado.
2. **Usar Azure AD External ID / CIAM** en vez de un tenant de fuerza de trabajo, que sí está pensado para que usuarios externos se autorregistren.
3. **Documentar y defender ante el docente** que, dado que TallerPro es una app corporativa (colaboradores del taller, no clientes anónimos), el flujo correcto es la asignación por admin, y mostrar esa asignación como evidencia equivalente.

Cualquiera que elijas, queda registrado como decisión en la Tarea #2 del apartado 3.

---

## 1. Checklist del Encargo (40% — código, en parejas)

### 1.1 Requisitos generales de entrega

- [ ] Backend: varios microservicios en Java + Spring Boot, cada uno compila sin errores.
- [ ] Backend responde a pruebas básicas (unitarias o de integración mínimas).
- [ ] Backend con buenas prácticas (capas repository/service/controller, DTOs, manejo de excepciones).
- [ ] Integración con base de datos cloud: entidades, repositorios y `application.yml`/`.properties` de conexión correctamente configurados.
- [ ] Backend incluye **filtros que validan el JWT** recibido desde el IDaaS (Azure AD) para autorizar peticiones.
- [ ] Frontend completo, modular, sin errores de compilación, con vistas funcionales.
- [ ] Frontend implementa el **flujo de login con el IDaaS** y usa el JWT en las llamadas al backend.
- [ ] `.gitignore` configurado en ambos repos (frontend y cada microservicio) — nada de `node_modules/`, `target/`, `.env`, credenciales.
- [ ] Repos de GitHub separados (o carpetas claramente diferenciadas) para frontend y backend, con enlaces listos para copiar a AVA.
- [ ] Copia del/los enlace(s) enviada al correo del docente dentro del plazo.

### 1.2 Indicador — MSAL configurado y operativo (60% del Encargo)

| Nivel | Qué exige |
|---|---|
| 100% | MSAL integrado y operativo; login/logout funcionan; guards y `MsalInterceptor` sin fallas; se obtienen todos los tokens necesarios para el API Gateway; se leen roles y scopes desde los claims. |
| 80% | Flujo funciona y el sistema consume el API Gateway; detalles menores en guards o lectura parcial de roles. |
| 60% | Autentica pero con fallas intermitentes: a veces no adjunta el token o no lo renueva bien. |
| 30% | El login se muestra pero el token no se adjunta en las llamadas, o configuración incorrecta del IDaaS. |
| 0% | No integra MSAL o no autentica. |

Estado actual del repo (revisado en esta sesión):

- [ ] `msalConfig.ts` / `msalInstance.ts` — **no existen aún** (ver Tarea #4).
- [ ] `AuthProvider` que resuelve `handleRedirectPromise()` antes de renderizar — **no existe**.
- [ ] `useAuth` (o el equivalente `MsalInterceptor` + guard si migran a Angular) — **no existe**.
- [ ] `ProtectedRoute` / guard por rol — **no existe**; hoy `routes.tsx` no tiene guards.
- [ ] `session.store.ts` usa un `DEMO_USER` hardcodeado — hay que reemplazarlo por la cuenta real de MSAL.
- [ ] `login.astro` monta `LoginCardDemo`, que **salta el login real** y navega directo al dashboard — hay que reemplazarlo por `LoginCard` conectado a `useAuth().login()`.
- [ ] Lectura de roles/scopes desde los claims del token — pendiente, depende de lo anterior.

→ Guía de ejecución completa: `CONFIGURACION_MSAL_TENANT.md` (ya en el proyecto).

### 1.3 Indicador — BFF valida el JWT contra el IDaaS (40% del Encargo)

| Nivel | Qué exige |
|---|---|
| 100% | Valida issuer y audience, verifica firma y vigencia, aplica autorización por rol, responde con códigos de error adecuados. |
| 80% | Validación consistente y funcional, error menor en autorización o en mensajes de error. |
| 60% | Valida en la mayoría de los endpoints; algunas rutas no verifican `exp` o `aud`. |
| 30% | Solo revisa presencia del token, no firma ni claims. |
| 0% | No valida JWT o permite acceso sin autenticación. |

Estado: no se revisó el repo de backend en esta sesión (no está conectado a este entorno). `ARQUITECTURA_ACCESO.md` ya define el diseño correcto (Spring Security resource server, `issuer-uri` y `audiences` en `application.yml`, `JwtAuthenticationConverter` mapeando `roles` → `ROLE_*`, `@PreAuthorize` por endpoint). Falta confirmar que el código real lo implementa así — Tarea #5.

- [ ] `spring.security.oauth2.resourceserver.jwt.issuer-uri` apunta al tenant correcto (v2, con `accessTokenAcceptedVersion=2`).
- [ ] `audiences` configurado con `api://<client-id>`.
- [ ] `JwtAuthenticationConverter` mapea el claim `roles` a `ROLE_*`.
- [ ] `@PreAuthorize` en endpoints sensibles (cancelar reserva, reportes, auditoría, etc.).
- [ ] El taller/alcance de datos se deriva del `oid` del token, nunca de un parámetro del request (ver antipatrón en `ARQUITECTURA_ACCESO.md` §7).
- [ ] Pruebas curl/Postman de 401 (sin token), 403 (rol insuficiente) y 200/204 (caso válido) — ver los ejemplos de `ARQUITECTURA_ACCESO.md` §9.

---

## 2. Checklist de la Presentación (60% — individual, 5–10 min)

### 2.1 Elementos que la presentación debe mostrar (guion mínimo)

- [ ] Instancia de **API Manager** (API Gateway) creada y en funcionamiento en la plataforma cloud.
- [ ] Configuración del API Manager que permite llamar a los endpoints del backend.
- [ ] El frontend consumiendo los endpoints **a través del** API Manager (no directo al backend).
- [ ] El API Manager **validando JWT**: una petición sin token o con token inválido rechazada, y una válida aceptada.
- [ ] Tenant en el IDaaS creado, con usuarios registrados visibles.
- [ ] El frontend usando **OAuth 2.0 / OpenID Connect** para iniciar sesión y obtener un JWT válido.
- [ ] Backend y frontend desplegados, activos e integrados en la nube (no en local).

### 2.2 Indicadores de la rúbrica (ponderación dentro del 60% de Presentación)

| # | Indicador | % | Estado / qué falta |
|---|---|---|---|
| 1 | Rutas del API Manager hacia todos los endpoints del backend | 13% | Pendiente — crear API Gateway y mapear cada endpoint de `CLAUDE_FRONTEND.md` §10 (orders, bays, catalog, reports, audit). |
| 2 | CORS configurado en el API Manager | 7% | Pendiente — permitir solo el/los origen(es) del frontend desplegado, métodos y headers necesarios (incluyendo `Authorization`). |
| 3 | Tenant IDaaS creado con soporte a los servicios usados | 10% | Pendiente — sección 2 de `CONFIGURACION_MSAL_TENANT.md`; incluye la decisión de la Alerta 2. |
| 4 | Aplicación (App Registration) creada y configurada en el tenant | 10% | Pendiente — clientId, redirect URIs, roles y scopes, según sección 2.2–2.6 de `CONFIGURACION_MSAL_TENANT.md`. |
| 5 | Flujo de usuario: crear cuenta + iniciar sesión + tokens con claims esperados | 10% | Pendiente y depende de la Alerta 2 (self-service sign-up vs. asignación admin). |
| 6 | Flujo OIDC "Authorization Code con PKCE" | 15% | Se obtiene "gratis" al usar `loginRedirect`/`acquireTokenRedirect` de MSAL (ya es Auth Code + PKCE por defecto) — se resuelve al completar la Tarea #4, pero **hay que poder explicarlo** en la presentación (code verifier/challenge, state, nonce). |
| 7 | Todas las rutas del API Manager validan JWT (issuer/audience, 200/401/403) | 20% | Pendiente — mismo Authorizer de AWS API Gateway (JWT Authorizer nativo o Lambda authorizer) validando contra el tenant de Azure AD. |
| 8 | Evidencia del funcionamiento de cada ruta (con y sin token, JSON esperado) | 15% | Pendiente — capturas o demo en vivo con Postman/curl, replicando la tabla de pruebas de `ARQUITECTURA_ACCESO.md` §9. |

*(Los porcentajes suman 100% de la nota de Presentación, que a su vez pesa 60% de la Evaluación Parcial N°1.)*

### 2.3 Aspectos formales de la presentación

- [ ] Duración entre 5 y 10 minutos.
- [ ] Discurso con orden e hilo conductor, usando lenguaje técnico correcto (JWT, issuer, audience, PKCE, Authorizer, claims, etc.).
- [ ] Cada estudiante fundamenta el diseño y las tecnologías elegidas (aunque el desarrollo del encargo sea en pareja, la presentación es individual).

---

## 3. Lista de tareas (orden sugerido)

1. **Resolver el conflicto Angular vs. Astro+React con el docente/equipo** — antes de seguir, porque decide si hay que re-scaffoldear el frontend.
2. **Definir la estrategia de tenant** (self-service sign-up vs. asignación por admin) — decide cómo se configura el paso 3 y el indicador 2.2/5.
3. **Crear/configurar el tenant de Azure AD y el App Registration** (App roles, redirect URIs, scope `TallerPro.Access`, consentimiento de admin, usuarios de prueba).
4. **Implementar MSAL en el frontend** siguiendo `CONFIGURACION_MSAL_TENANT.md` (o su equivalente Angular si aplica la Alerta 1): `msalConfig`, `msalInstance`, `AuthProvider`, `useAuth`/guard, `ProtectedRoute`, y cablear `login`, `callback`, `index`, `App`, `routes`, `session.store`, `api/client`.
5. **Verificar el estado real del backend** (BFF y microservicios): confirmar si ya implementan la validación JWT de `ARQUITECTURA_ACCESO.md` §6 y si están desplegados en EC2.
6. **Crear y configurar AWS API Gateway**: rutas hacia cada microservicio, CORS, y el Authorizer JWT (issuer/audience del tenant), probando 200/401/403.
7. **Preparar la evidencia y el guion de la presentación**: capturas o demo en vivo de cada uno de los 7 elementos del punto 2.1, ensayada dentro de los 5–10 minutos.

Estas 7 tareas quedaron registradas en el gestor de tareas de esta sesión para que puedan marcarse como completadas a medida que avancen.
