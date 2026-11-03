import { describe, expect, it } from 'vitest';
import { heroes } from '~/data';
import { heroColorStyle } from '~/heroColors';
import { heroEpithet, heroShortName, heroesPageCopy, upcomingHeroes } from '~/i18n/pages/heroes';
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

describe('nombres de héroe', () => {
  it('separa nombre y epíteto con o sin coma', () => {
    expect([heroShortName('Sable la Guardiana'), heroEpithet('Sable la Guardiana')]).toEqual(['Sable', 'la Guardiana']);
    expect([heroShortName('Vhassa, la Pactada'), heroEpithet('Vhassa, la Pactada')]).toEqual(['Vhassa', 'la Pactada']);
    expect([heroShortName('Vhassa'), heroEpithet('Vhassa')]).toEqual(['Vhassa', '']);
  });

  it('ningún nombre corto de los datos arrastra puntuación', () => {
    for (const hero of heroes) {
      for (const name of Object.values(hero.name)) {
        expect(heroShortName(name)).toMatch(/^\p{L}+$/u);
      }
    }
  });
});

describe('héroes anunciados', () => {
  it('un héroe anunciado sale de la lista cuando llega a los datos del juego', () => {
    const ids = new Set(heroes.map((hero) => hero.id));
    expect(upcomingHeroes.filter((hero) => ids.has(hero.id)).map((hero) => hero.id)).toEqual([]);
  });

  it('cada héroe anunciado tiene nombre en todos los idiomas', () => {
    for (const hero of upcomingHeroes) {
      for (const name of Object.values(hero.name)) {
        expect(name.trim()).not.toBe('');
      }
    }
  });
});
