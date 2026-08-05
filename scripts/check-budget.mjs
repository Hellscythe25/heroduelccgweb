/**
 * Gate de presupuesto de rendimiento (docs/DEPLOY.md §12).
 *
 * "Es un gate, no una guía": si una página se pasa, el build falla y no se
 * despliega nada. Mide sobre dist/, que es exactamente lo que recibe el usuario.
 *
 * Medicion: para cada HTML se resuelven los assets locales referenciados
 * (<script src>, <link rel=stylesheet>) más el JS/CSS embebido, y se comprime
 * cada uno con gzip. Es una aproximacion honesta a lo que sirve Apache con
 * mod_deflate; no sustituye a una medicion de campo con Lighthouse.
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, dirname, resolve, relative, sep } from 'node:path';
import { gzipSync } from 'node:zlib';

const DIST = 'dist';
const KB = 1024;

/**
 * Límites por ruta. El primero que coincide manda; `default` cierra la lista.
 * Valores en KB.
 */
const BUDGETS = [
  { name: 'deckbuilder', test: (route) => /\/deckbuilder\//.test(route), jsGzip: 120 },
  { name: 'landing', test: (route) => /^\/(es|en)\/$/.test(route), jsGzip: 30 },
  { name: 'default', test: () => true, jsGzip: 30 },
];

/** Límites globales del sitio. */
const GLOBAL = {
  cssGzipTotal: 40, // KB, suma de hojas de estilo únicas
  pageWeight: 500, // KB sin comprimir, HTML + assets referenciados
};

const SKIP_DIRS = new Set(['pagefind']);

async function* walkHtml(path) {
  for (const entry of await readdir(path, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const child = join(path, entry.name);
    if (entry.isDirectory()) yield* walkHtml(child);
    else if (entry.isFile() && entry.name.endsWith('.html')) yield child;
  }
}

/** dist/es/index.html -> /es/ */
function toRoute(file) {
  const rel = relative(DIST, file).split(sep).join('/');
  return '/' + rel.replace(/index\.html$/, '');
}

function isLocal(href) {
  return Boolean(href) && !/^([a-z]+:)?\/\//i.test(href) && !href.startsWith('data:');
}

function resolveAsset(htmlFile, href) {
  const clean = href.split(/[?#]/)[0];
  if (!clean) return null;
  const base = clean.startsWith('/') ? resolve(DIST) : resolve(dirname(htmlFile));
  const path = clean.startsWith('/') ? join(base, clean.slice(1)) : join(base, clean);
  return path;
}

const gzipCache = new Map();
const rawCache = new Map();

async function sizes(path) {
  if (gzipCache.has(path)) return { gzip: gzipCache.get(path), raw: rawCache.get(path) };
  let buffer;
  try {
    buffer = await readFile(path);
  } catch {
    return null; // asset externo o inexistente: no se contabiliza
  }
  const gzip = gzipSync(buffer, { level: 9 }).length;
  gzipCache.set(path, gzip);
  rawCache.set(path, buffer.length);
  return { gzip, raw: buffer.length };
}

function extractRefs(html) {
  const scripts = [...html.matchAll(/<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1]);
  const styles = [
    ...html.matchAll(/<link\b[^>]*\brel\s*=\s*["'](?:stylesheet|preload)["'][^>]*\bhref\s*=\s*["']([^"']+)["']/gi),
  ].map((m) => m[1]);
  const inlineScript = [...html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => m[1] ?? '')
    .join('');
  const inlineStyle = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)]
    .map((m) => m[1] ?? '')
    .join('');
  return { scripts, styles, inlineScript, inlineStyle };
}

function gz(text) {
  return text.length === 0 ? 0 : gzipSync(Buffer.from(text, 'utf8'), { level: 9 }).length;
}

const pages = [];
const cssAssets = new Set();

try {
  await stat(DIST);
} catch {
  console.error('\n  check-budget: no existe dist/. Ejecuta `npm run build` primero.\n');
  process.exit(1);
}

for await (const file of walkHtml(DIST)) {
  const html = await readFile(file, 'utf8');
  const route = toRoute(file);
  const { scripts, styles, inlineScript, inlineStyle } = extractRefs(html);

  let jsGzip = gz(inlineScript);
  let cssGzip = gz(inlineStyle);
  let raw = Buffer.byteLength(html, 'utf8');

  for (const href of scripts) {
    if (!isLocal(href)) continue;
    const asset = resolveAsset(file, href);
    const s = asset && (await sizes(asset));
    if (!s) continue;
    jsGzip += s.gzip;
    raw += s.raw;
  }

  for (const href of styles) {
    if (!isLocal(href)) continue;
    const asset = resolveAsset(file, href);
    const s = asset && (await sizes(asset));
    if (!s) continue;
    if (/\.css$/.test(asset)) cssAssets.add(asset);
    cssGzip += s.gzip;
    raw += s.raw;
  }

  const budget = BUDGETS.find((b) => b.test(route));
  pages.push({ route, jsGzip, cssGzip, raw, budget });
}

const violations = [];

for (const page of pages) {
  if (page.jsGzip > page.budget.jsGzip * KB) {
    violations.push(
      `${page.route} — JS ${(page.jsGzip / KB).toFixed(1)} KB gz supera el límite de ${page.budget.jsGzip} KB (perfil "${page.budget.name}")`,
    );
  }
  if (page.raw > GLOBAL.pageWeight * KB) {
    violations.push(
      `${page.route} — peso ${(page.raw / KB).toFixed(1)} KB supera el límite de ${GLOBAL.pageWeight} KB`,
    );
  }
}

let cssTotal = 0;
for (const asset of cssAssets) cssTotal += gzipCache.get(asset) ?? 0;
if (cssTotal > GLOBAL.cssGzipTotal * KB) {
  violations.push(
    `CSS total ${(cssTotal / KB).toFixed(1)} KB gz supera el límite de ${GLOBAL.cssGzipTotal} KB`,
  );
}

const worstJs = pages.reduce((a, b) => (b.jsGzip > (a?.jsGzip ?? -1) ? b : a), null);
console.log(
  `  check-budget: ${pages.length} páginas | JS máximo ${((worstJs?.jsGzip ?? 0) / KB).toFixed(1)} KB gz (${worstJs?.route ?? '-'}) | CSS total ${(cssTotal / KB).toFixed(1)} KB gz`,
);

if (violations.length > 0) {
  console.error('\n  Presupuesto de rendimiento excedido — despliegue bloqueado:\n');
  for (const v of violations) console.error(`   ${v}`);
  console.error('\n  Ver docs/DEPLOY.md §12 antes de subir un límite.\n');
  process.exit(1);
}
