/**
 * Textos de la galería de capturas (/es/capturas/, /en/screenshots/).
 *
 * Cada captura existe en los dos idiomas del juego: la página en español
 * enseña el juego en español y la inglesa, en inglés. Las imágenes las genera
 * scripts/import-screenshots.mjs en src/assets/screens/{lang}/{id}.jpg; el `id`
 * de aquí es el nombre del archivo.
 */
import type { Lang } from '../ui';

export interface ScreenshotsCopy {
  meta: { title: string; description: string };
  title: string;
  lead: string;
  fullSize: string;
  groups: {
    title: string;
    /** Aviso del grupo, p. ej. que lo que enseña aún no salió. */
    note?: string;
    shots: { id: string; caption: string }[];
  }[];
}

export const screenshotsCopy: Record<Lang, ScreenshotsCopy> = {
  es: {
    meta: {
      title: 'Capturas',
      description:
        'Capturas de Hero Duel CCG: el lobby, la campaña, los duelos, la colección y la apertura de sobres.',
    },
    title: 'Capturas',
    lead: 'Así se ve Hero Duel CCG hoy. Es un juego en desarrollo: la interfaz y el arte pueden cambiar antes del lanzamiento.',
    fullSize: 'Ver a tamaño completo',
    groups: [
      {
        title: 'El lobby y la campaña',
        shots: [
          { id: '01-lobby', caption: 'El lobby: duelos PVP contra otros jugadores y la campaña PVE.' },
          { id: '02-campaign-hub', caption: 'Las campañas: la del set básico y una por héroe.' },
          { id: '02b-hero-picker', caption: 'Eliges héroe y mazo, y sigues la ruta de la campaña.' },
        ],
      },
      {
        title: 'Los duelos',
        shots: [
          { id: '03a-match-opening', caption: 'Empieza el duelo: en la campaña siempre empiezas tú.' },
          { id: '04h-ability-used', caption: 'Shouny usa una habilidad de héroe.' },
          { id: '04i-spell-hit', caption: 'Una instantánea de daño golpea el retrato del rival.' },
          { id: '11-vhassa-particles', caption: 'Vhassa en la mesa, con sus efectos.' },
          { id: '11-yrenna-particles', caption: 'Yrenna en la mesa, con sus efectos.' },
          { id: '05b-victory-fx', caption: 'Victoria: la vida del rival llega a 0.' },
        ],
      },
      {
        title: 'Colección, mazos y sobres',
        shots: [
          { id: '06-collection', caption: 'La colección, con filtros por héroe, tipo y coste.' },
          { id: '14b-deck-editor', caption: 'El editor de mazos, con la curva de costes.' },
          { id: '19b-pack-stage-burst', caption: 'Apertura de un sobre en 3D: el estallido.' },
          { id: '19e-pack-stage-hero', caption: 'Apertura de un sobre en 3D: el sello del héroe.' },
          { id: '06f-inspect-foil', caption: 'Una carta foil, inspeccionada al abrir un sobre.' },
        ],
      },
      {
        title: 'Próximamente',
        note: 'Llega en la próxima versión del juego.',
        shots: [{ id: '13g-profile-achievements', caption: 'Logros, en una pestaña nueva del perfil.' }],
      },
    ],
  },
  en: {
    meta: {
      title: 'Screenshots',
      description:
        'Screenshots of Hero Duel CCG: the lobby, the campaign, duels, the collection and pack opening.',
    },
    title: 'Screenshots',
    lead: 'This is how Hero Duel CCG looks today. The game is in development: the interface and art may change before launch.',
    fullSize: 'View full size',
    groups: [
      {
        title: 'Lobby and campaign',
        shots: [
          { id: '01-lobby', caption: 'The lobby: PVP duels against other players and the PVE campaign.' },
          { id: '02-campaign-hub', caption: 'The campaigns: the Core Set one and one per hero.' },
          { id: '02b-hero-picker', caption: 'Pick your hero and deck, then follow the campaign route.' },
        ],
      },
      {
        title: 'Duels',
        shots: [
          { id: '03a-match-opening', caption: 'The duel begins: in the campaign you always go first.' },
          { id: '04h-ability-used', caption: 'Shouny uses a hero ability.' },
          { id: '04i-spell-hit', caption: "A damage instant hits the opponent's portrait." },
          { id: '11-vhassa-particles', caption: 'Vhassa on the table, with her effects.' },
          { id: '11-yrenna-particles', caption: 'Yrenna on the table, with her effects.' },
          { id: '05b-victory-fx', caption: "Victory: the opponent's health reaches 0." },
        ],
      },
      {
        title: 'Collection, decks and packs',
        shots: [
          { id: '06-collection', caption: 'The collection, with filters by hero, type and cost.' },
          { id: '14b-deck-editor', caption: 'The deck editor, with the cost curve.' },
          { id: '19b-pack-stage-burst', caption: '3D pack opening: the burst.' },
          { id: '19e-pack-stage-hero', caption: "3D pack opening: the hero's seal." },
          { id: '06f-inspect-foil', caption: 'A foil card, inspected while opening a pack.' },
        ],
      },
      {
        title: 'Coming soon',
        note: 'Arrives in the next version of the game.',
        shots: [{ id: '13g-profile-achievements', caption: 'Achievements, in a new profile tab.' }],
      },
    ],
  },
};
