/**
 * Presentación de los héroes: rol, estilo de juego y emblema.
 *
 * Los números y textos de reglas (vida, pasiva, habilidades, costes) NO están
 * aquí: vienen de src/data/heroes.json, importado del juego (ADR-005). Este
 * archivo solo resume la identidad de cada héroe tal como la describe el GDD
 * (§4.1 identidad y §4.2 territorio). Un test exige que cada héroe del juego
 * tenga su entrada aquí, para que un héroe nuevo no aparezca sin presentación.
 *
 * El sobre de cada héroe es el nombre exacto que localiza el juego en
 * `ui.collection.booster_name.<id>` (Cards_es / Cards_en, versión 0.8.0). El
 * dueño aprobó mostrarlos el 2026-11-03.
 */
import type { Lang } from '~/i18n/ui';

/** Glifo del emblema: una forma por pilar o territorio del héroe. */
export type HeroGlyph = 'blade' | 'shield' | 'rune' | 'crescent' | 'hammer' | 'drop';

export interface HeroPresentation {
  glyph: HeroGlyph;
  role: Record<Lang, string>;
  style: Record<Lang, string>;
  booster: Record<Lang, string>;
}

/**
 * Nombre corto de un héroe, sin su epíteto. Los nombres del juego llegan con o
 * sin coma («Sable la Guardiana», «Vhassa, la Pactada»).
 */
export function heroShortName(name: string): string {
  return name.split(/[\s,]/)[0]!;
}

/** El epíteto que sigue al nombre corto, sin la coma: «la Pactada». */
export function heroEpithet(name: string): string {
  return name.slice(heroShortName(name).length).replace(/^,?\s*/, '');
}

export const heroPresentation: Record<string, HeroPresentation> = {
  brakka: {
    glyph: 'blade',
    role: { es: 'Agresión con el arma', en: 'Aggro through the weapon' },
    style: {
      es: 'Acumula furia turno a turno y la descarga en un golpe devastador. Cada ataque atraviesa parte de la armadura rival.',
      en: 'Builds fury turn after turn and unleashes it in one devastating blow. Every attack cuts through part of the enemy armor.',
    },
    booster: { es: 'El Rugido del Hierro', en: 'The Iron Roar' },
  },
  sable: {
    glyph: 'shield',
    role: { es: 'Tanque con la armadura', en: 'Tank through armor' },
    style: {
      es: 'La vida más alta del juego. Su armadura dura más, la remacha cada turno y, cuando llega el momento, embiste con su propio muro.',
      en: 'The highest life in the game. Armor lasts longer, gets riveted back every turn and, when the time comes, the wall itself becomes the battering ram.',
    },
    booster: { es: 'La Templanza del Muro', en: "The Wall's Temper" },
  },
  yrenna: {
    glyph: 'rune',
    role: { es: 'Control con trinkets y energía', en: 'Control through trinkets and energy' },
    style: {
      es: 'Convierte sus trinkets en energía extra, golpea sin que la armadura sirva de nada y rehace la mano entera cuando la necesita.',
      en: 'Turns trinkets into extra energy, strikes straight past armor and rebuilds the whole hand when it is needed.',
    },
    booster: { es: 'El Tejido del Vacío', en: 'The Weave of the Void' },
  },
  shouny: {
    glyph: 'crescent',
    role: { es: 'Disrupción de la mano rival', en: 'Disrupting the enemy hand' },
    style: {
      es: 'Vacía la mano rival y se alimenta de cada descarte. Tiene la vida más baja del juego: debe ganar antes de que la atrapen.',
      en: "Empties the enemy's hand and feeds on every discard. With the lowest life in the game, Shouny has to win before getting caught.",
    },
    booster: { es: 'Los Hilos de la Penumbra', en: 'The Threads of Penumbra' },
  },
  krunk: {
    glyph: 'hammer',
    role: { es: 'Demolición del equipo rival', en: 'Demolishing enemy gear' },
    style: {
      es: 'Abolla y rompe el equipo rival, roba una carta por cada pieza destrozada y remata con todo lo que acabó en el descarte.',
      en: 'Dents and breaks enemy gear, draws a card for every piece wrecked and finishes with everything that ended up in the discard pile.',
    },
    booster: { es: 'Los Despojos de la Forja', en: "The Forge's Spoils" },
  },
  vhassa: {
    glyph: 'drop',
    // Territorio firmado en el GDD §4.2: «Sangre — la vida como recurso». El
    // estilo resume su kit como lo cuenta CHANGELOG_Jugadores 0.8.0.
    role: { es: 'La vida como recurso', en: 'Life as a resource' },
    style: {
      es: 'Paga con su propia vida para golpear más fuerte: su Tributo de Sangre le quita vida para que el siguiente ataque pegue más, y puede repetirlo en el mismo turno. Su Rito Carmesí golpea más cuanta más vida le falta.',
      en: 'Pays with her own life to hit harder: her Blood Tribute costs her life so her next attack lands heavier, and she can repeat it in the same turn. Her Crimson Rite hits harder the more life she is missing.',
    },
    booster: { es: 'Las Ofrendas del Pacto', en: "The Pact's Offerings" },
  },
};

/**
 * Héroes anunciados que todavía no están en los datos del juego. Llevan solo el
 * nombre firmado por el dueño: sin arte, rol, vida ni color hasta que se
 * aprueben. Cuando el héroe llega a src/data/heroes.json sale de aquí (un test
 * lo exige) y pasa a heroPresentation.
 */
export interface UpcomingHero {
  id: string;
  name: Record<Lang, string>;
  /** Nombre de su sobre, tal como lo localiza el juego (`ui.collection.booster_name.<id>`). */
  booster?: Record<Lang, string>;
}

// Vhassa salió de aquí el 2026-11-03, al llegar a los datos del juego (0.8.0).
export const upcomingHeroes: UpcomingHero[] = [];

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
