/**
 * Presentación de los héroes: rol, estilo de juego y emblema.
 *
 * Los números y textos de reglas (vida, pasiva, habilidades, costes) NO están
 * aquí: vienen de src/data/heroes.json, importado del juego (ADR-005). Este
 * archivo solo resume la identidad de cada héroe tal como la describe el GDD
 * (§4.1 identidad y §4.2 territorio). Un test exige que cada héroe del juego
 * tenga su entrada aquí, para que un héroe nuevo no aparezca sin presentación.
 */
import type { Lang } from '~/i18n/ui';

/** Glifo del emblema: una forma por pilar o territorio del héroe. */
export type HeroGlyph = 'blade' | 'shield' | 'rune' | 'crescent' | 'hammer';

export interface HeroPresentation {
  glyph: HeroGlyph;
  role: Record<Lang, string>;
  style: Record<Lang, string>;
}

export const heroPresentation: Record<string, HeroPresentation> = {
  brakka: {
    glyph: 'blade',
    role: { es: 'Agresión con el arma', en: 'Aggro through the weapon' },
    style: {
      es: 'Acumula furia turno a turno y la descarga en un golpe devastador. Cada ataque atraviesa parte de la armadura rival.',
      en: 'Builds fury turn after turn and unleashes it in one devastating blow. Every attack cuts through part of the enemy armor.',
    },
  },
  sable: {
    glyph: 'shield',
    role: { es: 'Tanque con la armadura', en: 'Tank through armor' },
    style: {
      es: 'La vida más alta del juego. Su armadura dura más, la remacha cada turno y, cuando llega el momento, embiste con su propio muro.',
      en: 'The highest life in the game. Armor lasts longer, gets riveted back every turn and, when the time comes, the wall itself becomes the battering ram.',
    },
  },
  yrenna: {
    glyph: 'rune',
    role: { es: 'Control con trinkets y energía', en: 'Control through trinkets and energy' },
    style: {
      es: 'Convierte sus trinkets en energía extra, golpea sin que la armadura sirva de nada y rehace la mano entera cuando la necesita.',
      en: 'Turns trinkets into extra energy, strikes straight past armor and rebuilds the whole hand when it is needed.',
    },
  },
  shouny: {
    glyph: 'crescent',
    role: { es: 'Disrupción de la mano rival', en: 'Disrupting the enemy hand' },
    style: {
      es: 'Vacía la mano rival y se alimenta de cada descarte. Tiene la vida más baja del juego: debe ganar antes de que la atrapen.',
      en: "Empties the enemy's hand and feeds on every discard. With the lowest life in the game, Shouny has to win before getting caught.",
    },
  },
  krunk: {
    glyph: 'hammer',
    role: { es: 'Demolición del equipo rival', en: 'Demolishing enemy gear' },
    style: {
      es: 'Abolla y rompe el equipo rival, roba una carta por cada pieza destrozada y remata con todo lo que acabó en el descarte.',
      en: 'Dents and breaks enemy gear, draws a card for every piece wrecked and finishes with everything that ended up in the discard pile.',
    },
  },
};

export interface HeroesPageCopy {
  /** `{names}` se sustituye por los nombres de los héroes publicados: el texto no fija cuántos son. */
  meta: { title: string; description: string };
  title: string;
  lead: string;
  /** `{version}` se sustituye por la versión del juego de la que salen los datos. */
  dataNote: string;
}

export const heroesPageCopy: Record<Lang, HeroesPageCopy> = {
  es: {
    meta: {
      title: 'Héroes',
      description: 'Los héroes de Hero Duel CCG ({names}): su vida, su pasiva y sus habilidades.',
    },
    title: 'Un héroe para cada forma de ganar',
    lead: 'Cada héroe tiene su propia vida, una pasiva, dos habilidades que no son cartas y su campaña. Al empezar eliges uno; a los demás los desbloqueas jugando.',
    dataNote:
      'Los valores son los del juego en su versión {version} y pueden cambiar con el balance antes del lanzamiento.',
  },
  en: {
    meta: {
      title: 'Heroes',
      description: 'The heroes of Hero Duel CCG ({names}): their life, passive and abilities.',
    },
    title: 'A hero for every way to win',
    lead: 'Every hero has their own life total, a passive, two abilities that are not cards, and a campaign. You pick one to start; the rest you unlock by playing.',
    dataNote: 'Values match game version {version} and may change with balancing before launch.',
  },
};
