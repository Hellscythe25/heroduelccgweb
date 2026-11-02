/**
 * Iconos de la interfaz del juego, copiados tal cual de
 * Assets/Scripts/UI/UIToolkit/VectorIcons.cs. El juego los dibuja como trazos
 * sobre una cuadrícula de 24 unidades (grosor 1.6, uniones y puntas redondas);
 * GameIcon.astro pinta los mismos puntos en SVG.
 *
 * Solo están los que usa la web. Si el juego cambia uno, se copia de nuevo:
 * ningún icono se dibuja aquí a mano.
 */
export type GameIconId = 'energy' | 'weapon' | 'armor' | 'trinket';

/** Cada trazo es una lista de puntos x, y. Si el último repite al primero, el trazo es cerrado. */
export const gameIcons: Record<GameIconId, number[][]> = {
  // Rayo.
  energy: [[14, 2, 5, 14, 11, 14, 10, 22, 20, 9, 13, 9, 14, 2]],
  // Espada en diagonal, guarda y empuñadura.
  weapon: [
    [9, 14, 17, 4, 21, 3, 20, 7, 10, 15],
    [6, 11, 13, 18],
    [8, 15, 3, 20, 4, 21, 9, 16],
    [3, 18, 6, 21],
  ],
  // Escudo con nervio central.
  armor: [
    [12, 3, 20, 6, 19, 14, 16, 18, 12, 21, 8, 18, 5, 14, 4, 6, 12, 3],
    [12, 7, 12, 17],
    [8, 10, 16, 10],
  ],
  // Cadena y colgante tallado.
  trinket: [
    [5, 3, 6, 7, 9, 10, 12, 11, 15, 10, 18, 7, 19, 3],
    [12, 11, 17, 16, 12, 21, 7, 16, 12, 11],
    [12, 14, 14, 16, 12, 18, 10, 16, 12, 14],
  ],
};

/** Iconos de los huecos de equipo, en el orden de howToPlayCopy.equipment.slots. */
export const equipmentIcons: GameIconId[] = ['weapon', 'armor', 'trinket'];
