/**
 * Feed RSS 2.0 del devlog, uno por idioma: /es/devlog/rss.xml.
 *
 * Se escribe a mano en lugar de usar @astrojs/rss: son veinte líneas de XML y
 * no justifican una dependencia más. Un idioma sin entradas publicadas no
 * tiene feed, igual que no tiene enlace en el menú.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { postPath, postSlug } from '~/devlog';
import { locales, localeTags, localizedPath, routes, useTranslations, type Lang } from '~/i18n/ui';

export const getStaticPaths = (async () => {
  const posts = await getCollection('blog', (entry) => !entry.data.draft);
  return locales
    .filter((lang) => posts.some((post) => post.data.lang === lang))
    .map((lang) => ({ params: { lang, section: routes.blog[lang] }, props: { lang } }));
}) satisfies GetStaticPaths;

const escape = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: APIRoute = async ({ props, site }) => {
  const lang = props.lang as Lang;
  const t = useTranslations(lang);
  // `site` siempre está definido (astro.config.mjs); sin él, un feed con URLs relativas no sirve.
  if (!site) throw new Error('El feed RSS necesita `site` en astro.config.mjs.');
  const absolute = (path: string) => new URL(path, site).href;

  const posts = (await getCollection('blog', (entry) => entry.data.lang === lang && !entry.data.draft)).sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime(),
  );

  const items = posts
    .map((post) => {
      const link = absolute(postPath(lang, postSlug(post.id)));
      return [
        '    <item>',
        `      <title>${escape(post.data.title)}</title>`,
        `      <link>${link}</link>`,
        `      <guid isPermaLink="true">${link}</guid>`,
        `      <pubDate>${post.data.publishedAt.toUTCString()}</pubDate>`,
        `      <description>${escape(post.data.description)}</description>`,
        '    </item>',
      ].join('\n');
    })
    .join('\n');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    '  <channel>',
    `    <title>${escape(`${t('devlog.title')} — ${t('site.name')}`)}</title>`,
    `    <link>${absolute(localizedPath(lang, 'blog'))}</link>`,
    `    <description>${escape(t('devlog.intro'))}</description>`,
    `    <language>${localeTags[lang]}</language>`,
    items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');

  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
