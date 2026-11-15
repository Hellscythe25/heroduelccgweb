/**
 * Galería de capturas: cada captura que nombran los textos existe en los dos
 * idiomas, los dos idiomas enseñan las mismas capturas en el mismo orden, y no
 * quedan imágenes importadas que ninguna página use.
 */
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { screenshotsCopy } from '~/i18n/pages/screenshots';
import { locales } from '~/i18n/ui';

const DIR = join(process.cwd(), 'src', 'assets', 'screens');
const ids = (lang: (typeof locales)[number]) =>
  screenshotsCopy[lang].groups.flatMap((group) => group.shots.map((shot) => shot.id));

describe('capturas', () => {
  it('los dos idiomas enseñan las mismas capturas en el mismo orden', () => {
    for (const lang of locales) expect(ids(lang), lang).toEqual(ids('es'));
  });

  it('cada captura nombrada tiene su imagen en cada idioma', () => {
    for (const lang of locales) {
      const missing = ids(lang).filter((id) => !existsSync(join(DIR, lang, `${id}.jpg`)));
      expect(missing, lang).toEqual([]);
    }
  });

  it('no hay imágenes importadas que la galería no use', () => {
    for (const lang of locales) {
      const files = readdirSync(join(DIR, lang)).map((file) => file.replace(/\.jpg$/, ''));
      expect(files.filter((id) => !ids(lang).includes(id)), lang).toEqual([]);
    }
  });

  it('no repite capturas', () => {
    expect(new Set(ids('es')).size).toBe(ids('es').length);
  });
});
