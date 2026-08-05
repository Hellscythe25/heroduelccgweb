/**
 * Esquemas de las Content Collections (API de loaders de Astro 7).
 *
 * Devlog y Noticias están separados a propósito (docs/DEPLOY.md §11.4):
 * el devlog es para la comunidad, las noticias son para prensa y parches.
 * Feeds RSS distintos, audiencias distintas.
 *
 * El frontmatter se valida en build: un post con metadatos incompletos rompe
 * el build en vez de publicarse a medias.
 *
 * El patrón `[^_]*` deja fuera los archivos que empiezan por guion bajo, que se
 * usan para documentación dentro de la carpeta (`_README.md`).
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
// Astro 7 deja de reexportar `z`: se importa de zod, que ya es dependencia
// directa por los esquemas de src/data/.
import { z } from 'zod';

const locale = z.enum(['es', 'en']);

/** Campos comunes a todo contenido editorial. */
const editorial = z.object({
  title: z.string().min(1).max(80),
  description: z.string().min(1).max(200),
  lang: locale,
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  author: z.string().min(1),
  draft: z.boolean().default(false),
  /** Slug del artículo equivalente en el otro idioma, para hreflang y paridad. */
  translationOf: z.string().optional(),
  cover: z
    .object({
      src: z.string(),
      alt: z.string().min(1, 'El texto alternativo es obligatorio.'),
    })
    .optional(),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/blog' }),
  schema: editorial.extend({
    tags: z.array(z.string()).default([]),
  }),
});

const news = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/news' }),
  schema: editorial.extend({
    category: z.enum(['patch', 'press', 'announcement']),
    /** Parche del juego al que refiere la noticia, si aplica. Ej. "0.8.3". */
    gameVersion: z
      .string()
      .regex(/^\d+\.\d+\.\d+$/, 'Usa SemVer del parche del juego, ej. 0.8.3.')
      .optional(),
  }),
});

export const collections = { blog, news };
