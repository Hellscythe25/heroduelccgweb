/**
 * Genera la imagen OG por defecto: el emblema y el título a la izquierda, y la
 * alineación de los cinco héroes a la derecha, como en la portada.
 *
 * Se ejecuta A MANO, no en cada build: el resultado es un asset estable que se
 * versiona en public/og/. Regenerarlo en CI gastaría segundos en cada despliegue
 * para producir siempre el mismo archivo.
 *
 *   node scripts/generate-og.mjs
 *
 * Lee el arte de src/assets/art/ (scripts/import-game-art.mjs). Usa `sharp`,
 * que ya viene con Astro.
 *
 * Por qué existe: `docs/DEPLOY.md` §13 exige que ninguna página se publique sin
 * imagen OG. Cuando alguien pega un enlace del sitio en Discord o en X, lo que
 * aparece es esto — es distribución gratis, y sin la imagen el enlace se ve como
 * spam.
 */
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.error('\n  Falta `sharp`. Viene con Astro: ejecuta `npm install` primero.\n');
  process.exit(1);
}

const WIDTH = 1200;
const HEIGHT = 630;

// Tokens copiados de src/styles/tokens.css (Forja Oscura). Se duplican a
// propósito: este script corre fuera de Vite y no puede importar CSS.
const INK_950 = '#0b0c10';
const INK_300 = '#a3a8b5';
const GOLD_400 = '#e0b357';
const HERO_COLORS = {
  brakka: '#e08b57',
  sable: '#9aa0ad',
  yrenna: '#b45fd0',
  shouny: '#4a7edb',
  krunk: '#c97a3f',
};

// El título usa Cinzel si está instalada en la máquina que genera la imagen
// (librsvg no carga woff2); si no, cae a una serif del sistema.
const FONT = "'Space Grotesk', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
const DISPLAY_FONT = "Cinzel, 'Trajan Pro', Georgia, 'Times New Roman', serif";

// ---- Alineación de héroes: franjas verticales en la mitad derecha ----
const LINEUP_X = 560;
// Los héroes salen de los datos, no de la lista de colores: uno nuevo entra en
// la imagen en cuanto tiene retrato, y usa el oro de la marca si aún no tiene
// color propio.
const { heroes } = JSON.parse(await readFile('src/data/heroes.json', 'utf8'));
const heroIds = heroes.map((hero) => hero.id).filter((id) => existsSync(`src/assets/art/heroes/${id}.jpg`));
const sliceWidth = Math.ceil((WIDTH - LINEUP_X) / heroIds.length);

const slices = await Promise.all(
  heroIds.map(async (id, index) => ({
    input: await sharp(`src/assets/art/heroes/${id}.jpg`)
      .resize(sliceWidth, HEIGHT, { fit: 'cover', position: 'north' })
      .modulate({ brightness: 0.85 })
      .toBuffer(),
    left: LINEUP_X + index * sliceWidth,
    top: 0,
  })),
);

// Velo, filos de color por héroe y textos, en una sola capa SVG.
const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <defs>
    <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${INK_950}" stop-opacity="1"/>
      <stop offset="0.47" stop-color="${INK_950}" stop-opacity="1"/>
      <stop offset="0.6" stop-color="${INK_950}" stop-opacity="0.15"/>
      <stop offset="1" stop-color="${INK_950}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.6" stop-color="${INK_950}" stop-opacity="0"/>
      <stop offset="1" stop-color="${INK_950}" stop-opacity="0.85"/>
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#floor)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#fade)"/>
  ${heroIds
    .map(
      (id, index) =>
        `<rect x="${LINEUP_X + index * sliceWidth}" y="${HEIGHT - 6}" width="${sliceWidth}" height="6" fill="${HERO_COLORS[id] ?? GOLD_400}"/>`,
    )
    .join('\n  ')}
  <rect x="0" y="0" width="${WIDTH}" height="6" fill="${GOLD_400}"/>

  <text x="72" y="330" font-family="${DISPLAY_FONT}" font-size="76" font-weight="700" fill="${GOLD_400}">Hero Duel</text>
  <text x="72" y="410" font-family="${DISPLAY_FONT}" font-size="76" font-weight="700" fill="${GOLD_400}">CCG</text>
  <text x="74" y="462" font-family="${FONT}" font-size="26" fill="${INK_300}">Duelos de héroes, cartas y decisiones</text>
  <text x="74" y="560" font-family="${FONT}" font-size="22" fill="${INK_300}">heroduelccg.com</text>
</svg>`;

// El emblema trae su propio fondo casi negro: una máscara radial lo funde con
// el carbón de la imagen en vez de dejar ver un recuadro.
const EMBLEM = 170;
const emblemMask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${EMBLEM}" height="${EMBLEM}">
  <defs><radialGradient id="m"><stop offset="0.62" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
  <rect width="100%" height="100%" fill="url(#m)"/>
</svg>`);
const emblem = await sharp('src/assets/art/brand/emblem.png')
  .resize(EMBLEM, EMBLEM, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .composite([{ input: emblemMask, blend: 'dest-in' }])
  .png()
  .toBuffer();

await mkdir('public/og', { recursive: true });

const png = await sharp({ create: { width: WIDTH, height: HEIGHT, channels: 3, background: INK_950 } })
  .composite([...slices, { input: Buffer.from(overlay), left: 0, top: 0 }, { input: emblem, left: 56, top: 96 }])
  .png({ compressionLevel: 9, palette: true, quality: 90 })
  .toBuffer();
await writeFile('public/og/default.png', png);

console.log(`  generate-og: public/og/default.png — ${WIDTH}x${HEIGHT}, ${(png.length / 1024).toFixed(1)} KB`);
