// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// En dev, Astro solo conoce la ruta /app declarada en getStaticPaths; todo
// /app/* devolvería 404. Este plugin reescribe esas URLs a /app para que
// React Router resuelva la ruta en el cliente, replicando el fallback que
// en producción hace el hosting (ver README, "Despliegue estático").
/** @type {import('vite').Plugin} */
const spaFallback = {
  name: 'tallerpro-spa-fallback',
  enforce: 'pre',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      const url = req.url ?? '';
      const isAppRoute = url.startsWith('/app/') && !url.startsWith('/app/_') && !/\.\w+(\?|$)/.test(url);
      if (isAppRoute && req.headers.accept?.includes('text/html')) req.url = '/app';
      next();
    });
  },
};

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  output: 'static',
  vite: {
    plugins: [tailwindcss(), spaFallback],
  },
});
