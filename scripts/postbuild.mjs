/**
 * Postbuild: sustituye el dominio canónico en los artefactos de dist/ y
 * endurece el entorno de staging.
 *
 * Por qué existe: el dominio definitivo sigue ABIERTO (docs/DEPLOY.md §16) y la
 * regla del proyecto prohibe placeholders en `main`. La solucion es una única
 * fuente de verdad (SITE_URL) inyectada en build, más un gate que verifica que
 * ningún token sobrevive (scripts/check-placeholders.mjs).
 */
import { readFile, writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';

const DIST = 'dist';
const TOKEN = '__SITE_DOMAIN__';

/** Archivos de texto de dist/ que pueden contener el token. */
const TARGETS = ['.htaccess', 'robots.txt'];

const NOINDEX_BLOCK = `

# --- Staging: bloqueo de indexación (docs/DEPLOY.md §8) ---
# Un staging indexado canibaliza el SEO del dominio real.
<IfModule mod_headers.c>
  Header always set X-Robots-Tag "noindex, nofollow, noarchive"
</IfModule>
`;

const STAGING_ROBOTS = `User-agent: *
Disallow: /
`;

function fail(message) {
  console.error(`\n  postbuild: ${message}\n`);
  process.exit(1);
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/** Dominio de producción. Decidido el 2026-08-04; no es un secreto ni un placeholder. */
const PRODUCTION_URL = 'https://heroduelccg.com';

const siteUrl = process.env.SITE_URL;
const deployEnv = process.env.DEPLOY_ENV ?? 'local';

// Staging jamás hereda el dominio de producción por omisión: si lo hiciera,
// generaría canónicas y redirecciones apuntando al sitio real desde una copia
// que no debe ser indexada.
if (!siteUrl && deployEnv === 'staging') {
  fail('SITE_URL no está definida y DEPLOY_ENV=staging. Staging necesita su propio dominio.');
}

let host;
try {
  host = new URL(siteUrl ?? PRODUCTION_URL).host;
} catch {
  fail(`SITE_URL no es una URL válida: ${siteUrl}`);
}

if (!(await exists(DIST))) {
  fail(`no existe ${DIST}/. Ejecuta \`astro build\` primero.`);
}

let replacements = 0;

for (const name of TARGETS) {
  const path = join(DIST, name);
  if (!(await exists(path))) {
    console.warn(`  postbuild: ${path} no existe, se omite.`);
    continue;
  }

  let content = await readFile(path, 'utf8');
  const before = content;
  content = content.replaceAll(TOKEN, host);
  if (content !== before) replacements += 1;

  if (deployEnv === 'staging') {
    if (name === '.htaccess') content += NOINDEX_BLOCK;
    if (name === 'robots.txt') content = STAGING_ROBOTS;
  }

  await writeFile(path, content, 'utf8');
}

console.log(
  `  postbuild: dominio=${host} entorno=${deployEnv} archivos_reescritos=${replacements}`,
);
