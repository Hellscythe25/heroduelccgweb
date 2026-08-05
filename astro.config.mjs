// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * El dominio definitivo aún es una decisión ABIERTA (docs/DEPLOY.md §16).
 * Se inyecta por entorno para no dejar placeholders en el repositorio:
 * scripts/check-placeholders.mjs falla el build si alguno sobrevive.
 */
const SITE_URL = process.env.SITE_URL ?? 'http://localhost:4321';

export default defineConfig({
  site: SITE_URL,

  // Salida estática pura: el hosting compartido solo sirve archivos (ADR-001).
  output: 'static',

  // URLs estables y sin duplicados en el índice de Google (DEPLOY.md §4).
  build: { format: 'directory' },
  trailingSlash: 'always',

  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    routing: {
      prefixDefaultLocale: true,
      // La raíz la sirve src/pages/index.astro, que además ofrece los dos
      // idiomas de forma visible. La redirección automática chocaría con ella.
      redirectToDefaultLocale: false,
    },
  },

  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'es',
        locales: { es: 'es-ES', en: 'en-US' },
      },
    }),
  ],

  // Cero JavaScript por defecto: solo se hidrata lo que lo justifique (DEPLOY.md §12).
  vite: {
    build: {
      // Assets con hash de contenido → cacheables un año vía .htaccess.
      assetsInlineLimit: 0,
    },
  },
});
