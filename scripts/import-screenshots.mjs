/**
 * Copia al sitio las capturas del juego que se publican en la galería, ya
 * limpias y optimizadas para versionarlas en el repositorio.
 *
 *   node scripts/import-screenshots.mjs "<carpeta con es/ y en/>"
 *
 * Las capturas llegan del equipo del juego a 1920×1080 en PNG, una por idioma.
 * Mismo criterio que import-game-art.mjs: la lista de abajo es la única puerta
 * de entrada, y una captura que no esté aquí no llega a la web.
 *
 * Las capturas de prueba traen cosas que no se publican y se tapan aquí:
 * - la marca «Development Build» (y en el lobby, la versión de la build);
 * - el texto de depuración de la sala («Sala: pve_s01») en combate;
 * - los nombres de rango (dato no publicable, ver docs/MEMORIA.md);
 * - fechas de desbloqueo de logros (las fechas de la beta son internas).
 *
 * Tapar = rellenar el rectángulo interpolando los píxeles de su borde, fila a
 * fila y columna a columna. Sobre los paneles lisos de la interfaz no se nota;
 * sobre arte, queda un degradado suave. Cuando el juego entregue capturas de
 * una build de release, las máscaras de la marca sobran y se quitan.
 *
 * Usa `sharp`, que ya viene con Astro.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.error('\n  Falta `sharp`. Viene con Astro: ejecuta `npm install` primero.\n');
  process.exit(1);
}

const [sourceRoot] = process.argv.slice(2);
if (!sourceRoot) {
  console.error('Uso: node scripts/import-screenshots.mjs "<carpeta con es/ y en/>"');
  process.exit(1);
}

/** Ancho guardado: suficiente para verla a pantalla completa en un portátil. */
const WIDTH = 1600;

// Rectángulos en coordenadas de la captura original (1920×1080).
const WATERMARK = { x: 1795, y: 1052, w: 125, h: 28 };
const ROOM_LABEL = { x: 886, y: 166, w: 146, h: 27 };

/** Captura → máscaras. El orden no importa aquí; lo decide src/screenshots.ts. */
const SHOTS = {
  '01-lobby': [
    { x: 1774, y: 1049, w: 146, h: 31 }, // versión de la build + marca
    { x: 508, y: 82, w: 270, h: 30 }, // rango bajo el nombre
    { x: 56, y: 912, w: 590, h: 28 }, // rango y mazo en la tarjeta PVP
  ],
  '02b-hero-picker': [WATERMARK],
  '02-campaign-hub': [WATERMARK],
  '03a-match-opening': [WATERMARK, ROOM_LABEL],
  '04h-ability-used': [WATERMARK, ROOM_LABEL],
  '04i-spell-hit': [WATERMARK, ROOM_LABEL],
  '11-vhassa-particles': [WATERMARK, ROOM_LABEL],
  '11-yrenna-particles': [WATERMARK, ROOM_LABEL],
  '05b-victory-fx': [WATERMARK, ROOM_LABEL],
  '06-collection': [WATERMARK],
  '06f-inspect-foil': [WATERMARK],
  '14b-deck-editor': [WATERMARK],
  '19b-pack-stage-burst': [WATERMARK],
  '19e-pack-stage-hero': [WATERMARK],
  '13g-profile-achievements': [
    WATERMARK,
    { x: 48, y: 606, w: 480, h: 38 }, // fila «Rango PVP» entera
    { x: 128, y: 748, w: 280, h: 34 }, // rango en la vista previa «Así te ven»
    { x: 1430, y: 422, w: 384, h: 34 }, // fecha de desbloqueo
    { x: 1430, y: 820, w: 384, h: 34 }, // fecha de desbloqueo
  ],
};

const LANGS = ['es', 'en'];

/**
 * Rellena un rectángulo con la interpolación de su borde. Si el rectángulo toca
 * el borde de la imagen, usa solo los lados que tiene.
 */
function fillRect(data, width, height, channels, rect) {
  const x0 = Math.max(0, rect.x);
  const y0 = Math.max(0, rect.y);
  const x1 = Math.min(width, rect.x + rect.w);
  const y1 = Math.min(height, rect.y + rect.h);
  const px = (x, y, c) => data[(y * width + x) * channels + c];
  const hasTop = y0 > 0;
  const hasBottom = y1 < height;
  const hasLeft = x0 > 0;
  const hasRight = x1 < width;

  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      for (let c = 0; c < channels; c += 1) {
        let sum = 0;
        let weight = 0;
        // Peso inverso a la distancia al borde: cerca de un lado, manda ese lado.
        if (hasTop) { const w = 1 / (y - y0 + 1); sum += px(x, y0 - 1, c) * w; weight += w; }
        if (hasBottom) { const w = 1 / (y1 - y); sum += px(x, y1, c) * w; weight += w; }
        if (hasLeft) { const w = 1 / (x - x0 + 1); sum += px(x0 - 1, y, c) * w; weight += w; }
        if (hasRight) { const w = 1 / (x1 - x); sum += px(x1, y, c) * w; weight += w; }
        data[(y * width + x) * channels + c] = Math.round(sum / weight);
      }
    }
  }
}

const outRoot = join(process.cwd(), 'src', 'assets', 'screens');

for (const lang of LANGS) {
  await mkdir(join(outRoot, lang), { recursive: true });
  for (const [name, masks] of Object.entries(SHOTS)) {
    const source = join(sourceRoot, lang, `${name}.png`);
    const { data, info } = await sharp(source).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    if (info.width !== 1920 || info.height !== 1080) {
      throw new Error(`${lang}/${name}: se esperaba 1920×1080 y llegó ${info.width}×${info.height}.`);
    }
    for (const rect of masks) fillRect(data, info.width, info.height, info.channels, rect);

    const buffer = await sharp(data, { raw: info })
      .resize({ width: WIDTH })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
    await writeFile(join(outRoot, lang, `${name}.jpg`), buffer);
    console.log(`  ${lang}/${name}.png -> src/assets/screens/${lang}/${name}.jpg (${(buffer.length / 1024).toFixed(0)} KB)`);
  }
}
