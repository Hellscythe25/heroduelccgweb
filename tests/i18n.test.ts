/**
 * Paridad ES/EN estructural.
 *
 * "Ninguna página se publica en un idioma sin su contraparte" (AGENTES.md,
 * `localizador`). Un sitio medio traducido se lee como abandonado, y la deriva
 * entre idiomas aparece por omisión, no por decisión. Este test la convierte en
 * un fallo de CI en vez de en un hallazgo tardío.
 */
import { describe, expect, it } from 'vitest';
import { alternates, localizedPath, locales, routes, ui, useTranslations } from '~/i18n/ui';

describe('diccionario de interfaz', () => {
  it('tiene exactamente las mismas claves en todos los idiomas', () => {
    const reference = Object.keys(ui.es).sort();
    for (const lang of locales) {
      expect(Object.keys(ui[lang]).sort(), `faltan o sobran claves en "${lang}"`).toEqual(reference);
    }
  });

  it('no deja ninguna cadena vacía', () => {
    for (const lang of locales) {
      for (const [key, value] of Object.entries(ui[lang])) {
        expect(value.trim(), `${lang}.${key} está vacía`).not.toBe('');
      }
    }
  });

  it('no deja cadenas idénticas al español por olvido de traducir', () => {
    // Los nombres propios del juego no se traducen: son glosario, no descuido.
    const glossary = new Set(['site.name', 'home.title', 'nav.deckbuilder', 'nav.blog']);

    const untranslated = Object.keys(ui.es).filter(
      (key) =>
        !glossary.has(key) &&
        ui.en[key as keyof typeof ui.en] === ui.es[key as keyof typeof ui.es],
    );

    expect(untranslated).toEqual([]);
  });
});

describe('rutas localizadas', () => {
  it('define un slug por idioma para cada ruta', () => {
    for (const [key, slugs] of Object.entries(routes)) {
      for (const lang of locales) {
        expect(slugs[lang], `falta el slug de "${key}" en "${lang}"`).toBeTypeOf('string');
      }
    }
  });

  it('genera rutas absolutas con barra final', () => {
    expect(localizedPath('es', 'home')).toBe('/es/');
    expect(localizedPath('en', 'news')).toBe('/en/news/');
    expect(localizedPath('es', 'news')).toBe('/es/noticias/');
  });

  it('produce un alternate por idioma para hreflang', () => {
    expect(alternates('cards')).toHaveLength(locales.length);
  });
});

describe('traductor', () => {
  it('devuelve la cadena del idioma pedido', () => {
    expect(useTranslations('en')('nav.home')).toBe('Home');
    expect(useTranslations('es')('nav.home')).toBe('Inicio');
  });
});
