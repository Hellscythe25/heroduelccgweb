import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// La regla que marca un asset como inmutable un año. Si no reconoce cómo
// nombra Astro sus archivos, el navegador vuelve a pedirlos cada semana.
const htaccess = readFileSync('public/.htaccess', 'utf8');
const immutable = htaccess.match(/<FilesMatch "([^"]+)">\s*Header set Cache-Control "[^"]*immutable"/);
const hashed = new RegExp(immutable![1]!);

describe('caché de assets en .htaccess', () => {
  it('existe una regla de un año para los assets con hash', () => {
    expect(immutable).not.toBeNull();
  });

  it('reconoce cada forma en que Astro nombra un asset con hash', () => {
    for (const name of [
      'global.De3IwP1V.css',
      'space-grotesk-vietnamese-400-normal.B7xT_GF5.woff2',
      'space-grotesk-latin-400-normal.B7xT_GF5.woff',
      'default.BxkT94ii.png',
      'brakka.CAvtAtfd_ZTie4z.avif',
      'board.si9rX1xe_UhnF9.webp',
      'yrenna.D9h_sgVq_Z1k1ImG.jpg',
    ]) {
      expect(name).toMatch(hashed);
    }
  });

  it('no marca como inmutable nada de public/, que no lleva hash', () => {
    const files = readdirSync('public', { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name);
    expect(files.filter((name) => hashed.test(name))).toEqual([]);
  });
});
