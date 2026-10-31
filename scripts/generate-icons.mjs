/**
 * Genera los favicons a partir del emblema del juego
 * (src/assets/art/brand/emblem.png, importado con import-game-art.mjs).
 *
 *   node scripts/generate-icons.mjs
 *
 * Se ejecuta A MANO, como generate-og.mjs: el resultado es estable y se
 * versiona en public/. Produce:
 *
 * - public/favicon.ico            16, 32 y 48 px (PNG dentro de un ICO)
 * - public/favicon/icon-192.png   para pestañas y accesos directos
 * - public/favicon/apple-touch-icon.png  180 px sobre fondo opaco (iOS no
 *   respeta la transparencia y pintaría el hueco de negro o blanco)
 *
 * Usa `sharp`, que ya viene con Astro.
 */
import { mkdir, writeFile } from 'node:fs/promises';

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.error('\n  Falta `sharp`. Viene con Astro: ejecuta `npm install` primero.\n');
  process.exit(1);
}

const SOURCE = 'src/assets/art/brand/emblem.png';
// Carbón de la marca (src/styles/tokens.css). Duplicado a propósito: este
// script corre fuera de Vite.
const INK_950 = '#0b0c10';

// El emblema trae margen transparente: se recorta para que llene el icono.
const trimmed = await sharp(SOURCE).trim().toBuffer();

const square = (size, background) =>
  sharp(trimmed)
    .resize(size, size, { fit: 'contain', background: background ?? { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9, palette: true, quality: 90 })
    .toBuffer();

await mkdir('public/favicon', { recursive: true });

// ICO con PNG embebidos: cabecera de 6 bytes, una entrada de 16 por tamaño y
// después los PNG tal cual. Todos los navegadores actuales lo leen.
const icoSizes = [16, 32, 48];
const pngs = await Promise.all(icoSizes.map((size) => square(size)));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(icoSizes.length, 4);
let offset = 6 + 16 * icoSizes.length;
const entries = icoSizes.map((size, index) => {
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size, 0);
  entry.writeUInt8(size, 1);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(pngs[index].length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += pngs[index].length;
  return entry;
});
await writeFile('public/favicon.ico', Buffer.concat([header, ...entries, ...pngs]));

await writeFile('public/favicon/icon-192.png', await square(192));

const touch = await sharp(trimmed)
  .resize(148, 148, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .extend({ top: 16, bottom: 16, left: 16, right: 16, background: INK_950 })
  .flatten({ background: INK_950 })
  .png({ compressionLevel: 9, palette: true, quality: 90 })
  .toBuffer();
await writeFile('public/favicon/apple-touch-icon.png', touch);

console.log('  generate-icons: favicon.ico (16/32/48), icon-192, apple-touch-icon (180)');
