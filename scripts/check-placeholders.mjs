/**
 * Gate: ningún placeholder llega a `main` ni a producción.
 *
 * docs/DEPLOY.md §6 y §13 lo exigen explícitamente. Un `TUDOMINIO.com` vivo en
 * .htaccess redirige el sitio entero a un dominio que no controlamos.
 *
 * Los documentos (docs/, .claude/) están excluidos: citan el placeholder al
 * explicar por qué no debe usarse. Este archivo tambien: contiene los patrones
 * por definición, y auditarse a sí mismo garantizaría un falso positivo.
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, extname, resolve } from 'node:path';

const SOURCE_ROOTS = ['src', 'public', 'scripts', '.github', 'astro.config.mjs'];
const DIST = 'dist';
const SELF = resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));

/** Patrones prohibidos en el código fuente. */
const SOURCE_PATTERNS = [
  { re: /TUDOMINIO/i, hint: 'placeholder de dominio del documento original' },
  { re: /\blorem ipsum\b/i, hint: 'texto de relleno' },
  { re: /XXX-REEMPLAZAR/i, hint: 'marcador de reemplazo' },
];

/** Patrones prohibidos en el artefacto construido (dist/). */
const DIST_PATTERNS = [
  ...SOURCE_PATTERNS,
  { re: /__SITE_DOMAIN__/, hint: 'token sin sustituir — scripts/postbuild.mjs no corrio' },
];

const TEXT_EXTENSIONS = new Set([
  '.astro', '.ts', '.tsx', '.js', '.mjs', '.cjs', '.json', '.md', '.mdx',
  '.html', '.xml', '.txt', '.css', '.yml', '.yaml', '',
]);

const SKIP_DIRS = new Set(['node_modules', '.git', '.astro', 'pagefind']);

async function* walk(path) {
  let info;
  try {
    info = await stat(path);
  } catch {
    return;
  }

  if (info.isFile()) {
    yield path;
    return;
  }

  for (const entry of await readdir(path, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const child = join(path, entry.name);
    if (entry.isDirectory()) {
      yield* walk(child);
    } else if (entry.isFile()) {
      yield child;
    }
  }
}

async function scan(roots, patterns) {
  const findings = [];

  for (const root of roots) {
    for await (const file of walk(root)) {
      if (!TEXT_EXTENSIONS.has(extname(file))) continue;
      if (resolve(file) === SELF) continue;

      let content;
      try {
        content = await readFile(file, 'utf8');
      } catch {
        continue;
      }

      const lines = content.split('\n');
      for (const [index, line] of lines.entries()) {
        for (const { re, hint } of patterns) {
          if (re.test(line)) {
            findings.push({ file, line: index + 1, text: line.trim().slice(0, 120), hint });
          }
        }
      }
    }
  }

  return findings;
}

const findings = [
  ...(await scan(SOURCE_ROOTS, SOURCE_PATTERNS)),
  ...(await scan([DIST], DIST_PATTERNS)),
];

if (findings.length > 0) {
  console.error('\n  Placeholders encontrados — el despliegue queda bloqueado:\n');
  for (const f of findings) {
    console.error(`   ${f.file}:${f.line}  (${f.hint})`);
    console.error(`     ${f.text}`);
  }
  console.error('');
  process.exit(1);
}

console.log('  check-placeholders: sin placeholders.');
