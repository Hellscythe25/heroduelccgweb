// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { isPressKitPublishable } from './src/press.ts';
import { isLegalPublished, legalDocs } from './src/legal.ts';
import { hasDevlogPosts } from './src/devlog.ts';
import { locales, routes } from './src/i18n/ui.ts';

/**
 * Rutas que no deben anunciarse en el sitemap.
 *
 * El kit de prensa se genera siempre para poder previsualizarlo, pero mientras
 * le falten campos obligatorios va con `noindex` y fuera del sitemap. Un sitemap
 * es una declaración pública de "estas son mis páginas": incluir una que se
 * admite a sí misma incompleta invita a que la prensa la encuentre justo cuando
 * peor está. Lo mismo vale para los legales en borrador y el devlog sin entradas.
 */
const sectionPath = (lang, key) => `/${lang}/${routes[key][lang]}/`;
const excludedPaths = [
  ...(isPressKitPublishable ? [] : locales.map((lang) => sectionPath(lang, 'presskit'))),
  ...legalDocs
    .filter((doc) => !isLegalPublished(doc))
    .flatMap((doc) => locales.map((lang) => sectionPath(lang, doc))),
  ...locales.filter((lang) => !hasDevlogPosts(lang)).map((lang) => sectionPath(lang, 'blog')),
];

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
      filter: (page) => !excludedPaths.some((path) => new URL(page).pathname === path),
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
