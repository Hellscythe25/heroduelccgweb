/**
 * ¿Hay entradas publicadas en el devlog para un idioma?
 *
 * La página del devlog existe siempre, pero mientras no tenga entradas va con
 * `noindex`, fuera del sitemap y fuera del menú: un enlace a una sección vacía
 * se lee como sitio abandonado.
 *
 * Lee los archivos directamente y no la Content Collection porque
 * astro.config.mjs también lo necesita para el sitemap, y allí no hay
 * `astro:content`. Mismo criterio que el loader de src/content.config.ts: se
 * ignoran los archivos que empiezan por guion bajo.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Lang } from './i18n/ui';

const BLOG_DIR = join(process.cwd(), 'src', 'content', 'blog');

function frontmatter(source: string): string {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
  return match?.[1] ?? '';
}

export function hasDevlogPosts(lang: Lang): boolean {
  let files: string[];
  try {
    files = readdirSync(BLOG_DIR, { recursive: true, encoding: 'utf8' });
  } catch {
    return false;
  }

  return files
    .filter((file) => /\.mdx?$/.test(file) && !file.split(/[\\/]/).pop()!.startsWith('_'))
    .some((file) => {
      const data = frontmatter(readFileSync(join(BLOG_DIR, file), 'utf8'));
      const isLang = new RegExp(`^lang:\\s*['"]?${lang}['"]?\\s*$`, 'm').test(data);
      const isDraft = /^draft:\s*true\s*$/m.test(data);
      return isLang && !isDraft;
    });
}
