// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * Dominio canónico de producción, decidido el 2026-08-04 (ADR-003).
 * Es información pública, no un secreto: vive en el repositorio.
 *
 * `SITE_URL` lo sobrescribe para staging y para pruebas. El mismo valor
 * alimenta las canónicas, el sitemap y la redirección de .htaccess, que
 * scripts/postbuild.mjs inyecta tras el build.
 */
const SITE_URL = process.env.SITE_URL ?? 'https://heroduelccg.com';

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
