/**
 * Novedades por versión (src/content/changelog/): orden de versiones, paridad
 * entre idiomas y las reglas de adaptación que se pueden comprobar sin leer el
 * texto (src/content/changelog/_README.md).
 *
 * Los nombres de rangos no se comprueban aquí: listarlos en un test los
 * publicaría en el repositorio, que es público. Esa regla se revisa a mano.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { compareVersions, versionAnchor } from '~/changelog';
import { locales } from '~/i18n/ui';

const DIR = join(process.cwd(), 'src', 'content', 'changelog');

interface Release {
  file: string;
  version: string | undefined;
  lang: string | undefined;
  hasNotice: boolean;
  highlights: number;
  text: string;
}

function readRelease(lang: string, file: string): Release {
  const text = readFileSync(join(DIR, lang, file), 'utf8');
  const front = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)?.[1] ?? '';
  const block = /^highlights:\s*\r?\n((?:[ \t]+-.*\r?\n?)+)/m.exec(front)?.[1] ?? '';
  return {
    file,
    version: /^version:\s*['"]?([^'"\s]+)/m.exec(front)?.[1],
    lang: /^lang:\s*['"]?(\w+)/m.exec(front)?.[1],
    hasNotice: /^notice:/m.test(front),
    highlights: block.split(/\r?\n/).filter((line) => /^\s+-\s/.test(line)).length,
    text,
  };
}

const releases = Object.fromEntries(
  locales.map((lang) => [
    lang,
    readdirSync(join(DIR, lang))
      .filter((file) => file.endsWith('.md') && !file.startsWith('_'))
      .map((file) => readRelease(lang, file)),
  ]),
) as Record<string, Release[]>;

describe('versiones', () => {
  it('ordena por número y no como texto', () => {
    expect(['0.9.0', '0.10.0', '0.3.4', '0.3.10'].sort(compareVersions)).toEqual([
      '0.3.4',
      '0.3.10',
      '0.9.0',
      '0.10.0',
    ]);
    expect(compareVersions('0.8.0', '0.8.0')).toBe(0);
  });

  it('da un ancla válida para el índice de la página', () => {
    expect(versionAnchor('0.8.0')).toBe('v0-8-0');
  });
});

describe('novedades por versión', () => {
  it('hay contenido en todos los idiomas', () => {
    for (const lang of locales) expect(releases[lang]!.length, lang).toBeGreaterThan(0);
  });

  it('cada archivo declara la versión de su nombre y el idioma de su carpeta', () => {
    for (const lang of locales) {
      for (const release of releases[lang]!) {
        expect(release.version, `${lang}/${release.file}`).toBe(release.file.replace(/\.md$/, ''));
        expect(release.lang, `${lang}/${release.file}`).toBe(lang);
      }
    }
  });

  it('los dos idiomas tienen las mismas versiones, avisos y número de destacados', () => {
    const summary = (lang: string) =>
      releases[lang]!.map(({ version, hasNotice, highlights }) => ({ version, hasNotice, highlights })).sort((a, b) =>
        compareVersions(a.version!, b.version!),
      );
    for (const lang of locales) expect(summary(lang), lang).toEqual(summary('es'));
  });

  it('no menciona gemas, fechas, versiones "en preparación" ni el nombre interno', () => {
    const forbidden = [
      /\bgemas?\b/i,
      /\bgems?\b/i,
      /tcgmaster/i,
      /todav[ií]a no repartida|en preparaci[oó]n|not yet (?:released|distributed)|in preparation/i,
      /\b20\d{2}-\d{2}-\d{2}\b/,
    ];
    for (const lang of locales) {
      for (const release of releases[lang]!) {
        for (const pattern of forbidden) {
          expect(release.text, `${lang}/${release.file} ${pattern}`).not.toMatch(pattern);
        }
      }
    }
  });
});
