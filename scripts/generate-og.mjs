/**
 * Genera la imagen OG por defecto a partir de los tokens del sistema de diseño.
 *
 * Se ejecuta A MANO, no en cada build: el resultado es un asset estable que se
 * versiona en public/og/. Regenerarlo en CI gastaría segundos en cada despliegue
 * para producir siempre el mismo archivo.
 *
 *   node scripts/generate-og.mjs
 *
 * Usa `sharp`, que ya viene con Astro para optimizar imágenes. No se declara
 * como dependencia propia porque este script no forma parte del build; si algún
 * día Astro deja de traerlo, el script avisa en vez de fallar de forma críptica.
 *
 * Por qué existe: `docs/DEPLOY.md` §13 exige que ninguna página se publique sin
 * imagen OG. Cuando alguien pega un enlace del sitio en Discord o en X, lo que
 * aparece es esto — es distribución gratis, y sin la imagen el enlace se ve como
 * spam.
 */
import { mkdir, writeFile } from 'node:fs/promises';

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.error('\n  Falta `sharp`. Viene con Astro: ejecuta `npm install` primero.\n');
  process.exit(1);
}

const WIDTH = 1200;
const HEIGHT = 630;

// Tokens copiados de src/styles/tokens.css. Se duplican a propósito: este
// script corre fuera de Vite y no puede importar CSS.
const INK_900 = '#0e0f14';
const INK_800 = '#171922';
const INK_300 = '#a8b0bf';
const GOLD_400 = '#e8b44a';

const FONT = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${INK_900}"/>
      <stop offset="100%" stop-color="${INK_800}"/>
    </linearGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <rect x="0" y="0" width="${WIDTH}" height="8" fill="${GOLD_400}"/>

  <g transform="translate(96, 214) scale(2.1)">
    <path d="M32 7 54 16v18c0 13-9 20-22 24C19 54 10 47 10 34V16Z"
          fill="none" stroke="${GOLD_400}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M24 24v16M40 24v16M24 32h16"
          fill="none" stroke="${GOLD_400}" stroke-width="4.5" stroke-linecap="round"/>
  </g>

  <text x="264" y="300" font-family="${FONT}" font-size="104" font-weight="700" fill="${GOLD_400}"
        letter-spacing="-2">Hero Duel</text>

  <text x="266" y="360" font-family="${FONT}" font-size="30" font-weight="500" fill="${INK_300}"
        letter-spacing="1">Juego de cartas coleccionables</text>

  <text x="266" y="410" font-family="${FONT}" font-size="22" font-weight="700" fill="${GOLD_400}"
        letter-spacing="4">EN BETA</text>

  <text x="96" y="574" font-family="${FONT}" font-size="24" font-weight="500" fill="${INK_300}"
        letter-spacing="1">heroduelccg.com</text>
</svg>`;

await mkdir('public/og', { recursive: true });

const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
await writeFile('public/og/default.png', png);

const { size } = await sharp(png).metadata().then(async (m) => ({ ...m, size: png.length }));
console.log(`  generate-og: public/og/default.png — ${WIDTH}x${HEIGHT}, ${(size / 1024).toFixed(1)} KB`);
