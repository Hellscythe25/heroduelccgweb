/**
 * Devlog (src/content/blog/): cada entrada vive en la carpeta de su idioma,
 * su traducción existe, y los enlaces internos llevan a páginas del sitio.
 *
 * El frontmatter completo lo valida Zod en el build; aquí va lo que el esquema
 * no ve porque cruza archivos.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { feedPath, postPath, postSlug } from '~/devlog';
import { locales, localizedPath, routes, type Lang, type RouteKey } from '~/i18n/ui';

const DIR = join(process.cwd(), 'src', 'content', 'blog');

interface Post {
  folder: Lang;
  slug: string;
  lang: string | undefined;
  translationOf: string | undefined;
  body: string;
}

const posts: Post[] = locales.flatMap((folder) => {
  if (!existsSync(join(DIR, folder))) return [];
  return readdirSync(join(DIR, folder))
    .filter((file) => /\.mdx?$/.test(file) && !file.startsWith('_'))
    .map((file) => {
      const text = readFileSync(join(DIR, folder, file), 'utf8');
      const front = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)?.[1] ?? '';
      return {
        folder,
        slug: file.replace(/\.mdx?$/, ''),
        lang: /^lang:\s*['"]?(\w+)/m.exec(front)?.[1],
        translationOf: /^translationOf:\s*['"]?([^'"\s]+)/m.exec(front)?.[1],
        body: text.slice(text.indexOf('---', 3) + 3),
      };
    });
});

describe('devlog', () => {
  it('las entradas solo viven en una carpeta de idioma', () => {
    const loose = readdirSync(DIR).filter((file) => /\.mdx?$/.test(file) && !file.startsWith('_'));
    expect(loose).toEqual([]);
  });

  it('cada entrada declara el idioma de su carpeta', () => {
    for (const post of posts) expect(post.lang, `${post.folder}/${post.slug}`).toBe(post.folder);
  });

  it('el nombre del archivo es un slug en kebab-case, sin fecha', () => {
    for (const post of posts) {
      expect(post.slug, post.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(post.slug, post.slug).not.toMatch(/^\d{4}-\d{2}/);
    }
  });

  it('translationOf apunta a una entrada del otro idioma', () => {
    for (const post of posts.filter((item) => item.translationOf)) {
      const target = posts.find((other) => other.slug === post.translationOf && other.folder !== post.folder);
      expect(target, `${post.folder}/${post.slug} → ${post.translationOf}`).toBeDefined();
    }
  });

  it('ninguna entrada tiene dos traducciones al mismo idioma', () => {
    for (const post of posts) {
      const pairs = posts.filter(
        (other) =>
          other.folder !== post.folder &&
          (other.translationOf === post.slug || post.translationOf === other.slug),
      );
      for (const lang of locales) {
        expect(pairs.filter((other) => other.folder === lang).length, `${post.slug} → ${lang}`).toBeLessThanOrEqual(1);
      }
    }
  });

  it('los enlaces internos llevan a una sección o a una entrada que existe', () => {
    const known = new Set([
      ...locales.flatMap((lang) => (Object.keys(routes) as RouteKey[]).map((key) => localizedPath(lang, key))),
      ...posts.map((post) => postPath(post.folder, post.slug)),
    ]);
    for (const post of posts) {
      const links = [...post.body.matchAll(/\]\((\/[^)\s#]*)/g)].map((match) => match[1]);
      for (const link of links) expect(known.has(link!), `${post.slug}: ${link}`).toBe(true);
    }
  });

  it('el nombre interno del proyecto no aparece', () => {
    for (const post of posts) expect(post.body, post.slug).not.toMatch(/tcgmaster/i);
  });

  it('las rutas del devlog salen de la tabla routes', () => {
    expect(postSlug('es/empieza-la-beta-cerrada')).toBe('empieza-la-beta-cerrada');
    expect(postPath('en', 'closed-beta-begins')).toBe(`/en/${routes.blog.en}/closed-beta-begins/`);
    expect(feedPath('es')).toBe(`/es/${routes.blog.es}/rss.xml`);
  });
});
