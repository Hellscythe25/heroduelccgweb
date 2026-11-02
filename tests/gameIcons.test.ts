import { describe, expect, it } from 'vitest';
import { equipmentIcons, gameIcons } from '~/gameIcons';
import { howToPlayCopy } from '~/i18n/pages/howToPlay';

describe('iconos del juego', () => {
  it('cada trazo son pares x, y dentro de la cuadrícula de 24 unidades', () => {
    for (const strokes of Object.values(gameIcons)) {
      for (const points of strokes) {
        expect(points.length % 2).toBe(0);
        expect(points.length).toBeGreaterThanOrEqual(4);
        for (const value of points) {
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(24);
        }
      }
    }
  });

  it('hay un icono por hueco de equipo en cada idioma', () => {
    for (const copy of Object.values(howToPlayCopy)) {
      expect(copy.equipment.slots).toHaveLength(equipmentIcons.length);
    }
  });
});
