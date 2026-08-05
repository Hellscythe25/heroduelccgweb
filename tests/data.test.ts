/**
 * Gate de datos del juego (`npm run data:validate`).
 *
 * Se ejecuta ANTES del typecheck y del build en CI: si el canon no valida, no
 * tiene sentido gastar minutos construyendo un sitio que no se va a desplegar.
 */
import { describe, expect, it } from 'vitest';
import cardsRaw from '~/data/cards.json';
import heroesRaw from '~/data/heroes.json';
import dataVersionRaw from '~/data/DATA_VERSION?raw';
import {
  CardsFileSchema,
  DataVersionSchema,
  HeroesFileSchema,
  checkGameDataConsistency,
} from '~/data/schemas';

describe('DATA_VERSION', () => {
  it('es SemVer del parche del juego', () => {
    expect(() => DataVersionSchema.parse(dataVersionRaw.trim())).not.toThrow();
  });
});

describe('cards.json', () => {
  it('valida contra el esquema', () => {
    const result = CardsFileSchema.safeParse(cardsRaw);
    expect(result.success ? null : JSON.stringify(result.error.issues, null, 2)).toBeNull();
  });
});

describe('heroes.json', () => {
  it('valida contra el esquema', () => {
    const result = HeroesFileSchema.safeParse(heroesRaw);
    expect(result.success ? null : JSON.stringify(result.error.issues, null, 2)).toBeNull();
  });
});

describe('coherencia entre archivos', () => {
  it('no tiene errores de consistencia', () => {
    const cardsFile = CardsFileSchema.parse(cardsRaw);
    const heroesFile = HeroesFileSchema.parse(heroesRaw);
    const version = DataVersionSchema.parse(dataVersionRaw.trim());

    const issues = checkGameDataConsistency(cardsFile, heroesFile, version);
    const errors = issues.filter((issue) => issue.severity === 'error');

    // Las advertencias (arte pendiente, por ejemplo) se reportan pero no bloquean.
    for (const warning of issues.filter((issue) => issue.severity === 'warning')) {
      console.warn(`  aviso [${warning.code}] ${warning.message}`);
    }

    expect(errors.map((issue) => `[${issue.code}] ${issue.message}`)).toEqual([]);
  });
});
