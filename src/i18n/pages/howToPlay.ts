/**
 * Textos de /es/como-se-juega/ y /en/how-to-play/.
 *
 * Fuente: GDD del juego §3 (núcleo de combate) y §17.2 (empate simultáneo).
 * El nombre de La Moneda sale del juego (card.sys_coin.name en el
 * ContentDatabase): «Óbolo del Retador» / "Challenger's Obol".
 */
import type { Lang } from '~/i18n/ui';
import type { TextBlock } from './game';

export interface HowToPlayCopy {
  meta: { title: string; description: string };
  title: string;
  lead: string;
  setup: { title: string; items: string[] };
  turn: { title: string; steps: string[] };
  energy: { title: string; rows: { label: string; value: string }[] };
  attack: { title: string; steps: string[] };
  equipment: { title: string; intro: string; slots: (TextBlock & { stats: string })[] };
  instants: TextBlock;
  abilities: TextBlock & { link: string };
  timer: TextBlock;
  end: TextBlock;
}

export const howToPlayCopy: Record<Lang, HowToPlayCopy> = {
  es: {
    meta: {
      title: 'Cómo se juega',
      description:
        'Las reglas de un duelo de Hero Duel CCG: energía, turno, ataque, equipo, habilidades de héroe y reloj de turno.',
    },
    title: 'Así funciona un duelo',
    lead: 'Gana quien deja en 0 la vida del héroe rival. Estas son las reglas, paso a paso.',
    setup: {
      title: 'Antes de empezar',
      items: [
        'Cada jugador llega con un héroe y un mazo de 20 cartas, y roba 3 cartas. Empieza el jugador 1.',
        'En las partidas contra otros jugadores, quien juega segundo recibe el Óbolo del Retador —una carta de coste 0 que da 1 de energía ese turno— y empieza con 2 de vida extra. Así se compensa la ventaja de empezar.',
      ],
    },
    turn: {
      title: 'Tu turno',
      steps: [
        'Tu energía máxima sube 1, hasta un tope de 10, y se recarga entera.',
        'Robas 1 carta.',
        'Juegas cartas y habilidades de tu héroe en el orden que quieras, mientras te alcance la energía.',
        'Cierras el turno con una sola acción: atacar, usar un golpe fuerte de tu héroe o pasar.',
      ],
    },
    energy: {
      title: 'La energía',
      rows: [
        { label: 'Al empezar el duelo', value: '0' },
        { label: 'Al inicio de cada turno tuyo', value: '+1 de máximo' },
        { label: 'Tope', value: '10' },
        { label: 'Recarga', value: 'Completa en cada turno tuyo; la que no usas no se acumula' },
      ],
    },
    attack: {
      title: 'El ataque',
      steps: [
        'Daño = 1 (tus puños: atacar nunca exige arma) + el poder de tu arma + los bonos de ataque que hayas acumulado.',
        'La armadura del defensor resta su valor a ese daño, hasta un mínimo de 0.',
        'El defensor pierde la vida que queda.',
        'Tu arma pierde 1 de durabilidad. Si llega a 0, se rompe.',
        'La armadura del defensor pierde 1 de durabilidad por cada golpe, aunque lo haya absorbido entero. Si llega a 0, se rompe.',
        'Se activan los trinkets: primero el del defensor y después el del atacante. Un trinket de curación puede salvar a su dueño de un golpe letal: es su as bajo la manga.',
      ],
    },
    equipment: {
      title: 'El equipo',
      intro:
        'Equipar cuesta energía, como cualquier carta. Hay un espacio para cada tipo: si ya está ocupado, lo nuevo reemplaza a lo anterior, que va al descarte.',
      slots: [
        {
          title: 'Arma',
          stats: 'Poder y durabilidad',
          body: 'Suma su poder a tus ataques. Pierde 1 de durabilidad por cada ataque.',
        },
        {
          title: 'Armadura',
          stats: 'Valor de armadura y durabilidad',
          body: 'Reduce el daño que recibes. Pierde 1 de durabilidad por cada golpe recibido.',
        },
        {
          title: 'Trinket',
          stats: 'Condición, efecto y cargas',
          body: 'Se activa sola cuando se cumple su condición, si su efecto sirve en ese momento. Gasta 1 carga por activación.',
        },
      ],
    },
    instants: {
      title: 'Las instantáneas',
      body: 'Efectos de un solo uso: daño directo, curación, energía extra, robar cartas, reforzar tu próximo ataque, reparar tu equipo o dañar el del rival, obligarle a descartar y más.',
    },
    abilities: {
      title: 'Las habilidades de héroe',
      body: 'Cada héroe tiene una pasiva y dos habilidades activas. No son cartas: siempre están disponibles y solo las limita tu energía.',
      link: 'Conoce a los héroes',
    },
    timer: {
      title: 'Reloj de turno',
      body: 'En las partidas contra otros jugadores cada turno dura 90 segundos. Si se agota, el turno pasa solo, y tres turnos agotados seguidos cuentan como abandono. Si te rindes, gana tu rival. Las campañas no tienen reloj.',
    },
    end: {
      title: 'Fin del duelo',
      body: 'Gana quien deja la vida del héroe rival en 0. Si los dos héroes caen con la misma acción, pierde quien la jugó.',
    },
  },
  en: {
    meta: {
      title: 'How to play',
      description:
        'The rules of a Hero Duel CCG duel: energy, turns, attacks, equipment, hero abilities and the turn timer.',
    },
    title: 'How a duel works',
    lead: "The first to bring the enemy hero's life to 0 wins. Here are the rules, step by step.",
    setup: {
      title: 'Before the duel',
      items: [
        'Each player brings one hero and a 20-card deck, and draws 3 cards. Player 1 goes first.',
        "In matches against other players, whoever goes second receives the Challenger's Obol (a 0-cost card that grants 1 energy that turn) and starts with 2 extra life. That offsets the advantage of going first.",
      ],
    },
    turn: {
      title: 'Your turn',
      steps: [
        'Your maximum energy goes up by 1, to a cap of 10, and fully refills.',
        'You draw 1 card.',
        "You play cards and your hero's abilities in any order, as long as your energy lasts.",
        "You end your turn with a single action: attack, use your hero's heavy strike, or pass.",
      ],
    },
    energy: {
      title: 'Energy',
      rows: [
        { label: 'At the start of the duel', value: '0' },
        { label: 'At the start of each of your turns', value: '+1 maximum' },
        { label: 'Cap', value: '10' },
        { label: 'Refill', value: 'Full on each of your turns; unused energy does not carry over' },
      ],
    },
    attack: {
      title: 'The attack',
      steps: [
        "Damage = 1 (your fists: attacking never requires a weapon) + your weapon's power + any attack bonuses you have stacked.",
        "The defender's armor subtracts its value from that damage, down to a minimum of 0.",
        'The defender loses the remaining life.',
        'Your weapon loses 1 durability. At 0, it breaks.',
        "The defender's armor loses 1 durability per hit, even if it absorbed all of it. At 0, it breaks.",
        "Trinkets trigger: the defender's first, then the attacker's. A healing trinket can save its owner from a lethal blow: an ace up the sleeve.",
      ],
    },
    equipment: {
      title: 'Equipment',
      intro:
        'Equipping costs energy, like any card. There is one slot per type: if it is already taken, the new piece replaces the old one, which goes to the discard pile.',
      slots: [
        {
          title: 'Weapon',
          stats: 'Power and durability',
          body: 'Adds its power to your attacks. Loses 1 durability per attack.',
        },
        {
          title: 'Armor',
          stats: 'Armor value and durability',
          body: 'Reduces the damage you take. Loses 1 durability per hit taken.',
        },
        {
          title: 'Trinket',
          stats: 'Condition, effect and charges',
          body: 'Triggers on its own when its condition is met, if its effect is useful at that moment. Spends 1 charge per trigger.',
        },
      ],
    },
    instants: {
      title: 'Instants',
      body: "One-shot effects: direct damage, healing, extra energy, card draw, boosting your next attack, repairing your equipment or damaging the enemy's, forcing discards and more.",
    },
    abilities: {
      title: 'Hero abilities',
      body: 'Every hero has a passive and two active abilities. They are not cards: they are always available and only your energy limits them.',
      link: 'Meet the heroes',
    },
    timer: {
      title: 'Turn timer',
      body: 'In matches against other players each turn lasts 90 seconds. When time runs out the turn passes automatically, and three timed-out turns in a row count as abandoning the match. If you concede, your opponent wins. Campaigns have no timer.',
    },
    end: {
      title: 'End of the duel',
      body: "The first to bring the enemy hero's life to 0 wins. If both heroes fall to the same action, whoever played it loses.",
    },
  },
};
