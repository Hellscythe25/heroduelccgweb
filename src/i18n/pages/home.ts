/**
 * Textos de la portada (/es/ y /en/), más allá del titular que vive en ui.ts.
 *
 * Resume las páginas interiores; no añade afirmaciones que no estén en ellas.
 */
import type { Lang } from '~/i18n/ui';
import type { TextBlock } from './game';

export interface HomeCopy {
  pillars: TextBlock[];
  turn: { title: string; steps: string[] };
  heroes: { title: string; body: string; link: string };
  fair: { title: string; items: string[]; link: string };
  status: TextBlock;
}

export const homeCopy: Record<Lang, HomeCopy> = {
  es: {
    pillars: [
      {
        title: 'Sin tablero de criaturas',
        body: 'Todo el daño va directo al héroe rival. Partidas que se leen de un vistazo.',
      },
      {
        title: 'Arma, armadura y trinket',
        body: 'Tres espacios de equipo que se gastan, se rompen y se reemplazan.',
      },
      {
        title: 'Energía en lugar de maná',
        body: 'Sube 1 cada turno hasta 10 y se recarga entera. Cada punto cuenta.',
      },
    ],
    turn: {
      title: 'Un turno, tres tiempos',
      steps: [
        'Tu energía sube y robas una carta.',
        'Juegas cartas y habilidades de tu héroe.',
        'Cierras con una acción: atacar, golpe fuerte o pasar.',
      ],
    },
    heroes: {
      title: 'Elige a tu héroe',
      body: 'Cinco héroes con vida, pasiva y habilidades propias. Empiezas con uno y desbloqueas a los demás jugando su campaña.',
      link: 'Ver los cinco héroes',
    },
    fair: {
      title: 'Justo por diseño',
      items: [
        'El poder no se vende: todo se puede conseguir jugando.',
        'Sin intercambio de cartas entre jugadores.',
        'Sin publicidad.',
        'Probabilidades de los sobres a la vista en el juego.',
      ],
      link: 'Más sobre el juego',
    },
    status: {
      title: 'Estado del proyecto',
      body: 'Hero Duel CCG está en desarrollo activo para PC. Este sitio crecerá con el juego: devlog, compendio de cartas y constructor de mazos.',
    },
  },
  en: {
    pillars: [
      {
        title: 'No creature board',
        body: 'All damage goes straight to the enemy hero. Duels you can read at a glance.',
      },
      {
        title: 'Weapon, armor and trinket',
        body: 'Three equipment slots that wear down, break and get replaced.',
      },
      {
        title: 'Energy instead of mana',
        body: 'It grows by 1 each turn up to 10 and fully refills. Every point counts.',
      },
    ],
    turn: {
      title: 'One turn, three beats',
      steps: [
        'Your energy grows and you draw a card.',
        "You play cards and your hero's abilities.",
        'You close with one action: attack, heavy strike or pass.',
      ],
    },
    heroes: {
      title: 'Choose your hero',
      body: 'Five heroes with their own life, passive and abilities. You start with one and unlock the rest by playing their campaign.',
      link: 'See all five heroes',
    },
    fair: {
      title: 'Fair by design',
      items: [
        'Power is never for sale: everything can be earned by playing.',
        'No card trading between players.',
        'No ads.',
        'Pack odds shown in plain sight in the game.',
      ],
      link: 'More about the game',
    },
    status: {
      title: 'Project status',
      body: 'Hero Duel CCG is in active development for PC. This site will grow with the game: a devlog, a card compendium and a deckbuilder.',
    },
  },
};
