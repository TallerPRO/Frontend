# syntax=docker/dockerfile:1
# Frontend TallerPro (Astro, output: 'static') -> imagen nginx sin root.
#
# Las variables PUBLIC_* se resuelven AL COMPILAR (Astro/Vite las incrustan en el JS),
# por eso llegan como build args desde Backend/docker-compose.prod.yml. Son publicas por
# diseno (client id de la SPA, tenant, scope): nunca pasar secretos por aqui.
# El .env / .env.production locales NO entran al contexto (ver .dockerignore).

# --- Etapa 1: build ---
# Node 24: misma version con la que se genero package-lock.json (engines: >=22.12).
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
# --legacy-peer-deps: el lockfile arrastra un conflicto de peers SOLO de herramientas de lint
# (eslint-plugin-react@7 no declara soporte para eslint@10). No afecta al build ni al runtime.
# Pendiente: actualizar eslint-plugin-react (o bajar eslint a 9) y quitar este flag.
RUN npm ci --no-audit --no-fund --legacy-peer-deps
COPY . .
ARG PUBLIC_AZURE_CLIENT_ID
ARG PUBLIC_AZURE_TENANT_ID
ARG PUBLIC_AZURE_REDIRECT_URI
ARG PUBLIC_AZURE_POST_LOGOUT_URI
ARG PUBLIC_BFF_BASE_URL
ARG PUBLIC_API_SCOPE
ARG PUBLIC_WORKSHOPS
ARG PUBLIC_ENABLE_AUDIT=true
ARG PUBLIC_ENABLE_REPORTS=true
ENV PUBLIC_AZURE_CLIENT_ID=$PUBLIC_AZURE_CLIENT_ID \
    PUBLIC_AZURE_TENANT_ID=$PUBLIC_AZURE_TENANT_ID \
    PUBLIC_AZURE_REDIRECT_URI=$PUBLIC_AZURE_REDIRECT_URI \
    PUBLIC_AZURE_POST_LOGOUT_URI=$PUBLIC_AZURE_POST_LOGOUT_URI \
    PUBLIC_BFF_BASE_URL=$PUBLIC_BFF_BASE_URL \
    PUBLIC_API_SCOPE=$PUBLIC_API_SCOPE \
    PUBLIC_WORKSHOPS=$PUBLIC_WORKSHOPS \
    PUBLIC_ENABLE_AUDIT=$PUBLIC_ENABLE_AUDIT \
    PUBLIC_ENABLE_REPORTS=$PUBLIC_ENABLE_REPORTS
RUN npm run build

# --- Etapa 2: runtime (nginx sin privilegios, escucha en 8080) ---
FROM nginxinc/nginx-unprivileged:1.28-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
