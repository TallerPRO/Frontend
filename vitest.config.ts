/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    environment: 'jsdom',
    // Mismo origen que el dev server de Astro: el gateway solo admite ese origen por CORS.
    environmentOptions: { jsdom: { url: 'http://localhost:4321' } },
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
