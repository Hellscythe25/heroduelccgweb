/**
 * Textos de /es/juego/ y /en/game/.
 *
 * Fuente: GDD del juego (§1, §2, §5, §6, §9). Cada afirmación se puede rastrear
 * a una regla implementada o a un principio firmado. Quedan fuera a propósito:
 * precios, fechas, número de cartas y nombres de rango, que todavía cambian o
 * no están aprobados para publicarse (docs/MEMORIA.md).
 */
import type { Lang } from '~/i18n/ui';

export interface TextBlock {
  title: string;
  body: string;
}

export interface GameCopy {
  meta: { title: string; description: string };
  title: string;
  lead: string;
  pillars: { title: string; items: TextBlock[] };
  modes: { title: string; pvp: { title: string; items: TextBlock[] }; pve: TextBlock };
  start: TextBlock;
  collection: {
    title: string;
    intro: string;
    types: TextBlock[];
    rarities: { title: string; note: string; items: { name: string; copies: string }[] };
  };
  currencies: { title: string; intro: string; items: TextBlock[] };
  fair: { title: string; items: TextBlock[] };
  platforms: TextBlock;
}

export const gameCopy: Record<Lang, GameCopy> = {
  es: {
    meta: {
      title: 'El juego',
      description:
        'Qué es Hero Duel CCG: un juego de cartas coleccionables 1 contra 1 sin tablero de criaturas, con equipo, energía y héroes con habilidades propias.',
    },
    title: 'Un duelo, dos héroes',
    lead: 'Hero Duel CCG es un juego de cartas coleccionables competitivo, 1 contra 1 y por turnos. Cada duelo enfrenta a dos héroes, y todo el daño va directo al héroe rival.',
    pillars: {
      title: 'Lo que lo hace distinto',
      items: [
        {
          title: 'Sin tablero de criaturas',
          body: 'Nada de invocar ejércitos: el daño va directo al héroe rival. Menos piezas en la mesa y partidas que se leen de un vistazo.',
        },
        {
          title: 'Tres pilares de equipo',
          body: 'Un arma para atacar, una armadura para resistir y un trinket para sorprender. Un espacio para cada uno.',
        },
        {
          title: 'Energía que crece',
          body: 'Empiezas sin energía y tu máximo sube 1 cada turno, hasta 10. Se recarga entera en cada turno tuyo.',
        },
        {
          title: 'Partidas cortas, decisiones densas',
          body: 'Las habilidades de cada héroe convierten la energía sobrante en golpes que cierran la partida en lugar de alargarla.',
        },
        {
          title: 'Partidas justas',
          body: 'El servidor decide cada regla, cada punto de daño y cada recompensa. Nadie puede ver tu mano ni darse ventaja desde su equipo.',
        },
      ],
    },
    modes: {
      title: 'Modos de juego',
      pvp: {
        title: 'Contra otros jugadores',
        items: [
          {
            title: 'Clasificatoria',
            body: 'Sube de rango con cada victoria. El emparejamiento busca rivales de un nivel parecido al tuyo.',
          },
          {
            title: 'Casual',
            body: 'Partidas sin puntuación, en una cola propia que nunca se mezcla con la clasificatoria.',
          },
          {
            title: 'Sala privada',
            body: 'Comparte un código de 6 caracteres y reta a quien quieras.',
          },
        ],
      },
      pve: {
        title: 'Campañas contra la IA',
        body: 'Cada héroe tiene su propia campaña. Sus duelos se juegan en tu equipo, sin reloj de turnos, y el servidor solo entrega las recompensas. Superar la campaña de un héroe lo desbloquea junto con su mazo inicial.',
      },
    },
    start: {
      title: 'Cómo empiezas',
      body: 'Al crear tu perfil eliges un héroe inicial y recibes su mazo de 20 cartas. Los demás héroes se ganan jugando su campaña. Los modos de juego nunca se bloquean.',
    },
    collection: {
      title: 'Cartas y colección',
      intro:
        'Hay cartas neutrales, que puede usar cualquier héroe, y cartas exclusivas de cada héroe. Un mazo tiene 20 cartas.',
      types: [
        { title: 'Instantánea', body: 'Un efecto inmediato de un solo uso.' },
        { title: 'Arma', body: 'Suma su poder a tus ataques hasta que se gasta su durabilidad.' },
        { title: 'Armadura', body: 'Reduce el daño que recibes hasta que se gasta su durabilidad.' },
        { title: 'Trinket', body: 'Se activa sola cuando se cumple su condición y gasta una carga cada vez.' },
      ],
      rarities: {
        title: 'Rarezas',
        note: 'Copias máximas de una misma carta en un mazo:',
        items: [
          { name: 'Común', copies: '3' },
          { name: 'Poco común', copies: '3' },
          { name: 'Rara', copies: '2' },
          { name: 'Épica', copies: '2' },
          { name: 'Legendaria', copies: '1' },
        ],
      },
    },
    currencies: {
      title: 'Tres monedas',
      intro: 'Cada una tiene un papel distinto, y ninguna compra poder.',
      items: [
        { title: 'Monedas', body: 'Se ganan jugando partidas y campañas, y sirven para abrir sobres.' },
        { title: 'Esencia', body: 'Sale de las cartas repetidas. Con ella creas la carta exacta que buscas.' },
        { title: 'Gemas', body: 'La moneda de pago. Compra sobres o cartas sueltas, nunca nada que no se pueda ganar jugando.' },
      ],
    },
    fair: {
      title: 'Justo por diseño',
      items: [
        {
          title: 'El poder no se vende',
          body: 'Todo lo que se compra es colección o estilo, y todo se puede conseguir jugando.',
        },
        {
          title: 'Sin intercambio entre jugadores',
          body: 'Las cartas no se intercambian ni se venden entre jugadores. La colección es tuya y solo tuya.',
        },
        {
          title: 'Sin publicidad',
          body: 'Ni anuncios con recompensa ni anuncios a pantalla completa.',
        },
        {
          title: 'Probabilidades a la vista',
          body: 'Las probabilidades de los sobres y sus garantías se muestran en el juego, y siempre hay un camino directo a cualquier carta: crearla con esencia.',
        },
      ],
    },
    platforms: {
      title: 'Plataformas e idiomas',
      body: 'Primero en PC (Windows). El juego está en español y en inglés.',
    },
  },
  en: {
    meta: {
      title: 'The game',
      description:
        'What Hero Duel CCG is: a one-on-one collectible card game with no creature board, built on equipment, energy and heroes with their own abilities.',
    },
    title: 'One duel, two heroes',
    lead: 'Hero Duel CCG is a competitive, one-on-one, turn-based collectible card game. Every duel pits two heroes against each other, and all damage goes straight to the enemy hero.',
    pillars: {
      title: 'What sets it apart',
      items: [
        {
          title: 'No creature board',
          body: 'No armies to summon: damage goes straight to the enemy hero. Fewer pieces on the table and duels you can read at a glance.',
        },
        {
          title: 'Three equipment pillars',
          body: 'A weapon to strike, armor to endure and a trinket to surprise. One slot for each.',
        },
        {
          title: 'Energy that grows',
          body: 'You start with no energy and your maximum goes up by 1 every turn, up to 10. It fully refills on each of your turns.',
        },
        {
          title: 'Short matches, dense decisions',
          body: "Each hero's abilities turn spare energy into blows that close out the match instead of dragging it on.",
        },
        {
          title: 'Fair matches',
          body: 'The server decides every rule, every point of damage and every reward. No one can peek at your hand or give themselves an edge from their own machine.',
        },
      ],
    },
    modes: {
      title: 'Game modes',
      pvp: {
        title: 'Against other players',
        items: [
          {
            title: 'Ranked',
            body: 'Climb the ranks with every win. Matchmaking looks for opponents close to your level.',
          },
          {
            title: 'Casual',
            body: 'Unrated matches in a queue of their own that never mixes with ranked.',
          },
          {
            title: 'Private room',
            body: 'Share a 6-character code and challenge anyone you like.',
          },
        ],
      },
      pve: {
        title: 'Campaigns against the AI',
        body: "Every hero has their own campaign. Its duels play out on your machine with no turn timer, and the server only hands out the rewards. Clearing a hero's campaign unlocks that hero along with their starter deck.",
      },
    },
    start: {
      title: 'How you start',
      body: 'When you create your profile you pick a starter hero and receive their 20-card deck. Every other hero is earned by playing their campaign. Game modes are never locked.',
    },
    collection: {
      title: 'Cards and collection',
      intro:
        'There are neutral cards, which any hero can use, and cards exclusive to each hero. A deck has 20 cards.',
      types: [
        { title: 'Instant', body: 'A one-shot effect that resolves right away.' },
        { title: 'Weapon', body: 'Adds its power to your attacks until its durability runs out.' },
        { title: 'Armor', body: 'Reduces the damage you take until its durability runs out.' },
        { title: 'Trinket', body: 'Triggers on its own when its condition is met, spending a charge each time.' },
      ],
      rarities: {
        title: 'Rarities',
        note: 'Maximum copies of the same card in a deck:',
        items: [
          { name: 'Common', copies: '3' },
          { name: 'Uncommon', copies: '3' },
          { name: 'Rare', copies: '2' },
          { name: 'Epic', copies: '2' },
          { name: 'Legendary', copies: '1' },
        ],
      },
    },
    currencies: {
      title: 'Three currencies',
      intro: 'Each one has its own role, and none of them buys power.',
      items: [
        { title: 'Coins', body: 'Earned by playing matches and campaigns, and spent on packs.' },
        { title: 'Essence', body: 'Comes from duplicate cards. Use it to craft the exact card you want.' },
        { title: 'Gems', body: 'The paid currency. Buys packs or single cards, never anything you could not earn by playing.' },
      ],
    },
    fair: {
      title: 'Fair by design',
      items: [
        {
          title: 'Power is never for sale',
          body: 'Everything you can buy is collection or style, and everything can be earned by playing.',
        },
        {
          title: 'No trading between players',
          body: 'Cards are never traded or sold between players. Your collection is yours alone.',
        },
        {
          title: 'No ads',
          body: 'No rewarded ads and no full-screen ads.',
        },
        {
          title: 'Odds in plain sight',
          body: 'Pack odds and guarantees are shown in the game, and there is always a direct path to any card: crafting it with essence.',
        },
      ],
    },
    platforms: {
      title: 'Platforms and languages',
      body: 'PC (Windows) first. The game is available in Spanish and English.',
    },
  },
};
