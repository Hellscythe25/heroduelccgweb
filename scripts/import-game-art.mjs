/**
 * Copia al sitio las ilustraciones del juego que se publican (decisión del
 * dueño del 2026-10-31), optimizadas para versionarlas en el repositorio.
 *
 *   node scripts/import-game-art.mjs "<ruta al juego>/Assets"
 *
 * Mismo criterio que import-game-data.mjs (ADR-005): el repositorio del juego
 * es de solo lectura y la lista de abajo es la única puerta de entrada. Una
 * pieza que no esté aquí no llega a la web.
 *
 * Los originales pesan hasta 2 MB (PNG de 1024 px). Aquí se guardan como JPG
 * de calidad alta a su tamaño útil máximo; Astro genera después AVIF y WebP en
 * varios anchos (astro:assets). Las imágenes con transparencia real se guardan
 * como PNG para no perderla.
 *
 * Usa `sharp`, que ya viene con Astro.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.error('\n  Falta `sharp`. Viene con Astro: ejecuta `npm install` primero.\n');
  process.exit(1);
}

const [assetsRoot] = process.argv.slice(2);
if (!assetsRoot) {
  console.error('Uso: node scripts/import-game-art.mjs "<ruta al juego>/Assets"');
  process.exit(1);
}

/** Origen dentro de Assets/ → destino dentro de src/assets/art/, con ancho máximo. */
const PIECES = [
  // Retratos de héroe (los que usa el juego hoy).
  { from: 'Sprites/Brakka.png', to: 'heroes/brakka.jpg', width: 1024 },
  { from: 'Sprites/Sable.png', to: 'heroes/sable.jpg', width: 1024 },
  { from: 'Sprites/Yrenna.png', to: 'heroes/yrenna.jpg', width: 1024 },
  { from: 'Art/Identity/shouny.jpg', to: 'heroes/shouny.jpg', width: 1024 },
  { from: 'Art/Identity/krunk.jpg', to: 'heroes/krunk.jpg', width: 1024 },
  // Arenas de cada héroe.
  { from: 'Art/Screens/arena_brakka.jpg', to: 'arenas/brakka.jpg', width: 1536 },
  { from: 'Art/Screens/arena_sable.jpg', to: 'arenas/sable.jpg', width: 1536 },
  { from: 'Art/Screens/arena_yrenna.jpg', to: 'arenas/yrenna.jpg', width: 1536 },
  { from: 'Art/Screens/arena_shouny.jpg', to: 'arenas/shouny.jpg', width: 1536 },
  { from: 'Art/Screens/arena_krunk.jpg', to: 'arenas/krunk.jpg', width: 1536 },
  // Escenas para cabeceras de página.
  { from: 'Sprites/PVPBanner.png', to: 'scenes/duel.jpg', width: 1344 },
  { from: 'Art/Screens/combat_board.jpg', to: 'scenes/board.jpg', width: 1536 },
  { from: 'Art/Screens/campaign_core.jpg', to: 'scenes/campaign.jpg', width: 1536 },
  // Una ilustración de carta por tipo, para los marcos de "Cartas y colección".
  { from: 'Art/Cards/n01.jpg', to: 'cards/instant.jpg', width: 800 },
  { from: 'Art/Cards/h1_01.jpg', to: 'cards/weapon.jpg', width: 800 },
  { from: 'Art/Cards/h2_01.jpg', to: 'cards/armor.jpg', width: 800 },
  { from: 'Art/Cards/n12.jpg', to: 'cards/trinket.jpg', width: 800 },
  // Iconos de las tres monedas.
  { from: 'Art/Identity/currency_coin.png', to: 'currency/coins.png', width: 256 },
  { from: 'Art/Identity/currency_essence.png', to: 'currency/essence.png', width: 256 },
  { from: 'Art/Identity/currency_gem.png', to: 'currency/gems.png', width: 256 },
  // Emblema del juego.
  { from: 'Sprites/Logo.png', to: 'brand/emblem.png', width: 512 },
];

const outRoot = new URL('../src/assets/art/', import.meta.url);

for (const piece of PIECES) {
  const source = join(assetsRoot, piece.from);
  const image = sharp(source).resize({ width: piece.width, withoutEnlargement: true });
  const target = new URL(piece.to, outRoot);
  await mkdir(dirname(target.pathname.replace(/^\/([A-Za-z]:)/, '$1')), { recursive: true });

  const buffer = piece.to.endsWith('.png')
    ? await image.png({ compressionLevel: 9, palette: false }).toBuffer()
    : await image.flatten({ background: '#0b0c10' }).jpeg({ quality: 84, mozjpeg: true }).toBuffer();

  await writeFile(target, buffer);
  console.log(`  ${piece.from} -> src/assets/art/${piece.to} (${(buffer.length / 1024).toFixed(0)} KB)`);
}
