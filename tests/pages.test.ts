/**
 * Coherencia entre los datos del juego y los textos de las páginas, y entre
 * los dos idiomas de los textos largos.
 *
 * El test de i18n.test.ts cubre el diccionario corto; este cubre src/i18n/pages/
 * y los documentos legales, donde la deriva entre idiomas aparecería por
 * omisión: un párrafo nuevo en español que nadie traduce.
 */
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { heroes } from '~/data';
import { gameCopy } from '~/i18n/pages/game';
import { heroPresentation, heroesPageCopy } from '~/i18n/pages/heroes';
import { homeCopy } from '~/i18n/pages/home';
import { howToPlayCopy } from '~/i18n/pages/howToPlay';
import { locales } from '~/i18n/ui';
import { legalDocs } from '~/legal';
import { heroesFromContentDatabase, splitPassive } from '../scripts/lib/game-data.mjs';

/** Forma de un valor: misma estructura y misma longitud de listas, sin mirar el texto. */
function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, child]) => [key, shape(child)]),
    );
  }
  return typeof value;
}

describe('textos largos', () => {
  const pages = { gameCopy, howToPlayCopy, heroesPageCopy, homeCopy };

  for (const [name, copy] of Object.entries(pages)) {
    it(`${name} tiene la misma forma en todos los idiomas`, () => {
      for (const lang of locales) {
        expect(shape(copy[lang]), `${name}.${lang}`).toEqual(shape(copy.es));
      }
    });
  }
});

describe('héroes', () => {
  it('cada héroe del juego tiene presentación (rol, estilo y emblema)', () => {
    const missing = heroes.filter((hero) => !heroPresentation[hero.id]).map((hero) => hero.id);
    expect(missing).toEqual([]);
  });

  it('no hay presentación para héroes que el juego no tiene', () => {
    const ids = new Set(heroes.map((hero) => hero.id));
    expect(Object.keys(heroPresentation).filter((id) => !ids.has(id))).toEqual([]);
  });
});

describe('importador de datos del juego', () => {
  it('parte la pasiva en nombre y texto', () => {
    expect(splitPassive('Filo Implacable: los ataques ignoran 1 de armadura.', 'test')).toEqual({
      name: 'Filo Implacable',
      text: 'los ataques ignoran 1 de armadura.',
    });
  });

  it('falla si la pasiva no trae nombre', () => {
    expect(() => splitPassive('sin separador', 'test')).toThrow();
  });

  it('copia vida, habilidades y campaña sin tocarlas', () => {
    const [hero] = heroesFromContentDatabase({
      heroes: [
        {
          id: 'test',
          nameEs: 'Prueba la Valiente',
          nameEn: 'Test the Brave',
          passiveEs: 'Pasiva: texto.',
          passiveEn: 'Passive: text.',
          startingHealth: 27,
          abilities: [{ id: 'a1', nameEs: 'Uno', nameEn: 'One', descEs: 'Hace algo.', descEn: 'Does something.', cost: 3 }],
        },
      ],
      campaigns: [{ heroId: 'test', nameEs: 'La Prueba', nameEn: 'The Trial' }],
    });

    expect(hero).toEqual({
      id: 'test',
      name: { es: 'Prueba la Valiente', en: 'Test the Brave' },
      life: 27,
      passive: { name: { es: 'Pasiva', en: 'Passive' }, text: { es: 'texto.', en: 'text.' } },
      actives: [{ id: 'a1', name: { es: 'Uno', en: 'One' }, text: { es: 'Hace algo.', en: 'Does something.' }, cost: 3 }],
      campaign: { name: { es: 'La Prueba', en: 'The Trial' } },
    });
  });
});

describe('documentos legales', () => {
  for (const doc of legalDocs) {
    it(`"${doc}" existe en todos los idiomas con las mismas secciones`, () => {
      const sections = locales.map((lang) => {
        const path = `src/content/legal/${lang}/${doc}.md`;
        expect(existsSync(path), path).toBe(true);
        return readFileSync(path, 'utf8').match(/^##+ /gm)?.length ?? 0;
      });
      expect(new Set(sections).size, `número de secciones por idioma: ${sections.join(' / ')}`).toBe(1);
    });
  }
});
