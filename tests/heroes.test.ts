import { describe, expect, it } from 'vitest';
import { heroColorStyle } from '~/heroColors';
import { heroesPageCopy } from '~/i18n/pages/heroes';
import { homeCopy } from '~/i18n/pages/home';

// El juego seguirá sumando héroes: la web no puede depender de cuántos hay hoy.
describe('número de héroes abierto', () => {
  it('un héroe sin color propio usa el respaldo de la marca', () => {
    expect(heroColorStyle('nuevo')).toContain('var(--hd-hero-nuevo, var(--hd-hero-fallback))');
    expect(heroColorStyle('nuevo')).toContain('var(--hd-hero-nuevo-text, var(--hd-hero-fallback-text))');
  });

  it('los textos sobre los héroes no fijan cuántos son', () => {
    const texts = JSON.stringify([heroesPageCopy, homeCopy.es.heroes, homeCopy.en.heroes]);
    expect(texts).not.toMatch(/\b(cinco|seis|five|six)\b/i);
  });

  it('la descripción de la página de héroes lleva los nombres desde los datos', () => {
    for (const copy of Object.values(heroesPageCopy)) {
      expect(copy.meta.description).toContain('{names}');
    }
  });
});
